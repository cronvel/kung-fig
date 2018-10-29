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

/* global describe, it, expect */

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

var string = require( 'string-kit' ) ;
var tree = require( 'tree-kit' ) ;
var fs = require( 'fs' ) ;
var pathModule = require( 'path' ) ;



function deb( v ) {
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}

function debfn( v ) {
	console.log( string.inspect( { style: 'color' , depth: 5 , proto: true , funcDetails: true } , v ) ) ;
}



describe( "KFG stringify" , () => {
	
	it( "stringify string" , () => {
		expect( stringify( "Hello World!" ) ).to.be( 'Hello World!\n' ) ;
		expect( stringify( "a:1" ) ).to.be( '> a:1\n' ) ;
		expect( stringify( "123" ) ).to.be( '> 123\n' ) ;
		expect( stringify( "123.45" ) ).to.be( '> 123.45\n' ) ;
		expect( stringify( "Hello: World!" ) ).to.be( '> Hello: World!\n' ) ;
		expect( stringify( "[Hello World!]" ) ).to.be( '> [Hello World!]\n' ) ;
		expect( stringify( "<hello>" ) ).to.be( '> <hello>\n' ) ;
		expect( stringify( "(hello)" ) ).to.be( '> (hello)\n' ) ;
		expect( stringify( "   Hello World!" ) ).to.be( '>    Hello World!\n' ) ;
		expect( stringify( "Hello World!   " ) ).to.be( '> Hello World!   \n' ) ;
		
		expect( stringify( "Hello\nWorld!" ) ).to.be( '> Hello\n> World!\n' ) ;
		expect( stringify( "One...\nTwo...\n\nThree!" ) ).to.be( '> One...\n> Two...\n> \n> Three!\n' ) ;
		expect( stringify( "One...\n\tTwo...\n\nThree!" ) ).to.be( '> One...\n> \tTwo...\n> \n> Three!\n' ) ;
	} ) ;
		
	it( "stringify string with option 'preferQuotes'" , () => {
		expect( stringify( "Hello World!" , { preferQuotes: true } ) ).to.be( 'Hello World!\n' ) ;
		expect( stringify( "a:1" , { preferQuotes: true } ) ).to.be( '"a:1"\n' ) ;
		expect( stringify( "123" , { preferQuotes: true } ) ).to.be( '"123"\n' ) ;
		expect( stringify( "123.45" , { preferQuotes: true } ) ).to.be( '"123.45"\n' ) ;
		expect( stringify( "Hello: World!" , { preferQuotes: true } ) ).to.be( '"Hello: World!"\n' ) ;
		expect( stringify( "[Hello World!]" , { preferQuotes: true } ) ).to.be( '"[Hello World!]"\n' ) ;
		expect( stringify( "<hello>" , { preferQuotes: true } ) ).to.be( '"<hello>"\n' ) ;
		expect( stringify( "(hello)" , { preferQuotes: true } ) ).to.be( '"(hello)"\n' ) ;
		expect( stringify( "   Hello World!" , { preferQuotes: true } ) ).to.be( '"   Hello World!"\n' ) ;
		expect( stringify( "Hello World!   " , { preferQuotes: true } ) ).to.be( '"Hello World!   "\n' ) ;
		
		expect( stringify( "Hello\nWorld!" , { preferQuotes: true } ) ).to.be( '"Hello\\nWorld!"\n' ) ;
		expect( stringify( "One...\nTwo...\n\nThree!" , { preferQuotes: true } ) ).to.be( '"One...\\nTwo...\\n\\nThree!"\n' ) ;
		expect( stringify( "One...\n\tTwo...\n\nThree!" , { preferQuotes: true } ) ).to.be( '"One...\\n\\tTwo...\\n\\nThree!"\n' ) ;
	} ) ;
		
	it( "stringify non-string scalar" , () => {
		expect( stringify( undefined ) ).to.be( "null\n" ) ;
		expect( stringify( null ) ).to.be( "null\n" ) ;
		expect( stringify( true ) ).to.be( "true\n" ) ;
		expect( stringify( false ) ).to.be( "false\n" ) ;
		expect( stringify( 123 ) ).to.be( "123\n" ) ;
		expect( stringify( 123.456 ) ).to.be( "123.456\n" ) ;
	} ) ;
	
	it( "stringify empty object/array" , () => {
		expect( stringify( [] ) ).to.be( '<Array>\n' ) ;
		expect( stringify( {} ) ).to.be( '<Object>\n' ) ;
		expect( stringify( new TagContainer() ) ).to.be( '<TagContainer>\n' ) ;
	} ) ;
	
	it.skip( "stringify map" , () => {
		throw new Error( "Not coded" ) ;
	} ) ;
	
	it( "undefined value" , () => {
		expect( stringify( {a:{},b:undefined,c:{d:undefined}} ) ).to.be( 'a: <Object>\nc: <Object>\n' ) ;
		expect( stringify( [{},undefined,{d:undefined}] ) ).to.be( '- <Object>\n- null\n- <Object>\n' ) ;
	} ) ;
	
	it( "stringify a basic object" , () => {
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
		expect( o ).to.equal( parse( s ) ) ;
	} ) ;
	
	it( "stringify ref" , () => {
		expect( stringify( new Ref( '$path.to.var' ) ) ).to.be( '$path.to.var\n' ) ;
		expect( stringify( { ref: new Ref( '$path.to.var' ) } ) ).to.be( 'ref: $path.to.var\n' ) ;
	} ) ;
	
	it( "stringify applicable ref" ) ;
	
	it( "stringify expression" , () => {
		expect( stringify( parse( '$= 1 + ( 2 * ( 3 * $path.to.my.var ) )' ) ) ).to.be( '$= 1 + ( 2 * ( 3 * $path.to.my.var ) )\n' ) ;
		expect( stringify( parse( 'expression: $= 1 + ( 2 * ( 3 * $path.to.my.var ) )' ) ) ).to.be( 'expression: $= 1 + ( 2 * ( 3 * $path.to.my.var ) )\n' ) ;
		expect( stringify( parse( 'expression: $= $path.to.my.var ??? "bob" "bill" "jack"' ) ) ).to.be( 'expression: $= $path.to.my.var ??? "bob" "bill" "jack"\n' ) ;
	} ) ;
	
	it.skip( "stringify applicable expression" , () => {
		throw new Error( "Not coded" ) ;
	} ) ;
	
	it( "stringify templates" , () => {
		expect( stringify( { tpl: new TemplateSentence( 'Hello ${name}!' ) } ) ).to.be( 'tpl: $> Hello ${name}!\n' ) ;
		expect( stringify( { tpl: new TemplateSentence( 'Hey!\nHello ${name}!' ) } ) ).to.be( 'tpl: \n\t$> Hey!\n\t$> Hello ${name}!\n' ) ;
		expect( stringify( { tpl: new TemplateSentence( 'Hello ${name}!' ) } , { preferQuotes: true } ) ).to.be( 'tpl: $"Hello ${name}!"\n' ) ;
		expect( stringify( { tpl: new TemplateSentence( 'Hey!\nHello ${name}!' ) } , { preferQuotes: true } ) ).to.be( 'tpl: $"Hey!\\nHello ${name}!"\n' ) ;
		
		expect( stringify( new TemplateSentence( 'Hello ${name}!' ) ) ).to.be( '$> Hello ${name}!\n' ) ;
		expect( stringify( new TemplateSentence( 'Hey!\nHello ${name}!' ) ) ).to.be( '$> Hey!\n$> Hello ${name}!\n' ) ;
		expect( stringify( new TemplateSentence( 'Hello ${name}!' ) , { preferQuotes: true } ) ).to.be( '$"Hello ${name}!"\n' ) ;
		expect( stringify( new TemplateSentence( 'Hey!\nHello ${name}!' ) , { preferQuotes: true } ) ).to.be( '$"Hey!\\nHello ${name}!"\n' ) ;
		
		expect( stringify( { tpl: new TemplateSentence( '' ) } ) ).to.be( 'tpl: <Sentence>\n' ) ;
		expect( stringify( new TemplateSentence( '' ) ) ).to.be( '<Sentence>\n' ) ;
	} ) ;
	
	it( "stringify applicable templates" ) ;
	
	it( "stringify an object with operators" , () => {
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
		
		expect( s ).to.be( 'attack: (+) 2\ndefense: (-) 1\ntime: (*) 0.9\ndamages: (u-ops) 1.2\n+strange key: 3\n"(another strange key)": 5\n"-hey": 5\n~hey: 5\n(#*>) @@/path/to/*/something/\n(*>) @/path/to/something/\n() @/path/to/something/\n() @@/path/to/something/\nlist:\n\t- one\n\t- two\n\t- @@/path/to/something/\n' ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		expect( o ).to.equal( parse( s ) ) ;
	} ) ;
	
	it( "stringify an object with special instances (bin, date, regex)" , () => {
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
		
		expect( s ).to.be( 'bin: <bin16> af461e0a\ndate1: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\nregex1: <regex> /abc/\narray:\n\t-\t- <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\n\t\t- <regex> /abc/gi\n\t-\t- <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\n\t\t- <regex> /abc/gi\nobject:\n\tdate2: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\n\tregex2: <regex> /abc/gi\n' ) ;
		
		var o2 = parse( s ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		//expect( o ).to.eql( o2 ) ;
		
		expect( o2.bin ).to.be.a( Buffer ) ;
		expect( o2.bin.toString( 'hex' ) ).to.be( o.bin.toString( 'hex' ) ) ;
		
		delete o.bin ;
		delete o2.bin ;
		
		expect( o2 ).to.equal( o ) ;
	} ) ;
	
	it( "stringify an object with special custom instances" , () => {
		
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
		expect( stringify( o , { classes: stringifier } ) ).to.be( "simple: <Simple> abc\ncomplex: <Complex>\n\tstr: hello\n\tint: 6\n" ) ;
	} ) ;
	
	it( "stringify dynamic instance" , () => {
		expect( stringify( parse( "el: $<Atom> $> ${name}" ) ) ).to.be( "el: $<Atom> $> ${name}\n" ) ;
		
		// This does not make sense for the <Atom> constructor, but we don't care, it's just for the testing purpose
		expect( stringify( parse( "el: $<Atom>\n\tbob: true\n\tbill: false" ) ) ).to.be( "el: $<Atom>\n\tbob: true\n\tbill: false\n" ) ;
	} ) ;
	
	it( "stringify applicable instance of template atoms" ) ;
	
	it( "stringify an object with tags" , () => {
		var content = fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) ;
		var expected = fs.readFileSync( __dirname + '/sample/kfg/tag.expected.kfg' , 'utf8' ) ;
		var o = parse( content ) ;
		var s = stringify( o ) ;
		//console.log( s ) ;
		expect( s ).to.be( expected ) ;
	} ) ;
	
	it( "stringify an object with tags" , () => {
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
		
		expect( s ).to.be( '[if something > constant]\n\t[do] some tasks\n\t[do] some other tasks\n[else]\n\t[do]\n\t\t[do]\n\t\t\t- one\n\t\t\t- two\n\t\t\t- three\n\t\t[do]\n\t\t\ta: 1\n\t\t\tb: 2\n' ) ;
		
		var o2 = parse( s ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		//expect( o ).to.eql( o2 ) ;
		
		expect( o2 ).to.be.a( TagContainer ) ;
		expect( o2.children[ 0 ] ).to.be.a( Tag ) ;
		
		expect( o2 ).to.equal( o ) ;
	} ) ;
	
	it( "stringify an object with tags, featuring custom tags prototype" , () => {
		
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
		
		expect( s ).to.be( '[if something > constant]\n\t[do] some tasks\n\t[do] some other tasks\n[else]\n\t[do]\n\t\t[do]\n\t\t\t- one\n\t\t\t- two\n\t\t\t- three\n\t\t[do]\n\t\t\ta: 1\n\t\t\tb: 2\n' ) ;
		
		var o2 = parse( s , { tags: { if: IfTag.create } } ) ;
		//console.log( o2 ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		//expect( o ).to.eql( o2 ) ;
		
		expect( o2 ).to.be.a( TagContainer ) ;
		expect( o2.children[ 0 ] ).to.be.a( Tag ) ;
		
		expect( o2 ).to.equal( o ) ;
	} ) ;
} ) ;



describe( "KFG parse" , () => {
	
	it( "parse string at top-level" , () => {
		expect( parse( '"Hello World!"' ) ).to.be( "Hello World!" ) ;
		expect( parse( '> Hello World!' ) ).to.be( "Hello World!" ) ;
		expect( parse( '>   Hello World!' ) ).to.be( "  Hello World!" ) ;
		expect( parse( '>   Hello World!  ' ) ).to.be( "  Hello World!  " ) ;
		expect( parse( '> \tHello World!' ) ).to.be( "\tHello World!" ) ;
		expect( parse( '> \t\t\tHello\t\tWorld!' ) ).to.be( "\t\t\tHello\t\tWorld!" ) ;
		expect( parse( 'Hello World!' ) ).to.be( "Hello World!" ) ;
		//expect( parse( '  Hello World!  ' ) ).to.be( "Hello World!" ) ;	// Do not work with space indentation
		expect( parse( '"123"' ) ).to.be( "123" ) ;
		expect( parse( '"123.45"' ) ).to.be( "123.45" ) ;
		expect( parse( '> 123' ) ).to.be( "123" ) ;
		expect( parse( '> 123.45' ) ).to.be( "123.45" ) ;
		//expect( parse( 'this is not: an object' ) ).to.be( "this is not: an object" ) ;
	} ) ;
	
	it( "parse multi-line string at top-level" , () => {
		expect( parse( '> Hello\n> World!' ) ).to.be( "Hello\nWorld!" ) ;
		//expect( parse( 'Hello\nWorld!' ) ).to.be( "Hello\nWorld!" ) ;
	} ) ;
	
	it( "parse multi-line folding string at top-level" , () => {
		expect( parse( '>> Hello\n>> World!' ) ).to.be( "Hello World!" ) ;
		expect( parse( '>>   Hello  \n>>    World!   ' ) ).to.be( "Hello World!" ) ;
		expect( parse( '>> Hello\n>>\n>> World!' ) ).to.be( "Hello\nWorld!" ) ;
		expect( parse( '>> Hello\n>>\n>>\n>> World!' ) ).to.be( "Hello\n\nWorld!" ) ;
		expect( parse( '>>  \t\t Hello \t\t \n>>  \t\t  World! \t\t  ' ) ).to.be( "Hello World!" ) ;
		expect( parse( '>> multi\n>> ple\n>> lines' ) ).to.be( "multi ple lines" ) ;
		expect( parse( '>> multi\n>> ple\n>>\n>> lines' ) ).to.be( "multi ple\nlines" ) ;
		expect( parse( '>> multi\n>> ple\n>> \n>>    \n>>\n>> lines' ) ).to.be( "multi ple\n\n\nlines" ) ;
	} ) ;
	
	it( "parse non-string scalar at top-level" , () => {
		expect( parse( 'null' ) ).to.be( null ) ;
		expect( parse( 'true' ) ).to.be( true ) ;
		expect( parse( 'false' ) ).to.be( false ) ;
		expect( parse( '123' ) ).to.be( 123 ) ;
		expect( parse( '123.456' ) ).to.be( 123.456 ) ;
	} ) ;
	
	it( "parse instance at top-level" , () => {
		expect( JSON.stringify( parse( "<Bin16> 22" ) ) ).to.be( '{"type":"Buffer","data":[34]}' ) ;
		expect( JSON.stringify( parse( "<Object>" ) ) ).to.be( '{}' ) ;
		expect( JSON.stringify( parse( "<Object>\na: 1" ) ) ).to.be( '{"a":1}' ) ;
		expect( parse( "<TemplateSentence> :string" ).toString() ).to.be( ':string' ) ;
	} ) ;
		
	it( "numbers and string ambiguity" , () => {
		expect( parse( "v:1" ) ).to.equal( {v:1} ) ;
		expect( parse( "v:1l" ) ).to.equal( {v:"1l"} ) ;
		expect( parse( "v:10e2" ) ).to.equal( {v:1000} ) ;
		expect( parse( "v:123.5" ) ).to.equal( {v:123.5} ) ;
		expect( parse( "v:123.e5" ) ).to.equal( {v:"123.e5"} ) ;
	} ) ;
	
	it( "constant and string ambiguity" , () => {
		expect( parse( "v:true" ) ).to.equal( {v:true} ) ;
		expect( parse( "v:true or false" ) ).to.equal( {v:"true or false"} ) ;
	} ) ;
	
	it( "unquoted key ambiguity" , () => {
		expect( parse( "first-name:Joe" ) ).to.equal( {"first-name":"Joe"} ) ;
		expect( parse( "first-name :Joe" ) ).to.equal( {"first-name":"Joe"} ) ;
		expect( parse( "first-name   :Joe" ) ).to.equal( {"first-name":"Joe"} ) ;
		expect( parse( "first-name: Joe" ) ).to.equal( {"first-name":"Joe"} ) ;
		expect( parse( "first-name:   Joe" ) ).to.equal( {"first-name":"Joe"} ) ;
		expect( parse( "first-name : Joe" ) ).to.equal( {"first-name":"Joe"} ) ;
		expect( parse( "first-name   :   Joe" ) ).to.equal( {"first-name":"Joe"} ) ;
		
		expect( parse( "first name: Joe" ) ).to.equal( {"first name":"Joe"} ) ;
		expect( parse( "first name   :   Joe" ) ).to.equal( {"first name":"Joe"} ) ;
		
		expect( parse( "null: Joe" ) ).to.equal( {"null":"Joe"} ) ;
		expect( parse( "true: Joe" ) ).to.equal( {"true":"Joe"} ) ;
		expect( parse( "false: Joe" ) ).to.equal( {"false":"Joe"} ) ;
	} ) ;
	
	it( "quoted key" , () => {
		expect( parse( '"some:\\"bizarre:\\nkey" : value' ) ).to.equal( {"some:\"bizarre:\nkey":"value"} ) ;
	} ) ;
	
	it( "sections as array's elements" , () => {
		expect( parse( '---\nvalue' ) ).to.equal( ["value"] ) ;
		expect( parse( '----\nvalue' ) ).to.equal( ["value"] ) ;
		expect( parse( '---------\nvalue' ) ).to.equal( ["value"] ) ;
		expect( () => parse( '--\nvalue' ) ).to.throw( SyntaxError ) ;
		expect( parse( '---\nvalue1\n---\nvalue2' ) ).to.equal( ["value1","value2"] ) ;
		expect( parse( '---\nvalue1\n---\nvalue2\n---\n3' ) ).to.equal( ["value1","value2",3] ) ;
		expect( parse( '---\nvalue1\n---\nvalue2\n---\n3\n---\na: 1\nb: 2' ) ).to.equal( ["value1","value2",3,{a:1,b:2}] ) ;
		expect( parse( '---\nvalue1\n---\nvalue2\n---\n3\n---\na: 1\nb: 2\n---\nfour' ) ).to.equal( ["value1","value2",3,{a:1,b:2},"four"] ) ;
	} ) ;
	
	it( "sections as object's keys" , () => {
		expect( parse( '--- section1 ---\nvalue' ) ).to.equal( {section1:"value"} ) ;
		expect( parse( '---- section1 ---\nvalue' ) ).to.equal( {section1:"value"} ) ;
		expect( parse( '--- section1 ----\nvalue' ) ).to.equal( {section1:"value"} ) ;
		expect( parse( '------ section1 --------\nvalue' ) ).to.equal( {section1:"value"} ) ;
		expect( () => parse( '-- section1 ---\nvalue' ) ).to.throw( SyntaxError ) ;
		expect( () => parse( '--- section1 --\nvalue' ) ).to.throw( SyntaxError ) ;
		expect( () => parse( '--- section1 -\nvalue' ) ).to.throw( SyntaxError ) ;
		expect( () => parse( '--- section1 \nvalue' ) ).to.throw( SyntaxError ) ;
		expect( () => parse( '--- section1\nvalue' ) ).to.throw( SyntaxError ) ;
		expect( parse( '--- section1 ---\nvalue1\n--- section2 ---\nvalue2' ) ).to.equal( {section1:"value1",section2:"value2"} ) ;
		expect( parse( '--- section1 ---\nvalue1\n--- section2 ---\nvalue2\n--- section three ---\n3' ) ).to.equal( {section1:"value1",section2:"value2","section three":3} ) ;
		
		expect( parse( 'a: 1\nb: 2\n--- section1 ---\nvalue1\n--- section2 ---\nvalue2\n--- section three ---\n3' ) ).to.equal(
			{a:1,b:2,section1:"value1",section2:"value2","section three":3}
		) ;
		expect( () => parse( 'a: 1\nb: 2\n--- section1 ---\nvalue1\n--- section2 ---\nvalue2\n--- section three ---\n3\n\nd:4' ) ).to.throw( SyntaxError ) ;
		expect( parse( 'a: 1\nb: 2\n--- section1 ---\nvalue1\n--- section2 ---\nvalue2\n--- section three ---\nd:4\ne:5' ) ).to.equal(
			{a:1,b:2,section1:"value1",section2:"value2","section three":{d:4,e:5}}
		) ;
		expect( parse( 'a: 1\nb: 2\n--- section1 ---\nvalue1\n--- section2 ---\nvalue2\n--- section three ---\nd:4\ne:5\n--- section four ---\nf: 6' ) ).to.equal(
			{a:1,b:2,section1:"value1",section2:"value2","section three":{d:4,e:5},"section four":{f:6}}
		) ;
	} ) ;
	
	it( "map keys and values" , () => {
		expect( parse( '<: Hello Bob!\n:> Bonjour Bob !' ) ).to.map( [
			[ "Hello Bob!" , "Bonjour Bob !" ]
		] ) ;
		expect( parse( '<: Hello Bob!\n:> Bonjour Bob !\n<: How are you?\n:> Comment vas-tu ?' ) ).to.map( [
			[ "Hello Bob!" , "Bonjour Bob !" ] ,
			[ "How are you?" , "Comment vas-tu ?" ]
		] ) ;
		expect( parse( '<: true\n:> Bonjour Bob !' ) ).to.map( [
			[ true , "Bonjour Bob !" ]
		] ) ;
		expect( parse( '<: Hello Bob!\n:>\n\t- 1' ) ).to.map( [
			[ "Hello Bob!" , [1] ]
		] ) ;
		expect( parse( '<: Hello Bob!\n:>\n\t- 1\n\t- 2' ) ).to.map( [
			[ "Hello Bob!" , [1,2] ]
		] ) ;
		// Compact-list
		expect( parse( '<: Hello Bob!\n:>\t- 1\n\t- 2' ) ).to.map( [
			[ "Hello Bob!" , [1,2] ]
		] ) ;
		expect( parse( '<: Hello Bob!\n:>\n\ta: 1' ) ).to.map( [
			[ "Hello Bob!" , {a:1} ]
		] ) ;
		expect( parse( '<: Hello Bob!\n:>\n\ta: 1\n\tb: 2' ) ).to.map( [
			[ "Hello Bob!" , {a:1,b:2} ]
		] ) ;
	
		// Compact-list
		expect( parse( '<: Hello Bob!\n:>\ta: 1\n\tb: 2' ) ).to.map( [
			[ "Hello Bob!" , {a:1,b:2} ]
		] ) ;
		expect( parse( '<:\n\t- 1\n:> Bonjour Bob !' ) ).to.map( [
			[ [1] , "Bonjour Bob !" ]
		] ) ;
		expect( parse( '<:\n\t- 1\n\t- 2\n:> Bonjour Bob !' ) ).to.map( [
			[ [1,2] , "Bonjour Bob !" ]
		] ) ;
		expect( parse( '<:\n\ta: 1\n:> Bonjour Bob !' ) ).to.map( [
			[ {a:1} , "Bonjour Bob !" ]
		] ) ;
		expect( parse( '<:\n\ta: 1\n\tb: 2\n:> Bonjour Bob !' ) ).to.map( [
			[ {a:1,b:2} , "Bonjour Bob !" ]
		] ) ;
		expect( parse( '<:\ta: 1\n\tb: 2\n:> Bonjour Bob !' ) ).to.map( [
			[ {a:1,b:2} , "Bonjour Bob !" ]
		] ) ;
		expect( parse( 'translate:\n\t<: Hello Bob!\n\t:> Bonjour Bob !' ).translate ).to.map( [
			[ "Hello Bob!" , "Bonjour Bob !" ]
		] ) ;
	} ) ;

	it( "map to object" , () => {
		expect( parse( 'translate: <Object>\n\t<: Hello Bob!\n\t:> Bonjour Bob !' ) ).to.equal( {
			translate: {
				"Hello Bob!": "Bonjour Bob !"
			}
		} ) ;
	} ) ;
	
	it( "Dictionnaries/translation file shorthand syntax for map" , () => {
		expect( parse( '<: Hello Bob!\n:>> Bonjour Bob !' ) ).to.map( [
			[ "Hello Bob!" , "Bonjour Bob !" ]
		] ) ;
		expect( parse( '<: Hello Bob!\n:>\n\t> Bonjour Bob !\n\t> Comment ça va ?' ) ).to.map( [
			[ "Hello Bob!" , "Bonjour Bob !\nComment ça va ?" ]
		] ) ;
		expect( parse( '<: Hello Bob!\n:>> Bonjour Bob !\n:>> Comment ça va ?' ) ).to.map( [
			[ "Hello Bob!" , "Bonjour Bob !\nComment ça va ?" ]
		] ) ;
		
		
		expect( parse( '<<: Hello Bob!\n:> Bonjour Bob !' ) ).to.map( [
			[ "Hello Bob!" , "Bonjour Bob !" ]
		] ) ;
		expect( parse( '<<: Hello Bob!\n:>> Bonjour Bob !' ) ).to.map( [
			[ "Hello Bob!" , "Bonjour Bob !" ]
		] ) ;
		expect( parse( '<<: Hello Bob!\n<<: How are you?\n:>> Bonjour Bob !' ) ).to.map( [
			[ "Hello Bob!\nHow are you?" , "Bonjour Bob !" ]
		] ) ;
		
		
		expect( parse( '<<: Hello Bob!\n<<: How are you?\n:>> Bonjour Bob !\n:>> Comment ça va ?' ) ).to.map( [
			[ "Hello Bob!\nHow are you?" , "Bonjour Bob !\nComment ça va ?" ]
		] ) ;
		expect( parse( '<<: Hello Bob!\n<<: How are you?\n<<: Fine?\n:>> Bonjour Bob !\n:>> Comment ça va ?\n:>> Bien ?' ) ).to.map( [
			[ "Hello Bob!\nHow are you?\nFine?" , "Bonjour Bob !\nComment ça va ?\nBien ?" ]
		] ) ;

		expect( parse( '<<: Hello Bob!\n:>> Bonjour Bob !\n<<: Hi Bob!\n:>> Salut Bob !' ) ).to.map( [
			[ "Hello Bob!" , "Bonjour Bob !" ] ,
			[ "Hi Bob!" , "Salut Bob !" ]
		] ) ;
	} ) ;
	
	it( "Dictionnaries/translation file shorthand syntax for map, with folding" , () => {
		expect( parse( '<<<: Hello Bob!\n<<<: How are you?\n:>>> Bonjour Bob !\n:>>> Comment ça va ?' ) ).to.map( [
			[ "Hello Bob! How are you?" , "Bonjour Bob ! Comment ça va ?" ]
		] ) ;
		expect( parse( '<<<: Hello Bob!\n<<<: How are you?\n<<<: Fine?\n:>>> Bonjour Bob !\n:>>> Comment ça va ?\n:>>> Bien ?' ) ).to.map( [
			[ "Hello Bob! How are you? Fine?" , "Bonjour Bob ! Comment ça va ? Bien ?" ]
		] ) ;
		expect( parse( '<<<: Hello Bob!\n<<<:\n<<<: How are you?\n<<<: Fine?\n:>>> Bonjour Bob !\n:>>> Comment ça va ?\n:>>>\n:>>> Bien ?' ) ).to.map( [
			[ "Hello Bob!\nHow are you? Fine?" , "Bonjour Bob ! Comment ça va ?\nBien ?" ]
		] ) ;
		expect( parse( '<<<: Hello Bob!\n<<<:\n<<<:\n<<<: How are you?\n<<<: Fine?\n:>>> Bonjour Bob !\n:>>> Comment ça va ?\n:>>>\n:>>>\n:>>> Bien ?' ) ).to.map( [
			[ "Hello Bob!\n\nHow are you? Fine?" , "Bonjour Bob ! Comment ça va ?\n\nBien ?" ]
		] ) ;
	} ) ;
	
	it( "unquoted tabs should not be parsed as string but as undefined" , () => {
		var o ;
		
		o = parse( "object:\t\t\t\n\ta: 1" ) ;
		//console.log( o ) ;
		expect( o ).to.equal( { object: { a: 1 } } ) ;
		
		o = parse( "[tag]\t\t\t\n\ta: 1" ) ;
		//console.log( o ) ; console.log( JSON.stringify( o ) ) ;
		expect( JSON.stringify( o ) ).to.be( '{"children":[{"name":"tag","content":{"a":1},"attributes":null}]}' ) ;
	} ) ;
	
	it( "comment ambiguity" , () => {
		expect( parse( "#comment\nkey: value" ) ).to.equal( { key: "value" } ) ;
		expect( parse( "key: value # comment" ) ).to.equal( { key: "value # comment" } ) ;
		expect( parse( "object:\n\t# comment\n\tkey: value" ) ).to.equal( { object: { key: "value" } } ) ;
		expect( parse( "object:\n# comment\n\tkey: value" ) ).to.equal( { object: { key: "value" } } ) ;
		expect( parse( "object:\n\t\t# comment\n\tkey: value" ) ).to.equal( { object: { key: "value" } } ) ;
	} ) ;
	
	it( "parse a basic file" , () => {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ) ;
		
		expect( o ).to.equal( {
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
		
		//console.log( kungFig.getMeta( o ) ) ;
		//console.log( kungFig.getMeta( o ).getFirstTag( 'meta' ).content ) ;
		expect( kungFig.getMeta( o ).getFirstTag( 'meta' ).content ).to.equal( { content: "test" } ) ;
	} ) ;
	
	it( "parse a file using 4-spaces to indent" , () => {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/spaces-indent.kfg' , 'utf8' ) ) ;
		
		expect( o ).to.equal( {
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
		expect( kungFig.getMeta( o ).getFirstTag( 'meta' ).content ).to.equal( { content: "test" } ) ;
	} ) ;
	
	it( "parse ref" , () => {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } } ;
		
		o = parse( "ref: <Ref>" ) ;
		expect( o.ref.get() ).to.be( undefined ) ;
		
		o = parse( "ref: $name" ) ;
		expect( o.ref.get() ).to.be( undefined ) ;
		
		o = parse( "ref: $name\nref2: $bob.age" ) ;
		expect( o.ref.get( ctx ) ).to.be( "Bob" ) ;
		expect( o.ref.toString( ctx ) ).to.be( "Bob" ) ;
		expect( o.ref2.get( ctx ) ).to.be( 43 ) ;
		expect( o.ref2.toString( ctx ) ).to.be( "43" ) ;
	} ) ;
	
	it( "parse applicable ref" , () => {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } } ;
		
		o = parse( "ref: $$name\nref2: $$bob.age" ) ;
		expect( o.ref.get( ctx ) ).to.be( o.ref ) ;
		expect( o.ref2.get( ctx ) ).to.be( o.ref2 ) ;
		
		expect( o.ref.apply( ctx ) ).to.be( "Bob" ) ;
		expect( o.ref2.apply( ctx ) ).to.be( 43 ) ;
	} ) ;
	
	it( "parse expressions" , () => {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } , bill: { age: 37 } } ;
		
		//o = parse( "exp: <Expression>" ) ;
		//expect( o.exp ).to.be( undefined ) ;
		
		o = parse( "exp: $= $name" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( "Bob" ) ;
		
		o = parse( "exp: $= $bob.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 43 ) ;
		
		o = parse( "exp: $= $bob.age + 2" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 45 ) ;
		
		o = parse( "exp: $= 5 + $bob.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 48 ) ;
		
		o = parse( "exp: $=5 + $bob.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 48 ) ;
		
		o = parse( "exp: $= $bob.age - $bill.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 6 ) ;
		
		o = parse( "exp: $= - $bill.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( -37 ) ;
		
		o = parse( "exp: $= ( $bill.age + 3 ) / 10" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 4 ) ;
		
		o = parse( "exp: $= $bill.age < $bob.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( true ) ;
		
		o = parse( "exp: $= $bill.age > $bob.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( false ) ;
		
		o = parse( "exp: $= $bill.age == $bob.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( false ) ;
		
		o = parse( "exp: $= ( $bill.age + 6 ) == $bob.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( true ) ;
		
		o = parse( "exp: $= $bill.age != $bob.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( true ) ;
		
		o = parse( "exp: $= ( $bill.age + 6 ) != $bob.age" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( false ) ;
		
		o = parse( "exp: $= ! ( $bill.age == $bob.age )" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( true ) ;
		
		o = parse( "exp: $= ! ( ( $bill.age + 6 ) == $bob.age )" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( false ) ;
	} ) ;
	
	it( "parse multi-line expressions" , () => {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } , bill: { age: 37 } } ;
		
		o = parse( "exp:\n\t$= $bob.age + 2" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 45 ) ;
		
		o = parse( "exp:\n\t$= $bob.age\n\t$= + 2" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 45 ) ;
		
		o = parse( "exp:\n\t$=  $bob.age  \n\t$=   +  \n\t\n\t$=\n\t$= \n\t$=    \n\t$=  2  " ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 45 ) ;
		
		// Try with custom operators
		var operators = {
			triple: function( args ) { return args[ 0 ] * 3 ; }
		} ;
		
		o = parse( "exp:\n\t$=  triple  \n\t\n\t$=\n\t$= \n\t$=    \n\t$=  $bob.age  " , { operators: operators } ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( 129 ) ;
	} ) ;
	
	it( "parse applicable expressions" , () => {
		var o ;
		var ctx = { name: "Bob" , bob: { age: 43 } , bill: { age: 37 } } ;
		
		o = parse( "exp: $$= $bob.age + 2" ) ;
		expect( o.exp.getFinalValue( ctx ) ).to.be( o.exp ) ;
		expect( o.exp.apply( ctx ) ).to.be( 45 ) ;
	} ) ;
	
	it( "parse templates" , () => {
		var o ;
		
		// console.log( o.tpl ) ;
		// console.log( o.tpl.toString() ) ;
		// console.log( o.tpl.toString( { name: "Bob" } ) ) ;
		
		o = parse( "tpl: <TemplateSentence>" ) ;
		expect( o.tpl.toString() ).to.be( '' ) ;
		
		o = parse( "tpl: $> Hello ${name}!" ) ;
		expect( o.tpl.toString() ).to.be( 'Hello (undefined)!' ) ;
		expect( o.tpl.toString( { name: "Bob" } ) ).to.be( 'Hello Bob!' ) ;
		
		o = parse( "tpl:\n\t$> Hello ${name}!" ) ;
		expect( o.tpl.toString() ).to.be( 'Hello (undefined)!' ) ;
		expect( o.tpl.toString( { name: "Bob" } ) ).to.be( 'Hello Bob!' ) ;
		
		o = parse( "tpl:\n\t$> Hello ${name}!\n\t$> How are you ${name}?" ) ;
		expect( o.tpl.toString() ).to.be( 'Hello (undefined)!\nHow are you (undefined)?' ) ;
		expect( o.tpl.toString( { name: "Bob" } ) ).to.be( 'Hello Bob!\nHow are you Bob?' ) ;
		
		o = parse( 'tpl: $"Hello ${name}!"' ) ;
		expect( o.tpl.toString() ).to.be( 'Hello (undefined)!' ) ;
		expect( o.tpl.toString( { name: "Bob" } ) ).to.be( 'Hello Bob!' ) ;
		
		// Top-level templates
		o = parse( "<TemplateSentence>" ) ;
		expect( o.toString() ).to.be( '' ) ;
		
		o = parse( '$"Hello ${name}!"' ) ;
		expect( o.toString() ).to.be( 'Hello (undefined)!' ) ;
		expect( o.toString( { name: "Bob" } ) ).to.be( 'Hello Bob!' ) ;
		
		o = parse( '$> Hello ${name}!' ) ;
		expect( o.toString() ).to.be( 'Hello (undefined)!' ) ;
		expect( o.toString( { name: "Bob" } ) ).to.be( 'Hello Bob!' ) ;
		
		o = parse( '$> Hey!\n$> Hello ${name}!' ) ;
		expect( o.toString() ).to.be( 'Hey!\nHello (undefined)!' ) ;
		expect( o.toString( { name: "Bob" } ) ).to.be( 'Hey!\nHello Bob!' ) ;
	} ) ;
	
	it( "parse applicable templates" , () => {
		var o ;
		
		o = parse( "tpl: $$> Hello ${name}!" ) ;
		expect( o.tpl.toString( { name: "Bob" } ) ).to.be( 'Hello ${name}!' ) ;
		expect( o.tpl.apply( { name: "Bob" } ) ).to.be( 'Hello Bob!' ) ;
		
		o = parse( "tpl:\n\t$$> Hello ${name}!" ) ;
		expect( o.tpl.toString( { name: "Bob" } ) ).to.be( 'Hello ${name}!' ) ;
		expect( o.tpl.apply( { name: "Bob" } ) ).to.be( 'Hello Bob!' ) ;
		
		o = parse( 'tpl: $$"Hello ${name}!"' ) ;
		expect( o.tpl.toString( { name: "Bob" } ) ).to.be( 'Hello ${name}!' ) ;
		expect( o.tpl.apply( { name: "Bob" } ) ).to.be( 'Hello Bob!' ) ;
	} ) ;
	
	/*
	it( "parse template atoms" , () => {
		var o , o2 ;
		
		o = parse( "el: $%> horse" ) ;
		console.log( 'o:' , o ) ;
		expect( o.el ).to.be.like( { k: "horse" } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o = parse( 'el: $%"horse"' ) ;
		expect( o.el ).to.be.like( { k: "horse" } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o = parse( "el: $%> horse[n?horse|horses]" ) ;
		expect( o.el ).to.be.like( { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o = parse( "el:\n\t$%> horse[n?horse|horses]" ) ;
		expect( o.el ).to.be.like( { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o = parse( "el: $%> horse[n?horse|horses]" ) ;
		expect( o.el ).to.be.like( { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o = parse( 'el: $%"horse[n?horse|horses]"' ) ;
		expect( o.el ).to.be.like( { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o2 = parse( '$> I like ${el}[n:many]!' ) ;
		expect( o2.toString( o ) ).to.be( 'I like horses!' ) ;
	} ) ;
	*/
	
	it( "parse template atoms" , () => {
		var o , o2 ;
		
		o = parse( "el: <Atom> horse" ) ;
		//console.log( 'o:' , o ) ;
		expect( o.el ).to.be.like( { k: "horse" } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o = parse( 'el: <Atom> "horse"' ) ;
		expect( o.el ).to.be.like( { k: "horse" } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o = parse( "el: <Atom> horse[n?horse|horses]" ) ;
		expect( o.el ).to.be.like( { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o = parse( 'el: <Atom> "horse[n?horse|horses]"' ) ;
		expect( o.el ).to.be.like( { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o = parse( "el: <Atom>\n\t> horse[n?horse|horses]" ) ;
		expect( o.el ).to.be.like( { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.toString() ).to.be( 'horse' ) ;
		
		o2 = parse( '$> I like ${el}[n:many]!' ) ;
		expect( o2.toString( o ) ).to.be( 'I like horses!' ) ;
	} ) ;
	
	it( "parse dynamic instance" , () => {
		var o ;
		
		o = parse( "el: $<Atom> $> ${name}" ) ;
		//console.log( o.el ) ;
		//deb( o.el.getValue( { name: 'bob' } ) ) ;
		expect( o.el.getValue( { name: 'bob' } ) ).to.be.like( { k: 'bob' } ) ;
	} ) ;
	
	it( "parse applicable instance" , () => {
		var o ;
		
		o = parse( "el: $$<Atom> $> ${name}" ) ;
		//console.log( o.el ) ;
		//deb( o.el.getValue( { name: 'bob' } ) ) ;
		expect( o.el.getValue( { name: 'bob' } ) ).to.be( o.el ) ;
		expect( o.el.apply( { name: 'bob' } ) ).to.be.like( { k: 'bob' } ) ;
	} ) ;
	
	/*
	it( "parse applicable template atoms" , () => {
		var o , o2 ;
		
		o = parse( "el: $$%> horse[n?horse|horses]" ) ;
		expect( o.el ).to.be.like( { __isApplicable__: true , __isDynamic__: false , k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.apply() ).to.be( 'horse' ) ;
		
		o = parse( "el:\n\t$$%> horse[n?horse|horses]" ) ;
		expect( o.el ).to.be.like( { __isApplicable__: true , __isDynamic__: false , k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.apply() ).to.be( 'horse' ) ;
	} )
	*/
	
	it( "parse template sentence and atom, and use a babel instance to localize it" , () => {
		var o , o2 ;
		
		var babel = new Babel() ;
		
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
		expect( o.el ).to.be.like( { k: "horse" } ) ;
		expect( o.el.toString( babelFr ) ).to.be( 'cheval' ) ;
		
		o = parse( "el: <Atom> horse[n?horse|horses]" ) ;
		expect( o.el ).to.be.like( { k: "horse" , alt: [ "horse" , "horses" ] , ord: ['n'] } ) ;
		expect( o.el.toString( babelFr ) ).to.be( 'cheval' ) ;
		
		o.__babel = babelFr ;
		
		o2 = parse( '$> I like ${el}[n:many]!' ) ;
		expect( o2.toString( o ) ).to.be( "J'aime les chevaux!" ) ;
		
		o2 = parse( '$> I like ${el}[n:many/g:f]!' ) ;
		expect( o2.toString( o ) ).to.be( "J'aime les juments!" ) ;
		
		o.el.g = 'f' ;
		o2 = parse( '$> I like ${el}[n:many]!' ) ;
		expect( o2.toString( o ) ).to.be( "J'aime les juments!" ) ;
	} ) ;
	
	it( "parse a file with operators" , () => {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/ops.kfg' , 'utf8' ) ) ;
		
		expect( o ).to.equal( {
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
	
	it( "parse a file with special instances (json, bin, date, regex)" , () => {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/instances.kfg' , 'utf8' ) ) ;
		
		//console.log( JSON.stringify( o ) ) ;
		
		expect( JSON.stringify( o ) ).to.be(
			'{"a":1234,"bin":{"type":"Buffer","data":[253,16,75,25]},"date1":"2016-04-29T10:08:14.000Z","date2":"2016-04-29T10:08:08.645Z","b":"toto","regex1":{},"sub":{"sub":{"date3":"1970-01-01T00:00:01.000Z","regex2":{}}},"d":2,"json":{"a":1,"b":2,"array":[1,2,"three"]}}'
		) ;
		
		expect( o.regex1 ).to.be.a( RegExp ) ;
		expect( o.regex1.toString() ).to.be( "/abc/" ) ;
		
		expect( o.sub.sub.regex2 ).to.be.a( RegExp ) ;
		expect( o.sub.sub.regex2.toString() ).to.be( "/abc/m" ) ;
		
		expect( o.bin.toString( 'hex' ) ).to.be( "fd104b19" ) ;
	} ) ;
	
	it( "parse a file with ordered object" , () => {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/ordered-object.kfg' , 'utf8' ) ) ;
		
		//console.log( JSON.stringify( o ) ) ;
		
		expect( JSON.stringify( o ) ).to.be(
			// Without _keys
			'{"top":{"name":"John","_index":0},"sub":{"_index":1,"one":{"name":"Bob","_index":0},"two":{"name":"Bill","_index":1},"three":{"name":"Jack","_index":2}}}'
			// With _keys
			//'{"_keys":["top","sub"],"top":{"name":"John","_index":0},"sub":{"_keys":["one","two","three"],"_index":1,"one":{"name":"Bob","_index":0},"two":{"name":"Bill","_index":1},"three":{"name":"Jack","_index":2}}}'
		) ;
		
		expect( o ).to.be.a( kungFig.OrderedObject ) ;
		expect( o.sub ).to.be.a( kungFig.OrderedObject ) ;
		expect( o._keys ).to.equal( [ 'top' , 'sub' ] ) ;
		expect( o.top._key ).to.be( 'top' ) ;
		expect( o.sub._key ).to.be( 'sub' ) ;
		expect( o.sub._keys ).to.equal( [ 'one' , 'two' , 'three' ] ) ;
		expect( o.sub.one._key ).to.be( 'one' ) ;
		expect( o.sub.two._key ).to.be( 'two' ) ;
		expect( o.sub.three._key ).to.be( 'three' ) ;
	} ) ;
	
	it( "parse a file with special custom instances" , () => {
		
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
		expect( JSON.stringify( o ) ).to.be( '{"simple":{"str":"abc"},"complex":{"str":"hello","int":6}}' ) ;
	} ) ;
	
	it( "parse tags" , () => {
		expect( JSON.stringify( parse( '[tag]' ) ) ).to.be( '{"children":[{"name":"tag","attributes":null}]}' ) ;
		expect( JSON.stringify( parse( '[tag] text' ) ) ).to.be( '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
		expect( JSON.stringify( parse( '[tag] "text"' ) ) ).to.be( '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
		expect( JSON.stringify( parse( '[tag] > text' ) ) ).to.be( '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
		expect( JSON.stringify( parse( '[tag]\n\t> text' ) ) ).to.be( '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
		expect( JSON.stringify( parse( '[tag] true' ) ) ).to.be( '{"children":[{"name":"tag","content":true,"attributes":null}]}' ) ;
		expect( JSON.stringify( parse( '[tag] 123' ) ) ).to.be( '{"children":[{"name":"tag","content":123,"attributes":null}]}' ) ;
		expect( JSON.stringify( parse( '[tag] <Object>' ) ) ).to.be( '{"children":[{"name":"tag","content":{},"attributes":null}]}' ) ;
		expect( JSON.stringify( parse( '[tag] <Object>\n\ta: 1\n\tb: 2' ) ) ).to.be( '{"children":[{"name":"tag","content":{"a":1,"b":2},"attributes":null}]}' ) ;
	} ) ;
	
	it( "parse a file containing tags" , () => {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) ) ;
		
		//console.log( o ) ;
		//console.log( string.inspect( { style: 'color' , depth: 15 } , o ) ) ;
		//console.log( string.escape.control( JSON.stringify( o ) ) ) ;
		//console.log( JSON.stringify( o ) ) ;
		
		expect( JSON.stringify( o ) ).to.be( '{"children":[{"name":"tag","content":{"some":"value","another":"one"},"attributes":"id1"},{"name":"tag","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","content":{"children":[{"name":"do","content":"some work","attributes":null}]},"attributes":"something > constant"},{"name":"else","content":{"children":[{"name":"do","content":"something else","attributes":null}]},"attributes":null}]}}},"attributes":"id2"},{"name":"container","content":{"children":[{"name":"tag","attributes":null},{"name":"anothertag","attributes":null},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]},"attributes":null}]}' ) ;
		
		//console.log( o.children[ 2 ].content.children[ 0 ].parent ) ;
		//console.log( o.children[ 2 ].content.children[ 0 ].getParentTag() ) ;
		expect( o.children[ 2 ].getParentTag() ).to.be( null ) ;
		expect( o.children[ 2 ] ).to.be( o.children[ 2 ].content.children[ 0 ].getParentTag() ) ;
	} ) ;
	
	it( "parse a file containing tags, with custom tags prototypes" , () => {
		
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
		
		expect( JSON.stringify( o ) ).to.be( '{"children":[{"name":"tag","content":{"some":"value","another":"one"},"attributes":"id1"},{"name":"tag","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","content":{"children":[{"name":"do","content":"some work","attributes":null}]},"attributes":{"left":"something","operator":">","right":"constant"}},{"name":"else","content":{"children":[{"name":"do","content":"something else","attributes":null}]},"attributes":null}]}}},"attributes":"id2"},{"name":"container","content":{"children":[{"name":"tag","attributes":null},{"name":"anothertag","attributes":null},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]},"attributes":null}]}' ) ;
	} ) ;
} ) ;
	


describe( "Meta-Tag" , () => {
	
	it( "parse meta-tag" , () => {
		var o ;
		o = parse( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\nsome: data' ) ;
		/*
		console.log( o ) ;
		console.log( kungFig.getMeta( o ) ) ;
		console.log( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ] ) ;
		*/
		expect( o ).to.equal( { some: "data" } ) ;
		expect( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ].content ).to.equal( { author: "Joe Doe" , copyright: 2016 } ) ;
		
		//console.log( stringify( o ) ) ;
		expect( stringify( o ) ).to.be( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\n\nsome: data\n' ) ;
	} ) ;
	
	it( "stringify meta-tag" , () => {
		var o ;
		o = { some: "data" } ;
		kungFig.setMeta( o , [ new Tag( 'meta' , undefined , { author: "Joe Doe" , copyright: 2016 } ) ] ) ;
		
		//console.log( stringify( o ) ) ;
		expect( stringify( o ) ).to.be( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\n\nsome: data\n' ) ;
	} ) ;
	
	it( "meta doctype filtering" , () => {
		var o , kfg ;
		
		kfg = '[[doctype supadoc]]\nsome: data' ;
		
		o = parse( kfg ) ;
		expect( kungFig.getMeta( o ).getTags( "doctype" )[ 0 ].attributes ).to.be( "supadoc" ) ;
		expect( o ).to.equal( { some: "data" } ) ;
		
		o = parse( kfg , { doctype: "supadoc" } ) ;
		expect( kungFig.getMeta( o ).getTags( "doctype" )[ 0 ].attributes ).to.be( "supadoc" ) ;
		expect( o ).to.equal( { some: "data" } ) ;
		
		expect( () => parse( kfg , { doctype: "baddoc" } ) ).to.throw() ;
		
		o = parse( kfg , { doctype: [ "cooldoc" , "supadoc" ] } ) ;
		expect( kungFig.getMeta( o ).getTags( "doctype" )[ 0 ].attributes ).to.be( "supadoc" ) ;
		expect( o ).to.equal( { some: "data" } ) ;
		
		expect( () => parse( kfg , { doctype: [ "baddoc" , "wrongdoc" ] } ) ).to.throw() ;
		
		kfg = '\nsome: data' ;
		expect( () => parse( kfg , { doctype: "supadoc" } ) ).to.throw() ;
		expect( () => parse( kfg , { doctype: [ "supadoc" , "cooldoc" ] } ) ).to.throw() ;
	} ) ;
	
	it( "parse meta-tag, with meta hook" , () => {
		var o , hookTriggered = 0 ;
		
		var options = {
			metaHook: function( meta ) {
				//console.log( "Received meta: " , meta.getTags( 'meta' )[ 0 ].content ) ;
				expect( meta.getTags( 'meta' )[ 0 ].content ).to.equal( { author: "Joe Doe" , copyright: 2016 } ) ;
				hookTriggered ++ ;
			}
		} ;
		
		o = parse( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\nsome: data' , options ) ;
		
		/*
		console.log( o ) ;
		console.log( kungFig.getMeta( o ) ) ;
		console.log( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ] ) ;
		*/
		
		expect( hookTriggered ).to.be( 1 ) ;
		expect( o ).to.equal( { some: "data" } ) ;
		expect( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ].content ).to.equal( { author: "Joe Doe" , copyright: 2016 } ) ;
		
		//console.log( stringify( o ) ) ;
		expect( stringify( o ) ).to.be( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\n\nsome: data\n' ) ;
	} ) ;
	
	it( "meta tag after body started should throw" , () => {
		expect( () => parse( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\nsome: data\n[[meta]]' ) ).to.throw() ;
	} ) ;
	
	it( "meta hook & loading (include, ...)" , () => {
		var o , hookTriggered = 0 , nonIncludeHookTriggered = 0 , includeHookTriggered = 0 ;
		
		var options = {
			metaHook: function( meta , options ) {
				//if ( meta ) { console.log( "Received meta: " , meta , "\n>>>" , meta.getFirstTag( 'meta' ).content ) ; }
				//else { console.log( "No meta" ) ; }
				
				//expect( meta.getTags( 'meta' )[ 0 ].content ).to.equal( { author: "Joe Doe" , copyright: 2016 } ) ;
				hookTriggered ++ ;
				
				if ( [ "meta-hook.kfg" , "meta-hook-include.kfg" ].indexOf( pathModule.basename( options.file ) ) === -1 ) {
					throw new Error( "Bad options.file" ) ;
				}
				
				if ( options.isInclude ) { includeHookTriggered ++ ; }
				else { nonIncludeHookTriggered ++ ; }
			}
		} ;
		
		o = kungFig.load( __dirname + '/sample/kfg/meta-hook.kfg' , options ) ;
		
		//console.log( "data:" , o ) ;
		//console.log( "meta:" , kungFig.getMeta( o ) , "\n###" , kungFig.getMeta( o ).getFirstTag( 'meta' ).content ) ;
		
		expect( hookTriggered ).to.be( 2 ) ;
		expect( includeHookTriggered ).to.be( 1 ) ;
		expect( nonIncludeHookTriggered ).to.be( 1 ) ;
		expect( o ).to.equal( { include: { some: { more: "content"  } } , some: "content" } ) ;
		expect( kungFig.getMeta( o ).getFirstTag( 'meta' ).content ).to.be( "master" ) ;
	} ) ;
} ) ;



describe( "LabelTag" , () => {
	
	var LabelTag = kungFig.LabelTag ;
	
	it( "label attributes parse" , () => {
		expect( LabelTag.parseAttributes( 'label' ) ).to.be( 'label' ) ;
		expect( LabelTag.parseAttributes( '' ) ).to.be( '' ) ;
	} ) ;
	
	it( "label attributes stringify" , () => {
		expect( LabelTag.stringifyAttributes( 'label' ) ).to.be( 'label' ) ;
		expect( LabelTag.stringifyAttributes( 'label[]' ) ).to.be( '"label[]"' ) ;
	} ) ;
	
	
	it( "LabelTag parse" , () => {
		var o = parse( '[LabelTag my-label]' , { tags: { LabelTag: LabelTag } } ) ;
		
		//console.log( "parsed:" , o ) ;
		
		// Doormen fails with constructors ATM
		expect( JSON.parse( JSON.stringify( o ) ) ).to.equal( {
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



describe( "VarTag" , () => {
	
	var LabelTag = kungFig.LabelTag ;
	
	it( "VarTag parse" ) ;
	it( "VarTag stringify" ) ;
} ) ;



describe( "ClassicTag" , () => {
	
	var ClassicTag = kungFig.ClassicTag ;
	
	it( "classic attributes parse" , () => {
		expect(
			ClassicTag.parseAttributes( 'width=1280 height=1024 src="/css/main.css" active' ) ).to.equal(
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
		
		expect(
			ClassicTag.parseAttributes( 'active width=1280 height=1024 src="/css/main.css"' ) ).to.equal(
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
		
		expect(
			ClassicTag.parseAttributes( '  width=1280  height = 1024  src="/css/main.css" active ' ) ).to.equal(
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
		
		expect(
			ClassicTag.parseAttributes( 'width=1280 height=1024 src="/css/main.css" active empty=""' ) ).to.equal(
			{ width: 1280, height: 1024, src: '/css/main.css', active: true , empty: '' }
		) ;
		
		expect(
			ClassicTag.parseAttributes( 'width:1280 height:1024 src:"/css/main.css" active' , ':' ) ).to.equal(
			{ width: 1280, height: 1024, src: '/css/main.css', active: true }
		) ;
	} ) ;
	
	it( "classic attributes stringify" , () => {
		//console.log( ClassicTag.stringifyAttributes( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ) ;
		
		expect(
			ClassicTag.stringifyAttributes( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ).to.be(
			'width=1280 height=1024 src="/css/main.css" active' 
		) ;
	} ) ;
	
	it( "ClassicTag parse" , () => {
		var o = parse( '[ClassicTag width=1280 height=1024 src="/css/main.css" active]' , { tags: { ClassicTag: ClassicTag } } ) ;
		
		//console.log( "parsed:" , o ) ;
		
		// Doormen fails with constructors ATM
		expect( JSON.parse( JSON.stringify( o ) ) ).to.equal( {
			children: [
				{
					name: 'ClassicTag' ,
					attributes: { width: 1280, height: 1024, src: '/css/main.css', active: true } ,
					content: undefined
				}
			] 
		} ) ;
		
		/*
		expect( o , {
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
	
	it( "ClassicTag stringify" , () => {
		var o = new TagContainer( [
			new ClassicTag( 'ClassicTag' , { width: 1280, height: 1024, src: '/css/main.css', active: true } ) 
		] ) ;
		
		//console.log( o ) ;
		
		expect( stringify( o ) ).to.be( '[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' ) ;
		
		o = new TagContainer( [
			new ClassicTag( 'ClassicTag' , { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ,
			new ClassicTag( 'ClassicTag' , { fullscreen: true } ) 
		] ) ;
		
		//console.log( o ) ;
		
		expect( stringify( o ) ).to.be(
			'[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' +
			'[ClassicTag fullscreen]\n'
		) ;
		
		//console.log( parse( stringify( o ) ) ) ;
		
		o = new TagContainer( [
			new ClassicTag( 'ClassicTag' , { width: 1280, height: 1024, src: '/css/main.css', active: true } , { hello: "world!" } ) ,
			new ClassicTag( 'ClassicTag' , { fullscreen: true } ) 
		] ) ;
		
		//console.log( o ) ;
		
		expect(
			stringify( o ) ).to.be(
			'[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' +
			'\thello: world!\n' +
			'[ClassicTag fullscreen]\n'
		) ;
	} ) ;
} ) ;



describe( "ExpressionTag" , () => {
	
	var ExpressionTag = kungFig.ExpressionTag ;
	
	it( "ExpressionTag parse" , function () {
		var ctx = { a: 4 , b: 1 } ;
		var o = parse( '[ExpressionTag $a > 3]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		
		//console.log( "parsed:" , o ) ;
		
		// Doormen fails with constructors ATM
		expect( JSON.parse( JSON.stringify( o ) ) ).to.equal( {
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
		
		expect( typeof o.children[ 0 ].attributes.fnOperator === 'function' , true ) ;
		expect( o.children[0].attributes.getFinalValue( ctx ) ).to.be( true ) ;
		ctx.a = 2 ;
		expect( o.children[0].attributes.getFinalValue( ctx ) ).to.be( false ) ;
		
		
		o = parse( '[ExpressionTag 3 <= ( round 3.3 )]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		expect( o.children[0].attributes.getFinalValue( ctx ) ).to.be( true ) ;
		
		o = parse( '[ExpressionTag 4 < ( round 3.3 )]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		expect( o.children[0].attributes.getFinalValue( ctx ) ).to.be( false ) ;
		
		o = parse( '[ExpressionTag ( round 3.3 ) >= 3]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		expect( o.children[0].attributes.getFinalValue( ctx ) ).to.be( true ) ;
		
		o = parse( '[ExpressionTag ( round 3.3 ) >= 4]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
		expect( o.children[0].attributes.getFinalValue( ctx ) ).to.be( false ) ;
	} ) ;
	
	it( "ExpressionTag parse with custom operators" , function () {
		var ctx = { a: 4 , b: 1 } ;
		
		var operators = {
			triple: function( args ) { return args[ 0 ] * 3 ; }
		} ;
		
		var o = parse( '[ExpressionTag triple $a]' , { tags: { ExpressionTag: ExpressionTag } , operators: operators } ) ;
		
		expect( o.children[0].attributes.getFinalValue( ctx ) ).to.be( 12 ) ;
		ctx.a = 2 ;
		expect( o.children[0].attributes.getFinalValue( ctx ) ).to.be( 6 ) ;
	} ) ;
	
	it( "ExpressionTag stringify" ) ;
} ) ;



describe( "Historical bugs" , () => {
	
	it( ".saveKfg() bug with tags" , () => {
		var content = fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) ;
		var expected = fs.readFileSync( __dirname + '/sample/kfg/tag.expected.kfg' , 'utf8' ) ;
		var o = parse( content ) ;
		var s = kungFig.saveKfg( o , __dirname + '/sample/output.kfg' ) ;
		//console.log( s ) ;
		expect( s ).to.be( expected ) ;
	} ) ;
} ) ;
	
