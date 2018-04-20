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

"use strict" ;



function TagContainer( children , tag ) {
	Object.defineProperties( this , {
		tag: { value: tag instanceof Tag ? tag : null , writable: true } ,
		children: {
			value: Array.isArray( children ) ? children : [] , writable: true , enumerable: true
		}
	} ) ;
}



module.exports = TagContainer ;
TagContainer.prototype.__prototypeUID__ = 'kung-fig/TagContainer' ;
TagContainer.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



var Tag = require( './Tag.js' ) ;



TagContainer.prototype.get = function get( id ) {
	var i , iMax ;

	if ( ! id ) { return ; }

	for ( i = 0 , iMax = this.children.length ; i < iMax ; i ++ ) {
		if ( id === this.children[ i ].id ) { return this.children[ i ] ; }
	}
} ;



TagContainer.prototype.getTags = function getTags( tagName ) {
	if ( ! tagName || typeof tagName !== 'string' ) { return ; }

	return this.children.filter( e => e.name === tagName ) ;
} ;



TagContainer.prototype.getFirstTag = function getFirstTag( tagName ) {
	var i , iMax ;

	if ( ! tagName || typeof tagName !== 'string' ) { return ; }

	for ( i = 0 , iMax = this.children.length ; i < iMax ; i ++ ) {
		if ( tagName === this.children[ i ].name ) { return this.children[ i ] ; }
	}
} ;



// Same than getFirstTag(), but throw if multiple or no tag exist of this type
TagContainer.prototype.getUniqueTag = function getUniqueTag( tagName ) {
	if ( ! tagName || typeof tagName !== 'string' ) { return ; }

	var tags = this.children.filter( e => e.name === tagName ) ;

	if ( tags.length !== 1 ) {
		throw new Error( "Expecting exactly one '" + tagName + "', but found " + tags.length + "." ) ;
	}

	return tags[ 0 ] ;
} ;



TagContainer.prototype.appendTag = function appendTag( tag ) {
	if ( tag instanceof Tag ) {
		this.children.push( tag ) ;
	}
} ;



TagContainer.prototype.insertTag = function insertTag( tag , position = 0 ) {
	if ( tag instanceof Tag ) {
		this.children.splice( position , 0 , tag ) ;
	}
} ;


