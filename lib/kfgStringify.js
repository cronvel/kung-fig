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



var treeOps = require( './treeOps.js' ) ;

//var kfgCommon = require( './kfgCommon.js' ) ;
var Tag = require( './Tag.js' ) ;
var TagContainer = require( './TagContainer.js' ) ;



function stringify( v , options )
{
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var runtime = {
		str: '' ,
		compactList: false ,
		include: '' ,
		depth: 0 ,
		depthLimit: options.depthLimit || Infinity ,
		documentDepth: 0 ,
		documentDepthLimit: options.documentDepthLimit || 0 ,
		ancestors: [] ,	// useful?
		path: [] ,
		classes: options.classes instanceof Map ? options.classes : null
		//refs: new WeakMap()
	} ;
	
	stringifyAnyType( v , runtime , options.propertyMask ) ;
	
	// Always add an extra '\n' at the end
	runtime.str += '\n' ;
	
	return runtime.str ;
}



module.exports = stringify ;



function stringifyAnyType( v , runtime , propertyMask )
{
	// Should be detected upstream, because there are many edge case, like array element
	//if ( v === undefined ) { return ; }
	
	if ( v === null || v === undefined )
	{
		if ( runtime.depth ) { runtime.str += ' ' ; }
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
	
	runtime.include = '' ;
}



function stringifyBoolean( v , runtime )
{
	if ( runtime.depth ) { runtime.str += ' ' ; }
	runtime.str += ( v ? "true" : "false" ) ;
}



function stringifyNumber( v , runtime )
{
	if ( runtime.depth ) { runtime.str += ' ' ; }
	runtime.str += v ;
}



var constants = {
	"null": true ,
	"true": true ,
	"false": true ,
	"on": true ,
	"off": true ,
	"yes": true ,
	"no": true ,
	"NaN": true ,
	"Infinity": true ,
	"-Infinity": true ,
//	"...": true ,
} ;



var keyNeedsQuotesRegex_ = /^[\s"#<>(@-]|[\x00-\x1f:"]|[\s"]$/ ;



function stringifyKey( v , runtime )
{
	if ( keyNeedsQuotesRegex_.test( v ) )
	{
		runtime.str += '"' + v.replace( stringReplaceRegex_ , stringReplaceCallback ) + '"' ;
	}
	else
	{
		runtime.str += v ;
	}
}



var numberRegex_ =  /^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$/ ;
var stringNeedsQuotesRegex_ = /^[\s"<>(@]|[\x00-\x1f"\\]|[\s"]$/ ;
var topLevelStringNeedsQuotesRegex_ = /^[\s"\[<>(@]|[\x00-\x1f"\\:]|[\s"]$/ ;
var stringReplaceRegex_ = /[\x00-\x1f"\\]/g ;

var stringLinesNeedsQuotesRegex_ = /[\x00-\x09\x0b\x1f]/ ;


function stringifyStringMaybeQuotes( v , runtime )
{
	if ( runtime.depth ) { runtime.str += ' ' ; }
	
	if ( runtime.include )
	{
		runtime.str += runtime.include ;
		
		if ( stringNeedsQuotesRegex_.test( v ) )
		{
			runtime.str += '"' + v.replace( stringReplaceRegex_ , stringReplaceCallback ) + '"' ;
		}
		else
		{
			runtime.str += v ;
		}
		
		return ;
	}
	
	if ( constants[ v ] || numberRegex_.test( v ) )
	{
		runtime.str += '"' + v + '"' ;
	}
	else if ( ( runtime.depth ? stringNeedsQuotesRegex_ : topLevelStringNeedsQuotesRegex_ ).test( v ) )
	{
		runtime.str += stringifyQuotedString( v ) ;
	}
	else
	{
		runtime.str += v ;
	}
}



function stringifyStringMaybeStringLine( v , runtime )
{
	if ( runtime.depth ) { runtime.str += ' ' ; }
	
	if ( runtime.include )
	{
		runtime.str += runtime.include ;
		
		if ( stringNeedsQuotesRegex_.test( v ) )
		{
			runtime.str += '"' + v.replace( stringReplaceRegex_ , stringReplaceCallback ) + '"' ;
		}
		else
		{
			runtime.str += v ;
		}
		
		return ;
	}
	
	if ( constants[ v ] || numberRegex_.test( v ) )
	{
		runtime.str += '> ' + v ;
	}
	else if ( stringLinesNeedsQuotesRegex_.test( v ) )
	{
		runtime.str += stringifyQuotedString( v ) ;
	}
	else if ( ( runtime.depth ? stringNeedsQuotesRegex_ : topLevelStringNeedsQuotesRegex_ ).test( v ) )
	{
// ---------------------------------------------------------- WIP here -------------------------------------------
		runtime.str += stringifyStringLine( v ) ;
	}
	else
	{
		runtime.str += v ;
	}
}



var stringifyString = stringifyStringMaybeQuotes ;



function stringifyQuotedString( v )
{
	return '"' + v.replace( stringReplaceRegex_ , stringReplaceCallback ) + '"' ;
}

module.exports.stringifyQuotedString = stringifyQuotedString ;



function stringifyStringLine( v )
{
// ---------------------------------------------------------- WIP here -------------------------------------------
	// needs indents...
	return '> ' + v.replace( /\n/g , '\n> ' ) ;
}



function stringReplaceCallback( match )
{
	return stringifyStringLookup_[ match.charCodeAt( 0 ) ] ;
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



function stringifyAnyObject( v , runtime , propertyMask )
{
	var stringifier , proto ;
	
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
		// /!\ Not in the spec ATM...
		runtime.str += ' <depthLimit>' ;
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
	else if ( v instanceof TagContainer )
	{
		stringifyTagContainer( v , runtime , propertyMask ) ;
	}
	else if (
		( stringifier = builtinStringifier.get( ( proto = Object.getPrototypeOf( v ) ) ) ) ||
		( runtime.classes && ( stringifier = runtime.classes.get( proto ) ) )
	)
	{
		runtime.str += ( runtime.depth ? ' ' : '' ) + '<' + stringifier.name + '>' ;
		v = stringifier( v ) ;
		if ( v !== undefined ) { stringifyAnyType( v , runtime , propertyMask ) ; }
	}
	else
	{
		stringifyStrictObject( v , runtime , propertyMask ) ;
	}
	
	//runtime.ancestors.pop() ;	//noCircularRefNotation!
}



function stringifyArray( v , runtime , propertyMask )
{
	var itemIndent ,
		i = 0 ,
		iMax = v.length ;
	
	if ( ! iMax )
	{
		runtime.str += runtime.depth ? ' <Array>' : '<Array>' ;
		return ;
	}
	
	itemIndent = '\n' + '\t'.repeat( runtime.depth ) ;
	
	runtime.depth ++ ;
	
	if ( runtime.compactList )
	{
		//runtime.path[ runtime.path.length - 1 ] = i ;	//noUniqueRefNotation!
		//runtime.path[ runtime.path.length - 1 ] = i ;	//noUniqueRefNotation!
		runtime.str += '\t-' ;
		runtime.compactList = true ;
		stringifyAnyType( v[ i ] , runtime , propertyMask ) ;
		
		i = 1 ;
	}
	else if ( runtime.depth <= 1 )
	{
		// avoid the first '\n' of a file
		//runtime.path[ runtime.path.length - 1 ] = i ;	//noUniqueRefNotation!
		runtime.str += '-' ;
		runtime.compactList = true ;
		stringifyAnyType( v[ i ] , runtime , propertyMask ) ;
		
		i = 1 ;
	}
	
	for ( ; i < iMax ; i ++ )
	{
		//runtime.path[ runtime.path.length - 1 ] = i ;	//noUniqueRefNotation!
		runtime.str += itemIndent + '-' ;
		runtime.compactList = true ;
		stringifyAnyType( v[ i ] , runtime , propertyMask ) ;
	}
	
	//runtime.path.pop() ;	//noUniqueRefNotation!
	runtime.depth -- ;
}



var builtinStringifier = new Map() ;

// The name of the function determine the name inside the '<>' markup
builtinStringifier.set( Buffer.prototype , function bin16( v ) { return v.toString( 'hex' ) ; } ) ;
builtinStringifier.set( Date.prototype , function date( v ) { return v.toString() ; } ) ;
builtinStringifier.set( RegExp.prototype , function regex( v ) { return v.toString() ; } ) ;



function stringifyStrictObject( v , runtime , propertyMask )
{
	var i , iMax , keys , splitted , first = true ;
	
	keys = Object.keys( v ) ;
	iMax = keys.length ;
	
	if ( keys.length === 1 && ( keys[ 0 ] === '@' || keys[ 0 ] === '@@' ) )
	{
		runtime.str += ( runtime.depth ? ' ' : '' ) + keys[ 0 ]  ;
		stringifyKey( v[ keys[ 0 ] ] , runtime ) ;
		return ;
	}
	
	if ( runtime.documentDepthLimit && v.$ )
	{
		if ( runtime.documentDepth >= runtime.documentDepthLimit )
		{
			runtime.str += ' <depthLimit>' ;
			return ;
		}
		
		runtime.documentDepth ++ ;
	}
	
	var keyIndent = '\n' + '\t'.repeat( runtime.depth ) ;
	
	runtime.depth ++ ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		if (
			// undefined === no keys
			v[ keys[ i ] ] === undefined ||
			// skip keys not in the propertyMask, if any
			( propertyMask && typeof propertyMask === 'object' && ! propertyMask[ keys[ i ] ] )
		)
		{
			continue ;
		}
		
		if ( first )
		{
			if ( runtime.compactList ) { runtime.str += "\t" ; }
			else if ( runtime.depth > 1 ) { runtime.str += keyIndent ; }	// avoid the first '\n' of a file
		}
		else { runtime.str += keyIndent ; }
		
		first = false ;
		
		splitted = splitIncludeOpKey( keys[ i ] ) ;
		
		if ( splitted.baseKey )
		{
			stringifyKey( splitted.baseKey , runtime ) ;
			runtime.str += ':' ;
			
			if ( splitted.fullOperator ) { runtime.str += ' (' + splitted.fullOperator + ')' ; }
		}
		else
		{
			runtime.str += '(' + splitted.fullOperator + ')' ;
		}
		
		//runtime.path[ runtime.path.length - 1 ] = keys[ i ] ;	//noUniqueRefNotation!
		
		runtime.include = splitted.include ;
		runtime.compactList = false ;
		stringifyAnyType(
			v[ keys[ i ] ] ,
			runtime ,
			propertyMask && typeof propertyMask === 'object' && propertyMask[ keys[ i ] ]
		) ;
	}
	
	if ( first ) { runtime.str += runtime.depth > 1 ? ' <Object>' : '<Object>' ; }
	
	//runtime.path.pop() ;	//noUniqueRefNotation!
	runtime.depth -- ;
	if ( runtime.documentDepthLimit && v.$ ) { runtime.documentDepth -- ; }
}



function stringifyTagContainer( v , runtime , propertyMask )
{
	var tagIndent ,
		i = 0 ,
		iMax = v.children.length ;
	
	if ( ! iMax )
	{
		runtime.str += runtime.depth ? ' <TagContainer>' : '<TagContainer>' ;
		return ;
	}
	
	tagIndent = '\n' + '\t'.repeat( runtime.depth ) ;
	
	runtime.depth ++ ;
	
	if ( runtime.depth <= 1 )
	{
		// avoid the first '\n' of a file
		//runtime.path[ runtime.path.length - 1 ] = i ;	//noUniqueRefNotation!
		stringifyTag( v.children[ i ] , runtime , propertyMask ) ;
		i = 1 ;
	}
	
	for ( ; i < iMax ; i ++ )
	{
		//runtime.path[ runtime.path.length - 1 ] = i ;	//noUniqueRefNotation!
		runtime.str += tagIndent ;
		stringifyTag( v.children[ i ] , runtime , propertyMask ) ;
	}
	
	//runtime.path.pop() ;	//noUniqueRefNotation!
	runtime.depth -- ;
}



function stringifyTag( v , runtime , propertyMask )
{
	if ( ! ( v instanceof Tag ) )
	{
		throw new Error( 'Expected an instance of Tag' ) ;
	}
	
	var attributes ;
	
	attributes = v.stringifyAttributes() ;
	if ( typeof attributes !== 'string' ) { attributes = '' ; }
	if ( attributes ) { attributes = ' ' + attributes ; }
	
	runtime.str += '[' + v.name + attributes + ']' ;
	
	runtime.compactList = false ;
	
	if ( v.content !== undefined ) { stringifyAnyType( v.content , runtime , propertyMask ) ; }
}



function splitIncludeOpKey( key )
{
	var splitted ;
	
	if ( key[ 0 ] === '@' )
	{
		if ( key[ 1 ] === '@' )
		{
			splitted = treeOps.splitOpKey( key.slice( 2 ) ) ;
			splitted.include = '@@' ;
		}
		else
		{
			splitted = treeOps.splitOpKey( key.slice( 1 ) ) ;
			splitted.include = '@' ;
		}
	}
	else
	{
		splitted = treeOps.splitOpKey( key ) ;
		splitted.include = '' ;
	}
	
	return splitted ;
}

