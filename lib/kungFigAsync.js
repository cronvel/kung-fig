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



// Load modules
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



kungFig.loadAsync = function loadAsync( configPath_ , options ) {
	if ( ! configPath_ || typeof configPath_ !== 'string' ) {
		throw new Error( "kungFig.load(): first argument should be a path to the config to load" ) ;
	}

	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	kungFig._loadNormalizeOptions( options ) ;
	return Promise.resolve( kungFig._loadAsync( configPath_ , options ) ) ;
} ;



kungFig.loadMetaTagsAsync = function loadMetaTagsAsync( configPath_ , options ) {
	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	kungFig._loadMetaTagsCommon( configPath_ , options ) ;

	return Promise.resolve( kungFig.loadAsync( configPath_ , options ) ).then(
		() => { throw new Error( "metaTagsHook failed" ) ; } ,
		error => {
			if ( error.metaTagsOnly ) { return error.metaTags ; }
			throw error ;
		}
	) ;
} ;



kungFig._loadAsync = async function _loadAsync( configPath_ , options ) {
	var config , configPath , required , error , isStatic = false , isScalar = false ;

	var paths = kungFig._paths( configPath_ , options ) ;

	isStatic = paths.configExt === 'js' ;

	if ( paths.recursiveParentSearch ) {
		configPath = await kungFig._recursiveParentSearchAsync( paths , options ) ;
	}
	else {
		configPath = paths.configDir + paths.configFile ;

		if ( options.baseDir && ! options.baseDir.some( e => configPath.startsWith( e ) ) )	{
			throw new Error( 'Cannot load config file, path denied by baseDir option: ' + configPath_ ) ;
		}
	}

	//console.log( '\n### Trying:' , configPath , "\n" ) ;

	// Search the cache
	if ( options.fileObjectMap[ configPath ] ) {
		// Found in the cache, exit now!
		config = options.fileObjectMap[ configPath ] ;
		if ( paths.innerPath ) { config = tree.path.get( config , paths.innerPath ) ; }
		return config ;
	}

	try {
		required = await this.requireAsync( configPath , paths.configExt , options ) ;
	}
	catch ( error_ ) {
		if ( error_.metaTagsOnly ) { throw error_ ; }

		error = new Error( 'Cannot load config file: ' + configPath + ' (' + error_ + ')' ) ;
		error.from = error_ ;
		error.badContent = error_.code !== 'MODULE_NOT_FOUND' ;
		error.code = error_.code ;
		throw error ;
	}

	// Check if this is a scalar, if so it's also a static
	if ( ! required || typeof required !== 'object' ) {
		isStatic = true ;
		isScalar = true ;
	}

	if ( isStatic ) {
		config = required ;
	}
	else {
		// Extend it, it should not modify the original cached file
		options.fileObjectMap[ configPath ] =
			config =
			tree.extend(
				{
					depth: true , own: true , proto: true , descriptor: true
				} ,
				Array.isArray( required ) ? [] : {} ,
				required
			) ;

		// The entire file should be expanded first, even if only a small sub-part will be used
		if ( config && typeof config === 'object' ) {
			config = await this.expandAsync( config , {
				cwd: paths.configDir ,
				root: config ,
				masterFile: options.masterFile || configPath ,
				fileObjectMap: options.fileObjectMap ,
				doctype: options.doctype ,
				classes: options.classes ,
				tags: options.tags ,
				metaTags: options.metaTags ,
				operators: options.operators ,
				metaTagsHook: options.metaTagsHook ,
				modulePath: options.modulePath ,
				baseDir: options.baseDir
			} ) ;
		}

		// Copy meta, from the required file to the cloned config
		kungFig.copyMeta( required , config ) ;
	}

	if ( paths.innerPath ) {
		if ( isScalar ) { config = undefined ; }
		else { config = tree.path.get( config , paths.innerPath ) ; }
	}

	if ( ! isStatic && options.reduce ) {
		config = this.autoReduce( config ) ;
	}

	return config ;
} ;



kungFig._recursiveParentSearchAsync = async function _recursiveParentSearchAsync( paths , options ) {
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



/*
    This method find all key starting with '@' or '@@' and replace its value, recursively,
    with a required .json, .js or .kfg file.
*/
kungFig.expandAsync = async function expandAsync( config , options ) {
	var i , iMax , keys , key , baseKey , expandable , optional , indexOf ,
		inner , innerParent , innerParentKey , writable ;

	innerParent = inner = config ;

	if ( config instanceof kungFig.Tag ) {
		if ( config.content instanceof kungFig.TagContainer ) {
			innerParent = config.content ;
			innerParentKey = 'children' ;
			inner = config.content.children ;
		}
		else {
			innerParentKey = 'content' ;
			inner = config.content ;
		}
	}
	else if ( config instanceof kungFig.TagContainer ) {
		innerParentKey = 'children' ;
		inner = config.children ;
	}

	if ( ! inner || typeof inner !== 'object' ) { return config ; }


	// First iterate over arrays
	if ( Array.isArray( inner ) ) {
		iMax = inner.length ;

		for ( i = 0 ; i < iMax ; i ++ ) {
			if ( inner[ i ] && typeof inner[ i ] === 'object' ) {
				inner[ i ] = await this.expandAsync( inner[ i ] , options ) ;
			}
		}

		return config ;
	}


	keys = Object.keys( inner ) ;
	iMax = keys.length ;

	for ( i = 0 ; i < iMax ; i ++ ) {
		key = keys[ i ] ;
		expandable = false ;


		// Check if the current key contains an import command
		if ( key[ 0 ] === '@' ) {
			if ( key[ 1 ] === '@' ) {
				expandable = true ;
				baseKey = key.slice( 2 ) ;
				optional = false ;
			}
			else {
				expandable = true ;
				baseKey = key.slice( 1 ) ;
				optional = true ;
			}
		}

		if ( expandable ) {
			if ( inner[ key ] === '' || inner[ key ] === '#' ) {
				// So this is a local reference to the current root
				if ( baseKey ) {
					inner[ baseKey ] = options.root ;
				}
				else if ( inner !== config ) {
					innerParent[ innerParentKey ] = inner = options.root ;
				}
				else {
					config = innerParent = inner = options.root ;
				}
			}
			else if ( inner[ key ][ 0 ] === '#' ) {
				// So this is a local reference
				if ( baseKey ) {
					inner[ baseKey ] = tree.path.get( options.root , inner[ key ].slice( 1 ) ) ;
				}
				else if ( inner !== config ) {
					innerParent[ innerParentKey ] = inner = tree.path.get( options.root , inner[ key ].slice( 1 ) ) ;
				}
				else {
					config = innerParent = inner = tree.path.get( options.root , inner[ key ].slice( 1 ) ) ;
				}
			}
			else if ( baseKey ) {
				try {
					inner[ baseKey ] = await this.includeAsync( inner[ key ] , {
						cwd: options.cwd ,
						kfgFiles: options.kfgFiles ,
						fileObjectMap: options.fileObjectMap ,
						masterFile: options.masterFile ,
						doctype: options.doctype ,
						classes: options.classes ,
						tags: options.tags ,
						metaTags: options.metaTags ,
						operators: options.operators ,
						metaTagsHook: options.metaTagsHook ,
						modulePath: options.modulePath ,
						baseDir: options.baseDir
					} ) ;
				}
				catch ( error ) {
					//if ( ! optional ) { throw error ; }
					if ( ! optional || error.badContent ) { throw error ; }

					// The missing file is replaced by {} (empty object), except if an innerPath was defined
					indexOf = inner[ key ].indexOf( '#' ) ;
					inner[ baseKey ] = indexOf === -1 || indexOf === inner[ key ].length - 1 ? {} : undefined ;
				}
			}
			else {
				try {
					if ( config !== inner ) {
						innerParent[ innerParentKey ] = inner = await this.includeAsync( inner[ key ] , {
							cwd: options.cwd ,
							kfgFiles: options.kfgFiles ,
							fileObjectMap: options.fileObjectMap ,
							masterFile: options.masterFile ,
							doctype: options.doctype ,
							classes: options.classes ,
							tags: options.tags ,
							metaTags: options.metaTags ,
							operators: options.operators ,
							metaTagsHook: options.metaTagsHook ,
							modulePath: options.modulePath ,
							baseDir: options.baseDir
						} ) ;
					}
					else {
						config = innerParent = inner = await this.includeAsync( inner[ key ] , {
							cwd: options.cwd ,
							kfgFiles: options.kfgFiles ,
							fileObjectMap: options.fileObjectMap ,
							masterFile: options.masterFile ,
							doctype: options.doctype ,
							classes: options.classes ,
							tags: options.tags ,
							metaTags: options.metaTags ,
							operators: options.operators ,
							metaTagsHook: options.metaTagsHook ,
							modulePath: options.modulePath ,
							baseDir: options.baseDir
						} ) ;
					}
				}
				catch ( error ) {
					//if ( ! optional ) { throw error ; }
					if ( ! optional || error.badContent ) { throw error ; }
					// Nothing to do...
				}
			}

			delete inner[ key ] ;
			if ( ! baseKey ) { break ; }
		}
		else if ( inner[ key ] && typeof inner[ key ] === 'object' ) {
			writable = Object.getOwnPropertyDescriptor( inner , key ).writable ;

			//try {
			if ( writable ) {
				inner[ key ] = await this.expandAsync( inner[ key ] , {
					cwd: options.cwd ,
					kfgFiles: options.kfgFiles ,
					root: options.root ,
					masterFile: options.masterFile ,
					fileObjectMap: options.fileObjectMap ,
					doctype: options.doctype ,
					classes: options.classes ,
					tags: options.tags ,
					metaTags: options.metaTags ,
					operators: options.operators ,
					metaTagsHook: options.metaTagsHook ,
					modulePath: options.modulePath ,
					baseDir: options.baseDir
				} ) ;
			}
			else {
				await this.expandAsync( inner[ key ] , {
					cwd: options.cwd ,
					kfgFiles: options.kfgFiles ,
					root: options.root ,
					masterFile: options.masterFile ,
					fileObjectMap: options.fileObjectMap ,
					doctype: options.doctype ,
					classes: options.classes ,
					tags: options.tags ,
					metaTags: options.metaTags ,
					operators: options.operators ,
					metaTagsHook: options.metaTagsHook ,
					modulePath: options.modulePath ,
					baseDir: options.baseDir
				} ) ;
			}
			//} catch ( error ) { console.log( ">>> Throw...\n" + require('string-kit').inspect( {style:'color',depth:10},inner ) ) ; throw error ; }
		}
	}

	return config ;
} ;



// It checks if the path has glob.
// If not, it just call kungFig._load().
// If it has glob, then it resolves the glob and return and array of config, calling kungFig._load() for each path.
kungFig.includeAsync = async function includeAsync( configPath_ , options ) {
	var config , pathArray ,
		splittedPath = configPath_.split( '#' ) ;

	// Set isInclude to true
	options.isInclude = true ;

	if ( ! glob.hasMagic( splittedPath[ 0 ] , includeGlobOptions ) ) {
		return kungFig._loadAsync( configPath_ , options ) ;
	}

	// This is a glob-based include! We will load a bunch of file at once!
	//console.log( configPath_ + ' as glob!' ) ;

	config = [] ;
	pathArray = await globAsync( splittedPath[ 0 ] , tree.extend( null , {} , includeGlobOptions , { cwd: options.cwd } ) ) ;

	//console.log( 'glob matches:' , pathArray ) ;

	pathArray.forEach( async( onePath ) => {
		if ( splittedPath[ 1 ] ) { onePath += '#' + splittedPath[ 1 ] ; }
		//console.log( 'one path:' , onePath ) ;
		config.push( await kungFig._loadAsync( onePath , options ) ) ;
	} ) ;

	return config ;
} ;



kungFig.requireAsync = async function requireAsync( configPath , configExt , options ) {
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



kungFig.requireJsAsync = function requireJsAsync( configPath ) {
	// AFAIK there is no way to load JS asynchronously, so just let the event loop breathe before doing so
	return Promise.resolveTimeout( 0 , require( configPath ) ) ;
} ;



kungFig.requireJsonAsync = async function requireJsonAsync( configPath ) {
	var content ;

	if ( configPath in this.cache ) { return this.cache[ configPath ] ; }

	try {
		content = await fs.readFileAsync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	content = JSON.parse( content ) ;

	this.cache[ configPath ] = content ;

	return content ;
} ;



kungFig.requireKfgAsync = async function requireKfgAsync( configPath , options ) {
	var content ;

	//console.log( "require KFG options:" , options ) ;

	if ( ! options.noKfgCache ) {
		content = this.requireKfgCache( configPath , options ) ;
		if ( content ) { return content ; }
	}

	try {
		content = await fs.readFileAsync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	return this.requireKfgParse( content , configPath , options ) ;
} ;



kungFig.requireTextAsync = async function requireTextAsync( configPath ) {
	var content ;

	if ( configPath in this.cache ) { return this.cache[ configPath ] ; }

	try {
		content = await fs.readFileAsync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	this.cache[ configPath ] = content ;

	return content ;
} ;

