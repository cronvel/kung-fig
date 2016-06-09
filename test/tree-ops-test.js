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
var doormen = require( 'doormen' ) ;



describe( "Operator behaviours" , function() {
	
	it( "simple stack and reduce on a single object" , function() {
		
		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"+defense": 3
		} ;
		
		doormen.equals(
			kungFig.stack( creature ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 3 ,
				move: 1 ,
				"+defense": 3
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( creature ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 6 ,
				move: 1
			}
		) ;
	} ) ;
	
	it( "simple stack and reduce on two and three objects" , function() {
		
		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"+defense": 3
		} ;
		
		var amulet = {
			"+defense": 1 ,
			"+hp": 1
		} ;
		
		var ring = {
			"+defense": 1 ,
			"#+hp": [1,1]
		} ;
		
		doormen.equals(
			kungFig.stack( creature , amulet ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 3 ,
				move: 1 ,
				"#+defense": [3,1] ,
				"+hp": 1
			}
		) ;
		
		doormen.equals(
			kungFig.stack( creature , amulet , ring ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 3 ,
				move: 1 ,
				"#+defense": [3,1,1] ,
				"#+hp": [1,1,1]
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( {} , creature , amulet ) ,
			{
				hp: 9 ,
				attack: 5 ,
				defense: 7 ,
				move: 1
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( {} , creature , amulet , ring ) ,
			{
				hp: 11 ,
				attack: 5 ,
				defense: 8 ,
				move: 1
			}
		) ;
	} ) ;
	
	it( "check stack behaviour bug, when a 'foreach' and 'non-foreach' key are mixed" , function() {
		
		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"+defense": 3
		} ;
		
		var warrior = {
			hp: 10 ,
			"#+defense": [2] ,
			evasion: 7
		} ;
		
		doormen.equals(
			kungFig.stack( creature , warrior ) ,
			{
				attack: 5,
				defense: 3,
				move: 1,
				'#hp': [ 8, 10 ],
				'#+defense': [ 3, 2 ],
				evasion: 7
			}
		) ;
		
		doormen.equals(
			kungFig.stack( warrior , creature ) ,
			{
				attack: 5,
				defense: 3,
				move: 1,
				'#hp': [ 10 , 8 ],
				'#+defense': [ 2, 3 ],
				evasion: 7
			}
		) ;
	} ) ;
	
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
		
		var helmet = {
			"+defense": 1 ,
		} ;
		
		doormen.equals(
			kungFig.stack( creature , shield , enchantedArmor ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 3 ,
				move: 1 ,
				"#+defense": [3,1] ,
				"*defense": 2 ,
				"+magic": 1
			}
		) ;
		
		doormen.equals(
			kungFig.stack( creature , shield , enchantedArmor , helmet ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 3 ,
				move: 1 ,
				"#+defense": [3,1,1] ,
				"*defense": 2 ,
				"+magic": 1
			}
		) ;
		
		doormen.equals(
			kungFig.reduce( creature , shield , enchantedArmor , helmet ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 11 ,
				move: 1 ,
				"+magic": 1
			}
		) ;
	} ) ;
	
	/*
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
	*/
	
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
		
		//console.log( "\n---------\n" ) ;
		
		tree = {
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
		
		tree = {
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
	it( "arrays should not be combined recursively" , function() {
		
		var o = { a: [ { b: 2, c: 3 }, { d: 5 } ] } ;
		var o2 = { a: [ { b: 52 } ] } ;
		
		doormen.equals(
			kungFig.reduce( {} , o , o2 ) ,
			{ a: [ { b: 52 } ] }
		) ;
	} ) ;
	
} ) ;



describe( "Complex, deeper test" , function() {
	
	it( "simple foreach" , function() {
		
		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"#+defense": [3,4,5]
		} ;
		
		doormen.equals(
			kungFig.reduce( creature ) ,
			{
				hp: 8 ,
				attack: 5 ,
				defense: 15 ,
				move: 1
			}
		) ;
	} ) ;
	
	it( "combining foreach on nested objects" , function() {
		
		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			attacks: {
				kick: {
					toHit: 10,
					damage: 15,
					elements: {
						impact: true
					}
				}
			} ,
			"#*>": [
				{
					hp: 10,
					evasion: 5,
					attacks: {
						kick: {
							toHit: 8,
							elements: {
								lightning: true,
								wind: true
							}
						}
					}
				} ,
				{
					hp: 9,
					attacks: {
						kick: {
							elements: {
								fire: true,
								wind: false
							}
						}
					}
				}
			]
		} ;
		
		doormen.equals(
			kungFig.reduce( creature ) ,
			{
				hp: 9 ,
				attack: 5 ,
				defense: 3 ,
				move: 1 ,
				evasion: 5 ,
				attacks: {
					kick: {
						toHit: 8,
						damage: 15,
						elements: {
							impact: true,
							lightning: true,
							fire: true,
							wind: false
						}
					}
				} ,
			}
		) ;
	} ) ;
} ) ;



describe( "Operator extensions" , function() {
	
	it( "simple operator extension" , function() {
		
		var ext = kungFig.extendOperators( {
			pow: {
				priority: 100 ,
				reduce: function( existing , operands ) {
					var i , iMax = operands.length , operand = 1 ;
					
					for ( i = 0 ; i < iMax ; i ++ )
					{
						if ( ! isNaN( operands[ i ] ) )
						{
							operand *= + operands[ i ] ;
						}
					}
					
					if ( ! isNaN( existing ) )
					{
						existing = Math.pow( + existing , operand ) ;
						operands.length = 0 ;
						return existing ;
					}
					else
					{
						operands[ 0 ] = operand ;
						operands.length = 1 ;
						return existing ;
					}
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
			{ a: 3, b: 5, "(#pow)a": [2,3] }
		) ;
		
		//console.log( ext.reduce( tree , mods ) ) ;
		
		doormen.equals(
			ext.reduce( tree , mods ) ,
			{ a: 729, b: 5 }
		) ;
	} ) ;
} ) ;



