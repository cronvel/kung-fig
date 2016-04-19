/*
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



var kungFig = {} ;
module.exports = kungFig ;



kungFig.parse = require( './kfgParse.js' ) ;
kungFig.stringify = require( './kfgStringify.js' ) ;



// Extend with the tree-ops part
tree.extend( { own: true } , kungFig , require( './treeOps.js' ) ) ;



kungFig.load = function load( configPath_ , options )
{
	var config , configDir = '' , configFile = '' , configPath = '' , configExt = '' , innerPath , required , error ,
		recursiveParentSearch = false , oldConfigDir , configDirFixedPart = '' , isStatic = false , tmp ;
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	if ( ! options.internal )
	{
		if ( ! options.fileObjectMap ) { options.fileObjectMap = {} ; }
		
		if ( ! options.cwd ) { options.cwd = process.cwd() + '/' ; }
		else if ( options.cwd[ options.cwd.length - 1 ] !== '/' ) { options.cwd += '/' ; }
		
		if ( options.reduce === undefined ) { options.reduce = true ; }
	}
	
	tmp = configPath_.split( ';' ) ;
	configDir = path.dirname( tmp[ 0 ] ) + '/' ;
	configFile = path.basename( tmp[ 0 ] ) ;
	configExt = path.extname( tmp[ 0 ] ).slice( 1 ).toLowerCase() ;
	innerPath = tmp[ 1 ] ;
	
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
			required = require( configPath ) ;
		}
		catch ( error_ )
		{
			if ( ! recursiveParentSearch )
			{
				error = new Error( 'Cannot load config file: ' + configPath + ' (' + error_ + ')' ) ;
				error.badContent = error_.code !== 'MODULE_NOT_FOUND' ;
				throw error ;
			}
			
			oldConfigDir = configDir ;
			configDir = path.dirname( configDir ) + '/' ;
			
			if ( configDir !== oldConfigDir ) { continue ; }
			
			error = new Error( 'Cannot load config file with recursive parent search: ' + configPath_ ) ;
			error.badContent = error_.code !== 'MODULE_NOT_FOUND' ;
			throw error ;
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
			tree.extend( { depth: true , own: true } , Array.isArray( required ) ? [] : {} , required ) ;
		
		//console.log( ">>> path:" , config.configDir ) ;
		
		// The entire file should be expanded first, even if only a small sub-part will be used
		if ( config && typeof config === 'object' )
		{
			kungFig.expand( config , { cwd: configDir , root: config , fileObjectMap: options.fileObjectMap } ) ;
		}
	}
	
	if ( innerPath ) { config = tree.path.get( config , innerPath ) ; }
	
	if ( ! isStatic && options.reduce )
	{
		config = kungFig.reduce( config ) ;
	}
	
	return config ;
} ;



/*
	This method find all key starting with '@' or '?@' and replace its value, recursively, with a required .json or .js file.
*/
kungFig.expand = function expand( config , options )
{
	var i , iMax , keys , key , baseKey , expandable , optional , indexOf ;
	
	
	// First iterate over arrays
	if ( Array.isArray( config ) )
	{
		iMax = config.length ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( config[ i ] && typeof config[ i ] === 'object' )
			{
				kungFig.expand( config[ i ] , options ) ;
			}
		}
		
		return ;
	}
	
	
	keys = Object.keys( config ) ;
	iMax = keys.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		key = keys[ i ] ;
		expandable = false ;
		
		
		// Check if the current key contains an import command
		if ( key[ 0 ] === '@' )
		{
			expandable = true ;
			baseKey = key.slice( 1 ) ;
			optional = false ;
		}
		else if ( key[ 0 ] === '?' && key[ 1 ] === '@' )
		{
			expandable = true ;
			baseKey = key.slice( 2 ) ;
			optional = true ;
		}
		
		
		if ( expandable )
		{
			if ( config[ key ] === '' || config[ key ] === ';' )
			{
				// So this is a local reference to the current root
				config[ baseKey ] = options.root ;
			}
			else if ( config[ key ][ 0 ] === ';' )
			{
				// So this is a local reference
				config[ baseKey ] = tree.path.get( options.root , config[ key ].slice( 1 ) ) ;
			}
			else
			{
				try {
					config[ baseKey ] = kungFig.load(
						config[ key ] ,
						{ internal: true , cwd: options.cwd , fileObjectMap: options.fileObjectMap }
					) ;
				}
				catch ( error ) {
					//if ( ! optional ) { throw error ; }
					if ( ! optional || error.badContent ) { throw error ; }
					
					// The missing file is replaced by {} (empty object), except if an innerPath was defined
					indexOf = config[ key ].indexOf( ';' ) ;
					config[ baseKey ] = indexOf === -1 || indexOf === config[ key ].length - 1 ? {} : undefined ;
				}
			}
			
			delete config[ key ] ;
		}
		else if ( config[ key ] && typeof config[ key ] === 'object' )
		{
			kungFig.expand( config[ key ] , { cwd: options.cwd , root: options.root , fileObjectMap: options.fileObjectMap } ) ;
		}
	}
} ;



// If path is given, it is saved into the specified file, else the string is simply returned
kungFig.save = function save( config , path , options )
{
	var content ;
	
	if ( config && typeof config === 'object' )
	{
		config = kungFig.patchCircularBreadthFirst( config ) ;
	}
	
	content = JSON.stringify( config , null , 2 ) ;
	
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
		//console.log( '#' + i + ';' , objectStack[ i ] ) ;
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
					currentPatchedObject[ '@' + key ] = ';' + pathStack[ index ] ;
				}
				else
				{
					currentPatchedObject[ key ] = Array.isArray( currentObject[ key ] ) ? [] : {} ;
					
					// Stack
					objectStack.push( currentObject[ key ] ) ;
					patchedObjectStack.push( currentPatchedObject[ key ] ) ;
					//pathStack.push( currentPath ? currentPath + '.' + key : key ) ;
					pathStack.push( currentPath + ( isArray ? '#' : ( currentPath ? '.' : '' ) ) + key ) ;
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


