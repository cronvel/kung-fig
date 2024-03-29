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

"use strict" ;



function OrderedObject( object , keys ) {
	if ( object && typeof object === 'object' ) {
		if ( ! Array.isArray( keys ) ) { keys = Object.keys( object ) ; }

		Object.defineProperties( this , {
			_keys: { value: keys }
		} ) ;

		for ( let i = 0 ; i < keys.length ; i ++ ) {
			this._addKeyValue( keys[ i ] , object[ keys[ i ] ] ) ;
		}
	}
	else {
		Object.defineProperties( this , {
			_keys: { value: [] }
		} ) ;
	}
}

OrderedObject.prototype = Object.create( Array.prototype ) ;
OrderedObject.prototype.constructor = OrderedObject ;

module.exports = OrderedObject ;

OrderedObject.prototype.__prototypeUID__ = 'kung-fig/OrderedObject' ;
OrderedObject.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



OrderedObject.prototype._addKeyValue = function( key , value ) {
	Object.defineProperty( this , key , {
		value: value ,
		enumerable: true ,
		configurable: true
	} ) ;

	if ( value && typeof value === 'object' ) {
		Object.defineProperties( value , {
			_key: { value: key } ,
			_index: {
				enumerable: true ,
				get: () => this._keys.indexOf( key )
			}
		} ) ;
	}
} ;



OrderedObject.prototype.push = function( key , value ) {
	if ( ! this[ key ] ) {
		this._keys.push( key ) ;
	}

	this._addKeyValue( key , value ) ;
} ;



OrderedObject.prototype.unshift =
OrderedObject.prototype.insert = function( key , value ) {
	if ( ! this[ key ] ) {
		this._keys.unshift( key ) ;
	}

	this._addKeyValue( key , value ) ;
} ;



OrderedObject.prototype.pop = function() {
	var key = this._keys.pop() ;

	if ( ! key ) { return ; }

	var value = this[ key ] ;
	delete this[ key ] ;

	return { key , value } ;
} ;



OrderedObject.prototype.shift = function() {
	var key = this._keys.shift() ;

	if ( ! key ) { return ; }

	var value = this[ key ] ;
	delete this[ key ] ;

	return { key , value } ;
} ;



OrderedObject.prototype[Symbol.iterator] = function* () {
	for ( let i = 0 ; i < this._keys.length ; i ++ ) {
		yield this[ this._keys[ i ] ] ;
	}
} ;



OrderedObject.prototype.entries = function* () {
	var i , key ;

	for ( i = 0 ; i < this._keys.length ; i ++ ) {
		key = this._keys[ i ] ;
		yield [ key , this[ key ] ] ;
	}
} ;



OrderedObject.prototype.toJSON = function() {
	var object = {
		//_keys: this._keys ,
		// if undefined, it will be cuted off the stringified string anyway:
		_index: this._index
	} ;

	// Needed because we want to ensure all the properties come
	// in the correct order in the JSON string
	for ( let i = 0 ; i < this._keys.length ; i ++ ) {
		object[ this._keys[ i ] ] = this[ this._keys[ i ] ] ;
	}

	return object ;
} ;

