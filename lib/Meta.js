/*
	Kung Fig

	Copyright (c) 2015 - 2019 Cédric Ronvel

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



const TagContainer = require( './TagContainer.js' ) ;
const Reference = require( './Reference.js' ) ;



function Meta( options ) {
	this.tags = null ;
	this.prependedReferences = [] ;
	this.appendedReferences = [] ;

	if ( options && options.tags ) {
		if ( options.tags instanceof TagContainer ) { this.tags = options.tags ; }
		else if ( Array.isArray( options.tags ) ) { this.tags = new TagContainer( options.tags ) ; }
		else { this.tags = new TagContainer() ; }
	}
	else {
		this.tags = new TagContainer() ;
	}
}

module.exports = Meta ;



Meta.prototype.appendReference = function( ... args ) {
	var reference = new Reference( ... args ) ;
	this.appendedReferences.push( reference ) ;
	console.log( ".appendedReferences:" , this.appendedReferences ) ;
	return reference ;
} ;



Meta.prototype.prependReference = function( ... args ) {
	var reference = new Reference( ... args ) ;
	this.prependedReferences.push( reference ) ;
	console.log( ".prependedReferences:" , this.prependedReferences ) ;
	return reference ;
} ;

