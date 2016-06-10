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

"use strict" ;



var Tag = require( './Tag.js' ) ;
var classicAttributes = require( './classicAttributes.js' ) ;



function ClassicTag( attributes , content )
{
	var self = ( this instanceof ClassicTag ) ? this : Object.create( ClassicTag.prototype ) ;
	Tag.call( self , 'ClassicTag' , attributes , content ) ;
	return self ;
}

module.exports = ClassicTag ;

ClassicTag.prototype = Object.create( Tag.prototype ) ;
ClassicTag.prototype.constructor = ClassicTag ;
ClassicTag.prototype.__prototypeUID__ = 'kung-fig/ClassicTag' ;
ClassicTag.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



ClassicTag.prototype.stringifyAttributes = function stringifyAttributes()
{
	return classicAttributes.stringify( this.attributes ) ;
} ;



ClassicTag.prototype.parseAttributes = function parseAttributes( attributes )
{
	return attributes && typeof attributes === 'object' && ! Array.isArray( attributes ) ?
		attributes :
		classicAttributes.parse( attributes ) ;
} ;


