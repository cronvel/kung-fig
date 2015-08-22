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
	
	it( "the combining operator *> " , function() {
		
		var tree = {
			subtree: {
				a: 3,
				b: 5
			}
		} ;
		
		var mods = {
			"*>subtree": {
				"+a": 1,
				"+b": 3
			}
		} ;
		
		doormen.equals(
			kungFig.stack( tree , mods ) ,
			{
				subtree: {
					a: 3,
					b: 5,
					"+a": 1,
					"+b": 3
				}
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( tree , mods ) ,
			{
				subtree: {
					a: 4,
					b: 8
				}
			}
		) ;
	} ) ;
	
} ) ;

