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
var doormen = require( 'doormen' ) ;



describe( "Operator behaviours" , function() {
	
	it( "mixing + and * for the same base key should preserve operation order (first *, then +)" , function() {
		
		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1
		} ;
		
		var shield = {
			"+defense": 3 ,
		} ;
		
		var enchantedArmor = {
			"*defense": 2 ,
			"+defense": 1 ,
			"+magic": 1
		} ;
		
		doormen.equals(
			kungFig.stack( creature , shield , enchantedArmor ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 3 ,
				move: 1 ,
				"+defense": 4 ,
				"*defense": 2 ,
				"+magic": 1
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( creature , shield , enchantedArmor ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 10 ,
				move: 1 ,
				"+magic": 1
			}
		) ;
	} ) ;
	
	it( "- and / should be converted to + and *" , function() {
		
		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 8 ,
			move: 1
		} ;
		
		var cursedAmulet = {
			"-defense": 2 ,
		} ;
		
		var cursedRing = {
			"/defense": 2 ,
		} ;
		
		doormen.equals(
			kungFig.stack( cursedAmulet ) ,
			{ "+defense": -2 }
		) ;
		
		doormen.equals(
			kungFig.stack( cursedRing ) ,
			{ "*defense": 0.5 }
		) ;
		
		doormen.equals(
			kungFig.stack( cursedAmulet , cursedRing ) ,
			{
				"+defense": -2 ,
				"*defense": 0.5
			}
		) ;
		
		doormen.equals(
			kungFig.stack( creature , cursedAmulet , cursedRing ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 8 ,
				"+defense": -2 ,
				"*defense": 0.5 ,
				move: 1
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( creature , cursedAmulet , cursedRing ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 2 ,
				move: 1
			}
		) ;
		
	} ) ;
	
	it( "the combining after operator *>" , function() {
		
		var tree = {
			subtree: {
				a: 3,
				b: 5,
				c: 11
			}
		} ;
		
		var mods = {
			"*>subtree": {
				"+a": 1,
				"+b": 3,
				c: 12
			}
		} ;
		
		//console.log( kungFig.stack( tree , mods ) ) ;
		doormen.equals(
			kungFig.stack( tree , mods ) ,
			{
				//*
				subtree: {
					a: 3,
					b: 5,
					c: 11
				},
				"*>subtree": {
					"+a": 1,
					"+b": 3,
					c: 12
				}
				//*/
				
				/*
				subtree: {
					a: 3,
					b: 5,
					c: 12,
					"+a": 1,
					"+b": 3
				},
				//*/
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( tree , mods ) ,
			{
				subtree: {
					a: 4,
					b: 8,
					c: 12
				}
			}
		) ;
	} ) ;
	
	it( "the concat after (append) operator +>" , function() {
		
		var tree = {
			array: [ 3,5,11 ]
		} ;
		
		var mods = {
			"+>array": [ 2,7 ]
		} ;
		
		//console.log( kungFig.stack( tree , mods ) ) ;
		doormen.equals(
			kungFig.stack( tree , mods ) ,
			{
				array: [ 3,5,11 ],
				"+>array": [ 2,7 ]
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( tree , mods ) ,
			{
				array: [ 3,5,11,2,7 ]
			}
		) ;
	} ) ;
	
	it( "the concat before (prepend) operator <+" , function() {
		
		var tree = {
			array: [ 3,5,11 ]
		} ;
		
		var mods = {
			"<+array": [ 2,7 ]
		} ;
		
		//console.log( kungFig.stack( tree , mods ) ) ;
		doormen.equals(
			kungFig.stack( tree , mods ) ,
			{
				array: [ 3,5,11 ],
				"<+array": [ 2,7 ]
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( tree , mods ) ,
			{
				array: [ 2,7,3,5,11 ]
			}
		) ;
	} ) ;
	
	it( "the combining before operator <*" , function() {
		
		var tree = {
			subtree: {
				a: 3,
				b: 5,
				c: 11
			}
		} ;
		
		var mods = {
			"<*subtree": {
				"+a": 1,
				"+b": 3,
				c: 12,
				d: 7
			}
		} ;
		
		//console.log( kungFig.stack( tree , mods ) ) ;
		doormen.equals(
			kungFig.stack( tree , mods ) ,
			{
				//*
				subtree: {
					a: 3,
					b: 5,
					c: 11
				},
				"<*subtree": {
					"+a": 1,
					"+b": 3,
					c: 12,
					d: 7
				}
				//*/
				
				/*
				subtree: {
					a: 3,
					b: 5,
					c: 11,
					d: 7,
					"+a": 1,
					"+b": 3
				}
				//*/
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( tree , mods ) ,
			{
				subtree: {
					a: 4,
					b: 8,
					c: 11,
					d: 7
				}
			}
		) ;
	} ) ;
	
	it( "the combining after operator *> with no baseKey should combine in the root element" , function() {
		
		var tree = {
			a: 3,
			b: 5,
			c: 11
		} ;
		
		var mods = {
			"*>": {
				"+a": 1,
				"+b": 3,
				c: 12
			}
		} ;
		
		//console.log( kungFig.stack( tree , mods ) ) ;
		doormen.equals(
			kungFig.stack( tree , mods ) ,
			//*
			{
				a: 3,
				b: 5,
				c: 11,
				"*>": {
					"+a": 1,
					"+b": 3,
					c: 12
				}
			}
			//*/
			
			/*
			{
				a: 3,
				b: 5,
				c: 12,
				"+a": 1,
				"+b": 3
			}
			//*/
		) ;
		
		doormen.equals(
			kungFig.reduce( tree , mods ) ,
			{
				a: 4,
				b: 8,
				c: 12
			}
		) ;
		
		var tree = {
			a: 3,
			b: 5,
			c: 11,
			"*>": {
				"+a": 1,
				"+b": 3,
				c: 12
			}
		} ;
		
		doormen.equals(
			kungFig.reduce( tree ) ,
			{
				a: 4,
				b: 8,
				c: 12
			}
		) ;
	} ) ;
	
	it( "the combining before operator <* with no baseKey should combine in the root element" , function() {
		
		var tree = {
			a: 3,
			b: 5,
			c: 11
		} ;
		
		var mods = {
			"<*": {
				"+a": 1,
				"+b": 3,
				c: 12,
				d: 7
			}
		} ;
		
		//console.log( kungFig.stack( tree , mods ) ) ;
		doormen.equals(
			kungFig.stack( tree , mods ) ,
			//*
			{
				a: 3,
				b: 5,
				c: 11,
				"<*": {
					"+a": 1,
					"+b": 3,
					c: 12,
					d: 7
				}
			}
			//*/
			
			/*
			{
				a: 3,
				b: 5,
				c: 11,
				d: 7,
				"+a": 1,
				"+b": 3
			}
			//*/
		) ;
		
		doormen.equals(
			kungFig.reduce( tree , mods ) ,
			{
				a: 4,
				b: 8,
				c: 11,
				d: 7
			}
		) ;
		
		var tree = {
			a: 3,
			b: 5,
			c: 11,
			"<*": {
				"+a": 1,
				"+b": 3,
				c: 12,
				d: 7
			}
		} ;
		
		doormen.equals(
			kungFig.reduce( tree ) ,
			{
				a: 4,
				b: 8,
				c: 11,
				d: 7
			}
		) ;
	} ) ;
	
	it( "arrays should not be combined recursively" , function() {
		
		var o = { a: [ { b: 2, c: 3 }, { d: 5 } ] } ;
		var o2 = { a: [ { b: 52 } ] } ;
		
		doormen.equals(
			kungFig.reduce( {} , o , o2 ) ,
			{ a: [ { b: 52 } ] }
		) ;
	} ) ;
	
} ) ;



describe( "Operator extensions" , function() {
	
	it( "simple operator extension" , function() {
		
		var ext = kungFig.extendOperators( {
			pow: {
				priority: 100 ,
				stack: function( source , target , key , baseKey ) {
					//console.log( target[ key ] , source[ key ] ) ;
					if ( target[ key ] === undefined ) { target[ key ] = source[ key ] ; }
					else { target[ key ] *= source[ key ] ; }
				} ,
				reduce: function( target , key , baseKey ) {
					target[ baseKey ] = Math.pow( target[ baseKey ] , target[ key ] ) ;
					delete target[ key ] ;
				}
			}
		} ) ;
		
		var tree = {
			a: 3,
			b: 5,
			"+b": 2,
			"(pow)a": 2
		} ;
		
		//console.log( ext ) ;
		
		doormen.equals(
			ext.reduce( tree ) ,
			{ a: 9, b: 7 }
		) ;
		
		tree = {
			a: 3,
			b: 5,
			"(pow)a": 2
		} ;
		
		var mods = {
			"(pow)a": 3
		} ;
		
		//console.log( ext.stack( tree , mods ) ) ;
		
		doormen.equals(
			ext.stack( tree , mods ) ,
			{ a: 3, b: 5, "(pow)a": 6 }
		) ;
		
		//console.log( ext.reduce( tree , mods ) ) ;
		
		doormen.equals(
			ext.reduce( tree , mods ) ,
			{ a: 729, b: 5 }
		) ;
	} ) ;
} ) ;


	
