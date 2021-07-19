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



const kfgCommon = require( './kfgCommon.js' ) ;
const DepthLimit = kfgCommon.DepthLimit ;
const Ref = require( 'kung-fig-ref' ) ;
const Expression = require( 'kung-fig-expression' ) ;
const DynamicInstance = require( 'kung-fig-dynamic-instance' ) ;
const template = require( 'kung-fig-template' ) ;
const TemplateSentence = template.Sentence ;
const TemplateAtom = template.Atom ;
//const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const OrderedObject = require( './OrderedObject.js' ) ;

const string = require( 'string-kit' ) ;



exports.DepthLimit = exports.depthLimit = () => DepthLimit ;
exports.Object = exports.object = v => {
	var o , entry , type = kfgCommon.containerType( v ) ;
	if ( type === 'Object' ) { return v ; }

	o = {} ;
	if ( type === 'Map' ) {
		for ( entry of v ) { o[ entry[ 0 ] ] = entry[ 1 ] ; }
	}
	return o ;
} ;

exports.Array = exports.array = v => kfgCommon.containerType( v ) === 'Array' ? v : [] ;
exports.Map = exports.map = v => {
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

exports.OrderedObject = exports.orderedObject = ( v , extra ) => new OrderedObject( v , extra.siblingKeys ) ;
exports.OrderedObject.require = { siblingKeys: true } ;

exports.TagContainer = exports.tagContainer = v => kfgCommon.containerType( v ) === 'TagContainer' ? v : new TagContainer( v ) ;
exports.Ref = exports.ref = v => kfgCommon.containerType( v ) === 'Ref' ? v : new Ref( v ) ;
exports.Expression = exports.expression = v => kfgCommon.containerType( v ) === 'Expression' ? v : new Expression( v ) ;

// FIX???
// Strange code... useful?
exports.DynamicInstance = exports.dynamicInstance = v => kfgCommon.containerType( v ) === 'DynamicInstance' ? v : new DynamicInstance( v ) ;

exports.Sentence = exports.sentence =
exports.TemplateSentence = exports.templateSentence = ( v , extra ) => kfgCommon.containerType( v ) === 'TemplateSentence' ? v : new TemplateSentence( v , extra && extra.locale ) ;
exports.TemplateSentence.require = { locale: true } ;

exports.Atom = exports.atom =
exports.TemplateAtom = exports.templateAtom = ( v , extra ) => new TemplateAtom( v , extra && extra.locale ) ;
exports.TemplateAtom.require = { locale: true } ;

/*
exports.TemplateAtom = exports.templateAtom = ( v , keys , runtime ) => {
	if ( kfgCommon.containerType( v ) === 'TemplateAtom' ) { return v ; }

	var e = new TemplateAtom( v , runtime && runtime.locale ) ;

	e.__isDynamic__ = !! v.__isDynamic__ ;
	e.__isApplicable__ = !! v.__isApplicable__ ;

	return e ;
} ;
*/

exports.JSON = exports.json = exports.Json = v => JSON.parse( v ) ;
exports.Bin16 = exports.bin16 = exports.bin = v => {
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

exports.Date = exports.date = v => new Date( v ) ;

exports.Regex = exports.regex = exports.RegExp = exports.Regexp = exports.regexp = v => {
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
		exports.RegExp.toSubstitution( v , match[ 2 ].replace( fixDelimiterRegex , '$1' ) ) ;
	}
	else {
		exports.RegExp.toExtended( v ) ;
	}

	return v ;
} ;

exports.RegExp.toExtended = function( regexp ) {
	Object.defineProperties( regexp , {
		match: { value: exports.RegExp.match } ,
		filter: { value: exports.RegExp.filter }
	} ) ;
} ;

exports.RegExp.toSubstitution = function( regexp , substitution ) {
	exports.RegExp.toExtended( regexp ) ;

	Object.defineProperties( regexp , {
		substitution: { value: substitution } ,
		substitute: { value: exports.RegExp.substitute }
	} ) ;
} ;

exports.RegExp.substitute = function( str ) {
	str = '' + str ;
	return str.replace( this , this.substitution ) ;
} ;

exports.RegExp.match = function( str ) {
	str = '' + str ;
	return str.match( this ) ;
} ;

exports.RegExp.filter = function( array ) {
	return array.filter( e => this.test( e ) ) ;
} ;

