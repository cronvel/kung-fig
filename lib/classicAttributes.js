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



var kfgParse = require( './kfgParse.js' ) ;
var kfgStringify = require( './kfgStringify.js' ) ;



function stringify( attributes , keyValueSeparator )
{
	var str = '' , separator = '' , v ;
	
	keyValueSeparator = keyValueSeparator || '=' ;
	
	Object.keys( attributes ).forEach( key => {
		if ( ! keyRegex_.test( key ) ) { return ; }
		
		v = attributes[ key ] ;
		
		if ( typeof v === 'string' )
		{
			str += separator + key + keyValueSeparator + kfgStringify.stringifyQuotedString( v ) ;
		}
		else if ( typeof v === 'number' && ! Number.isNaN( v ) && v !== Infinity && v !== -Infinity )
		{
			str += separator + key + keyValueSeparator + v ;
		}
		else if ( v === true )
		{
			str += separator + key ;
		}
		else
		{
			return ;
		}
		
		separator = ' ' ;
	} ) ;
	
	return str ;
}

exports.stringify = stringify ;



function parse( str , keyValueSeparator )
{
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length ,
		attributes: {} ,
		keyValueSeparator: keyValueSeparator || '='
	} ;
	
	parseLoop( str , runtime ) ;
	
	return runtime.attributes ;
}

exports.parse = parse ;



function parseLoop( str , runtime )
{
	var key , value ;
	
	while ( runtime.i < runtime.iEndOfLine )
	{
		parseSpaces( str , runtime ) ;
		
		if ( ( key = parseKey( str , runtime ) ) )
		{
			parseSpaces( str , runtime ) ;
			value = parseValue( str , runtime ) ;
			runtime.attributes[ key ] = value ;
		}
	}
}



// Skip spaces
function parseSpaces( str , runtime )
{
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}



var keyRegex_ = /^[a-zA-Z0-9$_-]+$/ ;

function parseKey( str , runtime )
{
	var v , j = runtime.i ; 
	
	while ( j < runtime.iEndOfLine && str[ j ] !== ' ' && str[ j ] !== runtime.keyValueSeparator )
	{
		j ++ ;
	}
	
	v = str.slice( runtime.i , j ).trim() ;
	
	if ( ! v ) { throw new SyntaxError( "Unexpected empty attribute key" ) ; }
	else if ( ! keyRegex_.test( v ) ) { throw new SyntaxError( "Bad attribute key" ) ; }
	
	runtime.i = j ;
	parseSpaces( str , runtime ) ;
	
	if ( str[ runtime.i ] === runtime.keyValueSeparator )
	{
		runtime.i ++ ;
		return v ;
	}
	else
	{
		// This is a key without value, set it to true
		runtime.attributes[ v ] = true ;
	}
	
	return ;
}	



function parseValue( str , runtime )
{
	var c = str.charCodeAt( runtime.i ) ;
	
	if ( ( c >= 0x30 && c <= 0x39 ) || c === 0x2d )	// digit
	{
		return parseNumber( str , runtime ) ;
	}
	else if ( c === 0x22 )	// " double-quote: this is a string
	{
		runtime.i ++ ;
		return kfgParse.parseQuotedString( str , runtime ) ;
	}
	else
	{
		throw new SyntaxError( "Expecting a string or a number, but got '" + str[ runtime.i ] + "'" ) ;
	}
}



var numberRegex_ = /^(-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?)*$/ ;

function parseNumber( str , runtime )
{
	var indexOf ,
		part = str.slice( runtime.i , runtime.iEndOfLine ) ;
	
	if ( ( indexOf = part.indexOf( ' ' ) ) !== -1 ) { part = part.slice( 0 , indexOf ) ; }
	
	if ( numberRegex_.test( part ) )
	{
		runtime.i += part.length ;
		return parseFloat( part ) ;
	}
	else
	{
		throw new SyntaxError( "Expecting a number, but got '" + part + "'" ) ;
	}
}

