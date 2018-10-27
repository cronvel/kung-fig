/*
	Kung Fig

	Copyright (c) 2015 - 2018 Cédric Ronvel

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
var TagContainer = require( './TagContainer.js' ) ;
var Ref = require( 'kung-fig-ref' ) ;
var Expression = require( 'kung-fig-expression' ) ;
var template = require( 'kung-fig-template' ) ;
var TemplateSentence = template.Sentence ;
var TemplateAtom = template.Atom ;



// Used as a unique opaque value
exports.DepthLimit = {} ;



// An object to ease multi-line scalar values
function MultiLine( type , fold , applicable , options ) {
	this.type = type ;
	this.fold = !! fold ;
	this.applicable = !! applicable ;
	this.options = options ;
	this.lines = [] ;
}

exports.MultiLine = MultiLine ;



MultiLine.prototype.construct = function construct() {
	var content ;

	switch ( this.type ) {
		case 'string' :
			return this.getContent() ;

		case 'TemplateSentence' :
			content = TemplateSentence.create( this.getContent() ) ;

			if ( this.applicable ) {
				content.__isDynamic__ = false ;
				content.__isApplicable__ = true ;
			}

			return content ;

		/*
		case 'TemplateAtom' :
			content = TemplateAtom.parse( this.getContent() ) ;

			if ( this.applicable ) {
				content.__isDynamic__ = false ;
				content.__isApplicable__ = true ;
			}

			return content ;
		*/

		case 'Expression' :
			// Here this.options contains operators
			// We use the 'foldMore' option, expression should not contains any \n
			content = Expression.parse( this.getContent( true ) , this.options ) ;

			if ( this.applicable ) {
				content.__isDynamic__ = false ;
				content.__isApplicable__ = true ;
			}

			return content ;

		default :
			throw new Error( "MultiLine: Unknown type '" + this.type + "'" ) ;
	}
} ;



MultiLine.prototype.getContent = function getContent( foldMore ) {
	var content = '' , i , iMax , trimmed , addSpace = false ;

	if ( this.fold ) {
		for ( i = 0 , iMax = this.lines.length ; i < iMax ; i ++ ) {
			trimmed = this.lines[ i ].trim() ;

			if ( trimmed || foldMore ) {
				content += ( addSpace ? ' ' : '' ) + trimmed ;
				addSpace = true ;
			}
			else {
				content += '\n' ;
				addSpace = false ;
			}
		}
	}
	else {
		content = this.lines.join( '\n' ) ;
	}

	return content ;
} ;



// Get the target for an object: the place where children are attached
exports.getTarget = function getTarget( object ) {
	if ( object instanceof Tag ) { object = object.value ; }
	if ( object instanceof TagContainer ) { object = object.children ; }

	return object ;
} ;

/*
exports.getTarget = function getTarget( object ) {
	if ( object instanceof Tag ) { return getTarget( object.value ) ; }
	if ( object instanceof TagContainer ) { return getTarget( object.children ) ; }

	return object ;
} ;
*/



exports.containerType = function containerType( object ) {
	if ( object === undefined ) { return ; }
	else if ( typeof object === 'string' ) { return 'string' ; }		// strings act like a pseudo-container in KFG format
	else if ( ! object || typeof object !== 'object' ) { return 'scalar' ; }
	else if ( object instanceof Tag ) { return containerType( object.value ) ; }
	else if ( Array.isArray( object ) ) { return 'Array' ; }
	else if ( object instanceof Map ) { return 'Map' ; }
	else if ( object instanceof TagContainer ) { return 'TagContainer' ; }
	else if ( object instanceof MultiLine ) { return 'MultiLine' ; }
	else if ( object instanceof TemplateSentence ) { return 'TemplateSentence' ; }
	else if ( object instanceof TemplateAtom ) { return 'TemplateAtom' ; }
	else if ( object instanceof Ref ) { return 'Ref' ; }
	else if ( object instanceof Expression ) { return 'Expression' ; }
	return 'Object' ;
} ;

