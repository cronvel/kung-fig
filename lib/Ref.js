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



var tree = require( 'tree-kit' ) ;



function Ref( ref_ , proxy ) { return Ref.create( ref_ , proxy ) ; }
module.exports = Ref ;

Ref.prototype.__prototypeUID__ = 'kung-fig/Ref' ;
Ref.prototype.__prototypeVersion__ = require( '../package.json' ).version ;
Ref.prototype.__isDynamic__ = true ;



Ref.create = function create( ref_ , proxy )
{
	if ( typeof ref_ !== 'string' ) { ref_ = null ; }
	
	var self = Object.create( Ref.prototype , {
		ref: { value: ref_ , writable: true , enumerable: true } ,
		proxy: { value: proxy }
	} ) ;
	
	return self ;
} ;



Ref.prototype.getValue = Ref.prototype.get = function get()
{
	if ( typeof this.ref !== 'string' ) { return ; }
	return tree.path.get( this.proxy.data , this.ref ) ;
} ;



Ref.prototype.getFinalValue = function getFinalValue( bound )
{
	var lastValue = this ,
		value = this.getValue() ,
		parentPath , indexOf ;
	
	while ( value && typeof value === 'object' && value.__isDynamic__ )
	{
		lastValue = value ;
		value = value.getValue() ;
	}
	
	if ( bound && typeof value === 'function' )
	{
		parentPath = lastValue.ref ;
		indexOf = Math.max( parentPath.lastIndexOf( '.' ) , parentPath.lastIndexOf( '[' ) ) ;
		
		if ( indexOf === -1 )
		{
			value = value.bind( this.proxy.data ) ;
		}
		else
		{
			parentPath = parentPath.slice( 0 , indexOf ) ;
			value = value.bind( tree.path.get( this.proxy.data , parentPath ) ) ;
		}
	}
	
	return value ;
} ;



Ref.prototype.set = function set( v )
{
	if ( typeof this.ref !== 'string' ) { return ; }
	tree.path.set( this.proxy.data , this.ref , v ) ;
} ;



Ref.prototype.setRef = function setRef( ref_ )
{
	this.ref = typeof ref_ === 'string' ? ref_ : null ;
} ;



Ref.prototype.toString = function toString()
{
	return '' + this.getFinalValue() ;
} ;

