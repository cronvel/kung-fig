/*
	Kung Fig
	
	Copyright (c) 2015 - 2018 Cédric Ronvel
	
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
var Ref = kungFig.Ref ;
var TemplateSentence = kungFig.TemplateSentence ;
var TemplateAtom = kungFig.TemplateAtom ;
var Tag = kungFig.Tag ;
var TagContainer = kungFig.TagContainer ;
var OrderedObject = kungFig.OrderedObject ;

var Babel = require( 'babel-tower' ) ;

var doormen = require( 'doormen' ) ;
var expect = require( 'expect.js' ) ;
var string = require( 'string-kit' ) ;
var tree = require( 'tree-kit' ) ;
var fs = require( 'fs' ) ;
var pathModule = require( 'path' ) ;



function deb( v )
{
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}

function debfn( v )
{
	console.log( string.inspect( { style: 'color' , depth: 5 , proto: true , funcDetails: true } , v ) ) ;
}

function surfaceEquals( a , b )
{
	doormen.equals( tree.extend( { own:true } , {} , a ) , b ) ;
}



describe( "KFG stringify" , function() {
	
	it( "stringify string" , function() {
		doormen.equals( stringify( "Hello World!" ) , 'Hello World!\n' ) ;
		doormen.equals( stringify( "a:1" ) , '> a:1\n' ) ;
		doormen.equals( stringify( "123" ) , '> 123\n' ) ;
		doormen.equals( stringify( "123.45" ) , '> 123.45\n' ) ;
		doormen.equals( stringify( "Hello: World!" ) , '> Hello: World!\n' ) ;
		doormen.equals( stringify( "[Hello World!]" ) , '> [Hello World!]\n' ) ;
		doormen.equals( stringify( "<hello>" ) , '> <hello>\n' ) ;
		doormen.equals( stringify( "(hello)" ) , '> (hello)\n' ) ;
		doormen.equals( stringify( "   Hello World!" ) , '>    Hello World!\n' ) ;
		doormen.equals( stringify( "Hello World!   " ) , '> Hello World!   \n' ) ;
		
		doormen.equals( stringify( "Hello\nWorld!" ) , '> Hello\n> World!\n' ) ;
		doormen.equals( stringify( "One...\nTwo...\n\nThree!" ) , '> One...\n> Two...\n> \n> Three!\n' ) ;
		doormen.equals( stringify( "One...\n\tTwo...\n\nThree!" ) , '> One...\n> \tTwo...\n> \n> Three!\n' ) ;
	} ) ;
		
	it( "stringify string with option 'preferQuotes'" , function() {
		doormen.equals( stringify( "Hello World!" , { preferQuotes: true } ) , 'Hello World!\n' ) ;
		doormen.equals( stringify( "a:1" , { preferQuotes: true } ) , '"a:1"\n' ) ;
		doormen.equals( stringify( "123" , { preferQuotes: true } ) , '"123"\n' ) ;
		doormen.equals( stringify( "123.45" , { preferQuotes: true } ) , '"123.45"\n' ) ;
		doormen.equals( stringify( "Hello: World!" , { preferQuotes: true } ) , '"Hello: World!"\n' ) ;
		doormen.equals( stringify( "[Hello World!]" , { preferQuotes: true } ) , '"[Hello World!]"\n' ) ;
		doormen.equals( stringify( "<hello>" , { preferQuotes: true } ) , '"<hello>"\n' ) ;
		doormen.equals( stringify( "(hello)" , { preferQuotes: true } ) , '"(hello)"\n' ) ;
		doormen.equals( stringify( "   Hello World!" , { preferQuotes: true } ) , '"   Hello World!"\n' ) ;
		doormen.equals( stringify( "Hello World!   " , { preferQuotes: true } ) , '"Hello World!   "\n' ) ;
		
		doormen.equals( stringify( "Hello\nWorld!" , { preferQuotes: true } ) , '"Hello\\nWorld!"\n' ) ;
		doormen.equals( stringify( "One...\nTwo...\n\nThree!" , { preferQuotes: true } ) , '"One...\\nTwo...\\n\\nThree!"\n' ) ;
		doormen.equals( stringify( "One...\n\tTwo...\n\nThree!" , { preferQuotes: true } ) , '"One...\\n\\tTwo...\\n\\nThree!"\n' ) ;
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
	
	it.skip( "stringify ref" , function() {
		throw new Error( "Not coded" ) ;
	} ) ;
	
	it( "stringify applicable ref" ) ;
	
	it.skip( "stringify expression" , function() {
		throw new Error( "Not coded" ) ;
	} ) ;
	
	it.skip( "stringify applicable expression" , function() {
		throw new Error( "Not coded" ) ;
	} ) ;
	
	it( "stringify templates" , function() {
		doormen.equals( stringify( { tpl: TemplateSentence.create( 'Hello ${name}!' ) } ) , 'tpl: $> Hello ${name}!\n' ) ;
		doormen.equals( stringify( { tpl: new TemplateSentence( 'Hey!\nHello ${name}!' ) } ) , 'tpl: \n\t$> Hey!\n\t$> Hello ${name}!\n' ) ;
		doormen.equals( stringify( { tpl: TemplateSentence.create( 'Hello ${name}!' ) } , { preferQuotes: true } ) , 'tpl: $"Hello ${name}!"\n' ) ;
		doormen.equals( stringify( { tpl: TemplateSentence.create( 'Hey!\nHello ${name}!' ) } , { preferQuotes: true } ) , 'tpl: $"Hey!\\nHello ${name}!"\n' ) ;
		
		doormen.equals( stringify( TemplateSentence.create( 'Hello ${name}!' ) ) , '$> Hello ${name}!\n' ) ;
		doormen.equals( stringify( TemplateSentence.create( 'Hey!\nHello ${name}!' ) ) , '$> Hey!\n$> Hello ${name}!\n' ) ;
		doormen.equals( stringify( TemplateSentence.create( 'Hello ${name}!' ) , { preferQuotes: true } ) , '$"Hello ${name}!"\n' ) ;
		doormen.equals( stringify( TemplateSentence.create( 'Hey!\nHello ${name}!' ) , { preferQuotes: true } ) , '$"Hey!\\nHello ${name}!"\n' ) ;
		
		doormen.equals( stringify( { tpl: TemplateSentence.create( '' ) } ) , 'tpl: <TemplateSentence>\n' ) ;
		doormen.equals( stringify( TemplateSentence.create( '' ) ) , '<TemplateSentence>\n' ) ;
	} ) ;
	
	it( "stringify applicable templates" ) ;
	
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
			simple: Simple( "abc" ) ,	// jshint ignore:line
			complex: Complex( { str: "hello", int: 6 } )	// jshint ignore:line
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
				new Tag( 'do' , null , 'some tasks' ) ,
				new Tag( 'do' , null , 'some other tasks' )
			] ) ) ,
			new Tag( 'else' , null , new TagContainer( [
				new Tag( 'do' , null , new TagContainer( [
					new Tag( 'do' , null , [ 'one' , 'two' , 'three' ] ) ,
					new Tag( 'do' , null , { a: 1 , b: 2 } )
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
		
		function IfTag() {}
		IfTag.prototype = Object.create( Tag.prototype ) ;
		IfTag.prototype.constructor = IfTag ;
		
		IfTag.create = function createIfTag( tag , attributes , content , shouldParse ) {
			var self = Object.create( IfTag.prototype ) ;
			Tag.call( self , 'if' , attributes , content , shouldParse ) ;
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
		} ;
		
		IfTag.prototype.stringifyAttributes = function stringifyAttributes() {
			return this.attributes.left + ' ' + this.attributes.operator + ' ' + this.attributes.right ;
		} ;
		
		var o = new TagContainer( [
			IfTag.create( 'if' , 'something > constant' , new TagContainer( [
				new Tag( 'do' , null , 'some tasks' ) ,
				new Tag( 'do' , null , 'some other tasks' )
			] ) , true ) ,
			new Tag( 'else' , null , new TagContainer( [
				new Tag( 'do' , null , new TagContainer( [
					new Tag( 'do' , null , [ 'one' , 'two' , 'three' ] ) ,
					new Tag( 'do' , null , { a: 1 , b: 2 } )
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
		doormen.equals( parse( '> \tHello World!' ) , "\tHello World!" ) ;
		doormen.equals( parse( '> \t\t\tHello\t\tWorld!' ) , "\t\t\tHello\t\tWorld!" ) ;
		doormen.equals( parse( 'Hello World!' ) , "Hello World!" ) ;
		//doormen.equals( parse( '  Hello World!  ' ) , "Hello World!" ) ;	// Do not work with space indentation
		doormen.equals( parse( '"123"' ) , "123" ) ;
		doormen.equals( parse( '"123.45"' ) , "123.45" ) ;
		doormen.equals( parse( '> 123' ) , "123" ) ;
		doormen.equals( parse( '> 123.45' ) , "123.45" ) ;
		//doormen.equals( parse( 'this is not: an object' ) , "this is not: an object" ) ;
	} ) ;
	
	it( "parse multi-line string at top-level" , function() {
		doormen.equals( parse( '> Hello\n> World!' ) , "Hello\nWorld!" ) ;
		//doormen.equals( parse( 'Hello\nWorld!' ) , "Hello\nWorld!" ) ;
	} ) ;
	
	it( "parse multi-line folding string at top-level" , function() {
		doormen.equals( parse( '>> Hello\n>> World!' ) , "Hello World!" ) ;
		doormen.equals( parse( '>>   Hello  \n>>    World!   ' ) , "Hello World!" ) ;
		doormen.equals( parse( '>> Hello\n>>\n>> World!' ) , "Hello\nWorld!" ) ;
		doormen.equals( parse( '>> Hello\n>>\n>>\n>> World!' ) , "Hello\n\nWorld!" ) ;
		doormen.equals( parse( '>>  \t\t Hello \t\t \n>>  \t\t  World! \t\t  ' ) , "Hello World!" ) ;
		doormen.equals( parse( '>> multi\n>> ple\n>> lines' ) , "multi ple lines" ) ;
		doormen.equals( parse( '>> multi\n>> ple\n>>\n>> lines' ) , "multi ple\nlines" ) ;
		doormen.equals( parse( '>> multi\n>> ple\n>> \n>>    \n>>\n>> lines' ) , "multi ple\n\n\nlines" ) ;
	} ) ;
	
	it( "parse non-string scalar at top-level" , function() {
		doormen.equals( parse( 'null' ) , null ) ;
		doormen.equals( parse( 'true' ) , true ) ;
		doormen.equals( parse( 'false' ) , false ) ;
		doormen.equals( parse( '123' ) , 123 ) ;
		doormen.equals( parse( '123.456' ) , 123.456 ) ;
	} ) ;
	
	it( "parse instance at top-level" , function() {
		doormen.equals( JSON.stringify( parse( "<Bin16> 22" ) ) , '{"type":"Buffer","data":[34]}' ) ;
		doormen.equals( JSON.stringify( parse( "<Object>" ) ) , '{}' ) ;
		doormen.equals( JSON.stringify( parse( "<Object>\na: 1" ) ) , '{"a":1}' ) ;
		doormen.equals( parse( "<TemplateSentence> :string" ).toString() , ':string' ) ;
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
	
	it( "unquoted key ambiguity" , function() {
		doormen.equals( parse( "first-name:Joe" ) , {"first-name":"Joe"} ) ;
		doormen.equals( parse( "first-name :Joe" ) , {"first-name":"Joe"} ) ;
		doormen.equals( parse( "first-name   :Joe" ) , {"first-name":"Joe"} ) ;
		doormen.equals( parse( "first-name: Joe" ) , {"first-name":"Joe"} ) ;
		doormen.equals( parse( "first-name:   Joe" ) , {"first-name":"Joe"} ) ;
		doormen.equals( parse( "first-name : Joe" ) , {"first-name":"Joe"} ) ;
		doormen.equals( parse( "first-name   :   Joe" ) , {"first-name":"Joe"} ) ;
		
		doormen.equals( parse( "first name: Joe" ) , {"first name":"Joe"} ) ;
		doormen.equals( parse( "first name   :   Joe" ) , {"first name":"Joe"} ) ;
		
		doormen.equals( parse( "null: Joe" ) , {"null":"Joe"} ) ;
		doormen.equals( parse( "true: Joe" ) , {"true":"Joe"} ) ;
		doormen.equals( parse( "false: Joe" ) , {"false":"Joe"} ) ;
	} ) ;
	
	it( "quoted key" , function() {
		doormen.equals( parse( '"some:\\"bizarre:\\nkey" : value' ) , {"some:\"bizarre:\nkey":"value"} ) ;
	} ) ;
	
	it( "unquoted tabs should not be parsed as string but as undefined" , function() {
		var o ;
		
		o = parse( "object:\t\t\t\n\ta: 1" ) ;
		//console.log( o ) ;
		doormen.equals( o , { object: { a: 1 } } ) ;
		
		o = parse( "[tag]\t\t\t\n\ta: 1" ) ;
		//console.log( o ) ; console.log( JSON.stringify( o ) ) ;
		doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","content":{"a":1},"attributes":null}]}' ) ;
	} ) ;
	
	it( "comment ambiguity" , function() {
		doormen.equals( parse( "#comment\nkey: value" ) , { key: "value" } ) ;
		doormen.equals( parse( "key: value # comment" ) , { key: "value # comment" } ) ;
		doormen.equals( parse( "object:\n\t# comment\n\tkey: value" ) , { object: { key: "value" } } ) ;
		doormen.equals( parse( "object:\n# comment\n\tkey: value" ) , { object: { key: "value" } } ) ;
		doormen.equals( parse( "object:\n\t\t# comment\n\tkey: value" ) , { object: { key: "value" } } ) ;
	} ) ;
	
	it( "parse a basic file" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ) ;
		
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
		
		//console.log( kungFig.getMeta( o ).getFirstTag( 'meta' ).content ) ;
		doormen.equals( kungFig.getMeta( o ).getFirstTag( 'meta' ).content , { content: "test" } ) ;
	} ) ;
	
	it( "parse a file using 4-spaces to indent" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/spaces-indent.kfg' , 'utf8' ) ) ;
		
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
		
		//console.log( kungFig.getMeta( o ).getFirstTag( 'meta' ).content ) ;
		doormen.equals( kungFig.getMeta( o ).getFirstTag( 'meta' ).content , { content: "test" } ) ;
	} ) ;
	
	it( "parse ref" , function() {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } } ;
		
		o = parse( "ref: <Ref>" ) ;
		doormen.equals( o.ref.get() , undefined ) ;
		
		o = parse( "ref: $name" ) ;
		doormen.equals( o.ref.get() , undefined ) ;
		
		o = parse( "ref: $name\nref2: $bob.age" ) ;
		doormen.equals( o.ref.get( ctx ) , "Bob" ) ;
		doormen.equals( o.ref.toString( ctx ) , "Bob" ) ;
		doormen.equals( o.ref2.get( ctx ) , 43 ) ;
		doormen.equals( o.ref2.toString( ctx ) , "43" ) ;
	} ) ;
	
	it( "parse applicable ref" , function() {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } } ;
		
		o = parse( "ref: $$name\nref2: $$bob.age" ) ;
		doormen.equals( o.ref.get( ctx ) , o.ref ) ;
		doormen.equals( o.ref2.get( ctx ) , o.ref2 ) ;
		
		doormen.equals( o.ref.apply( ctx ) , "Bob" ) ;
		doormen.equals( o.ref2.apply( ctx ) , 43 ) ;
	} ) ;
	
	it( "parse expressions" , function() {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } , bill: { age: 37 } } ;
		
		//o = parse( "exp: <Expression>" ) ;
		//doormen.equals( o.exp , undefined ) ;
		
		o = parse( "exp: $= $name" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , "Bob" ) ;
		
		o = parse( "exp: $= $bob.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 43 ) ;
		
		o = parse( "exp: $= $bob.age + 2" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 45 ) ;
		
		o = parse( "exp: $= 5 + $bob.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 48 ) ;
		
		o = parse( "exp: $=5 + $bob.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 48 ) ;
		
		o = parse( "exp: $= $bob.age - $bill.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 6 ) ;
		
		o = parse( "exp: $= - $bill.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , -37 ) ;
		
		o = parse( "exp: $= ( $bill.age + 3 ) / 10" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 4 ) ;
		
		o = parse( "exp: $= $bill.age < $bob.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , true ) ;
		
		o = parse( "exp: $= $bill.age > $bob.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , false ) ;
		
		o = parse( "exp: $= $bill.age == $bob.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , false ) ;
		
		o = parse( "exp: $= ( $bill.age + 6 ) == $bob.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , true ) ;
		
		o = parse( "exp: $= $bill.age != $bob.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , true ) ;
		
		o = parse( "exp: $= ( $bill.age + 6 ) != $bob.age" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , false ) ;
		
		o = parse( "exp: $= ! ( $bill.age == $bob.age )" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , true ) ;
		
		o = parse( "exp: $= ! ( ( $bill.age + 6 ) == $bob.age )" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , false ) ;
	} ) ;
	
	it( "parse multi-line expressions" , function() {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } , bill: { age: 37 } } ;
		
		o = parse( "exp:\n\t$= $bob.age + 2" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 45 ) ;
		
		o = parse( "exp:\n\t$= $bob.age\n\t$= + 2" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 45 ) ;
		
		o = parse( "exp:\n\t$=  $bob.age  \n\t$=   +  \n\t\n\t$=\n\t$= \n\t$=    \n\t$=  2  " ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 45 ) ;
		
		// Try with custom operators
		var operators = {
			triple: function( args ) { return args[ 0 ] * 3 ; }
		} ;
		
		o = parse( "exp:\n\t$=  triple  \n\t\n\t$=\n\t$= \n\t$=    \n\t$=  $bob.age  " , { operators: operators } ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , 129 ) ;
	} ) ;
	
	it( "parse applicable expressions" , function() {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } , bill: { age: 37 } } ;
		
		o = parse( "exp: $$= $bob.age + 2" ) ;
		doormen.equals( o.exp.getFinalValue( ctx ) , o.exp ) ;
		doormen.equals( o.exp.apply( ctx ) , 45 ) ;
	} ) ;
	
	it( "parse templates" , function() {
		var o ;
		
		// console.log( o.tpl ) ;
		// console.log( o.tpl.toString() ) ;
		// console.log( o.tpl.toString( { name: "Bob" } ) ) ;
		
		o = parse( "tpl: <TemplateSentence>" ) ;
		doormen.equals( o.tpl.toString() , '' ) ;
		
		o = parse( "tpl: $> Hello ${name}!" ) ;
		doormen.equals( o.tpl.toString() , 'Hello (undefined)!' ) ;
		doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;
		
		o = parse( "tpl:\n\t$> Hello ${name}!" ) ;
		doormen.equals( o.tpl.toString() , 'Hello (undefined)!' ) ;
		doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;
		
		o = parse( "tpl:\n\t$> Hello ${name}!\n\t$> How are you ${name}?" ) ;
		doormen.equals( o.tpl.toString() , 'Hello (undefined)!\nHow are you (undefined)?' ) ;
		doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!\nHow are you Bob?' ) ;
		
		o = parse( 'tpl: $"Hello ${name}!"' ) ;
		doormen.equals( o.tpl.toString() , 'Hello (undefined)!' ) ;
		doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;
		
		// Top-level templates
		o = parse( "<TemplateSentence>" ) ;
		doormen.equals( o.toString() , '' ) ;
		
		o = parse( '$"Hello ${name}!"' ) ;
		doormen.equals( o.toString() , 'Hello (undefined)!' ) ;
		doormen.equals( o.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;
		
		o = parse( '$> Hello ${name}!' ) ;
		doormen.equals( o.toString() , 'Hello (undefined)!' ) ;
		doormen.equals( o.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;
		
		o = parse( '$> Hey!\n$> Hello ${name}!' ) ;
		doormen.equals( o.toString() , 'Hey!\nHello (undefined)!' ) ;
		doormen.equals( o.toString( { name: "Bob" } ) , 'Hey!\nHello Bob!' ) ;
	} ) ;
	
	it( "parse applicable templates" , function() {
		var o ;
		
		o = parse( "tpl: $$> Hello ${name}!" ) ;
		doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello ${name}!' ) ;
		doormen.equals( o.tpl.apply( { name: "Bob" } ) , 'Hello Bob!' ) ;
		
		o = parse( "tpl:\n\t$$> Hello ${name}!" ) ;
		doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello ${name}!' ) ;
		doormen.equals( o.tpl.apply( { name: "Bob" } ) , 'Hello Bob!' ) ;
		
		o = parse( 'tpl: $$"Hello ${name}!"' ) ;
		doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello ${name}!' ) ;
		doormen.equals( o.tpl.apply( { name: "Bob" } ) , 'Hello Bob!' ) ;
	} ) ;
	
	/*
	it( "parse template atoms" , function() {
		var o , o2 ;
		
		o = parse( "el: $%> horse" ) ;
		console.log( 'o:' , o ) ;
		surfaceEquals( o.el , { k: "horse" } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o = parse( 'el: $%"horse"' ) ;
		surfaceEquals( o.el , { k: "horse" } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o = parse( "el: $%> horse[n?horse|horses]" ) ;
		surfaceEquals( o.el , { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o = parse( "el:\n\t$%> horse[n?horse|horses]" ) ;
		surfaceEquals( o.el , { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o = parse( "el: $%> horse[n?horse|horses]" ) ;
		surfaceEquals( o.el , { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o = parse( 'el: $%"horse[n?horse|horses]"' ) ;
		surfaceEquals( o.el , { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o2 = parse( '$> I like ${el}[n:many]!' ) ;
		doormen.equals( o2.toString( o ) , 'I like horses!' ) ;
	} ) ;
	*/
	
	it( "parse template atoms" , function() {
		var o , o2 ;
		
		o = parse( "el: <Atom> horse" ) ;
		console.log( 'o:' , o ) ;
		surfaceEquals( o.el , { k: "horse" } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o = parse( 'el: <Atom> "horse"' ) ;
		surfaceEquals( o.el , { k: "horse" } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o = parse( "el: <Atom> horse[n?horse|horses]" ) ;
		surfaceEquals( o.el , { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o = parse( 'el: <Atom> "horse[n?horse|horses]"' ) ;
		surfaceEquals( o.el , { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o = parse( "el: <Atom>\n\t> horse[n?horse|horses]" ) ;
		surfaceEquals( o.el , { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.toString() , 'horse' ) ;
		
		o2 = parse( '$> I like ${el}[n:many]!' ) ;
		doormen.equals( o2.toString( o ) , 'I like horses!' ) ;
	} ) ;
	
	/*
	it( "parse applicable template atoms" , function() {
		var o , o2 ;
		
		o = parse( "el: $$%> horse[n?horse|horses]" ) ;
		surfaceEquals( o.el , { __isApplicable__: true , __isDynamic__: false , k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.apply() , 'horse' ) ;
		
		o = parse( "el:\n\t$$%> horse[n?horse|horses]" ) ;
		surfaceEquals( o.el , { __isApplicable__: true , __isDynamic__: false , k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.apply() , 'horse' ) ;
	} )
	*/
	
	it( "parse template sentence and atom, and use a babel instance to localize it" , function() {
		var o , o2 ;
		
		var babel = Babel.create() ;
		
		babel.extend( {
			en: {
				propertyIndexes: {
					g: { m: 0 , f: 1 , n: 3 , h: 3 }
				} ,
				atoms: {
					apple: { g:'n', "n?": [ 'apple' , 'apples' ] } ,
					horse: { "n?": [ 'horse' , 'horses' ] } ,
				}
			} ,
			fr: {
				propertyIndexes: {
					g: { m: 0 , f: 1 , n: 2 , h: 2 }
				} ,
				sentences: {
					"I like ${el}[n:many]!": "J'aime les ${el}[n:many]!" ,
					"I like ${el}[n:many/g:f]!": "J'aime les ${el}[n:many/g:f]!" ,
				} ,
				atoms: {
					apple: { g:'f', "n?": [ 'pomme' , 'pommes' ] } ,
					horse: { "ng?": [ [ 'cheval' , 'jument' ] , [ 'chevaux' , 'juments' ] ] } ,
				}
			}
		} ) ;
		
		var babelFr = babel.use( 'fr' ) ;
		
		// Using Babel fr
		o = parse( "el: <Atom> horse" ) ;
		surfaceEquals( o.el , { k: "horse" } ) ;
		doormen.equals( o.el.toString( babelFr ) , 'cheval' ) ;
		
		o = parse( "el: <Atom> horse[n?horse|horses]" ) ;
		surfaceEquals( o.el , { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		doormen.equals( o.el.toString( babelFr ) , 'cheval' ) ;
		
		o.__babel = babelFr ;
		
		o2 = parse( '$> I like ${el}[n:many]!' ) ;
		doormen.equals( o2.toString( o ) , "J'aime les chevaux!" ) ;
		
		o2 = parse( '$> I like ${el}[n:many/g:f]!' ) ;
		doormen.equals( o2.toString( o ) , "J'aime les juments!" ) ;
		
		o.el.g = 'f' ;
		o2 = parse( '$> I like ${el}[n:many]!' ) ;
		doormen.equals( o2.toString( o ) , "J'aime les juments!" ) ;
	} ) ;
	
	it( "parse a file with operators" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/ops.kfg' , 'utf8' ) ) ;
		
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
	
	it( "parse a file with ordered object" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/ordered-object.kfg' , 'utf8' ) ) ;
		
		//console.log( JSON.stringify( o ) ) ;
		
		doormen.equals(
			JSON.stringify( o ) ,
			// Without _keys
			'{"top":{"name":"John","_index":0},"sub":{"_index":1,"one":{"name":"Bob","_index":0},"two":{"name":"Bill","_index":1},"three":{"name":"Jack","_index":2}}}'
			// With _keys
			//'{"_keys":["top","sub"],"top":{"name":"John","_index":0},"sub":{"_keys":["one","two","three"],"_index":1,"one":{"name":"Bob","_index":0},"two":{"name":"Bill","_index":1},"three":{"name":"Jack","_index":2}}}'
		) ;
		
		doormen.equals( o instanceof kungFig.OrderedObject , true ) ;
		doormen.equals( o.sub instanceof kungFig.OrderedObject , true ) ;
		doormen.equals( o._keys , [ 'top' , 'sub' ] ) ;
		doormen.equals( o.top._key , 'top' ) ;
		doormen.equals( o.sub._key , 'sub' ) ;
		doormen.equals( o.sub._keys , [ 'one' , 'two' , 'three' ] ) ;
		doormen.equals( o.sub.one._key , 'one' ) ;
		doormen.equals( o.sub.two._key , 'two' ) ;
		doormen.equals( o.sub.three._key , 'three' ) ;
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
	
	it( "parse tags" , function() {
		
		doormen.equals( JSON.stringify( parse( '[tag]' ) ) , '{"children":[{"name":"tag","attributes":null}]}' ) ;
		doormen.equals( JSON.stringify( parse( '[tag] text' ) ) , '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
		doormen.equals( JSON.stringify( parse( '[tag] "text"' ) ) , '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
		doormen.equals( JSON.stringify( parse( '[tag] > text' ) ) , '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
		doormen.equals( JSON.stringify( parse( '[tag]\n\t> text' ) ) , '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
		doormen.equals( JSON.stringify( parse( '[tag] true' ) ) , '{"children":[{"name":"tag","content":true,"attributes":null}]}' ) ;
		doormen.equals( JSON.stringify( parse( '[tag] 123' ) ) , '{"children":[{"name":"tag","content":123,"attributes":null}]}' ) ;
		doormen.equals( JSON.stringify( parse( '[tag] <Object>' ) ) , '{"children":[{"name":"tag","content":{},"attributes":null}]}' ) ;
		doormen.equals( JSON.stringify( parse( '[tag] <Object>\n\ta: 1\n\tb: 2' ) ) , '{"children":[{"name":"tag","content":{"a":1,"b":2},"attributes":null}]}' ) ;
	} ) ;
	
	it( "parse a file containing tags" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) ) ;
		
		//console.log( o ) ;
		//console.log( string.inspect( { style: 'color' , depth: 15 } , o ) ) ;
		//console.log( string.escape.control( JSON.stringify( o ) ) ) ;
		//console.log( JSON.stringify( o ) ) ;
		
		doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","content":{"some":"value","another":"one"},"attributes":"id1"},{"name":"tag","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","content":{"children":[{"name":"do","content":"some work","attributes":null}]},"attributes":"something > constant"},{"name":"else","content":{"children":[{"name":"do","content":"something else","attributes":null}]},"attributes":null}]}}},"attributes":"id2"},{"name":"container","content":{"children":[{"name":"tag","attributes":null},{"name":"anothertag","attributes":null},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]},"attributes":null}]}' ) ;
		
		//console.log( o.children[ 2 ].content.children[ 0 ].parent ) ;
		//console.log( o.children[ 2 ].content.children[ 0 ].getParentTag() ) ;
		doormen.equals( o.children[ 2 ].getParentTag() , null ) ;
		doormen.equals( o.children[ 2 ] === o.children[ 2 ].content.children[ 0 ].getParentTag() , true ) ;
	} ) ;
	
	it( "parse a file containing tags, with custom tags prototypes" , function() {
		
		function IfTag() {}
		IfTag.prototype = Object.create( Tag.prototype ) ;
		IfTag.prototype.constructor = IfTag ;
		
		IfTag.create = function createIfTag( tag , attributes , content , shouldParse ) {
			var self = Object.create( IfTag.prototype ) ;
			Tag.call( self , 'if' , attributes , content , shouldParse ) ;
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
		} ;
		
		IfTag.prototype.stringifyAttributes = function stringifyAttributes() {
			return this.attributes.left + ' ' + this.attributes.operator + ' ' + this.attributes.right ;
		} ;
		
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) , { tags: { if: IfTag.create } } ) ;
		
		//console.log( o ) ;
		//console.log( string.inspect( { style: 'color' , depth: 15 } , o ) ) ;
		//console.log( string.escape.control( JSON.stringify( o ) ) ) ;
		
		doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","content":{"some":"value","another":"one"},"attributes":"id1"},{"name":"tag","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","content":{"children":[{"name":"do","content":"some work","attributes":null}]},"attributes":{"left":"something","operator":">","right":"constant"}},{"name":"else","content":{"children":[{"name":"do","content":"something else","attributes":null}]},"attributes":null}]}}},"attributes":"id2"},{"name":"container","content":{"children":[{"name":"tag","attributes":null},{"name":"anothertag","attributes":null},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]},"attributes":null}]}' ) ;
	} ) ;
} ) ;
	


describe( "Meta-Tag" , function() {
	
	it( "parse meta-tag" , function() {
		var o ;
		o = parse( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\nsome: data' ) ;
		/*
		console.log( o ) ;
		console.log( kungFig.getMeta( o ) ) ;
		console.log( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ] ) ;
		*/
		doormen.equals( o , { some: "data" } ) ;
		doormen.equals( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ].content , { author: "Joe Doe" , copyright: 2016 } ) ;
		
		//console.log( stringify( o ) ) ;
		doormen.equals( stringify( o ) , '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\n\nsome: data\n' ) ;
	} ) ;
	
	it( "stringify meta-tag" , function() {
		var o ;
		o = { some: "data" } ;
		kungFig.setMeta( o , [ new Tag( 'meta' , undefined , { author: "Joe Doe" , copyright: 2016 } ) ] ) ;
		
		//console.log( stringify( o ) ) ;
		doormen.equals( stringify( o ) , '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\n\nsome: data\n' ) ;
	} ) ;
	
	it( "meta doctype filtering" , function() {
		var o , kfg ;
		
		kfg = '[[doctype supadoc]]\nsome: data' ;
		
		o = parse( kfg ) ;
		doormen.equals( kungFig.getMeta( o ).getTags( "doctype" )[ 0 ].attributes , "supadoc" ) ;
		doormen.equals( o , { some: "data" } ) ;
		
		o = parse( kfg , { doctype: "supadoc" } ) ;
		doormen.equals( kungFig.getMeta( o ).getTags( "doctype" )[ 0 ].attributes , "supadoc" ) ;
		doormen.equals( o , { some: "data" } ) ;
		
		doormen.shouldThrow( () => parse( kfg , { doctype: "baddoc" } ) ) ;
		
		o = parse( kfg , { doctype: [ "cooldoc" , "supadoc" ] } ) ;
		doormen.equals( kungFig.getMeta( o ).getTags( "doctype" )[ 0 ].attributes , "supadoc" ) ;
		doormen.equals( o , { some: "data" } ) ;
		
		doormen.shouldThrow( () => parse( kfg , { doctype: [ "baddoc" , "wrongdoc" ] } ) ) ;
		
		kfg = '\nsome: data' ;
		doormen.shouldThrow( () => parse( kfg , { doctype: "supadoc" } ) ) ;
		doormen.shouldThrow( () => parse( kfg , { doctype: [ "supadoc" , "cooldoc" ] } ) ) ;
	} ) ;
	
	it( "parse meta-tag, with meta hook" , function() {
		var o , hookTriggered = 0 ;
		
		var options = {
			metaHook: function( meta ) {
				//console.log( "Received meta: " , meta.getTags( 'meta' )[ 0 ].content ) ;
				doormen.equals( meta.getTags( 'meta' )[ 0 ].content , { author: "Joe Doe" , copyright: 2016 } ) ;
				hookTriggered ++ ;
			}
		} ;
		
		o = parse( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\nsome: data' , options ) ;
		
		/*
		console.log( o ) ;
		console.log( kungFig.getMeta( o ) ) ;
		console.log( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ] ) ;
		*/
		
		doormen.equals( hookTriggered , 1 ) ;
		doormen.equals( o , { some: "data" } ) ;
		doormen.equals( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ].content , { author: "Joe Doe" , copyright: 2016 } ) ;
		
		//console.log( stringify( o ) ) ;
		doormen.equals( stringify( o ) , '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\n\nsome: data\n' ) ;
	} ) ;
	
	it( "meta tag after body started should throw" , function() {
		doormen.shouldThrow( function() {
			parse( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\nsome: data\n[[meta]]' ) ;
		} ) ;
	} ) ;
	
	it( "meta hook & loading (include, ...)" , function() {
		var o , hookTriggered = 0 , nonIncludeHookTriggered = 0 , includeHookTriggered = 0 ;
		
		var options = {
			metaHook: function( meta , options ) {
				//if ( meta ) { console.log( "Received meta: " , meta , "\n>>>" , meta.getFirstTag( 'meta' ).content ) ; }
				//else { console.log( "No meta" ) ; }
				
				//doormen.equals( meta.getTags( 'meta' )[ 0 ].content , { author: "Joe Doe" , copyright: 2016 } ) ;
				hookTriggered ++ ;
				
				if ( [ "meta-hook.kfg" , "meta-hook-include.kfg" ].indexOf( pathModule.basename( options.file ) ) === -1 )
				{
					throw new Error( "Bad options.file" ) ;
				}
				
				if ( options.isInclude ) { includeHookTriggered ++ ; }
				else { nonIncludeHookTriggered ++ ; }
			}
		} ;
		
		o = kungFig.load( __dirname + '/sample/kfg/meta-hook.kfg' , options ) ;
		
		//console.log( "data:" , o ) ;
		//console.log( "meta:" , kungFig.getMeta( o ) , "\n###" , kungFig.getMeta( o ).getFirstTag( 'meta' ).content ) ;
		
		doormen.equals( hookTriggered , 2 ) ;
		doormen.equals( includeHookTriggered , 1 ) ;
		doormen.equals( nonIncludeHookTriggered , 1 ) ;
		doormen.equals( o , { include: { some: { more: "content"  } } , some: "content" } ) ;
		doormen.equals( kungFig.getMeta( o ).getFirstTag( 'meta' ).content , "master" ) ;
	} ) ;
} ) ;



describe( "LabelTag" , function() {
	
	var LabelTag = kungFig.LabelTag ;
	
	it( "label attributes parse" , function() {
		doormen.equals(
			LabelTag.parseAttributes( 'label' ) ,
			'label'
		) ;
		
		doormen.equals(
			LabelTag.parseAttributes( '' ) ,
			''
		) ;
	} ) ;
	
	it( "label attributes stringify" , function() {
		doormen.equals(
			LabelTag.stringifyAttributes( 'label' ) ,
			'label'
		) ;
		
		doormen.equals(
			LabelTag.stringifyAttributes( 'label[]' ) ,
			'"label[]"'
		) ;
	} ) ;
	
	
	it( "LabelTag parse" , function() {
		var o = parse( '[LabelTag my-label]' , { tags: { LabelTag: LabelTag } } ) ;
		
		//console.log( "parsed:" , o ) ;
		
		// Doormen fails with constructors ATM
		doormen.equals( JSON.parse( JSON.stringify( o ) ) , {
			children: [
				{
					name: 'LabelTag' ,
					attributes: 'my-label' ,
					content: undefined
				}
			] 
		} ) ;
	} ) ;
	
	it( "LabelTag stringify" ) ;
} ) ;



describe( "VarTag" , function() {
	
	var LabelTag = kungFig.LabelTag ;
	
	it( "VarTag parse" ) ;
	it( "VarTag stringify" ) ;
} ) ;



describe( "ClassicTag" , function() {
	
	var ClassicTag = kungFig.ClassicTag ;
	
	it( "classic attributes parse" , function() {
		doormen.equals(
			ClassicTag.parseAttributes( 'width=1280 height=1024 src="/css/main.css" active' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
		
		doormen.equals(
			ClassicTag.parseAttributes( 'active width=1280 height=1024 src="/css/main.css"' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
		
		doormen.equals(
			ClassicTag.parseAttributes( '  width=1280  height = 1024  src="/css/main.css" active ' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
		
		doormen.equals(
			ClassicTag.parseAttributes( 'width=1280 height=1024 src="/css/main.css" active empty=""' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true , empty: '' }
		) ;
		
		doormen.equals(
			ClassicTag.parseAttributes( 'width:1280 height:1024 src:"/css/main.css" active' , ':' ) ,
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
	} ) ;
	
	it( "classic attributes stringify" , function() {
		//console.log( ClassicTag.stringifyAttributes( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ) ;
		
		doormen.equals(
			ClassicTag.stringifyAttributes( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ,
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
			new ClassicTag( 'ClassicTag' , { width: 1280, height: 1024, src: '/css/main.css', active: true } ) 
		] ) ;
		
		//console.log( o ) ;
		
		doormen.equals( stringify( o ) , '[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' ) ;
		
		o = new TagContainer( [
			new ClassicTag( 'ClassicTag' , { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ,
			new ClassicTag( 'ClassicTag' , { fullscreen: true } ) 
		] ) ;
		
		//console.log( o ) ;
		
		doormen.equals(
			stringify( o ) ,
			'[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' +
			'[ClassicTag fullscreen]\n'
		) ;
		
		//console.log( parse( stringify( o ) ) ) ;
		
		o = new TagContainer( [
			new ClassicTag( 'ClassicTag' , { width: 1280, height: 1024, src: '/css/main.css', active: true } , { hello: "world!" } ) ,
			new ClassicTag( 'ClassicTag' , { fullscreen: true } ) 
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



describe( "ExpressionTag" , function() {
	
	var ExpressionTag = kungFig.ExpressionTag ;
	
	it( "ExpressionTag parse" , function () {
		var ctx = { a: 4 , b: 1 } ;
		var o = parse( '[ExpressionTag $a > 3]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		
		//console.log( "parsed:" , o ) ;
		
		// Doormen fails with constructors ATM
		doormen.equals( JSON.parse( JSON.stringify( o ) ) , {
			children: [
				{
					name: 'ExpressionTag' ,
					attributes: {
						args: [
							{ refParts: [ 'a' ] } ,
							3
						]
					} ,
					content: undefined
				}
			] 
		} ) ;
		
		doormen.equals( typeof o.children[ 0 ].attributes.fnOperator === 'function' , true ) ;
		doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , true ) ;
		ctx.a = 2 ;
		doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , false ) ;
		
		
		o = parse( '[ExpressionTag 3 <= ( round 3.3 )]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , true ) ;
		
		o = parse( '[ExpressionTag 4 < ( round 3.3 )]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , false ) ;
		
		o = parse( '[ExpressionTag ( round 3.3 ) >= 3]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , true ) ;
		
		o = parse( '[ExpressionTag ( round 3.3 ) >= 4]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , false ) ;
	} ) ;
	
	it( "ExpressionTag parse with custom operators" , function () {
		var ctx = { a: 4 , b: 1 } ;
		
		var operators = {
			triple: function( args ) { return args[ 0 ] * 3 ; }
		} ;
		
		var o = parse( '[ExpressionTag triple $a]' , { tags: { ExpressionTag: ExpressionTag } , operators: operators } ) ;
		
		doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , 12 ) ;
		ctx.a = 2 ;
		doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , 6 ) ;
	} ) ;
	
	it( "ExpressionTag stringify" ) ;
} ) ;


