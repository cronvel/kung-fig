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



var treeOps = require( './treeOps.js' ) ;



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
		ancestorKeys: [] ,
		ancestorInstanceOf: [] ,
		ancestorTags: [] ,
		customConstructors: options.customConstructors ,
		tagMode: !! options.tagMode ,
		customTags: options.customTags
	} ;
	
	if ( typeof str !== 'string' )
	{
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}
	
	parseLines( str , runtime ) ;
	
	// Call depthManagement() one last time, because some instanceOf may still be hanging...
	runtime.depth = 0 ;
	depthManagement( runtime ) ;
	
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
	var j ;
	
	//console.log( ">>> depthManagement:" , runtime.lastDepth , runtime.depth ) ;
	
	if ( runtime.depth === runtime.lastDepth )
	{
		if ( runtime.ancestorInstanceOf[ runtime.depth ] ) { construct( runtime , runtime.depth ) ; }
		else if ( runtime.ancestorTags[ runtime.depth ] ) { constructTag( runtime , runtime.depth ) ; }
	}
	else if ( runtime.depth < runtime.lastDepth )
	{
		for ( j = runtime.lastDepth ; j >= runtime.depth ; j -- )
		{
			if ( runtime.ancestorInstanceOf[ j ] ) { construct( runtime , j ) ; }
			else if ( runtime.ancestorTags[ j ] ) { constructTag( runtime , j ) ; }
		}
	}
	//else if ( runtime.depth === runtime.lastDepth + 1 ) {}
	else if ( runtime.depth !== runtime.lastDepth + 1 )
	//else
	{
		throw new SyntaxError( "Unexpected indentation: deeper than its parent + 1 (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.ancestors.length = runtime.depth + 1 ;
	runtime.ancestorKeys.length = runtime.depth + 1 ;
	
	if ( runtime.depth >= 0 )
	{
		runtime.ancestorInstanceOf.length = runtime.depth ;
		runtime.ancestorTags.length = runtime.depth ;
	}
}



function parseLineContent( str , runtime )
{
	/*
		Types of lines:
			- list entry (array) has a '-' after indentation
			- text lines has a '>' after indentation
			- properties (object) has a ':' somewhere after the key
			- in tag-mode implicit list entry (array) has a '[' after indentation
			- ??allow direct scalar values??
	*/
	
	if ( str[ runtime.i ] === '-' )
	{
		parseArrayElement( str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '>' )
	{
		parseStringLine( str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '(' )
	{
		parseAfterKey( '' , str , runtime ) ;
	}
	else if ( runtime.tagMode && str[ runtime.i ] === '[' )
	{
		parseTag( str , runtime ) ;
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
		parentLink( runtime , runtime.depth ) ;
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
		
		return ;
	}
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	// /!\ What about operators for an array element?
	
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
	var op , v ;
	
	parseSpaces( str , runtime ) ;
	
	// If the parent is still undefined, now we know for sure that this is an object
	if ( runtime.ancestors[ runtime.depth ] === undefined )
	{
		runtime.ancestors[ runtime.depth ] = {} ;
		parentLink( runtime , runtime.depth ) ;
	}
	
	if ( str[ runtime.i ] === '(' )
	{
		// This is an operator
		op = parseOperator( str , runtime ) ;
		
		if ( ! op || treeOps.reservedOperators[ op ] ) { k = op + k ; }
		else { k = '(' + op + ')' + k ; }
		
		parseSpaces( str , runtime ) ;
	}
	
	runtime.ancestorKeys[ runtime.depth ] = k ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	runtime.ancestors[ runtime.depth + 1 ] = undefined ;
	
	// This is the easiest way to have include, it is prepended to the key
	if ( str[ runtime.i ] === '@' )
	{
		// This is an include
		op = parseInclude( str , runtime ) ;
		k = op + k ;
		
		if ( str[ runtime.i ] === '"' ) { v = parseQuotedString( str , runtime ) ; }
		else { v = parseUnquotedString( str , runtime ) ; }
		
		parentObjectKV( k , v , runtime ) ;
		return ;
	}
	
	if ( ! op && treeOps.reservedKeyStart[ k[ 0 ] ] )
	{
		// The key contains an operator mark, escape it by prepending an empty operator
		k = '()' + k ;
	}
	
	v = parseValue( str , runtime , true ) ;
	parentObjectKV( k , v , runtime ) ;
}



function parseStringLine( str , runtime )
{
	runtime.i ++ ;
	
	// If the parent is still undefined, now we know for sure that this is a string
	if ( runtime.ancestors[ runtime.depth ] === undefined )
	{
		runtime.ancestors[ runtime.depth ] = '' ;
		parentLink( runtime , runtime.depth ) ;
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
		parentLink( runtime , runtime.depth ) ;
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



function parentTagContainerKV( k , v , runtime )
{
	if ( runtime.ancestors[ runtime.depth ] instanceof TagContainer )
	{
		//k = runtime.ancestors[ runtime.depth ].length ;
		
		// Set the key now!
		//runtime.ancestorKeys[ runtime.depth ] = k ;
		
		runtime.ancestors[ runtime.depth ].children[ k ] = v ;
		runtime.ancestors[ runtime.depth + 1 ] = v ;
	}
	else
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected tag (" + runtime.lineNumber + ")" ) ;
	}
}



function parentLink( runtime , depth )
{
	if ( depth > 0 )
	{
		//try {
		runtime.ancestors[ depth - 1 ][ runtime.ancestorKeys[ depth - 1 ] ] = runtime.ancestors[ depth ] ;
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



function parseIntroducedString( str , runtime )
{
	var v ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return '' ; }
	
	if ( str[ runtime.i ] !== ' ' )
	{
		throw new SyntaxError( "Expected a space ' ' after the '>', but got '" + str[ runtime.i ] + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.i ++ ;
	
	v = str.slice( runtime.i , runtime.iEndOfLine ) ;
	
	runtime.i = runtime.iEndOfLine ;
	
	return v ;
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
	"object": function() { return {} ; } ,
	"array": () => [] ,
	"null": () => null ,
	"true": () => true ,
	"false": () => false ,
	"on": () => true ,
	"off": () => false ,
	"yes": () => true ,
	"no": () => false ,
	"NaN": () => NaN ,
	"Infinity": () => Infinity ,
	"-Infinity": () => - Infinity ,
//	"...": null ,
} ;  
                                                    


function parseOperator( str , runtime )
{
	var c , op , j ;
	
	runtime.i ++ ;
	
	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		
		if ( c === 0x29 )	// closing parenthesis
		{
			op = str.slice( runtime.i , j ).trim() ;
			runtime.i = j + 1 ;
			return op ;
		}
	}
	
	throw new SyntaxError( "Unexpected end of line, expecting a closing parenthesis (" + runtime.lineNumber + ")" ) ;
}



function parseInstanceOf( str , runtime )
{
	var c , j ;
	
	runtime.i ++ ;
	
	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		
		if ( c === 0x3e )	// > greater than sign, closing the instanceOf
		{
			runtime.ancestorInstanceOf[ runtime.depth ] = str.slice( runtime.i , j ).trim() ;
			runtime.i = j + 1 ;
			return ;
		}
	}
	
	throw new SyntaxError( "Unexpected end of line, expecting a 'greater-than' sign (" + runtime.lineNumber + ")" ) ;
}



function parseInclude( str , runtime )
{
	runtime.i ++ ;
	
	if ( str[ runtime.i ] === '@' )
	{
		runtime.i ++ ;
		return '@@' ;
	}
	
	return '@' ;
}



function parseValue( str , runtime , noInclude , afterInstanceOf )
{
	var c , v , op , instanceOf ;
	
	c = str.charCodeAt( runtime.i ) ;
	
	if ( c >= 0x30 && c <= 0x39 )	// digit
	{
		return parseNumber( str , runtime ) ;
	}
	else if ( c === 0x3c && ! afterInstanceOf )	// <   lesser-than sign: this introduce an instanceOf
	{
		instanceOf = parseInstanceOf( str , runtime ) ;
		parseSpaces( str , runtime ) ;
		
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }
		
		return parseValue( str , runtime , noInclude , true ) ;
	}
	else if ( c === 0x40 && ! noInclude )	// @   sign: this introduce an include
	{
		// This is an include
		op = parseInclude( str , runtime ) ;
		v = {} ;
		
		if ( str[ runtime.i ] === '"' ) { v[ op ] = parseQuotedString( str , runtime ) ; }
		else { v[ op ] = parseUnquotedString( str , runtime ) ; }
		
		return v ;
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
					if ( v in constants ) { v = constants[ v ]() ; }
					return v ;
				}
				break ;	// to please jshint
			
			case 0x22 :	// "   double-quote: this is a string
				runtime.i ++ ;
				return parseQuotedString( str , runtime ) ;
			
			case 0x3e :	// >   greater-than: this is a string
				runtime.i ++ ;
				return parseIntroducedString( str , runtime ) ;
			
			default :
				v = parseUnquotedString( str , runtime ) ;
				if ( v in constants ) { v = constants[ v ]() ; }
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



function parseTag( str , runtime )
{
	var k , v ;
	
	runtime.i ++ ;
	
	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		
		if ( c === 0x5d )	// ] closing bracket, closing the tag
		{
			runtime.ancestorTags[ runtime.depth ] = str.slice( runtime.i , j ).trim() ;
			runtime.i = j + 1 ;
			
			// Manage index/key
			if ( runtime.ancestorKeys[ runtime.depth ] === undefined )
			{
				k = runtime.ancestorKeys[ runtime.depth ] = 0 ;
			}
			else
			{
				k = ++ runtime.ancestorKeys[ runtime.depth ] ;
			}
			
			// If the parent is still undefined, now we know for sure that this is a TagContainer
			if ( runtime.ancestors[ runtime.depth ] === undefined )
			{
				runtime.ancestors[ runtime.depth ] = TagContainer.create() ;
				parentLink( runtime , runtime.depth ) ;
			}
			
			if ( runtime.i >= runtime.iEndOfLine ) { return ; }
			
			v = parseValue( str , runtime ) ;
			parentTagContainerKV( k , v , runtime ) ;
			
			return  ;
		}
	}
	
	throw new SyntaxError( "Unexpected end of line, expecting a ']' sign (" + runtime.lineNumber + ")" ) ;
}



function construct( runtime , depth )
{
	var match , instanceOf ,
		v = runtime.ancestors[ depth ][ runtime.ancestorKeys[ depth ] ] ;
	
	//console.log( "construct() called:" , depth , runtime.ancestorInstanceOf[ depth ] , v ) ;
	
	instanceOf = runtime.ancestorInstanceOf[ depth ] ;
	
	if ( builtin[ instanceOf ] )
	{
		try {
			v = builtin[ instanceOf ]( v ) ;
		}
		catch ( error ) {
			throw new SyntaxError( "Cannot construct '" + instanceOf + "' with those data (" + runtime.lineNumber + ")" ) ;
		}
	}
	else if ( typeof runtime.customConstructors[ instanceOf ] === 'function' )
	{
		try {
			v = runtime.customConstructors[ instanceOf ]( v ) ;
		}
		catch ( error ) {
			//console.log( error ) ;
			throw new SyntaxError( "Cannot construct custom '" + instanceOf + "' with those data (" + runtime.lineNumber + ")" ) ;
		}
	}
	else
	{
		throw new SyntaxError( "Don't know how to construct '" + instanceOf + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.ancestors[ depth ][ runtime.ancestorKeys[ depth ] ] = v ;
	
	// /!\ Still needed? see the end of depthManagement()
	// Reset that instanceOf since they are set on the parent (because the child is not always an object/array)
	//runtime.ancestorInstanceOf[ depth ] = undefined ;
	
	//parentLink( runtime , depth ) ;
}



function constructTag( runtime , depth )
{
	var match , tag , attributes ,
		v = runtime.ancestors[ depth ][ runtime.ancestorKeys[ depth ] ] ;
	
	//console.log( "constructTag() called:" , depth , runtime.ancestorInstanceOf[ depth ] , v ) ;
	
	attributes = runtime.ancestorTags[ depth ].split( / +/ ) ;
	tag = attributes.shift() ;
	
	if ( typeof runtime.customTags[ tag ] === 'function' )
	{
		try {
			v = runtime.customTags[ tag ]( attributes , v ) ;
		}
		catch ( error ) {
			//console.log( error ) ;
			throw new SyntaxError( "Cannot construct custom tag '" + tag + "' with those data (" + runtime.lineNumber + ")" ) ;
		}
	}
	else
	{
		try {
			v = Tag.create( tag , attributes , v ) ;
		}
		catch ( error ) {
			throw new SyntaxError( "Cannot construct tag '" + tag + "' with those data (" + runtime.lineNumber + ")" ) ;
		}
	}
	
	runtime.ancestors[ depth ][ runtime.ancestorKeys[ depth ] ] = v ;
	
	// /!\ Still needed? see the end of depthManagement()
	// Reset that tag since they are set on the parent (because the child is not always an object/array)
	//runtime.ancestorInstanceOf[ depth ] = undefined ;
	
	//parentLink( runtime , depth ) ;
}



function Tag() { throw new Error( "Use Tag.create() instead." ) ; }
Tag.prototype.__prototypeUID__ = 'kung-fig/Tag' ;



Tag.create = function createTag( tag , attributes , value )
{
	var self = Object.create( Tag.prototype , {
		name: { value: tag , enumerable: true } ,
		attributes: { value: tag , enumerable: true } ,
		value: { value: value , enumerable: true }
	} ) ;
	
	return self ;
} ;



function TagContainer() { throw new Error( "Use TagContainer.create() instead." ) ; }
TagContainer.prototype.__prototypeUID__ = 'kung-fig/TagContainer' ;



TagContainer.create = function createTagContainer()
{
	var self = Object.create( TagContainer.prototype , {
		children: { value: [] , enumerable: true }
	} ) ;
	
	return self ;
} ;



var builtin = {} ;

builtin.bin16 = builtin.bin = function bin16( v )
{
	return new Buffer( v , 'hex' ) ;
} ;

builtin.date = builtin.Date = function date( v )
{
	return new Date( v ) ;
} ;

builtin.regex = builtin.Regex = builtin.regexp = builtin.Regexp = builtin.RegExp = function regex( v )
{
	var match = v.match( /^\/([^]+)\/([a-z])*$/ ) ;
	if ( ! match ) { throw new SyntaxError( "Bad Regular Expression" ) ; }
	return new RegExp( match[ 1 ] , match[ 2 ] ) ;
} ;


