/*
	Kung Fig

	Copyright (c) 2015 - 2017 Cédric Ronvel

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



// Load modules
var tree = require( 'tree-kit' ) ;
var path = require( 'path' ) ;
var os = require( 'os' ) ;
var fs = require( 'fs' ) ;

var glob = require( 'glob' ) ;
var includeGlobOptions = {
	dot: true ,
	nodir: true
} ;



var kungFig = {} ;
module.exports = kungFig ;



// Add async variants
Object.assign( kungFig , require( './kungFigAsync.js' ) ) ;

kungFig.parse = require( './kfgParse.js' ) ;
kungFig.stringify = require( './kfgStringify.js' ) ;
kungFig.kfgCommon = require( './kfgCommon.js' ) ;
kungFig.OrderedObject = require( './OrderedObject.js' ) ;
kungFig.Dynamic = require( './Dynamic.js' ) ;
kungFig.Ref = require( './Ref.js' ) ;
kungFig.Template = require( './Template.js' ) ;
kungFig.TemplateElement = require( './TemplateElement.js' ) ;
kungFig.Expression = require( './Expression.js' ) ;
kungFig.Tag = require( './Tag.js' ) ;
kungFig.TagContainer = require( './TagContainer.js' ) ;

kungFig.ClassicTag = require( './ClassicTag.js' ) ;
kungFig.LabelTag = require( './LabelTag.js' ) ;
kungFig.VarTag = require( './VarTag.js' ) ;
kungFig.ExpressionTag = require( './ExpressionTag.js' ) ;



// Extend with the tree-ops part
Object.assign( kungFig , require( './treeOps.js' ) ) ;



kungFig.load = function load( configPath_ , options ) {
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	kungFig._loadNormalizeOptions( options ) ;
	return kungFig._load( configPath_ , options ) ;
} ;



kungFig._loadNormalizeOptions = function _loadNormalizeOptions( options ) {
	if ( ! options.fileObjectMap ) { options.fileObjectMap = {} ; }

	if ( ! options.cwd ) { options.cwd = process.cwd() + '/' ; }
	else if ( options.cwd[ options.cwd.length - 1 ] !== '/' ) { options.cwd += '/' ; }

	if ( options.reduce === undefined ) { options.reduce = true ; }

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
kungFig.loadMeta = function loadMeta( configPath_ , options ) {
	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	kungFig._loadMetaCommon( configPath_ , options ) ;

	try {
		kungFig.load( configPath_ , options ) ;
	}
	catch ( error ) {
		if ( error.metaOnly ) { return error.meta ; }
		throw error ;
	}

	throw new Error( "metaHook failed" ) ;
} ;



kungFig._loadMetaCommon = function _loadMetaCommon( configPath_ , options ) {
	var configFile , configExt ;

	configFile = path.basename( configPath_ ) ;
	configExt = path.extname( configPath_ ).slice( 1 ).toLowerCase() ;

	// This option force the KFG format for some extension and basename
	if ( options.kfgFiles ) {
		if ( options.kfgFiles.extname && options.kfgFiles.extname.indexOf( configExt ) !== -1 ) { configExt = 'kfg' ; }
		if ( options.kfgFiles.basename && options.kfgFiles.basename.indexOf( configFile ) !== -1 ) { configExt = 'kfg' ; }
	}

	if ( configExt !== 'kfg' ) {
		throw new Error( "Loading only meta is only supported by the KFG format. Load a .kfg or add use the 'kfgFiles' option if you have your own extension." ) ;
	}

	// This is really, really, really nasty, but it still works ^^
	options.metaHook = meta => {
		var error = new Error( "Meta only" ) ;
		error.metaOnly = true ;
		error.meta = meta ;
		throw error ;
	} ;
} ;



kungFig._load = function _load( configPath_ , options ) {
	var config , configPath , required , error , isStatic = false , isScalar = false ;

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
	if ( options.fileObjectMap[ configPath ] ) {
		// Found in the cache, exit now!
		config = options.fileObjectMap[ configPath ] ;
		if ( paths.innerPath ) { config = tree.path.get( config , paths.innerPath ) ; }
		return config ;
	}

	try {
		required = this.require( configPath , paths.configExt , options ) ;
	}
	catch ( error_ ) {
		if ( error_.metaOnly ) { throw error_ ; }

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
			config = this.expand( config , {
				cwd: paths.configDir ,
				root: config ,
				masterFile: options.masterFile || configPath ,
				fileObjectMap: options.fileObjectMap ,
				doctype: options.doctype ,
				classes: options.classes ,
				tags: options.tags ,
				metaTags: options.metaTags ,
				operators: options.operators ,
				metaHook: options.metaHook ,
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



kungFig._paths = function _paths( configPath_ , options ) {
	var tmp ;

	var paths = {
		configDir: '' ,
		configFile: '' ,
		configExt: '' ,
		innerPath: '' ,
		recursiveParentSearch: false ,
		configDirFixedPart: ''
	} ;

	tmp = configPath_.split( '#' ) ;
	paths.configDir = path.dirname( tmp[ 0 ] ) + '/' ;
	paths.configFile = path.basename( tmp[ 0 ] ) ;
	paths.configExt = path.extname( tmp[ 0 ] ).slice( 1 ).toLowerCase() ;
	paths.innerPath = tmp[ 1 ] ;

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
		tmp = paths.configDir.split( '.../' ) ;
		paths.configDir = tmp[ 0 ] ;
		paths.configDirFixedPart = tmp[ 1 ] ;
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



kungFig._recursiveParentSearch = function _recursiveParentSearch( paths , options ) {
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



/*
	This method find all key starting with '@' or '@@' and replace its value, recursively,
	with a required .json, .js or .kfg file.
*/
kungFig.expand = function expand( config , options ) {
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
				inner[ i ] = this.expand( inner[ i ] , options ) ;
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
					inner[ baseKey ] = this.include( inner[ key ] , {
						cwd: options.cwd ,
						kfgFiles: options.kfgFiles ,
						fileObjectMap: options.fileObjectMap ,
						masterFile: options.masterFile ,
						doctype: options.doctype ,
						classes: options.classes ,
						tags: options.tags ,
						metaTags: options.metaTags ,
						operators: options.operators ,
						metaHook: options.metaHook ,
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
						innerParent[ innerParentKey ] = inner = this.include( inner[ key ] , {
							cwd: options.cwd ,
							kfgFiles: options.kfgFiles ,
							fileObjectMap: options.fileObjectMap ,
							masterFile: options.masterFile ,
							doctype: options.doctype ,
							classes: options.classes ,
							tags: options.tags ,
							metaTags: options.metaTags ,
							operators: options.operators ,
							metaHook: options.metaHook ,
							modulePath: options.modulePath ,
							baseDir: options.baseDir
						} ) ;
					}
					else {
						config = innerParent = inner = this.include( inner[ key ] , {
							cwd: options.cwd ,
							kfgFiles: options.kfgFiles ,
							fileObjectMap: options.fileObjectMap ,
							masterFile: options.masterFile ,
							doctype: options.doctype ,
							classes: options.classes ,
							tags: options.tags ,
							metaTags: options.metaTags ,
							operators: options.operators ,
							metaHook: options.metaHook ,
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
				inner[ key ] = this.expand( inner[ key ] , {
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
					metaHook: options.metaHook ,
					modulePath: options.modulePath ,
					baseDir: options.baseDir
				} ) ;
			}
			else {
				this.expand( inner[ key ] , {
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
					metaHook: options.metaHook ,
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
kungFig.include = function include( configPath_ , options ) {
	var config , pathArray ,
		splittedPath = configPath_.split( '#' ) ;

	// Set isInclude to true
	options.isInclude = true ;

	if ( ! glob.hasMagic( splittedPath[ 0 ] , includeGlobOptions ) ) {
		return kungFig._load( configPath_ , options ) ;
	}

	// This is a glob-based include! We will load a bunch of file at once!
	//console.log( configPath_ + ' as glob!' ) ;

	config = [] ;
	pathArray = glob.sync( splittedPath[ 0 ] , tree.extend( null , {} , includeGlobOptions , { cwd: options.cwd } ) ) ;

	//console.log( 'glob matches:' , pathArray ) ;

	pathArray.forEach( ( onePath ) => {
		if ( splittedPath[ 1 ] ) { onePath += '#' + splittedPath[ 1 ] ; }
		//console.log( 'one path:' , onePath ) ;
		config.push( kungFig._load( onePath , options ) ) ;
	} ) ;

	return config ;
} ;



// If path is given, it is saved into the specified file, else the string is simply returned
kungFig.saveJson = function saveJson( config , path_ , options ) {
	var content , indent ;

	if ( config && typeof config === 'object' ) {
		config = this.patchCircularBreadthFirst( config ) ;
	}

	indent = options && ( 'indent' in options ) ? options.indent : 2 ;

	content = JSON.stringify( config , null , indent ) ;

	if ( path_ ) { fs.writeFileSync( path_ , content , options ) ; }

	return content ;
} ;

// Function save() is deprecated, but point to saveJson() for backward compatibility
kungFig.save = kungFig.saveJson ;



// If path is given, it is saved into the specified file, else the string is simply returned
kungFig.saveKfg = function saveKfg( config , path_ , options ) {
	var content ;

	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( config && typeof config === 'object' ) {
		// Getting meta will fail because we create a new object,
		// we have to save the original object
		options.original = config ;
		config = this.patchCircularBreadthFirst( config ) ;
	}

	content = this.stringify( config , options ) ;

	if ( path_ ) { fs.writeFileSync( path_ , content , options ) ; }

	return content ;
} ;



kungFig.patchCircularBreadthFirst = function patchCircularBreadthFirst( config ) {
	var key , i , isArray , index ,
		objectStack , currentObject , patchedObjectStack , currentPatchedObject , pathStack , currentPath ;

	objectStack = [ config ] ;
	patchedObjectStack = [ Array.isArray( config ) ? [] : {} ] ;
	pathStack = [ '' ] ;

	for ( i = 0 ; i < objectStack.length ; i ++ ) {
		//console.log( '#' + i + '#' , objectStack[ i ] ) ;
		currentObject = objectStack[ i ] ;
		currentPatchedObject = patchedObjectStack[ i ] ;
		currentPath = pathStack[ i ] ;

		isArray = Array.isArray( currentObject ) ;

		for ( key in currentObject ) {
			if ( currentObject[ key ] && typeof currentObject[ key ] === 'object' ) {
				index = objectStack.indexOf( currentObject[ key ] ) ;

				if ( index !== -1 ) {
					if ( Array.isArray( currentPatchedObject ) ) {
						currentPatchedObject[ key ] = { '@@': '#' + pathStack[ index ] } ;
					}
					else {
						currentPatchedObject[ '@@' + key ] = '#' + pathStack[ index ] ;
					}
				}
				else {
					currentPatchedObject[ key ] = Array.isArray( currentObject[ key ] ) ? [] : {} ;

					// Stack
					objectStack.push( currentObject[ key ] ) ;
					patchedObjectStack.push( currentPatchedObject[ key ] ) ;
					//pathStack.push( currentPath ? currentPath + '.' + key : key ) ;
					pathStack.push( currentPath + ( isArray ? '[' + key + ']' : ( currentPath ? '.' : '' ) + key ) ) ;
				}
			}
			else {
				currentPatchedObject[ key ] = currentObject[ key ] ;
			}
		}
	}

	return patchedObjectStack[ 0 ] ;
} ;



kungFig.require = function require_( configPath , configExt , options ) {
	switch ( configExt ) {
		case 'js' :
		case 'json' :
			return require( configPath ) ;
		case 'kfg' :
			return this.requireKfg( configPath , options ) ;
		//case 'txt' :
		default :
			return this.requireText( configPath ) ;
	}
} ;



kungFig.requireKfg = function requireKfg( configPath , options ) {
	var content ;

	//console.log( "require KFG options:" , options ) ;

	if ( ! options.noKfgCache ) {
		content = this.requireKfgCache( configPath , options ) ;
		if ( content ) { return content ; }
	}

	try {
		content = fs.readFileSync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	return this.requireKfgParse( content , configPath , options ) ;
} ;



kungFig.requireKfgCache = function requireKfgCache( configPath , options ) {
	var cached ;

	if ( configPath in this.cache ) {
		cached = this.cache[ configPath ] ;

		if ( typeof options.metaHook === 'function' ) {
			if ( typeof cached === 'object' && kungFig.meta.has( cached ) ) {
				options.metaHook( kungFig.meta.get( cached ) , null ) ;
				return cached ;
			}

			// Something was wrong, we need to reload the file
			//console.error( "----------" , cached , kungFig.meta.has( cached ) ) ;
		}
		else {
			return cached ;
		}
	}
} ;



kungFig.requireKfgParse = function requireKfgParse( content , configPath , options ) {
	content = this.parse( content , {
		file: configPath ,
		masterFile: options.masterFile ,
		classes: options.classes ,
		doctype: options.doctype ,
		tags: options.tags ,
		metaTags: options.metaTags ,
		operators: options.operators ,
		metaHook: options.metaHook ,
		isInclude: options.isInclude
	} ) ;

	//console.log( content ) ;

	// Store in the cache
	if ( ! options.noKfgCache ) { this.cache[ configPath ] = content ; }

	return content ;
} ;



kungFig.requireText = function requireText( configPath ) {
	var content ;

	if ( configPath in this.cache ) { return this.cache[ configPath ] ; }

	try {
		content = fs.readFileSync( configPath , 'utf8' ) ;
	}
	catch ( error ) {
		error.code = 'MODULE_NOT_FOUND' ;
		throw error ;
	}

	this.cache[ configPath ] = content ;

	return content ;
} ;





// Used to emulate require.cache
kungFig.cache = {} ;

kungFig.clearCache = function clearCache() {
	kungFig.cache = {} ;
} ;



kungFig.extendOperators = function extendOperators( operators ) {
	return tree.extend( { own: true , deep: true } , {} , this , { operators: operators } ) ;
} ;



// 'Meta' are meta-data related to a loaded config
kungFig.meta = new WeakMap() ;

kungFig.getMeta = function getMeta( config ) {
	if ( typeof config === 'object' ) { return kungFig.meta.get( config ) ; }
} ;

kungFig.setMeta = function setMeta( config , meta ) {
	if ( typeof config === 'object' ) {
		if ( Array.isArray( meta ) ) { meta = new kungFig.TagContainer( meta ) ; }

		if ( ( meta instanceof kungFig.TagContainer ) && meta.children.every( e => e instanceof kungFig.Tag ) ) {
			kungFig.meta.set( config , meta ) ;
		}
		else {
			throw new Error( "argument #1 should be a TagContainer or an array of tags" ) ;
		}
	}
} ;

kungFig.copyMeta = function copyMeta( from , to ) {
	try {
		kungFig.setMeta( to , kungFig.getMeta( from ) ) ;
	}
	catch ( error ) {
		// We do not care here, error are "normal" case...
	}
} ;


