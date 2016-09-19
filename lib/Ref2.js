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
var Dynamic = require( './Dynamic.js' ) ;



function Ref( ref_ ) { return Ref.create( ref_ ) ; }
Ref.prototype = Object.create( Dynamic.prototype ) ;
Ref.prototype.constructor = Ref ;

module.exports = Ref ;

Ref.prototype.__prototypeUID__ = 'kung-fig/Ref' ;
Ref.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



// Circular reference trouble, should require after the module.exports assignement
var kfgParse = require( './kfgParse.js' ) ;



Ref.create = function create( ref_ )
{
	var self = Object.create( Ref.prototype , {
		refParts: { value: ref_ , writable: true , enumerable: true }
	} ) ;
	
	return self ;
} ;



Ref.prototype.setRef = function setRef( ref_ )
{
	this.ref = typeof ref_ === 'string' ? ref_ : null ;
} ;



Ref.prototype.apply = function apply( ctx )
{
	if ( ! this.__isApplicable__ ) { return this ; }
	if ( typeof this.ref !== 'string' ) { return ; }
	return tree.path.get( ctx , this.ref ) ;
} ;



Ref.prototype.getFinalValue = function getFinalValue( ctx , shouldBeBound )
{
	var lastValue = this ,
		value = this.getValue( ctx ) ,
		parentPath , indexOf ;
	
	while ( value && typeof value === 'object' && value.__isDynamic__ )
	{
		lastValue = value ;
		value = value.getValue( ctx ) ;
	}
	
	if ( shouldBeBound && typeof value === 'function' )
	{
		parentPath = lastValue.ref ;
		indexOf = Math.max( parentPath.lastIndexOf( '.' ) , parentPath.lastIndexOf( '[' ) ) ;
		
		if ( indexOf === -1 )
		{
			value = value.bind( ctx ) ;
		}
		else
		{
			parentPath = parentPath.slice( 0 , indexOf ) ;
			value = value.bind( tree.path.get( ctx , parentPath ) ) ;
		}
	}
	
	return value ;
} ;



Ref.prototype.getValue = Ref.prototype.get = function get( ctx )
{
	if ( ! this.__isDynamic__ ) { return this ; }
	
	var part ,
		value = ctx ,
		i = 0 ,
		iMax = this.refParts.length ;
		//iMax = stopAtParent ? this.refParts.length - 1 : this.refParts.length ;
	
	for ( ; i < iMax ; i ++ )
	{
		part = this.refParts[ i ] ;
		
		if ( ! value || typeof value !== 'object' ) { return undefined ; }
		
		if ( part && typeof part === 'object' && part.__prototypeUID__ === 'kung-fig/Ref' )
		{
			part = part.get( ctx ) ;
		}
		
		value = value[ part ] ;
	}
	
	return value ;
} ;



Ref.prototype.set = function set( ctx , v )
{
	if ( ! this.__isDynamic__ || ! this.refParts.length || ! ctx || typeof ctx !== 'object' )
	{
		return ;
	}
	
	var part , lastPart , lastBase ,
		base = ctx ,
		i = 0 ,
		iMax = this.refParts.length - 1 ,
		key = this.refParts[ this.refParts.length - 1 ] ;
	
	if ( key && typeof key === 'object' && key.__prototypeUID__ === 'kung-fig/Ref' )
	{
		key = key.get( ctx ) ;
	}
	
	for ( ; i < iMax ; i ++ )
	{
		part = this.refParts[ i ] ;
		
		if ( part && typeof part === 'object' && part.__prototypeUID__ === 'kung-fig/Ref' )
		{
			part = part.get( ctx ) ;
		}
		
		if ( ! base || typeof base !== 'object' )
		{
			// Auto-create
			if ( typeof part === 'number' ) { base = lastBase[ lastPart ] = [] ; }
			else { base = lastBase[ lastPart ] = {} ; }
		}
		
		lastBase = base ;
		lastPart = part ;
		base = base[ part ] ;
	}
	
	if ( ! base || typeof base !== 'object' )
	{
		// Auto-create
		if ( typeof key === 'number' ) { base = lastBase[ part ] = [] ; }
		else { base = lastBase[ part ] = {} ; }
	}
	
	base[ key ] = v ;
} ;



			/* Parser */



Ref.parseFromKfg = function parseFromKfg( str , runtime )
{
	return Ref.create( parseRefParts( str , runtime ) ) ;
} ;



Ref.parse = function parse( str )
{
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length ,
		depth: 0
	} ;
	
	return Ref.create( parseRefParts( str , runtime ) ) ;
} ;



function parseRefParts( str , runtime )
{
	var parts = [] ;
	
	if ( str[ runtime.i ] !== '$' ) { throw new TypeError( "This is not a Ref, it should start with a '$' sign" ) ; }
	runtime.i ++ ;
	
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] !== ' ' )
	{
		//if ( str[ runtime.i ] === ']' || str[ runtime.i ] === ' ' ) { runtime.i ++ ; break ; }
		if ( str[ runtime.i ] === '[' )
		{
			runtime.i ++ ;
			parts.push( parseBracketedPart( str , runtime ) ) ;
		}
		else if ( str[ runtime.i ] === ']' )
		{
			runtime.i ++ ;
			return parts ;
		}
		else
		{
			parts.push( parsePart( str , runtime ) ) ;
		}
	}
	
	//console.log( ">>> parts: " , parts ) ;
	
	return parts ;
}



function parsePart( str , runtime )
{
	var c , j = runtime.i , l = runtime.iEndOfLine , v = '' ;
	
	for ( ; j < l ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		
		// This construct is intended: this is much faster (15%)
		if ( c === 0x2e || c === 0x5b || c === 0x5d || c === 0x20 || c <= 0x1f )
		{
			if ( c === 0x2e )		// dot .
			{
				v = str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				return v ;
			}
			else if ( c === 0x5b )		// open bracket [
			{
				v = str.slice( runtime.i , j ) ;
				runtime.i = j ;	// do not eat the bracket
				return v ;
			}
			else if ( c === 0x5d )		// close bracket ]
			{
				v = str.slice( runtime.i , j ) ;
				runtime.i = j ;	// do not eat the bracket
				return v ;
			}
			else if ( c === 0x20 )		// space
			{
				v = str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				return v ;
			}
			else if ( c <= 0x1f )		// illegal
			{
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + runtime.lineNumber + ")" ) ;
			}
		}
	}
	
	v = str.slice( runtime.i , j ) ;
	runtime.i = j + 1 ;
	return v ;
}



function parseBracketedPart( str , runtime )
{
	var c , j = runtime.i , l = runtime.iEndOfLine , v ;
	
	c = str.charCodeAt( runtime.i ) ;
	
	if ( c >= 0x30 && c <= 0x39 )   // digit
    {
    	v = parseIndex( str , runtime ) ;
    }
    else
    {
		switch ( c )
		{
			case 0x22 :		// " double-quote: this is a string index
				runtime.i ++ ;
				v = kfgParse.parseQuotedString( str , runtime ) ;
				break ;
			case 0x24 :		// $ dollar: this is sub-reference
				v = Ref.create( parseRefParts( str , runtime ) ) ;
				break ;
		}
	}
	
	for ( ; j < l ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		
		if ( c === 0x5d )	// close bracket ]
		{
			runtime.i = j + 1 ;
			if ( str[ runtime.i ] === '.' ) { runtime.i ++ ; }
			return v ;
		}
	}
	
	throw new SyntaxError( 'Ref parse error: missing closing bracket' ) ;
}



function parseIndex( str , runtime )
{
	var c , j = runtime.i , l = runtime.iEndOfLine ;
	
	for ( ; j < l ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		if ( c < 0x30 && c > 0x39 ) { break ; }
	}
	
	return parseInt( str.slice( runtime.i , j ) , 10 ) ;
}

