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
var stringify = kungFig.stringify ;
var parse = kungFig.parse ;
var Tag = kungFig.Tag ;
var TagContainer = kungFig.TagContainer ;

var doormen = require( 'doormen' ) ;
var expect = require( 'expect.js' ) ;
var string = require( 'string-kit' ) ;
var fs = require( 'fs' ) ;



describe( "KFG stringify" , function() {
	
	it( "stringify string" , function() {
		doormen.equals( stringify( "Hello World!" ) , 'Hello World!\n' ) ;
		doormen.equals( stringify( "a:1" ) , '"a:1"\n' ) ;
		doormen.equals( stringify( "Hello: World!" ) , '"Hello: World!"\n' ) ;
		doormen.equals( stringify( "[Hello World!]" ) , '"[Hello World!]"\n' ) ;
		doormen.equals( stringify( "<hello>" ) , '"<hello>"\n' ) ;
		doormen.equals( stringify( "(hello)" ) , '"(hello)"\n' ) ;
		doormen.equals( stringify( "   Hello World!" ) , '"   Hello World!"\n' ) ;
		doormen.equals( stringify( "Hello World!   " ) , '"Hello World!   "\n' ) ;
	} ) ;
		
	it( "stringify multi-line string" , function() {
		doormen.equals( stringify( "Hello\nWorld!" ) , '"Hello\\nWorld!"\n' ) ;
	} ) ;
	
	it( "stringify non-string scalar" , function() {
		doormen.equals( stringify( undefined ) , "null\n" ) ;
		doormen.equals( stringify( null ) , "null\n" ) ;
		doormen.equals( stringify( true ) , "true\n" ) ;
		doormen.equals( stringify( false ) , "false\n" ) ;
		doormen.equals( stringify( 123 ) , "123\n" ) ;
		doormen.equals( stringify( 123.456 ) , "123.456\n" ) ;
	} ) ;
	
	it( "stringify empty object/array" , function() {
		doormen.equals( stringify( [] ) , '<Array>\n' ) ;
		doormen.equals( stringify( {} ) , '<Object>\n' ) ;
		doormen.equals( stringify( new TagContainer() ) , '<TagContainer>\n' ) ;
	} ) ;
	
	it( "undefined value" , function() {
		doormen.equals( stringify( {a:{},b:undefined,c:{d:undefined}} ) , 'a: <Object>\nc: <Object>\n' ) ;
		doormen.equals( stringify( [{},undefined,{d:undefined}] ) , '- <Object>\n- null\n- <Object>\n' ) ;
	} ) ;
	
	it( "stringify a basic object" , function() {
		var o = {
			a: 1 ,
			b: "bob" ,
			c: null ,
			d: true ,
			e: false ,
			f: NaN ,
			g: Infinity ,
			h: - Infinity ,
			j1: {} ,
			j2: [] ,
			needQuote: {
				a: "1" ,
				c: "null" ,
				d: "true" ,
				e: "false" ,
				f: "NaN" ,
				g: "Infinity" ,
				h: "-Infinity" ,
				sp1: " bob" ,
				sp2: "bob " ,
				sp3: "bob\nbob" ,
				sp4: '"bob\nbob"' ,
			} ,
			"some key": "some value" ,
			"some-key": "some value" ,
			"some_key": "some value" ,
			"1key": "1value" ,
			obj: {
				i: 'ay',
				j: 'djay',
			} ,
			obj2: {
				k: 'K',
				l: 'L',
			} ,
			arr: [ 1,2,3 ] ,
			arr2: [ 4,5,6, [ 7,8,9 ] , { m: 'm' , n: 'n' } ] ,
		} ;
		
		var s = stringify( o ) ;
		//console.log( s ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		doormen.equals( o , parse( s ) ) ;
		//require( 'expect.js' )( o ).to.eql( parse( s ) ) ;
	} ) ;
	
	it( "stringify an object with operators" , function() {
		var o = {
			'+attack': 2,
			'-defense': 1,
			'*time': 0.9,
			'(u-ops)damages': 1.2,
			'()+strange key': 3,
			'()(another strange key)': 5,
			'()-hey': 5,
			'~hey': 5,
			'@@#*>': '/path/to/*/something/',
			'@*>': '/path/to/something/',
			'@': '/path/to/something/',
			'@@': '/path/to/something/',
			list: [ 'one' , 'two' , { "@@": '/path/to/something/' } ] ,
		} ;
		
		var s = stringify( o ) ;
		//console.log( s ) ;
		//console.log( string.escape.control( s ) ) ;
		//console.log( parse( s ) ) ;
		
		var expected = 'attack: (+) 2\ndefense: (-) 1\ntime: (*) 0.9\ndamages: (u-ops) 1.2\n+strange key: 3\n"(another strange key)": 5\n"-hey": 5\n~hey: 5\n(#*>) @@/path/to/*/something/\n(*>) @/path/to/something/\n() @/path/to/something/\n() @@/path/to/something/\nlist:\n\t- one\n\t- two\n\t- @@/path/to/something/\n' ;
		doormen.equals( s , expected ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		//require( 'expect.js' )( o ).to.eql( parse( s ) ) ;
		doormen.equals( o , parse( s ) ) ;
	} ) ;
	
	it( "stringify an object with special instances (bin, date, regex)" , function() {
		var o = {
			bin: new Buffer( 'af461e0a' , 'hex' ) ,
			date1: new Date( 123456789 ) ,
			regex1: /abc/ ,
			array: [
				[
					new Date( 123456789 ) ,
					/abc/ig ,
				] ,
				[
					new Date( 123456789 ) ,
					/abc/ig ,
				] ,
			] ,
			object: {
				date2: new Date( 123456789 ) ,
				regex2: /abc/ig ,
			}
		} ;
		
		var s = stringify( o ) ;
		//console.log( s ) ;
		//console.log( string.escape.control( s ) ) ;
		//console.log( parse( s ) ) ;
		
		var expected = 'bin: <bin16> af461e0a\ndate1: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\nregex1: <regex> /abc/\narray:\n\t-\t- <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\n\t\t- <regex> /abc/gi\n\t-\t- <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\n\t\t- <regex> /abc/gi\nobject:\n\tdate2: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\n\tregex2: <regex> /abc/gi\n' ;
		doormen.equals( s , expected ) ;
		
		var o2 = parse( s ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		//expect( o ).to.eql( o2 ) ;
		
		expect( o2.bin ).to.be.a( Buffer ) ;
		expect( o2.bin.toString( 'hex' ) ).to.be( o.bin.toString( 'hex' ) ) ;
		
		delete o.bin ;
		delete o2.bin ;
		
		doormen.equals( o2 , o ) ;
	} ) ;
	
	it( "stringify an object with special custom instances" , function() {
		
		function Simple( value )
		{
			var self = Object.create( Simple.prototype ) ;
			self.str = value ;
			return self ;
		}
		
		function Complex( value )
		{
			var self = Object.create( Complex.prototype ) ;
			self.str = value.str ;
			self.int = value.int ;
			return self ;
		}
		
		var stringifier = new Map() ;
		
		stringifier.set( Simple.prototype , function Simple( v ) {
			return v.str ;
		} ) ;
		
		stringifier.set( Complex.prototype , function Complex( v ) {
			return { str: v.str , int: v.int } ;
		} ) ;
		
		var o = {
			simple: Simple( "abc" ) ,
			complex: Complex( { str: "hello", int: 6 } )
		} ;
		
		//console.log( stringify( o , { classes: stringifier } ) ) ;
		doormen.equals(
			stringify( o , { classes: stringifier } ) ,
			"simple: <Simple> abc\ncomplex: <Complex>\n\tstr: hello\n\tint: 6\n"
		) ;
	} ) ;
	
	it( "stringify an object with tags" , function() {
		var o = new TagContainer( [
			new Tag( 'if' , 'something > constant' , new TagContainer( [
				new Tag( 'do' , '' , 'some tasks' ) ,
				new Tag( 'do' , '' , 'some other tasks' )
			] ) ) ,
			new Tag( 'else' , undefined , new TagContainer( [
				new Tag( 'do' , undefined , new TagContainer( [
					new Tag( 'do' , '' , [ 'one' , 'two' , 'three' ] ) ,
					new Tag( 'do' , '' , { a: 1 , b: 2 } )
				] ) )
			] ) )
		] ) ;
		
		var s = stringify( o ) ;
		
		//console.log( s ) ;
		//console.log( string.escape.control( s ) ) ;
		//console.log( parse( s ) ) ;
		
		var expected = '[if something > constant]\n\t[do] some tasks\n\t[do] some other tasks\n[else]\n\t[do]\n\t\t[do]\n\t\t\t- one\n\t\t\t- two\n\t\t\t- three\n\t\t[do]\n\t\t\ta: 1\n\t\t\tb: 2\n' ;
		doormen.equals( s , expected ) ;
		
		var o2 = parse( s ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		//expect( o ).to.eql( o2 ) ;
		
		expect( o2 ).to.be.a( TagContainer ) ;
		expect( o2.children[ 0 ] ).to.be.a( Tag ) ;
		
		doormen.equals( o2 , o ) ;
	} ) ;
	
	it( "stringify an object with tags, featuring custom tags prototype" , function() {
		
		function IfTag() {} ;
		IfTag.prototype = Object.create( Tag.prototype ) ;
		IfTag.prototype.constructor = IfTag ;
		
		IfTag.create = function createIfTag( attributes , content ) {
			var self = Object.create( IfTag.prototype ) ;
			Tag.call( self , 'if' , attributes , content ) ;
			return self ;
		} ;
		
		IfTag.prototype.parseAttributes = function parseAttributes( attributes )
		{
			var splitted = attributes.split( / +/ ) ;
			return {
				left: splitted[ 0 ] ,
				operator: splitted[ 1 ] ,
				right: splitted[ 2 ]
			} ;
		}
		
		IfTag.prototype.stringifyAttributes = function stringifyAttributes() {
			return this.attributes.left + ' ' + this.attributes.operator + ' ' + this.attributes.right ;
		} ;
		
		var o = new TagContainer( [
			IfTag.create( 'something > constant' , new TagContainer( [
				new Tag( 'do' , '' , 'some tasks' ) ,
				new Tag( 'do' , '' , 'some other tasks' )
			] ) ) ,
			new Tag( 'else' , undefined , new TagContainer( [
				new Tag( 'do' , undefined , new TagContainer( [
					new Tag( 'do' , '' , [ 'one' , 'two' , 'three' ] ) ,
					new Tag( 'do' , '' , { a: 1 , b: 2 } )
				] ) )
			] ) )
		] ) ;
		
		//console.log( o ) ;
		var s = stringify( o ) ;
		
		//console.log( s ) ;
		//console.log( string.escape.control( s ) ) ;
		//console.log( parse( s ) ) ;
		
		var expected = '[if something > constant]\n\t[do] some tasks\n\t[do] some other tasks\n[else]\n\t[do]\n\t\t[do]\n\t\t\t- one\n\t\t\t- two\n\t\t\t- three\n\t\t[do]\n\t\t\ta: 1\n\t\t\tb: 2\n' ;
		doormen.equals( s , expected ) ;
		
		var o2 = parse( s , { tags: { if: IfTag.create } } ) ;
		//console.log( o2 ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		//expect( o ).to.eql( o2 ) ;
		
		expect( o2 ).to.be.a( TagContainer ) ;
		expect( o2.children[ 0 ] ).to.be.a( Tag ) ;
		
		doormen.equals( o2 , o ) ;
	} ) ;
} ) ;



describe( "KFG parse" , function() {
	
	it( "parse string at top-level" , function() {
		doormen.equals( parse( '"Hello World!"' ) , "Hello World!" ) ;
		doormen.equals( parse( '> Hello World!' ) , "Hello World!" ) ;
		doormen.equals( parse( '>   Hello World!' ) , "  Hello World!" ) ;
		doormen.equals( parse( '>   Hello World!  ' ) , "  Hello World!  " ) ;
		doormen.equals( parse( 'Hello World!' ) , "Hello World!" ) ;
		doormen.equals( parse( '  Hello World!  ' ) , "Hello World!" ) ;
	} ) ;
	
	it( "parse multi-line string at top-level" , function() {
		doormen.equals( parse( '> Hello\n> World!' ) , "Hello\nWorld!" ) ;
		//doormen.equals( parse( 'Hello\nWorld!' ) , "Hello\nWorld!" ) ;
	} ) ;
	
	it( "parse non-string scalar at top-level" , function() {
		doormen.equals( parse( 'null' ) , null ) ;
		doormen.equals( parse( 'true' ) , true ) ;
		doormen.equals( parse( 'false' ) , false ) ;
		doormen.equals( parse( '123' ) , 123 ) ;
		doormen.equals( parse( '123.456' ) , 123.456 ) ;
	} ) ;
	
	it( "numbers and string ambiguity" , function() {
		doormen.equals( parse( "v:1" ) , {v:1} ) ;
		doormen.equals( parse( "v:1l" ) , {v:"1l"} ) ;
		doormen.equals( parse( "v:10e2" ) , {v:1000} ) ;
		doormen.equals( parse( "v:123.5" ) , {v:123.5} ) ;
		doormen.equals( parse( "v:123.e5" ) , {v:"123.e5"} ) ;
	} ) ;
	
	it( "constant and string ambiguity" , function() {
		doormen.equals( parse( "v:true" ) , {v:true} ) ;
		doormen.equals( parse( "v:true or false" ) , {v:"true or false"} ) ;
	} ) ;
	
	it( "key ambiguity" , function() {
		doormen.equals( parse( "first-name:Joe" ) , {"first-name":"Joe"} ) ;
	} ) ;
	
	it( "parse a basic file" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ) ;
		
		//console.log( require( 'util' ).inspect( o , { depth: 10 } ) ) ;
		
		doormen.equals( o , {
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
	} ) ;
	
	it( "parse a file with operators" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/ops.kfg' , 'utf8' ) ) ;
		
		//console.log( require( 'util' ).inspect( o , { depth: 10 } ) ) ;
		
		doormen.equals( o , {
			'+attack': 2,
			'+defense': -1,
			'*time': 0.9,
			'(u-ops)damages': 1.2,
			'()+strange key': 3,
			'()(another strange key)': 5,
			'@include': "path/to/include.kfg",
			'@@mandatory include': "path/to/mandatory-include.kfg",
			'@+include2': 'path/to/include.kfg',
			'@(u-ops)include3': 'path/to/include.kfg',
			'@@(u-ops)include4': 'path/to/mandatory-include.kfg',
			'*>merge': { something: 1, 'something else': 12 },
			'#+foreach': [1,2,3],
			list: [ 'one' , 'two' , { '@@': 'path/to/include.kfg' } ] ,
			'@*>': 'path/to/something',
		} ) ;
	} ) ;
	
	it( "parse a file with special instances (json, bin, date, regex)" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/instances.kfg' , 'utf8' ) ) ;
		
		//console.log( require( 'util' ).inspect( o , { depth: 10 } ) ) ;
		//console.log( JSON.stringify( o ) ) ;
		
		doormen.equals(
			JSON.stringify( o ) ,
			'{"a":1234,"bin":{"type":"Buffer","data":[253,16,75,25]},"date1":"2016-04-29T10:08:14.000Z","date2":"2016-04-29T10:08:08.645Z","b":"toto","regex1":{},"sub":{"sub":{"date3":"1970-01-01T00:00:01.000Z","regex2":{}}},"d":2,"json":{"a":1,"b":2,"array":[1,2,"three"]}}'
		) ;
		
		doormen.equals( o.regex1 instanceof RegExp , true ) ;
		doormen.equals( o.regex1.toString() , "/abc/" ) ;
		
		doormen.equals( o.sub.sub.regex2 instanceof RegExp , true ) ;
		doormen.equals( o.sub.sub.regex2.toString() , "/abc/m" ) ;
		
		doormen.equals( o.bin.toString( 'hex' ) , "fd104b19" ) ;
	} ) ;
	
	it( "parse a file with special custom instances" , function() {
		
		function Simple( value )
		{
			var self = Object.create( Simple.prototype ) ;
			self.str = value ;
			return self ;
		}
		
		function Complex( value )
		{
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
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/custom-instances.kfg' , 'utf8' ) , options ) ;
		
		//console.log( o ) ;
		doormen.equals( JSON.stringify( o ) , '{"simple":{"str":"abc"},"complex":{"str":"hello","int":6}}' ) ;
	} ) ;
	
	it( "parse a file containing tags" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) ) ;
		
		//console.log( o ) ;
		//console.log( string.inspect( { style: 'color' , depth: 15 } , o ) ) ;
		//console.log( string.escape.control( JSON.stringify( o ) ) ) ;
		
		doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","attributes":"id1","content":{"some":"value","another":"one"}},{"name":"tag","attributes":"id2","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","attributes":"something > constant","content":{"children":[{"name":"do","attributes":"","content":"some work"}]}},{"name":"else","attributes":"","content":{"children":[{"name":"do","attributes":"","content":"something else"}]}}]}}}},{"name":"container","attributes":"","content":{"children":[{"name":"tag","attributes":""},{"name":"anothertag","attributes":""},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]}}]}' ) ;
	} ) ;
	
	it( "parse a file containing tags, with custom tags prototypes" , function() {
		
		function IfTag() {} ;
		IfTag.prototype = Object.create( Tag.prototype ) ;
		IfTag.prototype.constructor = IfTag ;
		
		IfTag.create = function createIfTag( attributes , content ) {
			var self = Object.create( IfTag.prototype ) ;
			Tag.call( self , 'if' , attributes , content ) ;
			return self ;
		} ;
		
		IfTag.prototype.parseAttributes = function parseAttributes( attributes )
		{
			var splitted = attributes.split( / +/ ) ;
			return {
				left: splitted[ 0 ] ,
				operator: splitted[ 1 ] ,
				right: splitted[ 2 ]
			} ;
		}
		
		IfTag.prototype.stringifyAttributes = function stringifyAttributes() {
			return this.attributes.left + ' ' + this.attributes.operator + ' ' + this.attributes.right ;
		} ;
		
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) , { tags: { if: IfTag.create } } ) ;
		
		//console.log( o ) ;
		//console.log( string.inspect( { style: 'color' , depth: 15 } , o ) ) ;
		//console.log( string.escape.control( JSON.stringify( o ) ) ) ;
		
		doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","attributes":"id1","content":{"some":"value","another":"one"}},{"name":"tag","attributes":"id2","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","attributes":{"left":"something","operator":">","right":"constant"},"content":{"children":[{"name":"do","attributes":"","content":"some work"}]}},{"name":"else","attributes":"","content":{"children":[{"name":"do","attributes":"","content":"something else"}]}}]}}}},{"name":"container","attributes":"","content":{"children":[{"name":"tag","attributes":""},{"name":"anothertag","attributes":""},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]}}]}' ) ;
	} ) ;
} ) ;



describe( "ClassicTag" , function() {
	
	var classicAttributes = kungFig.classicAttributes ;
	var ClassicTag = kungFig.ClassicTag ;
	
	it( "classic attributes parse" , function() {
		doormen.equals(
			classicAttributes.parse( 'width=1280 height=1024 src="/css/main.css" active' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
		
		doormen.equals(
			classicAttributes.parse( 'active width=1280 height=1024 src="/css/main.css"' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
		
		doormen.equals(
			classicAttributes.parse( '  width=1280  height = 1024  src="/css/main.css" active ' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
		
		doormen.equals(
			classicAttributes.parse( 'width=1280 height=1024 src="/css/main.css" active empty=""' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true , empty: '' }
		) ;
		
		doormen.equals(
			classicAttributes.parse( 'width:1280 height:1024 src:"/css/main.css" active' , ':' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
	} ) ;
	
	it( "classic attributes stringify" , function() {
		//console.log( classicAttributes.stringify( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ) ;
		
		doormen.equals(
			classicAttributes.stringify( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ,
			'width=1280 height=1024 src="/css/main.css" active' 
		) ;
	} ) ;
	
	it( "ClassicTag parse" , function() {
		var o = parse( '[ClassicTag width=1280 height=1024 src="/css/main.css" active]' , { tags: { ClassicTag: ClassicTag } } ) ;
		
		//console.log( "parsed:" , o ) ;
		
		// Doormen fails with constructors ATM
		doormen.equals( JSON.parse( JSON.stringify( o ) ) , {
			children: [
				{
					name: 'ClassicTag' ,
					attributes: { width: 1280, height: 1024, src: '/css/main.css', active: true } ,
					content: undefined
				}
			] 
		} ) ;
		
		/*
		doormen.equals( o , {
			children: [
				{
					name: 'ClassicTag' ,
					attributes: { width: 1280, height: 1024, src: '/css/main.css', active: true } ,
					content: undefined
				}
			] 
		} ) ;
		*/
	} ) ;
	
	it( "ClassicTag stringify" , function() {
		var o = new TagContainer( [
			new ClassicTag( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) 
		] ) ;
		
		//console.log( o ) ;
		
		doormen.equals( stringify( o ) , '[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' ) ;
		
		o = new TagContainer( [
			new ClassicTag( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ,
			new ClassicTag( { fullscreen: true } ) 
		] ) ;
		
		//console.log( o ) ;
		
		doormen.equals(
			stringify( o ) ,
			'[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' +
			'[ClassicTag fullscreen]\n'
		) ;
		
		//console.log( parse( stringify( o ) ) ) ;
		
		o = new TagContainer( [
			new ClassicTag( { width: 1280, height: 1024, src: '/css/main.css', active: true } , { hello: "world!" } ) ,
			new ClassicTag( { fullscreen: true } ) 
		] ) ;
		
		//console.log( o ) ;
		
		doormen.equals(
			stringify( o ) ,
			'[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' +
			'\thello: world!\n' +
			'[ClassicTag fullscreen]\n'
		) ;
	} ) ;
} ) ;


