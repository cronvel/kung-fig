/*
	Kung Fig

	Copyright (c) 2015 - 2019 Cédric Ronvel

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

/* global describe, it, expect */

"use strict" ;



var fs = require( 'fs' ) ;
var tree = require( 'tree-kit' ) ;

var kungFig = require( '../lib/kungFig.js' ) ;



describe( "Loading a config" , function() {
	
	it( "when trying to load an unexistant file, it should throw" , function() {
		expect( () => kungFig.load( __dirname + '/sample/unexistant.json' ) ).to.throw() ;
	} ) ;
	
	it( "should load a simple JSON file without dependency" , function() {
		expect( kungFig.load( __dirname + '/sample/simple.json' ) ).to.equal( { just: 'a', simple: { test: '!' } } ) ;
	} ) ;
	
	it( "should load a simple KFG file without dependency" , function() {
		
		//console.log( require( 'util' ).inspect( kungFig.parse( fs.readFileSync( __dirname + '/sample/kfg/katana.kfg' , 'utf8' ) ) , { depth: 10 } ) ) ;
		//console.log( require( 'util' ).inspect( kungFig.load( __dirname + '/sample/kfg/katana.kfg' ) , { depth: 10 } ) ) ;
		
		expect( kungFig.load( __dirname + '/sample/kfg/katana.kfg' ) ).to.equal( {
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
		expect( kungFig.load( __dirname + '/sample/txt/lorem.txt' ) ).to.be( "Lorem ipsum dolor." ) ;
	} ) ;
	
	it( "should load a simple JSON file without dependency, containing an array" , function() {
		
		//console.log( kungFig.load( __dirname + '/sample/simpleWithArrays.json' ) ) ;
		expect( kungFig.load( __dirname + '/sample/simpleWithArrays.json' ) ).to.equal(
			{ just: [ 'a' , 'simple' , [ 'test' , '!' ] ] }
		) ;
	} ) ;
	
	it( "should load a simple JSON file without dependency, which is an array" , function() {
		
		//console.log( kungFig.load( __dirname + '/sample/simpleArray.json' ) ) ;
		expect( kungFig.load( __dirname + '/sample/simpleArray.json' ) ).to.equal(
			[ 'a' , 'simple' , [ 'test' , '!' ] ]
		) ;
	} ) ;
	
	it( "when loading a file with an unexistant dependency using the '@@', it should throw" , function() {
		expect( () => kungFig.load( __dirname + '/sample/withUnexistantInclude.json' ) ).to.throw() ;
	} ) ;
	
	it( "when loading a file with an unexistant dependency using the '@', it should not throw" , function() {
		
		expect( kungFig.load( __dirname + '/sample/withUnexistantOptionalInclude.json' ) ).to.equal(
			{
				simple: "test",
				unexistant: {}
			}
		) ;
	} ) ;
	
	it( "when loading a file with a bad JSON content dependency using the '@', it should throw" , function() {
		expect( () => kungFig.load( __dirname + '/sample/withBadOptionalInclude.json' ) ).to.throw() ;
	} ) ;
	
	it( "when loading a file, all Tree-Ops should be reduced" , function() {
		
		expect( kungFig.load( __dirname + '/sample/withTreeOps.json' ) ).to.equal(
			{
				simple: "test",
				int: 7
			}
		) ;
	} ) ;
	
	it( "when loading a file and explicitly turning the 'reduce' option off, Tree Operations should not be reduced" , function() {
		
		expect( kungFig.load( __dirname + '/sample/withTreeOps.json' , { reduce: false } ) ).to.equal(
			{
				simple: "test",
				int: 5,
				"+int": 2
			}
		) ;
	} ) ;
	
	it( "should load a JSON file with a txt dependency" , function() {
		
		expect( kungFig.load( __dirname + '/sample/withTxtInclude.json' ) ).to.equal(
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
		
		expect( kungFig.load( __dirname + '/sample/withIncludes.json' ) ).to.equal(
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
		
		expect( kungFig.load( __dirname + '/sample/withGlobIncludes.json' ) ).to.equal(
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
	
	it( "should load a JSON file with a glob+merge dependency" , function() {
		
		expect( kungFig.load( __dirname + '/sample/withGlobMerge.json' ) ).to.equal(
			{
				a: "A" ,
				a2: 12 ,
				sub: {
					b: "two" ,
					b2: "two-two" ,
					subsub: {
						c: 3 ,
						c2: "C2" ,
						c3: "C3"
					}
				}
			}
		) ;
	} ) ;
	
	it( "should load a JSON file with a glob dependency that resolve to no files" , function() {
		
		expect( kungFig.load( __dirname + '/sample/withUnexistantGlobInclude.json' ) ).to.equal(
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
		
		expect( kungFig.load( __dirname + '/sample/circular.json' ) ).to.equal( shouldBe ) ;
	} ) ;
	
	it( "should RE-load flawlessly a config with a circular include to itself" , function() {
		
		// Build the circular config here
		var shouldBe = { "a": "A" } ;
		shouldBe.b = shouldBe ;
		
		expect( kungFig.load( __dirname + '/sample/circular.json' ) ).to.equal( shouldBe ) ;
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
		
		expect( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ).to.equal( shouldBe ) ;
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
		
		expect( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ).to.equal( shouldBe ) ;
	} ) ;
	
	it( "should load flawlessly a config with a reference to itself" , function() {
		
		expect( kungFig.load( __dirname + '/sample/selfReference.json' ) ).to.equal(
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
		
		expect( kungFig.load( __dirname + '/sample/withIncludesRef.json' ) ).to.equal(
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
		
		expect( kungFig.load( __dirname + '/sample/selfCircularReference.json' ) ).to.equal( shouldBe ) ;
	} ) ;
	
	it( "recursive parent search: path containing .../", () => {
		
		expect( kungFig.load( __dirname + '/sample/kfg/recursive/recursive/recursive.kfg' ) ).to.equal(
			{
				one: "oneoneone" ,
				two: {
					four: "4!" ,
					three: "3!"
				}
			}
		) ;
	} ) ;
	
	it( "recursive parent search with fixed part (i.e.: .../ in the middle of the path)" ) ;
	
	it( "path starting with ./" ) ;
	it( "path starting with ../" ) ;
	it( "path starting with ~/" ) ;
	it( "test the 'kfgFiles' option" ) ;
	it( "test the 'modulePath' option" ) ;
	it( "test the 'baseDir' option restriction" ) ;
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
		expect( kungFig.saveJson( conf ) ).to.be( '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!"\n  }\n}' ) ;
		expect( kungFig.saveKfg( conf ) ).to.be( 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n' ) ;
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
		expect( kungFig.saveJson( conf ) ).to.be( '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": "#"\n  }\n}' ) ;
		expect( kungFig.saveKfg( conf ) ).to.be( 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@#\n' ) ;
		
		
		var conf = {
			a: "Haha!",
			b: "Bee!",
			sub: {
				c: "See!"
			}
		} ;
		
		conf.sub.circular = conf.sub ;
		
		//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		expect( kungFig.saveJson( conf ) ).to.be( '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": "#sub"\n  }\n}' ) ;
		expect( kungFig.saveKfg( conf ) ).to.be( 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@#sub\n' ) ;
		
		
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
		expect( kungFig.saveJson( conf ) ).to.be( 
			'{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "sub": {\n      "c": "See!",\n      "@@circular": "#sub.sub"\n    }\n  }\n}'
		) ;
		expect( kungFig.saveKfg( conf ) ).to.be( 'a: Haha!\nb: Bee!\nsub:\n\tsub:\n\t\tc: See!\n\t\tcircular: @@#sub.sub\n' ) ;
	} ) ;
	
	it( "should load and save flawlessly a config with many circular includes" , function() {
		
		var str ;
		
		str = kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
		//console.log( str ) ;
		expect( str ).to.be( '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": "#circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": "#circularOne"\n  }\n}' ) ;
		
		str = kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
		//console.log( str ) ;
		//console.log( str.replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		expect( str ).to.be( "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@#circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@#circularOne\n" ) ;
	} ) ;
	
	it( "should load and save to disk flawlessly a config with many circular includes" , function() {
		
		var str ;
		
		kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.json' ) ;
		str = fs.readFileSync( __dirname + '/output.json' ).toString() ;
		//console.log( str ) ;
		expect( str ).to.be( '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": "#circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": "#circularOne"\n  }\n}' ) ;
		fs.unlinkSync( __dirname + '/output.json' ) ;
		
		kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.kfg' ) ;
		str = fs.readFileSync( __dirname + '/output.kfg' ).toString() ;
		//console.log( str ) ;
		expect( str ).to.be( "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@#circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@#circularOne\n" ) ;
		fs.unlinkSync( __dirname + '/output.kfg' ) ;
	} ) ;
} ) ;


	
describe( "Load meta" , function() {
	
	it( "should only load meta" , function() {
		var meta ;
		
		meta = kungFig.loadMeta( __dirname + '/sample/kfg/meta-hook.kfg' ) ;
		expect( meta.getFirstTag( 'meta' ).content ).to.be( "master" ) ;
		
		meta = kungFig.loadMeta( __dirname + '/sample/kfg/katana.kfg' ) ;
		expect( meta ).to.be( null ) ;
	} ) ;
} ) ;



describe( "JS modules" , function() {
	
	it( "should load a JS module" , function() {
		
		expect( kungFig.load( __dirname + '/sample/js/one.js' ) ).to.equal(
			require(  __dirname + '/sample/js/one.js' )
		) ;
	} ) ;
	
	it( "should load a JS module exporting a function" , function() {
		expect( kungFig.load( __dirname + '/sample/function.js' ) ).to.be.a( 'function' ) ;
		expect( kungFig.load( __dirname + '/sample/function.js' )() ).to.be( 'world' ) ;
	} ) ;
	
	it( "should load a JSON file with many relative dependencies and sub-references to a JS module" , function() {
		
		expect( kungFig.load( __dirname + '/sample/withJsIncludesRef.json' ) ).to.equal(
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
		expect( o ).to.equal( {
			array: [
				{ just: "a", simple: { test: "!" } },
				[ 1,2,3 ]
			],
			refArray: [ 1,2,3 ]
		} ) ;
		expect( o.array[ 1 ] ).to.be( o.refArray ) ;
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
		
		expect( o ).to.equal( shouldBe ) ;
	} ) ;
	
	it( "should load flawlessly a config which is an array with a reference to itself" , function() {
		
		expect( kungFig.load( __dirname + '/sample/selfReferenceArray.json' ) ).to.equal(
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
		expect( kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ).to.equal(
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
		
		expect( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.json' ) ).to.equal( shouldBe ) ;
	} ) ;
	
	it( "should stringify a config of arrays" , function() {
		
		var str ;
		
		str = kungFig.saveJson( kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ) ;
		//console.log( str ) ;
		expect( str ).to.be( '[\n  "test",\n  [\n    3,\n    [\n      "hello",\n      "world!"\n    ],\n    {\n      "just": "a",\n      "simple": {\n        "test": "!"\n      }\n    }\n  ],\n  [\n    "world!",\n    "hello",\n    3\n  ]\n]' ) ;
	} ) ;
	
	it( "should load and save flawlessly a config which is an array with many circular includes" , function() {
		
		var o , str ;
		
		o = kungFig.load( __dirname + '/sample/withCircularIncludesArray.json' ) ;
		//console.log( o ) ;
		str = kungFig.saveJson( o ) ;
		//console.log( str ) ;
		//console.log( str.replace( /\n/g , () => '\\n' ) ) ;
		expect( str ).to.be( '[\n  "world!",\n  [\n    "data",\n    {\n      "@@": "#[2]"\n    }\n  ],\n  [\n    "data",\n    {\n      "@@": "#[1]"\n    }\n  ]\n]' ) ;
	} ) ;
} ) ;
	


describe( "Async file loading" , () => {
	
	it( "load a KFG file asynchronously" , async () => {
		var object = await kungFig.loadAsync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ;
		
		expect( object ).to.equal( {
			a: 1,
			b: 2,
			c: 3,
			'some key': 'some value',
			d: null,
			e1: true,
			e2: true,
			e3: true,
			f1: false,
			f2: false,
			f3: false,
			g: NaN,
			h: Infinity,
			i: -Infinity,
			j1: {},
			j2: [],
			sub: 
				{ sub: { 'another key': 'another value' },
				k: 1,
				l: 2,
				sub2: { subway: 'no!' } },
			sub2: { no: 'way' },
			sub3: { nooo: 'wai!' },
			text: "A cool story:\n\nIt all started a Friday..." ,
			"inline-string": "This is an inline string!" ,
			list: [ 'one', 'two', 'three' ],
			'list embedded': 
				[ { 'first name': 'Bill', 'last name': 'Baroud' },
				{ 'first name': 'Joe', 'last name': 'Doe' },
				[ [ 'one', 'two', 'three' ],
				[ 'four', 'five' ],
				[ 'six', 'seven' ] ],
				{ 'first name': 'Bill', 'last name': 'Baroud' },
				{ 'first name': 'Joe', 'last name': 'Doe' },
				[ [ 'one', 'two', 'three' ],
				[ 'four', 'five' ],
				[ 'six', 'seven' ] ] ]
		} ) ;
		
		//console.log( kungFig.getMeta( object ).getFirstTag( 'meta' ).content ) ;
		expect( kungFig.getMeta( object ).getFirstTag( 'meta' ).content ).to.equal( { content: "test" } ) ;
	} ) ;
	
	it( "load meta of a KFG file asynchronously" , async () => {
		var meta = await kungFig.loadMetaAsync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ;
		expect( meta.getFirstTag( 'meta' ).content ).to.equal( { content: "test" } ) ;
	} ) ;
} ) ;


