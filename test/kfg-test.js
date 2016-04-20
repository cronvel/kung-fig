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
var fs = require( 'fs' ) ;



describe( "kfg stringify" , function() {
	
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
		} ;
		
		var s = stringify( o ) ;
		//console.log( s ) ;
		//console.log( parse( s ) ) ;
		
		// Check that the original object and the stringified/parsed object are equals:
		require( 'expect.js' )( o ).to.eql( parse( s ) ) ;
		doormen.equals( o , parse( s ) ) ;
	} ) ;
} ) ;



describe( "kfg parse" , function() {
	
	it( "parse a basic file" , function() {
		var o ;
		
		o = parse( fs.readFileSync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ) ;
		
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
		var o ;
		
		o = parse( fs.readFileSync( __dirname + '/sample/kfg/ops.kfg' , 'utf8' ) ) ;
		
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
		} ) ;
	} ) ;
} ) ;

