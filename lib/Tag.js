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



function Tag( tag , attributes , content , shouldParse ) {
	Object.defineProperties( this , {
		name: { value: tag , enumerable: true } ,
		parent: { value: null , writable: true } ,
		content: {
			value: content , writable: true , enumerable: true
		} ,
		attributes: {
			value: shouldParse ? this.parseAttributes( attributes ) : attributes || null , writable: true , enumerable: true
		} ,
		line: { value: null , writable: true } ,
		file: { value: null , writable: true } ,
		masterFile: { value: null , writable: true } ,
		relPath: { value: null , writable: true } ,
		uid: { value: null , writable: true } ,
		location: {
			get: function() {
				var loc ;
				loc = 'line: ' + this.line ;
				if ( this.file ) { loc += ' -- file: ' + this.file ; }
				return loc ;
			}
		}
	} ) ;
}



module.exports = Tag ;
Tag.prototype.__prototypeUID__ = 'kung-fig/Tag' ;
Tag.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



const TagContainer = require( './TagContainer.js' ) ;
const Dynamic = require( 'kung-fig-dynamic' ) ;



Tag.prototype.stringifyAttributes = function stringifyAttributes() {
	return typeof this.attributes === 'string' ? this.attributes.trim() : '' ;
} ;



Tag.prototype.parseAttributes = function parseAttributes( attributes ) {
	return attributes && typeof attributes === 'string' ? attributes.trim() : null ;
} ;



Tag.prototype.getParentTag = function getParentTag() { return ( this.parent instanceof TagContainer ) && this.parent.tag ; } ;



Tag.prototype.getFinalContent = function getFinalContent( ctx , bound ) {
	return Dynamic.getFinalValue( this.content , ctx , bound ) ;
} ;



Tag.prototype.getRecursiveFinalContent = function getRecursiveFinalContent( ctx , bound ) {
	return Dynamic.getRecursiveFinalValue( this.content , ctx , bound , true ) ;
} ;



Tag.prototype.findAncestor = function fingAncestor( tagName ) {
	var tag = this ;

	while ( ( tag = tag.getParentTag() ) ) {
		if ( tag.name === tagName ) { return tag ; }
	}

	return null ;
} ;



Tag.prototype.setTagContainer = function setTagContainer( children ) {
	if ( this.content instanceof TagContainer ) { this.content.tag = null ; }
	this.content = new TagContainer( children , this ) ;
} ;



Tag.prototype.appendTag = function appendTag( tag ) {
	if ( ! ( tag instanceof Tag ) ) { return ; }

	if ( ! this.content ) {
		this.setTagContainer( [ tag ] ) ;
		return ;
	}

	if ( this.content instanceof TagContainer ) {
		this.content.appendTag( tag ) ;
	}
} ;



Tag.prototype.insertTag = function insertTag( tag , position = 0 ) {
	if ( ! ( tag instanceof Tag ) ) { return ; }

	if ( ! this.content ) {
		this.setTagContainer( [ tag ] ) ;
		return ;
	}

	if ( this.content instanceof TagContainer ) {
		this.content.insertTag( tag , position ) ;
	}
} ;


