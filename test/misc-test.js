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



describe( "Ref" , function() {
	
	it( "Ref#getFinalValue()" , function() {
		var ctx = { a: 42 } ;
		ctx.b = Ref.create( 'a' ) ;
		ctx.c = Ref.create( 'b' ) ;
		ctx.d = Ref.create( 'c' ) ;
		doormen.equals( ctx.b.getFinalValue( ctx ) , 42 ) ;
		doormen.equals( ctx.c.getFinalValue( ctx ) , 42 ) ;
		doormen.equals( ctx.d.getFinalValue( ctx ) , 42 ) ;
	} ) ;
	
	it( "Ref#getRecursiveFinalValue()" , function() {
		var ctx = { a: 42 , container: {} } ;
		ctx.container.b = Ref.create( 'a' ) ;
		ctx.container.c = Ref.create( 'container.b' ) ;
		ctx.container.d = Ref.create( 'container.c' ) ;
		ctx.refContainer = Ref.create( 'container' ) ;
		doormen.equals( ctx.refContainer.getRecursiveFinalValue( ctx ) , { b:42 , c:42 , d:42 } ) ;
	} ) ;
	
	it( "Ref#toString()" , function() {
		var ctx = { a: 42 } ;
		ctx.b = Ref.create( 'a' ) ;
		ctx.c = Ref.create( 'b' ) ;
		ctx.d = Ref.create( 'c' ) ;
		doormen.equals( ctx.b.toString( ctx ) , "42" ) ;
		doormen.equals( ctx.c.toString( ctx ) , "42" ) ;
		doormen.equals( ctx.d.toString( ctx ) , "42" ) ;
	} ) ;
} ) ;



describe( "Template" , function() {
	
	it( "Template#getFinalValue()" , function() {
		var ctx = { a: 42 } ;
		ctx.b = Ref.create( 'a' ) ;
		ctx.c = Template.create( "Hello, I'm ${a}." ) ;
		ctx.d = Template.create( "Hello, I'm ${b}." ) ;
		doormen.equals( ctx.c.getFinalValue( ctx ) , "Hello, I'm 42." ) ;
		doormen.equals( ctx.d.getFinalValue( ctx ) , "Hello, I'm 42." ) ;
	} ) ;
} ) ;



describe( "Dynamic.getRecursiveFinalValue()" , function() {
	
	it( "Historical non-cloning bug" , function() {
		var ref1 , tpl1 , tpl2 ;
		
		var ctx = { a: 42 } ;
		
		ctx.b = ref1 = Ref.create( 'a' ) ;
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
} ) ;


