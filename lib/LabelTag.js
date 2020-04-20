/*
	Kung Fig

	Copyright (c) 2015 - 2020 Cédric Ronvel

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



const Tag = require( './Tag.js' ) ;
const common = require( 'kung-fig-common' ) ;
const kfgStringify = require( './kfgStringify.js' ) ;



function LabelTag( tag , attributes , content , shouldParse ) {
	var self = ( this instanceof LabelTag ) ? this : Object.create( LabelTag.prototype ) ;
	Tag.call( self , tag , attributes , content , shouldParse ) ;
	return self ;
}

module.exports = LabelTag ;

LabelTag.prototype = Object.create( Tag.prototype ) ;
LabelTag.prototype.constructor = LabelTag ;
LabelTag.prototype.__prototypeUID__ = 'kung-fig/LabelTag' ;
LabelTag.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



LabelTag.prototype.stringifyAttributes = function stringifyAttributes() {
	return LabelTag.stringifyAttributes( this.attributes ) ;
} ;



LabelTag.prototype.parseAttributes = function parseAttributes( attributes ) {
	return LabelTag.parseAttributes( attributes ) ;
} ;



var stringNeedsQuotesRegex_ = /^\s|[\x00-\x1f\x7f\\"[\]]|\s$/ ;

LabelTag.stringifyAttributes = function stringifyAttributes( attributes ) {
	if ( ! attributes || typeof attributes !== 'string' ) {
		return '' ;
	}

	if ( stringNeedsQuotesRegex_.test( attributes ) ) {
		return kfgStringify.stringifyQuotedString( attributes ) ;
	}

	return attributes ;
} ;



LabelTag.parseAttributes = function parseAttributes( str ) {
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length
	} ;

	var c = str.charCodeAt( runtime.i ) ;

	if ( c === 0x22 ) {
		// " double-quote: this is a quoted string
		runtime.i ++ ;
		return common.parsers.parseQuotedString( str , runtime ) ;
	}

	return str ;

} ;


