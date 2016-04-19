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



function parse( str , options )
{
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var runtime = {
		i: 0 ,
		iStartOfLine: 0 ,
		iEndOfLine: 0 ,
		lineNumber: 1 ,
		lastLine: false ,
		lastDepth: -1 ,
		depth: 0 ,
		depthLimit: options.depthLimit || Infinity ,
		ancestors: [] ,
		ancestorKeys: []
	} ;
	
	if ( typeof str !== 'string' )
	{
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}
	
	parseLines( str , runtime ) ;
	
	return runtime.ancestors[ 0 ] ;
}



module.exports = parse ;



function parseLines( str , runtime )
{
	while ( ! runtime.lastLine )
	{
		parseLineBoundaries( str , runtime ) ;
		parseLine( str , runtime ) ;
		nextItem( runtime ) ;
		runtime.iStartOfLine = runtime.iEndOfLine + 1 ;
		runtime.lineNumber ++ ;
	}
}



function nextItem( runtime )
{
	runtime.lastDepth = runtime.depth ;
}



function parseLineBoundaries( str , runtime )
{
	var indexOf = str.indexOf( '\n' , runtime.iStartOfLine ) ;
	
	if ( indexOf === -1 )
	{
		runtime.iEndOfLine = str.length ;
		runtime.lastLine = true ;
	}
	else
	{
		runtime.iEndOfLine = indexOf ;
	}
	
	//console.log( "parseLineBoundaries()\n" , runtime ) ;
}



function parseLine( str , runtime )
{
	runtime.i = runtime.iStartOfLine ;
	parseDepth( str , runtime ) ;
	
	// This is a comment or an empty line: skip that line right now!
	if ( runtime.i >= runtime.iEndOfLine || str[ runtime.i ] === '#' )
	{
		// Restore lastDepth
		runtime.depth = runtime.lastDepth ;
		return ;
	}
	
	depthManagement( runtime ) ;
	
	parseLineContent( str , runtime ) ;
}



function parseDepth( str , runtime )
{
	runtime.depth = 0 ;
	
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === '\t' )
	{
		runtime.depth ++ ;
		runtime.i ++ ;
	}
}



function depthManagement( runtime )
{
	//console.log( ">>> depthManagement:" , runtime.lastDepth , runtime.depth ) ;
	
	runtime.ancestors.length = runtime.depth + 1 ;
	runtime.ancestorKeys.length = runtime.depth + 1 ;
	
	if ( runtime.depth === runtime.lastDepth || runtime.depth === runtime.lastDepth + 1 )
	{
		return ;
	}
	else if ( runtime.depth < runtime.lastDepth )
	{
		//console.log( "\n\n>>> depthManagement:\n" , runtime.depth , runtime.ancestors , "\n\n" ) ;
		return ;
	}
	else
	{
		throw new SyntaxError( "Unexpected indentation: deeper than its parent + 1 (" + runtime.lineNumber + ")" ) ;
	}
}



function parseLineContent( str , runtime )
{
	/*
		Types of lines:
			- list entry (array) has a '-' after indentation
			- text lines has a '>' after indentation
			- properties (object) has a ':' somewhere after the key
			- direct values (rare)
	*/
	
	if ( str[ runtime.i ] === '-' )
	{
		parseArrayElement( str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '>' )
	{
		parseStringLine( str , runtime ) ;
	}
	else
	{
		parseMaybeKV( str , runtime ) ;
	}
}



function parseArrayElement( str , runtime )
{
	var k , v ;
	
	runtime.i ++ ;
	
	parseSpaces( str , runtime ) ;
	
	// Manage index/key
	if ( runtime.ancestorKeys[ runtime.depth ] === undefined )
	{
		k = runtime.ancestorKeys[ runtime.depth ] = 0 ;
	}
	else
	{
		k = ++ runtime.ancestorKeys[ runtime.depth ] ;
	}
	
	// If the parent is still undefined, now we know for sure that this is an array
	if ( runtime.ancestors[ runtime.depth ] === undefined )
	{
		runtime.ancestors[ runtime.depth ] = [] ;
		parentLink( runtime ) ;
	}
	
	// Check compact-list syntax
	if ( str[ runtime.i ] === '\t' )
	{
		runtime.i ++ ;
		parseSpaces( str , runtime ) ;
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }
		
		nextItem( runtime ) ;
		runtime.depth ++ ;
		depthManagement( runtime ) ;
		//console.log( "s: '" + str.slice( runtime.i , runtime.iEndOfLine ) + "'" ) ;
		parseLineContent( str , runtime ) ;
	}
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	v = parseValue( str , runtime ) ;
	parentArrayKV( k , v , runtime ) ;
}



function parseMaybeKV( str , runtime )
{
	var k , v ;
	
	parseSpaces( str , runtime ) ;
	
	if ( str[ runtime.i ] === '"' )
	{
		runtime.i ++ ;
		v = parseQuotedString( str , runtime ) ;
		parseSpaces( str , runtime ) ;
		
		if ( runtime.i >= runtime.endOfLine )
		{
			// This is a string value
			parentStringAppendLine( v , runtime ) ;
		}
		else if ( str[ runtime.i ] === ':' )
		{
			k = v ;
			runtime.i ++ ;
			parseAfterKey( k , str , runtime ) ;
		}
		else
		{
			throw new SyntaxError( "Unexpected " + str[ runtime.i ] + " (" + runtime.lineNumber + ")") ;
		}
		
		return ;
	}
	
	k = parseMaybeUnquotedKey( str , runtime ) ;
	
	if ( ! k )
	{
		// This is a value, unquoted
		//v = parseValue( str , runtime ) ;
		
		// This is a string value, unquoted
		v = parseUnquotedString( str , runtime ) ;
		parentStringAppendLine( v , runtime ) ;
	}
	else
	{
		parseAfterKey( k , str , runtime ) ;
	}
}



function parseAfterKey( k , str , runtime )
{
	var v ;
	
	parseSpaces( str , runtime ) ;
	runtime.ancestorKeys[ runtime.depth ] = k ;
	
	// If the parent is still undefined, now we know for sure that this is an object
	if ( runtime.ancestors[ runtime.depth ] === undefined )
	{
		runtime.ancestors[ runtime.depth ] = {} ;
		parentLink( runtime ) ;
	}
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	runtime.ancestors[ runtime.depth + 1 ] = undefined ;
	v = parseValue( str , runtime ) ;
	parentObjectKV( k , v , runtime ) ;
}



function parseStringLine( str , runtime )
{
	runtime.i ++ ;
	
	// If the parent is still undefined, now we know for sure that this is a string
	if ( runtime.ancestors[ runtime.depth ] === undefined )
	{
		runtime.ancestors[ runtime.depth ] = '' ;
		parentLink( runtime ) ;
	}
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		parentStringAppendLine( '' , runtime ) ;
		return ;
	}
	
	if ( str[ runtime.i ] !== ' ' )
	{
		throw new SyntaxError( "Expected a space ' ' after the '>', but got '" + str[ runtime.i ] + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.i ++ ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		parentStringAppendLine( '' , runtime ) ;
		return ;
	}
	
	//parseSpaces( str , runtime ) ;
	//parentStringAppendLine( parseUnquotedString( str , runtime ) , runtime ) ;
	
	parentStringAppendLine( str.slice( runtime.i , runtime.iEndOfLine ) , runtime ) ;
}



// Skip spaces
function parseSpaces( str , runtime )
{
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}



function parentStringAppendLine( v , runtime )
{
	if ( typeof runtime.ancestors[ runtime.depth ] === 'string' )
	{
		if ( runtime.ancestors[ runtime.depth ] ) { runtime.ancestors[ runtime.depth ] += '\n' ; }
		runtime.ancestors[ runtime.depth ] += v ;
		// String are not passed by reference, so always parentLink them to their parent
		parentLink( runtime ) ;
	}
	else
	{
		throw new SyntaxError( "Unexpected string line (" + runtime.lineNumber + ")" ) ;
	}
	
	// Always re-assign it to its parent
	//runtime.ancestors[ runtime.depth - 1 ][ runtime.ancestorKeys[ runtime.depth - 1 ] ] = runtime.ancestors[ runtime.depth ] ;
}



function parentArrayKV( k , v , runtime )
{
	if ( Array.isArray( runtime.ancestors[ runtime.depth ] ) )
	{
		//k = runtime.ancestors[ runtime.depth ].length ;
		
		// Set the key now!
		//runtime.ancestorKeys[ runtime.depth ] = k ;
		
		runtime.ancestors[ runtime.depth ][ k ] = v ;
		runtime.ancestors[ runtime.depth + 1 ] = v ;
	}
	else
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected array element (" + runtime.lineNumber + ")" ) ;
	}
}



function parentObjectKV( k , v , runtime )
{
	if (
		runtime.ancestors[ runtime.depth ] &&
		typeof runtime.ancestors[ runtime.depth ] === 'object' &&
		! Array.isArray( runtime.ancestors[ runtime.depth ] )
	)
	{
		runtime.ancestors[ runtime.depth ][ k ] = v ;
		runtime.ancestors[ runtime.depth + 1 ] = v ;
	}
	else
	{
		//console.log( runtime ) ;
		throw new SyntaxError( "Unexpected key/value pair (" + runtime.lineNumber + ")" ) ;
	}
}



function parentLink( runtime )
{
	if ( runtime.depth > 0 )
	{
		//try {
		runtime.ancestors[ runtime.depth - 1 ][ runtime.ancestorKeys[ runtime.depth - 1 ] ] = runtime.ancestors[ runtime.depth ] ;
		//} catch ( error ) { console.log( runtime ) ; throw error ; }
	}
}



function parseMaybeUnquotedKey( str , runtime )
{
	var j , v ;
	
	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ )
	{
		if ( str[ j ] === ':' )
		{
			v = str.slice( runtime.i , j ).trim() ;
			runtime.i = j + 1 ;
			return v ;
		}
	}
}	



function parseUnquotedString( str , runtime )
{
	var v = str.slice( runtime.i , runtime.iEndOfLine ).trim() ;
	runtime.i = runtime.iEndOfLine ;
	return v ;
}	



function parseQuotedString( str , runtime )
{
	var c , j = runtime.i , l = runtime.iEndOfLine , v = '' ;
	
	for ( ; j < l ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		
		// This construct is intended: this is much faster (15%)
		if ( c === 0x22 || c === 0x5c || c <= 0x1f )
		{
			if ( c === 0x22	)	// double quote = end of the string
			{
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				return v ;
			}
			else if ( c === 0x5c )	// backslash
			{
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				v += parseBackSlash( str , runtime ) ;
				j = runtime.i - 1 ;
			}
			else if ( c <= 0x1f )	// illegal
			{
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + runtime.lineNumber + ")" ) ;
			}
		}
	}
}



var parseBackSlashLookup_ = 
( function createParseBackSlashLookup()
{
	var c = 0 , lookup = new Array( 0x80 ) ;
	
	for ( ; c < 0x80 ; c ++ )
	{
		if ( c === 0x62 )	// b
		{
			lookup[ c ] = '\b' ;
		}
		else if ( c === 0x66 )	// f
		{
			lookup[ c ] = '\f' ;
		}
		else if ( c === 0x6e )	// n
		{
			lookup[ c ] = '\n' ;
		}
		else if ( c === 0x72 )	// r
		{
			lookup[ c ] = '\r' ;
		}
		else if ( c === 0x74 )	// t
		{
			lookup[ c ] = '\t' ;
		}
		else if ( c === 0x5c )	// backslash
		{
			lookup[ c ] = '\\' ;
		}
		else if ( c === 0x2f )	// slash
		{
			lookup[ c ] = '/' ;
		}
		else if ( c === 0x22 )	// double-quote
		{
			lookup[ c ] = '"' ;
		}
		else
		{
			lookup[ c ] = '' ;
		}
	}
	
	return lookup ;
} )() ;



function parseBackSlash( str , runtime )
{
	var v , c = str.charCodeAt( runtime.i ) ;
	
	if ( runtime.i >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }
	
	if ( c === 0x75 )	// u
	{
		runtime.i ++ ;
		v = parseUnicode( str , runtime ) ;
		return v ;
	}
	else if ( ( v = parseBackSlashLookup_[ c ] ).length )
	{
		runtime.i ++ ;
		return v ;
	}
	else
	{
		throw new SyntaxError( 'Unexpected token: "' + str[ runtime.i ] + '" (' + runtime.lineNumber + ")" ) ;
	}
}



function parseUnicode( str , runtime )
{
	if ( runtime.i + 3 >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }
	
	var match = str.slice( runtime.i , runtime.i + 4 ).match( /[0-9a-f]{4}/ ) ;
	
	if ( ! match ) { throw new SyntaxError( "Unexpected " + str.slice( runtime.i , runtime.i + 4 ) + " (" + runtime.lineNumber + ")" ) ; }
	
	runtime.i += 4 ;
	
	// Or String.fromCodePoint() ?
	return String.fromCharCode( Number.parseInt( match[ 0 ] , 16 ) ) ;
}



var constants = {
	"object": {} ,
	"array": [] ,
	"null": null ,
	"true": true ,
	"false": false ,
	"on": true ,
	"off": false ,
	"yes": true ,
	"no": false ,
	"NaN": NaN ,
	"Infinity": Infinity ,
	"-Infinity": - Infinity ,
//	"...": null ,
} ;  
                                                    


function parseValue( str , runtime )
{
	var c , v ;
	
	c = str.charCodeAt( runtime.i ) ;
	
	if ( c >= 0x30 && c <= 0x39 )	// digit
	{
		return parseNumber( str , runtime ) ;
	}
	else
	{
		switch ( c )
		{
			case 0x2d :	// - minus
				c = str.charCodeAt( runtime.i + 1 ) ;
				if ( c >= 0x30 && c <= 0x39 )	// digit
				{
					return parseNumber( str , runtime ) ;
				}
				else
				{
					v = parseUnquotedString( str , runtime ) ;
					if ( v in constants ) { v = constants[ v ] ; }
					return v ;
				}
				break ;	// to please jshint
			
			case 0x22 :	// "   double-quote: this is a string
				runtime.i ++ ;
				return parseQuotedString( str , runtime ) ;
			
			default :
				v = parseUnquotedString( str , runtime ) ;
				if ( v in constants ) { v = constants[ v ] ; }
				return v ;
		}
	}
}



var numberRegex_ = /^(-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?)\s*$/ ;

function parseNumber( str , runtime )
{
	// We are here because a digit or a minus triggered parseNumber(), so we assume that the regexp always match
	var part = str.slice( runtime.i , runtime.iEndOfLine ) ;
	
	if ( numberRegex_.test( part ) )
	{
		runtime.i = runtime.iEndOfLine ;
		return parseFloat( part ) ;
	}
	else
	{
		return parseUnquotedString( str , runtime ) ;
	}
}



