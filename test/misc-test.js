/*
	Kung Fig

	Copyright (c) 2015 - 2020 Cédric Ronvel

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

/* global describe, it, before, after, expect */

"use strict" ;



var kungFig = require( '../lib/kungFig.js' ) ;
var Dynamic = kungFig.Dynamic ;
var Ref = kungFig.Ref ;
var Expression = kungFig.Expression ;
var TemplateSentence = kungFig.TemplateSentence ;
var string = require( 'string-kit' ) ;



function deb( v ) {
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}

function debfn( v ) {
	console.log( string.inspect( {
		style: 'color' , depth: 5 , proto: true , funcDetails: true
	} , v ) ) ;
}



describe( "TemplateSentence" , () => {

	it( "TemplateSentence#getFinalValue()" , () => {
		var ctx = { a: 42 } ;
		ctx.b = new Ref( '$a' ) ;
		ctx.c = new TemplateSentence( "Hello, I'm ${a}." ) ;
		ctx.d = new TemplateSentence( "Hello, I'm ${b}." ) ;
		expect( ctx.c.getFinalValue( ctx ) ).to.be( "Hello, I'm 42." ) ;
		expect( ctx.d.getFinalValue( ctx ) ).to.be( "Hello, I'm 42." ) ;
	} ) ;
} ) ;



describe( "Expression" , () => {

	it( "parse/exec apply operator and substitution regexp" , () => {
		var parsed , ctx , regexp ;

		regexp = /hello/ ;
		kungFig.builtin.regex.toExtended( regexp ) ;

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
		expect( parsed.getFinalValue( ctx ) ).to.equal( [ 'hello' , 'hello world!' ] ) ;

		kungFig.builtin.regex.toSubstitution( regexp , 'hi' ) ;

		parsed = Expression.parse( '$regexp.substitute -> $str' ) ;
		//deb( parsed ) ;
		expect( parsed.getFinalValue( ctx ) ).to.be( 'hi world!' ) ;
	} ) ;
} ) ;



describe( "Dynamic.getRecursiveFinalValue()" , () => {

	it( "Historical non-cloning bug" , () => {
		// Case where it SHOULD clone

		var ref1 , tpl1 , tpl2 ;

		var ctx = { a: 42 } ;

		ctx.b = ref1 = new Ref( '$a' ) ;
		ctx.c = tpl1 = new TemplateSentence( "Hello, I'm ${a}." ) ;
		ctx.d = tpl2 = new TemplateSentence( "Hello, I'm ${b}." ) ;

		expect( Dynamic.getRecursiveFinalValue( ctx , ctx ) ).to.equal( {
			a: 42 ,
			b: 42 ,
			c: "Hello, I'm 42." ,
			d: "Hello, I'm 42."
		} ) ;

		expect( ctx.b ).to.be( ref1 ) ;
		expect( ctx.c ).to.be( tpl1 ) ;
		expect( ctx.d ).to.be( tpl2 ) ;
	} ) ;

	it( "Historical cloning bug" , () => {
		// Case where it should NOT clone

		var ref1 , v1 , v2 ;

		var ctx = {
			array: [ 1 , 2 , 3 ] ,
			object: {
				a: 42
			}
		} ;

		ref1 = new Ref( '$object' ) ;
		ctx.object.array = new Ref( '$array' ) ;

		v1 = Dynamic.getRecursiveFinalValue( ref1 , ctx ) ;

		//console.log( v1 ) ;

		v2 = Dynamic.getRecursiveFinalValue( v1 , ctx ) ;

		//console.log( v2 ) ;

		v1.array.push( 4 ) ;
		v2.array.push( 5 ) ;

		expect( v1 ).to.be( v2 ) ;

		expect( v1 ).to.equal( {
			a: 42 ,
			array: [ 1 , 2 , 3 , 4 , 5 ]
		} ) ;

		expect( v1.array ).to.be( ctx.array ) ;
		expect( v1.array ).to.be( ctx.object.array ) ;
	} ) ;
} ) ;

