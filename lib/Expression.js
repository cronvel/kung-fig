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
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length
	} ;
	
	var expression = parseExpression( str , runtime ) ;
	
	return expression ;
}

Expression.parse = parse ;



function parseExpression( str , runtime )
{
	var start , end , parts = [] ;
	
	while ( runtime.i < runtime.iEndOfLine )
	{
		parseSpaces( str , runtime ) ;
		
		start = runtime.i ;
		
		switch ( str[ runtime.i ] )
		{
			case '"' :
				runtime.i ++ ;
				parts.push( kfgParse.parseQuotedString( str , runtime ) ) ;
				break ;
			case '(' :
				parts.push( parseExpression( str , runtime ) ) ;
				break ;
			case ')' :
				return parts ;
			case '$' :
				parts.push( parseRef( str , runtime ) ) ;
				break ;
		}
	}
	
	return parts ;
} ;


// Skip spaces
function parseSpaces( str , runtime )
{
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}



