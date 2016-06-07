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
	
	it( "should load a simple KFG file without dependency" , function() {
		
		//console.log( require( 'util' ).inspect( kungFig.parse( fs.readFileSync( __dirname + '/sample/kfg/katana.kfg' , 'utf8' ) ) , { depth: 10 } ) ) ;
		//console.log( require( 'util' ).inspect( kungFig.load( __dirname + '/sample/kfg/katana.kfg' ) , { depth: 10 } ) ) ;
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/kfg/katana.kfg' ) , {
				class: 'katana',
				generic: 'saber',
				hands: 2,
				name: 'katana',
				description: 'This is a wonderful katana with a blueish blade!\nThis is a two-handed weapon.',
				durability: 24,
				melee: {
					'+toHit': -2,
					'+attack': 6,
					'*AT': 12,
					'+reach': 7,
					size: 4,
					'+power': 3,
					damages: [
						{ type: 'cutting', '+damage': 14 },
						{ type: 'fire', damage: 10 }
					]
				}
			}
		) ;
	} ) ;
	
	it( "should load a simple txt file" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/txt/lorem.txt' ) ,
			"Lorem ipsum dolor."
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
	
	it( "when loading a file with an unexistant dependency using the '@@', it should throw" , function() {
		
		doormen.shouldThrow( function() { kungFig.load( __dirname + '/sample/withUnexistantInclude.json' ) ; } ) ;
	} ) ;
	
	it( "when loading a file with an unexistant dependency using the '@', it should not throw" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/withUnexistantOptionalInclude.json' ) ,
			{
				simple: "test",
				unexistant: {}
			}
		) ;
	} ) ;
	
	it( "when loading a file with a bad JSON content dependency using the '@', it should throw" , function() {
		
		doormen.shouldThrow( function() { kungFig.load( __dirname + '/sample/withBadOptionalInclude.json' ) ; } ) ;
		//kungFig.load( __dirname + '/sample/withBadOptionalInclude.json' ) ;
	} ) ;
	
	it( "when loading a file, all Tree-Ops should be reduced" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/withTreeOps.json' ) ,
			{
				simple: "test",
				int: 7
			}
		) ;
	} ) ;
	
	it( "when loading a file and explicitly turning the 'reduce' option off, Tree Operations should not be reduced" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/withTreeOps.json' , { reduce: false } ) ,
			{
				simple: "test",
				int: 5,
				"+int": 2
			}
		) ;
	} ) ;
	
	it( "should load a JSON file with a txt dependency" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/withTxtInclude.json' ) ,
			{
				"simple": "test",
				"firstInclude": "Lorem ipsum dolor.",
				"nested": {
					"secondInclude": "Lorem ipsum dolor."
				}
			}
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
	
	it( "should load a JSON file with a glob dependency" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/withGlobIncludes.json' ) ,
			{
				simple: 'test',
				globInclude: [
					{
						one: 1 ,
						two: {
							five: {
								just: "a" ,
								simple: {
									test: "!" 
								}
							} ,
							four: {
								hello: "world!"
							} ,
							three: 3
						}
					} ,
					{
						hello: "world!" 
					}
				]
			}
		) ;
	} ) ;
	
	it( "should load a JSON file with a glob dependency that resolve to no files" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/withUnexistantGlobInclude.json' ) ,
			{
				simple: 'test',
				globInclude: []
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
	
	it( "path starting with ./" ) ;
	it( "path starting with ../" ) ;
	it( "path starting with ~/" ) ;
	it( "Recursive parent search: path containing .../" ) ;
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
		
		//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		doormen.equals( kungFig.saveJson( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!"\n  }\n}' ) ;
		doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n' ) ;
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
		
		//console.log( kungFig.saveJson( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		doormen.equals( kungFig.saveJson( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": "#"\n  }\n}' ) ;
		doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@#\n' ) ;
		
		
		var conf = {
			a: "Haha!",
			b: "Bee!",
			sub: {
				c: "See!"
			}
		} ;
		
		conf.sub.circular = conf.sub ;
		
		//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		doormen.equals( kungFig.saveJson( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": "#sub"\n  }\n}' ) ;
		doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@#sub\n' ) ;
		
		
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
		
		//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		doormen.equals(
			kungFig.saveJson( conf ) , 
			'{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "sub": {\n      "c": "See!",\n      "@@circular": "#sub.sub"\n    }\n  }\n}'
		) ;
		doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tsub:\n\t\tc: See!\n\t\tcircular: @@#sub.sub\n' ) ;
	} ) ;
	
	it( "should load and save flawlessly a config with many circular includes" , function() {
		
		var str ;
		
		str = kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
		//console.log( str ) ;
		doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": "#circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": "#circularOne"\n  }\n}' ) ;
		
		str = kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
		//console.log( str ) ;
		//console.log( str.replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		doormen.equals( str , "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@#circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@#circularOne\n" ) ;
	} ) ;
	
	it( "should load and save to disk flawlessly a config with many circular includes" , function() {
		
		var str ;
		
		kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.json' ) ;
		str = fs.readFileSync( __dirname + '/output.json' ).toString() ;
		//console.log( str ) ;
		doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": "#circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": "#circularOne"\n  }\n}' ) ;
		fs.unlinkSync( __dirname + '/output.json' ) ;
		
		kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.kfg' ) ;
		str = fs.readFileSync( __dirname + '/output.kfg' ).toString() ;
		//console.log( str ) ;
		doormen.equals( str , "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@#circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@#circularOne\n" ) ;
		fs.unlinkSync( __dirname + '/output.kfg' ) ;
	} ) ;
} ) ;


	
describe( "JS modules" , function() {
	
	it( "should load a JS module" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/js/one.js' ) ,
			require(  __dirname + '/sample/js/one.js' )
		) ;
	} ) ;
	
	it( "should load a JS module exporting a function" , function() {
		
		doormen.equals(
			typeof kungFig.load( __dirname + '/sample/function.js' ) ,
			'function'
		) ;
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/function.js' )() ,
			'world'
		) ;
	} ) ;
	
	it( "should load a JSON file with many relative dependencies and sub-references to a JS module" , function() {
		
		doormen.equals(
			kungFig.load( __dirname + '/sample/withJsIncludesRef.json' ) ,
			{
				simple: 'test',
				firstInclude: require(  __dirname + '/sample/js/one.js' ) ,
				nested: {
					secondInclude: require(  __dirname + '/sample/js/one.js' ).helloFunc ,
					thirdInclude: require(  __dirname + '/sample/js/one.js' ).awesomeFunc
				}
			}
		) ;
	} ) ;
	
	it( "Save JS modules" ) ;
} ) ;



describe( "Array references" , function() {
	
	it( "should load flawlessly a config which is an array with simple includes" , function() {
		
		var o = kungFig.load( __dirname + '/sample/simpleArrayRef.json' ) ;
		//console.log( JSON.stringify( o , null , '  ' ) ) ;
		doormen.equals( o , {
			array: [
				{ just: "a", simple: { test: "!" } },
				[ 1,2,3 ]
			],
			refArray: [ 1,2,3 ]
		} ) ;
		doormen.equals( o.array[ 1 ] === o.refArray , true ) ;
	} ) ;
	
	it( "should load flawlessly a config which is an array with many circular includes" , function() {
		
		var o = kungFig.load( __dirname + '/sample/withCircularIncludesArray.json' ) ;
		
		// Build the circular config here
		var shouldBe = [ "world!" ] ;
		
		var a = [ "data" ] ;
		var b = [ "data" ] ;
		a[ 1 ] = b ;
		b[ 1 ] = a ;
		
		shouldBe[ 1 ] = a ;
		shouldBe[ 2 ] = b ;
		
		doormen.equals( o , shouldBe ) ;
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
	
	it( "should load flawlessly a config which is an array with a circular reference to itself" , function() {
		
		//console.log( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.json' ) ) ;
		
		// Build the circular config here
		var shouldBe = [ "A" , [ "value" ] ] ;
		shouldBe[ 1 ][ 1 ] = shouldBe ;
		
		doormen.equals( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.json' ) , shouldBe ) ;
	} ) ;
	
	it( "should stringify a config of arrays" , function() {
		
		var str ;
		
		str = kungFig.saveJson( kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ) ;
		//console.log( str ) ;
		doormen.equals( str , '[\n  "test",\n  [\n    3,\n    [\n      "hello",\n      "world!"\n    ],\n    {\n      "just": "a",\n      "simple": {\n        "test": "!"\n      }\n    }\n  ],\n  [\n    "world!",\n    "hello",\n    3\n  ]\n]' ) ;
	} ) ;
	
	it( "should load and save flawlessly a config which is an array with many circular includes" , function() {
		
		var o , str ;
		
		o = kungFig.load( __dirname + '/sample/withCircularIncludesArray.json' ) ;
		//console.log( o ) ;
		str = kungFig.saveJson( o ) ;
		//console.log( str ) ;
		//console.log( str.replace( /\n/g , () => '\\n' ) ) ;
		doormen.equals( str , '[\n  "world!",\n  [\n    "data",\n    {\n      "@@": "#[2]"\n    }\n  ],\n  [\n    "data",\n    {\n      "@@": "#[1]"\n    }\n  ]\n]' ) ;
	} ) ;
} ) ;
	

