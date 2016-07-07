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



function parse( str , options )
{
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	var runtime = {
		i: 0 ,
		iStartOfLine: 0 ,
		iEndOfLine: 0 ,
		lineNumber: 1 ,
		lastLine: false ,
		lastDepth: 0 ,
		depth: 0 ,
		depthLimit: options.depthLimit || Infinity ,
		ancestors: [] ,
		ancestorKeys: [] ,
		ancestorInstanceOf: [] ,
		ancestorTags: [] ,
		ancestorTagProxies: [ options.proxy || {} ] ,
		meta: null ,
		metaHook: options.metaHook ,
		metaParsed: false ,
		classes: options.classes || {} ,
		tags: options.tags || {}
	} ;
	
	if ( ! runtime.ancestorTagProxies[ 0 ].data ) { runtime.ancestorTagProxies[ 0 ].data = {} ; }
	
	if ( typeof str !== 'string' )
	{
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}
	
	parseLines( str , runtime ) ;
	
	// Call depthManagement() one last time, because some instanceOf may still be hanging...
	runtime.depth = -1 ;
	depthManagement( runtime ) ;
	
	// If meta hook had not been triggered yet...
	if ( ! runtime.metaParsed && typeof runtime.metaHook === 'function' ) { runtime.metaHook( runtime.meta ) ; }
	
	// Add the config meta to the kungFig WeakMap
	if ( runtime.ancestors[ 0 ] && typeof runtime.ancestors[ 0 ] === 'object' )
	{
		kungFig.meta.set( runtime.ancestors[ 0 ] , runtime.meta ) ;
	}
	
	return runtime.ancestors[ 0 ] ;
}

module.exports = parse ;



// Circular reference trouble, should require after the module.exports assignement
var kungFig = require( './kungFig.js' ) ;
var treeOps = require( './treeOps.js' ) ;
var kfgCommon = require( './kfgCommon.js' ) ;
var Ref = require( './Ref.js' ) ;
var Template = require( './Template.js' ) ;
var Expression = require( './Expression.js' ) ;
var Tag = require( './Tag.js' ) ;
var TagContainer = require( './TagContainer.js' ) ;
var string = require( 'string-kit' ) ;



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
	
	if ( runtime.depth > runtime.lastDepth )
	{
		throw new SyntaxError( "Unexpected indentation: deeper than the current container (" + runtime.lineNumber + ")" ) ;
	}
	
	for ( j = runtime.lastDepth ; j > runtime.depth ; j -- )
	{
		// First instanceof
		if ( runtime.ancestorInstanceOf[ j ] ) { construct( runtime , j ) ; }
		
		// Then tags
		if ( runtime.ancestorTags[ j ] ) { constructTag( runtime , j ) ; }
	}
	
	if ( runtime.depth >= 0 )
	{
		runtime.ancestors.length = runtime.depth + 1 ;
		runtime.ancestorKeys.length = runtime.depth + 1 ;
		runtime.ancestorInstanceOf.length = runtime.depth + 1 ;
		runtime.ancestorTags.length = runtime.depth + 1 ;
		runtime.ancestorTagProxies.length = runtime.depth + 1 ;
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
	
	// first, try meta header
	if ( str[ runtime.i ] === '[' && str[ runtime.i + 1 ] === '[' )
	{
		if ( runtime.metaParsed )
		{
			throw new SyntaxError( "Unexpected meta tag: body section had already started (" + runtime.lineNumber + ")" ) ;
		}
		
		parseMetaTag( str , runtime ) ;
		return ;
	}
	
	// so we have content for the first time
	if ( ! runtime.metaParsed && runtime.depth === 0 )
	{
		runtime.metaParsed = true ;
		runtime.ancestorKeys.length = 0 ;	// Reset ancestorsKeys NOW!
		if ( typeof runtime.metaHook === 'function' ) { runtime.metaHook( runtime.meta ) ; }
	}
	
	// parse content
	if ( str[ runtime.i ] === '-' )
	{
		parseArrayElement( str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '>' )
	{
		parseStringLine( str , runtime ) ;
	}
	//*
	else if ( str[ runtime.i ] === '$' && str[ runtime.i + 1 ] === '>' )
	{
		parseTemplateLine( str , runtime ) ;
	}
	/*/
	/*
	else if ( str[ runtime.i ] === '$' )
	{
		if ( str[ runtime.i + 1 ] === '>' )
		{
			parseTemplateLine( str , runtime ) ;
		}
		else if ( str[ runtime.i + 1 ] === '=' )
		{
			parseExpression( str , runtime ) ;
		}
		else
		{
			parseRef( str , runtime ) ;
		}
	}
	//*/
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
	setCurrentArray( runtime ) ;
	runtime.depth ++ ;
	
	// Check compact-list syntax
	if ( str[ runtime.i ] === '\t' )
	{
		runtime.i ++ ;
		parseSpaces( str , runtime ) ;
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }
		
		nextItem( runtime ) ;
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
			setCurrentString( runtime ) ;
			currentStringAppendLine( v , runtime ) ;
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
			currentStringAppendLine( v , runtime ) ;
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
	setCurrentObject( runtime ) ;
	runtime.depth ++ ;
	
	if ( str[ runtime.i ] === '(' )
	{
		// This is an operator
		op = parseOperator( str , runtime ) ;
		
		if ( ! op || treeOps.reservedOperators[ op ] ) { k = op + k ; }
		else { k = '(' + op + ')' + k ; }
		
		parseSpaces( str , runtime ) ;
	}
	
	runtime.ancestorKeys[ runtime.depth - 1 ] = k ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	runtime.ancestors[ runtime.depth ] = undefined ;
	
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
	setCurrentString( runtime ) ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		currentStringAppendLine( '' , runtime ) ;
		return ;
	}
	
	if ( str[ runtime.i ] !== ' ' )
	{
		throw new SyntaxError( "Expecting a space ' ' after the '>', but got '" + str[ runtime.i ] + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.i ++ ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		currentStringAppendLine( '' , runtime ) ;
		return ;
	}
	
	//parseSpaces( str , runtime ) ;
	//currentStringAppendLine( parseUnquotedString( str , runtime ) , runtime ) ;
	
	currentStringAppendLine( str.slice( runtime.i , runtime.iEndOfLine ) , runtime ) ;
}



function parseTemplateLine( str , runtime )
{
	runtime.i += 2 ;
	
	// If the parent is still undefined, now we know for sure that this is a string
	setCurrentTemplate( runtime ) ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		currentTemplateAppendLine( '' , runtime ) ;
		return ;
	}
	
	if ( str[ runtime.i ] !== ' ' )
	{
		throw new SyntaxError( "Expecting a space ' ' after the '$>', but got '" + str[ runtime.i ] + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.i ++ ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		currentTemplateAppendLine( '' , runtime ) ;
		return ;
	}
	
	//parseSpaces( str , runtime ) ;
	//currentStringAppendLine( parseUnquotedString( str , runtime ) , runtime ) ;
	
	currentTemplateAppendLine( str.slice( runtime.i , runtime.iEndOfLine ) , runtime ) ;
}



function parseTag( str , runtime )
{
	var k , v , c , start , bracketLevel = 1 , found = false ;
	
	runtime.i ++ ;
	
	for ( start = runtime.i ; runtime.i < runtime.iEndOfLine ; runtime.i ++ )
	{
		c = str.charCodeAt( runtime.i ) ;
		
		if ( c === 0x5b )	// [ opening bracket, increment bracket-level, or parseMetaTag
		{
			bracketLevel ++ ;
		}
		else if ( c === 0x5d )	// ] closing bracket, closing the tag if bracket-level is decreased to 0
		{
			bracketLevel -- ;
			
			if ( ! bracketLevel )
			{
				runtime.ancestorTags[ runtime.depth + 1 ] =
					str.slice( start , runtime.i ).trim()
					.match( /^([^ ]*)(?: +([^]*))?$/ )
					.slice( 1 , 3 ) ;
				
				assignTagProxy( runtime , runtime.depth + 1 ) ;
				
				//runtime.ancestorTags[ runtime.depth + 1 ] = str.slice( start , runtime.i ).trim() ;
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
	setCurrentTagContainer( runtime ) ;
	
	runtime.depth ++ ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	parseSpaces( str , runtime ) ;
	v = parseValue( str , runtime ) ;
	
	setParentTagContainerKV( k , v , runtime ) ;
}



function parseMetaTag( str , runtime )
{
	var k , v , c , start , bracketLevel = 1 , found = false ;
	
	runtime.i += 2 ;
	
	if ( runtime.depth )
	{
		throw new Error( "Meta tag can only exist at top-level" ) ;
	}
	
	for ( start = runtime.i ; runtime.i < runtime.iEndOfLine ; runtime.i ++ )
	{
		c = str.charCodeAt( runtime.i ) ;
		
		if ( c === 0x5b )	// [ opening bracket, increment bracket-level
		{
			bracketLevel ++ ;
		}
		else if ( c === 0x5d )	// ] closing bracket, closing the tag if bracket-level is decreased to 0
		{
			bracketLevel -- ;
			
			if ( ! bracketLevel )
			{
				if ( str.charCodeAt( runtime.i + 1 ) !== 0x5d )
				{
					throw new SyntaxError( "Expecting a closing meta tag ']]' sign (" + runtime.lineNumber + ")" ) ;
				}
				
				runtime.ancestorTags[ runtime.depth + 1 ] =
					str.slice( start , runtime.i ).trim()
					.match( /^([^ ]*)(?: +([^]*))?$/ )
					.slice( 1 , 3 ) ;
				
				// This is a Meta-Tag, push true as the third array element
				runtime.ancestorTags[ runtime.depth + 1 ].push( true ) ;
				
				assignTagProxy( runtime , runtime.depth + 1 ) ;
				
				//runtime.ancestorTags[ runtime.depth + 1 ] = str.slice( start , runtime.i ).trim() ;
				runtime.i += 2 ;
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
		throw new SyntaxError( "Unexpected end of line, expecting a ']]' sign (" + runtime.lineNumber + ")" ) ;
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
	
	//setCurrentTagContainer( runtime ) ;
	if ( ! runtime.meta ) { runtime.meta = new TagContainer() ; }
	
	runtime.depth ++ ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return ; }
	
	parseSpaces( str , runtime ) ;
	v = parseValue( str , runtime ) ;
	
	//console.log( "meta value:" , v ) ;
	
	//setParentTagContainerKV( k , v , runtime ) ;
	runtime.ancestors[ runtime.depth ] = v ;
}



/*
	Notice: 'data' is a special property in the proxy, it always exists and receive a special treatment.
*/
function assignTagProxy( runtime , depth )
{
	var parentProxy ,
		tag = runtime.ancestorTags[ depth ][ 0 ] ;
	
	switch ( typeof runtime.tags[ tag ] === 'function' && runtime.tags[ tag ].proxyMode )
	{
		case 'local' :
			runtime.ancestorTagProxies[ depth ] = { data: {} } ;
			break ;
		
		case 'links' :
			parentProxy = getClosestProxy( runtime , depth - 1 ) ;
			
			runtime.ancestorTagProxies[ depth ] = {
				__parent: parentProxy ,
				__root: parentProxy.__root || parentProxy ,
				data: {
					'': parentProxy.data ,
					'%': ( parentProxy.__root || parentProxy ).data
				}
			} ;
			break ;
		
		case 'inherit' :
			parentProxy = getClosestProxy( runtime , depth - 1 ) ;
			
			runtime.ancestorTagProxies[ depth ] = Object.create( parentProxy ) ;
			runtime.ancestorTagProxies[ depth ].data = Object.create( parentProxy.data ) ;
			break ;
		
		case 'inherit+links' :
			parentProxy = getClosestProxy( runtime , depth - 1 ) ;
			
			runtime.ancestorTagProxies[ depth ] = Object.create( parentProxy ) ;
			runtime.ancestorTagProxies[ depth ].__parent = parentProxy ;
			runtime.ancestorTagProxies[ depth ].__root = parentProxy.__root || parentProxy ;
			
			runtime.ancestorTagProxies[ depth ].data = Object.create( parentProxy.data ) ;
			runtime.ancestorTagProxies[ depth ].data[''] = parentProxy.data ;
			runtime.ancestorTagProxies[ depth ].data['%'] = ( parentProxy.__root || parentProxy ).data ;
			break ;
		
		//case: 'parent' :
		default:
			runtime.ancestorTagProxies[ depth ] = getClosestProxy( runtime , depth - 1 ) ;
	}
}



function getClosestProxy( runtime , depth )
{
	var j ;
	
	for ( j = depth ; j >= 0 ; j -- )
	{
		if ( runtime.ancestorTagProxies[ j ] )
		{
			return runtime.ancestorTagProxies[ j ] ;
		}
	}
}



// Skip spaces
function parseSpaces( str , runtime )
{
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}



function setCurrentString( runtime )
{
	var current = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( current ) ;
	
	if ( type === undefined )
	{
		if ( current instanceof Tag )
		{
			current.content = '' ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = '' ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'string' )
	{
		throw new SyntaxError( "Unexpected string line (" + runtime.lineNumber + ")" ) ;
	}
}



function currentStringAppendLine( v , runtime )
{
	var current = runtime.ancestors[ runtime.depth ] ;
	
	if ( kfgCommon.containerType( current ) === 'string' )
	{
		if ( current instanceof Tag )
		{
			if ( current.content ) { current.content += '\n' ; }
			current.content += v ;
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



function setCurrentTemplate( runtime )
{
	var current = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( current ) ;
	
	if ( type === undefined )
	{
		if ( current instanceof Tag )
		{
			current.content = Template.create( '' , getClosestProxy( runtime , runtime.depth ) ) ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = Template.create( '' , getClosestProxy( runtime , runtime.depth ) ) ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'Template' )
	{
		throw new SyntaxError( "Unexpected Template line (" + runtime.lineNumber + ")" ) ;
	}
}



function currentTemplateAppendLine( v , runtime )
{
	var current = runtime.ancestors[ runtime.depth ] ;
	
	if ( kfgCommon.containerType( current ) === 'Template' )
	{
		if ( current instanceof Tag )
		{
			if ( current.content.template ) { current.content.template += '\n' ; }
			current.content.template += v ;
		}
		else
		{
			if ( current.template ) { current.template += '\n' ; }
			current.template += v ;
		}
	}
	else
	{
		throw new SyntaxError( "Unexpected Template line (" + runtime.lineNumber + ")" ) ;
	}
}



function setCurrentArray( runtime )
{
	var current = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( current ) ;
	
	if ( type === undefined )
	{
		if ( current instanceof Tag )
		{
			current.content = [] ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = [] ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'Array' )
	{
		throw new SyntaxError( "Unexpected array element (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentArrayKV( k , v , runtime )
{
	var parent = runtime.ancestors[ runtime.depth - 1 ] ;
	
	if ( kfgCommon.containerType( parent ) === 'Array' )
	{
		if ( parent instanceof Tag ) { parent.content[ k ] = v ; }
		else { parent[ k ] = v ; }
		
		runtime.ancestors[ runtime.depth ] = v ;
	}
	else
	{
		throw new SyntaxError( "Unexpected array element (" + runtime.lineNumber + ")" ) ;
	}
}



function setCurrentObject( runtime )
{
	var current = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( current ) ;
	
	if ( type === undefined )
	{
		if ( current instanceof Tag )
		{
			current.content = {} ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = {} ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'Object' )
	{
		throw new SyntaxError( "Unexpected key/value pair (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentObjectKV( k , v , runtime )
{
	var parent = runtime.ancestors[ runtime.depth - 1 ] ;
	
	if ( kfgCommon.containerType( parent ) === 'Object' )
	{
		if ( parent instanceof Tag ) { parent.content[ k ] = v ; }
		else { parent[ k ] = v ; }
		
		runtime.ancestors[ runtime.depth ] = v ;
	}
	else
	{
		throw new SyntaxError( "Unexpected key/value pair (" + runtime.lineNumber + ")" ) ;
	}
}



function setCurrentTagContainer( runtime )
{
	var current = runtime.ancestors[ runtime.depth ] ;
	var type = kfgCommon.containerType( current ) ;
	
	if ( type === undefined )
	{
		if ( current instanceof Tag )
		{
			current.content = new TagContainer() ;
		}
		else
		{
			runtime.ancestors[ runtime.depth ] = new TagContainer() ;
			parentLink( runtime , runtime.depth ) ;
		}
	}
	else if ( type !== 'TagContainer' )
	{
		throw new SyntaxError( "Unexpected tag (" + runtime.lineNumber + ")" ) ;
	}
}



function setParentTagContainerKV( k , v , runtime )
{
	var parent = runtime.ancestors[ runtime.depth - 1 ] ;
	
	if ( kfgCommon.containerType( parent ) === 'TagContainer' )
	{
		if ( parent instanceof Tag ) { parent.content.children[ k ] = v ; }
		else { parent.children[ k ] = v ; }
		
		runtime.ancestors[ runtime.depth ] = v ;
	}
	else
	{
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
		if ( parentTarget && typeof parentTarget === 'object' )
		{
			parentTarget[ runtime.ancestorKeys[ depth - 1 ] ] = runtime.ancestors[ depth ] ;
		}
		//} catch ( error ) { console.log( runtime ) ; throw error ; }
	}
}



function parseMaybeUnquotedKey( str , runtime )
{
	var j , v ;
	
	// It should not start by an instanceof
	if ( str[ runtime.i ] === '<' ) { return ; }
	
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



function parseRef( str , runtime )
{
	var v , indexOf ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return Ref.create( '' , getClosestProxy( runtime , runtime.depth ) ) ; }
	
	str = str.slice( runtime.i , runtime.iEndOfLine ) ;
	
	if ( ( indexOf = str.indexOf( ' ' ) ) !== -1 ) { str = str.slice( 0 , indexOf ) ; }
	
	v = Ref.create( str , getClosestProxy( runtime , runtime.depth ) ) ;
	
	runtime.i += str.length ;
	
	return v ;
}

module.exports.parseRef = parseRef ;



function parseExpression( str , runtime )
{
	var v ;
	
	if ( runtime.i >= runtime.iEndOfLine )
	{
		throw new SyntaxError( "Unexpected end of line, expecting an expression (" + runtime.lineNumber + ")" ) ;
	}
	
	v = Expression.parseFromKfg( str , runtime ) ;
	
	runtime.i = runtime.iEndOfLine ;
	
	return v ;
}



function parseIntroducedTemplate( str , runtime )
{
	var v ;
	
	if ( runtime.i >= runtime.iEndOfLine ) { return Template.create( '' , getClosestProxy( runtime , runtime.depth ) ) ; }
	
	if ( str[ runtime.i ] !== ' ' )
	{
		throw new SyntaxError( "Expecting a space ' ' after the '$>', but got '" + str[ runtime.i ] + "' (" + runtime.lineNumber + ")" ) ;
	}
	
	runtime.i ++ ;
	
	v = Template.create( str.slice( runtime.i , runtime.iEndOfLine ) , getClosestProxy( runtime , runtime.depth ) ) ;
	
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
	return Template.create( parseQuotedString( str , runtime ) , getClosestProxy( runtime , runtime.depth ) ) ;
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

module.exports.constants = constants ;



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
			
			case 0x24 :	// $   dollar: maybe a Template, a Ref or an Expression
				c = str.charCodeAt( runtime.i + 1 ) ;
				if ( c === 0x3e )	// >
				{
					runtime.i += 2 ;
					return parseIntroducedTemplate( str , runtime ) ;
				}
				else if ( c === 0x22 )	// "
				{
					runtime.i += 2 ;
					return parseQuotedTemplate( str , runtime ) ;
				}	// jshint ignore:line
				else if ( c === 0x3d )	// =
				{
					runtime.i += 2 ;
					return parseExpression( str , runtime ) ;
				}	// jshint ignore:line
				else
				{
					runtime.i ++ ;
					return parseRef( str , runtime ) ;
				}
				break ;
				
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
	var instanceOf , parentTarget = null , parentKey , v ;
	
	if ( depth > 0 )
	{
		parentTarget = kfgCommon.getTarget( runtime.ancestors[ depth - 1 ] ) ;
		parentKey = runtime.ancestorKeys[ depth - 1 ] ;
		
		if ( parentTarget && typeof parentTarget === 'object' )
		{
			v = parentTarget[ parentKey ] ;
		}
		else
		{
			parentTarget = null ;
			v = runtime.ancestors[ depth ] ;
		}
	}
	else
	{
		v = runtime.ancestors[ depth ] ;
	}
	
	//console.log( "construct() called:" , depth , runtime.ancestorInstanceOf[ depth ] , v ) ;
	
	instanceOf = runtime.ancestorInstanceOf[ depth ] ;
	
	if ( builtin[ instanceOf ] )
	{
		try {
			v = builtin[ instanceOf ]( v , getClosestProxy( runtime , depth ) ) ;
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
			v = runtime.classes[ instanceOf ]( v , getClosestProxy( runtime , runtime.depth ) ) ;
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
	
	if ( parentTarget ) { parentTarget[ parentKey ] = v ; }
	else { runtime.ancestors[ depth ] = v ; }
}



function constructTag( runtime , depth )
{
	var tag , attributes , parentTarget = null , parentKey , v , isMetaTag ;
	
	tag = runtime.ancestorTags[ depth ][ 0 ] ;
	attributes = runtime.ancestorTags[ depth ][ 1 ] || '' ;
	isMetaTag = !! runtime.ancestorTags[ depth ][ 2 ] ;
	
	if ( isMetaTag )
	{
		parentTarget = runtime.meta.children ;
		parentKey = runtime.ancestorKeys[ depth - 1 ] ;
		v = runtime.ancestors[ depth ] ;
		
		/*
		console.log( "\n>>>>>>" ) ;
		console.log( parentTarget , parentKey , v ) ;
		console.log( runtime ) ;
		console.log( "<<<<<<\n" ) ;
		//*/
	}
	else if ( depth > 0 )
	{
		parentTarget = kfgCommon.getTarget( runtime.ancestors[ depth - 1 ] ) ;
		parentKey = runtime.ancestorKeys[ depth - 1 ] ;
		
		if ( parentTarget && typeof parentTarget === 'object' )
		{
			v = parentTarget[ parentKey ] ;
		}
		else
		{
			parentTarget = null ;
			v = runtime.ancestors[ depth ] ;
		}
	}
	else
	{
		v = runtime.ancestors[ depth ] ;
	}
	
	
	//console.log( ">>>" , require( 'string-kit' ).inspect( { style: 'color' , depth: 5 } , runtime.ancestors ) ) ;
	
	if ( typeof runtime.tags[ tag ] === 'function' )
	{
		try {
			v = runtime.tags[ tag ]( tag , attributes , v , runtime.ancestorTagProxies[ depth ] , true ) ;
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
			v = new Tag( tag , attributes , v , runtime.ancestorTagProxies[ depth ] , true ) ;
		}
		catch ( error ) {
			throw new SyntaxError(
				"Cannot construct tag '" + tag + "' with those data (" + runtime.lineNumber +
				"), tag constructor error: " + error
			) ;
		}
	}
	
	if ( parentTarget ) { parentTarget[ parentKey ] = v ; }
	else { runtime.ancestors[ depth ] = v ; }
}



var builtin = {} ;
module.exports.builtin = builtin ;

builtin.DepthLimit = builtin.depthLimit = function depthLimit()
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

builtin.Ref = builtin.ref = function ref_( v , proxy )
{
	return kfgCommon.containerType( v ) === 'Ref' ? v : Ref.create( v , proxy ) ;
} ;

builtin.Expression = builtin.expression = function expression( v , proxy )
{
	return kfgCommon.containerType( v ) === 'Expression' ? v : Expression.parse( v , proxy ) ;
} ;

builtin.Template = builtin.template = function template( v , proxy )
{
	return kfgCommon.containerType( v ) === 'Template' ? v : Template.create( v , proxy ) ;
} ;

builtin.JSON = builtin.json = builtin.Json = function json( v )
{
	return JSON.parse( v ) ;
} ;

builtin.Bin16 = builtin.bin16 = builtin.bin = function bin16( v )
{
	if ( typeof v !== 'string' )
	{
		if ( typeof v === 'number' && ! Number.isNaN( v ) && v > 0 && v !== -Infinity )
		{
			v = '' + v ;
		}
		else
		{
			throw new Error( "Expecting a string, but got a " + typeof v ) ;
		}
	}
	
	return new Buffer( v , 'hex' ) ;
} ;

builtin.Date = builtin.date = function date( v )
{
	return new Date( v ) ;
} ;

builtin.Regex = builtin.regex = builtin.RegExp = builtin.Regexp = builtin.regexp = function regex( v )
{
	var delimiter , escDelimiter , partRegex , fixDelimiterRegex , match , regex ;
	
	if ( ! v || typeof v !== 'string' ) { throw new SyntaxError( "Bad Regular Expression: not a string or empty string" ) ; }
	
	delimiter = v[ 0 ] ;
	escDelimiter = string.escape.regExp( delimiter ) ;
	
	try {
		partRegex = new RegExp(
			"^" + escDelimiter + "((?:\\\\" + escDelimiter + "|[^" + escDelimiter + "])+)" +
			"(?:" + escDelimiter + "((?:\\\\" + escDelimiter + "|[^" + escDelimiter + "])+))?" +
			escDelimiter + "([a-z])*$"
		) ;
		
		fixDelimiterRegex = new RegExp( "\\\\(" + escDelimiter + ")" , 'g' ) ;
		
		match = v.match( partRegex ) ;
	}
	catch ( error ) {
		throw new SyntaxError( "Bad Regular Expression: " + v ) ;
	}
	
	if ( ! match ) { throw new SyntaxError( "Bad Regular Expression: " + v ) ; }
	
	regex = match[ 1 ].replace( fixDelimiterRegex , '$1' ) ;
	v = new RegExp( match[ 1 ].replace( fixDelimiterRegex , '$1' ) , match[ 3 ] ) ;
	
	Object.defineProperty( v , 'delimiter' , { value: delimiter } ) ;
	
	if ( typeof match[ 2 ] === 'string' )
	{
		builtin.RegExp.toSubstitution( v , match[ 2 ].replace( fixDelimiterRegex , '$1' ) ) ;
	}
	
	/*
	console.log( "delimiter:" , delimiter ) ;
	console.log( "escDelimiter:" , escDelimiter ) ;
	console.log( "partRegex:" , partRegex ) ;
	console.log( "fixDelimiterRegex:" , fixDelimiterRegex ) ;
	console.log( "match:" , match ) ;
	console.log( "regex:" , regex ) ;
	console.log( "substitution:" , v.substitution ) ;
	*/
	
	return v ;
} ;

builtin.RegExp.toSubstitution = function toSubstitution( regexp , substitution )
{
	Object.defineProperties( regexp , {
		substitution: { value: substitution } ,
		substitute: { value: builtin.RegExp.substitute }
	} ) ;
} ;

builtin.RegExp.substitute = function substitute( str )
{
	str = '' + str ;
	return str.replace( this , this.substitution ) ;
} ;

builtin.RegExp.match = function match( str )
{
	str = '' + str ;
	return str.match( this ) ;
} ;

builtin.RegExp.filter = function filter( array )
{
	return array.filter( e => this.test( e ) ) ;
} ;

