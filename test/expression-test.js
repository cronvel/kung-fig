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
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 3 ) ;
	} ) ;
	
	it( "parse/exec a simple expression of expression" , function() {
		var parsed ;
		
		parsed = Expression.parse( '1 + ( 2 + 3 )' ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 6 ) ;
		
		parsed = Expression.parse( '( 2 + 3 ) + 1' ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 6 ) ;
		
		parsed = Expression.parse( '( ( 5 + 1 ) + 6 ) + ( 2 + ( 3 + 4 ) )' ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 21 ) ;
	} ) ;
	
	it( "parse/exec ternary operator" , function() {
		var parsed ;
		
		parsed = Expression.parse( '( 2 > 3 ) ? 4 5' ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 5 ) ;
		
		parsed = Expression.parse( '( 2 < 3 ) ? 4 5' ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 4 ) ;
	} ) ;
	
	it( "parse/exec apply operator" , function() {
		var parsed , proxy , object ;
		
		object = { a: 3 , b: 5 } ;
		object.fn = function( v ) { return this.a * v + this.b ; }
		
		proxy = { data: {
			fn: function( v ) { return v * 2 + 1 ; } ,
			object: object
		} } ;
		
		parsed = Expression.parse( '$fn -> 3' , proxy ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 7 ) ;
		
		parsed = Expression.parse( '$object.fn -> 3' , proxy ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 14 ) ;
	} ) ;
	
	it( "parse/exec apply operator and substitution regexp" , function() {
		var parsed , proxy , regexp ;
		
		regexp = /hello/ ;
		kungFig.parse.builtin.regex.toSubstitution( regexp , 'hi' ) ;
		
		proxy = { data: {
			str: 'hello world!' ,
			regexp: regexp ,
			array: [
				'hi' ,
				'hello' ,
				'hi there!' ,
				'hello world!'
			]
		} } ;
		
		parsed = Expression.parse( '$regexp.substitute -> $str' , proxy ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 'hi world!' ) ;
		
		parsed = Expression.parse( '$regexp.filter -> $array' , proxy ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , [ 'hello' , 'hello world!' ] ) ;
	} ) ;
	
	it( "more expression tests..." ) ;
} ) ;


