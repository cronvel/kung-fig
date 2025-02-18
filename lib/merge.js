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



const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const Ref = require( 'kung-fig-ref' ) ;
const Expression = require( 'kung-fig-expression' ) ;
const template = require( 'kung-fig-template' ) ;
const TemplateSentence = template.Sentence ;
const TemplateAtom = template.Atom ;



const merge = {} ;
module.exports = merge ;



merge.mode = function( base , toMerge , mode , position ) {
	switch ( mode ) {
		case 'before' :
			return merge.before( base , toMerge ) ;
		case 'after' :
			return merge.after( base , toMerge , position ) ;
		default :
			return toMerge ;
	}
} ;



merge.before = function( base , toMerge , isRecursive = false ) {
	var key , value ;

	// Because undefined means «nothing exist», it doesn't have any priority
	if ( base === undefined ) { return toMerge ; }

	if ( ! base || typeof base !== 'object' || ! toMerge || typeof toMerge !== 'object' ) { return base ; }

	// Array-like insert mode

	if ( Array.isArray( toMerge ) || ( toMerge instanceof Set ) ) {
		if ( isRecursive ) { return base ; }

		if ( Array.isArray( base ) ) {
			base.unshift( ... toMerge ) ;
			return base ;
		}

		if ( base instanceof Set ) {
			for ( let element of toMerge ) { base.add( element ) ; }
			return base ;
		}

		return base ;
	}

	if ( toMerge instanceof TagContainer ) {
		if ( isRecursive ) { return base ; }
		if ( ! ( base instanceof TagContainer ) ) { return base ; }
		base.children.unshift( ... toMerge.children ) ;
		return base ;
	}

	// Object-like merge mode

	if ( toMerge instanceof Map ) {
		if ( ! ( base instanceof Map ) ) { return base ; }

		for ( [ key , value ] of toMerge ) {
			if ( base.has( key ) ) {
				base.set( key , merge.before( base.get( key ) , value , true ) ) ;
			}
			else {
				base.set( key , value ) ;
			}
		}

		return base ;
	}

	if ( ( toMerge instanceof Tag ) || ( toMerge instanceof TemplateSentence ) || ( toMerge instanceof TemplateAtom )
		|| ( toMerge instanceof Ref ) || ( toMerge instanceof Expression ) ) {
		// Considered as «opaque values»
		return base ;
	}

	if ( Array.isArray( base ) || base instanceof Map || ( base instanceof TagContainer ) || ( base instanceof Tag )
		|| ( base instanceof TemplateSentence ) || ( base instanceof TemplateAtom ) || ( base instanceof Ref )
		|| ( base instanceof Expression ) ) {
		// If base is not a kind of «normal» object
		return base ;
	}

	// So there are both some kind of «normal» objects

	for ( key in toMerge ) {
		if ( key in base ) {
			base[ key ] = merge.before( base[ key ] , toMerge[ key ] , true ) ;
		}
		else {
			base[ key ] = toMerge[ key ] ;
		}
	}

	return base ;
} ;



merge.after = function( base , toMerge , position = null , isRecursive = false ) {
	var key , value ;

	if ( ! base || typeof base !== 'object' || ! toMerge || typeof toMerge !== 'object' ) { return toMerge ; }

	// Array-like insert mode

	if ( Array.isArray( toMerge ) || ( toMerge instanceof Set ) ) {
		if ( position === null || isRecursive ) { return toMerge ; }

		if ( Array.isArray( base ) ) {
			base.splice( position , 0 , ... toMerge ) ;
			return base ;
		}

		if ( base instanceof Set ) {
			for ( let element of toMerge ) { base.add( element ) ; }
			return base ;
		}

		return toMerge ;
	}

	if ( toMerge instanceof TagContainer ) {
		if ( position === null || isRecursive ) { return toMerge ; }
		if ( ! ( base instanceof TagContainer ) ) { return toMerge ; }
		base.children.splice( position , 0 , ... toMerge.children ) ;
		return base ;
	}

	// Object-like merge mode

	if ( toMerge instanceof Map ) {
		if ( ! ( base instanceof Map ) ) { return toMerge ; }

		for ( [ key , value ] of toMerge ) {
			if ( base.has( key ) ) {
				base.set( key , merge.after( base.get( key ) , value , null , true ) ) ;
			}
			else {
				base.set( key , value ) ;
			}
		}

		return base ;
	}

	if ( ( toMerge instanceof Tag ) || ( toMerge instanceof TemplateSentence ) || ( toMerge instanceof TemplateAtom )
		|| ( toMerge instanceof Ref ) || ( toMerge instanceof Expression ) ) {
		// Considered as «opaque values»
		return toMerge ;
	}

	if ( Array.isArray( base ) || base instanceof Map || ( base instanceof TagContainer ) || ( base instanceof Tag )
		|| ( base instanceof TemplateSentence ) || ( base instanceof TemplateAtom ) || ( base instanceof Ref )
		|| ( base instanceof Expression ) ) {
		// If base is not a kind of «normal» object
		return toMerge ;
	}

	// So there are both some kind of «normal» objects

	for ( key in toMerge ) {
		if ( key in base ) {
			base[ key ] = merge.after( base[ key ] , toMerge[ key ] , null , true ) ;
		}
		else {
			base[ key ] = toMerge[ key ] ;
		}
	}

	return base ;
} ;

