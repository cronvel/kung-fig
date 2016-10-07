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



var Dynamic = require( './Dynamic.js' ) ;



function Expression( expression ) { return Expression.create( expression ) ; }
Expression.prototype = Object.create( Dynamic.prototype ) ;
Expression.prototype.constructor = Expression ;

module.exports = Expression ;

Expression.prototype.__prototypeUID__ = 'kung-fig/Expression' ;
Expression.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



// Circular reference trouble, should require after the module.exports assignement
var kfgParse = require( './kfgParse.js' ) ;



Expression.create = function create( fnOperator , args )
{
	var self = Object.create( Expression.prototype , {
		fnOperator: { value: fnOperator , writable: true , enumerable: true } ,
		args: { value: args , writable: true , enumerable: true }
	} ) ;
	
	//self.parse( expression ) ;
	
	return self ;
} ;



Expression.prototype.getValue = Expression.prototype.get = function getFinalValue( ctx )
{
	if ( ! this.__isDynamic__ ) { return this ; }
	return this.fnOperator( this.fnOperator.solveArgs ? this.fnOperator.solveArgs.call( this , ctx ) : this.solveArgs( ctx ) ) ;
} ;



Expression.prototype.apply = function apply( ctx )
{
	if ( ! this.__isApplicable__ ) { return this ; }
	return this.fnOperator( this.fnOperator.solveArgs ? this.fnOperator.solveArgs.call( this , ctx ) : this.solveArgs( ctx ) ) ;
} ;



// Should getValue() and getFinalValue() be the same?
Expression.prototype.getFinalValue = Expression.prototype.getValue ;



Expression.prototype.solveArgs = function solveArgs( ctx )
{
	return this.args.map( e => e && typeof e === 'object' && e.__isDynamic__ ? e.getFinalValue( ctx ) : e ) ;
} ;



Expression.parseFromKfg = function parseFromKfg( str , runtime )
{
	var expression = parseExpression( str , runtime ) ;
	return expression ;
} ;



Expression.parse = function parse( str , operators )
{
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length ,
		depth: 0 ,
		operators: operators || {}
	} ;
	
	var expression = parseExpression( str , runtime ) ;
	
	return expression ;
} ;



function parseExpression( str , runtime )
{
	var part , args = [] , lastCommaPos = 0 , hasOp = false , hasComma = false ;
	
	while ( runtime.i < runtime.iEndOfLine )
	{
		parseSpaces( str , runtime ) ;
		
		if ( str[ runtime.i ] === ')' ) { runtime.i ++ ; break ; }
		
		if ( str[ runtime.i ] === ',' )
		{
			hasComma = true ;
			part = args.splice( lastCommaPos ) ;
			args.push( fromArguments( part ) ) ;
			lastCommaPos = args.length ;
			runtime.i ++ ;
			continue ;
		}
		
		part = parseArgument( str , runtime ) ;
		args.push( part ) ;
		
		if ( ! hasOp && args.length <= 2 && typeof part === 'function' )
		{
			hasOp = true ;
			lastCommaPos = args.length ;
		}
	}
	
	// There was a comma, stack all remaining data from the last one
	if ( hasComma )
	{
		part = args.splice( lastCommaPos ) ;
		args.push( fromArguments( part ) ) ;
	}
	
	return fromArguments( args ) ;
}	


function fromArguments( args )
{
	var fnOperator ;
	
	if ( ! args.length ) { return ; }
	
	if ( typeof args[ 0 ] === 'function' )
	{
		fnOperator = args[ 0 ] ;
		
		// We remove arguments that are identical to the operator, case like: 1 + 2 + 3 + ...
		args = args.filter( e => e !== fnOperator ) ;
		return Expression.create( fnOperator , args ) ;
	}
	else if ( typeof args[ 1 ] === 'function' )
	{
		fnOperator = args[ 1 ] ;
		
		// We remove arguments that are identical to the operator, case like: 1 + 2 + 3 + ...
		args = args.filter( e => e !== fnOperator ) ;
		return Expression.create( fnOperator , args ) ;
	}
	else if ( args.length === 1 )
	{
		return args[ 0 ] ;
	}
	else
	{
		return args ;
	}
}



// Skip spaces
function parseSpaces( str , runtime )
{
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
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
				//runtime.i ++ ;
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
	var indexOf ;
	
	str = str.slice( runtime.i , runtime.iEndOfLine ) ;
	
	if ( ( indexOf = str.indexOf( ' ' ) ) !== -1 ) { str = str.slice( 0 , indexOf ) ; }
	
	if ( ! numberRegex_.test( str ) ) { throw new SyntaxError( "Expecting a number, but got: '" + str + "'" ) ; }
	
	runtime.i += str.length ;
	
	return parseFloat( str ) ;
}



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
	else if ( runtime.operators[ str ] )
	{
		return runtime.operators[ str ] ;
	}
	
	throw new SyntaxError( "Unexpected '" + str + "' in expression" ) ;
}



			/* Operators */



var fnOperators = {} ;

fnOperators.add = fnOperators['+'] = function add( args )
{
	//console.log( "op +" , args ) ;
	var sum = 0 ;
	args.forEach( e => sum += + e ) ;
	return sum ;
} ;

fnOperators.sub = fnOperators['-'] = function sub( args )
{
	if ( args.length === 1 ) { return - args[ 0 ] ; }	// unary minus
	
	var i = 1 , iMax = args.length , v ;
	
	v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v -= + args[ i ] ; }
	return v ;
} ;

fnOperators.mul = fnOperators['*'] = function mul( args )
{
	//console.log( "op +" , args ) ;
	var v = 1 ;
	args.forEach( e => v *= + e ) ;
	return v ;
} ;

fnOperators.div = fnOperators['/'] = function div( args )
{
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v /= + args[ i ] ; }
	return v ;
} ;

fnOperators.modulo = fnOperators['%'] = function modulo( args )
{
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v = v % ( + args[ i ] ) ; }
	return v ;
} ;

fnOperators['>'] = function gt( args ) { return args[ 0 ] > args[ 1 ] ; } ;
fnOperators['>='] = function gte( args ) { return args[ 0 ] >= args[ 1 ] ; } ;
fnOperators['<'] = function lt( args ) { return args[ 0 ] < args[ 1 ] ; } ;
fnOperators['<='] = function lte( args ) { return args[ 0 ] <= args[ 1 ] ; } ;
fnOperators['='] = fnOperators['=='] = fnOperators['==='] = function eq( args ) { return args[ 0 ] === args[ 1 ] ; } ;
fnOperators['!='] = fnOperators['!=='] = function notEq( args ) { return args[ 0 ] !== args[ 1 ] ; } ;

fnOperators.not = fnOperators['!'] = function not( args ) { return ! args[ 0 ] ; } ;
fnOperators['||'] = function or( args ) { return args[ 0 ] || args[ 1 ] ; } ;
fnOperators['&&'] = function and( args ) { return args[ 0 ] && args[ 1 ] ; } ;
fnOperators['?'] = function ternary( args ) { return args[ 0 ] ? args[ 1 ] : args[ 2 ] ; } ;

fnOperators.round = function round( args )
{
	if ( args.length <= 1 ) { return Math.round( args[ 0 ] ) ; }
	return args[ 1 ] * Math.round( args[ 0 ] / args[ 1 ] ) ;
} ;

fnOperators.floor = function floor( args )
{
	if ( args.length <= 1 ) { return Math.floor( args[ 0 ] ) ; }
	return args[ 1 ] * Math.floor( args[ 0 ] / args[ 1 ] ) ;
} ;

fnOperators.ceil = function ceil( args )
{
	if ( args.length <= 1 ) { return Math.ceil( args[ 0 ] ) ; }
	return args[ 1 ] * Math.ceil( args[ 0 ] / args[ 1 ] ) ;
} ;

fnOperators.trunc = function trunc( args )
{
	if ( args.length <= 1 ) { return Math.trunc( args[ 0 ] ) ; }
	return args[ 1 ] * Math.trunc( args[ 0 ] / args[ 1 ] ) ;
} ;

fnOperators.sign = function sign( args ) { return Math.sign( args[ 0 ] ) ; } ;
fnOperators.abs = function abs( args ) { return Math.abs( args[ 0 ] ) ; } ;

fnOperators.max = function max( args ) { return Math.max.apply( Math , args ) ; } ;
fnOperators.min = function min( args ) { return Math.min.apply( Math , args ) ; } ;

fnOperators.pow = fnOperators['^'] = function pow( args ) { return Math.pow( args[ 0 ] , args[ 1 ] ) ; } ;
fnOperators.exp = function exp( args ) { return Math.exp( args[ 0 ] ) ; } ;
fnOperators.log = function log( args ) { return Math.log( args[ 0 ] ) ; } ;
fnOperators.log2 = function log2( args ) { return Math.log2( args[ 0 ] ) ; } ;
fnOperators.log10 = function log10( args ) { return Math.log10( args[ 0 ] ) ; } ;
fnOperators.sqrt = function sqrt( args ) { return Math.sqrt( args[ 0 ] ) ; } ;

fnOperators.cos = function cos( args ) { return Math.cos( args[ 0 ] ) ; } ;
fnOperators.sin = function sin( args ) { return Math.sin( args[ 0 ] ) ; } ;
fnOperators.tan = function tan( args ) { return Math.tan( args[ 0 ] ) ; } ;
fnOperators.acos = function acos( args ) { return Math.acos( args[ 0 ] ) ; } ;
fnOperators.asin = function asin( args ) { return Math.asin( args[ 0 ] ) ; } ;
fnOperators.atan = function atan( args ) { return Math.atan( args[ 0 ] ) ; } ;
fnOperators.atan2 = function atan2( args ) { return Math.atan2( args[ 0 ] , args[ 1 ] ) ; } ;

fnOperators.hypot = function hypot( args ) { return Math.hypot.apply( Math , args ) ; } ;



// Array creation operator
fnOperators.array = function array( args ) { return args ; } ;



fnOperators['is-set?'] = function isSet( args ) { return args[ 0 ] !== undefined ; } ;
fnOperators['is-number?'] = function isNumber( args ) { return typeof args[ 0 ] === 'number' ; } ;
fnOperators['is-string?'] = function isString( args ) { return typeof args[ 0 ] === 'string' ; } ;
fnOperators['is-boolean?'] = function isBoolean( args ) { return typeof args[ 0 ] === 'boolean' ; } ;
fnOperators['is-array?'] = function isArray( args ) { return Array.isArray( args[ 0 ] ) ; } ;

fnOperators['is-object?'] = function isObject( args )
{
	return args[ 0 ] && typeof args[ 0 ] === 'object' && ! Array.isArray( args[ 0 ] ) ;
} ;

fnOperators['is-real?'] = function isReal( args )
{
	return typeof args[ 0 ] === 'number' && ! Number.isNaN( args[ 0 ] ) && args[ 0 ] !== Infinity && args[ 0 ] !== -Infinity ;
} ;



fnOperators['???'] = function threeWay( args )
{
	if ( args[ 0 ] < 0 ) { return args[ 1 ] ; }
	else if ( args[ 0 ] > 0 ) { return args[ 3 ] ; }
	else { return args[ 2 ] ; }
} ;



fnOperators.avg = function avg( args )
{
	if ( args.length === 1 && Array.isArray( args[ 0 ] ) ) { args = args[ 0 ] ; }
	
	var sum = 0 ;
	args.forEach( e => sum += + e ) ;
	return sum / args.length ;
} ;



// Apply operator
fnOperators['->'] = function apply( args )
{
	if ( typeof args[ 0 ] !== 'function' ) { throw new SyntaxError( 'The apply operator needs a function as its left-hand-side operand' ) ; }
	return args[ 0 ].apply( undefined , args.slice( 1 ) ) ;
} ;

fnOperators['->'].solveArgs = function applySolveArgs( ctx )
{
	return this.args.map( ( e , i ) => e && typeof e === 'object' && e.__isDynamic__ ? e.getFinalValue( ctx , ! i ) : e ) ;
} ;



