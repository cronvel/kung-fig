/*
	Kung Fig

	Copyright (c) 2015 - 2019 Cédric Ronvel

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



const hash = require( 'hash-kit' ) ;
const path = require( 'path' ) ;
const common = require( 'kung-fig-common' ) ;
const Ref = require( 'kung-fig-ref' ) ;
const Expression = require( 'kung-fig-expression' ) ;
const DynamicInstance = require( 'kung-fig-dynamic-instance' ) ;
const template = require( 'kung-fig-template' ) ;
const TemplateSentence = template.Sentence ;
const TemplateAtom = template.Atom ;



function parse( str , options ) {
	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	var runtime = {
		i: 0 ,
		iStartOfLine: 0 ,
		iEndOfLine: 0 ,
		file: options.file ,
		directory: options.directory || ( options.file && path.dirname( options.file ) ) || '' ,
		masterFile: options.masterFile || options.file ,
		relPath: options.masterFile && options.masterFile !== options.file ?
			path.relative( path.dirname( options.masterFile ) , options.file ) :
			'' ,
		lineNumber: 1 ,
		nextTagId: 0 ,
		lastLine: false ,
		lastDepth: 0 ,
		depth: 0 ,
		depthLimit: options.depthLimit || Infinity ,
		hasSection: false ,
		stack: [ {} ] ,
		meta: new Meta() ,
		metaTagsHook: options.metaTagsHook ,
		metaTagsParsed: false ,
		requiredDoctype: options.doctype ,
		doctype: null ,
		isInclude: !! options.isInclude ,
		classes: options.classes || {} ,
		tags: options.tags || {} ,
		metaTags: options.metaTags || {} ,
		operators: options.operators || {}
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	parseLines( str , runtime ) ;

	// Call depthManagement() one last time, because some instanceOf may still be hanging...
	runtime.depth = -1 ;
	depthManagement( runtime ) ;

	// If meta hook had not been triggered yet...
	if ( ! runtime.metaTagsParsed ) {
		if ( ! runtime.doctype && runtime.requiredDoctype ) {
			throw new Error( "Missing doctype, but required '" +
				( Array.isArray( runtime.requiredDoctype ) ? runtime.requiredDoctype.join( "' or '" ) : runtime.requiredDoctype ) + "'." ) ;
		}

		if ( typeof runtime.metaTagsHook === 'function' ) { runtime.metaTagsHook( runtime.meta.tags , runtime ) ; }
	}

	// Add the config meta to the kungFig WeakMap
	if ( runtime.stack[ 0 ] && runtime.stack[ 0 ].value && typeof runtime.stack[ 0 ].value === 'object' ) {
		kungFig.meta.set( runtime.stack[ 0 ].value , runtime.meta ) ;
	}

	return runtime.stack[ 0 ] && runtime.stack[ 0 ].value ;
}

module.exports = parse ;



// DEPRECATED, since they are on their own module
module.exports.parseQuotedString = common.parsers.parseQuotedString ;
module.exports.constants = common.constants ;
module.exports.parseRef = Ref.parseFromKfg ;



// Circular reference trouble, should require after the module.exports assignement
const kungFig = require( './kungFig.js' ) ;
const treeOps = require( 'kung-fig-tree-ops' ) ;
const kfgCommon = require( './kfgCommon.js' ) ;
const MultiLine = kfgCommon.MultiLine ;
const DepthLimit = kfgCommon.DepthLimit ;
const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const OrderedObject = require( './OrderedObject.js' ) ;
const Meta = require( './Meta.js' ) ;
const string = require( 'string-kit' ) ;



function parseLines( str , runtime ) {
	while ( ! runtime.lastLine ) {
		parseLineBoundaries( str , runtime ) ;
		parseLine( str , runtime ) ;
		nextItem( runtime ) ;
		runtime.iStartOfLine = runtime.iEndOfLine + 1 ;
		runtime.lineNumber ++ ;
	}
}



function nextItem( runtime ) {
	runtime.lastDepth = runtime.depth ;
}



function parseLineBoundaries( str , runtime ) {
	var indexOf = str.indexOf( '\n' , runtime.iStartOfLine ) ;

	if ( indexOf === -1 ) {
		runtime.iEndOfLine = str.length ;
		runtime.lastLine = true ;
	}
	else {
		runtime.iEndOfLine = indexOf ;
	}
}



function parseLine( str , runtime ) {
	runtime.i = runtime.iStartOfLine ;
	parseDepth( str , runtime ) ;

	// This is a comment or an empty line: skip that line right now!
	if ( runtime.i >= runtime.iEndOfLine || str[ runtime.i ] === '#' ) {
		// Restore lastDepth
		runtime.depth = runtime.lastDepth ;
		return ;
	}

	depthManagement( runtime ) ;

	parseLineContent( str , runtime ) ;
}



function parseDepth( str , runtime ) {
	runtime.depth = 0 ;

	if ( str[ runtime.i ] === '\t' ) {
		runtime.depth ++ ;
		//increaseDepth( runtime ) ;
		runtime.i ++ ;

		while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === '\t' ) {
			runtime.depth ++ ;
			//increaseDepth( runtime ) ;
			runtime.i ++ ;
		}
	}
	else if ( str[ runtime.i ] === ' ' ) {
		runtime.depth ++ ;
		//increaseDepth( runtime ) ;
		runtime.i ++ ;

		while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) {
			runtime.depth ++ ;
			//increaseDepth( runtime ) ;
			runtime.i ++ ;
		}

		if ( runtime.depth % 4 ) {
			throw new SyntaxError( "Unexpected indentation: space indentation should be 4-spaces (" + common.parsers.locationStr( runtime ) + ")" ) ;
		}

		runtime.depth /= 4 ;
	}
}



function depthManagement( runtime ) {
	//console.log( ">>> depthManagement:" , runtime.lastDepth , runtime.depth ) ;
	if ( runtime.hasSection ) { runtime.depth ++ ; }

	// Too deep:
	if ( runtime.depth > runtime.lastDepth ) {
		throw new SyntaxError( "Unexpected indentation: deeper than the current container (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	closeDepth( runtime , runtime.lastDepth , runtime.depth ) ;
}



function closeDepth( runtime , depth , toDepth ) {
	// Close as many nested depth:
	for ( ; depth > toDepth ; depth -- ) {
		// First check if it's a MultiLine: contruct the real scalar, and re-attach it to its parent
		if ( runtime.stack[ depth ].value instanceof MultiLine ) {
			runtime.stack[ depth ].value = runtime.stack[ depth ].value.construct() ;
			parentLink( runtime , depth ) ;
		}
		else if ( runtime.stack[ depth ].hasInnerMultiLine ) {
			substituteMultiLine( runtime.stack[ depth ].value ) ;
		}

		// Then instanceof
		if ( runtime.stack[ depth ].instanceOf ) { construct( runtime , depth ) ; }

		// Then tags
		if ( runtime.stack[ depth ].tag ) { constructTag( runtime , depth ) ; }

		// Element repetition handling
		if ( runtime.stack[ depth ].repeat ) { repeatElement( runtime , depth ) ; }
	}

	// Clear unstacked stuff:
	if ( toDepth >= 0 ) {
		runtime.stack.length = toDepth + 1 ;
	}
}



function repeatElement( runtime , depth ) {
	var parent = runtime.stack[ depth - 1 ] ,
		k = parent.key ,
		v = runtime.stack[ depth ].value ,
		count = runtime.stack[ depth ].repeat ;

	while ( count -- ) {
		k -- ;
		parent.value[ k ] = v ;
	}
}



function increaseDepth( runtime ) {
	runtime.depth ++ ;
	runtime.stack[ runtime.depth ] = {} ;
}



function substituteMultiLine( object ) {
	var key , value ;

	if ( object instanceof Map ) {
		for ( [ key , value ] of object ) {
			if ( key instanceof MultiLine ) {
				object.delete( key ) ;
				key = key.construct() ;

				if ( value instanceof MultiLine ) {
					value = value.construct() ;
				}

				object.set( key , value ) ;
			}
			else if ( value instanceof MultiLine ) {
				value = value.construct() ;
				object.set( key , value ) ;
			}
		}
	}
}



function parseLineContent( str , runtime ) {
	/*
		Types of lines:
			- list entry (array) has a '-' after indentation
			- text lines has a '>' after indentation
			- properties (object) has a ':' somewhere after the key
			- in tag-mode implicit list entry (array) has a '[' after indentation
			- ??allow direct scalar values??
	*/

	// first, try meta header
	if ( str[ runtime.i ] === '[' && str[ runtime.i + 1 ] === '[' ) {
		if ( runtime.metaTagsParsed ) {
			throw new SyntaxError( "Unexpected meta tag: body section had already started (" + common.parsers.locationStr( runtime ) + ")" ) ;
		}

		parseMetaTag( str , runtime ) ;
		return ;
	}

	// so we have content for the first time
	if ( ! runtime.metaTagsParsed && runtime.depth === 0 ) {
		runtime.metaTagsParsed = true ;
		// We need to reset after eventual meta, because they are out of flow
		runtime.stack[ 0 ] = {} ;
		//runtime.stack[ 0 ].key = undefined ;
		//runtime.stack[ 0 ].siblingKeys = undefined ;

		if ( ! runtime.doctype && runtime.requiredDoctype ) {
			throw new Error( "Missing doctype, but required '" +
				( Array.isArray( runtime.requiredDoctype ) ? runtime.requiredDoctype.join( "' or '" ) : runtime.requiredDoctype ) + "'." ) ;
		}

		if ( typeof runtime.metaTagsHook === 'function' ) { runtime.metaTagsHook( runtime.meta.tags , runtime ) ; }
	}

	// parse content
	if ( str[ runtime.i ] === '-' ) {
		if ( ( runtime.depth === 0 || ( runtime.depth === 1 && runtime.hasSection ) ) && str[ runtime.i + 1 ] === '-' ) { //&& str[ runtime.i + 2 ] === '-' ) {
			parseSection( str , runtime ) ;
		}
		else {
			parseArrayElement( str , runtime ) ;
		}
	}
	else if ( str[ runtime.i ] === '<' && ( str[ runtime.i + 1 ] === ':' || str[ runtime.i + 1 ] === '<' ) ) {
		parseMapKey( str , runtime ) ;
	}
	else if ( str[ runtime.i ] === ':' && str[ runtime.i + 1 ] === '>' ) {
		parseMapValue( str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '>' ) {
		parseMultiLineString( str , runtime , str[ runtime.i + 1 ] === '>' ) ;
	}
	else if ( str[ runtime.i ] === '$' ) {
		if ( str[ runtime.i + 1 ] === '$' ) {
			if ( str[ runtime.i + 2 ] === '>' ) {
				parseMultiLineTemplateSentence( str , runtime , str[ runtime.i + 3 ] === '>' , true ) ;
			}
			/*
			else if ( str[ runtime.i + 2 ] === '%' && str[ runtime.i + 3 ] === '>' ) {
				parseMultiLineTemplateAtom( str , runtime , str[ runtime.i + 4 ] === '>' , true ) ;
			}
			*/
			else if ( str[ runtime.i + 2 ] === '=' ) {
				parseMultiLineExpression( str , runtime , true ) ;
			}
			else {
				parseMaybeKV( str , runtime ) ;
			}
		}
		else if ( str[ runtime.i + 1 ] === '>' ) {
			parseMultiLineTemplateSentence( str , runtime , str[ runtime.i + 2 ] === '>' ) ;
		}
		/*
		else if ( str[ runtime.i + 1 ] === '%' && str[ runtime.i + 2 ] === '>' ) {
			parseMultiLineTemplateAtom( str , runtime , str[ runtime.i + 3 ] === '>' ) ;
		}
		*/
		else if ( str[ runtime.i + 1 ] === '=' ) {
			parseMultiLineExpression( str , runtime ) ;
		}
		else {
			parseMaybeKV( str , runtime ) ;
		}
	}
	else if ( str[ runtime.i ] === '(' ) {
		parseAfterKey( '' , str , runtime ) ;
	}
	else if ( str[ runtime.i ] === '[' ) {
		parseTag( str , runtime ) ;
	}
	else {
		parseMaybeKV( str , runtime ) ;
	}
}



function parseSection( str , runtime ) {
	var end , count ;

	if ( str[ runtime.i + 2 ] !== '-' ) {
		throw new SyntaxError( "Not enough '-' in the begining of a section line, at least 3 are required (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	if ( runtime.depth ) {
		closeDepth( runtime , runtime.depth , 0 ) ;
		runtime.depth = 0 ;
	}

	runtime.hasSection = true ;
	runtime.i += 3 ;

	// Skip as many extra '-'
	while ( str[ runtime.i ] === '-' ) { runtime.i ++ ; }
	parseSpaces( str , runtime ) ;

	if ( runtime.i === runtime.iEndOfLine ) {
		// This is an array element section
		// Manage index/key
		if ( runtime.stack[ runtime.depth ].key === undefined ) {
			runtime.stack[ runtime.depth ].key = 0 ;
		}
		else {
			runtime.stack[ runtime.depth ].key ++ ;
		}

		setCurrentArray( runtime ) ;
	}
	else {
		end = runtime.iEndOfLine - 1 ;
		count = 0 ;
		while ( str[ end ] === '-' ) { end -- ; count ++ ; }

		if ( count < 3 ) {
			throw new SyntaxError( "Not enough '-' in the end of a named section line, at least 3 are required (" + common.parsers.locationStr( runtime ) + ")" ) ;
		}

		runtime.stack[ runtime.depth ].key = str.slice( runtime.i , end ).trim() ;
		setCurrentObject( runtime ) ;
	}

	increaseDepth( runtime ) ;
}



function parseArrayElement( str , runtime ) {
	var k , v , c , end ;

	runtime.i ++ ;

	// Manage index/key
	if ( runtime.stack[ runtime.depth ].key === undefined ) {
		k = runtime.stack[ runtime.depth ].key = 0 ;
	}
	else {
		k = ++ runtime.stack[ runtime.depth ].key ;
	}

	// If the parent is still undefined, now we know for sure that this is an array
	setCurrentArray( runtime ) ;
	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	// Check compact-list syntax
	if (
		( str[ runtime.i ] === '\t' && ( ++ runtime.i ) )
		|| ( str[ runtime.i ] === ' ' && str[ runtime.i + 1 ] === ' ' && str[ runtime.i + 2 ] === ' ' && str[ runtime.i + 3 ] !== ' ' && ( runtime.i += 3 ) )
	) {
		parseSpaces( str , runtime ) ;
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }

		nextItem( runtime ) ;
		depthManagement( runtime ) ;
		parseLineContent( str , runtime ) ;

		return ;
	}

	c = str.charCodeAt( runtime.i ) ;

	if ( c >= 0x30 && c <= 0x39 ) {
		// element repetition syntax
		for ( end = runtime.i + 1 ; end < runtime.iEndOfLine ; end ++ ) {
			c = str.charCodeAt( end ) ;

			if ( c >= 0x30 && c <= 0x39 ) {
				continue ;
			}

			if ( c === 0x78 && str[ end + 1 ] === ':' ) {
				// 'x' char
				runtime.stack[ runtime.depth ].repeat = parseInt( str.slice( runtime.i , end ) , 10 ) - 1 ;
				runtime.i = end + 2 ;
				k = runtime.stack[ runtime.depth - 1 ].key += runtime.stack[ runtime.depth ].repeat ;
			}

			break ;
		}
	}

	parseSpaces( str , runtime ) ;

	if ( runtime.i >= runtime.iEndOfLine ) { return ; }

	// /!\ What about operators for an array element?

	v = parseValue( str , runtime ) ;
	setParentArrayKV( k , v , runtime ) ;
}



function parseMapKey( str , runtime ) {
	var k , fold = false ;

	runtime.i ++ ;

	// If the parent is still undefined, now we know for sure that this is a Map
	setCurrentMap( runtime ) ;
	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	if ( str[ runtime.i ] === '<' ) {
		runtime.i ++ ;

		if ( str[ runtime.i ] === '<' ) {
			runtime.i ++ ;
			fold = true ;
		}

		if ( str[ runtime.i ] !== ':' ) {
			throw new SyntaxError( "Unexpected char '" + str[ runtime.i ] + "' after '<<' or '<<<' (" + common.parsers.locationStr( runtime ) + ")" ) ;
		}

		runtime.i ++ ;

		if ( runtime.i >= runtime.iEndOfLine ) {
			appendParentMapMultiLineK( '' , runtime , 'string' , fold , false ) ;
			return ;
		}

		if ( str[ runtime.i ] !== ' ' ) {
			throw new SyntaxError( "Expecting a space ' ' after the '<<:' or '<<<:' but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
		}

		runtime.i ++ ;

		if ( runtime.i >= runtime.iEndOfLine ) {
			appendParentMapMultiLineK( '' , runtime , 'string' , fold , false ) ;
			return ;
		}

		appendParentMapMultiLineK( str.slice( runtime.i , runtime.iEndOfLine ) , runtime , 'string' , fold , false ) ;
		return ;
	}

	runtime.i ++ ;

	if ( runtime.stack[ runtime.depth - 1 ].kvMode !== BEFORE_KEY && runtime.stack[ runtime.depth - 1 ].kvMode !== MULTILINE_VALUE ) {
		throw new SyntaxError( "Unexpected map key (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	// Check compact-list syntax
	if (
		( str[ runtime.i ] === '\t' && ( ++ runtime.i ) )
		|| ( str[ runtime.i ] === ' ' && str[ runtime.i + 1 ] === ' ' && str[ runtime.i + 2 ] !== ' ' && ( runtime.i += 2 ) )
	) {
		parseSpaces( str , runtime ) ;
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }

		nextItem( runtime ) ;
		depthManagement( runtime ) ;
		parseLineContent( str , runtime ) ;

		return ;
	}

	parseSpaces( str , runtime ) ;

	if ( runtime.i >= runtime.iEndOfLine ) { return ; }

	// /!\ What about operators for a map entry?

	k = parseValue( str , runtime ) ;
	setParentMapK( k , runtime ) ;
}



function parseMapValue( str , runtime ) {
	var v , fold = false ;

	runtime.i += 2 ;

	// If the parent is still undefined, now we know for sure that this is a Map
	setCurrentMap( runtime ) ;
	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	if ( str[ runtime.i ] === '>' ) {
		runtime.i ++ ;

		if ( str[ runtime.i ] === '>' ) {
			runtime.i ++ ;
			fold = true ;
		}

		if ( runtime.i >= runtime.iEndOfLine ) {
			appendParentMapMultiLineV( '' , runtime , 'string' , fold , false ) ;
			return ;
		}

		if ( str[ runtime.i ] !== ' ' ) {
			throw new SyntaxError( "Expecting a space ' ' after the ':>>' or ':>>>' but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
		}

		runtime.i ++ ;

		if ( runtime.i >= runtime.iEndOfLine ) {
			appendParentMapMultiLineV( '' , runtime , 'string' , fold , false ) ;
			return ;
		}

		appendParentMapMultiLineV( str.slice( runtime.i , runtime.iEndOfLine ) , runtime , 'string' , fold , false ) ;
		return ;
	}

	if ( runtime.stack[ runtime.depth - 1 ].kvMode !== BEFORE_VALUE && runtime.stack[ runtime.depth - 1 ].kvMode !== MULTILINE_KEY ) {
		throw new SyntaxError( "Unexpected map key (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	// Check compact-list syntax
	if (
		( str[ runtime.i ] === '\t' && ( ++ runtime.i ) )
		|| ( str[ runtime.i ] === ' ' && str[ runtime.i + 1 ] === ' ' && str[ runtime.i + 2 ] !== ' ' && ( runtime.i += 2 ) )
	) {
		parseSpaces( str , runtime ) ;
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }

		nextItem( runtime ) ;
		depthManagement( runtime ) ;
		parseLineContent( str , runtime ) ;

		return ;
	}

	parseSpaces( str , runtime ) ;

	if ( runtime.i >= runtime.iEndOfLine ) { return ; }

	// /!\ What about operators for a map value?

	v = parseValue( str , runtime ) ;
	setParentMapV( v , runtime ) ;
}



function parseMaybeKV( str , runtime ) {
	var k , v ;

	parseSpaces( str , runtime ) ;

	if ( str[ runtime.i ] === '"' ) {
		runtime.i ++ ;
		v = common.parsers.parseQuotedString( str , runtime ) ;
		parseSpaces( str , runtime ) ;

		if ( runtime.i >= runtime.iEndOfLine ) {
			// This is a string value
			setCurrentMultiLine( runtime , 'string' ) ;
			//runtime.depth ++ ;
			increaseDepth( runtime ) ;
			appendParentMultiLine( v , runtime ) ;
		}
		else if ( str[ runtime.i ] === ':' ) {
			k = v ;
			runtime.i ++ ;
			parseAfterKey( k , str , runtime ) ;
		}
		else {
			throw new SyntaxError( "Unexpected " + str[ runtime.i ] + " (" + common.parsers.locationStr( runtime ) + ")" ) ;
		}

		return ;
	}

	k = parseMaybeUnquotedKey( str , runtime ) ;

	if ( ! k ) {
		// This is a value, unquoted
		//if ( runtime.depth === 0 && runtime.stack[ runtime.depth ].value === undefined ) {
		if ( runtime.stack[ runtime.depth ].value === undefined ) {
			//console.log( "+++" , str.length , runtime.i , runtime.iEndOfLine , str[ runtime.i ] ) ;
			//if ( 'value' in runtime.stack[ runtime.depth ] ) { throw new SyntaxError( "Unexpected value (" + common.parsers.locationStr( runtime ) + ")" ) ; }
			v = parseValue( str , runtime ) ;
			runtime.stack[ runtime.depth ].value = v ;
			parentLink( runtime , runtime.depth ) ;
			//console.log( "---" , v , str.length , runtime.i , runtime.iEndOfLine , str[ runtime.i ] ) ;
		}
		else {
			// This is a string value, unquoted
			// Is this a bug? It's a multi-line string without introducer, and it's not supposed to be allowed
			v = common.parsers.parseUnquotedString( str , runtime ) ;
			//appendParentMultiLine( v , runtime ) ;

			//console.log( 'Maybe bug?' ) ;

			setCurrentMultiLine( runtime , 'string' ) ;
			//runtime.depth ++ ;
			increaseDepth( runtime ) ;
			appendParentMultiLine( v , runtime ) ;
		}
	}
	else {
		parseAfterKey( k , str , runtime ) ;
	}
}



function parseAfterKey( k , str , runtime ) {
	var op , v ;

	parseSpaces( str , runtime ) ;

	// If the parent is still undefined, now we know for sure that this is an object
	setCurrentObject( runtime ) ;
	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	if ( str[ runtime.i ] === '(' ) {
		// This is an operator
		op = parseOperator( str , runtime ) ;

		if ( ! op || treeOps.reservedOperators[ op ] ) { k = op + k ; }
		else { k = '(' + op + ')' + k ; }

		parseSpaces( str , runtime ) ;
	}

	runtime.stack[ runtime.depth - 1 ].key = k ;

	if ( runtime.stack[ runtime.depth - 1 ].siblingKeys ) { runtime.stack[ runtime.depth - 1 ].siblingKeys.push( k ) ; }
	else { runtime.stack[ runtime.depth - 1 ].siblingKeys = [ k ] ; }

	if ( runtime.i >= runtime.iEndOfLine ) { return ; }

	runtime.stack[ runtime.depth ] = {} ;

	// This is the easiest way to have include, it is prepended to the key
	if ( str[ runtime.i ] === '@' ) {
		// This is an include after a key
		op = parseInclude( str , runtime ) ;
		
		if ( str[ runtime.i ] === '"' ) { v = common.parsers.parseQuotedString( str , runtime ) ; }
		else { v = common.parsers.parseUnquotedString( str , runtime ) ; }

// /!\ TMP -------------------------------------------------------------------------------------------------------------------------------------------------
		console.log( "in parseAfterKey()" ) ;
		setParentObjectKRef( k , v , op === '@@' , runtime ) ;
		return ;
	}

	if ( ! op && treeOps.reservedKeyStart[ k[ 0 ] ] ) {
		// The key contains an operator mark, escape it by prepending an empty operator
		k = '()' + k ;
	}

	v = parseValue( str , runtime , true ) ;
	setParentObjectKV( k , v , runtime ) ;
}



function parseMultiLineString( str , runtime , fold ) {
	runtime.i ++ ;
	if ( fold ) { runtime.i ++ ; }

	// If the parent is still undefined, now we know for sure that this is a string
	setCurrentMultiLine( runtime , 'string' , fold ) ;
	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	if ( runtime.i >= runtime.iEndOfLine ) {
		appendParentMultiLine( '' , runtime ) ;
		return ;
	}

	if ( str[ runtime.i ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '>' or '>>', but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	runtime.i ++ ;

	if ( runtime.i >= runtime.iEndOfLine ) {
		appendParentMultiLine( '' , runtime ) ;
		return ;
	}

	appendParentMultiLine( str.slice( runtime.i , runtime.iEndOfLine ) , runtime ) ;
}



function parseMultiLineTemplateSentence( str , runtime , fold , applicable ) {
	runtime.i += 2 ;
	if ( fold ) { runtime.i ++ ; }
	if ( applicable ) { runtime.i ++ ; }

	// If the parent is still undefined, now we know for sure that this is a template
	setCurrentMultiLine( runtime , 'TemplateSentence' , fold , applicable ) ;
	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	if ( runtime.i >= runtime.iEndOfLine ) {
		appendParentMultiLine( '' , runtime ) ;
		return ;
	}

	if ( str[ runtime.i ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '$>', '$$>', '$>>' or '$$>>', but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	runtime.i ++ ;

	if ( runtime.i >= runtime.iEndOfLine ) {
		appendParentMultiLine( '' , runtime ) ;
		return ;
	}

	appendParentMultiLine( str.slice( runtime.i , runtime.iEndOfLine ) , runtime ) ;
}



/*
function parseMultiLineTemplateAtom( str , runtime , fold , applicable ) {
	runtime.i += 3 ;
	if ( fold ) { runtime.i ++ ; }
	if ( applicable ) { runtime.i ++ ; }

	// If the parent is still undefined, now we know for sure that this is a template atom
	setCurrentMultiLine( runtime , 'TemplateAtom' , fold , applicable ) ;
	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	if ( runtime.i >= runtime.iEndOfLine ) {
		appendParentMultiLine( '' , runtime ) ;
		return ;
	}

	if ( str[ runtime.i ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '$%>', '$$%>', '$%>>' or '$$%>>', but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	runtime.i ++ ;

	if ( runtime.i >= runtime.iEndOfLine ) {
		appendParentMultiLine( '' , runtime ) ;
		return ;
	}

	appendParentMultiLine( str.slice( runtime.i , runtime.iEndOfLine ) , runtime ) ;
}
*/



function parseMultiLineExpression( str , runtime , applicable ) {
	runtime.i += 2 ;
	if ( applicable ) { runtime.i ++ ; }

	// If the parent is still undefined, now we know for sure that this is a string
	// Expression are always folded
	setCurrentMultiLine( runtime , 'Expression' , true , applicable , runtime.operators ) ;
	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	if ( runtime.i >= runtime.iEndOfLine ) {
		appendParentMultiLine( '' , runtime ) ;
		return ;
	}

	if ( str[ runtime.i ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '$=' or '$$=', but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	runtime.i ++ ;

	if ( runtime.i >= runtime.iEndOfLine ) {
		appendParentMultiLine( '' , runtime ) ;
		return ;
	}

	appendParentMultiLine( str.slice( runtime.i , runtime.iEndOfLine ) , runtime ) ;
}



function parseTag( str , runtime ) {
	var k , v , c , start , bracketLevel = 1 , found = false ;

	// If the parent is still undefined, now we know for sure that this is a TagContainer
	setCurrentTagContainer( runtime ) ;
	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	runtime.i ++ ;

	for ( start = runtime.i ; runtime.i < runtime.iEndOfLine ; runtime.i ++ ) {
		c = str.charCodeAt( runtime.i ) ;

		if ( c === 0x5b ) {
			// [ opening bracket, increment bracket-level, or parseMetaTag
			bracketLevel ++ ;
		}
		else if ( c === 0x5d ) {
			// ] closing bracket, closing the tag if bracket-level is decreased to 0
			bracketLevel -- ;

			if ( ! bracketLevel ) {
				runtime.stack[ runtime.depth ].tag =
					str.slice( start , runtime.i ).trim()
					.match( /^([^ ]*)(?: +([^]*))?$/ )
					.slice( 1 , 3 )
					// This is a regular Tag, push false as the third array element
					.concat( false , runtime.lineNumber , runtime.nextTagId ++ ) ;

				runtime.i ++ ;
				found = true ;
				break ;
			}
		}
		else if ( c === 0x22 ) {
			// double quote = start of a string
			// Do not store the quoted string: we just want to go at the end of the tag!
			runtime.i ++ ;
			common.parsers.skipQuotedString( str , runtime ) ;
			runtime.i -- ; // because the loop will ++ it anyway
		}
	}

	if ( ! found ) {
		// nothing found
		throw new SyntaxError( "Unexpected end of line, expecting a ']' sign (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}


	// Manage index/key
	if ( runtime.stack[ runtime.depth - 1 ].key === undefined ) {
		k = runtime.stack[ runtime.depth - 1 ].key = 0 ;
	}
	else {
		k = ++ runtime.stack[ runtime.depth - 1 ].key ;
	}

	if ( runtime.i >= runtime.iEndOfLine ) { return ; }

	parseSpaces( str , runtime ) ;
	v = parseValue( str , runtime ) ;

	setParentTagContainerKV( k , v , runtime ) ;
}



function parseMetaTag( str , runtime ) {
	var v , c , start , bracketLevel = 1 , found = false , tagAndAttributes , error ;
	//var k ;

	if ( runtime.depth ) {
		throw new Error( "Meta tag can only exist at top-level" ) ;
	}

	//runtime.depth ++ ;
	increaseDepth( runtime ) ;

	runtime.i += 2 ;

	for ( start = runtime.i ; runtime.i < runtime.iEndOfLine ; runtime.i ++ ) {
		c = str.charCodeAt( runtime.i ) ;

		if ( c === 0x5b ) {
			// [ opening bracket, increment bracket-level
			bracketLevel ++ ;
		}
		else if ( c === 0x5d ) {
			// ] closing bracket, closing the tag if bracket-level is decreased to 0
			bracketLevel -- ;

			if ( ! bracketLevel ) {
				if ( str.charCodeAt( runtime.i + 1 ) !== 0x5d ) {
					throw new SyntaxError( "Expecting a closing meta tag ']]' sign (" + common.parsers.locationStr( runtime ) + ")" ) ;
				}

				tagAndAttributes = str.slice( start , runtime.i ).trim()
				.match( /^([^ ]*)(?: +([^]*))?$/ )
				.slice( 1 , 3 )
				// This is a Meta-Tag, push true as the third array element
				.concat( true , runtime.lineNumber , runtime.nextTagId ++ ) ;

				// [[doctype]] is a special meta, immediately processed by Kung-Fig
				if ( tagAndAttributes[ 0 ] === 'doctype' ) {
					runtime.doctype = tagAndAttributes[ 1 ] ;

					if ( runtime.requiredDoctype && ( Array.isArray( runtime.requiredDoctype ) ?
						runtime.requiredDoctype.indexOf( runtime.doctype ) === -1 :
						runtime.requiredDoctype !== runtime.doctype ) ) {
						error = new Error( "Doctype mismatch, required '" +
							( Array.isArray( runtime.requiredDoctype ) ? runtime.requiredDoctype.join( "' or '" ) : runtime.requiredDoctype ) +
							"' but got '" + runtime.doctype + "'." ) ;
						error.code = 'doctypeMismatch' ;
						throw error ;
					}
				}

				runtime.stack[ runtime.depth ].tag = tagAndAttributes ;

				runtime.i += 2 ;
				found = true ;
				break ;
			}
		}
		else if ( c === 0x22 ) {
			// double quote = start of a string
			// Do not store the quoted string: we just want to go at the end of the tag!
			runtime.i ++ ;
			common.parsers.skipQuotedString( str , runtime ) ;
			runtime.i -- ; // because the loop will ++ it anyway
		}
	}

	if ( ! found ) { // nothing found
		throw new SyntaxError( "Unexpected end of line, expecting a ']]' sign (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}


	// Manage index/key
	if ( runtime.stack[ runtime.depth - 1 ].key === undefined ) {
		runtime.stack[ runtime.depth - 1 ].key = 0 ;
	}
	else {
		runtime.stack[ runtime.depth - 1 ].key ++ ;
	}

	if ( runtime.i >= runtime.iEndOfLine ) { return ; }

	parseSpaces( str , runtime ) ;
	v = parseValue( str , runtime ) ;

	//console.log( "meta value:" , v ) ;

	//setParentTagContainerKV( k , v , runtime ) ;

	runtime.stack[ runtime.depth ].value = v ;
}



// Skip spaces
function parseSpaces( str , runtime ) {
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}



function setCurrentMultiLine( runtime , multiLineType , fold , applicable , options ) {
	var current = runtime.stack[ runtime.depth ] ;
	var type = kfgCommon.containerType( current.value ) ;

	if ( type === undefined ) {
		current.value = new MultiLine( multiLineType , fold , applicable , options ) ;
		parentLink( runtime , runtime.depth ) ;
	}
	else if ( type !== 'MultiLine' ) {
		throw new SyntaxError( "Unexpected multi-line part (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function appendParentMultiLine( v , runtime ) {
	var parent = runtime.stack[ runtime.depth - 1 ] ;

	if ( kfgCommon.containerType( parent.value ) === 'MultiLine' ) {
		parent.value.lines.push( v ) ;
	}
	else {
		throw new SyntaxError( "Unexpected multi-line part (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function setCurrentArray( runtime ) {
	var current = runtime.stack[ runtime.depth ] ;

	var type = kfgCommon.containerType( current.value ) ;

	if ( type === undefined ) {
		current.value = [] ;
		parentLink( runtime , runtime.depth ) ;
	}
	else if ( type !== 'Array' ) {
		throw new SyntaxError( "Unexpected array element (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function setParentArrayKV( k , v , runtime ) {
	var parent = runtime.stack[ runtime.depth - 1 ] ,
		count = 1 + ( runtime.stack[ runtime.depth ].repeat || 0 ) ;

	if ( kfgCommon.containerType( parent.value ) === 'Array' ) {
		runtime.stack[ runtime.depth ].value = v ;

		while ( count -- ) {
			parent.value[ k ] = v ;
			k -- ;
		}
	}
	else {
		throw new SyntaxError( "Unexpected array element (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



const BEFORE_KEY = 0 ;
const MULTILINE_KEY = 1 ;
const BEFORE_VALUE = 2 ;
const MULTILINE_VALUE = 3 ;

function setCurrentMap( runtime ) {
	var current = runtime.stack[ runtime.depth ] ;
	var type = kfgCommon.containerType( current.value ) ;

	if ( type === undefined ) {
		current.value = new Map() ;
		current.kvMode = BEFORE_KEY ;
		parentLink( runtime , runtime.depth ) ;
	}
	else if ( type !== 'Map' ) {
		throw new SyntaxError( "Unexpected map entry (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function setParentMapK( k , runtime ) {
	var parent = runtime.stack[ runtime.depth - 1 ] ;

	if ( kfgCommon.containerType( parent.value ) === 'Map' && ( parent.kvMode === BEFORE_KEY || parent.kvMode === MULTILINE_VALUE ) ) {
		parent.kvMode = BEFORE_VALUE ;
		parent.key = k ;
		runtime.stack[ runtime.depth ].value = k ;
	}
	else {
		throw new SyntaxError( "Unexpected map key (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function setParentMapV( v , runtime ) {
	var parent = runtime.stack[ runtime.depth - 1 ] ;

	if ( kfgCommon.containerType( parent.value ) === 'Map' && ( parent.kvMode === BEFORE_VALUE || parent.kvMode === MULTILINE_KEY ) ) {
		parent.kvMode = BEFORE_KEY ;
		parent.value.set( parent.key , v ) ;
		runtime.stack[ runtime.depth ].value = v ;
	}
	else {
		throw new SyntaxError( "Unexpected map value (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function appendParentMapMultiLineK( k , runtime , multiLineType , fold , applicable , options ) {
	var parent = runtime.stack[ runtime.depth - 1 ] ;

	if ( kfgCommon.containerType( parent.value ) !== 'Map' || parent.kvMode === BEFORE_VALUE ) {
		throw new SyntaxError( "Unexpected multi-line map key part (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	if ( parent.kvMode === BEFORE_KEY || parent.kvMode === MULTILINE_VALUE ) {
		parent.kvMode = MULTILINE_KEY ;
		parent.key = new MultiLine( multiLineType , fold , applicable , options ) ;
		parent.hasInnerMultiLine = true ;
	}

	parent.key.lines.push( k ) ;
}



function appendParentMapMultiLineV( v , runtime , multiLineType , fold , applicable , options ) {
	var currentValue ,
		parent = runtime.stack[ runtime.depth - 1 ] ;

	if ( kfgCommon.containerType( parent.value ) !== 'Map' || parent.kvMode === BEFORE_KEY ) {
		throw new SyntaxError( "Unexpected multi-line map value part (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	if ( parent.kvMode === BEFORE_VALUE || parent.kvMode === MULTILINE_KEY ) {
		parent.kvMode = MULTILINE_VALUE ;
		currentValue = new MultiLine( multiLineType , fold , applicable , options ) ;
		parent.value.set( parent.key , currentValue ) ;
		parent.hasInnerMultiLine = true ;
	}
	else {
		currentValue = parent.value.get( parent.key ) ;
	}

	currentValue.lines.push( v ) ;
}



function setCurrentObject( runtime ) {
	var current = runtime.stack[ runtime.depth ] ;
	var type = kfgCommon.containerType( current.value ) ;

	if ( type === undefined ) {
		current.value = {} ;
		parentLink( runtime , runtime.depth ) ;
	}
	else if ( type !== 'Object' ) {
		throw new SyntaxError( "Unexpected key/value pair (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function setParentObjectKV( k , v , runtime ) {
	var parent = runtime.stack[ runtime.depth - 1 ] ;

	if ( kfgCommon.containerType( parent.value ) === 'Object' ) {
		parent.value[ k ] = v ;
		runtime.stack[ runtime.depth ].value = v ;
	}
	else {
		throw new SyntaxError( "Unexpected key/value pair (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function setParentObjectKRef( k , reference , required , runtime ) {
	var parent = runtime.stack[ runtime.depth - 1 ] ;

	if ( kfgCommon.containerType( parent.value ) === 'Object' ) {
		parent.value[ k ] = null ;
		runtime.stack[ runtime.depth ].value = null ;
		runtime.meta.addReference( parent.value , parent.key , runtime.directory , reference , required ) ;
	}
	else {
		throw new SyntaxError( "Unexpected key/value pair (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function setCurrentTagContainer( runtime ) {
	var current = runtime.stack[ runtime.depth ] ;
	var type = kfgCommon.containerType( current.value ) ;

	if ( type === undefined ) {
		current.value = new TagContainer() ;
		parentLink( runtime , runtime.depth ) ;
	}
	else if ( type !== 'TagContainer' ) {
		throw new SyntaxError( "Unexpected tag (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function setParentTagContainerKV( k , v , runtime ) {
	var parent = runtime.stack[ runtime.depth - 1 ] ;

	if ( kfgCommon.containerType( parent.value ) === 'TagContainer' ) {
		parent.value.children[ k ] = v ;
		runtime.stack[ runtime.depth ].value = v ;
	}
	else {
		throw new SyntaxError( "Unexpected tag (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}
}



function parentLink( runtime , depth ) {
	var current , parent , parentTarget ;

	if ( depth > 0 ) {
		current = runtime.stack[ depth ] ;
		parent = runtime.stack[ depth - 1 ] ;
		parentTarget = kfgCommon.getTarget( parent.value ) ;

		if ( parentTarget && typeof parentTarget === 'object' ) {
			if ( parentTarget instanceof Map ) {
				if ( parent.kvMode === BEFORE_KEY || parent.kvMode === MULTILINE_KEY ) {
					parent.key = current.value ;
					parent.kvMode = BEFORE_VALUE ;
				}
				else {
					parentTarget.set( parent.key , current.value ) ;
					parent.kvMode = BEFORE_KEY ;
				}

				if ( current.value instanceof MultiLine ) {
					// Back-propagate the multi-line flag
					parent.hasInnerMultiLine = true ;
				}
			}
			else {
				parentTarget[ runtime.stack[ depth - 1 ].key ] = runtime.stack[ depth ].value ;
			}
		}
	}
}



function parseMaybeUnquotedKey( str , runtime ) {
	var j , v ;

	// It should not start by an instanceof
	if ( str[ runtime.i ] === '<' ) { return ; }

	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ ) {
		if ( str[ j ] === ':' ) {
			v = str.slice( runtime.i , j ).trim() ;
			runtime.i = j + 1 ;
			return v ;
		}
	}
}



function parseIntroducedString( str , runtime ) {
	var v ;

	if ( runtime.i >= runtime.iEndOfLine ) { return '' ; }

	if ( str[ runtime.i ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '>', but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	runtime.i ++ ;

	v = str.slice( runtime.i , runtime.iEndOfLine ) ;

	runtime.i = runtime.iEndOfLine ;

	return v ;
}



function parseExpression( str , runtime , applicable ) {
	var v ;

	if ( runtime.i >= runtime.iEndOfLine ) {
		throw new SyntaxError( "Unexpected end of line, expecting an expression (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	v = Expression.parseFromKfg( str , runtime ) ;

	if ( applicable ) {
		v.__isDynamic__ = false ;
		v.__isApplicable__ = true ;
	}

	runtime.i = runtime.iEndOfLine ;

	return v ;
}



function parseIntroducedTemplateSentence( str , runtime , applicable ) {
	var v ;

	if ( runtime.i >= runtime.iEndOfLine ) { return TemplateSentence.create( '' ) ; }

	if ( str[ runtime.i ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '$>' or '$$>', but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	runtime.i ++ ;

	v = TemplateSentence.create( str.slice( runtime.i , runtime.iEndOfLine ) ) ;

	if ( applicable ) {
		v.__isDynamic__ = false ;
		v.__isApplicable__ = true ;
	}

	runtime.i = runtime.iEndOfLine ;

	return v ;
}



/*
function parseIntroducedTemplateAtom( str , runtime , applicable ) {
	var v ;

	if ( runtime.i >= runtime.iEndOfLine ) { return TemplateAtom.create( '' ) ; }

	if ( str[ runtime.i ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '$%>' or '$$%>', but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	runtime.i ++ ;

	v = TemplateAtom.parse( str.slice( runtime.i , runtime.iEndOfLine ) ) ;

	if ( applicable ) {
		v.__isDynamic__ = false ;
		v.__isApplicable__ = true ;
	}

	runtime.i = runtime.iEndOfLine ;

	return v ;
}
*/



function parseOperator( str , runtime ) {
	var c , op , j ;

	runtime.i ++ ;

	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ ) {
		c = str.charCodeAt( j ) ;

		if ( c === 0x29 ) {
			// closing parenthesis
			op = str.slice( runtime.i , j ).trim() ;
			runtime.i = j + 1 ;
			return op ;
		}
	}

	throw new SyntaxError( "Unexpected end of line, expecting a closing parenthesis (" + common.parsers.locationStr( runtime ) + ")" ) ;
}



function parseInstanceOf( str , runtime , isDynamic = false , isApplicable = false ) {
	var c , j ;

	runtime.i ++ ;

	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ ) {
		c = str.charCodeAt( j ) ;

		if ( c === 0x3e ) { // > greater than sign, closing the instanceOf
			runtime.stack[ runtime.depth ].instanceOf = {
				instanceOf: str.slice( runtime.i , j ).trim() ,
				isDynamic: isDynamic ,
				isApplicable: isApplicable
			} ;
			runtime.i = j + 1 ;
			return ;
		}
	}

	throw new SyntaxError( "Unexpected end of line, expecting a 'greater-than' sign (" + common.parsers.locationStr( runtime ) + ")" ) ;
}



function parseInclude( str , runtime ) {
	runtime.i ++ ;

	if ( str[ runtime.i ] === '@' ) {
		runtime.i ++ ;
		return '@@' ;
	}

	return '@' ;
}



function parseValue( str , runtime , noInclude , afterInstanceOf ) {
	var c , v , op ;

	c = str.charCodeAt( runtime.i ) ;

	if ( c >= 0x30 && c <= 0x39 ) {
		// digit
		return common.parsers.parseNumber( str , runtime ) ;
	}
	else if ( c === 0x3c && ! afterInstanceOf )	{
		// <   lesser-than sign: this introduce an instanceOf
		parseInstanceOf( str , runtime ) ;
		parseSpaces( str , runtime ) ;

		if ( runtime.i >= runtime.iEndOfLine ) { return ; }

		return parseValue( str , runtime , noInclude , true ) ;
	}
	else if ( c === 0x40 && ! noInclude ) {
		// @ sign: this introduce an include, as a stand-alone value
		op = parseInclude( str , runtime ) ;
		v = {} ;

		if ( str[ runtime.i ] === '"' ) { v[ op ] = common.parsers.parseQuotedString( str , runtime ) ; }
		else { v[ op ] = common.parsers.parseUnquotedString( str , runtime ) ; }
		
// /!\ TMP -------------------------------------------------------------------------------------------------------------------------------------------------
		console.log( "in parseValue()" , runtime.stack ) ;
		let parent = runtime.stack[ runtime.depth - 1 ] ;

		if ( parent ) {
			runtime.meta.addReference( parent.value , parent.key , runtime.directory , v[ op ] , op === '@@' ) ;
		}
		else {
			runtime.meta.addReference( null , null , runtime.directory , v[ op ] , op === '@@') ;
		}

		return v ;
	}

	switch ( c ) {
		case 0x2d :	// - minus
			c = str.charCodeAt( runtime.i + 1 ) ;
			if ( c >= 0x30 && c <= 0x39 ) {
				// digit
				return common.parsers.parseNumber( str , runtime ) ;
			}

			v = common.parsers.parseUnquotedString( str , runtime ) ;
			if ( v in common.constants ) { v = common.constants[ v ] ; }
			return v ;

		case 0x22 :	// "   double-quote: this is a string
			runtime.i ++ ;
			return common.parsers.parseQuotedString( str , runtime ) ;

		case 0x3e :	// >   greater-than: this is a string
			runtime.i ++ ;
			return parseIntroducedString( str , runtime ) ;

		case 0x24 :	// $   dollar: maybe a TemplateSentence, TemplateAtom, a Ref or an Expression
			c = str.charCodeAt( runtime.i + 1 ) ;
			if ( c === 0x3e ) { // >
				runtime.i += 2 ;
				return parseIntroducedTemplateSentence( str , runtime ) ;
			}
			else if ( c === 0x22 ) { // "
				runtime.i += 2 ;
				return TemplateSentence.parseFromKfg( str , runtime ) ;
			}
			else if ( c === 0x3d ) { // =
				runtime.i += 2 ;
				return parseExpression( str , runtime ) ;
			}
			else if ( c === 0x3c && ! afterInstanceOf )	{
				// <   lesser-than sign: this introduce a DynamicInstance
				runtime.i ++ ;
				parseInstanceOf( str , runtime , true ) ;
				parseSpaces( str , runtime ) ;

				if ( runtime.i >= runtime.iEndOfLine ) { return ; }

				return parseValue( str , runtime , noInclude , true ) ;
			}
			else if ( c === 0x24 ) { // $
				c = str.charCodeAt( runtime.i + 2 ) ;
				if ( c === 0x3e ) { // >
					runtime.i += 3 ;
					return parseIntroducedTemplateSentence( str , runtime , true ) ;
				}
				else if ( c === 0x22 ) { // "
					runtime.i += 3 ;
					return TemplateSentence.parseFromKfg( str , runtime , true ) ;
				}
				else if ( c === 0x3d ) { // =
					runtime.i += 3 ;
					return parseExpression( str , runtime , true ) ;
				}
				else if ( c === 0x3c && ! afterInstanceOf )	{
					// <   lesser-than sign: this introduce a DynamicInstance
					runtime.i += 2 ;
					parseInstanceOf( str , runtime , false , true ) ;
					parseSpaces( str , runtime ) ;

					if ( runtime.i >= runtime.iEndOfLine ) { return ; }

					return parseValue( str , runtime , noInclude , true ) ;
				}
				/*
				else if ( c === 0x25 ) {
					// % (template atom)
					c = str.charCodeAt( runtime.i + 3 ) ;
					if ( c === 0x3e ) { // >
						runtime.i += 4 ;
						return parseIntroducedTemplateAtom( str , runtime , true ) ;
					}
					else if ( c === 0x22 ) { // "
						runtime.i += 4 ;
						return TemplateAtom.parseFromKfg( str , runtime , true ) ;
					}

					runtime.i ++ ;
					return Ref.parseFromKfg( str , runtime , true ) ;

				}
				*/

				runtime.i ++ ;
				return Ref.parseFromKfg( str , runtime , true ) ;

			}
			/*
			else if ( c === 0x25 ) {
				// % (template atom)
				c = str.charCodeAt( runtime.i + 2 ) ;
				if ( c === 0x3e ) { // >
					runtime.i += 3 ;
					return parseIntroducedTemplateAtom( str , runtime ) ;
				}
				else if ( c === 0x22 ) { // "
					runtime.i += 3 ;
					return TemplateAtom.parseFromKfg( str , runtime ) ;
				}

				runtime.i ++ ;
				return Ref.parseFromKfg( str , runtime ) ;

			}
			*/

			//runtime.i ++ ;
			return Ref.parseFromKfg( str , runtime ) ;

		default :
			v = common.parsers.parseUnquotedString( str , runtime ) ;
			if ( v in common.constants ) { v = common.constants[ v ] ; }
			return v ;
	}
}



function construct( runtime , depth ) {
	var parentTarget = null , parentKey , v ;

	if ( depth > 0 ) {
		parentTarget = kfgCommon.getTarget( runtime.stack[ depth - 1 ].value ) ;
		parentKey = runtime.stack[ depth - 1 ].key ;

		if ( parentTarget && typeof parentTarget === 'object' ) {
			v = parentTarget[ parentKey ] ;
		}
		else {
			parentTarget = null ;
			v = runtime.stack[ depth ].value ;
		}
	}
	else {
		v = runtime.stack[ depth ].value ;
	}

	var { instanceOf , isDynamic , isApplicable } = runtime.stack[ depth ].instanceOf ;

	if ( builtin[ instanceOf ] ) {
		try {
			if ( isDynamic || isApplicable ) {
				v = new DynamicInstance( builtin[ instanceOf ] , v , instanceOf ) ;
				v.__isDynamic__ = isDynamic ;
				v.__isApplicable__ = isApplicable ;
			}
			else {
				v = builtin[ instanceOf ]( v , runtime.stack[ depth ].siblingKeys ) ;
			}
		}
		catch ( error ) {
			throw new SyntaxError(
				"Cannot construct '" + instanceOf + "' with those data (" + common.parsers.locationStr( runtime ) +
				"), constructor error: " + error
			) ;
		}
	}
	else if ( typeof runtime.classes[ instanceOf ] === 'function' ) {
		try {
			if ( isDynamic || isApplicable ) {
				v = new DynamicInstance( runtime.classes[ instanceOf ] , v , instanceOf ) ;
				v.__isDynamic__ = isDynamic ;
				v.__isApplicable__ = isApplicable ;
			}
			else {
				v = runtime.classes[ instanceOf ]( v , runtime.stack[ depth ].siblingKeys ) ;
			}
		}
		catch ( error ) {
			//console.log( error ) ;
			throw new SyntaxError(
				"Cannot construct custom '" + instanceOf + "' with those data (" + common.parsers.locationStr( runtime ) +
				"), constructor error: " + error
			) ;
		}
	}
	else {
		throw new SyntaxError( "Don't know how to construct '" + instanceOf + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	if ( parentTarget ) { parentTarget[ parentKey ] = v ; }
	else { runtime.stack[ depth ].value = v ; }
}



function constructTag( runtime , depth ) {
	var tag , attributes , parentTarget = null , parentKey , v , isMetaTag , line , tagId , userTags ;

	tag = runtime.stack[ depth ].tag[ 0 ] ;
	attributes = runtime.stack[ depth ].tag[ 1 ] || '' ;
	isMetaTag = !! runtime.stack[ depth ].tag[ 2 ] ;
	line = runtime.stack[ depth ].tag[ 3 ] ;
	tagId = runtime.stack[ depth ].tag[ 4 ] ;

	userTags = runtime[ isMetaTag ? 'metaTags' : 'tags' ] ;

	if ( isMetaTag ) {
		parentTarget = runtime.meta.tags.children ;
		parentKey = runtime.stack[ depth - 1 ].key ;
		v = runtime.stack[ depth ].value ;

		/*
		console.log( "\n>>>>>>" ) ;
		console.log( parentTarget , parentKey , v ) ;
		console.log( runtime ) ;
		console.log( "<<<<<<\n" ) ;
		//*/
	}
	else if ( depth > 0 ) {
		parentTarget = kfgCommon.getTarget( runtime.stack[ depth - 1 ].value ) ;
		parentKey = runtime.stack[ depth - 1 ].key ;

		if ( parentTarget && typeof parentTarget === 'object' ) {
			v = parentTarget[ parentKey ] ;
		}
		else {
			parentTarget = null ;
			v = runtime.stack[ depth ].value ;
		}
	}
	else {
		v = runtime.stack[ depth ].value ;
	}


	if ( typeof userTags[ tag ] === 'function' ) {
		try {
			v = userTags[ tag ]( tag , attributes , v , true , runtime ) ;
		}
		catch ( error ) {
			//console.log( error ) ;
			throw new SyntaxError(
				"Cannot construct custom tag '" + tag + "' with those data (" + common.parsers.locationStr( runtime , line ) +
				"), tag constructor error: " + error
			) ;
		}
	}
	else {
		try {
			v = new Tag( tag , attributes , v , true , runtime ) ;
		}
		catch ( error ) {
			throw new SyntaxError(
				"Cannot construct tag '" + tag + "' with those data (" + common.parsers.locationStr( runtime , line ) +
				"), tag constructor error: " + error
			) ;
		}
	}

	// Add the file and line number to the tag
	v.line = line ;
	v.file = runtime.file ;
	v.masterFile = runtime.masterFile ;
	v.relPath = runtime.relPath ;
	v.uid = hash.hashKey( v.relPath + ':' + tagId ) ;

	// Link the content TagContainer to the current tag
	if ( v.content instanceof TagContainer ) { v.content.tag = v ; }

	// Link the current tag to its parent container
	if ( depth > 0 && runtime.stack[ depth - 1 ].value instanceof TagContainer ) {
		v.parent = runtime.stack[ depth - 1 ].value ;
	}

	if ( parentTarget ) {
		parentTarget[ parentKey ] = v ;
	}
	else {
		runtime.stack[ depth ].value = v ;
	}
}



var builtin = {} ;
module.exports.builtin = builtin ;

builtin.DepthLimit = builtin.depthLimit = () => DepthLimit ;
builtin.Object = builtin.object = v => {
	var o , entry , type = kfgCommon.containerType( v ) ;
	if ( type === 'Object' ) { return v ; }

	o = {} ;
	if ( type === 'Map' ) {
		for ( entry of v ) { o[ entry[ 0 ] ] = entry[ 1 ] ; }
	}
	return o ;
} ;
builtin.Array = builtin.array = v => kfgCommon.containerType( v ) === 'Array' ? v : [] ;
builtin.Map = builtin.map = v => {
	var o , key , type = kfgCommon.containerType( v ) ;
	if ( type === 'Map' ) { return v ; }

	if ( type === 'Object' ) {
		o = new Map() ;
		for ( key in v ) { o.set( key , v[ key ] ) ; }
		return o ;
	}
	else if ( type === 'Array' ) {
		return new Map( v ) ;
	}

	return new Map() ;

} ;
builtin.OrderedObject = builtin.orderedObject = ( v , keys ) => new OrderedObject( v , keys ) ;
builtin.TagContainer = builtin.tagContainer = v => kfgCommon.containerType( v ) === 'TagContainer' ? v : new TagContainer( v ) ;
builtin.Ref = builtin.ref = v => kfgCommon.containerType( v ) === 'Ref' ? v : new Ref( v ) ;
builtin.Expression = builtin.expression = v => kfgCommon.containerType( v ) === 'Expression' ? v : new Expression( v ) ;
builtin.DynamicInstance = builtin.dynamicInstance = v => kfgCommon.containerType( v ) === 'DynamicInstance' ? v : new DynamicInstance( v ) ;
builtin.Sentence = builtin.sentence =
builtin.TemplateSentence = builtin.templateSentence = v => kfgCommon.containerType( v ) === 'TemplateSentence' ? v : new TemplateSentence( v ) ;
builtin.Atom = builtin.atom =
builtin.TemplateAtom = builtin.templateAtom = v => new TemplateAtom( v ) ;

/*
builtin.TemplateAtom = builtin.templateAtom = function templateAtom( v ) {
	if ( kfgCommon.containerType( v ) === 'TemplateAtom' ) { return v ; }

	var e = new TemplateAtom( v ) ;

	e.__isDynamic__ = !! v.__isDynamic__ ;
	e.__isApplicable__ = !! v.__isApplicable__ ;

	return e ;
} ;
*/

builtin.JSON = builtin.json = builtin.Json = v => JSON.parse( v ) ;
builtin.Bin16 = builtin.bin16 = builtin.bin = v => {
	if ( typeof v !== 'string' ) {
		if ( typeof v === 'number' && ! Number.isNaN( v ) && v > 0 && v !== -Infinity ) {
			v = '' + v ;
		}
		else {
			throw new Error( "Expecting a string, but got a " + typeof v ) ;
		}
	}

	return Buffer.from( v , 'hex' ) ;
} ;

builtin.Date = builtin.date = v => new Date( v ) ;

builtin.Regex = builtin.regex = builtin.RegExp = builtin.Regexp = builtin.regexp = v => {
	var delimiter , escDelimiter , partRegex , fixDelimiterRegex , match ;
	//var regex_ ;

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

	//regex_ = match[ 1 ].replace( fixDelimiterRegex , '$1' ) ;
	v = new RegExp( match[ 1 ].replace( fixDelimiterRegex , '$1' ) , match[ 3 ] ) ;

	Object.defineProperty( v , 'delimiter' , { value: delimiter } ) ;

	if ( typeof match[ 2 ] === 'string' ) {
		builtin.RegExp.toSubstitution( v , match[ 2 ].replace( fixDelimiterRegex , '$1' ) ) ;
	}
	else {
		builtin.RegExp.toExtended( v ) ;
	}

	/*
	console.log( "delimiter:" , delimiter ) ;
	console.log( "escDelimiter:" , escDelimiter ) ;
	console.log( "partRegex:" , partRegex ) ;
	console.log( "fixDelimiterRegex:" , fixDelimiterRegex ) ;
	console.log( "match:" , match ) ;
	console.log( "regex_:" , regex_ ) ;
	console.log( "substitution:" , v.substitution ) ;
	*/

	return v ;
} ;

builtin.RegExp.toExtended = function toExtended( regexp ) {
	Object.defineProperties( regexp , {
		match: { value: builtin.RegExp.match } ,
		filter: { value: builtin.RegExp.filter }
	} ) ;
} ;

builtin.RegExp.toSubstitution = function toSubstitution( regexp , substitution ) {
	builtin.RegExp.toExtended( regexp ) ;

	Object.defineProperties( regexp , {
		substitution: { value: substitution } ,
		substitute: { value: builtin.RegExp.substitute }
	} ) ;
} ;

builtin.RegExp.substitute = function substitute( str ) {
	str = '' + str ;
	return str.replace( this , this.substitution ) ;
} ;

builtin.RegExp.match = function match( str ) {
	str = '' + str ;
	return str.match( this ) ;
} ;

builtin.RegExp.filter = function filter( array ) {
	return array.filter( e => this.test( e ) ) ;
} ;

