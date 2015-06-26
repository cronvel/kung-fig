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



var kungFig = {} ;
module.exports = kungFig ;



kungFig.load = function load( config , override )
{
	var configDir = '' , configPath = '' , fileObjectMap = {} ;
	
	if ( typeof config === 'string' && path.extname( config ) === '.json' )
	{
		configPath = config ;
		configDir = path.dirname( configPath ) + '/' ;
		
		try {
			fileObjectMap[ configPath ] = config = tree.extend( { depth: true } , {} , require( configPath ) ) ;
		}
		catch ( error ) {
			throw new Error( 'Cannot load config file: ' + configPath + ' (' + error + ')' ) ;
		}
	}
	
	// If no path can be found, use the Current Working Directory
	if ( ! configDir ) { configDir = process.cwd() + '/' ; }
	
	//console.log( ">>> path:" , config.configDir ) ;
	
	kungFig.expand( config , configDir , config , fileObjectMap ) ;
	
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
	var key , includePath , includeDir , required ;
	
	for ( key in config )
	{
		if ( typeof config[ key ] === 'string' && config[ key ][ 0 ] === '@' )
		{
			includePath = currentDir + config[ key ].slice( 1 ) ;
			includeDir = path.dirname( includePath ) + '/' ;
			
			//if ( path.extname( includePath ) === '.json' )
			
			//nextConfigPath = path.dirname( currentDir + includePath ) + '/' ;
			if ( fileObjectMap[ includePath ] )
			{
				// It has already expanded, so just relink and continue...
				config[ key ] = fileObjectMap[ includePath ] ;
				continue ;
			}
			else
			{
				try {
					fileObjectMap[ includePath ] = required = tree.extend( { depth: true } , {} , require( includePath ) ) ;
				}
				catch ( error ) {
					// TODO...
					throw new Error( 'Cannot load dependency: ' + includePath + ' (' + error + ')' ) ;
				}
			}
			
			config[ key ] = required ;
			
			if ( config[ key ] && typeof config[ key ] === 'object' )
			{
				kungFig.expand( config[ key ] , includeDir , config[ key ] , fileObjectMap ) ;
			}
		}
		else if ( config[ key ] && typeof config[ key ] === 'object' )
		{
			kungFig.expand( config[ key ] , currentDir , currentRoot , fileObjectMap ) ;
		}
	}
} ;
