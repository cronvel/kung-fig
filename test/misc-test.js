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
var Dynamic = kungFig.Dynamic ;
var Ref = kungFig.Ref ;
var Template = kungFig.Template ;

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



describe( "Template" , function() {
	
	it( "Template#getFinalValue()" , function() {
		var ctx = { a: 42 } ;
		ctx.b = Ref.create( '$a' ) ;
		ctx.c = Template.create( "Hello, I'm ${a}." ) ;
		ctx.d = Template.create( "Hello, I'm ${b}." ) ;
		doormen.equals( ctx.c.getFinalValue( ctx ) , "Hello, I'm 42." ) ;
		doormen.equals( ctx.d.getFinalValue( ctx ) , "Hello, I'm 42." ) ;
	} ) ;
} ) ;



describe( "Dynamic.getRecursiveFinalValue()" , function() {
	
	it( "Historical non-cloning bug" , function() {
		// Case where it SHOULD clone
		
		var ref1 , tpl1 , tpl2 ;
		
		var ctx = { a: 42 } ;
		
		ctx.b = ref1 = Ref.create( '$a' ) ;
		ctx.c = tpl1 = Template.create( "Hello, I'm ${a}." ) ;
		ctx.d = tpl2 = Template.create( "Hello, I'm ${b}." ) ;
		
		doormen.equals( Dynamic.getRecursiveFinalValue( ctx , ctx ) , {
			a: 42 ,
			b: 42 ,
			c: "Hello, I'm 42." ,
			d: "Hello, I'm 42."
		} ) ;
		
		doormen.equals( ctx.b === ref1 , true ) ;
		doormen.equals( ctx.c === tpl1 , true ) ;
		doormen.equals( ctx.d === tpl2 , true ) ;
	} ) ;
	
	it( "Historical cloning bug" , function() {
		// Case where it should NOT clone
		
		var ref1 , v1 , v2 ;
		
		var ctx = {
			array: [ 1 , 2 , 3 ] ,
			object: {
				a: 42
			}
		} ;
		
		ref1 = Ref.create( '$object' ) ;
		ctx.object.array = Ref.create( '$array' ) ;
		
		v1 = Dynamic.getRecursiveFinalValue( ref1 , ctx ) ;
		
		//console.log( v1 ) ;
		
		v2 = Dynamic.getRecursiveFinalValue( v1 , ctx ) ;
		
		//console.log( v2 ) ;
		
		v1.array.push( 4 ) ;
		v2.array.push( 5 ) ;
		
		doormen.equals( v1 === v2 , true ) ;
		
		doormen.equals( v1 , {
			a: 42 ,
			array: [ 1 , 2 , 3 , 4 , 5 ]
		} ) ;
		
		doormen.equals( v1.array === ctx.array , true ) ;
		doormen.equals( v1.array === ctx.object.array , true ) ;
	} ) ;
} ) ;


