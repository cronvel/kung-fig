/*
	Kung Fig

	Copyright (c) 2015 - 2021 Cédric Ronvel

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



const fs = require( 'fs' ) ;
const tree = require( 'tree-kit' ) ;

const kungFig = require( '../lib/kungFig.js' ) ;



describe( "Loading a config" , () => {

	it( "when trying to load an unexistant file, it should throw" , () => {
		expect( () => kungFig.load( __dirname + '/sample/unexistant.kfg' ) ).to.throw() ;
	} ) ;

	it( "should load a simple JSON file without dependency" , () => {
		expect( kungFig.load( __dirname + '/sample/simple.json' ) ).to.equal( { just: 'a' , simple: { test: '!' } } ) ;
	} ) ;

	it( "should load a simple KFG file without dependency" , () => {
		expect( kungFig.load( __dirname + '/sample/simple.kfg' ) ).to.equal( { just: 'a' , simple: { test: '!' } } ) ;
	} ) ;

	it( "should load a small KFG file without dependency" , () => {
		expect( kungFig.load( __dirname + '/sample/kfg/katana.kfg' ) ).to.equal( {
			class: 'katana' ,
			generic: 'saber' ,
			hands: 2 ,
			name: 'katana' ,
			description: 'This is a wonderful katana with a blueish blade!\nThis is a two-handed weapon.' ,
			durability: 24 ,
			melee: {
				'+toHit': -2 ,
				'+attack': 6 ,
				'*AT': 12 ,
				'+reach': 7 ,
				size: 4 ,
				'+power': 3 ,
				damages: [
					{ type: 'cutting' , '+damage': 14 } ,
					{ type: 'fire' , damage: 10 }
				]
			}
		}
		) ;
	} ) ;

	it( "should load a simple txt file" , () => {
		expect( kungFig.load( __dirname + '/sample/txt/lorem.txt' ) ).to.be( "Lorem ipsum dolor." ) ;
	} ) ;

	it( "should load a simple KFG file without dependency, containing an array" , () => {
		expect( kungFig.load( __dirname + '/sample/simpleWithArrays.kfg' ) ).to.equal(
			{ just: [ 'a' , 'simple' , [ 'test' , '!' ] ] }
		) ;
	} ) ;

	it( "should load a simple JSON file without dependency, which is an array" , () => {
		expect( kungFig.load( __dirname + '/sample/simpleArray.kfg' ) ).to.equal(
			[ 'a' , 'simple' , [ 'test' , '!' ] ]
		) ;
	} ) ;


	it( "when loading a file, all Tree-Ops should be reduced" , () => {
		expect( kungFig.load( __dirname + '/sample/withTreeOps.kfg' ) ).to.equal(
			{
				simple: "test" ,
				int: 7
			}
		) ;
	} ) ;

	it( "when loading a file and explicitly turning the 'reduce' option off, Tree Operations should not be reduced" , () => {
		expect( kungFig.load( __dirname + '/sample/withTreeOps.kfg' , { reduce: false } ) ).to.equal(
			{
				simple: "test" ,
				int: 5 ,
				"+int": 2
			}
		) ;
	} ) ;

	it( "test the 'kfgFiles' option" ) ;
	it( "test the 'modulePath' option" ) ;
	it( "test the 'baseDir' option restriction" ) ;
} ) ;



describe( "Dependencies (aka includes) and references" , () => {
	it( "when loading a file with an unexistant dependency using the '@@', it should throw" , () => {
		expect( () => kungFig.load( __dirname + '/sample/withUnexistantInclude.kfg' ) ).to.throw() ;
	} ) ;

	it( "when loading a file with an unexistant dependency using the '@', it should not throw" , () => {
		var o = kungFig.load( __dirname + '/sample/withUnexistantOptionalInclude.kfg' ) ;
		//console.log( "object:" , o ) ;
		expect( o ).to.equal( {
			simple: "test" ,
			unexistant: null
		} ) ;
	} ) ;

	it( "when loading a file with a malformed target dependency using the '@', it should throw" , () => {
		expect( () => kungFig.load( __dirname + '/sample/withBadOptionalInclude.kfg' ) ).to.throw() ;
	} ) ;

	it( "should load a KFG file with a dependency as a property" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyAsProperty.kfg' ) ).to.equal( {
			simple: "test" ,
			firstInclude: { just: "a" , simple: { test: "!" } } ,
			nested: {
				secondInclude: { just: "a" , simple: { test: "!" } }
			}
		} ) ;
	} ) ;
	
	it( "should load a KFG file with a dependency as an element" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyAsElement.kfg' ) ).to.equal( [
			"test" ,
			{ just: "a" , simple: { test: "!" } } ,
			[ { just: "a" , simple: { test: "!" } } ] ,
		] ) ;
	} ) ;
	
	it( "should load a KFG file with a dependency as value" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyAsValue.kfg' ) ).to.equal( {
			sub: { just: "a" , simple: { test: "!" } }
		} ) ;
	} ) ;
	
	it( "should load a KFG file with a dependency as a tag content" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyAsTagContent.kfg' ) ).to.be.like( {
			children: [
				{ name: 'tag', content: undefined, attributes: null } ,
				{ name: 'module', content: { just: "a" , simple: { test: "!" } } , attributes: null } ,
				{ name: 'module', content: { just: "a" , simple: { test: "!" } } , attributes: null } ,
				{ name: 'internal', attributes: null , content: { children: [
					{ name: 'module', content: { just: "a" , simple: { test: "!" } } , attributes: null }
				] } }
			]
		} ) ;
	} ) ;

	it( "dependencies inside instances" , () => {
		function Simple( value ) {
			var self = Object.create( Simple.prototype ) ;
			self.str = value ;
			return self ;
		}
		
		function Complex( value ) {
			var self = Object.create( Complex.prototype ) ;
			self.str = value.str ;
			self.int = value.int ;
			return self ;
		}
		
		var options = {
			classes: {
				simple: Simple ,
				complex: Complex
			}
		} ;
		
		var object ;

		object = kungFig.load( __dirname + '/sample/kfg/custom-instances.kfg' , options ) ;
		expect( object ).to.be.like( {
			simple: { str: 'abc' } ,
			complex: { str: 'hello' , int: 6 }
		} ) ;
		expect( object.simple ).to.be.a( Simple ) ;
		expect( object.complex ).to.be.a( Complex ) ;

		object = kungFig.load( __dirname + '/sample/kfg/include-in-custom-instances.kfg' , options ) ;

		expect( object ).to.be.like( {
			simple: { str: 'def' } ,
			complex: { str: 'world' , int: 21 }
		} ) ;
		expect( object.simple ).to.be.a( Simple ) ;
		expect( object.complex ).to.be.a( Complex ) ;
	} ) ;

	it( "dependencies inside instances with merge" , () => {
		function Complex( value ) {
			var self = Object.create( Complex.prototype ) ;
			self.str = value.str ;
			self.int = value.int ;
			return self ;
		}
		
		var options = {
			classes: {
				complex: Complex
			}
		} ;
		
		var object ;

		object = kungFig.load( __dirname + '/sample/kfg/merge-include-in-custom-instances.kfg' , options ) ;
		
		expect( object ).to.be.like( {
			"merge-after": { str: 'world' , int: 21 } ,
			"merge-before": { str: 'some text' , int: 30 } ,
			"partial-merge-after": { str: 'some text' , int: 21 } ,
			"partial-merge-before": { str: 'some text' , int: 30 } ,
			"partial-merge-before2": { str: 'some text' , int: 21 }
		} ) ;
		expect( object['merge-after'] ).to.be.a( Complex ) ;
		expect( object['merge-before'] ).to.be.a( Complex ) ;
		expect( object['partial-merge-after'] ).to.be.a( Complex ) ;
		expect( object['partial-merge-before'] ).to.be.a( Complex ) ;
		expect( object['partial-merge-before2'] ).to.be.a( Complex ) ;
	} ) ;
	
	it( "dependencies inside instances with merge" , () => {
		function Complex( value ) {
			var self = Object.create( Complex.prototype ) ;
			self.str = value.str ;
			self.int = value.int ;
			self.sub = value.sub ;
			return self ;
		}
		
		var options = {
			classes: {
				complex: Complex
			}
		} ;
		
		var object ;

		object = kungFig.load( __dirname + '/sample/kfg/include-in-instance-in-include-in-instance.kfg' , options ) ;
		
		expect( object ).to.be.like( {
			complex: {
				str: 'bob' ,
				int: 77 ,
				sub: {
					"merge-after": { str: 'world' , int: 21 } ,
					"merge-before": { str: 'some text' , int: 30 } ,
					"partial-merge-after": { str: 'some text' , int: 21 } ,
					"partial-merge-before": { str: 'some text' , int: 30 } ,
					"partial-merge-before2": { str: 'some text' , int: 21 }
				}
			}
		} ) ;
		expect( object.complex ).to.be.a( Complex ) ;
		expect( object.complex.sub['merge-after'] ).to.be.a( Complex ) ;
		expect( object.complex.sub['merge-before'] ).to.be.a( Complex ) ;
		expect( object.complex.sub['partial-merge-after'] ).to.be.a( Complex ) ;
		expect( object.complex.sub['partial-merge-before'] ).to.be.a( Complex ) ;
		expect( object.complex.sub['partial-merge-before2'] ).to.be.a( Complex ) ;
	} ) ;
	
	it( "should load a KFG file which is a top-level dependency" , () => {
		expect( kungFig.load( __dirname + '/sample/topLevelDependency.kfg' ) ).to.equal( {
			"hello": "world!"
		} ) ;
	} ) ;

	it( "should load a KFG file with a dependency that merge with existing properties (after)" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyMergeAfter.kfg' ) ).to.equal( {
			sub: { just: "a" , simple: { test: "!" , and: "test" } , extra: "value" }
		} ) ;
	} ) ;
	
	it( "should load a KFG file with a MISSING dependency that would have merged with existing properties (after)" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyMissingMergeAfter.kfg' ) ).to.equal( {
			sub: { just: "the" , simple: { test: "?" , and: "test" } , extra: "value" }
		} ) ;
	} ) ;
	
	it( "should load a KFG file with a dependency that merge with existing properties (before)" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyMergeBefore.kfg' ) ).to.equal( {
			sub: { just: "the" , simple: { test: "!" , and: "test" } , extra: "value" }
		} ) ;
	} ) ;
	
	it( "should load a KFG file with a MISSING dependency that would have merge with existing properties (before)" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyMissingMergeBefore.kfg' ) ).to.equal( {
			sub: { just: "the" , simple: { and: "test" } , extra: "value" }
		} ) ;
	} ) ;
	
	it( "should load a KFG file with an overwriting sequence of dependencies" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyMergeSequence.kfg' ) ).to.equal( {
			sub: {
				a: 15 ,
				a2: 12 ,
				sub: {
					b: "overwrite" ,
					b2: "two-two" ,
					subsub: {
						c2: false ,
						c3: "C3" ,
						c4: "C4"
					}
				}
			}
		} ) ;
	} ) ;
	
	it( "should load a KFG file with an overwriting sequence of dependencies with local data before" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyMergeSequenceAndLocalBefore.kfg' ) ).to.equal( {
			sub: {
				a: 15 ,
				a2: 12 ,
				a3: "A3" ,
				sub: {
					b: "overwrite" ,
					b2: "two-two" ,
					b3: "B3" ,
					subsub: {
						c2: false ,
						c3: "C3" ,
						c4: "C4"
					}
				}
			}
		} ) ;
	} ) ;
	
	it( "should load a KFG file with an overwriting sequence of dependencies with local data after" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyMergeSequenceAndLocalAfter.kfg' ) ).to.equal( {
			sub: {
				a: "will overwrite" ,
				a2: 12 ,
				a3: "A3" ,
				sub: {
					b: "will overwrite 2x" ,
					b2: "two-two" ,
					b3: "B3" ,
					subsub: {
						c2: false ,
						c3: "C3" ,
						c4: "C4"
					}
				}
			}
		} ) ;
	} ) ;
	
	it( "should load a KFG file with an overwriting sequence of dependencies with local data in between" , () => {
		expect( kungFig.load( __dirname + '/sample/dependencyMergeSequenceAndLocalBetween.kfg' ) ).to.equal( {
			sub: {
				a: 15 ,
				a2: 12 ,
				a3: "A3" ,
				sub: {
					b: "overwrite" ,
					b2: "will overwrite" ,
					b3: "B3" ,
					subsub: {
						c2: false ,
						c3: "C3" ,
						c4: "C4"
					}
				}
			}
		} ) ;
	} ) ;
	
	it( "should load a KFG file with a KFG dependency" , () => {
		expect( kungFig.load( __dirname + '/sample/withKfgInclude.kfg' ) ).to.equal( {
			simple: "test" ,
			firstInclude: { just: "a" , simple: { test: "!" } } ,
			nested: {
				secondInclude: { just: "a" , simple: { test: "!" } }
			}
		} ) ;
	} ) ;
	
	it( "should load a KFG file with a JSON dependency" , () => {
		expect( kungFig.load( __dirname + '/sample/withJsonInclude.kfg' ) ).to.equal( {
			simple: "test" ,
			firstInclude: { just: "a" , simple: { test: "!" } } ,
			nested: {
				secondInclude: { just: "a" , simple: { test: "!" } }
			}
		} ) ;
	} ) ;
	
	it( "should load a KFG file with a TXT dependency" , () => {
		expect( kungFig.load( __dirname + '/sample/withTxtInclude.kfg' ) ).to.equal( {
			"simple": "test" ,
			"firstInclude": "Lorem ipsum dolor." ,
			"nested": {
				"secondInclude": "Lorem ipsum dolor."
			}
		} ) ;
	} ) ;

	it( "should load a KFG file with many relative dependencies" , () => {
		expect( kungFig.load( __dirname + '/sample/withIncludes.kfg' ) ).to.equal( {
			simple: 'test' ,
			firstInclude: {
				one: 1 ,
				two: {
					three: 3 ,
					four: {
						hello: 'world!'
					} ,
					five: {
						just: 'a' ,
						simple: {
							test: '!'
						}
					}
				}
			} ,
			nested: {
				secondInclude: {
					hello: 'world!'
				}
			}
		} ) ;
	} ) ;

	it( "should load a KFG file with a glob dependency" , () => {
		expect( kungFig.load( __dirname + '/sample/withGlobIncludes.kfg' ) ).to.equal( {
			simple: 'test' ,
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
		} ) ;
	} ) ;

	it( "should load a KFG file with a glob dependency that resolve to no files" , () => {
		expect( kungFig.load( __dirname + '/sample/withUnexistantGlobInclude.kfg' ) ).to.equal( {
			simple: 'test' ,
			globInclude: []
		} ) ;
	} ) ;

	it( "should load flawlessly a config with a circular include to itself (its root)" , () => {
		// Build the circular config here
		var shouldBe = { "a": "A" } ;
		shouldBe.b = shouldBe ;

		expect( kungFig.load( __dirname + '/sample/circular.kfg' ) ).to.equal( shouldBe ) ;

		// Should be able to reload it (cache bug test)
		expect( kungFig.load( __dirname + '/sample/circular.kfg' ) ).to.equal( shouldBe ) ;
		expect( kungFig.load( __dirname + '/sample/circular.kfg' ) ).to.equal( shouldBe ) ;
	} ) ;

	it( "should load flawlessly a config with many circular includes" , () => {
		// Build the circular config here
		var shouldBe = { "hello": "world!" } ;

		var a = { "some": "data" } ;
		var b = { "more": "data" } ;
		a.toBe = b ;
		b.toA = a ;

		shouldBe.circularOne = a ;
		shouldBe.circularTwo = b ;

		expect( kungFig.load( __dirname + '/sample/withCircularIncludes.kfg' ) ).to.equal( shouldBe ) ;

		// Should be able to reload it (cache bug test)
		expect( kungFig.load( __dirname + '/sample/withCircularIncludes.kfg' ) ).to.equal( shouldBe ) ;
		expect( kungFig.load( __dirname + '/sample/withCircularIncludes.kfg' ) ).to.equal( shouldBe ) ;
	} ) ;

	it( "should load flawlessly a config with a reference to itself" , () => {
		var shouldBe = {
			"a": "A" ,
			"sub": {
				"key": "value" ,
				"refA": "A"
			} ,
			"refB": {
				"key": "value" ,
				"refA": "A"
			} ,
			"refC": "value"
		} ;
		
		expect( kungFig.load( __dirname + '/sample/selfReference.kfg' ) ).to.equal( shouldBe ) ;

		// Should be able to reload it (cache bug test)
		expect( kungFig.load( __dirname + '/sample/selfReference.kfg' ) ).to.equal( shouldBe ) ;
		expect( kungFig.load( __dirname + '/sample/selfReference.kfg' ) ).to.equal( shouldBe ) ;
	} ) ;

	it( "should load a KFG file with many relative dependencies and sub-references" , () => {
		var shouldBe = {
			simple: 'test' ,
			firstInclude: {
				three: 3 ,
				four: {
					hello: 'world!'
				} ,
				five: {
					just: 'a' ,
					simple: {
						test: '!'
					}
				}
			} ,
			nested: {
				secondInclude: 'world!' ,
				thirdInclude: 3
			}
		} ;
		
		expect( kungFig.load( __dirname + '/sample/withIncludesRef.kfg' ) ).to.equal( shouldBe ) ;

		// Should be able to reload it (cache bug test)
		expect( kungFig.load( __dirname + '/sample/withIncludesRef.kfg' ) ).to.equal( shouldBe ) ;
		expect( kungFig.load( __dirname + '/sample/withIncludesRef.kfg' ) ).to.equal( shouldBe ) ;
	} ) ;

	it( "should load flawlessly a config with a circular reference to itself" , () => {
		// Build the circular config here
		var shouldBe = {
			"a": "A" ,
			"sub": {
				"key": "value"
			}
		} ;

		shouldBe.sub.ref = shouldBe ;

		expect( kungFig.load( __dirname + '/sample/selfCircularReference.kfg' ) ).to.equal( shouldBe ) ;

		// Should be able to reload it (cache bug test)
		expect( kungFig.load( __dirname + '/sample/selfCircularReference.kfg' ) ).to.equal( shouldBe ) ;
		expect( kungFig.load( __dirname + '/sample/selfCircularReference.kfg' ) ).to.equal( shouldBe ) ;
	} ) ;

	it( "recursive parent search: path containing .../" , () => {
		expect( kungFig.load( __dirname + '/sample/kfg/recursive/recursive/recursive.kfg' ) ).to.equal( {
			one: "oneoneone" ,
			two: {
				four: "4!" ,
				three: "3!"
			}
		} ) ;
	} ) ;

	it( "should load flawlessly a config which is an array with simple includes" , () => {
		var o = kungFig.load( __dirname + '/sample/simpleArrayRef.kfg' ) ;
		//console.log( JSON.stringify( o , null , '  ' ) ) ;
		expect( o ).to.equal( {
			array: [
				{ just: "a" , simple: { test: "!" } } ,
				[ 1 , 2 , 3 ]
			] ,
			refArray: [ 1 , 2 , 3 ]
		} ) ;
		expect( o.array[ 1 ] ).to.be( o.refArray ) ;
	} ) ;

	it( "should load flawlessly a config which is an array with many circular includes" , () => {
		var o = kungFig.load( __dirname + '/sample/withCircularIncludesArray.kfg' ) ;

		// Build the circular config here
		var shouldBe = [ "world!" ] ;

		var a = [ "data" ] ;
		var b = [ "data" ] ;
		a[ 1 ] = b ;
		b[ 1 ] = a ;

		shouldBe[ 1 ] = a ;
		shouldBe[ 2 ] = b ;

		expect( o ).to.equal( shouldBe ) ;
		
		// Should be able to reload it (cache bug test)
		expect( o ).to.equal( shouldBe ) ;
		expect( o ).to.equal( shouldBe ) ;
	} ) ;

	it( "should load flawlessly a config which is an array with a reference to itself" , () => {
		var shouldBe = [
			"A" ,
			[
				"value" ,
				"A"
			] ,
			[
				"value" ,
				"A"
			] ,
			"value"
		] ;
		
		expect( kungFig.load( __dirname + '/sample/selfReferenceArray.kfg' ) ).to.equal( shouldBe ) ;

		// Should be able to reload it (cache bug test)
		expect( kungFig.load( __dirname + '/sample/selfReferenceArray.kfg' ) ).to.equal( shouldBe ) ;
		expect( kungFig.load( __dirname + '/sample/selfReferenceArray.kfg' ) ).to.equal( shouldBe ) ;
	} ) ;

	it( "should load a JSON file which is an array with many relative dependencies and sub-references" , () => {
		var shouldBe = [
			'test' ,
			[
				3 ,
				[ 'hello' , 'world!' ] ,
				{
					just: 'a' ,
					simple: {
						test: '!'
					}
				}
			] ,
			[
				'world!' ,
				'hello' ,
				3
			]
		] ;
		
		expect( kungFig.load( __dirname + '/sample/withIncludesRefArray.kfg' ) ).to.equal( shouldBe ) ;
		
		// Should be able to reload it (cache bug test)
		expect( kungFig.load( __dirname + '/sample/withIncludesRefArray.kfg' ) ).to.equal( shouldBe ) ;
		expect( kungFig.load( __dirname + '/sample/withIncludesRefArray.kfg' ) ).to.equal( shouldBe ) ;
	} ) ;

	it( "should load flawlessly a config which is an array with a circular reference to itself" , () => {
		// Build the circular config here
		var shouldBe = [ "A" , [ "value" ] ] ;
		shouldBe[ 1 ][ 1 ] = shouldBe ;

		expect( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.kfg' ) ).to.equal( shouldBe ) ;
		
		// Should be able to reload it (cache bug test)
		expect( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.kfg' ) ).to.equal( shouldBe ) ;
		expect( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.kfg' ) ).to.equal( shouldBe ) ;
	} ) ;

	it( "should load and save flawlessly a config which is an array with many circular includes" , () => {
		var o , str ;

		o = kungFig.load( __dirname + '/sample/withCircularIncludesArray.kfg' ) ;
		//console.log( o ) ;
		str = kungFig.saveKFG( o ) ;
		//console.log( "Final:" , str ) ;
		console.log( str.replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		//expect( str ).to.be( '[\n  "world!",\n  [\n    "data",\n    {\n      "@@": "#[2]"\n    }\n  ],\n  [\n    "data",\n    {\n      "@@": "#[1]"\n    }\n  ]\n]' ) ;
		expect( str ).to.be( '- world!\n-\t- data\n\t- @#[2]\n-\t- data\n\t- @#[1]\n' ) ;
	} ) ;

	it( "recursive parent search with fixed part (i.e.: .../ in the middle of the path)" ) ;

	it( "path starting with ./" ) ;
	it( "path starting with ../" ) ;
	it( "path starting with ~/" ) ;
} ) ;



describe( "Saving a config" , () => {

	it( "should stringify a simple config" , () => {
		var conf = {
			a: "Haha!" ,
			b: "Bee!" ,
			sub: {
				c: "See!"
			}
		} ;

		//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		expect( kungFig.saveJson( conf ) ).to.be( '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!"\n  }\n}' ) ;
		expect( kungFig.saveKfg( conf ) ).to.be( 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n' ) ;
	} ) ;

	it( "should stringify a config that have circular references" , () => {
		var conf ;

		conf = {
			a: "Haha!" ,
			b: "Bee!" ,
			sub: {
				c: "See!"
			}
		} ;

		conf.sub.circular = conf ;

		//console.log( kungFig.saveJson( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		expect( kungFig.saveJson( conf ) ).to.be( '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": "#"\n  }\n}' ) ;
		expect( kungFig.saveKfg( conf ) ).to.be( 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@#\n' ) ;


		conf = {
			a: "Haha!" ,
			b: "Bee!" ,
			sub: {
				c: "See!"
			}
		} ;

		conf.sub.circular = conf.sub ;

		//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		expect( kungFig.saveJson( conf ) ).to.be( '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": "#sub"\n  }\n}' ) ;
		expect( kungFig.saveKfg( conf ) ).to.be( 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@#sub\n' ) ;


		conf = {
			a: "Haha!" ,
			b: "Bee!" ,
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

	it( "should load and save flawlessly a config with many circular includes" , () => {
		var str ;

		str = kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.kfg' ) ) ;
		//console.log( str ) ;
		expect( str ).to.be( '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": "#circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": "#circularOne"\n  }\n}' ) ;

		str = kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.kfg' ) ) ;
		//console.log( str ) ;
		//console.log( str.replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
		expect( str ).to.be( "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@#circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@#circularOne\n" ) ;
	} ) ;

	it( "should load and save to disk flawlessly a config with many circular includes" , () => {
		var str ;

		kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.kfg' ) , __dirname + '/output.json' ) ;
		str = fs.readFileSync( __dirname + '/output.json' ).toString() ;
		//console.log( str ) ;
		expect( str ).to.be( '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": "#circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": "#circularOne"\n  }\n}' ) ;
		fs.unlinkSync( __dirname + '/output.json' ) ;

		kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.kfg' ) , __dirname + '/output.kfg' ) ;
		str = fs.readFileSync( __dirname + '/output.kfg' ).toString() ;
		//console.log( str ) ;
		expect( str ).to.be( "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@#circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@#circularOne\n" ) ;
		fs.unlinkSync( __dirname + '/output.kfg' ) ;
	} ) ;

	it( "should stringify a config of arrays" , () => {
		var str ;

		str = kungFig.saveJson( kungFig.load( __dirname + '/sample/withIncludesRefArray.kfg' ) ) ;
		//console.log( str ) ;
		expect( str ).to.be( '[\n  "test",\n  [\n    3,\n    [\n      "hello",\n      "world!"\n    ],\n    {\n      "just": "a",\n      "simple": {\n        "test": "!"\n      }\n    }\n  ],\n  [\n    "world!",\n    "hello",\n    3\n  ]\n]' ) ;
	} ) ;
} ) ;



describe( "Load meta tags" , () => {

	it( "should only load meta tags" , () => {
		var metaTags ;

		metaTags = kungFig.loadMetaTags( __dirname + '/sample/kfg/meta-hook.kfg' ) ;
		expect( metaTags.getFirstTag( 'meta' ).content ).to.be( "master" ) ;

		metaTags = kungFig.loadMetaTags( __dirname + '/sample/kfg/katana.kfg' ) ;
		expect( metaTags.children ).to.equal( [] ) ;
	} ) ;
} ) ;



describe( "JS modules" , () => {

	it( "should load a JS module" , () => {
		expect( kungFig.load( __dirname + '/sample/js/one.js' ) ).to.equal(
			require(  __dirname + '/sample/js/one.js' )
		) ;
	} ) ;

	it( "should load a JS module exporting a function" , () => {
		expect( kungFig.load( __dirname + '/sample/function.js' ) ).to.be.a( 'function' ) ;
		expect( kungFig.load( __dirname + '/sample/function.js' )() ).to.be( 'world' ) ;
	} ) ;

	it( "should load a JSON file with many relative dependencies and sub-references to a JS module" , () => {
		expect( kungFig.load( __dirname + '/sample/withJsIncludesRef.kfg' ) ).to.equal( {
			simple: 'test' ,
			firstInclude: require(  __dirname + '/sample/js/one.js' ) ,
			nested: {
				secondInclude: require(  __dirname + '/sample/js/one.js' ).helloFunc ,
				thirdInclude: require(  __dirname + '/sample/js/one.js' ).awesomeFunc
			}
		} ) ;
	} ) ;

	it( "Save JS modules" ) ;
} ) ;



describe( "Async file loading" , () => {

	it( "load a KFG file asynchronously" , async() => {
		var object = await kungFig.loadAsync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ;

		expect( object ).to.equal( {
			a: 1 ,
			b: 2 ,
			c: 3 ,
			'some key': 'some value' ,
			d: null ,
			e1: true ,
			e2: true ,
			e3: true ,
			f1: false ,
			f2: false ,
			f3: false ,
			g: NaN ,
			h: Infinity ,
			i: -Infinity ,
			j1: {} ,
			j2: [] ,
			sub:
				{
					sub: { 'another key': 'another value' } ,
					k: 1 ,
					l: 2 ,
					sub2: { subway: 'no!' }
				} ,
			sub2: { no: 'way' } ,
			sub3: { nooo: 'wai!' } ,
			text: "A cool story:\n\nIt all started a Friday..." ,
			"inline-string": "This is an inline string!" ,
			list: [ 'one' , 'two' , 'three' ] ,
			'list embedded':
				[ { 'first name': 'Bill' , 'last name': 'Baroud' } ,
					{ 'first name': 'Joe' , 'last name': 'Doe' } ,
					[ [ 'one' , 'two' , 'three' ] ,
						[ 'four' , 'five' ] ,
						[ 'six' , 'seven' ] ] ,
					{ 'first name': 'Bill' , 'last name': 'Baroud' } ,
					{ 'first name': 'Joe' , 'last name': 'Doe' } ,
					[ [ 'one' , 'two' , 'three' ] ,
						[ 'four' , 'five' ] ,
						[ 'six' , 'seven' ] ] ]
		} ) ;

		//console.log( kungFig.getMeta( object ).getFirstTag( 'meta' ).content ) ;
		expect( kungFig.getMeta( object ).tags.getFirstTag( 'meta' ).content ).to.equal( { content: "test" } ) ;
	} ) ;

	it( "load meta of a KFG file asynchronously" , async() => {
		var metaTags = await kungFig.loadMetaTagsAsync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ;
		expect( metaTags.getFirstTag( 'meta' ).content ).to.equal( { content: "test" } ) ;
	} ) ;
} ) ;



describe( "Historical bugs" , () => {
	
	it( ".saveKfg() bug with tags" , () => {
		var content = fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) ;
		var expected = fs.readFileSync( __dirname + '/sample/kfg/tag.expected.kfg' , 'utf8' ) ;
		var o = kungFig.parse( content ) ;
		var s = kungFig.saveKfg( o , __dirname + '/sample/output.kfg' ) ;
		//console.log( s ) ;
		expect( s ).to.be( expected ) ;
	} ) ;

	it( "array element repetition and includeRef bug" , () => {
		var o = kungFig.load( __dirname + '/sample/elementRepetition.kfg' ) ;
		
		var e1 = {
			just: "a" ,
			simple: {
				test: "!"
			}
		} ;
		
		var e2 = [ "a" , "simple" , [ "test" , "!" ] ] ;
		
		expect( o ).to.equal( [ e1 , e1 , e2 , e2 , e2 ] ) ;

		o = kungFig.load( __dirname + '/sample/elementRepetitionInRepetition.kfg' ) ;
		
		var e1 = {
			just: "a" ,
			simple: {
				test: "!"
			}
		} ;
		
		var e2 = [ "a" , "simple" , [ "test" , "!" ] ] ;
		
		expect( o ).to.equal( [ [ e1 , e1 , e1 , e2 , e2 ] , [ e1 , e1 , e1 , e2 , e2 ] ] ) ;
	} ) ;
} ) ;
	
