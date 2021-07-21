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
const IncludeRef = kfgCommon.IncludeRef ;
const DepthLimit = kfgCommon.DepthLimit ;

const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const OrderedObject = require( './OrderedObject.js' ) ;



// Clone for array element repetition

function clone( value , fromParent , fromParentKey , toParent , toParentKey , meta ) {
	var proto , cloned , key , element ;
	console.log( "================= cloning" , value ) ;
	
	cloneIncludeRefs( fromParent , fromParentKey , toParent , toParentKey , meta ) ;

	if ( ! value || typeof value !== 'object' ) { return value ; }

	if ( Array.isArray( value ) ) {
		cloned = new Array( value.length ) ;
		for ( key = 0 ; key < value.length ; key ++ ) { cloned[ key ] = clone( value[ key ] , value , key , cloned , key , meta ) ; }
		return cloned ;
	}
	
	proto = Object.getPrototypeOf( value ) ;

	if ( proto === Object.prototype ) {
		cloned = {} ;
		for ( key in value ) { cloned[ key ] = clone( value[ key ] , value , key , cloned , key , meta ) ; }
		return cloned ;
	}

	if ( proto.constructor.clone ) {
		cloned = proto.constructor.clone( value , fromParent , fromParentKey , toParent , toParentKey , meta ) ;
		return cloned ;
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
				toParent ,
				toParentKey ,
				value.follow
			) ;

			cloned.parameters = clone( value.parameters , value , 'parameters' , cloned , 'parameters' , meta ) ;
			meta.addInstance( cloned ) ;
			return cloned ;

		case Buffer.prototype :
			return Buffer.from( value ) ;

		case OrderedObject.prototype :
			cloned = new OrderedObject ;
			for ( [ key , element ] of value.entries() ) {
				cloned.push( key , clone( element , value , key , cloned , key , meta ) ) ;
			}
			return cloned ;

		// /!\ Map's keys are not cloned (can't disambigate the key from the value with only parent+parentKey)
		case Map.prototype :
			cloned = new Map() ;
			for ( [ key , element ] of value ) { cloned.set( clone( element , value , key , cloned , clonedElement , meta ) ) ; }
			return cloned ;

		/* DON'T WORK, need to know the cloned element ahead of time
		case Set.prototype :
			cloned = new Set() ;
			for ( element of value ) { cloned.add( clone( element , value , element , cloned , clonedElement , meta ) ) ; }
			return cloned ;
		*/ 
	}
	
	// No clone = opaque/immutable value?
	//throw new Error( "Don't know how to clone '" + proto.constructor.name + "'" ) ;
	return value ;
}

module.exports = clone ;



function cloneIncludeRefs( fromParent , fromParentKey , toParent , toParentKey , meta ) {
	console.log( "¬¬¬¬¬ About to clone include ref:" , fromParent , fromParentKey , toParent , toParentKey ) ;
	var includeRef = meta.getIncludeRef( fromParent , fromParentKey ) ;
	console.log( "¬¬¬¬¬ include ref:" , includeRef ) ;
	if ( ! includeRef ) { return ; }
	
	var clonedIncludeRef = new IncludeRef(
		toParent ,
		toParentKey ,
		includeRef.follow ,
		includeRef.directory ,
		(
			includeRef.path && includeRef.innerPath ? includeRef.path + '#' + includeRef.innerPath :
			includeRef.path ? includeRef.path :
			includeRef.innerPath ? '#' + includeRef.innerPath :
			''
		) ,
		includeRef.required ,
		includeRef.merge
	) ;

	clonedIncludeRef.isAppended = includeRef.isAppended ;
	
	meta.addIncludeRef( clonedIncludeRef ) ;
	console.log( "¬¬¬¬¬ cloned include ref:" , clonedIncludeRef ) ;
}

