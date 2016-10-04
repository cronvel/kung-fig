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
	
	it( "parse/exec a simple expression" , function() {
		var parsed ;
		parsed = Expression.parse( '1 + 2' ) ;
		doormen.equals( parsed.getFinalValue() , 3 ) ;
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
	
	it( "parse/exec hypot operator" , function() {
		var parsed ;
		
		parsed = Expression.parse( 'hypot 3 4' ) ;
		doormen.equals( parsed.getFinalValue() , 5 ) ;
		
		parsed = Expression.parse( 'hypot 3 4 5' ) ;
		doormen.equals( parsed.getFinalValue() , 7.0710678118654755 ) ;
	} ) ;
	
	it( "parse/exec avg" , function() {
		var parsed ;
		
		parsed = Expression.parse( 'avg 3 5 7' ) ;
		doormen.equals( parsed.getFinalValue() , 5 ) ;
		
		parsed = Expression.parse( 'avg -4  10 27 3' ) ;
		doormen.equals( parsed.getFinalValue() , 9 ) ;
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
	
	it( "parse/exec is-set? operators" , function() {
		var parsed ;
		
		parsed = Expression.parse( '$unknown is-set?' ) ;
		doormen.equals( parsed.getFinalValue() , false ) ;
		
		parsed = Expression.parse( '0 is-set?' ) ;
		doormen.equals( parsed.getFinalValue() , true ) ;
		
		parsed = Expression.parse( '1 is-set?' ) ;
		doormen.equals( parsed.getFinalValue() , true ) ;
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
	
	it( "more expression tests..." ) ;
} ) ;


