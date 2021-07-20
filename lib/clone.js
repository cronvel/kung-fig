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

const builtin = require( './builtin.js' ) ;
const kfgCommon = require( './kfgCommon.js' ) ;
//const MultiLine = kfgCommon.MultiLine ;
const Instance = kfgCommon.Instance ;
const DepthLimit = kfgCommon.DepthLimit ;

const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const OrderedObject = require( './OrderedObject.js' ) ;



// Clone for array element repetition

function clone( value , cloneParent , cloneKey , meta ) {
	var proto , cloned , key ;
	
	if ( ! value || typeof value !== 'object' ) { return value ; }

	if ( Array.isArray( value ) ) {
		cloned = new Array( value.length ) ;
		for ( key = 0 ; key < value.length ; key ++ ) { cloned[ key ] = clone( value[ key ] , cloned , key , meta ) ; }
		return cloned ;
	}
	
	proto = Object.getPrototypeOf( value ) ;

	if ( proto === Object.prototype ) {
		cloned = {} ;
		for ( key in value ) { cloned[ key ] = clone( value[ key ] , cloned , key , meta ) ; }
		return cloned ;
	}

	if ( proto.constructor.clone ) {
		return proto.constructor.clone( value , undefined , undefined , meta ) ;
	}
	
	switch ( proto ) {
		case Instance.prototype :
			cloned = new Instance(
				value.instanceOf ,
				value.fn ,
				null ,	// parameters, see below
				value.extraParameters ,
				value.isDynamic ,
				value.isApplicable ,
				cloneParent ,
				cloneKey ,
				value.follow
			) ;

			cloned.parameters = clone( value.parameters , cloned , 'parameters' , meta ) ,
			meta.addInstance( cloned ) ;
			return cloned ;
		// IncludeRef,
	}
	
	// No clone = opaque/immutable value?
	//throw new Error( "Don't know how to clone '" + proto.constructor.name + "'" ) ;
	return value ;
}

module.exports = clone ;

