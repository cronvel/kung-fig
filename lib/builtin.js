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



const kfgCommon = require( './kfgCommon.js' ) ;
const DepthLimit = kfgCommon.DepthLimit ;
const Ref = require( 'kung-fig-ref' ) ;
const Expression = require( 'kung-fig-expression' ) ;
const DynamicInstance = require( 'kung-fig-dynamic-instance' ) ;
const template = require( 'kung-fig-template' ) ;
const statsModifiers = require( 'stats-modifiers' ) ;
const TemplateSentence = template.Sentence ;
const TemplateAtom = template.Atom ;
//const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const OrderedObject = require( './OrderedObject.js' ) ;
const lxonParser = require( './lxonParser.min.js' ) ;
const string = require( 'string-kit' ) ;



// KFG types (string) for parser
const types = exports.types = {} ;
// prototypes map for stringifier
const prototypes = exports.prototypes = new Map() ;



types.DepthLimit = types.depthLimit = () => DepthLimit ;
types.JSON = types.json = types.Json = v => JSON.parse( v ) ;
types.LXON = types.lxon = types.Lxon = v => lxonParser( v ) ;
types.Array = types.array = v => kfgCommon.containerType( v ) === 'Array' ? v : [] ;

types.Date = types.date = v => new Date( v ) ;
prototypes.set( Date.prototype , types.Date ) ;
types.Date.typeName = 'date' ;
types.Date.opaque = true ;
types.Date.stringify = v => v.toISOString() ;



types.Object = types.object = v => {
	var o , entry , type = kfgCommon.containerType( v ) ;

	// If the parameters is already an object, no need to do anything, pass the parameters
	if ( type === 'Object' ) { return v ; }

	o = {} ;

	if ( type === 'Map' ) {
		for ( entry of v ) { o[ entry[ 0 ] ] = entry[ 1 ] ; }
	}

	return o ;
} ;



types.Map = types.map = v => {
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



types.Set = types.set = v => {
	var type = kfgCommon.containerType( v ) ;

	if ( type === 'Array' ) {
		return new Set( v ) ;
	}

	return new Set() ;
} ;



types.TagContainer = types.tagContainer = v => kfgCommon.containerType( v ) === 'TagContainer' ? v : new TagContainer( v ) ;
types.Ref = types.ref = v => kfgCommon.containerType( v ) === 'Ref' ? v : new Ref( v ) ;
types.Expression = types.expression = v => kfgCommon.containerType( v ) === 'Expression' ? v : new Expression( v ) ;

types.OrderedObject = types.orderedObject = ( v , extra ) => new OrderedObject( v , extra.siblingKeys ) ;
types.OrderedObject.require = { siblingKeys: true } ;

// Strange code... useful?
types.DynamicInstance = types.dynamicInstance = v => kfgCommon.containerType( v ) === 'DynamicInstance' ? v : new DynamicInstance( v ) ;

types.Sentence = types.sentence =
types.TemplateSentence = types.templateSentence = ( v , extra ) => kfgCommon.containerType( v ) === 'TemplateSentence' ? v : new TemplateSentence( v , extra && extra.locale ) ;
types.TemplateSentence.require = { locale: true } ;

types.Atom = types.atom =
types.TemplateAtom = types.templateAtom = ( v , extra ) => new TemplateAtom( v , extra && extra.locale ) ;
types.TemplateAtom.require = { locale: true } ;

types.Bin16 = types.bin16 = types.bin = v => {
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

// For instance Buffer instances are Bin16
types.Buffer = types.Bin16 ;
prototypes.set( Buffer.prototype , types.Buffer ) ;
types.Buffer.typeName = 'bin16' ;
types.Buffer.opaque = true ;
types.Buffer.stringify = v => v.toString( 'hex' ) ;

types.RegExp = types.Regexp = types.regexp = types.Regex = types.regex = v => {
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
		types.RegExp.toSubstitution( v , match[ 2 ].replace( fixDelimiterRegex , '$1' ) ) ;
	}
	else {
		types.RegExp.toExtended( v ) ;
	}

	return v ;
} ;

types.RegExp.toExtended = function( regexp ) {
	Object.defineProperties( regexp , {
		match: { value: types.RegExp.match } ,
		filter: { value: types.RegExp.filter }
	} ) ;
} ;

types.RegExp.toSubstitution = function( regexp , substitution ) {
	types.RegExp.toExtended( regexp ) ;

	Object.defineProperties( regexp , {
		substitution: { value: substitution } ,
		substitute: { value: types.RegExp.substitute }
	} ) ;
} ;

types.RegExp.substitute = function( str ) {
	str = '' + str ;
	return str.replace( this , this.substitution ) ;
} ;

types.RegExp.match = function( str ) {
	str = '' + str ;
	return str.match( this ) ;
} ;

types.RegExp.filter = function( array ) {
	return array.filter( e => this.test( e ) ) ;
} ;

prototypes.set( RegExp.prototype , types.RegExp ) ;
types.RegExp.typeName = 'regex' ;
types.RegExp.opaque = true ;
types.RegExp.stringify = v => {
	var str , delimiter , escDelimiter , fixDelimiterRegex ;

	delimiter = v.delimiter || '/' ;
	escDelimiter = string.escape.regExp( delimiter ) ;
	fixDelimiterRegex = new RegExp( escDelimiter , 'g' ) ;

	str = delimiter + v.source.replace( fixDelimiterRegex , '\\$&' ) ;

	if ( typeof v.substitution === 'string' ) {
		str += delimiter + v.substitution.replace( fixDelimiterRegex , '\\$&' ) ;
	}

	str += delimiter ;

	if ( v.global ) { str += 'g' ; }
	if ( v.ignoreCase ) { str += 'i' ; }
	if ( v.multiline ) { str += 'm' ; }

	return str ;
} ;



// Stats Modifiers
types.StatsTable = types.statsTable = v => {
	//console.error( "table" ) ;
	if ( ! v || typeof v !== 'object' ) { throw new Error( "Expecting an object, but got a " + typeof v ) ; }
	return new statsModifiers.StatsTable( v ).getProxy() ;
} ;

types.WildNestedStats = types.wildNestedStats = types.Wild = types.wild = v => {
	//console.error( "wild" ) ;
	if ( v && typeof v !== 'object' ) { throw new Error( "Expecting empty or an object, but got a " + typeof v ) ; }
	return new statsModifiers.WildNestedStats( v ).getProxy() ;
} ;

types.Pool = types.pool = v => {
	if ( ( ! v || typeof v !== 'object' ) && typeof v !== 'number' ) { throw new Error( "Expecting an object, an array or a string, but got a " + typeof v ) ; }
	return new statsModifiers.Pool( v ).getProxy() ;
} ;

types.Traits = types.traits = v => {
	if ( ! v ) { throw new Error( "Expecting an non-empty value, but got " + v ) ; }
	if ( typeof v !== 'object' && typeof v !== 'string' ) { throw new Error( "Expecting an object, an array or a string, but got a " + typeof v ) ; }
	return new statsModifiers.Traits( v ).getProxy() ;
} ;

types.HistoryGauge = types.historyGauge = v => {
	if ( ! v || typeof v !== 'object' ) { throw new Error( "Expecting an object, but got a " + typeof v ) ; }
	return new statsModifiers.HistoryGauge( v ).getProxy() ;
} ;

types.HistoryAlignometer = types.historyAlignometer = v => {
	if ( ! v || typeof v !== 'object' ) { throw new Error( "Expecting an object, but got a " + typeof v ) ; }
	return new statsModifiers.HistoryAlignometer( v ).getProxy() ;
} ;

types.ModifiersTable = types.modifiersTable = v => {
	if ( ! v || typeof v !== 'object' ) { throw new Error( "Expecting an object, but got a " + typeof v ) ; }

	var id = v.id && typeof v.id === 'string' ? v.id : null ,
		active = v.active !== undefined ? !! v.active : true ,
		isTemplate = !! v.template ,
		events = v.events ;

	delete v.id ;
	delete v.active ;
	delete v.template ;
	delete v.events ;

	return new statsModifiers.ModifiersTable( id , v , active , isTemplate , events ).getProxy() ;
} ;

