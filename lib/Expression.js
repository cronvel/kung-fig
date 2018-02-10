/*
	Kung Fig

	Copyright (c) 2015 - 2017 Cédric Ronvel

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



var Dynamic = require( 'kung-fig-dynamic' ) ;
var Ref = require( 'kung-fig-ref' ) ;
//var Template = require( 'kung-fig-template' ) ;
var commonParsers = require( 'kung-fig-common-parsers' ) ;



function Expression( expression ) { return Expression.create( expression ) ; }
Expression.prototype = Object.create( Dynamic.prototype ) ;
Expression.prototype.constructor = Expression ;

module.exports = Expression ;

Expression.prototype.__prototypeUID__ = 'kung-fig/Expression' ;
Expression.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



// Circular reference trouble, should require after the module.exports assignement
var kfgParse = require( './kfgParse.js' ) ;



Expression.create = function create( fnOperator , args ) {
	var self = Object.create( Expression.prototype , {
		fnOperator: {
			value: fnOperator , writable: true , enumerable: true
		} ,
		args: {
			value: args , writable: true , enumerable: true
		}
	} ) ;

	//self.parse( expression ) ;

	return self ;
} ;



Expression.prototype.getValue = Expression.prototype.get = function getFinalValue( ctx ) {
	if ( ! this.__isDynamic__ ) { return this ; }
	return this.fnOperator( this.fnOperator.solveArgs ? this.fnOperator.solveArgs.call( this , ctx ) : this.solveArgs( ctx ) ) ;
} ;



Expression.prototype.apply = function apply( ctx ) {
	if ( ! this.__isApplicable__ ) { return this ; }
	return this.fnOperator( this.fnOperator.solveArgs ? this.fnOperator.solveArgs.call( this , ctx ) : this.solveArgs( ctx ) ) ;
} ;



// Should getValue() and getFinalValue() be the same?
Expression.prototype.getFinalValue = Expression.prototype.getValue ;



Expression.prototype.solveArgs = function solveArgs( ctx ) {
	return this.args.map( e => e && typeof e === 'object' && e.__isDynamic__ ? e.getFinalValue( ctx ) : e ) ;
} ;



Expression.parseFromKfg = function parseFromKfg( str , runtime ) {
	var expression = parseExpression( str , runtime ) ;
	return expression ;
} ;



Expression.parse = function parse( str , operators ) {
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length ,
		depth: 0 ,
		operators: operators || {}
	} ;

	var expression = parseExpression( str , runtime ) ;

	return expression ;
} ;



function parseExpression( str , runtime ) {
	var part , args = [] ,
		hasOp = null ,
		hasComma = false , lastComma = 0 , commaFirst = false ,
		hasColon = false , lastColon = 0 , colonFirst = false , colonCommaMode = false ;

	while ( runtime.i < runtime.iEndOfLine ) {
		parseSpaces( str , runtime ) ;

		// Parse space may reach the end of the line
		if ( runtime.i >= runtime.iEndOfLine ) { break ; }

		if ( str[ runtime.i ] === ')' ) { runtime.i ++ ; break ; }

		if ( str[ runtime.i ] === ':' ) {
			if ( hasOp && hasOp !== fnOperators[':'] ) {
				throw new SyntaxError( "Ambiguous object syntax, unexpected ':', try surrounding the object with parenthesis ()" ) ;
			}

			if ( ! hasComma ) { colonFirst = true ; }

			if ( colonCommaMode ) {
				//console.log( 'squeeze by colon' , lastComma , args ) ;
				part = args.splice( lastComma ) ;
				args.push( fromArguments( part ) ) ;
				lastComma = args.length ;
				runtime.i ++ ;

				hasComma = true ;
				continue ;
			}

			hasColon = true ;
			lastColon = args.length + 1 ;
			if ( ! commaFirst ) { lastComma = lastColon ; }
		}

		if ( str[ runtime.i ] === ',' ) {
			if ( ! hasColon ) { commaFirst = true ; }
			if ( colonFirst ) { colonCommaMode = true ; }

			//console.log( 'squeeze by comma' , lastComma , args ) ;
			hasComma = true ;
			part = args.splice( lastComma ) ;
			args.push( fromArguments( part ) ) ;
			lastComma = args.length ;
			runtime.i ++ ;

			continue ;
		}

		part = parseArgument( str , runtime ) ;
		args.push( part ) ;

		if ( ! hasOp && args.length <= 2 && typeof part === 'function' ) {
			hasOp = part ;
			lastComma = args.length ;
		}
	}

	// There was a comma or colon, stack all remaining data from the last one
	if ( hasComma ) {
		//console.log( '\n\nhasComma lastColon/lastComma/args:' , lastColon , lastComma , args ) ;
		part = args.splice( lastComma ) ;
		args.push( fromArguments( part ) ) ;
	}
	else if ( hasColon ) {
		//console.log( '\n\nhasColon lastColon/lastComma/args:' , lastColon , lastComma , args ) ;
		part = args.splice( lastColon ) ;
		args.push( fromArguments( part ) ) ;
	}

	return fromArguments( args ) ;
}



function fromArguments( args ) {
	var fnOperator ;

	if ( ! args.length ) { return ; }

	if ( typeof args[ 0 ] === 'function' ) {
		fnOperator = args[ 0 ] ;

		// We remove arguments that are identical to the operator, case like: 1 + 2 + 3 + ...
		args = args.filter( e => e !== fnOperator ) ;
		return Expression.create( fnOperator , args ) ;
	}

	if ( typeof args[ 1 ] === 'function' ) {
		fnOperator = args[ 1 ] ;

		// We remove arguments that are identical to the operator, case like: 1 + 2 + 3 + ...
		args = args.filter( e => e !== fnOperator ) ;
		return Expression.create( fnOperator , args ) ;
	}

	if ( args.length === 1 ) {
		args = args[ 0 ] ;

		if ( Array.isArray( args ) ) {
			return Expression.create( fnOperators.array , args ) ;
		}

		return args ;
	}

	return Expression.create( fnOperators.array , args ) ;
}



// Skip spaces
function parseSpaces( str , runtime ) {
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}



function parseArgument( str , runtime ) {
	var c ;

	c = str.charCodeAt( runtime.i ) ;

	if ( c >= 0x30 && c <= 0x39 ) {
		// digit
		return parseNumber( str , runtime ) ;
	}

	switch ( c ) {

		case 0x2d :	// - minus
			c = str.charCodeAt( runtime.i + 1 ) ;
			if ( c >= 0x30 && c <= 0x39 ) {
				// digit
				return parseNumber( str , runtime ) ;
			}

			return parseFnKeyConst( str , runtime ) ;

		case 0x22 :	// "   double-quote: this is a string
			runtime.i ++ ;
			return commonParsers.parseQuotedString( str , runtime ) ;

		case 0x28 :	// (   open parenthesis: this is a sub-expression
			runtime.i ++ ;
			return parseExpression( str , runtime ) ;

		case 0x3a :	// :   colon: this is a key/value
			runtime.i ++ ;
			return fnOperators[':'] ;

		case 0x24 :	// $   dollar: maybe a Template or a Ref
			c = str.charCodeAt( runtime.i + 1 ) ;
			
			/* Disable Template support, maybe it will be re-introduced later
			if ( c === 0x22 ) {
				runtime.i += 2 ;
				return Template.parseFromKfg( str , runtime ) ;
			}
			*/

			//runtime.i ++ ;
			return Ref.parseFromKfg( str , runtime ) ;

		default :
			return parseFnKeyConst( str , runtime ) ;
	}
}



var numberRegex_ = /^(-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?)\s*$/ ;

function parseNumber( str , runtime ) {
	str = str.slice( runtime.i , nextSeparator( str , runtime ) ) ;

	//var indexOf ;
	//str = str.slice( runtime.i , runtime.iEndOfLine ) ;
	//if ( ( indexOf = str.indexOf( ' ' ) ) !== -1 ) { str = str.slice( 0 , indexOf ) ; }

	if ( ! numberRegex_.test( str ) ) { throw new SyntaxError( "Expecting a number, but got: '" + str + "'" ) ; }

	runtime.i += str.length ;

	return parseFloat( str ) ;
}



// Find the next separator: space, parens, comma, colon
function nextSeparator( str , runtime ) {
	var i = runtime.i ,
		eol = runtime.iEndOfLine ;

	for ( ; i < eol ; i ++ ) {

		switch ( str.charCodeAt( i ) ) {

			case 0x20 :	//     space
			case 0x28 :	// (   open parenthesis
			case 0x29 :	// )   close parenthesis
			case 0x2c :	// ,   comma
			case 0x3a :	// :   colon
				return i ;
		}
	}

	// return i/eol
	return i ;
}



function parseFnKeyConst( str_ , runtime ) {
	var separatorIndex = nextSeparator( str_ , runtime ) ;

	var str = str_.slice( runtime.i , separatorIndex ) ;
	//console.log( 'str before:' , str_ ) ;
	//console.log( 'str after:' , str ) ;

	//var indexOf ;
	//str = str.slice( runtime.i , runtime.iEndOfLine ) ;
	//if ( ( indexOf = str.indexOf( ' ' ) ) !== -1 ) { str = str.slice( 0 , indexOf ) ; }

	runtime.i += str.length ;

	if ( str_[ separatorIndex ] === ':' ) {
		// This is a key, return the unquoted string
		return str ;
	}
	else if ( str in commonParsers.constants ) {
		return commonParsers.constants[ str ] ;
	}
	else if ( fnOperators[ str ] ) {
		return fnOperators[ str ] ;
	}
	else if ( runtime.operators[ str ] ) {
		return runtime.operators[ str ] ;
	}

	throw new SyntaxError( "Unexpected '" + str + "' in expression" ) ;
}



/* Operators */



// Any change here should be reflected in the official Atom grammar package

var fnOperators = {} ;


// Arithmetic operators

fnOperators.add = fnOperators['+'] = function add( args ) {
	//console.log( "op +" , args ) ;
	var sum = 0 ;
	args.forEach( e => sum += + e ) ;
	return sum ;
} ;

fnOperators.sub = fnOperators['-'] = function sub( args ) {
	if ( args.length === 1 ) { return -args[ 0 ] ; }	// unary minus

	var i = 1 , iMax = args.length , v ;

	v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v -= + args[ i ] ; }
	return v ;
} ;

fnOperators.mul = fnOperators['*'] = function mul( args ) {
	//console.log( "op +" , args ) ;
	var v = 1 ;
	args.forEach( e => v *= + e ) ;
	return v ;
} ;

fnOperators.div = fnOperators['/'] = function div( args ) {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v /= + args[ i ] ; }
	return v ;
} ;

fnOperators.intdiv = fnOperators['\\'] = function intdiv( args ) {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v = Math.trunc( v / ( + args[ i ] ) ) ; }
	return v ;
} ;

fnOperators.modulo = fnOperators['%'] = function modulo( args ) {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v = v % ( + args[ i ] ) ; }
	return v ;
} ;

fnOperators['\\\\'] = function flooredIntdiv( args ) {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v = Math.floor( v / ( + args[ i ] ) ) ; }
	return v ;
} ;

fnOperators['%+'] = function positiveModulo( args ) {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;

	for ( ; i < iMax ; i ++ ) {
		v = v % ( + args[ i ] ) ;
		if ( v < 0 ) { v += + args[ i ] ; }
	}

	return v ;
} ;


// Comparison operators

fnOperators['>'] = function gt( args ) { return args[ 0 ] > args[ 1 ] ; } ;
fnOperators['>='] = function gte( args ) { return args[ 0 ] >= args[ 1 ] ; } ;
fnOperators['<'] = function lt( args ) { return args[ 0 ] < args[ 1 ] ; } ;
fnOperators['<='] = function lte( args ) { return args[ 0 ] <= args[ 1 ] ; } ;
fnOperators['='] = fnOperators['=='] = fnOperators['==='] = function eq( args ) { return args[ 0 ] === args[ 1 ] ; } ;
fnOperators['!='] = fnOperators['!=='] = function notEq( args ) { return args[ 0 ] !== args[ 1 ] ; } ;


// Logical operators

fnOperators.not = fnOperators['!'] = function not( args ) { return ! args[ 0 ] ; } ;

fnOperators.and = function and( args ) {
	var i = 1 , iMax = args.length , v = args[ 0 ] ;
	for ( ; v && i < iMax ; i ++ ) { v = v && args[ i ] ; }
	return !! v ;
} ;

fnOperators.or = function or( args ) {
	var i = 1 , iMax = args.length , v = args[ 0 ] ;
	for ( ; ! v && i < iMax ; i ++ ) { v = v || args[ i ] ; }
	return !! v ;
} ;

/* Iterative XOR variant
fnOperators.xor = function xor( args )
{
	var i = 1 , iMax = args.length , v = !! args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v ^= !! args[ i ] ; }
	return !! v ;
} ;
//*/

//* True exclusive XOR variant
fnOperators.xor = function xor( args ) {
	var i = 0 , iMax = args.length , trueCount = 0 ;
	for ( ; trueCount <= 1 && i < iMax ; i ++ ) { trueCount += args[ i ] && 1 || 0 ; }
	return trueCount === 1 ;
} ;
//*/

fnOperators['&&'] = function guard( args ) {
	var i = 1 , iMax = args.length , v = args[ 0 ] ;
	for ( ; v && i < iMax ; i ++ ) { v = v && args[ i ] ; }
	return v ;
} ;

fnOperators['||'] = function default_( args ) {
	var i = 1 , iMax = args.length , v = args[ 0 ] ;
	for ( ; ! v && i < iMax ; i ++ ) { v = v || args[ i ] ; }
	return v ;
} ;

fnOperators['?'] = function ternary( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return args[ 0 ] ? trueVal : falseVal ;
} ;

fnOperators['???'] = function threeWay( args ) {
	if ( args[ 0 ] < 0 ) { return args[ 1 ] ; }
	else if ( args[ 0 ] > 0 ) { return args[ 3 ] ; }
	return args[ 2 ] ;
} ;


// Rounding

fnOperators.round = function round( args ) {
	if ( args.length <= 1 ) { return Math.round( args[ 0 ] ) ; }
	// use: args[ 0 ] * ( 1 / args[ 1 ] )
	// not: args[ 0 ] / args[ 1 ]
	// reason: epsilon rounding errors
	return args[ 1 ] * Math.round( args[ 0 ] * ( 1 / args[ 1 ] ) ) ;
} ;

fnOperators.floor = function floor( args ) {
	if ( args.length <= 1 ) { return Math.floor( args[ 0 ] ) ; }
	// use: args[ 0 ] * ( 1 / args[ 1 ] )
	// not: args[ 0 ] / args[ 1 ]
	// reason: epsilon rounding errors
	return args[ 1 ] * Math.floor( args[ 0 ] * ( 1 / args[ 1 ] ) ) ;
} ;

fnOperators.ceil = function ceil( args ) {
	if ( args.length <= 1 ) { return Math.ceil( args[ 0 ] ) ; }
	// use: args[ 0 ] * ( 1 / args[ 1 ] )
	// not: args[ 0 ] / args[ 1 ]
	// reason: epsilon rounding errors
	return args[ 1 ] * Math.ceil( args[ 0 ] * ( 1 / args[ 1 ] ) ) ;
} ;

fnOperators.trunc = function trunc( args ) {
	if ( args.length <= 1 ) { return Math.trunc( args[ 0 ] ) ; }
	// use: args[ 0 ] * ( 1 / args[ 1 ] )
	// not: args[ 0 ] / args[ 1 ]
	// reason: epsilon rounding errors
	return args[ 1 ] * Math.trunc( args[ 0 ] * ( 1 / args[ 1 ] ) ) ;
} ;


// Various math functions

fnOperators.sign = function sign( args ) { return Math.sign( args[ 0 ] ) ; } ;
fnOperators.abs = function abs( args ) { return Math.abs( args[ 0 ] ) ; } ;

fnOperators.max = function max( args ) { return Math.max( ... args ) ; } ;
fnOperators.min = function min( args ) { return Math.min( ... args ) ; } ;

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

fnOperators.hypot = function hypot( args ) { return Math.hypot( ... args ) ; } ;

fnOperators.avg = function avg( args ) {
	if ( args.length === 1 && Array.isArray( args[ 0 ] ) ) { args = args[ 0 ] ; }

	var sum = 0 ;
	args.forEach( e => sum += + e ) ;
	return sum / args.length ;
} ;

// Sort of equal, with a delta error rate
fnOperators['%='] = function around( args ) {
	if ( args[ 0 ] === args[ 1 ] ) { return true ; }

	if (
		typeof args[ 0 ] !== 'number' ||
		typeof args[ 1 ] !== 'number' ||
		typeof args[ 2 ] !== 'number' ||
		! ( args[ 0 ] * args[ 1 ] > 0 )		// to catch NaN...
	) {
		return false ;
	}

	var maxRate = args[ 2 ] ;
	if ( maxRate < 1 ) { maxRate = 1 / maxRate ; }

	var deltaRate = args[ 0 ] / args[ 1 ] ;
	if ( deltaRate < 1 ) { deltaRate = 1 / deltaRate ; }

	return deltaRate <= maxRate ;
} ;


// String operators

fnOperators['.'] = function strcat( args ) {
	return args.join( '' ) ;
} ;


// Array operators

fnOperators.array = function array( args ) {
	return args ;
} ;

fnOperators.concat = function concat( args ) {
	return Array.prototype.concat.apply( [] , args ) ;
} ;

fnOperators.join = function join( args ) {
	if ( ! Array.isArray( args[ 0 ] ) ) { return args[ 0 ] ; }
	return args[ 0 ].join( typeof args[ 1 ] === 'string' ? args[ 1 ] : '' ) ;
} ;


// Object operators

fnOperators[':'] =
fnOperators.object = function object( args ) {
	var i , key ,
		length = args.length ,
		obj = {} ;

	//console.log( '\n\nobject args:' , args ) ;

	for ( i = 0 ; i < length ; i ++ ) {
		key = args[ i ] ;

		if ( ! key ) { return ; }

		// Necessary when the key/value comma syntax is not flat
		/*
		if ( Array.isArray( key ) )
		{
			// Array of args syntax: [ [ key1 , value1 ] , [ key2 , value2 ] , ... ]
			if ( typeof key[ 0 ] !== 'string' ) { return ; }
			obj[ key[ 0 ] ] = key[ 1 ] ;
		}
		else if ( typeof key === 'object' )
		{
			Object.assign( obj , key ) ;
		}
		else
		{
			if ( typeof key !== 'string' ) { return ; }
			obj[ key ] = args[ ++ i ] ;
		}
		//*/

		if ( typeof key !== 'string' ) { return ; }
		obj[ key ] = args[ ++ i ] ;
	}

	return obj ;
} ;



// Type checker operators

fnOperators['is-set?'] = function isSet( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return args[ 0 ] !== undefined ? trueVal : falseVal ;
} ;

fnOperators['is-boolean?'] = function isBoolean( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return typeof args[ 0 ] === 'boolean' ? trueVal : falseVal ;
} ;

fnOperators['is-number?'] = function isNumber( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return typeof args[ 0 ] === 'number' ? trueVal : falseVal ;
} ;

fnOperators['is-string?'] = function isString( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return typeof args[ 0 ] === 'string' ? trueVal : falseVal ;
} ;

fnOperators['is-array?'] = function isArray( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return Array.isArray( args[ 0 ] ) ? trueVal : falseVal ;
} ;

fnOperators['is-object?'] = function isObject( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return args[ 0 ] && typeof args[ 0 ] === 'object' && ! Array.isArray( args[ 0 ] ) ? trueVal : falseVal ;
} ;

fnOperators['is-real?'] = function isReal( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return typeof args[ 0 ] === 'number' && ! Number.isNaN( args[ 0 ] ) && args[ 0 ] !== Infinity && args[ 0 ] !== -Infinity ?
		trueVal : falseVal ;
} ;

fnOperators['is-empty?'] = function isEmpty( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return ! ( args[ 0 ] && ( ! Array.isArray( args[ 0 ] ) || args[ 0 ].length ) ) ? trueVal : falseVal ;
} ;

fnOperators['is-not-empty?'] = function isNotEmpty( args ) {
	var trueVal = args.length >= 2 ? args[ 1 ] : true ,
		falseVal = args.length >= 3 ? args[ 2 ] : false ;

	return args[ 0 ] && ( ! Array.isArray( args[ 0 ] ) || args[ 0 ].length ) ? trueVal : falseVal ;
} ;


// Misc operators

fnOperators.has = function has( args ) {
	if ( ! args[ 0 ] || typeof args[ 0 ] !== 'object' ) { return false ; }
	else if ( Array.isArray( args[ 0 ] ) ) { return args[ 0 ].indexOf( args[ 1 ] ) !== -1 ; }
	else if ( typeof args[ 0 ].has === 'function' ) { return !! args[ 0 ].has( args[ 1 ] ) ; }
	return false ;
} ;

// Apply operator
fnOperators['->'] = function apply( args ) {
	if ( typeof args[ 0 ] !== 'function' ) { throw new SyntaxError( 'The apply operator needs a function as its left-hand-side operand' ) ; }
	return args[ 0 ].apply( undefined , args.slice( 1 ) ) ;
} ;

fnOperators['->'].solveArgs = function applySolveArgs( ctx ) {
	return this.args.map( ( e , i ) => e && typeof e === 'object' && e.__isDynamic__ ? e.getFinalValue( ctx , ! i ) : e ) ;
} ;


