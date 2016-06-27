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
var kfgParse = require( './kfgParse.js' ) ;
var kfgStringify = require( './kfgStringify.js' ) ;



function VarTag( tag , attributes , content , proxy , shouldParse )
{
	var self = ( this instanceof VarTag ) ? this : Object.create( VarTag.prototype ) ;
	Tag.call( self , tag , attributes , content , proxy , shouldParse ) ;
	return self ;
}

module.exports = VarTag ;

VarTag.prototype = Object.create( Tag.prototype ) ;
VarTag.prototype.constructor = VarTag ;
VarTag.prototype.__prototypeUID__ = 'kung-fig/VarTag' ;
VarTag.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



VarTag.prototype.stringifyAttributes = function stringifyAttributes()
{
	return VarTag.stringifyAttributes( this.attributes ) ;
} ;



VarTag.prototype.parseAttributes = function parseAttributes( attributes )
{
	return VarTag.parseAttributes( attributes ) ;
} ;



VarTag.stringifyAttributes = function stringifyAttributes( attributes )
{
	return '$' + attributes ;
} ;



VarTag.parseAttributes = function parseAttributes( str )
{
	var matches ;
	
	if ( ! ( matches = str.match( /^\$([a-zA-Z0-9_.\[\]-]*)$/ ) ) )
	{
		throw new SyntaxError( "This is not a var syntax." ) ;
	}
	
	return matches[ 1 ] ;
} ;

