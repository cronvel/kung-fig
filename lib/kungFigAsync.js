/*
	Kung Fig

	Copyright (c) 2015 - 2019 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



/*
	/!\ WARNING /!\
	This file contains async variant of kungFig.js methods.
	It's basically a copy/paste, with the 'async' and 'await' keyword here and there.
*/



const kungFig = require( './kungFig.js' ) ;
const tree = require( 'tree-kit' ) ;
const path = require( 'path' ) ;
//const os = require( 'os' ) ;

const Promise = require( 'seventh' ) ;

const glob = require( 'glob' ) ;
const includeGlobOptions = {
	dot: true ,
	nodir: true
} ;


const fs = require( 'fs' ) ;

// Add readFileAsync to the 'fs' module if needed
if ( ! fs.readFileAsync ) { fs.readFileAsync = Promise.promisify( fs.readFile ) ; }
if ( ! fs.accessAsync ) { fs.accessAsync = Promise.promisify( fs.access ) ; }
const globAsync = Promise.promisify( glob ) ;



kungFig.loadAsync = function( configPath_ , options ) {
	if ( ! configPath_ || typeof configPath_ !== 'string' ) {
		throw new Error( "kungFig.loadAsync(): first argument should be a path to the config to load" ) ;
	}

	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	kungFig._loadNormalizeOptions( options ) ;
	return kungFig._loadAsync( configPath_ , options ) ;
} ;



kungFig.loadMetaTagsAsync = function( configPath_ , options ) {
	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	kungFig._loadMetaTagsCommon( configPath_ , options ) ;

	return kungFig.loadAsync( configPath_ , options ).then(
		() => { throw new Error( "metaTagsHook failed" ) ; } ,
		error => {
			if ( error.metaTagsOnly ) { return error.metaTags ; }
			throw error ;
		}
	) ;
} ;



kungFig._loadAsync = async function( configPath_ , options , innerPath = null ) {
	var config , configPath , required , error , isStatic = false , isScalar = false , subOptions ;

	var paths = kungFig._paths( configPath_ , options ) ;

	isStatic = paths.configExt === 'js' ;

	if ( paths.recursiveParentSearch ) {
		configPath = await kungFig._recursiveParentSearchAsync( paths , options ) ;
	}
	else {
		configPath = paths.configDir + paths.configFile ;

		if ( options.baseDir && ! options.baseDir.some( e => configPath.startsWith( e ) ) ) {
			throw new Error( 'Cannot load config file, path denied by baseDir option: ' + configPath_ ) ;
		}
	}

	//console.log( '\n### Trying:' , configPath , "\n" ) ;

	// Search the cache
	if ( options.fileObjectMap.has( configPath ) ) {
		// Found in the cache, exit now!
		required = options.fileObjectMap.get( configPath ) ;
		config = required instanceof kungFig.kfgCommon.KFG ? required.data : required ;

		if ( innerPath ) { config = tree.path.get( config , innerPath ) ; }
		return config ;
	}

	try {
		config = required = await this.requireAsync( configPath , paths.configExt , options ) ;
	}
	catch ( error_ ) {
		if ( error_.metaTagsOnly ) { throw error_ ; }

		error = new Error( 'Cannot load config file: ' + configPath + ' (' + error_ + ')' ) ;
		error.from = error_ ;
		error.badContent = error_.code !== 'MODULE_NOT_FOUND' ;
		error.code = error_.code ;
		throw error ;
	}

	options.fileObjectMap.set( configPath , required ) ;

	if ( required instanceof kungFig.kfgCommon.KFG ) {
		subOptions = Object.create( options ) ;

		subOptions.cwd = paths.configDir ;
		subOptions.root = required.data ;
		subOptions.reduce = false ;
		if ( ! subOptions.masterFile ) { subOptions.masterFile = configPath ; }

		await this.linkIncludeRefsAsync( required , subOptions ) ;
		config = required.data ;

		// Add the config meta to the kungFig WeakMap
		if ( config && typeof config === 'object' ) {
			kungFig.meta.set( config , required.meta ) ;
		}
	}

	// Check if this is a scalar, if so it's also a static
	if ( ! config || typeof config !== 'object' ) {
		isStatic = true ;
		isScalar = true ;
	}

	if ( innerPath ) {
		if ( isScalar ) { config = undefined ; }
		else { config = tree.path.get( config , innerPath ) ; }
	}

	if ( ! isStatic && options.reduce ) {
		config = this.autoReduce( config ) ;
	}

	return config ;
} ;



kungFig.linkIncludeRefsAsync = async function( required , options ) {
	var includeRef , i ;

	// Should come before appendedIncludeRefs
	// Should be applied backward
	// Do not support population during the process
	for ( i = required.meta.prependedIncludeRefs.length - 1 ; i >= 0 ; i -- ) {
		includeRef = required.meta.prependedIncludeRefs[ i ] ;
		await kungFig.linkOneIncludeRefAsync( required , includeRef , options ) ;
	}

	// Support population during the very process
	for ( includeRef of required.meta.appendedIncludeRefs ) {
		await kungFig.linkOneIncludeRefAsync( required , includeRef , options ) ;
	}
} ;



kungFig.linkOneIncludeRefAsync = async function( required , includeRef , options ) {
	var subConfig , parent , key , count ;

	//console.log( "Linking includeRef: " , includeRef ) ;

	try {
		if ( includeRef.path ) {
			// IncludeRef to another file
			subConfig = await kungFig.include( includeRef.path , options , includeRef.innerPath ) ;
		}
		else if ( includeRef.innerPath ) {
			// IncludeRef to the current file
			subConfig = tree.path.get( required.data , includeRef.innerPath ) ;
		}
		else {
			// IncludeRef to the root of the current file
			subConfig = required.data ;
		}
	}
	catch ( error ) {
		if ( includeRef.required || error.badContent ) { throw error ; }
		subConfig = null ;
	}

	if ( includeRef.parent ) {
		parent = kungFig.kfgCommon.getTarget( includeRef.parent ) ;
		key = includeRef.key ;

		if ( includeRef.follow ) {
			( { parent , key } = kungFig.kfgCommon.getIndirectTarget( parent[ key ] ) ) ;
		}

		if ( includeRef.merge ) {
			// if includeRef.parent[ includeRef.key ] is not an object, we need a return-value
			subConfig = kungFig.merge.mode( parent[ key ] , subConfig , includeRef.merge ) ;
		}

		parent[ key ] = subConfig ;

		// We have some Array element repetition here...
		if ( includeRef.repeat && Array.isArray( parent ) && typeof key === 'number' ) {
			for ( count = includeRef.repeat ; count ; count -- ) {
				parent[ -- key ] = subConfig ;
			}
		}
	}
	else {
		// If no parent, we are changing the root itself
		if ( includeRef.merge ) {
			subConfig = kungFig.merge.mode( required.data , subConfig , includeRef.merge ) ;
		}

		required.data = subConfig ;
	}
} ;



kungFig._recursiveParentSearchAsync = async function( paths , options ) {
	var configPath , oldConfigDir , error ;

	for( ;; ) {
		configPath = paths.configDir + paths.configDirFixedPart + paths.configFile ;

		if ( options.baseDir && ! options.baseDir.some( e => configPath.startsWith( e ) ) ) {
			throw new Error( 'Cannot load config file with recursive parent search (maybe restricted by baseDir option): ' + configPath ) ;
		}

		//console.log( '\n### Trying:' , configPath , "\n" ) ;

		if ( options.fileObjectMap[ configPath ] ) {
			// Found in the cache, exit now!
			return configPath ;
		}

		try {
			await fs.accessAsync( configPath , fs.constants.R_OK ) ;
			return configPath ;
		}
		catch ( error_ ) {
			oldConfigDir = paths.configDir ;
			paths.configDir = path.dirname( paths.configDir ) + '/' ;

			if ( paths.configDir === oldConfigDir ) {
				error = new Error( 'Cannot load config file with recursive parent search: ' + configPath ) ;
				error.from = error_ ;
				error.badContent = false ;
				throw error ;
			}
		}
	}
} ;



// It checks if the path has glob.
// If not, it just call kungFig._load().
// If it has glob, then it resolves the glob and return and array of config, calling kungFig._load() for each path.
kungFig.includeAsync = async function( configPath_ , options , innerPath = null ) {
	var config , pathArray , onePath , value ;

	// Set isInclude to true
	options.isInclude = true ;

	if ( ! glob.hasMagic( configPath_ , includeGlobOptions ) ) {
		return kungFig._loadAsync( configPath_ , options , innerPath ) ;
	}

	// This is a glob-based include! We will load a bunch of file at once!
	//console.log( configPath_ + ' as glob!' ) ;

	config = [] ;
	pathArray = await globAsync( configPath_ , Object.assign( {} , includeGlobOptions , { cwd: options.cwd } ) ) ;

	//console.log( 'glob matches:' , pathArray ) ;

	// So it loads in series
	for ( onePath of pathArray ) {
		value = await kungFig._loadAsync( onePath , options , innerPath ) ;
		if ( value !== undefined ) { config.push( value ) ; }
	}

	return config ;
} ;



kungFig.requireAsync = async function( configPath , configExt , options ) {
	switch ( configExt ) {
		case 'js' :
			return this.requireJsAsync( configPath ) ;
		case 'json' :
			return this.requireJsonAsync( configPath ) ;
		case 'kfg' :
			return this.requireKfgAsync( configPath , options ) ;
		//case 'txt' :
		default :
			return this.requireTextAsync( configPath ) ;
	}
} ;



kungFig.requireJsAsync = function( configPath ) {
	// AFAIK there is no way to load JS asynchronously, so just let the event loop breathe before doing so
	return Promise.resolveTimeout( 0 , require( configPath ) ) ;
} ;



kungFig.requireJsonAsync = async function( configPath ) {
	var content ;

	try {
		content = await fs.readFileAsync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	content = JSON.parse( content ) ;

	return content ;
} ;



kungFig.requireKfgAsync = async function( configPath , options ) {
	var content ;

	//console.log( "require KFG options:" , options ) ;

	try {
		content = await fs.readFileAsync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	content = this.parse( content , {
		file: configPath ,
		masterFile: options.masterFile ,
		classes: options.classes ,
		doctype: options.doctype ,
		tags: options.tags ,
		metaTags: options.metaTags ,
		operators: options.operators ,
		metaTagsHook: options.metaTagsHook ,
		isInclude: options.isInclude
	} , true ) ;

	//console.log( content ) ;

	return content ;
} ;



kungFig.requireTextAsync = async function( configPath ) {
	var content ;

	try {
		content = await fs.readFileAsync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	return content ;
} ;

