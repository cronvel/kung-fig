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



function Tag( tag , attributes , content , proxy , shouldParse )
{
	Object.defineProperties( this , {
		name: { value: tag , enumerable: true } ,
		content: { value: content , writable: true , enumerable: true } ,
		proxy: { value: proxy , writable: true }
	} ) ;
	
	// attributes should be set lastly, because some attributes parser needs the proxy
	Object.defineProperties( this , {
		attributes: { value: shouldParse ? this.parseAttributes( attributes ) : attributes , writable: true , enumerable: true } ,
	} ) ;
}



module.exports = Tag ;
Tag.prototype.__prototypeUID__ = 'kung-fig/Tag' ;
Tag.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



Tag.prototype.setProxy = function setProxy( proxy )
{
	this.proxy = proxy ;
} ;



Tag.prototype.stringifyAttributes = function stringifyAttributes()
{
	return typeof this.attributes === 'string' ? this.attributes.trim() : '' ;
} ;



Tag.prototype.parseAttributes = function parseAttributes( attributes )
{
	return attributes && typeof attributes === 'string' ? attributes.trim() : null ;
} ;



Tag.prototype.getFinalContent = function getFinalContent()
{
	var value = this.content ;
	if ( value && typeof value === 'object' && value.__isDynamic__ ) { value = value.getFinalValue() ; }
	return value ;
} ;


