/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



var tree = require( 'tree-kit' ) ;

var kungFig = require( '../lib/kungFig.js' ) ;
var doormen = require( 'doormen' ) ;



describe( "Loading a config" , function() {
	
	it( "when trying to load an unexistant file, it should throw" , function() {
		
		doormen.shouldThrow( function() { kungFig.load( __dirname + '/sample/unexistant.json' ) ; } ) ;
	} ) ;
	
	it( "should load a simple JSON file without dependency" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/simple.json' ) ,
			{ just: 'a', simple: { test: '!' } }
		) ;
	} ) ;
	
	it( "should load a JSON file with many relative dependencies" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/withIncludes.json' ) ,
			{
				simple: 'test',
				firstInclude: {
					one: 1,
					two: {
						three: 3,
						four: {
							hello: 'world!'
						},
						five: {
							just: 'a',
							simple: {
								test: '!'
							}
						}
					}
				},
				nested: {
					secondInclude: {
						hello: 'world!'
					}
				}
			}
		) ;
	} ) ;
	
	it( "should load flawlessly a config with a circular include to itself" , function() {
		
		// Build the circular config here
		var shouldBe = { "a": "A" } ;
		shouldBe.b = shouldBe ;
		
		doormen.equals( kungFig.load( __dirname + '/sample/circular.json' ) , shouldBe ) ;
	} ) ;
	
	it( "should RE-load flawlessly a config with a circular include to itself" , function() {
		
		// Build the circular config here
		var shouldBe = { "a": "A" } ;
		shouldBe.b = shouldBe ;
		
		doormen.equals( kungFig.load( __dirname + '/sample/circular.json' ) , shouldBe ) ;
	} ) ;
	
	it( "should load flawlessly a config with many circular includes" , function() {
		
		// Build the circular config here
		var shouldBe = { "hello": "world!" } ;
		
		var a = { "some": "data" } ;
		var b = { "more": "data" } ;
		a.toBe = b ;
		b.toA = a ;
		
		shouldBe.circularOne = a ;
		shouldBe.circularTwo = b ;
		
		doormen.equals( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , shouldBe ) ;
	} ) ;
	
	it( "should RE-load flawlessly a config with many circular includes" , function() {
		
		// Build the circular config here
		var shouldBe = { "hello": "world!" } ;
		
		var a = { "some": "data" } ;
		var b = { "more": "data" } ;
		a.toBe = b ;
		b.toA = a ;
		
		shouldBe.circularOne = a ;
		shouldBe.circularTwo = b ;
		
		doormen.equals( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , shouldBe ) ;
	} ) ;
	
	it( "should load flawlessly a config with a reference to itself" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/selfReference.json' ) ,
			{
				"a": "A",
				"sub": {
					"key": "value",
					"refA": "A"
				},
				"refB": {
					"key": "value",
					"refA": "A"
				},
				"refC": "value"
			}
		) ;
	} ) ;
	
	it( "should load a JSON file with many relative dependencies and sub-references" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/withIncludesRef.json' ) ,
			{
				simple: 'test',
				firstInclude: {
					three: 3,
					four: {
						hello: 'world!'
					},
					five: {
						just: 'a',
						simple: {
							test: '!'
						}
					}
				},
				nested: {
					secondInclude: 'world!',
					thirdInclude: 3
				}
			}
		) ;
	} ) ;
	
	it( "should load flawlessly a config with a circular reference to itself" , function() {
		
		// Build the circular config here
		var shouldBe = {
			"a": "A",
			"sub": {
				"key": "value"
			}
		} ;
		
		shouldBe.sub.ref = shouldBe ;
		
		doormen.equals( kungFig.load( __dirname + '/sample/selfCircularReference.json' ) , shouldBe ) ;
	} ) ;
} ) ;



describe( "Saving a config" , function() {
	
	it( "" , function() {
		
		//doormen.equals( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , shouldBe ) ;
	} ) ;
} ) ;

