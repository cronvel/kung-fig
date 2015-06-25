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



var kungFig = {} ;
module.exports = kungFig ;



kungFig.loadConfig = function loadConfig( config , override )
{
	var configPath = '' ;
	
	if ( typeof config === 'string' && path.extname( config ) === '.json' )
	{
		configPath = path.dirname( config ) + '/' ;
		config = require( config ) ;
		config.configPath = configPath ;
	}
	
	// If no path can be found, use the Current Working Directory
	if ( ! config.configPath ) { config.configPath = process.cwd() + '/' ; }
	
	//console.log( ">>> path:" , config.configPath ) ;
	
	kungFig.expandConfig( config , config.configPath ) ;
	
	if ( override && typeof override === 'object' )
	{
		kungFig.expandConfig( override , config.configPath ) ;
		tree.extend( { deep: true } , config , override ) ;
	}
	
	return config ;
} ;



/*
	This method find all string value starting with @ and replace them, recursively, with a required .json file.
*/
kungFig.expandConfig = function expandConfig( config , configPath )
{
	var key , includeFilePath , subtreePath , required , nextConfigPath , tmpStr ;
	
	for ( key in config )
	{
		if ( typeof config[ key ] === 'string' && config[ key ][ 0 ] === '@' )
		{
			tmpStr = config[ key ].slice( 1 ).split( ':' ) ;
			includeFilePath = tmpStr[ 0 ] ;
			subtreePath = tmpStr[ 1 ] ;
			
			//if ( path.extname( includeFilePath ) === '.json' )
			
			//nextConfigPath = path.dirname( configPath + includeFilePath ) + '/' ;
			try {
				required = require( configPath + includeFilePath ) ;
			}
			catch ( error ) {
				// TODO...
				console.error( 'Dependency not found: ' + configPath + includeFilePath ) ;
				throw error ;
			}
			
			if ( subtreePath ) { config[ key ] = tree.path.get( required , subtreePath ) ; }
			else { config[ key ] = required ; }
			
			if ( config[ key ] && typeof config[ key ] === 'object' )
			{
				//this.expandConfig( config[ key ] , nextConfigPath ) ;
				kungFig.expandConfig( config[ key ] , configPath ) ;
			}
		}
		else if ( config[ key ] && typeof config[ key ] === 'object' )
		{
			kungFig.expandConfig( config[ key ] , configPath ) ;
		}
	}
} ;
