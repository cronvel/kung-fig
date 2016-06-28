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
var Expression = kungFig.Expression ;

var string = require( 'string-kit' ) ;
var doormen = require( 'doormen' ) ;
var expect = require( 'expect.js' ) ;



function deb( v )
{
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}

function debfn( v )
{
	console.log( string.inspect( { style: 'color' , depth: 5 , proto: true , funcDetails: true } , v ) ) ;
}



describe( "Expression" , function() {
	
	it( "parse a simple expression" , function() {
		var parsed ;
		parsed = Expression.parse( '1 + 2' ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 3 ) ;
	} ) ;
	
	it( "parse a simple expression of expression" , function() {
		var parsed ;
		
		parsed = Expression.parse( '1 + ( 2 + 3 )' ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 6 ) ;
		
		parsed = Expression.parse( '( 2 + 3 ) + 1' ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 6 ) ;
		
		parsed = Expression.parse( '( ( 5 + 1 ) + 6 ) + ( 2 + ( 3 + 4 ) )' ) ;
		//deb( parsed ) ;
		doormen.equals( parsed.getFinalValue() , 21 ) ;
	} ) ;
} ) ;


