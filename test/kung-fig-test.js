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



var fs = require( 'fs' ) ;
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
	
	it( "should load a simple JSON file without dependency, containing an array" , function() {
		
		//console.log( kungFig.load( __dirname + '/sample/simpleWithArrays.json' ) ) ;
		doormen.equals(
			kungFig.load( __dirname + '/sample/simpleWithArrays.json' ) ,
			{ just: [ 'a' , 'simple' , [ 'test' , '!' ] ] }
		) ;
	} ) ;
	
	it( "should load a simple JSON file without dependency, which is an array" , function() {
		
		//console.log( kungFig.load( __dirname + '/sample/simpleArray.json' ) ) ;
		doormen.equals(
			kungFig.load( __dirname + '/sample/simpleArray.json' ) ,
			[ 'a' , 'simple' , [ 'test' , '!' ] ]
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
	
	it( "should load flawlessly a config which is an array with many circular includes" , function() {
		
		// Build the circular config here
		var shouldBe = [ "world!" ] ;
		
		var a = [ "data" ] ;
		var b = [ "data" ] ;
		a[ 1 ] = b ;
		b[ 1 ] = a ;
		
		shouldBe[ 1 ] = a ;
		shouldBe[ 2 ] = b ;
		
		doormen.equals( kungFig.load( __dirname + '/sample/withCircularIncludesArray.json' ) , shouldBe ) ;
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
	
	it( "should load flawlessly a config which is an array with a reference to itself" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/selfReferenceArray.json' ) ,
			[
				"A",
				[
					"value",
					"A"
				],
				[
					"value",
					"A"
				],
				"value"
			]
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
	
	it( "should load a JSON file which is an array with many relative dependencies and sub-references" , function() {
		
		//console.log( kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ) ;
		doormen.equals(
			kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ,
			[
				'test',
				[
					3,
					[ 'hello', 'world!' ],
					{
						just: 'a',
						simple: {
							test: '!'
						}
					}
				],
				[
					'world!',
					'hello',
					3
				]
			]
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
	
	it( "should load flawlessly a config which is an array with a circular reference to itself" , function() {
		
		// Build the circular config here
		var shouldBe = [ "A" , [ "value" ] ] ;
		shouldBe[ 1 ][ 1 ] = shouldBe ;
		
		doormen.equals( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.json' ) , shouldBe ) ;
	} ) ;
} ) ;



describe( "Saving a config" , function() {
	
	it( "should stringify a simple config" , function() {
		
		var conf = {
			a: "Haha!",
			b: "Bee!",
			sub: {
				c: "See!"
			}
		} ;
		
		//console.log( kungFig.save( conf ) ) ;
		doormen.equals( kungFig.save( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!"\n  }\n}' ) ;
	} ) ;
	
	it( "should stringify a config of arrays" , function() {
		
		var str ;
		
		str = kungFig.save( kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ) ;
		//console.log( str ) ;
		doormen.equals( str , '[\n  "test",\n  [\n    3,\n    [\n      "hello",\n      "world!"\n    ],\n    {\n      "just": "a",\n      "simple": {\n        "test": "!"\n      }\n    }\n  ],\n  [\n    "world!",\n    "hello",\n    3\n  ]\n]' ) ;
	} ) ;
	
	it( "should stringify a config that have circular references" , function() {
		
		var conf = {
			a: "Haha!",
			b: "Bee!",
			sub: {
				c: "See!"
			}
		} ;
		
		conf.sub.circular = conf ;
		
		//console.log( kungFig.save( conf ) ) ;
		doormen.equals( kungFig.save( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "circular": "@:"\n  }\n}' ) ;
		
		
		var conf = {
			a: "Haha!",
			b: "Bee!",
			sub: {
				c: "See!"
			}
		} ;
		
		conf.sub.circular = conf.sub ;
		
		//console.log( kungFig.save( conf ) ) ;
		doormen.equals( kungFig.save( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "circular": "@:sub"\n  }\n}' ) ;
		
		
		var conf = {
			a: "Haha!",
			b: "Bee!",
			sub: {
				sub: {
					c: "See!"
				}
			}
		} ;
		
		conf.sub.sub.circular = conf.sub.sub ;
		
		//console.log( kungFig.save( conf ) ) ;
		doormen.equals(
			kungFig.save( conf ) , 
			'{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "sub": {\n      "c": "See!",\n      "circular": "@:sub.sub"\n    }\n  }\n}'
		) ;
	} ) ;
	
	it( "should load and save flawlessly a config with many circular includes" , function() {
		
		var str ;
		
		str = kungFig.save( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
		//console.log( str ) ;
		doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "toBe": "@:circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "toA": "@:circularOne"\n  }\n}' ) ;
	} ) ;
	
	it( "should load and save flawlessly a config which is an array with many circular includes" , function() {
		
		var str ;
		
		str = kungFig.save( kungFig.load( __dirname + '/sample/withCircularIncludesArray.json' ) ) ;
		//console.log( str ) ;
		doormen.equals( str , '[\n  "world!",\n  [\n    "data",\n    "@:#2"\n  ],\n  [\n    "data",\n    "@:#1"\n  ]\n]' ) ;
	} ) ;
	
	it( "should load and save flawlessly a config with many circular includes" , function() {
		
		var str ;
		
		kungFig.save( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.json' ) ;
		str = fs.readFileSync( __dirname + '/output.json' ).toString() ;
		//console.log( str ) ;
		doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "toBe": "@:circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "toA": "@:circularOne"\n  }\n}' ) ;
		fs.unlinkSync( __dirname + '/output.json' ) ;
	} ) ;
} ) ;

