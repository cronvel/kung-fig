/*
	Kung Fig

	Copyright (c) 2015 - 2020 Cédric Ronvel

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



const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const Ref = require( 'kung-fig-ref' ) ;
const Expression = require( 'kung-fig-expression' ) ;
const template = require( 'kung-fig-template' ) ;
const TemplateSentence = template.Sentence ;
const TemplateAtom = template.Atom ;



const merge = {} ;
module.exports = merge ;



merge.mode = function( base , toMerge , mode ) {
	switch ( mode ) {
		case 'after' :
			return merge.after( base , toMerge ) ;
		case 'before' :
			return merge.before( base , toMerge ) ;
		default :
			return toMerge ;
	}
} ;



merge.after = function( base , toMerge ) {
	var key , value ;

	if ( ! base || typeof base !== 'object' || ! toMerge || typeof toMerge !== 'object' ) { return toMerge ; }

	if ( Array.isArray( toMerge ) ) {
		if ( ! Array.isArray( base ) ) { return toMerge ; }

		for ( key = 0 ; key < toMerge.length ; key ++ ) {
			if ( key < base.length && base[ key ] !== undefined ) {
				base[ key ] = merge.after( base[ key ] , toMerge[ key ] ) ;
			}
			else {
				base[ key ] = toMerge[ key ] ;
			}
		}

		return base ;
	}
	else if ( toMerge instanceof Map ) {
		if ( ! ( base instanceof Map ) ) { return toMerge ; }

		for ( [ key , value ] of toMerge ) {
			if ( base.has( key ) ) {
				base.set( key , merge.after( base.get( key ) , value ) ) ;
			}
			else {
				base.set( key , value ) ;
			}
		}

		return base ;
	}
	else if ( toMerge instanceof TagContainer ) {
		if ( ! ( base instanceof TagContainer ) ) { return toMerge ; }

		for ( key = 0 ; key < toMerge.children.length ; key ++ ) {
			if ( key < base.children.length && base.children[ key ] !== undefined ) {
				base.children[ key ] = merge.after( base.children[ key ] , toMerge.children[ key ] ) ;
			}
			else {
				base.children[ key ] = toMerge.children[ key ] ;
			}
		}

		return base ;
	}
	else if ( ( toMerge instanceof Tag ) || ( toMerge instanceof TemplateSentence ) || ( toMerge instanceof TemplateAtom )
		|| ( toMerge instanceof Ref ) || ( toMerge instanceof Expression ) ) {
		// Considered as «opaque values»
		return toMerge ;
	}
	else if ( Array.isArray( base ) || base instanceof Map || ( base instanceof TagContainer ) || ( base instanceof Tag )
		|| ( base instanceof TemplateSentence ) || ( base instanceof TemplateAtom ) || ( base instanceof Ref )
		|| ( base instanceof Expression ) ) {
		// If base is not a kind of «normal» object
		return toMerge ;
	}

	// So there are both some kind of «normal» objects

	for ( key in toMerge ) {
		if ( key in base ) {
			base[ key ] = merge.after( base[ key ] , toMerge[ key ] ) ;
		}
		else {
			base[ key ] = toMerge[ key ] ;
		}
	}

	return base ;
} ;



merge.before = function( base , toMerge ) {
	var key , value ;

	// Because undefined means «nothing exist», it doesn't have any priority
	if ( base === undefined ) { return toMerge ; }

	if ( ! base || typeof base !== 'object' || ! toMerge || typeof toMerge !== 'object' ) { return base ; }

	if ( Array.isArray( toMerge ) ) {
		if ( ! Array.isArray( base ) ) { return base ; }

		for ( key = 0 ; key < toMerge.length ; key ++ ) {
			if ( key < base.length && base[ key ] !== undefined ) {
				base[ key ] = merge.before( base[ key ] , toMerge[ key ] ) ;
			}
			else {
				base[ key ] = toMerge[ key ] ;
			}
		}

		return base ;
	}
	else if ( toMerge instanceof Map ) {
		if ( ! ( base instanceof Map ) ) { return base ; }

		for ( [ key , value ] of toMerge ) {
			if ( base.has( key ) ) {
				base.set( key , merge.before( base.get( key ) , value ) ) ;
			}
			else {
				base.set( key , value ) ;
			}
		}

		return base ;
	}
	else if ( toMerge instanceof TagContainer ) {
		if ( ! ( base instanceof TagContainer ) ) { return base ; }

		for ( key = 0 ; key < toMerge.children.length ; key ++ ) {
			if ( key < base.children.length && base.children[ key ] !== undefined ) {
				base.children[ key ] = merge.before( base.children[ key ] , toMerge.children[ key ] ) ;
			}
			else {
				base.children[ key ] = toMerge.children[ key ] ;
			}
		}

		return base ;
	}
	else if ( ( toMerge instanceof Tag ) || ( toMerge instanceof TemplateSentence ) || ( toMerge instanceof TemplateAtom )
		|| ( toMerge instanceof Ref ) || ( toMerge instanceof Expression ) ) {
		// Considered as «opaque values»
		return base ;
	}
	else if ( Array.isArray( base ) || base instanceof Map || ( base instanceof TagContainer ) || ( base instanceof Tag )
		|| ( base instanceof TemplateSentence ) || ( base instanceof TemplateAtom ) || ( base instanceof Ref )
		|| ( base instanceof Expression ) ) {
		// If base is not a kind of «normal» object
		return base ;
	}

	// So there are both some kind of «normal» objects

	for ( key in toMerge ) {
		if ( key in base ) {
			base[ key ] = merge.before( base[ key ] , toMerge[ key ] ) ;
		}
		else {
			base[ key ] = toMerge[ key ] ;
		}
	}

	return base ;
} ;

