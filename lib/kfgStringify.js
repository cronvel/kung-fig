/*
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



function stringify( v , options )
{
	if ( v === undefined ) { return undefined ; }
	
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var runtime = {
		str: '' ,
		depth: 0 ,
		depthLimit: options.depthLimit || Infinity ,
		documentDepth: 0 ,
		documentDepthLimit: options.documentDepthLimit || 0 ,
		ancestors: [] ,	// useful?
		path: [] ,
		refs: new WeakMap()
	} ;
	
	stringifyAnyType( v , runtime , options.propertyMask ) ;
	
	return runtime.str ;
}



module.exports = stringify ;



function stringifyAnyType( v , runtime , propertyMask )
{
	if ( v === undefined || v === null )
	{
		runtime.str += "null" ;
		return ;
	}
	
	switch ( typeof v )
	{
		case 'boolean' :
			return stringifyBoolean( v , runtime ) ;
		case 'number' :
			return stringifyNumber( v , runtime ) ;
		case 'string' :
			return stringifyString( v , runtime ) ;
		case 'object' :
			return stringifyAnyObject( v , runtime , propertyMask ) ;
	}
}



function stringifyBoolean( v , runtime )
{
	runtime.str += ( v ? "true" : "false" ) ;
}



function stringifyNumber( v , runtime )
{
	runtime.str += v ;
}



var standardKeyRegex_ = /^[a-zA-Z][a-zA-Z0-9_-]*$/ ;

function stringifyKey( v , runtime )
{
	var i = 0 , l = v.length , c ;
	
	if ( v.match( standardKeyRegex_ ) )
	{
		runtime.str += v ;
		return ;
	}
	
	runtime.str += '"' + v.replace( stringifyStringRegex_ , stringifyStringRegexCallback ) + '"' ;
}



var unambiguousStringRegex_ = /^\S.*\S$/ ;

function stringifyString( v , runtime )
{
	var i = 0 , l = v.length , c ;
	
	if ( v.match( unambiguousStringRegex_ ) )
	{
		runtime.str += v ;
		return ;
	}
	
	runtime.str += '"' + v.replace( stringifyStringRegex_ , stringifyStringRegexCallback ) + '"' ;
}



function stringifyStringOld( v , runtime )
{
	var i = 0 , l = v.length , c ;
	
	// Faster on big string than stringifyStringLookup(), also big string are more likely to have at least one bad char
	if ( l >= 200 ) { return stringifyStringRegex( v , runtime ) ; }
	
	// Most string are left untouched, so it's worth checking first if something must be changed.
	// Gain 33% of perf on the whole stringify().
	for ( ; i < l ; i ++ )
	{
		c = v.charCodeAt( i ) ;
		
		if (
			c <= 0x1f ||	// control chars
			c === 0x5c ||	// backslash
			c === 0x22		// double quote
		)
		{
			if ( l > 100 ) { stringifyStringRegex( v , runtime ) ; }
			else { stringifyStringLookup( v , runtime ) ; }
			
			return ;
		}
	}
	
	runtime.str += '"' + v + '"' ;
}



var stringifyStringLookup_ = 
( function createStringifyStringLookup()
{
	var c = 0 , lookup = new Array( 0x80 ) ;
	
	for ( ; c < 0x80 ; c ++ )
	{
		if ( c === 0x09 )	// tab
		{
			lookup[ c ] = '\\t' ;
		}
		else if ( c === 0x0a )	// new line
		{
			lookup[ c ] = '\\n' ;
		}
		else if ( c === 0x0d )	// carriage return
		{
			lookup[ c ] = '\\r' ;
		}
		else if ( c <= 0x0f )	// control chars
		{
			lookup[ c ] = '\\u000' + c.toString( 16 ) ;
		}
		else if ( c <= 0x1f )	// control chars
		{
			lookup[ c ] = '\\u00' + c.toString( 16 ) ;
		}
		else if ( c === 0x5c )	// backslash
		{
			lookup[ c ] = '\\\\' ;
		}
		else if ( c === 0x22 )	// double-quote
		{
			lookup[ c ] = '\\"' ;
		}
		else
		{
			lookup[ c ] = String.fromCharCode( c ) ;
		}
	}
	
	return lookup ;
} )() ;



function stringifyStringLookup( v , runtime )
{
	var i = 0 , iMax = v.length , c ;
	
	runtime.str += '"' ;
	
	for ( ; i < iMax ; i ++ )
	{
		c = v.charCodeAt( i ) ;
		
		if ( c < 0x80 )
		{
			runtime.str += stringifyStringLookup_[ c ] ;
		}
		else
		{
			runtime.str += v[ i ] ;
		}
	}
	
	runtime.str += '"' ;
}



var stringifyStringRegex_ = /[\x00-\x1f"\\]/g ;

function stringifyStringRegex( v , runtime )
{
	runtime.str += '"' + v.replace( stringifyStringRegex_ , stringifyStringRegexCallback ) + '"' ;
}

function stringifyStringRegexCallback( match )
{
	return stringifyStringLookup_[ match.charCodeAt( 0 ) ] ;
}



function stringifyAnyObject( v , runtime , propertyMask )
{
	/*
	//noCircularRefNotation!
	var indexOf = runtime.ancestors.indexOf( v ) ;
	
	if ( indexOf !== -1 )
	{
		runtime.str += '{"@@ref@@":' + ( indexOf - runtime.ancestors.length ) + '}' ;
		return ;
	}
	
	//noUniqueRefNotation!
	var path = runtime.refs.get( v ) ;
	
	if ( path )
	{
		// /!\ Since we now for sure that 'path' is an array of string, maybe we can beat JSON.stringify()'s perf on that /!\
		runtime.str += '{"@@ref@@":' + JSON.stringify( path ) + '}' ;
		return ;
	}
	
	runtime.refs.set( v , runtime.path.slice() ) ;
	//*/
	
	if ( runtime.depth >= runtime.depthLimit )
	{
		runtime.str += 'null' ;
		return ;
	}
	
	/*
	//noToJSON!
	if ( typeof v.toJSON === 'function' )
	{
		stringifyAnyType( v.toJSON() , runtime , propertyMask ) ;
		return ;
	}
	//*/
	
	//runtime.ancestors.push( v ) ;	//noCircularRefNotation!
	
	if ( Array.isArray( v ) )
	{
		stringifyArray( v , runtime , propertyMask ) ;
	}
	else
	{
		stringifyStrictObject( v , runtime , propertyMask ) ;
	}
	
	//runtime.ancestors.pop() ;	//noCircularRefNotation!
}



function stringifyArray( v , runtime , propertyMask )
{
	var i , iMax = v.length ;
	
	if ( ! iMax )
	{
		runtime.str += '[]' ;
		return ;
	}
	
	runtime.depth ++ ;
	runtime.str += '[' ;
	
	var valueIndent = '\n' + '\t'.repeat( runtime.depth ) ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		runtime.str += ',' ;
		//runtime.path[ runtime.path.length - 1 ] = i ;	//noUniqueRefNotation!
		runtime.str += valueIndent ;
		
		stringifyAnyType( v[ i ] , runtime , propertyMask ) ;
	}
	
	//runtime.path.pop() ;	//noUniqueRefNotation!
	runtime.depth -- ;
	runtime.str += '\n' + '\t'.repeat( runtime.depth ) ;
	runtime.str += ']' ;
}



function stringifyStrictObject( v , runtime , propertyMask )
{
	var i , iMax , keys ;
	
	keys = Object.keys( v ) ;
	iMax = keys.length ;
	
	runtime.depth ++ ;
	
	if ( runtime.documentDepthLimit && v.$ )
	{
		if ( runtime.documentDepth >= runtime.documentDepthLimit )
		{
			runtime.str += 'null' ;
			return ;
		}
		
		runtime.documentDepth ++ ;
	}
	
	runtime.str += '{' ;
	
	var keyIndent = '\n' + '\t'.repeat( runtime.depth ) ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		if ( propertyMask && typeof propertyMask === 'object' && ! propertyMask[ keys[ i ] ] ) { continue ; }
		
		runtime.str += keyIndent ;
		stringifyKey( keys[ i ] , runtime ) ;
		runtime.str += ':' ;
		runtime.str += ' ' ;
		//runtime.path[ runtime.path.length - 1 ] = keys[ i ] ;	//noUniqueRefNotation!
		
		stringifyAnyType( 
			v[ keys[ i ] ]
			, runtime
			, propertyMask && typeof propertyMask === 'object' && propertyMask[ keys[ i ] ]
		) ;
	}
	
	//runtime.path.pop() ;	//noUniqueRefNotation!
	runtime.depth -- ;
	if ( runtime.documentDepthLimit && v.$ ) { runtime.documentDepth -- ; }
	runtime.str += '\n' + '\t'.repeat( runtime.depth ) ;
	runtime.str += '}' ;
}



