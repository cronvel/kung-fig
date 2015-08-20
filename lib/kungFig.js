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
	
	
	tmp = configPath_.split( ':' ) ;
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
	
	if ( innerPath ) { config = tree.path.get( config , innerPath ) ; }

	//console.log( ">>> path:" , config.configDir ) ;
	
	if ( config && typeof config === 'object' )
	{
		kungFig.expand( config , { cwd: configDir , currentRoot: config , fileObjectMap: options.fileObjectMap } ) ;
	}
	
	return config ;
} ;



/*
	This method find all key starting with @ and replace its value, recursively, with a required .json or .js file.
*/
//kungFig.expand = function expand( config , currentDir , currentRoot , fileObjectMap )
kungFig.expand = function expand( config , options )
{
	var i , iMax , keys , key , includePath , includeDir , dependency , referencePath , required , tmp ;
	
	keys = Object.keys( config ) ;
	iMax = keys.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		key = keys[ i ] ;
		
		includeDir = options.cwd ;
		
		if ( key[ 0 ] === '@' )
		{
			config[ key.slice( 1 ) ] = kungFig.load( config[ key ] , { cwd: includeDir , fileObjectMap: options.fileObjectMap } ) ;
		}
		
		if ( config[ key ][ 0 ] === '@' )
		{
			tmp = config[ key ].slice( 1 ).split( ':' ) ;
			includePath = tmp[ 0 ] ;
			referencePath = tmp[ 1 ] ;
			
			if ( includePath )
			{
				includePath = options.cwd + includePath ;
				includeDir = path.dirname( includePath ) + '/' ;
				
				if ( options.fileObjectMap[ includePath ] )
				{
					dependency = options.fileObjectMap[ includePath ] ;
				}
				else
				{
					try {
						required = require( includePath ) ;
					}
					catch ( error ) {
						// TODO...
						throw new Error( 'Cannot load dependency: ' + includePath + ' (' + error + ')' ) ;
					}
					
					options.fileObjectMap[ includePath ] =
						dependency =
						tree.extend( { depth: true } , Array.isArray( required ) ? [] : {} , required ) ;
					
					// Always perform an expand when a new file is loaded on the whole tree (even if only a subtree will be used)
					if ( dependency && typeof dependency === 'object' )
					{
						kungFig.expand( dependency , { cwd: includeDir , currentRoot: dependency , fileObjectMap: options.fileObjectMap } ) ;
					}
				}
			}
			else
			{
				dependency = options.currentRoot ;
			}
			
			if ( referencePath ) { config[ key ] = tree.path.get( dependency , referencePath ) ; }
			else { config[ key ] = dependency ; }
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
		//console.log( '#' + i + ':' , objectStack[ i ] ) ;
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
					currentPatchedObject[ key ] = '@:' + pathStack[ index ] ;
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


