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



var tree = require( 'tree-kit' ) ;



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



function parse( str )
{
	str = str.trim() ;
	
	var runtime = {
		i: 0
	} ;
	
	var expression = parseExpression( str , runtime ) ;
	
	return expression ;
}

Expression.parse = parse ;



function parseExpression( str , runtime )
{
	var iMax = str.length , start , end , parts = [] ;
	
	while ( runtime.i < iMax )
	{
		start = runtime.i ;
		
		if ( str[ runtime.i ] === '"' )
		{
			throw new Error( "String in expression are not coded ATM" ) ;
		}
		else if ( str[ runtime.i ] === '(' )
		{
			parts.push( parseExpression( str.slice( i ) , runtime ) ) ;
		}
		else if ( str[ runtime.i ] === ')' )
		{
			return parts ;
		}
		
		end = str.indexOf( ' ' , runtime.i ) ;
		
		if ( end === -1 ) { end = iMax - 1 ; }
		
		// Eat spaces
		for ( ; runtime.i < iMax && str[ runtime.i ] === ' ' ; runtime.i ++ ) {}
	}
} ;



