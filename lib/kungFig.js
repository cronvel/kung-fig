/*
	Kung Fig

	Copyright (c) 2015 - 2021 Cédric Ronvel

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



const tree = require( 'tree-kit' ) ;
const path = require( 'path' ) ;
const os = require( 'os' ) ;
const fs = require( 'fs' ) ;

const glob = require( 'glob' ) ;
const includeGlobOptions = {
	dot: true ,
	nodir: true
} ;



const kungFig = {} ;
module.exports = kungFig ;



// Add async variants
Object.assign( kungFig , require( './kungFigAsync.js' ) ) ;

kungFig.parse = require( './kfgParse.js' ) ;
kungFig.stringify = require( './kfgStringify.js' ) ;
kungFig.kfgCommon = require( './kfgCommon.js' ) ;
kungFig.builtin = require( './builtin.js' ) ;
kungFig.merge = require( './merge.js' ) ;
kungFig.clone = require( './clone.js' ) ;
kungFig.OrderedObject = require( './OrderedObject.js' ) ;
kungFig.Dynamic = require( 'kung-fig-dynamic' ) ;
kungFig.Ref = require( 'kung-fig-ref' ) ;
kungFig.Expression = require( 'kung-fig-expression' ) ;
kungFig.statsModifiers = require( 'stats-modifiers' ) ;
const template = require( 'kung-fig-template' ) ;
kungFig.TemplateSentence = template.Sentence ;
kungFig.TemplateAtom = template.Atom ;
kungFig.Tag = require( './Tag.js' ) ;
kungFig.TagContainer = require( './TagContainer.js' ) ;
kungFig.Meta = require( './Meta.js' ) ;

kungFig.ClassicTag = require( './ClassicTag.js' ) ;
kungFig.LabelTag = require( './LabelTag.js' ) ;
kungFig.VarTag = require( './VarTag.js' ) ;
kungFig.ExpressionTag = require( './ExpressionTag.js' ) ;



kungFig.load = function( configPath_ , options ) {
	if ( ! configPath_ || typeof configPath_ !== 'string' ) {
		throw new Error( "kungFig.load(): first argument should be a path to the config to load" ) ;
	}

	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	kungFig._loadNormalizeOptions( options ) ;
	return kungFig._load( configPath_ , options ) ;
} ;



kungFig._loadNormalizeOptions = function( options ) {
	if ( ! options.fileObjectMap ) { options.fileObjectMap = new Map() ; }

	if ( ! options.cwd ) { options.cwd = process.cwd() + '/' ; }
	else if ( options.cwd[ options.cwd.length - 1 ] !== '/' ) { options.cwd += '/' ; }

	if ( typeof options.baseDir === 'string' ) { options.baseDir = [ options.baseDir ] ; }
	if ( Array.isArray( options.baseDir ) ) {
		options.baseDir = options.baseDir.map( e => {
			e = path.normalize( e ) ;
			if ( e[ e.length - 1 ] !== '/' ) { e += '/' ; }
			return e ;
		} ) ;
	}
} ;



// Only load meta
kungFig.loadMetaTags = function( configPath_ , options ) {
	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	kungFig._loadMetaTagsCommon( configPath_ , options ) ;

	try {
		kungFig.load( configPath_ , options ) ;
	}
	catch ( error ) {
		if ( error.metaTagsOnly ) { return error.metaTags ; }
		throw error ;
	}

	throw new Error( "metaTagsHook failed" ) ;
} ;



kungFig._loadMetaTagsCommon = function( configPath_ , options ) {
	var configFile , configExt ;

	configFile = path.basename( configPath_ ) ;
	configExt = path.extname( configPath_ ).slice( 1 )
		.toLowerCase() ;

	// This option force the KFG format for some extension and basename
	if ( options.kfgFiles ) {
		if ( options.kfgFiles.extname && options.kfgFiles.extname.indexOf( configExt ) !== -1 ) { configExt = 'kfg' ; }
		if ( options.kfgFiles.basename && options.kfgFiles.basename.indexOf( configFile ) !== -1 ) { configExt = 'kfg' ; }
	}

	if ( configExt !== 'kfg' ) {
		throw new Error( "Loading only meta is only supported by the KFG format. Load a .kfg or add use the 'kfgFiles' option if you have your own extension." ) ;
	}

	// This is really, really, really nasty, but it still works ^^
	options.metaTagsHook = metaTags => {
		var error = new Error( "Meta Tags only" ) ;
		error.metaTagsOnly = true ;
		error.metaTags = metaTags ;
		throw error ;
	} ;
} ;



kungFig._load = function( configPath_ , options , innerPath = null ) {
	var config , configPath , required , error , isStatic = false , isScalar = false , subOptions ;

	var paths = kungFig._paths( configPath_ , options ) ;

	isStatic = paths.configExt === 'js' ;

	if ( paths.recursiveParentSearch ) {
		configPath = kungFig._recursiveParentSearch( paths , options ) ;
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
		config = required = this.require( configPath , paths.configExt , options ) ;
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
		if ( ! subOptions.masterFile ) { subOptions.masterFile = configPath ; }

		this.linkIncludeRefs( required , subOptions ) ;
		kungFig.kfgCommon.Instance.constructAll( required , subOptions ) ;
		config = required.data ;

		// Add the config meta to the kungFig WeakMap
		if ( config && typeof config === 'object' ) {
			kungFig.meta.set( config , required.meta ) ;
		}

		// Clean meta before passing to userland
		required.meta.clean() ;
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

	return config ;
} ;



kungFig._paths = function( configPath_ , options ) {
	var paths = {
		configDir: '' ,
		configFile: '' ,
		configExt: '' ,
		recursiveParentSearch: false ,
		configDirFixedPart: ''
	} ;

	paths.configDir = path.dirname( configPath_ ) + '/' ;
	paths.configFile = path.basename( configPath_ ) ;
	paths.configExt = path.extname( configPath_ ).slice( 1 )
		.toLowerCase() ;

	// This option forces the KFG format for some extensions and basenames
	if ( options.kfgFiles ) {
		if ( options.kfgFiles.extname && options.kfgFiles.extname.indexOf( paths.configExt ) !== -1 ) { paths.configExt = 'kfg' ; }
		if ( options.kfgFiles.basename && options.kfgFiles.basename.indexOf( paths.configFile ) !== -1 ) { paths.configExt = 'kfg' ; }
	}


	paths.configDir = paths.configDir.replace( /^\{([^[\]]+)\}\// , ( match , moduleName ) => {
		if ( ! options.modulePath || ! options.modulePath[ moduleName ] ) {
			throw new Error( "Cannot load config file: undefined module path '" + moduleName + "'" ) ;
		}

		return options.modulePath[ moduleName ] + '/' ;
	} ) ;

	if ( paths.configDir.indexOf( '.../' ) !== -1 ) {
		[ paths.configDir , paths.configDirFixedPart ] = paths.configDir.split( '.../' ) ;
		paths.recursiveParentSearch = true ;
	}

	// Since we use require(), absolute path are mandatory
	switch ( paths.configDir.slice( 0 , 2 ) ) {
		case '' :
			// In case of recursive parent search, '.../path/to/file' produces '' as paths.configDir
			// Use it like ./
		case './' :
			paths.configDir = options.cwd + paths.configDir ;
			break ;
		case '..' :
			if ( paths.configDir[ 2 ] === '/' ) {
				paths.configDir = options.cwd + paths.configDir ;
			}
			break ;
		case '~/' :
			paths.configDir = os.homedir() + paths.configDir.slice( 1 ) ;
			break ;
		default :
			if ( ! path.isAbsolute( paths.configDir ) ) {
				paths.configDir = options.cwd + paths.configDir ;
			}
	}

	// Normalize the path, removing inner ../ ./ or multiple /
	paths.configDir = path.normalize( paths.configDir ) ;

	return paths ;
} ;



/*
	Sub-load dependencies, link includeRefs...
*/
kungFig.linkIncludeRefs = function( required , options ) {
	var includeRef , i ;

	// Should come before appendedIncludeRefs
	// Should be applied backward
	// Does not support population during the process
	for ( i = required.meta.prependedIncludeRefs.length - 1 ; i >= 0 ; i -- ) {
		includeRef = required.meta.prependedIncludeRefs[ i ] ;
		kungFig.linkOneIncludeRef( required , includeRef , options ) ;
	}

	// Support population during the very process
	for ( includeRef of required.meta.appendedIncludeRefs ) {
		kungFig.linkOneIncludeRef( required , includeRef , options ) ;
	}
} ;



kungFig.linkOneIncludeRef = function( required , includeRef , options ) {
	var subConfig , parent , key ;
	//console.log( "Linking includeRef:" , includeRef ) ;

	try {
		if ( includeRef.path ) {
			// IncludeRef to another file
			subConfig = kungFig.include( includeRef.path , options , includeRef.innerPath ) ;
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
		// Nothing to merge!
		if ( includeRef.merge ) { return ; }
	}

	if ( includeRef.parent ) {
		parent = kungFig.kfgCommon.getTarget( includeRef.parent ) ;
		key = includeRef.key ;

		if ( includeRef.follow ) {
			( { parent , key } = kungFig.kfgCommon.getIndirectTarget( parent[ key ] ) ) ;
		}

		//console.log( "\n\n>>> Replacing, path:" , includeRef.path , "key:" , key , "\nin parent:\n" , parent , "\nby:\n" , subConfig , "\n\n" ) ;
		if ( includeRef.merge ) {
			// if includeRef.parent[ includeRef.key ] is not an object, we need a return-value
			subConfig = kungFig.merge.mode( parent[ key ] , subConfig , includeRef.merge ) ;
		}

		parent[ key ] = subConfig ;
	}
	else {
		//console.log( "\n\n>>> Replacing root, path:" , includeRef.path , "\nby:\n" , subConfig , "\n\n" ) ;
		// If no parent, we are changing the root itself
		if ( includeRef.merge ) {
			subConfig = kungFig.merge.mode( required.data , subConfig , includeRef.merge ) ;
		}

		required.data = subConfig ;
	}
} ;



kungFig._recursiveParentSearch = function( paths , options ) {
	var configPath , oldConfigDir , error ;

	for( ;; ) {
		configPath = paths.configDir + paths.configDirFixedPart + paths.configFile ;

		if ( options.baseDir && ! options.baseDir.some( e => configPath.startsWith( e ) ) ) {
			throw new Error( 'Cannot load config file with recursive parent search (maybe restricted by baseDir option): ' + configPath ) ;
		}

		//console.log( '\n### Trying:' , configPath , "\n" ) ;

		if ( options.fileObjectMap.has( configPath ) ) {
			// Found in the cache, exit now!
			return configPath ;
		}

		try {
			fs.accessSync( configPath , fs.constants.R_OK ) ;
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
kungFig.include = function( configPath_ , options , innerPath = null ) {
	var config , pathArray , onePath , value ;

	// Set isInclude to true
	options.isInclude = true ;

	if ( ! glob.hasMagic( configPath_ , includeGlobOptions ) ) {
		return kungFig._load( configPath_ , options , innerPath ) ;
	}

	// This is a glob-based include! We will load a bunch of file at once!
	//console.log( configPath_ + ' as glob!' ) ;

	config = [] ;
	pathArray = glob.sync( configPath_ , Object.assign( {} , includeGlobOptions , { cwd: options.cwd } ) ) ;

	//console.log( 'glob matches:' , pathArray ) ;

	for ( onePath of pathArray ) {
		value = kungFig._load( onePath , options , innerPath ) ;
		if ( value !== undefined ) { config.push( value ) ; }
	}

	return config ;
} ;



kungFig.require = function( configPath , configExt , options ) {
	switch ( configExt ) {
		case 'js' :
			return require( configPath ) ;
		case 'json' :
			return this.requireJson( configPath ) ;
		case 'kfg' :
			return this.requireKfg( configPath , options ) ;
		//case 'txt' :
		default :
			return this.requireText( configPath ) ;
	}
} ;



kungFig.requireJson = function( configPath ) {
	var content ;

	try {
		content = fs.readFileSync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	content = JSON.parse( content ) ;

	return content ;
} ;



kungFig.requireKfg = function( configPath , options ) {
	var content ;

	try {
		content = fs.readFileSync( configPath , 'utf8' ) ;
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
		isInclude: options.isInclude ,
		delayConstruct: true
	} , true ) ;

	//console.log( content ) ;

	return content ;
} ;



kungFig.requireText = function( configPath ) {
	var content ;

	try {
		content = fs.readFileSync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	return content ;
} ;



// If path is given, it is saved into the specified file, else the string is simply returned
kungFig.saveJSON =
kungFig.saveJson = function( config , path_ , options = {} ) {
	var content , indent ;

	if ( ! options.noCircularPatch && config && typeof config === 'object' ) {
		config = this.patchCircularBreadthFirst( config ) ;
	}

	indent = options.indent !== undefined ? options.indent : 2 ;

	content = JSON.stringify( config , null , indent ) ;

	if ( path_ ) { fs.writeFileSync( path_ , content , options ) ; }

	return content ;
} ;

// Function save() is deprecated, but point to saveJson() for backward compatibility
kungFig.save = kungFig.saveJson ;



// If path is given, it is saved into the specified file, else the string is simply returned
kungFig.saveKFG =
kungFig.saveKfg = function( config , path_ , options = {} ) {
	var content ;

	if ( ! options.noCircularPatch && config && typeof config === 'object' ) {
		// Getting meta will fail because we create a new object,
		// we have to save the original object
		options.original = config ;
		config = this.patchCircularBreadthFirst( config ) ;
	}

	content = this.stringify( config , options ) ;

	if ( path_ ) { fs.writeFileSync( path_ , content , options ) ; }

	return content ;
} ;



kungFig.patchCircularBreadthFirst = function( config ) {
	var key , i , isArray , index ,
		objectStack , currentObject , patchedObjectStack , currentPatchedObject , pathStack , currentPath ;

	objectStack = [ config ] ;
	patchedObjectStack = [ Array.isArray( config ) ? [] : Object.create( Object.getPrototypeOf( config ) ) ] ;
	pathStack = [ '' ] ;

	for ( i = 0 ; i < objectStack.length ; i ++ ) {
		//console.log( '#' + i + '#' , objectStack[ i ] ) ;
		currentObject = objectStack[ i ] ;
		currentPatchedObject = patchedObjectStack[ i ] ;
		currentPath = pathStack[ i ] ;

		isArray = Array.isArray( currentObject ) ;

		for ( key in currentObject ) {
			if ( ! currentObject[ key ] || typeof currentObject[ key ] !== 'object' ) {
				currentPatchedObject[ key ] = currentObject[ key ] ;
			}
			else {
				index = objectStack.indexOf( currentObject[ key ] ) ;

				if ( index !== -1 ) {
					currentPatchedObject[ key ] = new kungFig.kfgCommon.OutputIncludeRef( null , pathStack[ index ] , true ) ;
				}
				else {
					let proto = Object.getPrototypeOf( currentObject[ key ] ) ;
					let builtinType = kungFig.builtin.prototypes.get( proto ) ;

					if ( builtinType?.opaque ) {
						currentPatchedObject[ key ] = currentObject[ key ] ;
					}
					else {
						currentPatchedObject[ key ] = Array.isArray( currentObject[ key ] ) ? [] : Object.create( proto ) ;

						// Stack
						objectStack.push( currentObject[ key ] ) ;
						patchedObjectStack.push( currentPatchedObject[ key ] ) ;
						//pathStack.push( currentPath ? currentPath + '.' + key : key ) ;
						pathStack.push( currentPath + ( isArray ? '[' + key + ']' : ( currentPath ? '.' : '' ) + key ) ) ;
					}
				}
			}
		}
	}

	return patchedObjectStack[ 0 ] ;
} ;



// 'Meta' are metadata related to a loaded config
kungFig.meta = new WeakMap() ;

kungFig.getMeta = function( config ) {
	if ( typeof config === 'object' ) { return kungFig.meta.get( config ) ; }
} ;

kungFig.setMeta = function( config , meta ) {
	if ( typeof config !== 'object' ) { return ; }

	if ( ! ( meta instanceof kungFig.Meta ) ) {
		meta = new kungFig.Meta( meta ) ;
	}

	kungFig.meta.set( config , meta ) ;
} ;

kungFig.copyMeta = function( from , to ) {
	try {
		kungFig.setMeta( to , kungFig.getMeta( from ) ) ;
	}
	catch ( error ) {
		// We do not care here, error are "normal" case...
	}
} ;

