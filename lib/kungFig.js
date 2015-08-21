/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



// Load modules
var tree = require( 'tree-kit' ) ;
var path = require( 'path' ) ;
var fs = require( 'fs' ) ;
var osenv = require( 'osenv' ) ;



var kungFig = {} ;
module.exports = kungFig ;



kungFig.load = function load( configPath_ , options )
{
	var config , configDir = '' , configFile = '' , configPath = '' , innerPath , required ,
		recursiveParentSearch = false , oldConfigDir , configDirFixedPart = '' , tmp ;
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	if ( ! options.fileObjectMap ) { options.fileObjectMap = {} ; }
	
	if ( ! options.cwd ) { options.cwd = process.cwd() + '/' ; }
	else if ( options.cwd[ options.cwd.length - 1 ] !== '/' ) { options.cwd += '/' ; }
	
	
	tmp = configPath_.split( ';' ) ;
	configDir = path.dirname( tmp[ 0 ] ) + '/' ;
	configFile = path.basename( tmp[ 0 ] ) ;
	innerPath = tmp[ 1 ] ;
	
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
	
	while ( true )
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
		catch ( error )
		{
			if ( ! recursiveParentSearch )
			{
				throw new Error( 'Cannot load config file: ' + configPath + ' (' + error + ')' ) ;
			}
			
			oldConfigDir = configDir ;
			configDir = path.dirname( configDir ) + '/' ;
			
			if ( configDir !== oldConfigDir ) { continue ; }
			throw new Error( 'Cannot load config file with recursive parent search: ' + configPath_ ) ;
		}
		
		break ;
	}
	
	options.fileObjectMap[ configPath ] = config = tree.extend( { depth: true } , Array.isArray( required ) ? [] : {} , required ) ;
	
	//console.log( ">>> path:" , config.configDir ) ;
	
	// The entire file should be expanded first, even if only a small sub-part will be used
	if ( config && typeof config === 'object' )
	{
		kungFig.expand( config , { cwd: configDir , currentRoot: config , fileObjectMap: options.fileObjectMap } ) ;
	}
	
	if ( innerPath ) { config = tree.path.get( config , innerPath ) ; }

	return config ;
} ;



/*
	This method find all key starting with @ and replace its value, recursively, with a required .json or .js file.
*/
kungFig.expand = function expand( config , options )
{
	var i , iMax , keys , key ;
	
	
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
		
		if ( key[ 0 ] === '@' )
		{
			if ( config[ key ] === '' || config[ key ] === ';' )
			{
				// So this is a local reference to the current root
				config[ key.slice( 1 ) ] = options.currentRoot ;
			}
			else if ( config[ key ][ 0 ] === ';' )
			{
				// So this is a local reference
				config[ key.slice( 1 ) ] = tree.path.get( options.currentRoot , config[ key ].slice( 1 ) ) ;
			}
			else
			{
				config[ key.slice( 1 ) ] = kungFig.load(
					config[ key ] ,
					{ cwd: options.cwd , fileObjectMap: options.fileObjectMap }
				) ;
			}
			
			delete config[ key ] ;
		}
		else if ( config[ key ] && typeof config[ key ] === 'object' )
		{
			kungFig.expand( config[ key ] , { cwd: options.cwd , currentRoot: options.currentRoot , fileObjectMap: options.fileObjectMap } ) ;
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


