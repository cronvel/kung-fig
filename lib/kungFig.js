/*
	Kung Fig
	
	Copyright (c) 2015 - 2016 Cédric Ronvel
	
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
var fs = require( 'fs' ) ;
var osenv = require( 'osenv' ) ;

var glob = require( 'glob' ) ;
var includeGlobOptions = {
	dot: true ,
	nodir: true
} ;



var kungFig = {} ;
module.exports = kungFig ;



kungFig.parse = require( './kfgParse.js' ) ;
kungFig.stringify = require( './kfgStringify.js' ) ;
kungFig.kfgCommon = require( './kfgCommon.js' ) ;
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
tree.extend( { own: true } , kungFig , require( './treeOps.js' ) ) ;



kungFig.load = function load( configPath_ , options )
{
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	if ( ! options.fileObjectMap ) { options.fileObjectMap = {} ; }
	
	if ( ! options.cwd ) { options.cwd = process.cwd() + '/' ; }
	else if ( options.cwd[ options.cwd.length - 1 ] !== '/' ) { options.cwd += '/' ; }
	
	if ( options.reduce === undefined ) { options.reduce = true ; }
	
	return kungFig.load_( configPath_ , options ) ;
} ;



// Only load meta
kungFig.loadMeta = function loadMeta( configPath_ , options )
{
	var configFile , configExt , meta ;
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	configFile = path.basename( configPath_ ) ;
	configExt = path.extname( configPath_ ).slice( 1 ).toLowerCase() ;
	
	// This option force the KFG format for some extension and basename
	if ( options.kfgFiles )
	{
		if ( options.kfgFiles.extname && options.kfgFiles.extname.indexOf( configExt ) !== -1 ) { configExt = 'kfg' ; }
		if ( options.kfgFiles.basename && options.kfgFiles.basename.indexOf( configFile ) !== -1 ) { configExt = 'kfg' ; }
	}
	
	if ( configExt !== 'kfg' )
	{
		throw new Error( "Loading only meta is only supported by the KFG format. Load a .kfg or add use the 'kfgFiles' option if you have your own extension." ) ;
	}
	
	// This is really, really, really nasty, but it still works ^^
	options.metaHook = function( meta_ ) {
		meta = meta_ ;
		var error = new Error( "Meta only" ) ;
		error.metaOnly = true ;
		throw error ;
	} ;
	
	try {
		kungFig.load( configPath_ , options ) ;
	}
	catch ( error ) {
		if ( error.metaOnly ) { return meta ; }
		else { throw error ; }
	}
	
	throw new Error( "metaHook failed" ) ;
} ;



kungFig.load_ = function load_( configPath_ , options )
{
	var config , configDir = '' , configFile = '' , configPath = '' , configExt = '' , innerPath , required , error ,
		recursiveParentSearch = false , oldConfigDir , configDirFixedPart = '' , isStatic = false , isScalar = false , tmp ;
	
	tmp = configPath_.split( '#' ) ;
	configDir = path.dirname( tmp[ 0 ] ) + '/' ;
	configFile = path.basename( tmp[ 0 ] ) ;
	configExt = path.extname( tmp[ 0 ] ).slice( 1 ).toLowerCase() ;
	innerPath = tmp[ 1 ] ;
	
	// This option force the KFG format for some extension and basename
	if ( options.kfgFiles )
	{
		if ( options.kfgFiles.extname && options.kfgFiles.extname.indexOf( configExt ) !== -1 ) { configExt = 'kfg' ; }
		if ( options.kfgFiles.basename && options.kfgFiles.basename.indexOf( configFile ) !== -1 ) { configExt = 'kfg' ; }
	}
	
	isStatic = configExt === 'js' ;
	
	if ( configDir.indexOf( '.../' ) !== -1 )
	{
		tmp = configDir.split( '.../' ) ;
		configDir = tmp[ 0 ] ;
		configDirFixedPart = tmp[ 1 ] ;
		recursiveParentSearch = true ;
	}
	
	// Since we use require(), absolute path are mandatory
	switch ( configDir.slice( 0 , 2 ) )
	{
		case './' :
			configDir = options.cwd + configDir ;
			break ;
		case '..' :
			if ( configDir[ 2 ] === '/' )
			{
				configDir = options.cwd + configDir ;
			}
			break ;
		case '~/' :
			configDir = osenv.home() + configDir.slice( 1 ) ;
			break ;
		default :
			if ( ! path.isAbsolute( configDir ) )
			{
				configDir = options.cwd + configDir ;
			}
	}
	
	// Normalize the path, removing inner ../ ./ or multiple /
	configDir = path.normalize( configDir ) ;
	
	for(;;)
	{
		configPath = configDir + configDirFixedPart + configFile ;
		//console.log( '\n### Trying:' , configPath , "\n" ) ;
		
		if ( options.fileObjectMap[ configPath ] )
		{
			// Found in the cache, exit now!
			config = options.fileObjectMap[ configPath ] ;
			if ( innerPath ) { config = tree.path.get( config , innerPath ) ; }
			return config ;
		}
		
		try {
			required = this.require( configPath , configExt , options ) ;
		}
		catch ( error_ )
		{
			if ( error_.metaOnly ) { throw error_ ; }
			
			if ( ! recursiveParentSearch )
			{
				error = new Error( 'Cannot load config file: ' + configPath + ' (' + error_ + ')' ) ;
				error.badContent = error_.code !== 'MODULE_NOT_FOUND' ;
				error.code = error_.code ;
				throw error ;
			}
			
			oldConfigDir = configDir ;
			configDir = path.dirname( configDir ) + '/' ;
			
			if ( configDir !== oldConfigDir ) { continue ; }
			
			error = new Error( 'Cannot load config file with recursive parent search: ' + configPath_ ) ;
			error.badContent = error_.code !== 'MODULE_NOT_FOUND' ;
			error.code = error_.code ;
			throw error ;
		}
		
		// This is a scalar, return it now...
		if ( ! required || typeof required !== 'object' )
		{
			isStatic = true ;
			isScalar = true ;
		}
		
		break ;
	}
	
	if ( isStatic )
	{
		config = required ;
	}
	else
	{
		// Extend it, it should not modify the original cached file
		options.fileObjectMap[ configPath ] =
			config =
			tree.extend(
				{ depth: true , own: true , proto: true , descriptor: true } ,
				Array.isArray( required ) ? [] : {} ,
				required
			) ;
		
		//console.log( ">>> path:" , config.configDir ) ;
		
		// The entire file should be expanded first, even if only a small sub-part will be used
		if ( config && typeof config === 'object' )
		{
			config = this.expand( config , {
				cwd: configDir ,
				root: config ,
				masterFile: options.masterFile || configPath ,
				fileObjectMap: options.fileObjectMap ,
				doctype: options.doctype ,
				classes: options.classes ,
				tags: options.tags ,
				metaTags: options.metaTags ,
				operators: options.operators ,
				metaHook: options.metaHook ,
			} ) ;
		}
		
		// Copy meta, from the required file to the cloned config
		kungFig.copyMeta( required , config ) ;
	}
	
	if ( innerPath )
	{
		if ( isScalar ) { config = undefined ; }
		else { config = tree.path.get( config , innerPath ) ; }
	}
	
	if ( ! isStatic && options.reduce )
	{
		config = this.autoReduce( config ) ;
	}
	
	return config ;
} ;



/*
	This method find all key starting with '@' or '@@' and replace its value, recursively,
	with a required .json, .js or .kfg file.
*/
kungFig.expand = function expand( config , options )
{
	var i , iMax , keys , key , baseKey , expandable , optional , indexOf ,
		inner , innerParent , innerParentKey , writable ;
	
	innerParent = inner = config ;
	
	if ( config instanceof kungFig.Tag )
	{
		if ( config.content instanceof kungFig.TagContainer )
		{
			innerParent = config.content ;
			innerParentKey = 'children' ;
			inner = config.content.children ;
		}
		else
		{
			innerParentKey = 'content' ;
			inner = config.content ;
		}
	}
	else if ( config instanceof kungFig.TagContainer )
	{
		innerParentKey = 'children' ;
		inner = config.children ;
	}
	
	if ( ! inner || typeof inner !== 'object' ) { return config ; }
	
	
	// First iterate over arrays
	if ( Array.isArray( inner ) )
	{
		iMax = inner.length ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( inner[ i ] && typeof inner[ i ] === 'object' )
			{
				inner[ i ] = this.expand( inner[ i ] , options ) ;
			}
		}
		
		return config ;
	}
	
	
	keys = Object.keys( inner ) ;
	iMax = keys.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		key = keys[ i ] ;
		expandable = false ;
		
		
		// Check if the current key contains an import command
		if ( key[ 0 ] === '@' )
		{
			if ( key[ 1 ] === '@' )
			{
				expandable = true ;
				baseKey = key.slice( 2 ) ;
				optional = false ;
			}
			else
			{
				expandable = true ;
				baseKey = key.slice( 1 ) ;
				optional = true ;
			}
		}
		
		if ( expandable )
		{
			if ( inner[ key ] === '' || inner[ key ] === '#' )
			{
				// So this is a local reference to the current root
				if ( baseKey )
				{
					inner[ baseKey ] = options.root ;
				}
				else if ( inner !== config )
				{
					innerParent[ innerParentKey ] = inner = options.root ;
				}
				else
				{
					config = innerParent = inner = options.root ;
				}
			}
			else if ( inner[ key ][ 0 ] === '#' )
			{
				// So this is a local reference
				if ( baseKey )
				{
					inner[ baseKey ] = tree.path.get( options.root , inner[ key ].slice( 1 ) ) ;
				}
				else if ( inner !== config )
				{
					innerParent[ innerParentKey ] = inner = tree.path.get( options.root , inner[ key ].slice( 1 ) ) ;
				}
				else
				{
					config = innerParent = inner = tree.path.get( options.root , inner[ key ].slice( 1 ) ) ;
				}
			}
			else
			{
				if ( baseKey )
				{
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
				else
				{
					try {
						if ( config !== inner )
						{
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
							} ) ;
						}
						else
						{
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
							} ) ;
						}
					}
					catch ( error ) {
						//if ( ! optional ) { throw error ; }
						if ( ! optional || error.badContent ) { throw error ; }
						// Nothing to do...
					}
				}
			}
			
			delete inner[ key ] ;
			if ( ! baseKey ) { break ; }
		}
		else if ( inner[ key ] && typeof inner[ key ] === 'object' )
		{
			writable = Object.getOwnPropertyDescriptor( inner , key ).writable ;
			
			//try {
			if ( writable )
			{
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
				} ) ;
			}
			else
			{
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
				} ) ;
			}
			//} catch ( error ) { console.log( ">>> Throw...\n" + require('string-kit').inspect( {style:'color',depth:10},inner ) ) ; throw error ; }
		}
	}
	
	return config ;
} ;



// It checks if the path has glob.
// If not, it just call kungFig.load().
// If it has glob, then it resolves the glob and return and array of config, calling kungFig.load() for each path.
kungFig.include = function include( configPath_ , options )
{
	var config , pathArray ,
		splittedPath = configPath_.split( '#' ) ;
	
	// Set isInclude to true
	options.isInclude = true ;
	
	if ( ! glob.hasMagic( splittedPath[ 0 ] , includeGlobOptions ) )
	{
		return kungFig.load_( configPath_ , options ) ;
	}
	
	// This is a glob-based include! We will load a bunch of file at once!
	//console.log( configPath_ + ' as glob!' ) ;
	
	config = [] ;
	pathArray = glob.sync( splittedPath[ 0 ] , tree.extend( null , {} , includeGlobOptions , { cwd: options.cwd } ) ) ;
	
	//console.log( 'glob matches:' , pathArray ) ;
	
	pathArray.forEach( ( onePath ) => {
		if ( splittedPath[ 1 ] ) { onePath += '#' + splittedPath[ 1 ] ; }
		//console.log( 'one path:' , onePath ) ;
		config.push( kungFig.load_( onePath , options ) ) ;
	} ) ;
	
	return config ;
} ;



// If path is given, it is saved into the specified file, else the string is simply returned
kungFig.saveJson = function saveJson( config , path , options )
{
	var content , indent ;
	
	if ( config && typeof config === 'object' )
	{
		config = this.patchCircularBreadthFirst( config ) ;
	}
	
	indent = options && ( 'indent' in options ) ? options.indent : 2 ;
	
	content = JSON.stringify( config , null , indent ) ;
	
	if ( path ) { fs.writeFileSync( path , content , options ) ; }
	
	return content ;
} ;

// Function save() is deprecated, but point to saveJson() for backward compatibility
kungFig.save = kungFig.saveJson ;



// If path is given, it is saved into the specified file, else the string is simply returned
kungFig.saveKfg = function saveKfg( config , path , options )
{
	var content ;
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	if ( config && typeof config === 'object' )
	{
		// Getting meta will fail because we create a new object,
		// we have to save the original object
		options.original = config ;
		config = this.patchCircularBreadthFirst( config ) ;
	}
	
	content = this.stringify( config , options ) ;
	
	if ( path ) { fs.writeFileSync( path , content , options ) ; }
	
	return content ;
} ;



kungFig.patchCircularBreadthFirst = function patchCircularBreadthFirst( config )
{
	var key , i , isArray , index ,
		objectStack , currentObject , patchedObjectStack , currentPatchedObject , pathStack , currentPath ;
	
	objectStack = [ config ] ;
	patchedObjectStack = [ Array.isArray( config ) ? [] : {} ] ;
	pathStack = [ '' ] ;
	
	for ( i = 0 ; i < objectStack.length ; i ++ )
	{
		//console.log( '#' + i + '#' , objectStack[ i ] ) ;
		currentObject = objectStack[ i ] ;
		currentPatchedObject = patchedObjectStack[ i ] ;
		currentPath = pathStack[ i ] ;
		
		isArray = Array.isArray( currentObject ) ;
		
		for ( key in currentObject )
		{
			if ( currentObject[ key ] && typeof currentObject[ key ] === 'object' )
			{
				index = objectStack.indexOf( currentObject[ key ] ) ;
				
				if ( index !== -1 )
				{
					if ( Array.isArray( currentPatchedObject ) )
					{
						currentPatchedObject[ key ] = { '@@': '#' + pathStack[ index ] } ;
					}
					else
					{
						currentPatchedObject[ '@@' + key ] = '#' + pathStack[ index ] ;
					}
				}
				else
				{
					currentPatchedObject[ key ] = Array.isArray( currentObject[ key ] ) ? [] : {} ;
					
					// Stack
					objectStack.push( currentObject[ key ] ) ;
					patchedObjectStack.push( currentPatchedObject[ key ] ) ;
					//pathStack.push( currentPath ? currentPath + '.' + key : key ) ;
					pathStack.push( currentPath + ( isArray ? '[' + key + ']' : ( currentPath ? '.' : '' ) + key ) ) ;
				}
			}
			else
			{
				currentPatchedObject[ key ] = currentObject[ key ] ;
			}
		}
	}
	
	return patchedObjectStack[ 0 ] ;
} ;



kungFig.require = function require_( configPath , configExt , options )
{
	switch ( configExt )
	{
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


	
kungFig.requireKfg = function requireKfg( configPath , options )
{
	var content , cached ;
	
	//console.log( "require KFG options:" , options ) ;
	
	if ( ! options.noKfgCache && ( configPath in this.cache ) )
	{
		cached = this.cache[ configPath ] ;
		
		if ( typeof options.metaHook === 'function' )
		{
			if ( typeof cached === 'object' && kungFig.meta.has( cached ) )
			{
				options.metaHook( kungFig.meta.get( cached ) , null ) ;
				return cached ;
			}
			
			// Something was wrong, we need to reload the file
			//console.error( "----------" , cached , kungFig.meta.has( cached ) ) ;
		}
		else
		{
			return cached ;
		}
	}
	
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
		metaHook: options.metaHook ,
		isInclude: options.isInclude
	} ) ;
	
	//console.log( content ) ;
	
	// Store in the cache
	if ( ! options.noKfgCache ) { this.cache[ configPath ] = content ; }
	
	return content ;
} ;



kungFig.requireText = function requireText( configPath )
{
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

kungFig.clearCache = function clearCache()
{
	kungFig.cache = {} ;
} ;



kungFig.extendOperators = function extendOperators( operators )
{
	return tree.extend( { own: true , deep: true } , {} , this , { operators: operators } ) ;
} ;



// 'Meta' are meta-data related to a loaded config
kungFig.meta = new WeakMap() ;

kungFig.getMeta = function getMeta( config )
{
	if ( typeof config === 'object' ) { return kungFig.meta.get( config ) ; }
} ;

kungFig.setMeta = function setMeta( config , meta )
{
	if ( typeof config === 'object' )
	{
		if ( Array.isArray( meta ) ) { meta = new kungFig.TagContainer( meta ) ; }
		
		if ( ( meta instanceof kungFig.TagContainer ) && meta.children.every( e => e instanceof kungFig.Tag ) )
		{
			kungFig.meta.set( config , meta ) ;
		}
		else
		{
			throw new Error( "argument #1 should be a TagContainer or an array of tags" ) ;
		}
	}
} ;

kungFig.copyMeta = function copyMeta( from , to )
{
	try {
		kungFig.setMeta( to , kungFig.getMeta( from ) ) ;
	}
	catch ( error ) {
		// We do not care here, error are "normal" case...
	}
} ;


