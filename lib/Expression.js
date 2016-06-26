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
//var tree = require( 'tree-kit' ) ;



function Expression( expression , proxy ) { return Expression.create( expression , proxy ) ; }
module.exports = Expression ;

Expression.prototype.__prototypeUID__ = 'kung-fig/Expression' ;
Expression.prototype.__prototypeVersion__ = require( '../package.json' ).version ;
Expression.prototype.__isDynamic__ = true ;



Expression.create = function create( expression , proxy )
{
	if ( typeof expression !== 'string' ) { expression = null ; }
	
	var self = Object.create( Expression.prototype , {
		expression: { value: null , writable: true , enumerable: true } ,
		proxy: { value: proxy }
	} ) ;
	
	//self.parse( expression ) ;
	
	return self ;
} ;



function parse( str , runtime )
{
	runtime = runtime || {
		i: 0 ,
		iEndOfLine: str.length
	} ;
	
	var expression = parseExpression( str , runtime ) ;
	
	return expression ;
}

Expression.parse = parse ;



function parseExpression( str , runtime )
{
	var args = [] ;
	
	while ( runtime.i < runtime.iEndOfLine )
	{
		parseSpaces( str , runtime ) ;
		
		if ( str[ runtime.i ] === ')' ) { break ; }
		
		args.push( parseArgument( str , runtime ) ) ;
	}
	
	return args ;
}



function parseArgument( str , runtime )
{
	var c ;
	
	c = str.charCodeAt( runtime.i ) ;
	
	if ( c >= 0x30 && c <= 0x39 )	// digit
	{
		return parseNumber( str , runtime ) ;
	}
	
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
				return parseFnOrConstant( str , runtime ) ;
			}
			break ;	// to please jshint
		
		case 0x22 :	// "   double-quote: this is a string
			runtime.i ++ ;
			return kfgParse.parseQuotedString( str , runtime ) ;
		
		case 0x28 :	// (   open parenthesis: this is a sub-expression
			runtime.i ++ ;
			return parseExpression( str , runtime ) ;
		
		case 0x24 :	// $   dollar: maybe a Template or a Ref
			c = str.charCodeAt( runtime.i + 1 ) ;
			if ( c === 0x22 )
			{
				runtime.i += 2 ;
				return kfgParse.parseQuotedTemplate( str , runtime ) ;
			}
			else
			{
				runtime.i ++ ;
				return kfgParse.parseRef( str , runtime ) ;
			}
			break ;
			
		default :
			return parseFnOrConstant( str , runtime ) ;
	}
}



var numberRegex_ = /^(-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?)\s*$/ ;

function parseNumber( str , runtime )
{
	var indexOf , end = runtime.iEndOfLine ;
	
	if ( ( indexOf = str.indexOf( ' ' , runtime.i ) ) !== -1 ) { end = indexOf ; }
	
	str = str.slice( runtime.i , end ) ;
	
	console.log( runtime.i , end , indexOf ) ;
	if ( ! numberRegex_.test( str ) ) { throw new SyntaxError( "Expecting a number, but got: " + str ) ; }
	
	runtime.i += str.length ;
	
	return parseFloat( str ) ;
}



var fnOperators = {} ;

fnOperators['+'] = function add( a , b ) { return a + b ; } ;



function parseFnOrConstant( str , runtime )
{
	var indexOf ;
	
	str = str.slice( runtime.i , runtime.iEndOfLine ) ;
	
	if ( ( indexOf = str.indexOf( ' ' ) ) !== -1 ) { str = str.slice( 0 , indexOf ) ; }
	
	runtime.i += str.length ;
	
	if ( str in kfgParse.constants )
	{
		return kfgParse.constants[ str ] ;
	}
	else if ( fnOperators[ str ] )
	{
		return fnOperators[ str ] ;
	}
	
	throw new SyntaxError( "Unexpected '" + str + "' in expression" ) ;
}



// Skip spaces
function parseSpaces( str , runtime )
{
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}



