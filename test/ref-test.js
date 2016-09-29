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
var Ref = kungFig.Ref ;
//var Ref = require( '../lib/Ref2.js' ) ;

var string = require( 'string-kit' ) ;
var doormen = require( 'doormen' ) ;
var expect = require( 'expect.js' ) ;



function deb( v )
{
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}



describe( "Ref" , function() {
	
	describe( "Get" , function() {
		
		it( "parse and get a simple ref" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 2 ,
				sub: {
					c: 3 ,
					sub: {
						d: 4
					}
				}
			} ;
			
			ref_ = Ref.parse( '$x' ) ;
			doormen.equals( ref_.get( ctx ) , undefined ) ;
			
			ref_ = Ref.parse( '$x.y.z' ) ;
			doormen.equals( ref_.get( ctx ) , undefined ) ;
			
			ref_ = Ref.parse( '$a' ) ;
			doormen.equals( ref_.get( ctx ) , 1 ) ;
			
			ref_ = Ref.parse( '$b' ) ;
			doormen.equals( ref_.get( ctx ) , 2 ) ;
			
			ref_ = Ref.parse( '$sub' ) ;
			doormen.equals( ref_.get( ctx ) , ctx.sub ) ;
			
			ref_ = Ref.parse( '$sub.c' ) ;
			doormen.equals( ref_.get( ctx ) , 3 ) ;
			
			ref_ = Ref.parse( '$sub.sub' ) ;
			doormen.equals( ref_.get( ctx ) , ctx.sub.sub ) ;
			
			ref_ = Ref.parse( '$sub.sub.d' ) ;
			doormen.equals( ref_.get( ctx ) , 4 ) ;
			
			ref_ = Ref.parse( '$e' ) ;
			doormen.equals( ref_.get( ctx ) , undefined ) ;
			
			ref_ = Ref.parse( '$e.f.g' ) ;
			doormen.equals( ref_.get( ctx ) , undefined ) ;
		} ) ;
		
		it( "parse and get a ref on a context having arrays" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] , { array: [ 'seven' , 'eight' ] } ]
			} ;
			
			ref_ = Ref.parse( '$array' ) ;
			doormen.equals( ref_.get( ctx ) , ctx.array ) ;
			
			ref_ = Ref.parse( '$array[0]' ) ;
			doormen.equals( ref_.get( ctx ) , 'one' ) ;
			
			ref_ = Ref.parse( '$array[10]' ) ;
			doormen.equals( ref_.get( ctx ) , undefined ) ;
			
			ref_ = Ref.parse( '$array[10][10]' ) ;
			doormen.equals( ref_.get( ctx ) , undefined ) ;
			
			ref_ = Ref.parse( '$array[2][1]' ) ;
			doormen.equals( ref_.get( ctx ) , 'four' ) ;
			
			ref_ = Ref.parse( '$array[3]' ) ;
			doormen.equals( ref_.get( ctx ) , ctx.array[3] ) ;
			
			ref_ = Ref.parse( '$array[3].array' ) ;
			doormen.equals( ref_.get( ctx ) , ctx.array[3].array ) ;
			
			ref_ = Ref.parse( '$array[3].array[1]' ) ;
			doormen.equals( ref_.get( ctx ) , 'eight' ) ;
			
			ref_ = Ref.parse( '$[1]' ) ;
			doormen.equals( ref_.get( ctx.array ) , 'two' ) ;
			
			ref_ = Ref.parse( '$[2][1]' ) ;
			doormen.equals( ref_.get( ctx.array ) , 'four' ) ;
			
			ref_ = Ref.parse( '$[3].array[1]' ) ;
			doormen.equals( ref_.get( ctx.array ) , 'eight' ) ;
		} ) ;
		
		it( "parse and get a ref with quoted keys" , function() {
			var ref_ ;
			
			var ctx = {
				key: 'value' ,
				"a key with spaces": {
					"another one": 'sure'
				}
			} ;
			
			ref_ = Ref.parse( '$key' ) ;
			doormen.equals( ref_.get( ctx ) , 'value' ) ;
			
			ref_ = Ref.parse( '$["key"]' ) ;
			doormen.equals( ref_.get( ctx ) , 'value' ) ;
			
			ref_ = Ref.parse( '$["a key with spaces"]' ) ;
			doormen.equals( ref_.get( ctx ) , ctx["a key with spaces"] ) ;
			
			ref_ = Ref.parse( '$["a key with spaces"]["another one"]' ) ;
			doormen.equals( ref_.get( ctx ) , 'sure' ) ;
		} ) ;
		
		it( "parse and get a complex ref (ref having refs)" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 3 ,
				c: 0 ,
				k1: 'someKey' ,
				k2: 'anotherKey' ,
				array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] ] ,
				object: {
					someKey: 'value' ,
					anotherKey: 'another value'
				}
			} ;
			
			ref_ = Ref.parse( '$array[$a]' ) ;
			doormen.equals( ref_.get( ctx ) , 'two' ) ;
			
			ref_ = Ref.parse( '$array[$b]' ) ;
			doormen.equals( ref_.get( ctx ) , ctx.array[3] ) ;
			
			ref_ = Ref.parse( '$array[$c]' ) ;
			doormen.equals( ref_.get( ctx ) , 'one' ) ;
			
			ref_ = Ref.parse( '$object[$k1]' ) ;
			doormen.equals( ref_.get( ctx ) , 'value' ) ;
			
			ref_ = Ref.parse( '$object[$k2]' ) ;
			doormen.equals( ref_.get( ctx ) , 'another value' ) ;
		} ) ;
		
		it( "function in context" , function() {
			var ref_ ;
			
			var ctx = {
				fn: function myFunc() {}
			} ;
			
			ctx.fn.prop = 'val' ;
			
			ref_ = Ref.parse( '$fn' ) ;
			doormen.equals( ref_.get( ctx ) , ctx.fn ) ;
			
			ref_ = Ref.parse( '$fn.name' ) ;
			doormen.equals( ref_.get( ctx ) , 'myFunc' ) ;
			
			ref_ = Ref.parse( '$fn.prop' ) ;
			doormen.equals( ref_.get( ctx ) , 'val' ) ;
		} ) ;
	} ) ;
	
		
	describe( "Set" , function() {
		
		it( "set a simple ref" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 2 ,
				sub: {
					c: 3 ,
					sub: {
						d: 4
					}
				}
			} ;
			
			ref_ = Ref.parse( '$a' ) ;
			ref_.set( ctx , 7 ) ;
			doormen.equals( ctx.a , 7 ) ;
			
			ref_ = Ref.parse( '$sub.c' ) ;
			ref_.set( ctx , 22 ) ;
			doormen.equals( ctx.sub.c , 22 ) ;
			
			ref_ = Ref.parse( '$sub.sub' ) ;
			ref_.set( ctx , 'hello' ) ;
			doormen.equals( ctx.sub.sub , 'hello' ) ;
			
			doormen.equals( ctx , {
				a: 7 ,
				b: 2 ,
				sub: {
					c: 22 ,
					sub: 'hello'
				}
			} ) ;
		} ) ;
		
		it( "set a ref on a context having arrays" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] , { array: [ 'seven' , 'eight' ] } ]
			} ;
			
			ref_ = Ref.parse( '$array[0]' ) ;
			ref_.set( ctx , 'ONE' ) ;
			doormen.equals( ctx.array[0] , 'ONE' ) ;
			
			ref_ = Ref.parse( '$array[3][1]' ) ;
			ref_.set( ctx , 4 ) ;
			doormen.equals( ctx.array[3][1] , 4 ) ;
		} ) ;
		
		it( "set a complex ref (ref having refs)" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 3 ,
				c: 0 ,
				k1: 'someKey' ,
				k2: 'anotherKey' ,
				array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] ] ,
				object: {
					someKey: 'value' ,
					anotherKey: 'another value'
				}
			} ;
			
			ref_ = Ref.parse( '$array[$a]' ) ;
			ref_.set( ctx , 2 ) ;
			doormen.equals( ctx.array[1] , 2 ) ;
			
			ref_ = Ref.parse( '$object[$k1]' ) ;
			ref_.set( ctx , 'my value' ) ;
			doormen.equals( ctx.object.someKey , 'my value' ) ;
			
			ref_ = Ref.parse( '$object[$k2]' ) ;
			ref_.set( ctx , 'my other value' ) ;
			doormen.equals( ctx.object.anotherKey , 'my other value' ) ;
		} ) ;
		
		it( "set and the auto-creation feature" , function() {
			var ref_ ;
			
			var ctx = {} ;
			
			ref_ = Ref.parse( '$a.b' ) ;
			ref_.set( ctx , 7 ) ;
			
			doormen.equals( ctx , {
				a: { b: 7 }
			} ) ;
			
			ref_ = Ref.parse( '$c.d.e.f' ) ;
			ref_.set( ctx , 'Gee!' ) ;
			
			doormen.equals( ctx , {
				a: { b: 7 } ,
				c: { d: { e: { f: 'Gee!' } } }
			} ) ;
			
			ref_ = Ref.parse( '$arr[1]' ) ;
			ref_.set( ctx , 'one' ) ;
			
			doormen.equals( ctx , {
				a: { b: 7 } ,
				c: { d: { e: { f: 'Gee!' } } } ,
				arr: [ undefined , 'one' ]
			} ) ;
			
			ref_ = Ref.parse( '$arr2[3][2][1]' ) ;
			ref_.set( ctx , 'nested' ) ;
			
			doormen.equals( ctx , {
				a: { b: 7 } ,
				c: { d: { e: { f: 'Gee!' } } } ,
				arr: [ undefined , 'one' ] ,
				arr2: [ undefined , undefined , undefined , [ undefined , undefined , [ undefined , 'nested' ] ] ]
			} ) ;
		} ) ;
		
		it( "function in context" , function() {
			var ref_ ;
			
			var ctx = {
				fn: function myFunc() {}
			} ;
			
			ctx.fn.prop = 'val' ;
			
			ref_ = Ref.parse( '$fn.prop' ) ;
			ref_.set( ctx , true ) ;
			doormen.equals( ctx.fn.prop , true ) ;
			
			ref_ = Ref.parse( '$fn.prop2' ) ;
			ref_.set( ctx , 'plop' ) ;
			doormen.equals( ctx.fn.prop2 , 'plop' ) ;
		} ) ;
	} ) ;
	
	describe( "Calling a function" , function() {
		
		it( "parse and get a simple ref" , function() {
			var ref_ ;
			
			var ctx = {
				a: 1 ,
				b: 2 ,
				fn: function( a , b , c ) {
					return a + b + c + this.a + this.b + this.sub.c ;
				} ,
				sub: {
					c: 3 ,
					fn: function( a ) {
						return a + this.c + this.sub.d ;
					} ,
					sub: {
						d: 4 ,
						fn: function( a ) {
							return a + this.d ;
						}
					}
				}
			} ;
			
			ref_ = Ref.parse( '$fn' ) ;
			doormen.equals( ref_.callFn( ctx , 4 , 5 , 6 ) , 21 ) ;
			
			ref_ = Ref.parse( '$sub.fn' ) ;
			doormen.equals( ref_.callFn( ctx , 10 ) , 17 ) ;
			
			ref_ = Ref.parse( '$sub.sub.fn' ) ;
			doormen.equals( ref_.callFn( ctx , -5 ) , -1 ) ;
		} ) ;
	} ) ;
	
	describe( "Misc" , function() {
	
		it( "Ref#getFinalValue()" , function() {
			var ctx = { a: 42 } ;
			ctx.b = Ref.create( '$a' ) ;
			ctx.c = Ref.create( '$b' ) ;
			ctx.d = Ref.create( '$c' ) ;
			doormen.equals( ctx.b.getFinalValue( ctx ) , 42 ) ;
			doormen.equals( ctx.c.getFinalValue( ctx ) , 42 ) ;
			doormen.equals( ctx.d.getFinalValue( ctx ) , 42 ) ;
		} ) ;
		
		it( "Ref#getRecursiveFinalValue()" , function() {
			var ctx = { a: 42 , container: {} } ;
			ctx.container.b = Ref.create( '$a' ) ;
			ctx.container.c = Ref.create( '$container.b' ) ;
			ctx.container.d = Ref.create( '$container.c' ) ;
			ctx.refContainer = Ref.create( '$container' ) ;
			doormen.equals( ctx.refContainer.getRecursiveFinalValue( ctx ) , { b:42 , c:42 , d:42 } ) ;
		} ) ;
		
		it( "Ref#toString()" , function() {
			var ctx = { a: 42 } ;
			ctx.b = Ref.create( '$a' ) ;
			ctx.c = Ref.create( '$b' ) ;
			ctx.d = Ref.create( '$c' ) ;
			doormen.equals( ctx.b.toString( ctx ) , "42" ) ;
			doormen.equals( ctx.c.toString( ctx ) , "42" ) ;
			doormen.equals( ctx.d.toString( ctx ) , "42" ) ;
		} ) ;
	} ) ;
	
	describe( "Parser edge cases" , function() {
	
		it( "Should stop parsing at first non-enclosed space" , function() {
			var ref_ = Ref.parse( '$x y z' ) ;
			doormen.equals( ref_.refParts , [ 'x' ] ) ;
		} ) ;
	} ) ;
} ) ;


