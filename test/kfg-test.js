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

"use strict" ;



var kungFig = require( '../lib/kungFig.js' ) ;
var stringify = kungFig.stringify ;
var parse = kungFig.parse ;
var doormen = require( 'doormen' ) ;
var expect = require( 'expect.js' ) ;
var string = require( 'string-kit' ) ;
var fs = require( 'fs' ) ;



describe( "KFG stringify" , function() {
	
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
			'#hey': 5,
			'@*>': '/path/to/something/',
			'@': '/path/to/something/',
			'@@': '/path/to/something/',
			list: [ 'one' , 'two' , { "@@": '/path/to/something/' } ] ,
		} ;
		
		var s = stringify( o ) ;
		//console.log( s ) ;
		//console.log( string.escape.control( s ) ) ;
		//console.log( parse( s ) ) ;
		
		var expected = 'attack: (+) 2\ndefense: (-) 1\ntime: (*) 0.9\ndamages: (u-ops) 1.2\n+strange key: 3\n"(another strange key)": 5\n"-hey": 5\n"#hey": 5\n(*>) @/path/to/something/\n() @/path/to/something/\n() @@/path/to/something/\nlist:\n\t- one\n\t- two\n\t- @@/path/to/something/\n' ;
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
		
		expect( o2.bin ).to.be.an( Buffer ) ;
		expect( o2.bin.toString( 'hex' ) ).to.be( o.bin.toString( 'hex' ) ) ;
		
		delete o.bin ;
		delete o2.bin ;
		
		doormen.equals( o , o2 ) ;
	} ) ;
} ) ;



describe( "KFG parse" , function() {
	
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
			list: [ 'one' , 'two' , { '@@': 'path/to/include.kfg' } ] ,
			'@*>': 'path/to/something',
		} ) ;
	} ) ;
	
	it( "parse a file with special instances (bin, date, regex)" , function() {
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/instances.kfg' , 'utf8' ) ) ;
		
		//console.log( require( 'util' ).inspect( o , { depth: 10 } ) ) ;
		//console.log( JSON.stringify( o ) ) ;
		
		doormen.equals(
			JSON.stringify( o ) ,
			'{"a":1234,"bin":{"type":"Buffer","data":[253,16,75,25]},"date1":"2016-04-29T10:08:14.000Z","date2":"2016-04-29T10:08:08.645Z","b":"toto","regex1":{},"sub":{"sub":{"date3":"1970-01-01T00:00:01.000Z","regex2":{}}},"d":2}'
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
			customConstructors: {
				simple: Simple ,
				complex: Complex
			}
		} ;
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/custom-instances.kfg' , 'utf8' ) , options ) ;
		
		//console.log( o ) ;
		doormen.equals( JSON.stringify( o ) , '{"simple":{"str":"abc"},"complex":{"str":"hello","int":6}}' ) ;
	} ) ;
	
	it( "parse a file in tag-mode" , function() {
		
		function Tag( value , attributes )
		{
			var self = Object.create( Tag.prototype ) ;
			self.id = attributes[ 0 ] ;
			self.some = value.some ;
			return self ;
		}
		
		var options = {
			tagMode: true ,
			customConstructors: {
				tag: Tag
			}
		} ;
		
		var o = parse( fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) , options ) ;
		
		console.log( o ) ;
	} ) ;
} ) ;



