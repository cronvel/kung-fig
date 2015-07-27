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



var kungFig = {} ;
module.exports = kungFig ;



kungFig.load = function load( config , override )
{
	var configDir = '' , configPath = '' , fileObjectMap = {} , required ;
	
	if ( typeof config === 'string' )
	{
		configPath = config ;
		configDir = path.dirname( configPath ) + '/' ;
		
		try {
			required = require( configPath ) ;
		}
		catch ( error ) {
			throw new Error( 'Cannot load config file: ' + configPath + ' (' + error + ')' ) ;
		}
		
		fileObjectMap[ configPath ] = config = tree.extend( { depth: true } , Array.isArray( required ) ? [] : {} , required ) ;
	}
	
	// If no path can be found, use the Current Working Directory
	if ( ! configDir ) { configDir = process.cwd() + '/' ; }
	
	//console.log( ">>> path:" , config.configDir ) ;
	
	if ( config && typeof config === 'object' ) { kungFig.expand( config , configDir , config , fileObjectMap ) ; }
	
	if ( override && typeof override === 'object' )
	{
		kungFig.expand( override , configDir , override , fileObjectMap ) ;
		tree.extend( { deep: true } , config , override ) ;
	}
	
	return config ;
} ;



/*
	This method find all string value starting with @ and replace them, recursively, with a required .json file.
*/
kungFig.expand = function expand( config , currentDir , currentRoot , fileObjectMap )
{
	var key , includePath , includeDir , dependency , referencePath , isArray , required , tmp ;
	
	isArray = Array.isArray( config ) ;
	
	for ( key in config )
	{
		if ( isArray ) { key = +key ; }	// cast it to a number
		includeDir = currentDir ;
		
		if ( typeof config[ key ] === 'string' && config[ key ][ 0 ] === '@' )
		{
			tmp = config[ key ].slice( 1 ).split( ':' ) ;
			includePath = tmp[ 0 ] ;
			referencePath = tmp[ 1 ] ;
			
			if ( includePath )
			{
				includePath = currentDir + includePath ;
				includeDir = path.dirname( includePath ) + '/' ;
				
				if ( fileObjectMap[ includePath ] )
				{
					dependency = fileObjectMap[ includePath ] ;
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
					
					fileObjectMap[ includePath ] =
						dependency =
						tree.extend( { depth: true } , Array.isArray( required ) ? [] : {} , required ) ;
					
					// Always perform an expand when a new file is loaded on the whole tree (even if only a subtree will be used)
					if ( dependency && typeof dependency === 'object' )
					{
						kungFig.expand( dependency , includeDir , dependency , fileObjectMap ) ;
					}
				}
			}
			else
			{
				dependency = currentRoot ;
			}
			
			if ( referencePath ) { config[ key ] = tree.path.get( dependency , referencePath ) ; }
			else { config[ key ] = dependency ; }
		}
		else if ( config[ key ] && typeof config[ key ] === 'object' )
		{
			kungFig.expand( config[ key ] , currentDir , currentRoot , fileObjectMap ) ;
		}
	}
} ;



// If path is given, it is save into the specified file, else the string is simply returned
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


/*
kungFig.patchCircularDepthFirst = function patchCircularDepthFirst( config , objectStack , pathStack )
{
	var key , index , patchedConfig , currentPath = pathStack[ pathStack.length - 1 ] ;
	
	patchedConfig = Array.isArray( config ) ? [] : {} ;
	
	for ( key in config )
	{
		if ( config[ key ] && typeof config[ key ] === 'object' )
		{
			index = objectStack.indexOf( config[ key ] ) ;
			
			if ( index !== -1 )
			{
				patchedConfig[ key ] = '@:' + pathStack[ index ] ;
			}
			else
			{
				// Stack
				objectStack.push( config[ key ] ) ;
				pathStack.push( currentPath ? currentPath + '.' + key : key ) ;
				
				patchedConfig[ key ] = kungFig.patchCircularDepthFirst( config[ key ] , objectStack , pathStack ) ;
				
				// Unstack
				objectStack.pop() ;
				pathStack.pop() ;
			}
		}
		else
		{
			patchedConfig[ key ] = config[ key ] ;
		}
	}
	
	return patchedConfig ;
} ;
*/

