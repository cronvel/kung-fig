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


function parse( str )
{
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length ,
		attributes: {}
	} ;
	
	parseLines( str , runtime ) ;
	
	return runtime.ancestors[ 0 ] ;
}



module.exports = parse ;



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
	setParentObject( runtime ) ;
	
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
		
		setParentObjectKV( k , v , runtime ) ;
		return ;
	}
	
	if ( ! op && treeOps.reservedKeyStart[ k[ 0 ] ] )
	{
		// The key contains an operator mark, escape it by prepending an empty operator
		k = '()' + k ;
	}
	
	v = parseValue( str , runtime , true ) ;
	setParentObjectKV( k , v , runtime ) ;
}



// Skip spaces
function parseSpaces( str , runtime )
{
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
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
					if ( v in constants ) { v = constants[ v ] ; }
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
				if ( v in constants ) { v = constants[ v ] ; }
				return v ;
		}
	}
}



