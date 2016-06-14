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
var kfgCommon = require( './kfgCommon.js' ) ;
var Template = require( './Template.js' ) ;
var Tag = require( './Tag.js' ) ;
var TagContainer = require( './TagContainer.js' ) ;



function parse( str , options )
{
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var runtime = {
		i: 0 ,
		iStartOfLine: 0 ,
		iEndOfLine: 0 ,
		lineNumber: 1 ,
		lastLine: false ,
		lastDepth: -1 ,
		depth: 0 ,
		depthLimit: options.depthLimit || Infinity ,
		ancestors: [] ,
		ancestorKeys: [] ,
		ancestorInstanceOf: [] ,
		ancestorTags: [] ,
		classes: options.classes || {} ,
		tags: options.tags || {} ,
		meta: options.meta
	} ;
	
	if ( typeof str !== 'string' )
	{
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}
	
	parseLines( str , runtime ) ;
	
	// Call depthManagement() one last time, because some instanceOf may still be hanging...
	runtime.depth = 0 ;
	depthManagement( runtime ) ;
	
	return runtime.ancestors[ 0 ] ;
}



module.exports = parse ;



function parseLines( str , runtime )
{
	while ( ! runtime.lastLine )
	{
		parseLineBoundaries( str , runtime ) ;
		parseLine( str , runtime ) ;
		nextItem( runtime ) ;
		runtime.iStartOfLine = runtime.iEndOfLine + 1 ;
		runtime.lineNumber ++ ;
	}
}



function nextItem( runtime )
{
	runtime.lastDepth = runtime.depth ;
}



function parseLineBoundaries( str , runtime )
{
	var indexOf = str.indexOf( '\n' , runtime.iStartOfLine ) ;
	
	if ( indexOf === -1 )
	{
		runtime.iEndOfLine = str.length ;
		runtime.lastLine = true ;
	}
	else
	{
		runtime.iEndOfLine = indexOf ;
	}
	
	//console.log( "parseLineBoundaries()\n" , runtime ) ;
}



function parseLine( str , runtime )
{
	runtime.i = runtime.iStartOfLine ;
	parseDepth( str , runtime ) ;
	
	// This is a comment or an empty line: skip that line right now!
	if ( runtime.i >= runtime.iEndOfLine || str[ runtime.i ] === '#' )
	{
		// Restore lastDepth
		runtime.depth = runtime.lastDepth ;
		return ;
	}
	
	depthManagement( runtime ) ;
	
	parseLineContent( str , runtime ) ;
}



function parseDepth( str , runtime )
{
	runtime.depth = 0 ;
	
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === '\t' )
	{
		runtime.depth ++ ;
		runtime.i ++ ;
	}
}



function depthManagement( runtime )
{
	var j ;
	
	//console.log( ">>> depthManagement:" , runtime.lastDepth , runtime.depth ) ;
	
	if ( runtime.depth === runtime.lastDepth )
	{
		if ( runtime.ancestorInstanceOf[ runtime.depth ] ) { construct( runtime , runtime.depth ) ; }
		else if ( runtime.ancestorTags[ runtime.depth ] ) { constructTag( runtime , runtime.depth ) ; }
	}
	else if ( runtime.depth < runtime.lastDepth )
	{
		for ( j = runtime.lastDepth ; j >= runtime.depth ; j -- )
		{
			if ( runtime.ancestorInstanceOf[ j ] ) { construct( runtime , j ) ; }
			else if ( runtime.ancestorTags[ j ] ) { constructTag( runtime , j ) ; }
		}
	}
	//else if ( runtime.depth === runtime.lastDepth + 1 ) {}
	else if ( runtime.depth !== runtime.lastDepth + 1 )
	//else
	{
		throw new SyntaxError( "Unexpected indentation: deeper than its parent + 1 (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.ancestors.length = runtime.depth + 1 ;
	runtime.ancestorKeys.length = runtime.depth + 1 ;
	
	if ( runtime.depth >= 0 )
	{
		runtime.ancestorInstanceOf.length = runtime.depth ;
		runtime.ancestorTags.length = runtime.depth ;
	}
}



function parseLineContent( str , runtime )
{
	/*
		Types of lines:
			- list entry (array) has a '-' after indentation
			- text lines has a '>' after indentation
			- properties (object) has a ':' somewhere after the key
			- in tag-mode implicit list entry (array) has a '[' after indentation
			- ??allow direct scalar values??
	*/
	
	if ( str[ runtime.i ] === '-' )
	{
		parseArrayElement( str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '>' )
	{
		parseStringLine( str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '$' && str[ runtime.i + 1 ] === '>' )
	{
		parseTemplateLine( str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '(' )
	{
		parseAfterKey( '' , str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '[' )
	{
		parseTag( str , runtime ) ;
	}
	else
	{
		parseMaybeKV( str , runtime ) ;
	}
}



function parseArrayElement( str , runtime )
{
	var k , v ;
	
	runtime.i ++ ;
	
	parseSpaces( str , runtime ) ;
	
	// Manage index/key
	if ( runtime.ancestorKeys[ runtime.depth ] === undefined )
	{
		k = runtime.ancestorKeys[ runtime.depth ] = 0 ;
	}
	else
	{
		k = ++ runtime.ancestorKeys[ runtime.depth ] ;
	}
	
	// If the parent is still undefined, now we know for sure that this is an array
	setParentArray( runtime ) ;
	
	// Check compact-list syntax
	if ( str[ runtime.i ] === '\t' )
	{
		runtime.i ++ ;
		parseSpaces( str , runtime ) ;
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }
		
		nextItem( runtime ) ;
		runtime.depth ++ ;
		depthManagement( runtime ) ;
		//console.log( "s: '" + str.slice( runtime.i , runtime.iEndOfLine ) + "'" ) ;
		parseLineContent( str , runtime ) ;
		
		return ;
	}
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	// /!\ What about operators for an array element?
	
	v = parseValue( str , runtime ) ;
	setParentArrayKV( k , v , runtime ) ;
}



function parseMaybeKV( str , runtime )
{
	var k , v ;
	
	parseSpaces( str , runtime ) ;
	
	if ( str[ runtime.i ] === '"' )
	{
		runtime.i ++ ;
		v = parseQuotedString( str , runtime ) ;
		parseSpaces( str , runtime ) ;
		
		if ( runtime.i >= runtime.iEndOfLine )
		{
			// This is a string value
			setParentString( runtime ) ;
			parentStringAppendLine( v , runtime ) ;
		}
		else if ( str[ runtime.i ] === ':' )
		{
			k = v ;
			runtime.i ++ ;
			parseAfterKey( k , str , runtime ) ;
		}
		else
		{
			throw new SyntaxError( "Unexpected " + str[ runtime.i ] + " (" + runtime.lineNumber + ")" ) ;
		}
		
		return ;
	}
	
	k = parseMaybeUnquotedKey( str , runtime ) ;
	
	if ( ! k )
	{
		// This is a value, unquoted
		if ( runtime.depth === 0 )
		{
			//console.log( "+++" , str.length , runtime.i , runtime.iEndOfLine , str[ runtime.i ] ) ;
			v = parseValue( str , runtime ) ;
			runtime.ancestors[ 0 ] = v ;
			//console.log( "---" , v , str.length , runtime.i , runtime.iEndOfLine , str[ runtime.i ] ) ;
		}
		else
		{
			// This is a string value, unquoted
			v = parseUnquotedString( str , runtime ) ;
			parentStringAppendLine( v , runtime ) ;
		}
	}
	else
	{
		parseAfterKey( k , str , runtime ) ;
	}
}



function parseAfterKey( k , str , runtime )
{
	var op , v ;
	
	parseSpaces( str , runtime ) ;
	
	// If the parent is still undefined, now we know for sure that this is an object
	setParentObject( runtime ) ;
	
	if ( str[ runtime.i ] === '(' )
	{
		// This is an operator
		op = parseOperator( str , runtime ) ;
		
		if ( ! op || treeOps.reservedOperators[ op ] ) { k = op + k ; }
		else { k = '(' + op + ')' + k ; }
		
		parseSpaces( str , runtime ) ;
	}
	
	runtime.ancestorKeys[ runtime.depth ] = k ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	runtime.ancestors[ runtime.depth + 1 ] = undefined ;
	
	// This is the easiest way to have include, it is prepended to the key
	if ( str[ runtime.i ] === '@' )
	{
		// This is an include
		op = parseInclude( str , runtime ) ;
		k = op + k ;
		
		if ( str[ runtime.i ] === '"' ) { v = parseQuotedString( str , runtime ) ; }
		else { v = parseUnquotedString( str , runtime ) ; }
		
		setParentObjectKV( k , v , runtime ) ;
		return ;
	}
	
	if ( ! op && treeOps.reservedKeyStart[ k[ 0 ] ] )
	{
		// The key contains an operator mark, escape it by prepending an empty operator
		k = '()' + k ;
	}
	
	v = parseValue( str , runtime , true ) ;
	setParentObjectKV( k , v , runtime ) ;
}



function parseStringLine( str , runtime )
{
	runtime.i ++ ;
	
	// If the parent is still undefined, now we know for sure that this is a string
	setParentString( runtime ) ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		parentStringAppendLine( '' , runtime ) ;
		return ;
	}
	
	if ( str[ runtime.i ] !== ' ' )
	{
		throw new SyntaxError( "Expecting a space ' ' after the '>', but got '" + str[ runtime.i ] + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.i ++ ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		parentStringAppendLine( '' , runtime ) ;
		return ;
	}
	
	//parseSpaces( str , runtime ) ;
	//parentStringAppendLine( parseUnquotedString( str , runtime ) , runtime ) ;
	
	parentStringAppendLine( str.slice( runtime.i , runtime.iEndOfLine ) , runtime ) ;
}



function parseTemplateLine( str , runtime )
{
	runtime.i += 2 ;
	
	// If the parent is still undefined, now we know for sure that this is a string
	setParentTemplate( runtime ) ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		parentTemplateAppendLine( '' , runtime ) ;
		return ;
	}
	
	if ( str[ runtime.i ] !== ' ' )
	{
		throw new SyntaxError( "Expecting a space ' ' after the '$>', but got '" + str[ runtime.i ] + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.i ++ ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		parentTemplateAppendLine( '' , runtime ) ;
		return ;
	}
	
	//parseSpaces( str , runtime ) ;
	//parentStringAppendLine( parseUnquotedString( str , runtime ) , runtime ) ;
	
	parentTemplateAppendLine( str.slice( runtime.i , runtime.iEndOfLine ) , runtime ) ;
}



function parseTag( str , runtime )
{
	var k , v , c , start , bracketLevel = 1 , found = false ;
	
	runtime.i ++ ;
	
	for ( start = runtime.i ; runtime.i < runtime.iEndOfLine ; runtime.i ++ )
	{
		c = str.charCodeAt( runtime.i ) ;
		
		if ( c === 0x5b )	// [ opening bracket, closing the tag
		{
			bracketLevel ++ ;
		}
		else if ( c === 0x5d )	// ] closing bracket, closing the tag
		{
			bracketLevel -- ;
			
			if ( ! bracketLevel )
			{
				runtime.ancestorTags[ runtime.depth ] = str.slice( start , runtime.i ).trim() ;
				runtime.i ++ ;
				found = true ;
				//console.log( ">>> tag:" , runtime.ancestorTags[ runtime.depth ] ) ;
				break ;
			}
		}
		else if ( c === 0x22 ) // double quote = start of a string
		{
			// Do not store the quoted string: we just want to go at the end of the tag!
			runtime.i ++ ;
			skipQuotedString( str , runtime ) ;
			runtime.i -- ; // because the loop will ++ it anyway
		}
	}
	
	if ( ! found ) // nothing found
	{
		throw new SyntaxError( "Unexpected end of line, expecting a ']' sign (" + runtime.lineNumber + ")" ) ;
	}
	
	
	// Manage index/key
	if ( runtime.ancestorKeys[ runtime.depth ] === undefined )
	{
		k = runtime.ancestorKeys[ runtime.depth ] = 0 ;
	}
	else
	{
		k = ++ runtime.ancestorKeys[ runtime.depth ] ;
	}
	
	// If the parent is still undefined, now we know for sure that this is a TagContainer
	setParentTagContainer( runtime ) ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	v = parseValue( str , runtime ) ;
	setParentTagContainerKV( k , v , runtime ) ;
}



// Skip spaces
function parseSpaces( str , runtime )
{
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}



function setParentString( runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( parent ) ;
	
	if ( type === undefined )
	{
		if ( parent instanceof Tag )
		{
			parent.content = '' ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = '' ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'string' )
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected string line (" + runtime.lineNumber + ")" ) ;
	}
}



function parentStringAppendLine( v , runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	
	if ( kfgCommon.containerType( parent ) === 'string' )
	{
		if ( parent instanceof Tag )
		{
			if ( parent.content ) { parent.content += '\n' ; }
			parent.content += v ;
		}
		else
		{
			if ( runtime.ancestors[ runtime.depth ] ) { runtime.ancestors[ runtime.depth ] += '\n' ; }
			runtime.ancestors[ runtime.depth ] += v ;
			// String are not passed by reference, so always parentLink them to their parent
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else
	{
		throw new SyntaxError( "Unexpected string line (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentTemplate( runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( parent ) ;
	
	if ( type === undefined )
	{
		if ( parent instanceof Tag )
		{
			parent.content = Template.create( '' , runtime.meta ) ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = Template.create( '' , runtime.meta ) ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'Template' )
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected Template line (" + runtime.lineNumber + ")" ) ;
	}
}



function parentTemplateAppendLine( v , runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	
	if ( kfgCommon.containerType( parent ) === 'Template' )
	{
		if ( parent instanceof Tag )
		{
			if ( parent.content.template ) { parent.content.template += '\n' ; }
			parent.content.template += v ;
		}
		else
		{
			if ( parent.template ) { parent.template += '\n' ; }
			parent.template += v ;
		}
		
		// Useful?
		//runtime.ancestors[ runtime.depth + 1 ] = parent.template ;
	}
	else
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected Template line (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentArray( runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( parent ) ;
	
	if ( type === undefined )
	{
		if ( parent instanceof Tag )
		{
			parent.content = [] ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = [] ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'Array' )
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected array element (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentArrayKV( k , v , runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	
	if ( kfgCommon.containerType( parent ) === 'Array' )
	{
		if ( parent instanceof Tag ) { parent.content[ k ] = v ; }
		else { parent[ k ] = v ; }
		
		runtime.ancestors[ runtime.depth + 1 ] = v ;
	}
	else
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected array element (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentObject( runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( parent ) ;
	
	if ( type === undefined )
	{
		if ( parent instanceof Tag )
		{
			parent.content = {} ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = {} ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'Object' )
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected key/value pair (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentObjectKV( k , v , runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	
	if ( kfgCommon.containerType( parent ) === 'Object' )
	{
		if ( parent instanceof Tag ) { parent.content[ k ] = v ; }
		else { parent[ k ] = v ; }
		
		runtime.ancestors[ runtime.depth + 1 ] = v ;
	}
	else
	{
		//console.log( runtime ) ;
		throw new SyntaxError( "Unexpected key/value pair (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentTagContainer( runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( parent ) ;
	
	if ( type === undefined )
	{
		if ( parent instanceof Tag )
		{
			parent.content = new TagContainer() ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = new TagContainer() ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'TagContainer' )
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected tag (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentTagContainerKV( k , v , runtime )
{
	var parent = runtime.ancestors[ runtime.depth ] ;
	//console.log( "\n>>> setParentTagContainerKV()!\n" ) ;
	
	if ( kfgCommon.containerType( parent ) === 'TagContainer' )
	{
		if ( parent instanceof Tag ) { parent.content.children[ k ] = v ; }
		else { parent.children[ k ] = v ; }
		
		runtime.ancestors[ runtime.depth + 1 ] = v ;
	}
	else
	{
		//console.log( "\n>>> ancestor:" , runtime.ancestors[ runtime.depth ] ) ;
		throw new SyntaxError( "Unexpected tag (" + runtime.lineNumber + ")" ) ;
	}
}



function parentLink( runtime , depth )
{
	var parentTarget ;
	
	if ( depth > 0 )
	{
		parentTarget = kfgCommon.getTarget( runtime.ancestors[ depth - 1 ] ) ;
		//try {
		parentTarget[ runtime.ancestorKeys[ depth - 1 ] ] = runtime.ancestors[ depth ] ;
		//} catch ( error ) { console.log( runtime ) ; throw error ; }
	}
}



function parseMaybeUnquotedKey( str , runtime )
{
	var j , v ;
	
	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ )
	{
		if ( str[ j ] === ':' )
		{
			v = str.slice( runtime.i , j ).trim() ;
			runtime.i = j + 1 ;
			return v ;
		}
	}
}	



function parseIntroducedString( str , runtime )
{
	var v ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return '' ; }
	
	if ( str[ runtime.i ] !== ' ' )
	{
		throw new SyntaxError( "Expecting a space ' ' after the '>', but got '" + str[ runtime.i ] + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.i ++ ;
	
	v = str.slice( runtime.i , runtime.iEndOfLine ) ;
	
	runtime.i = runtime.iEndOfLine ;
	
	return v ;
}



function parseIntroducedTemplate( str , runtime )
{
	var v ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return Template.create( '' , runtime.meta ) ; }
	
	if ( str[ runtime.i ] !== ' ' )
	{
		throw new SyntaxError( "Expecting a space ' ' after the '$>', but got '" + str[ runtime.i ] + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.i ++ ;
	
	v = Template.create( str.slice( runtime.i , runtime.iEndOfLine ) , runtime.meta ) ;
	
	runtime.i = runtime.iEndOfLine ;
	
	return v ;
}



function parseUnquotedString( str , runtime )
{
	var v = str.slice( runtime.i , runtime.iEndOfLine ).trim() ;
	runtime.i = runtime.iEndOfLine ;
	return v ;
}	



function parseQuotedTemplate( str , runtime )
{
	return Template.create( parseQuotedString( str , runtime ) , runtime.meta ) ;
}



function parseQuotedString( str , runtime )
{
	var c , j = runtime.i , l = runtime.iEndOfLine , v = '' ;
	
	for ( ; j < l ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		
		// This construct is intended: this is much faster (15%)
		if ( c === 0x22 || c === 0x5c || c <= 0x1f )
		{
			if ( c === 0x22	)	// double quote = end of the string
			{
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				return v ;
			}
			else if ( c === 0x5c )	// backslash
			{
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				v += parseBackSlash( str , runtime ) ;
				j = runtime.i - 1 ;
			}
			else if ( c <= 0x1f )	// illegal
			{
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + runtime.lineNumber + ")" ) ;
			}
		}
	}
	
	throw new SyntaxError( "Unexpected end of line, expecting a double-quote (" + runtime.lineNumber + ")" ) ;
}

// Export the quoted string parser
module.exports.parseQuotedString = parseQuotedString ;



// Skip a quoted string, without interpreting it
function skipQuotedString( str , runtime )
{
	var c , l = runtime.iEndOfLine ;
	
	for ( ; runtime.i < l ; runtime.i ++ )
	{
		c = str.charCodeAt( runtime.i ) ;
		
		// This construct is intended: this is much faster (15%)
		if ( c === 0x22 || c === 0x5c || c <= 0x1f )
		{
			if ( c === 0x22	)	// double quote = end of the string
			{
				runtime.i ++ ;
				return ;
			}
			else if ( c === 0x5c )	// backslash
			{
				runtime.i ++ ;
			}
			else if ( c <= 0x1f )	// illegal
			{
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + runtime.lineNumber + ")" ) ;
			}
		}
	}
	
	throw new SyntaxError( "Unexpected end of line, expecting a double-quote (" + runtime.lineNumber + ")" ) ;
}



var parseBackSlashLookup_ = 
( function createParseBackSlashLookup()
{
	var c = 0 , lookup = new Array( 0x80 ) ;
	
	for ( ; c < 0x80 ; c ++ )
	{
		if ( c === 0x62 )	// b
		{
			lookup[ c ] = '\b' ;
		}
		else if ( c === 0x66 )	// f
		{
			lookup[ c ] = '\f' ;
		}
		else if ( c === 0x6e )	// n
		{
			lookup[ c ] = '\n' ;
		}
		else if ( c === 0x72 )	// r
		{
			lookup[ c ] = '\r' ;
		}
		else if ( c === 0x74 )	// t
		{
			lookup[ c ] = '\t' ;
		}
		else if ( c === 0x5c )	// backslash
		{
			lookup[ c ] = '\\' ;
		}
		else if ( c === 0x2f )	// slash
		{
			lookup[ c ] = '/' ;
		}
		else if ( c === 0x22 )	// double-quote
		{
			lookup[ c ] = '"' ;
		}
		else
		{
			lookup[ c ] = '' ;
		}
	}
	
	return lookup ;
} )() ;



function parseBackSlash( str , runtime )
{
	var v , c = str.charCodeAt( runtime.i ) ;
	
	if ( runtime.i >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }
	
	if ( c === 0x75 )	// u
	{
		runtime.i ++ ;
		v = parseUnicode( str , runtime ) ;
		return v ;
	}
	else if ( ( v = parseBackSlashLookup_[ c ] ).length )
	{
		runtime.i ++ ;
		return v ;
	}
	else
	{
		throw new SyntaxError( 'Unexpected token: "' + str[ runtime.i ] + '" (' + runtime.lineNumber + ")" ) ;
	}
}



function parseUnicode( str , runtime )
{
	if ( runtime.i + 3 >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }
	
	var match = str.slice( runtime.i , runtime.i + 4 ).match( /[0-9a-f]{4}/ ) ;
	
	if ( ! match ) { throw new SyntaxError( "Unexpected " + str.slice( runtime.i , runtime.i + 4 ) + " (" + runtime.lineNumber + ")" ) ; }
	
	runtime.i += 4 ;
	
	// Or String.fromCodePoint() ?
	return String.fromCharCode( Number.parseInt( match[ 0 ] , 16 ) ) ;
}



var constants = {
	"null": null ,
	"true": true ,
	"false": false ,
	"on": true ,
	"off": false ,
	"yes": true ,
	"no": false ,
	"NaN": NaN ,
	"Infinity": Infinity ,
	"-Infinity": - Infinity ,
//	"...": null ,
} ;  



function parseOperator( str , runtime )
{
	var c , op , j ;
	
	runtime.i ++ ;
	
	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		
		if ( c === 0x29 )	// closing parenthesis
		{
			op = str.slice( runtime.i , j ).trim() ;
			runtime.i = j + 1 ;
			return op ;
		}
	}
	
	throw new SyntaxError( "Unexpected end of line, expecting a closing parenthesis (" + runtime.lineNumber + ")" ) ;
}



function parseInstanceOf( str , runtime )
{
	var c , j ;
	
	runtime.i ++ ;
	
	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ )
	{
		c = str.charCodeAt( j ) ;
		
		if ( c === 0x3e )	// > greater than sign, closing the instanceOf
		{
			runtime.ancestorInstanceOf[ runtime.depth ] = str.slice( runtime.i , j ).trim() ;
			runtime.i = j + 1 ;
			return ;
		}
	}
	
	throw new SyntaxError( "Unexpected end of line, expecting a 'greater-than' sign (" + runtime.lineNumber + ")" ) ;
}



function parseInclude( str , runtime )
{
	runtime.i ++ ;
	
	if ( str[ runtime.i ] === '@' )
	{
		runtime.i ++ ;
		return '@@' ;
	}
	
	return '@' ;
}



function parseValue( str , runtime , noInclude , afterInstanceOf )
{
	var c , v , op , instanceOf ;
	
	c = str.charCodeAt( runtime.i ) ;
	
	if ( c >= 0x30 && c <= 0x39 )	// digit
	{
		return parseNumber( str , runtime ) ;
	}
	else if ( c === 0x3c && ! afterInstanceOf )	// <   lesser-than sign: this introduce an instanceOf
	{
		instanceOf = parseInstanceOf( str , runtime ) ;
		parseSpaces( str , runtime ) ;
		
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }
		
		return parseValue( str , runtime , noInclude , true ) ;
	}
	else if ( c === 0x40 && ! noInclude )	// @   sign: this introduce an include
	{
		// This is an include
		op = parseInclude( str , runtime ) ;
		v = {} ;
		
		if ( str[ runtime.i ] === '"' ) { v[ op ] = parseQuotedString( str , runtime ) ; }
		else { v[ op ] = parseUnquotedString( str , runtime ) ; }
		
		return v ;
	}
	else
	{
		switch ( c )
		{
			case 0x2d :	// - minus
				c = str.charCodeAt( runtime.i + 1 ) ;
				if ( c >= 0x30 && c <= 0x39 )	// digit
				{
					return parseNumber( str , runtime ) ;
				}
				else
				{
					v = parseUnquotedString( str , runtime ) ;
					if ( v in constants ) { v = constants[ v ] ; }
					return v ;
				}
				break ;	// to please jshint
			
			case 0x22 :	// "   double-quote: this is a string
				runtime.i ++ ;
				return parseQuotedString( str , runtime ) ;
			
			case 0x3e :	// >   greater-than: this is a string
				runtime.i ++ ;
				return parseIntroducedString( str , runtime ) ;
			
			case 0x24 :	// $   dollar: maybe a Template
				c = str.charCodeAt( runtime.i + 1 ) ;
				if ( c === 0x3e )
				{
					runtime.i += 2 ;
					return parseIntroducedTemplate( str , runtime ) ;
				}
				else if ( c === 0x22 )
				{
					runtime.i += 2 ;
					return parseQuotedTemplate( str , runtime ) ;
				}
				// no break: fallback to default
			default :
				v = parseUnquotedString( str , runtime ) ;
				if ( v in constants ) { v = constants[ v ] ; }
				return v ;
		}
	}
}



var numberRegex_ = /^(-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?)\s*$/ ;

function parseNumber( str , runtime )
{
	var part = str.slice( runtime.i , runtime.iEndOfLine ) ;
	
	if ( numberRegex_.test( part ) )
	{
		runtime.i = runtime.iEndOfLine ;
		return parseFloat( part ) ;
	}
	else
	{
		return parseUnquotedString( str , runtime ) ;
	}
}



function construct( runtime , depth )
{
	var instanceOf ,
		parentTarget = kfgCommon.getTarget( runtime.ancestors[ depth ] ) ,
		v = parentTarget[ runtime.ancestorKeys[ depth ] ] ;
	
	//console.log( "construct() called:" , depth , runtime.ancestorInstanceOf[ depth ] , v ) ;
	
	instanceOf = runtime.ancestorInstanceOf[ depth ] ;
	
	if ( builtin[ instanceOf ] )
	{
		try {
			v = builtin[ instanceOf ]( v , runtime.meta ) ;
		}
		catch ( error ) {
			throw new SyntaxError(
				"Cannot construct '" + instanceOf + "' with those data (" + runtime.lineNumber +
				"), constructor error: " + error
			) ;
		}
	}
	else if ( typeof runtime.classes[ instanceOf ] === 'function' )
	{
		try {
			v = runtime.classes[ instanceOf ]( v , runtime.meta ) ;
		}
		catch ( error ) {
			//console.log( error ) ;
			throw new SyntaxError(
				"Cannot construct custom '" + instanceOf + "' with those data (" + runtime.lineNumber +
				"), constructor error: " + error
			) ;
		}
	}
	else
	{
		throw new SyntaxError( "Don't know how to construct '" + instanceOf + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	//setParentKV( parentTarget , runtime.ancestorKeys[ depth ] , v ) ;
	parentTarget[ runtime.ancestorKeys[ depth ] ] = v ;
}



function constructTag( runtime , depth )
{
	var matches , tag , attributes ,
		parentTarget = kfgCommon.getTarget( runtime.ancestors[ depth ] ) ,
		v = parentTarget[ runtime.ancestorKeys[ depth ] ] ;
	
	//console.log( ">>>" , require( 'string-kit' ).inspect( { style: 'color' , depth: 5 } , runtime.ancestors ) ) ;
	
	matches = runtime.ancestorTags[ depth ].match( /^([^ ]*)(?: +([^]*))?$/ ) ;
	tag = matches[ 1 ] ;
	attributes = matches[ 2 ] || '' ;
	
	if ( typeof runtime.tags[ tag ] === 'function' )
	{
		try {
			v = runtime.tags[ tag ]( tag , attributes , v , true ) ;
		}
		catch ( error ) {
			//console.log( error ) ;
			throw new SyntaxError(
				"Cannot construct custom tag '" + tag + "' with those data (" + runtime.lineNumber +
				"), tag constructor error: " + error
			) ;
		}
	}
	else
	{
		try {
			v = new Tag( tag , attributes , v , true ) ;
		}
		catch ( error ) {
			throw new SyntaxError(
				"Cannot construct tag '" + tag + "' with those data (" + runtime.lineNumber +
				"), tag constructor error: " + error
			) ;
		}
	}

	parentTarget[ runtime.ancestorKeys[ depth ] ] = v ;
}



var builtin = {} ;

builtin.DepthLimit = builtin.depthLimit = function depthLimit( v )
{
	return {} ;
} ;

builtin.Object = builtin.object = function object( v )
{
	return kfgCommon.containerType( v ) === 'Object' ? v : {} ;
} ;

builtin.Array = builtin.array = function array( v )
{
	return kfgCommon.containerType( v ) === 'Array' ? v : [] ;
} ;

builtin.TagContainer = builtin.tagContainer = function tagContainer( v )
{
	return kfgCommon.containerType( v ) === 'TagContainer' ? v : new TagContainer() ;
} ;

builtin.Template = builtin.template = function template( v , meta )
{
	return kfgCommon.containerType( v ) === 'Template' ? v : Template.create( v , meta ) ;
} ;

builtin.JSON = builtin.json = builtin.Json = function json( v )
{
	return JSON.parse( v ) ;
} ;

builtin.Bin16 = builtin.bin16 = builtin.bin = function bin16( v )
{
	return new Buffer( v , 'hex' ) ;
} ;

builtin.Date = builtin.date = function date( v )
{
	return new Date( v ) ;
} ;

builtin.Regex = builtin.regex = builtin.RegExp = builtin.Regexp = builtin.regexp = function regex( v )
{
	var match = v.match( /^\/([^]+)\/([a-z])*$/ ) ;
	if ( ! match ) { throw new SyntaxError( "Bad Regular Expression" ) ; }
	return new RegExp( match[ 1 ] , match[ 2 ] ) ;
} ;


