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

/* jshint unused:false */
/* global describe, it, before, after */

"use strict" ;



var kungFig = require( '../lib/kungFig.js' ) ;
var Expression = kungFig.Expression ;

var string = require( 'string-kit' ) ;
var doormen = require( 'doormen' ) ;
var expect = require( 'expect.js' ) ;



function deb( v )
{
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}

function debfn( v )
{
	console.log( string.inspect( { style: 'color' , depth: 5 , proto: true , funcDetails: true } , v ) ) ;
}



describe( "Expression" , function() {
	
	describe( "Syntax" , function() {
		
		it( "parse/exec a simple expression" , function() {
			var parsed ;
			parsed = Expression.parse( '1 + 2' ) ;
			doormen.equals( parsed.getFinalValue() , 3 ) ;
		} ) ;
		
		it( "parse/exec an expression with constant operands" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'true && true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'true && false' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'true || false' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '1 + Infinity' ) ;
			doormen.equals( parsed.getFinalValue() , Infinity ) ;
		} ) ;
		
		it( "parse/exec a simple expression of expression" , function() {
			var parsed ;
			
			parsed = Expression.parse( '1 + ( 2 + 3 )' ) ;
			doormen.equals( parsed.getFinalValue() , 6 ) ;
			
			parsed = Expression.parse( '( 2 + 3 ) + 1' ) ;
			doormen.equals( parsed.getFinalValue() , 6 ) ;
			
			parsed = Expression.parse( '( ( 5 + 1 ) + 6 ) + ( 2 + ( 3 + 4 ) )' ) ;
			doormen.equals( parsed.getFinalValue() , 21 ) ;
		} ) ;
		
		it( "parse/exec an expression with operator repetition" , function() {
			var parsed ;
			
			parsed = Expression.parse( '1 + 2 + 3' ) ;
			doormen.equals( parsed.args , [ 1 , 2 , 3 ] ) ;
			doormen.equals( parsed.getFinalValue() , 6 ) ;
			
			parsed = Expression.parse( '1 + 2 + 3 + -4' ) ;
			doormen.equals( parsed.args , [ 1 , 2 , 3 , -4 ] ) ;
			doormen.equals( parsed.getFinalValue() , 2 ) ;
		} ) ;
		
		it( "parse/exec an expression with implicit array creation" , function() {
			var parsed ;
			
			parsed = Expression.parse( '1 2 3' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , 3 ] ) ;
			
			parsed = Expression.parse( '1 , 2 , 3' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , 3 ] ) ;
		} ) ;
		
		it( "parse/exec an expression with explicit array creation" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'array' ) ;
			doormen.equals( parsed.args , [] ) ;
			doormen.equals( parsed.getFinalValue() , [] ) ;
			
			parsed = Expression.parse( 'array 1' ) ;
			doormen.equals( parsed.args , [ 1 ] ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 ] ) ;
			
			parsed = Expression.parse( 'array 1 2 3' ) ;
			doormen.equals( parsed.args , [ 1 , 2 , 3 ] ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , 3 ] ) ;
			
			parsed = Expression.parse( 'array 1 , 2 , 3' ) ;
			doormen.equals( parsed.args , [ 1 , 2 , 3 ] ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , 3 ] ) ;
		} ) ;
		
		it( "parse/exec an expression with implicit object creation" , function() {
			var parsed ;
			
			parsed = Expression.parse( '"key" : "value"' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key: 'value' } ) ;
			
			parsed = Expression.parse( '"key1": "value1" "key2": 2' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key1: 'value1' , key2: 2 } ) ;
			
			parsed = Expression.parse( '"key1": "value1" , "key2": 2' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key1: 'value1' , key2: 2 } ) ;
		} ) ;
		
		it( "parse/exec implicit object with quoteless keys" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'key: "value"' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key: 'value' } ) ;
			
			parsed = Expression.parse( 'key1: "value1" key2: 2' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key1: 'value1' , key2: 2 } ) ;
			
			parsed = Expression.parse( 'key1: "value1" , key2: 2' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key1: 'value1' , key2: 2 } ) ;
		} ) ;
		
		it( "object syntax: comma/colon precedence" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'key1: "value1" , key2: 2' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key1: 'value1' , key2: 2 } ) ;
			
			parsed = Expression.parse( '"hello" , key1: "value1" , key2: 2' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , [ "hello" , { key1: 'value1' } , { key2: 2 } ] ) ;
		} ) ;
		
		it( "object syntax: direct expression in property" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'key1: 2 + 3' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key1: 5 } ) ;
			
			parsed = Expression.parse( 'key1: 2 + 3 , key2: 3 / 5' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key1: 5 , key2: 0.6 } ) ;
		} ) ;
		
		it( "parse/exec an expression with explicit object creation" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'object key: "value"' ) ;
			//console.log( parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key: 'value' } ) ;
			
			parsed = Expression.parse( 'key1: "value1", key2: 2' ) ;
			//parsed = Expression.parse( 'key1: "value1", key2: 2' ) ;
			//console.log( '\n\n' , parsed ) ;
			
			parsed = Expression.parse( 'object key1: "value1", key2: 2' ) ;
			//parsed = Expression.parse( 'key1: "value1", key2: 2' ) ;
			//console.log( '\n\n' , parsed ) ;
			doormen.equals( parsed.getFinalValue() , { key1: 'value1' , key2: 2 } ) ;
		} ) ;
		
		it( "ambiguous object syntax" , function() {
			var parsed ;
			
			doormen.shouldThrow( () => Expression.parse( 'array key: "value"' ) ) ;
			doormen.shouldThrow( () => Expression.parse( 'add key: "value"' ) ) ;
			
			parsed = Expression.parse( 'array ( key1: "value1", key2: 2 )' ) ;
			//parsed = Expression.parse( 'key1: "value1", key2: 2' ) ;
			//console.log( '\n\n' , parsed ) ;
			doormen.equals( parsed.getFinalValue() , [ { key1: 'value1' , key2: 2 } ] ) ;
			
			parsed = Expression.parse( 'array ( key1: "value1" )' ) ;
			//parsed = Expression.parse( 'key1: "value1", key2: 2' ) ;
			//console.log( '\n\n' , parsed ) ;
			doormen.equals( parsed.getFinalValue() , [ { key1: 'value1' } ] ) ;
			
			parsed = Expression.parse( 'array ( key1: "value1" ) ( key2: 2 )' ) ;
			//parsed = Expression.parse( 'key1: "value1", key2: 2' ) ;
			//console.log( '\n\n' , parsed ) ;
			doormen.equals( parsed.getFinalValue() , [ { key1: 'value1' } , { key2: 2 } ] ) ;
			
			parsed = Expression.parse( 'array ( key1: "value1" ) , ( key2: 2 )' ) ;
			//parsed = Expression.parse( 'key1: "value1", key2: 2' ) ;
			//console.log( '\n\n' , parsed ) ;
			doormen.equals( parsed.getFinalValue() , [ { key1: 'value1' } , { key2: 2 } ] ) ;
		} ) ;
		
		it( "parse/exec an expression featuring the comma separator syntax" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'add 1 , 2 , 3' ) ;
			doormen.equals( parsed.getFinalValue() , 6 ) ;
			
			parsed = Expression.parse( 'add 2 * 4 , 3' ) ;
			doormen.equals( parsed.getFinalValue() , 11 ) ;
			
			parsed = Expression.parse( 'add 2 , 4 * 2 , 3' ) ;
			doormen.equals( parsed.getFinalValue() , 13 ) ;
			
			parsed = Expression.parse( 'add 2 , 4 , 3 * 2' ) ;
			doormen.equals( parsed.getFinalValue() , 12 ) ;
			
			parsed = Expression.parse( 'add 2 * 4 , 3 * 5 , 2' ) ;
			doormen.equals( parsed.getFinalValue() , 25 ) ;
			
			parsed = Expression.parse( 'add 2 * 4 , 3 * 5' ) ;
			doormen.equals( parsed.getFinalValue() , 23 ) ;
			
			parsed = Expression.parse( 'add 1 , 2 * 4 , 3' ) ;
			doormen.equals( parsed.getFinalValue() , 12 ) ;
			
			parsed = Expression.parse( 'add 1 + 3 , 2 * 4 , 3 ^ 2' ) ;
			doormen.equals( parsed.getFinalValue() , 21 ) ;
		} ) ;
		
		it( "optional spaces around commas" , function() {
			var parsed ;
			
			parsed = Expression.parse( '1 , 2 , 3' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , 3 ] ) ;
			
			parsed = Expression.parse( '1 ,2 ,3' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , 3 ] ) ;
			
			parsed = Expression.parse( '1, 2, 3' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , 3 ] ) ;
			
			parsed = Expression.parse( '1,2,3' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , 3 ] ) ;
			
			parsed = Expression.parse( '"one","two","three"' ) ;
			doormen.equals( parsed.getFinalValue() , [ "one" , "two" , "three" ] ) ;
		} ) ;
		
		it( "optional spaces around parenthesis" , function() {
			var parsed ;
			
			parsed = Expression.parse( '1(2,3)4' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , [ 2 , 3 ] , 4 ] ) ;
		} ) ;
	} ) ;
		
	
	
	describe( "Operators" , function() {
		
		it( "parse/exec the integer division '\\' operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( '0 \\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
			
			parsed = Expression.parse( '3 \\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
			
			parsed = Expression.parse( '7 \\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 1 ) ;
			
			parsed = Expression.parse( '6 \\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 1 ) ;
			
			parsed = Expression.parse( '8 \\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 2 ) ;
			
			parsed = Expression.parse( '17 \\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( '-1 \\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
			
			parsed = Expression.parse( '-7 \\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , -1 ) ;
			
			parsed = Expression.parse( '-8 \\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , -2 ) ;
		} ) ;
		
		it( "parse/exec the floored integer division '\\\\' operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( '0 \\\\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
			
			parsed = Expression.parse( '3 \\\\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
			
			parsed = Expression.parse( '7 \\\\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 1 ) ;
			
			parsed = Expression.parse( '6 \\\\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 1 ) ;
			
			parsed = Expression.parse( '8 \\\\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 2 ) ;
			
			parsed = Expression.parse( '17 \\\\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( '-1 \\\\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , -1 ) ;
			
			parsed = Expression.parse( '-7 \\\\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , -2 ) ;
			
			parsed = Expression.parse( '-8 \\\\ 4' ) ;
			doormen.equals( parsed.getFinalValue() , -2 ) ;
		} ) ;
		
		it( "parse/exec the modulo '%' operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( '0 % 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
			
			parsed = Expression.parse( '3 % 4' ) ;
			doormen.equals( parsed.getFinalValue() , 3 ) ;
			
			parsed = Expression.parse( '7 % 4' ) ;
			doormen.equals( parsed.getFinalValue() , 3 ) ;
			
			parsed = Expression.parse( '6 % 4' ) ;
			doormen.equals( parsed.getFinalValue() , 2 ) ;
			
			parsed = Expression.parse( '8 % 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
			
			parsed = Expression.parse( '17 % 4' ) ;
			doormen.equals( parsed.getFinalValue() , 1 ) ;
			
			parsed = Expression.parse( '-1 % 4' ) ;
			doormen.equals( parsed.getFinalValue() , -1 ) ;
			
			parsed = Expression.parse( '-7 % 4' ) ;
			doormen.equals( parsed.getFinalValue() , -3 ) ;
			
			parsed = Expression.parse( '-8 % 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
		} ) ;
		
		it( "parse/exec the positive modulo '%+' operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( '0 %+ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
			
			parsed = Expression.parse( '3 %+ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 3 ) ;
			
			parsed = Expression.parse( '7 %+ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 3 ) ;
			
			parsed = Expression.parse( '6 %+ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 2 ) ;
			
			parsed = Expression.parse( '8 %+ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
			
			parsed = Expression.parse( '17 %+ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 1 ) ;
			
			parsed = Expression.parse( '-1 %+ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 3 ) ;
			
			parsed = Expression.parse( '-7 %+ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 1 ) ;
			
			parsed = Expression.parse( '-8 %+ 4' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
		} ) ;
		
		it( "parse/exec the 'and' operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'true and true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'true and false' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'false and true' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'false and false' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'true and 1 and "hey"' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'true and 1 and null and "hey"' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
		} ) ;
		
		it( "parse/exec the guard operator &&" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'true && true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'true && false' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'false && true' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'false && false' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'true && 1 && "hey"' ) ;
			doormen.equals( parsed.getFinalValue() , "hey" ) ;
			
			parsed = Expression.parse( 'true && 1 && null && "hey"' ) ;
			doormen.equals( parsed.getFinalValue() , null ) ;
		} ) ;
		
		it( "parse/exec the 'or' operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'true or true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'true or false' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'false or true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'false or false' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '"hey" or 2 or true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'null or 4 or false or "hey"' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'null or false or 0' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
		} ) ;
		
		it( "parse/exec the default operator ||" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'true || true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'true || false' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'false || true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'false || false' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '"hey" || 2 || true' ) ;
			doormen.equals( parsed.getFinalValue() , "hey" ) ;
			
			parsed = Expression.parse( 'null || 4 || false || "hey"' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'null || false || 0' ) ;
			doormen.equals( parsed.getFinalValue() , 0 ) ;
		} ) ;
		
		it( "parse/exec the 'xor' operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'true xor true' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'true xor false' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'false xor true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( 'false xor false' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			/* iterative XOR variant
			parsed = Expression.parse( 'true xor true xor true' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			//*/
			
			//* true exclusive XOR variant: should have one and only one truthy operand
			parsed = Expression.parse( 'true xor true xor true' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'true xor true xor true xor true' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'false xor false xor false xor false' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'false xor true xor false xor false' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			//*/
		} ) ;
		
		it( "parse/exec has operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( '( 3 4 5 ) has 4' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '( 3 4 5 ) has 6' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '( 3 "str" 5 ) has "str"' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '( 3 "str" 5 ) has "str2"' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
		} ) ;
		
		it( "parse/exec . (dot) operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( '"one" . "two"' ) ;
			doormen.equals( parsed.getFinalValue() , "onetwo" ) ;
			
			parsed = Expression.parse( '"one" . "two" . "three"' ) ;
			doormen.equals( parsed.getFinalValue() , "onetwothree" ) ;
			
			parsed = Expression.parse( 'false . "one" . 2 . "three" true' ) ;
			doormen.equals( parsed.getFinalValue() , "falseone2threetrue" ) ;
		} ) ;
		
		it( "parse/exec concat operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'concat 3 4 5' ) ;
			doormen.equals( parsed.getFinalValue() , [ 3 , 4 , 5 ] ) ;
			
			parsed = Expression.parse( 'concat ( 3 4 ) ( 5 6 )' ) ;
			doormen.equals( parsed.getFinalValue() , [ 3 , 4 , 5 , 6 ] ) ;
			
			parsed = Expression.parse( 'concat ( array 3 , 4 ) , ( array 5 , 6 ) , ( array 7 , 8 )' ) ;
			doormen.equals( parsed.getFinalValue() , [ 3 , 4 , 5 , 6 , 7 , 8 ] ) ;
		} ) ;
		
		it( "parse/exec join operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'join ( "one" )' ) ;
			doormen.equals( parsed.getFinalValue() , "one" ) ;
			
			parsed = Expression.parse( 'join "one"' ) ;
			doormen.equals( parsed.getFinalValue() , "one" ) ;
			
			parsed = Expression.parse( 'join ( "one" "two" "three" )' ) ;
			doormen.equals( parsed.getFinalValue() , "onetwothree" ) ;
			
			parsed = Expression.parse( 'join ( "one" "two" "three" ) ", "' ) ;
			doormen.equals( parsed.getFinalValue() , "one, two, three" ) ;
		} ) ;
		
		it( "parse/exec hypot operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'hypot 3 4' ) ;
			doormen.equals( parsed.getFinalValue() , 5 ) ;
			
			parsed = Expression.parse( 'hypot 3 4 5' ) ;
			doormen.equals( parsed.getFinalValue() , 7.0710678118654755 ) ;
		} ) ;
		
		it( "parse/exec avg" , function() {
			var parsed ;
			
			var ctx = {
				array: [ 2 , 3 , 7 ]
			} ;
			
			parsed = Expression.parse( 'avg 3 5 7' ) ;
			doormen.equals( parsed.getFinalValue() , 5 ) ;
			
			parsed = Expression.parse( 'avg -4  10 27 3' ) ;
			doormen.equals( parsed.getFinalValue() , 9 ) ;
			
			parsed = Expression.parse( 'avg $array' ) ;
			doormen.equals( parsed.getFinalValue( ctx ) , 4 ) ;
		} ) ;
		
		it( "parse/exec the '%=' (around) operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( '70 %= 50 1.3' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '50 %= 70 1.3' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '70 %= 50 1.5' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '50 %= 70 1.5' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '-50 %= -70 1.5' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '50 %= -70 1.5' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '0 %= 0 1.5' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '0 %= 0.001 1.5' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '30 %= 40 2' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '20 %= 40 2' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '19 %= 40 2' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
		} ) ;
		
		it( "parse/exec three-way" , function() {
			var parsed ;
			
			parsed = Expression.parse( '1 ??? 4 5 6' ) ;
			doormen.equals( parsed.getFinalValue() , 6 ) ;
			
			parsed = Expression.parse( '-1 ??? 4 5 6' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( '0 ??? 4 5 6' ) ;
			doormen.equals( parsed.getFinalValue() , 5 ) ;
		} ) ;
		
		it( "parse/exec round/floor/ceil operator" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'round 4.3' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'floor 4.3' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'ceil 4.3' ) ;
			doormen.equals( parsed.getFinalValue() , 5 ) ;
			
			parsed = Expression.parse( 'round 4.7' ) ;
			doormen.equals( parsed.getFinalValue() , 5 ) ;
			
			parsed = Expression.parse( 'floor 4.7' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'ceil 4.7' ) ;
			doormen.equals( parsed.getFinalValue() , 5 ) ;
		} ) ;
		
		it( "parse/exec round/floor/ceil operator with precision" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'round 4.3 1' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'round 4.2 0.5' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'round 4.3 0.5' ) ;
			doormen.equals( parsed.getFinalValue() , 4.5 ) ;
			
			parsed = Expression.parse( 'round 4.3 2' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'round 5 2' ) ;
			doormen.equals( parsed.getFinalValue() , 6 ) ;
			
			
			parsed = Expression.parse( 'floor 4.3 1' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'floor 4.2 0.5' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'floor 4.3 0.5' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'floor 4.8 0.5' ) ;
			doormen.equals( parsed.getFinalValue() , 4.5 ) ;
			
			parsed = Expression.parse( 'floor 4.3 2' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'floor 5 2' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			parsed = Expression.parse( 'floor 5.5 2' ) ;
			doormen.equals( parsed.getFinalValue() , 4 ) ;
			
			
			parsed = Expression.parse( 'ceil 4.3 1' ) ;
			doormen.equals( parsed.getFinalValue() , 5 ) ;
			
			parsed = Expression.parse( 'ceil 4.2 0.5' ) ;
			doormen.equals( parsed.getFinalValue() , 4.5 ) ;
			
			parsed = Expression.parse( 'ceil 4.3 0.5' ) ;
			doormen.equals( parsed.getFinalValue() , 4.5 ) ;
			
			parsed = Expression.parse( 'ceil 4.6 0.5' ) ;
			doormen.equals( parsed.getFinalValue() , 5 ) ;
			
			parsed = Expression.parse( 'ceil 4.3 2' ) ;
			doormen.equals( parsed.getFinalValue() , 6 ) ;
			
			parsed = Expression.parse( 'ceil 5 2' ) ;
			doormen.equals( parsed.getFinalValue() , 6 ) ;
			
			parsed = Expression.parse( 'ceil 6.1 2' ) ;
			doormen.equals( parsed.getFinalValue() , 8 ) ;
		} ) ;
		
		it( "parse/exec the '?' ternary operators" , function() {
			var parsed ;
			
			parsed = Expression.parse( '0 ?' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '1 ?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			// True ternary mode
			parsed = Expression.parse( '0 ? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "bad" ) ;
			
			parsed = Expression.parse( '1 ? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "great" ) ;
			
			parsed = Expression.parse( 'null ? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "bad" ) ;
			
			parsed = Expression.parse( 'false ? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "bad" ) ;
			
			parsed = Expression.parse( 'true ? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "great" ) ;
			
			parsed = Expression.parse( '"" ? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "bad" ) ;
			
			parsed = Expression.parse( '"something" ? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "great" ) ;
			
			parsed = Expression.parse( '$unknown ? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "bad" ) ;
		} ) ;
		
		it( "parse/exec is-set? operators" , function() {
			var parsed ;
			
			parsed = Expression.parse( '$unknown is-set?' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '0 is-set?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '1 is-set?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			// Ternary mode
			parsed = Expression.parse( '1 is-set? "great"' ) ;
			doormen.equals( parsed.getFinalValue() , "great" ) ;
			
			parsed = Expression.parse( '1 is-set? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "great" ) ;
			
			parsed = Expression.parse( '$unknown is-set? "great"' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '$unknown is-set? "great" "bad"' ) ;
			doormen.equals( parsed.getFinalValue() , "bad" ) ;
		} ) ;
		
		it( "parse/exec is-empty? operators" , function() {
			var parsed ;
			
			parsed = Expression.parse( '$unknown is-empty?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '0 is-empty?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '1 is-empty?' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '( array ) is-empty?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '( array 1 ) is-empty?' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '( array 1 2 3 ) is-empty?' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( '( array 0 ) is-empty?' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			// Ternary mode
			parsed = Expression.parse( '0 is-empty? "empty"' ) ;
			doormen.equals( parsed.getFinalValue() , "empty" ) ;
			
			parsed = Expression.parse( '1 is-empty? "empty" "not-empty"' ) ;
			doormen.equals( parsed.getFinalValue() , "not-empty" ) ;
		} ) ;
		
		it( "parse/exec is-real? operators" , function() {
			var parsed ;
			
			parsed = Expression.parse( '0 is-real?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '1 is-real?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '1.5 is-real?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '-1.5 is-real?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '-1.5 is-real?' ) ;
			doormen.equals( parsed.getFinalValue() , true ) ;
			
			parsed = Expression.parse( '( 1 / 0 ) is-real?' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			parsed = Expression.parse( 'Infinity is-real?' ) ;
			doormen.equals( parsed.getFinalValue() , false ) ;
			
			// Ternary mode
			parsed = Expression.parse( '-1.5 is-real? "real"' ) ;
			doormen.equals( parsed.getFinalValue() , "real" ) ;
			
			parsed = Expression.parse( '( 1 / 0 ) is-real? "real" "not-real"' ) ;
			doormen.equals( parsed.getFinalValue() , "not-real" ) ;
		} ) ;
		
		it( "parse/exec apply operator" , function() {
			var parsed , ctx , object ;
			
			object = { a: 3 , b: 5 } ;
			object.fn = function( v ) { return this.a * v + this.b ; }
			
			ctx = {
				fn: function( v ) { return v * 2 + 1 ; } ,
				object: object
			} ;
			
			parsed = Expression.parse( '$fn -> 3' ) ;
			doormen.equals( parsed.getFinalValue( ctx ) , 7 ) ;
			
			parsed = Expression.parse( '$object.fn -> 3' ) ;
			//deb( parsed ) ;
			doormen.equals( parsed.getFinalValue( ctx ) , 14 ) ;
		} ) ;
		
		it( "parse/exec custom operator" , function() {
			var parsed , ctx , operators , object , v ;
			
			object = { a: 3 , b: 5 } ;
			object.fn = function( v ) { return this.a * v + this.b ; }
			
			ctx = {
				fn: function( v ) { return v * 2 + 1 ; } ,
				object: object
			} ;
			
			operators = {
				D: function( args ) {
					var sum = 0 , n = args[ 0 ] , faces = args[ 1 ] ;
					for ( ; n > 0 ; n -- ) { sum += 1 + Math.floor( Math.random() * faces ) ; }
					return sum ;
				}
			} ;
			
			parsed = Expression.parse( '3 D 6' , operators ) ;
			//deb( parsed ) ;
			v = parsed.getFinalValue( ctx ) ;
			//deb( v ) ;
			doormen.equals( v >= 1 && v <= 18 , true ) ;
		} ) ;
		
		it( "parse/exec apply operator and substitution regexp" , function() {
			var parsed , ctx , regexp ;
			
			regexp = /hello/ ;
			kungFig.parse.builtin.regex.toExtended( regexp ) ;
			
			ctx = {
				str: 'hello world!' ,
				regexp: regexp ,
				array: [
					'hi' ,
					'hello' ,
					'hi there!' ,
					'hello world!'
				]
			} ;
			
			parsed = Expression.parse( '$regexp.filter -> $array' ) ;
			//deb( parsed ) ;
			doormen.equals( parsed.getFinalValue( ctx ) , [ 'hello' , 'hello world!' ] ) ;
			
			kungFig.parse.builtin.regex.toSubstitution( regexp , 'hi' ) ;
			
			parsed = Expression.parse( '$regexp.substitute -> $str' ) ;
			//deb( parsed ) ;
			doormen.equals( parsed.getFinalValue( ctx ) , 'hi world!' ) ;
		} ) ;
	} ) ;
	
	
	
	describe( "Historical bugs" , function() {
		
		// may check object multi-reference too
		it( "array multi-reference to the same array" , function() {
			var parsed ;
			
			parsed = Expression.parse( 'array 1 2 ( array 3 4 )' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , [ 3 , 4 ] ] ) ;
			doormen.equals( parsed.getFinalValue() === parsed.getFinalValue() , false ) ;
			doormen.equals( parsed.getFinalValue()[ 2 ] === parsed.getFinalValue()[ 2 ] , false ) ;
			
			parsed = Expression.parse( 'array 1 2 ( 3 4 )' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , [ 3 , 4 ] ] ) ;
			doormen.equals( parsed.getFinalValue() === parsed.getFinalValue() , false ) ;
			doormen.equals( parsed.getFinalValue()[ 2 ] === parsed.getFinalValue()[ 2 ] , false ) ;
			
			parsed = Expression.parse( '1 2 ( 3 4 )' ) ;
			doormen.equals( parsed.getFinalValue() , [ 1 , 2 , [ 3 , 4 ] ] ) ;
			doormen.equals( parsed.getFinalValue() === parsed.getFinalValue() , false ) ;
			doormen.equals( parsed.getFinalValue()[ 2 ] === parsed.getFinalValue()[ 2 ] , false ) ;
		} ) ;
		
		it( "extra spaces parse bug" , function() {
			var parsed = Expression.parse( '0 ? ' ) ;
		} ) ;
	} ) ;
} ) ;


