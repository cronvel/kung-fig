/*
	Kung Fig

	Copyright (c) 2015 - 2021 Cédric Ronvel

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



const string = require( 'string-kit' ) ;


const Ref = require( 'kung-fig-ref' ) ;
const Expression = require( 'kung-fig-expression' ) ;
const DynamicInstance = require( 'kung-fig-dynamic-instance' ) ;
const template = require( 'kung-fig-template' ) ;
const TemplateSentence = template.Sentence ;



function stringify( v , options ) {
	if ( ! options || typeof options !== 'object' ) { options = {} ; }

	var meta ;

	var runtime = {
		str: '' ,
		compactList: false ,
		//include: '' ,
		depth: 0 ,
		preferQuotes: !! options.preferQuotes ,
		preferYesNo: !! options.preferYesNo ,
		preferOnOff: !! options.preferOnOff ,
		hasOperators: options.hasOperators === undefined ? true : !! options.hasOperators ,
		depthLimit: options.depthLimit || Infinity ,
		documentDepth: 0 ,
		documentDepthLimit: options.documentDepthLimit || 0 ,
		ancestors: [] ,	// useful?
		path: [] ,
		classes: options.classes instanceof Map ? options.classes : null
		//refs: new WeakMap()
	} ;

	if ( options.meta ) {
		stringifyMetaTagContainer( options.meta.tags , runtime ) ;
	}
	else if ( typeof v === 'object' && ( meta = kungFig.getMeta( options.original || v ) ) ) {
		stringifyMetaTagContainer( meta.tags , runtime ) ;
	}

	stringifyAnyType( v , runtime , options.propertyMask ) ;

	// Always add an extra '\n' at the end
	runtime.str += '\n' ;

	return runtime.str ;
}

module.exports = stringify ;



// Circular reference trouble, should require after the module.exports assignement
const kungFig = require( './kungFig.js' ) ;
const kfgCommon = require( './kfgCommon.js' ) ;
const common = require( 'kung-fig-common' ) ;
const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const builtin = require( './builtin.js' ) ;

// Hmm... tmp? Deprecated?
module.exports.stringifyQuotedString = common.stringifiers.stringifyQuotedString ;



function stringifyAnyType( v , runtime , propertyMask ) {
	// Should be detected upstream, because there are many edge case, like array element
	//if ( v === undefined ) { return ; }

	if ( v === null || v === undefined ) {
		if ( runtime.depth ) { runtime.str += ' ' ; }
		runtime.str += "null" ;
		return ;
	}

	switch ( typeof v ) {
		case 'boolean' :
			return stringifyBoolean( v , runtime ) ;
		case 'number' :
			return stringifyNumber( v , runtime ) ;
		case 'string' :
			return stringifyString( v , runtime ) ;
		case 'object' :
			return stringifyAnyObject( v , runtime , propertyMask ) ;
		case 'function' :
		default :
			if ( runtime.depth ) { runtime.str += ' ' ; }
			runtime.str += "null" ;
			return ;
	}

	//runtime.include = '' ;
}



function stringifyBoolean( v , runtime ) {
	if ( runtime.depth ) { runtime.str += ' ' ; }

	runtime.str +=
		runtime.preferYesNo ? ( v ? "yes" : "no" ) :
		runtime.preferOnOff ? ( v ? "on" : "off" ) :
		( v ? "true" : "false" ) ;
}



function stringifyNumber( v , runtime ) {
	if ( runtime.depth ) { runtime.str += ' ' ; }
	runtime.str += v ;
}



var keyNeedsQuotesRegex_ = /^[\s#<>(@[-]|[\x00-\x1f\x7f:"]|[\s]$/ ;



function stringifyKey( v , runtime ) {
	if ( keyNeedsQuotesRegex_.test( v ) ) {
		runtime.str += '"' + common.stringifiers.escapeString( v ) + '"' ;
	}
	else {
		runtime.str += v ;
	}
}



const numberRegex_ =  /^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?$/ ;

// Backslashes don't needs quotes, control chars always needs, untrimmed needs, top-level can't have a semicolon (ambigous with properties)
const stringNeedsQuotesRegex_         = /^[\s"<>(@$]|[\x00-\x1f\x7f"]|[\s"]$/ ;
const topLevelStringNeedsQuotesRegex_ = /^[\s"[<>(@$-]|[\x00-\x1f\x7f":]|[\s"]$/ ;

// String lines support anything, however we do not want to fool users with control chars
const stringLinesPreferQuotesRegex_ = /[\x00-\x08\x0b-\x1f\x7f]/ ;	// no control chars except newline and tab



function stringifyString( v , runtime , isTemplateSentence ) {
	var maybeDollar = '' ;

	if ( isTemplateSentence ) {
		if ( v.key ) {
			v = v.key ;
			maybeDollar = '$' ;
		}
		else {
			runtime.str += runtime.depth ? ' <Sentence>' : '<Sentence>' ;
			return ;
		}
	}

	if ( runtime.preferQuotes ) {
		return stringifyStringMaybeQuotes( v , runtime , maybeDollar ) ;
	}

	return stringifyStringMaybeStringLine( v , runtime , maybeDollar ) ;

}



function stringifyStringMaybeQuotes( v , runtime , maybeDollar ) {
	if ( runtime.depth ) { runtime.str += ' ' ; }

	/*
	if ( runtime.include ) {
		runtime.str += runtime.include ;

		if ( stringNeedsQuotesRegex_.test( v ) || maybeDollar ) {
			runtime.str += maybeDollar + common.stringifiers.stringifyQuotedString( v ) ;
		}
		else {
			runtime.str += v ;
		}

		return ;
	}
	*/

	if ( v in common.constants || numberRegex_.test( v ) ) {
		runtime.str += maybeDollar + '"' + v + '"' ;
	}
	else if ( ( runtime.depth ? stringNeedsQuotesRegex_ : topLevelStringNeedsQuotesRegex_ ).test( v ) || maybeDollar ) {
		runtime.str += maybeDollar + common.stringifiers.stringifyQuotedString( v ) ;
	}
	else {
		runtime.str += v ;
	}
}



function stringifyStringMaybeStringLine( v , runtime , maybeDollar ) {
	if ( runtime.depth ) { runtime.str += ' ' ; }

	/*
	if ( runtime.include ) {
		runtime.str += runtime.include ;

		if ( stringNeedsQuotesRegex_.test( v ) || maybeDollar ) {
			runtime.str += maybeDollar + '"' + common.stringifiers.escapeString( v ) + '"' ;
		}
		else {
			runtime.str += v ;
		}

		return ;
	}
	*/

	if ( v in common.constants || numberRegex_.test( v ) ) {
		runtime.str += maybeDollar + '> ' + v ;
	}
	else if ( stringLinesPreferQuotesRegex_.test( v ) ) {
		runtime.str += maybeDollar + common.stringifiers.stringifyQuotedString( v ) ;
	}
	else if ( ( runtime.depth ? stringNeedsQuotesRegex_ : topLevelStringNeedsQuotesRegex_ ).test( v ) || maybeDollar ) {
		runtime.str += stringifyStringLine( v , runtime , maybeDollar ) ;
	}
	else {
		runtime.str += v ;
	}
}



function stringifyStringLine( v , runtime , maybeDollar ) {
	if ( v.indexOf( '\n' ) === -1 ) {
		return maybeDollar + '> ' + v ;
	}

	var indent = '\t'.repeat( runtime.depth ) ;
	return ( runtime.depth ? '\n' + indent : '' ) + maybeDollar + '> ' + v.replace( /\n/g , '\n' + indent + maybeDollar + '> ' ) ;

}



function stringifyAnyObject( v , runtime , propertyMask ) {
	if ( runtime.depth >= runtime.depthLimit ) {
		// /!\ Not in the spec ATM...
		runtime.str += ' <depthLimit>' ;
		return ;
	}

	if ( Array.isArray( v ) ) {
		stringifyArray( v , runtime , propertyMask ) ;
	}
	else if ( v instanceof kfgCommon.OutputIncludeRef ) {
		runtime.str += runtime.depth ? ' ' + v.stringify() : v.stringify() ;
	}
	else if ( v instanceof TagContainer ) {
		stringifyTagContainer( v , runtime , propertyMask ) ;
	}
	else if ( v instanceof Ref ) {
		runtime.str += runtime.depth ? ' ' + v.stringify() : v.stringify() ;
	}
	else if ( v instanceof Expression ) {
		runtime.str += runtime.depth ? ' $= ' + v.stringify() : '$= ' + v.stringify() ;
	}
	else if ( v instanceof DynamicInstance ) {
		runtime.str += runtime.depth ? ' $<' : '$<' ;
		runtime.str += v.name + '>' ;
		if ( v.parameters !== undefined ) { stringifyAnyType( v.parameters , runtime , propertyMask ) ; }
	}
	else if ( v instanceof TemplateSentence ) {
		stringifyString( v , runtime , true ) ;
	}
	else {
		let proto = Object.getPrototypeOf( v ) ;
		let builtinType = builtin.prototypes.get( proto ) ;

		if ( builtinType?.stringify ) {
			runtime.str += ( runtime.depth ? ' ' : '' ) + '<' + builtinType.typeName + '>' ;
			v = builtinType.stringify( v ) ;
			if ( v !== undefined ) { stringifyAnyType( v , runtime , propertyMask ) ; }
		}
		else {
			let stringifier = runtime.classes && runtime.classes.get( proto ) ;

			if ( stringifier ) {
				runtime.str += ( runtime.depth ? ' ' : '' ) + '<' + stringifier.name + '>' ;
				v = stringifier( v ) ;
				if ( v !== undefined ) { stringifyAnyType( v , runtime , propertyMask ) ; }
			}
			else {
				stringifyStrictObject( v , runtime , propertyMask ) ;
			}
		}
	}
}



function stringifyArray( v , runtime , propertyMask ) {
	var itemIndent ,
		i = 0 ,
		iMax = v.length ;

	if ( ! iMax ) {
		runtime.str += runtime.depth ? ' <Array>' : '<Array>' ;
		return ;
	}

	itemIndent = '\n' + '\t'.repeat( runtime.depth ) ;

	runtime.depth ++ ;

	if ( runtime.compactList ) {
		runtime.str += '\t-' ;
		runtime.compactList = true ;
		stringifyAnyType( v[ i ] , runtime , propertyMask ) ;

		i = 1 ;
	}
	else if ( runtime.depth <= 1 ) {
		// avoid the first '\n' of a file
		runtime.str += '-' ;
		runtime.compactList = true ;
		stringifyAnyType( v[ i ] , runtime , propertyMask ) ;

		i = 1 ;
	}

	for ( ; i < iMax ; i ++ ) {
		runtime.str += itemIndent + '-' ;
		runtime.compactList = true ;
		stringifyAnyType( v[ i ] , runtime , propertyMask ) ;
	}

	runtime.depth -- ;
}



function stringifyStrictObject( v , runtime , propertyMask ) {
	var i , iMax , keys , first = true ;

	keys = Object.keys( v ) ;
	iMax = keys.length ;

	if ( runtime.hasOperators && keys.length === 1 && ( keys[ 0 ] === '@' || keys[ 0 ] === '@@' ) ) {
	//if ( keys.length === 1 && ( keys[ 0 ] === '@' || keys[ 0 ] === '@@' ) ) {
		runtime.str += ( runtime.depth ? ' ' : '' ) + keys[ 0 ]  ;
		stringifyKey( v[ keys[ 0 ] ] , runtime ) ;
		return ;
	}

	if ( runtime.documentDepthLimit && v.$ ) {
		if ( runtime.documentDepth >= runtime.documentDepthLimit ) {
			runtime.str += ' <depthLimit>' ;
			return ;
		}

		runtime.documentDepth ++ ;
	}

	var keyIndent = '\n' + '\t'.repeat( runtime.depth ) ;

	runtime.depth ++ ;

	for ( i = 0 ; i < iMax ; i ++ ) {
		if (
			// undefined -> no keys
			v[ keys[ i ] ] === undefined ||
			typeof v[ keys[ i ] ] === 'function' ||
			// skip keys not in the propertyMask, if any
			( propertyMask && typeof propertyMask === 'object' && ! propertyMask[ keys[ i ] ] )
		) {
			continue ;
		}

		if ( first ) {
			if ( runtime.compactList ) { runtime.str += "\t" ; }
			else if ( runtime.depth > 1 ) { runtime.str += keyIndent ; }	// avoid the first '\n' of a file
		}
		else { runtime.str += keyIndent ; }

		first = false ;

		if ( keys[ i ] ) {
			stringifyKey( keys[ i ] , runtime ) ;
			runtime.str += ':' ;
		}

		runtime.compactList = false ;
		stringifyAnyType(
			v[ keys[ i ] ] ,
			runtime ,
			propertyMask && typeof propertyMask === 'object' && propertyMask[ keys[ i ] ]
		) ;
	}

	if ( first ) { runtime.str += runtime.depth > 1 ? ' <Object>' : '<Object>' ; }

	runtime.depth -- ;
	if ( runtime.documentDepthLimit && v.$ ) { runtime.documentDepth -- ; }
}



function stringifyTagContainer( v , runtime , propertyMask ) {
	var tagIndent ,
		i = 0 ,
		iMax = v.children.length ;

	if ( ! iMax ) {
		runtime.str += runtime.depth ? ' <TagContainer>' : '<TagContainer>' ;
		return ;
	}

	tagIndent = '\n' + '\t'.repeat( runtime.depth ) ;

	runtime.depth ++ ;

	if ( runtime.depth <= 1 ) {
		// avoid the first '\n' of a file
		stringifyTag( v.children[ i ] , runtime , propertyMask ) ;
		i = 1 ;
	}

	for ( ; i < iMax ; i ++ ) {
		runtime.str += tagIndent ;
		stringifyTag( v.children[ i ] , runtime , propertyMask ) ;
	}

	runtime.depth -- ;
}



function stringifyTag( v , runtime , propertyMask ) {
	if ( ! ( v instanceof Tag ) ) {
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



function stringifyMetaTagContainer( v , runtime , propertyMask ) {
	var tagIndent ,
		i = 0 ,
		iMax = v.children.length ;

	if ( ! iMax ) { return ; }

	tagIndent = '\n' + '\t'.repeat( runtime.depth ) ;

	runtime.depth ++ ;

	if ( runtime.depth <= 1 ) {
		// avoid the first '\n' of a file
		stringifyMetaTag( v.children[ i ] , runtime , propertyMask ) ;
		i = 1 ;
	}

	for ( ; i < iMax ; i ++ ) {
		runtime.str += tagIndent ;
		stringifyMetaTag( v.children[ i ] , runtime , propertyMask ) ;
	}

	runtime.str += '\n\n' ;

	runtime.depth -- ;
}



function stringifyMetaTag( v , runtime , propertyMask ) {
	if ( ! ( v instanceof Tag ) ) {
		throw new Error( 'Expected an instance of Tag' ) ;
	}

	var attributes ;

	attributes = v.stringifyAttributes() ;
	if ( typeof attributes !== 'string' ) { attributes = '' ; }
	if ( attributes ) { attributes = ' ' + attributes ; }

	runtime.str += '[[' + v.name + attributes + ']]' ;

	runtime.compactList = false ;

	if ( v.content !== undefined ) { stringifyAnyType( v.content , runtime , propertyMask ) ; }
}

