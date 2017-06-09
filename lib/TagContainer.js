/*
	Kung Fig
	
	Copyright (c) 2015 - 2017 Cédric Ronvel
	
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



var async = require( 'async-kit' ) ;



function TagContainer( children , tag )
{
	Object.defineProperties( this , {
		tag: { value: tag instanceof Tag ? tag : null , writable: true } ,
		children: { value: Array.isArray( children ) ? children : [] , writable: true , enumerable: true } ,
	} ) ;
}



module.exports = TagContainer ;
TagContainer.prototype.__prototypeUID__ = 'kung-fig/TagContainer' ;
TagContainer.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



var Tag = require( './Tag.js' ) ;



TagContainer.prototype.get = function get( id )
{
	var i , iMax ;
	
	if ( ! id ) { return ; }
	
	for ( i = 0 , iMax = this.children.length ; i < iMax ; i ++ )
	{
		if ( id === this.children[ i ].id ) { return this.children[ i ] ; }
	}
} ;



TagContainer.prototype.getTags = function getTags( tagName )
{
	if ( ! tagName || typeof tagName !== 'string' ) { return ; }
	
	return this.children.filter( e => e.name === tagName ) ;
} ;



TagContainer.prototype.getFirstTag = function getFirstTag( tagName )
{
	var i , iMax ;
	
	if ( ! tagName || typeof tagName !== 'string' ) { return ; }
	
	for ( i = 0 , iMax = this.children.length ; i < iMax ; i ++ )
	{
		if ( tagName === this.children[ i ].name ) { return this.children[ i ] ; }
	}
} ;



// Same than getFirstTag(), but throw if multiple or no tag exist of this type
TagContainer.prototype.getUniqueTag = function getUniqueTag( tagName )
{
	if ( ! tagName || typeof tagName !== 'string' ) { return ; }
	
	var tags = this.children.filter( e => e.name === tagName ) ;
	
	if ( tags.length !== 1 )
	{
		throw new Error( "Expecting exactly one '" + tagName + "', but found " + tags.length + "." ) ;
	}
	
	return tags[ 0 ] ;
} ;



// Call a method on each children tag, if that method exists
TagContainer.prototype.callEach = function callEach( fnName )
{
	return this.applyEach( fnName , Array.prototype.slice.call( arguments , 1 ) ) ;
} ;



// Same than callEach, with the apply() syntax
TagContainer.prototype.applyEach = function applyEach( fnName , args )
{
	var i , iMax ;
	
	if ( ! fnName ) { return ; }
	
	for ( i = 0 , iMax = this.children.length ; i < iMax ; i ++ )
	{
		if ( typeof this.children[ i ][ fnName ] === 'function' )
		{
			this.children[ i ][ fnName ].apply( this.children[ i ] , args ) ;
		}
	}
} ;



// Call a method on each children tag, if that method exists
TagContainer.prototype.asyncCallEach = function asyncCallEach( fnName )
{
	var callback = arguments[ arguments.length - 1 ] ;
	
	if ( typeof callback !== 'function' )
	{
		throw new Error( "TagContainer#asyncCallEach() last argument should be a callback function" ) ;
	}
	
	return this.asyncApplyEach( fnName , Array.prototype.slice.call( arguments , 1 , - 1 ) , callback ) ;
} ;



// Same than callEach, with the apply() syntax
TagContainer.prototype.asyncApplyEach = function asyncApplyEach( fnName , args , callback )
{
	var jobs ;
	
	if ( typeof callback !== 'function' )
	{
		throw new Error( "TagContainer#asyncApplyEach() last argument should be a callback function" ) ;
	}
	
	if ( ! fnName ) { callback() ; return ; }
	
	jobs = this.children.filter( e => typeof e[ fnName ] === 'function' )
		.map( e => e[ fnName ].bind( e ) ) ;
	
	async.do( jobs )
	.using( args )
	.exec( callback ) ;
} ;

