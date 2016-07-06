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



function Expression( expression , proxy ) { return Expression.create( expression , proxy ) ; }
module.exports = Expression ;



// Circular reference trouble, should require after the module.exports assignement
var kfgParse = require( './kfgParse.js' ) ;
//var tree = require( 'tree-kit' ) ;



Expression.prototype.__prototypeUID__ = 'kung-fig/Expression' ;
Expression.prototype.__prototypeVersion__ = require( '../package.json' ).version ;
Expression.prototype.__isDynamic__ = true ;



Expression.create = function create( fnOperator , args , proxy )
{
	var self = Object.create( Expression.prototype , {
		fnOperator: { value: fnOperator , writable: true , enumerable: true } ,
		args: { value: args , writable: true , enumerable: true } ,
		proxy: { value: proxy }
	} ) ;
	
	//self.parse( expression ) ;
	
	return self ;
} ;



// Should getValue() and getFinalValue() be the same?
Expression.prototype.getFinalValue = Expression.prototype.getValue = function getFinalValue()
{
	return this.fnOperator( this.args.map( e => e && typeof e === 'object' && e.__isDynamic__ ? e.getFinalValue() : e ) ) ;
} ;



Expression.parseFromKfg = function parseFromKfg( str , runtime )
{
	var expression = parseExpression( str , runtime ) ;
	return expression ;
} ;



Expression.parse = function parse( str , proxy )
{
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length ,
		depth: 0 ,
		ancestorTagProxies: [ proxy ]
	} ;
	
	var expression = parseExpression( str , runtime ) ;
	
	return expression ;
} ;



function parseExpression( str , runtime )
{
	var args = [] , fnOperator ;
	
	while ( runtime.i < runtime.iEndOfLine )
	{
		parseSpaces( str , runtime ) ;
		
		if ( str[ runtime.i ] === ')' ) { runtime.i ++ ; break ; }
		
		args.push( parseArgument( str , runtime ) ) ;
	}
	
	//console.log( ">>> args: " , args ) ;
	
	if ( ! args.length ) { return ; }
	
	if ( typeof args[ 0 ] === 'function' )
	{
		return Expression.create( args[ 0 ] , args.slice( 1 ) ) ;
	}
	else if ( typeof args[ 1 ] === 'function' )
	{
		fnOperator = args[ 1 ] ;
		args.splice( 1 , 1 ) ;
		return Expression.create( fnOperator , args ) ;
	}
	else if ( args.length === 1 )
	{
		return args [ 0 ] ;
	}
	
	throw new SyntaxError( "Bad expression: expression of more than one item should contains an operator." ) ;
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
	
	if ( ! numberRegex_.test( str ) ) { throw new SyntaxError( "Expecting a number, but got: " + str ) ; }
	
	runtime.i += str.length ;
	
	return parseFloat( str ) ;
}



var fnOperators = {} ;

fnOperators['+'] = function add( args )
{
	//console.log( "op +" , args ) ;
	var sum = 0 ;
	args.forEach( e => sum += + e ) ;
	return sum ;
} ;

fnOperators['-'] = function sub( args )
{
	var i = 1 , iMax = args.length , v ;
	
	if ( args.length === 1 ) { return - args[ 0 ] ; }	// unary minus
	
	v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v -= + args[ i ] ; }
	return v ;
} ;

fnOperators['*'] = function mul( args )
{
	//console.log( "op +" , args ) ;
	var v = 1 ;
	args.forEach( e => v *= + e ) ;
	return v ;
} ;

fnOperators['/'] = function div( args )
{
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v /= + args[ i ] ; }
	return v ;
} ;

fnOperators['%'] = function div( args )
{
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v = v % ( + args[ i ] ) ; }
	return v ;
} ;

fnOperators['>'] = function gt( args ) { return args[ 0 ] > args[ 1 ] ; } ;
fnOperators['>='] = function gte( args ) { return args[ 0 ] >= args[ 1 ] ; } ;
fnOperators['<'] = function lt( args ) { return args[ 0 ] < args[ 1 ] ; } ;
fnOperators['<='] = function lte( args ) { return args[ 0 ] <= args[ 1 ] ; } ;
fnOperators['=='] = function eq( args ) { return args[ 0 ] == args[ 1 ] ; } ;	// jshint ignore:line
fnOperators['!='] = function notEq( args ) { return args[ 0 ] != args[ 1 ] ; } ;	// jshint ignore:line

fnOperators['!'] = function not( args ) { return ! args[ 0 ] ; } ;
fnOperators['||'] = function or( args ) { return args[ 0 ] || args[ 1 ] ; } ;
fnOperators['&&'] = function and( args ) { return args[ 0 ] && args[ 1 ] ; } ;
fnOperators['?'] = function ternary( args ) { return args[ 0 ] ? args[ 1 ] : args[ 2 ] ; } ;



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



