let BROTHERHOOD_BUNDLE={"bundler":"brotherhood","bundlerVersion":"0.2.2","name":"kung-fig","version":"0.68.4","type":"esm","globals":[],"boundary":"oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV","packages":[{"name":"kung-fig","version":"0.68.4","id":"/"},{"name":"path-browserify","version":"1.0.1","id":"/[core]/node_modules/path-browserify"},{"name":"kung-fig-common","version":"0.43.1","id":"/node_modules/kung-fig-common"},{"name":"kung-fig-ref","version":"0.46.3","id":"/node_modules/kung-fig-ref"},{"name":"kung-fig-expression","version":"0.49.1","id":"/node_modules/kung-fig-expression"},{"name":"kung-fig-template","version":"0.50.1","id":"/node_modules/kung-fig-template"},{"name":"sha1-uint8array","version":"0.10.7","id":"/node_modules/sha1-uint8array"},{"name":"buffer","version":"6.0.3","id":"/[core]/node_modules/buffer"},{"name":"kung-fig-dynamic","version":"0.43.2","id":"/node_modules/kung-fig-dynamic"},{"name":"kung-fig-dynamic-instance","version":"0.45.0","id":"/node_modules/kung-fig-dynamic-instance"},{"name":"stats-modifiers","version":"0.8.1","id":"/node_modules/stats-modifiers"},{"name":"string-kit","version":"0.19.3","id":"/node_modules/string-kit"},{"name":"base64-js","version":"1.5.1","id":"/[core]/node_modules/base64-js"},{"name":"ieee754","version":"1.2.1","id":"/[core]/node_modules/ieee754"},{"name":"babel-tower","version":"0.21.3","id":"/node_modules/babel-tower"},{"name":"array-kit","version":"0.2.6","id":"/node_modules/array-kit"},{"name":"tree-kit","version":"0.8.8","id":"/node_modules/tree-kit"},{"name":"string-kit","version":"0.17.10","id":"/node_modules/babel-tower/node_modules/string-kit"}]};
const global = globalThis ;
function BROTHERHOOD_START_PACKAGE() {}
function BROTHERHOOD_END_PACKAGE() {}
function BROTHERHOOD_START_MODULE() {}
function BROTHERHOOD_END_MODULE() {}
function Package( id , mainModuleId ) {
	this.id = id ;
	this.mainModuleId = mainModuleId ;
	this.name = null ;
	this.version = null ;

	this.modules = [] ;
	this.mainModule = null ;
}

Package.packages = Object.create( null ) ;

Package.prepare = ( id , mainModuleId , aliasId ) => {
	var package_ = new Package( id , mainModuleId ) ;
	Package.packages[ id ] = package_ ;
	if ( aliasId ) { Package.packages[ aliasId ] = package_ ; }
	for ( let metadata of BROTHERHOOD_BUNDLE.packages ) {
		if ( metadata.id === id ) {
			package_.name = metadata.name ;
			package_.version = metadata.version ;
			break ;
		}
	}
} ;

Package.get = ( id ) => {
	if ( Package.packages[ id ] ) { return Package.packages[ id ] ; }
	throw new Error( "Package '" + id + "' not found." ) ;
} ;

Package.prototype.addModule = function( module ) {
	this.modules.push( module ) ;
	if ( module.id === this.mainModuleId ) {
		this.mainModule = module ;
	}
} ;

function Module( id , package_ , fn ) {
	this.id = id ;
	this.package = package_ || null ;
	this.directory = Module.dirname( this.id ) ;
	this.fn = fn ;
	this.loading = false ;
	this.loaded = false ;
	this.exports = {} ;

	if ( this.package ) { this.package.addModule( this ) ; }
}

Module.modules = Object.create( null ) ;
Module.main = null ;

Module.prepare = ( id , packageId , aliasId , fn ) => {
	var package_ = packageId ? Package.get( packageId ) : null ;

	var module = new Module( id , package_ , fn ) ;
	Module.modules[ id ] = module ;
	if ( aliasId ) { Module.modules[ aliasId ] = module ; }
	if ( ! Module.main ) { Module.main = module ; }

	module.require = id_ => Module.require( id_ , module.directory ) ;
	module.require.resolve = id_ => Module.require.resolve( id_ , module.directory ) ;
	module.require.cache = Module.modules ;
	module.require.main = Module.main ;
} ;

Module.get = ( id ) => {
	if ( Module.modules[ id ] ) { return Module.modules[ id ] ; }
	throw new Error( "Module '" + id + "' not found." ) ;
} ;

Module.prototype.load = function() {
	if ( this.loading || this.loaded ) { return ; }
	this.loading = true ;
	this.fn( this , this.exports , this.require , this.directory , this.id ) ;
	this.loading = false ;
	this.loaded = true ;
} ;

Module.dirname = path => path === '/' ? null : path.replace( /\/[^/]+\/*$/ , '' ) || '/' ;
Module.extname = path => path.match( /[^./](\.[a-zA-Z0-9]+)$/ )?.[ 1 ] ?? '' ;
Module.packageName = path => path.match( /^(?:[^@./][^@/]*|@[^@./][^@/]*\/[^@./][^@/]*)/ )?.[ 0 ] ?? null ;

Module.join = ( ... parts ) => {
	var str = '' ;

	for ( let part of parts ) {
		if ( ! str ) {
			if ( part !== '/' && part[ part.length - 1 ] === '/' ) { part = part.slice( 0 , -1 ) ; }

			str += part ;
		}
		else {
			if ( str[ str.length - 1 ] !== '/' ) { str += '/' ; }

			if ( part[ 0 ] === '/' ) { part = part.slice( 1 ) ; }
			else if ( part === '.' ) { part = '' ; }
			else if ( part.startsWith( './' ) ) { part = part.slice( 2 ) ; }

			if ( part[ part.length - 1 ] === '/' ) { part = part.slice( 0 , -1 ) ; }

			str += part ;
		}
	}

	return str ;
} ;

Module.acceptedExtensions = new Set( [ '.js' , '.json' ] ) ;

Module.collapseDots = path => {
	var parts = path.split( '/' ).filter( ( part , index ) => ! index || part !== '.' ) ;

	for ( let i = 0 ; i < parts.length ; i ++ ) {
		if ( parts[ i ] === '..' ) {
			if ( i && parts[ i - 1 ] !== '..' ) {
				if ( parts[ i - 1 ] === '.' ) {
					parts.splice( i - 1 , 1 ) ;
					i -- ;
				}
				else {
					parts.splice( i - 1 , 2 ) ;
					i -= 2 ;
				}
			}
		}
	}

	return parts.join( '/' ) ;
} ;

Module.require = ( path , base = '/' ) => {
	var id = Module.require.resolveCache[ base ]?.[ path ] ;

	//if ( id ) { console.warn( "requiring (cached):" , path , base , "-->" , id ) ; }
	if ( ! id ) {
		id = Module.require.resolve( path , base ) ;
		if ( ! Module.require.resolveCache[ base ] ) { Module.require.resolveCache[ base ] = Object.create( null ) ; }
		Module.require.resolveCache[ base ][ path ] = id ;
		//console.warn( "requiring:" , path , base , "-->" , id ) ;
	}

	var module_ = Module.get( id ) ;
	if ( ! module_.loading && ! module_.loaded ) { module_.load() ; }
	return module_.exports ;
} ;

Module.require.resolveCache = Object.create( null ) ;

Module.require.resolve = ( initialPath , initialBase = '/' ) => {
	var path = initialPath ,
		base = initialBase ;

	//console.warn( "resolve #0:" , path , base ) ;
	path = Module.collapseDots( path ) ;

	var packageName = Module.packageName( path ) ;
	//console.warn( "resolve #1:" , path , base , packageName ) ;

	if ( packageName ) {
		let found ;

		if ( packageName.startsWith( 'core:' ) ) {
			packageName = packageName.slice( 5 ) ;
			found = Module.recursivePackageSearch( packageName , path , '/[core]' , '/[core]' ) ;
		}
		else {
			found = Module.recursivePackageSearch( packageName , path , base ) ;
			if ( ! found && ! base.startsWith( '/[core]/' ) ) {
				found = Module.recursivePackageSearch( packageName , path , '/[core]' , '/[core]' ) ;
			}
		}

		if ( ! found ) {
			let error = new Error( "Cannot find module '" + initialPath + "' (no more parent directory for node_modules)" ) ;
			error.code = 'MODULE_NOT_FOUND' ;
			throw error ;
		}

		[ path , base ] = found ;
	}

	if ( path === '..' || path.startsWith( '../' ) ) {
		do {
			path = path.slice( 3 ) ;
			base = Module.dirname( base ) ;
			//console.warn( "resolve #3:" , path , base ) ;
			if ( ! base ) {
				let error = new Error( "Cannot find module '" + initialPath + "' (no more parent directory for ../)" ) ;
				error.code = 'MODULE_NOT_FOUND' ;
				throw error ;
			}
		} while ( path === '..' || path.startsWith( '../' ) ) ;

		path = Module.join( base , path ) ;
	}

	if ( path.startsWith( './' ) ) {
		//console.warn( "resolve #4:" , path , base ) ;
		path = Module.join( base , path ) ;
	}

	if ( path.startsWith( '/' ) ) {
		//console.warn( "resolve #5:" , path , base ) ;

		let extension = Module.extname( path ) ;
		if ( ! extension ) {
			let package_ = Package.packages[ path ] ;
			if ( package_ ) {
				path = package_.mainModuleId ;
			}
			else {
				path += '.js' ;
			}
		}

		let module_ = Module.modules[ path ] ;
		if ( ! module_ ) {
			let error = new Error( "Cannot find module '" + initialPath + "'" ) ;
			error.code = 'MODULE_NOT_FOUND' ;
			throw error ;
		}

		return path ;
	}

	//console.warn( "resolve #6:" , path , base ) ;

	let error = new Error( "Cannot find module '" + initialPath + "' (can't resolve)" ) ;
	error.code = 'MODULE_NOT_FOUND' ;
	throw error ;
} ;

Module.recursivePackageSearch = ( packageName , path , base , prefix = null ) => {
	let subPath = path.slice( packageName.length ) ;

	for ( ;; ) {
		let packageId = Module.join( base , 'node_modules' , packageName ) ;
		//console.warn( "resolve #2a:" , path , base , packageId ) ;
		let package_ = Package.packages[ packageId ] ;

		if ( package_ ) {
			if ( subPath ) {
				path = Module.join( package_.id , subPath ) ;
			}
			else {
				path = package_.mainModuleId ;
			}
			//console.warn( "resolve #2b:" , path , base ) ;

			return [ path , base ] ;
		}

		base = Module.dirname( base ) ;
		if ( ! base || base === prefix ) { return null ; }
	}
} ;

BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/' , '/lib/kfgParse.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/kfgParse.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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





const hashKey = require( './hashKey.js' ) ;
const path = require( 'path' ) ;
const common = require( 'kung-fig-common' ) ;
const Ref = require( 'kung-fig-ref' ) ;
const Expression = require( 'kung-fig-expression' ) ;
//const DynamicInstance = require( 'kung-fig-dynamic-instance' ) ;
const template = require( 'kung-fig-template' ) ;
const TemplateSentence = template.Sentence ;
const lxonParser = require( './lxonParser.min.js' ) ;
//const TemplateAtom = template.Atom ;



function parse( str , options , asKfgInstance ) {
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
		locale: null ,
		isInclude: !! options.isInclude ,
		classes: options.classes || {} ,
		tags: options.tags || {} ,
		metaTags: options.metaTags || {} ,
		operators: isObjectNotEmpty( options.operators ) ? options.operators : null
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

	//var value = runtime.stack[ 0 ] && runtime.stack[ 0 ].value ;
	var value = runtime.stack[ 0 ] && ( 'value' in runtime.stack[ 0 ] ) ? runtime.stack[ 0 ].value : {} ;

	if ( options.delayConstruct ) {
		return asKfgInstance ? new KFG( value , runtime.meta ) : value ;
	}

	var kfg = new KFG( value , runtime.meta ) ;
	Instance.constructAll( kfg , options ) ;
	return asKfgInstance ? kfg : kfg.data ;
}

module.exports = parse ;



// DEPRECATED, since they are on their own module
module.exports.parseQuotedString = common.parsers.parseQuotedString ;
module.exports.constants = common.constants ;
module.exports.parseRef = Ref.parseFromKfg ;



// Circular reference trouble, should require after the module.exports assignement
//const kungFig = require( './kungFig.js' ) ;
const builtin = require( './builtin.js' ) ;
const kfgCommon = require( './kfgCommon.js' ) ;
const MultiLine = kfgCommon.MultiLine ;
const Instance = kfgCommon.Instance ;
//const DepthLimit = kfgCommon.DepthLimit ;
const KFG = kfgCommon.KFG ;
const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const Operator = require( './Operator.js' ) ;
//const OrderedObject = require( './OrderedObject.js' ) ;
const Meta = require( './Meta.js' ) ;
const clone = require( './clone.js' ) ;



function isObjectNotEmpty( object ) {
	if ( object && typeof object === 'object' ) {
		for ( let key in object ) {
			if ( typeof object[ key ] === 'function' ) { return true ; }
		}
	}

	return false ;
}



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

		// Then operator
		if ( runtime.stack[ depth ].operator ) { constructOperator( runtime , depth ) ; }

		// Then instanceof
		if ( runtime.stack[ depth ].instanceOf ) { constructInstance( runtime , depth ) ; }

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
		parent.value[ k ] = clone( v , parent.value , parent.key , parent.value , k , runtime.meta ) ;
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
			- tag have NO SPACE after [ or [[
			- LXON starts with { or [ followed by AT LEAST ONE SPACE
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
		if ( str[ runtime.i + 1 ] === ' ' || str[ runtime.i + 1 ] === '\t' ) {
			if ( runtime.stack[ runtime.depth ].value === undefined ) {
				let v = parseInlineLxon( str , runtime ) ;
				runtime.stack[ runtime.depth ].value = v ;
				parentLink( runtime , runtime.depth ) ;
			}
			else {
				throw new SyntaxError( "Inline LXON must be INLINE" ) ;
			}
		}
		else {
			parseTag( str , runtime ) ;
		}
	}
	else if ( str[ runtime.i ] === '{' ) {
		if ( str[ runtime.i + 1 ] === ' ' || str[ runtime.i + 1 ] === '\t' ) {
			if ( runtime.stack[ runtime.depth ].value === undefined ) {
				let v = parseInlineLxon( str , runtime ) ;
				runtime.stack[ runtime.depth ].value = v ;
				parentLink( runtime , runtime.depth ) ;
			}
			else {
				throw new SyntaxError( "Inline LXON must be INLINE" ) ;
			}
		}
		else {
			throw new SyntaxError( "Expecting a space ' ' after the '{' (inline LXON), but got '" + str[ runtime.i + 1 ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
		}
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

		runtime.stack[ runtime.depth ].key = str.slice( runtime.i , end + 1 ).trim() ;
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
				let repeat = parseInt( str.slice( runtime.i , end ) , 10 ) - 1 ;
				runtime.stack[ runtime.depth ].repeat = repeat ;
				k = runtime.stack[ runtime.depth - 1 ].key += repeat ;
				runtime.i = end + 2 ;
			}

			break ;
		}
	}

	parseSpaces( str , runtime ) ;

	if ( runtime.i >= runtime.iEndOfLine ) { return ; }

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

	v = parseValue( str , runtime ) ;
	setParentMapV( v , runtime ) ;
}



function parseMaybeKV( str , runtime ) {
	var k , v , op ;

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

		// We should probably allow non-top-level direct values, because of the merge behavior

		//if ( runtime.depth === 0 && runtime.stack[ runtime.depth ].value === undefined ) {
		if ( runtime.stack[ runtime.depth ].value === undefined ) {
			v = parseValue( str , runtime ) ;
			runtime.stack[ runtime.depth ].value = v ;
			parentLink( runtime , runtime.depth ) ;
		}
		else if ( str[ runtime.i ] === '@' ) {
			// This is a merge
			op = parseInclude( str , runtime ) ;

			if ( str[ runtime.i ] === '"' ) { v = common.parsers.parseQuotedString( str , runtime ) ; }
			else { v = common.parsers.parseUnquotedString( str , runtime ) ; }

			let parent = runtime.stack[ runtime.depth - 1 ] ,
				follow = !! runtime.stack[ runtime.depth ].instanceOf ;

			if ( parent ) {
				let containerType = kfgCommon.containerType( runtime.stack[ runtime.depth ].value ) ;
				if ( containerType === 'Array' || containerType === 'Set' ) {
					let position = runtime.stack[ runtime.depth ].key ;
					v = runtime.meta.prependIncludeRef( parent.value , parent.key , follow , runtime.directory , v , op === '@@' , 'after' , position + 1 ) ;
				}
				else {
					v = runtime.meta.appendIncludeRef(
						parent.value , parent.key , follow , runtime.directory , v , op === '@@' , 'after' ,
						runtime.stack[ runtime.depth ].key + 1
					) ;
				}
			}
			else {
				let containerType = kfgCommon.containerType( runtime.stack[ runtime.depth ].value ) ;
				if ( containerType === 'Array' || containerType === 'Set' ) {
					let position = runtime.stack[ runtime.depth ].key ;
					v = runtime.meta.prependIncludeRef( null , null , follow , runtime.directory , v , op === '@@' , 'after' , position + 1 ) ;
				}
				else {
					v = runtime.meta.appendIncludeRef( null , null , follow , runtime.directory , v , op === '@@' , 'after' ) ;
				}
			}
		}
		else {
			// This is a string value, unquoted
			// Is this a bug? It's a multi-line string without introducer, and it's not supposed to be allowed
			throw new SyntaxError( "Maybe a multi-line string without an introducer?" ) ;
			/*
			v = common.parsers.parseUnquotedString( str , runtime ) ;
			//appendParentMultiLine( v , runtime ) ;

			//console.log( 'Maybe bug?' ) ;

			setCurrentMultiLine( runtime , 'string' ) ;
			//runtime.depth ++ ;
			increaseDepth( runtime ) ;
			appendParentMultiLine( v , runtime ) ;
			*/
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

	runtime.stack[ runtime.depth - 1 ].key = k ;

	if ( runtime.stack[ runtime.depth - 1 ].siblingKeys ) { runtime.stack[ runtime.depth - 1 ].siblingKeys.push( k ) ; }
	else { runtime.stack[ runtime.depth - 1 ].siblingKeys = [ k ] ; }

	if ( runtime.i >= runtime.iEndOfLine ) { return ; }

	runtime.stack[ runtime.depth ] = {} ;

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
	setCurrentMultiLine( runtime , 'TemplateSentence' , fold , applicable , runtime.locale ) ;
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
	setCurrentMultiLine( runtime , 'TemplateAtom' , fold , applicable , runtime.locale ) ;
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
				// [[locale]] is a special meta, immediately processed by Kung-Fig
				else if ( tagAndAttributes[ 0 ] === 'locale' ) {
					runtime.locale = tagAndAttributes[ 1 ] ;
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



function parseInlineLxon( str , runtime ) {
	var v , lxonStr ;

	if ( runtime.i + 1 >= runtime.iEndOfLine || str[ runtime.i + 1 ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '[' or the '{' (inline LXON), but got '" + str[ runtime.i + 1 ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	lxonStr = str.slice( runtime.i , runtime.iEndOfLine ) ;

	try {
		v = lxonParser( lxonStr ) ;
	}
	catch ( error ) {
		throw new SyntaxError( "Bad inline LXON (" + common.parsers.locationStr( runtime ) + "): " + error.toString() ) ;
	}

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

	if ( runtime.i >= runtime.iEndOfLine ) { return new TemplateSentence( '' , runtime.locale ) ; }

	if ( str[ runtime.i ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '$>' or '$$>', but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	runtime.i ++ ;

	v = new TemplateSentence( str.slice( runtime.i , runtime.iEndOfLine ) , runtime.locale ) ;

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

	if ( runtime.i >= runtime.iEndOfLine ) { return new TemplateAtom( '' , runtime.locale ) ; }

	if ( str[ runtime.i ] !== ' ' ) {
		throw new SyntaxError( "Expecting a space ' ' after the '$%>' or '$$%>', but got '" + str[ runtime.i ] + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	runtime.i ++ ;

	v = TemplateAtom.parse( str.slice( runtime.i , runtime.iEndOfLine ) , runtime.locale ) ;

	if ( applicable ) {
		v.__isDynamic__ = false ;
		v.__isApplicable__ = true ;
	}

	runtime.i = runtime.iEndOfLine ;

	return v ;
}
*/



function parseOperator( str , runtime ) {
	var c , op , priorityStr , j , parent ,
		priority = null ;

	runtime.i ++ ;

	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ ) {
		c = str.charCodeAt( j ) ;

		if ( c === 0x29 ) {	// ) closing parenthesis
			[ op , priorityStr ] = str.slice( runtime.i , j ).trim().split( / +/ ) ;

			if ( priorityStr ) {
				priority = 0 ;

				// '!' is for Important, so it has less priority (it comes last)
				while ( priority < priorityStr.length && priorityStr[ priority ] === '!' ) {
					priority -- ;
				}
			}

			runtime.stack[ runtime.depth ].operator = op ;
			runtime.stack[ runtime.depth ].priority = priority ;
			runtime.i = j + 1 ;
			return op ;
		}
	}

	throw new SyntaxError( "Unexpected end of line, expecting a closing parenthesis (" + common.parsers.locationStr( runtime ) + ")" ) ;
}



function parseInstanceOf( str , runtime , isDynamic = false , isApplicable = false , follow = false ) {
	var c , j , instanceOf ;

	runtime.i ++ ;

	for ( j = runtime.i ; j < runtime.iEndOfLine ; j ++ ) {
		c = str.charCodeAt( j ) ;

		if ( c === 0x3e ) { // > greater than sign, closing the instanceOf
			instanceOf = str.slice( runtime.i , j ).trim() ;
			runtime.stack[ runtime.depth ].instanceOf = {
				instanceOf , isDynamic , isApplicable , follow
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



function parseValue( str , runtime , afterKeyInline , afterInstanceOf , afterOperator ) {
	var c , v , op ,
		parent = runtime.stack[ runtime.depth - 1 ] ;

	c = str.charCodeAt( runtime.i ) ;

	if ( c >= 0x30 && c <= 0x39 ) {
		// digit
		return common.parsers.parseNumberOrUnquotedString( str , runtime ) ;
	}
	else if ( c === 0x28 && ! afterOperator ) {
		// ( open-paren sign: this introduces an operator
		op = parseOperator( str , runtime ) ;
		parseSpaces( str , runtime ) ;
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }
		return parseValue( str , runtime , afterKeyInline , afterInstanceOf , true ) ;
	}
	else if ( c === 0x3c && ! afterInstanceOf )	{
		// < lesser-than sign: this introduces an instanceOf
		parseInstanceOf( str , runtime , false , false , parent && ( parent.value instanceof TagContainer ) ) ;
		parseSpaces( str , runtime ) ;
		if ( runtime.i >= runtime.iEndOfLine ) { return ; }
		return parseValue( str , runtime , afterKeyInline , true , afterOperator ) ;
	}

	switch ( c ) {
		case 0x40 :
			// @ sign: this introduces an include, as a stand-alone value
			op = parseInclude( str , runtime ) ;

			if ( str[ runtime.i ] === '"' ) { v = common.parsers.parseQuotedString( str , runtime ) ; }
			else { v = common.parsers.parseUnquotedString( str , runtime ) ; }

			if ( parent ) {
				let follow = !! runtime.stack[ runtime.depth ].instanceOf || ( parent.value instanceof TagContainer ) ;

				if ( afterKeyInline ) {
					v = runtime.meta.appendIncludeRef( parent.value , parent.key , follow , runtime.directory , v , op === '@@' , false ) ;
				}
				else {
					// Most of time there is no container type yet, since it's the first element that will determine the type...
					//let containerType = kfgCommon.containerType( runtime.stack[ runtime.depth ].value ) ;
					v = runtime.meta.prependIncludeRef( parent.value , parent.key , follow , runtime.directory , v , op === '@@' , 'before' , 0 ) ;
				}
			}
			else {
				let follow = !! runtime.stack[ runtime.depth ].instanceOf ;

				if ( afterKeyInline ) {
					v = runtime.meta.appendIncludeRef( null , null , follow , runtime.directory , v , op === '@@' , false ) ;
				}
				else {
					v = runtime.meta.prependIncludeRef( null , null , follow , runtime.directory , v , op === '@@' , 'before' ) ;
				}
			}

			//return v ;
			return ;

		case 0x2d :	// -   minus
		case 0x2b :	// +   plus
			c = str.charCodeAt( runtime.i + 1 ) ;
			if ( c >= 0x30 && c <= 0x39 ) {
				// digit
				return common.parsers.parseNumberOrUnquotedString( str , runtime ) ;
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

		case 0x5b :	// [ bracket or...
		case 0x7b :	// { brace: this is an inline LXON
			return parseInlineLxon( str , runtime ) ;

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
				// <   lesser-than sign: this introduces a DynamicInstance
				runtime.i ++ ;
				parseInstanceOf( str , runtime , true , false , parent && ( parent.value instanceof TagContainer ) ) ;
				parseSpaces( str , runtime ) ;

				if ( runtime.i >= runtime.iEndOfLine ) { return ; }

				return parseValue( str , runtime , afterKeyInline , true , afterOperator ) ;
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
					// <   lesser-than sign: this introduces a DynamicInstance
					runtime.i += 2 ;
					parseInstanceOf( str , runtime , false , true , parent && ( parent.value instanceof TagContainer ) ) ;
					parseSpaces( str , runtime ) ;

					if ( runtime.i >= runtime.iEndOfLine ) { return ; }

					return parseValue( str , runtime , afterKeyInline , true , afterOperator ) ;
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



function constructOperator( runtime , depth ) {
	var parentTarget = null , parentKey , v ,
		operator = runtime.stack[ depth ].operator ,
		priority = runtime.stack[ depth ].priority ;

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

	v = new Operator( operator , v , priority ) ;

	// Link the current operator to its parent container
	if ( depth > 0 && runtime.stack[ depth - 1 ].value instanceof TagContainer ) {
		v.parent = runtime.stack[ depth - 1 ].value ;
	}

	if ( parentTarget ) {
		if ( parentTarget[ parentKey ] === runtime.stack[ depth ].value ) {
			parentTarget[ parentKey ] = v ;
			runtime.stack[ depth ].value = v ;
		}
		else {
			parentTarget[ parentKey ] = v ;
		}
	}
	else {
		runtime.stack[ depth ].value = v ;
	}
}



function constructInstance( runtime , depth ) {
	var parentTarget = null , parentKey , v , constructorFn , extraParameters = null ,
		{ instanceOf , isDynamic , isApplicable , follow } = runtime.stack[ depth ].instanceOf ;

	constructorFn =
		builtin.types[ instanceOf ] ? builtin.types[ instanceOf ] :
		typeof runtime.classes[ instanceOf ] === 'function' ? runtime.classes[ instanceOf ] :
		null ;

	if ( ! constructorFn ) {
		throw new SyntaxError( "Don't know how to construct '" + instanceOf + "' (" + common.parsers.locationStr( runtime ) + ")" ) ;
	}

	if ( constructorFn.require ) {
		extraParameters = {} ;
		if ( constructorFn.require.siblingKeys ) { extraParameters.siblingKeys = runtime.stack[ depth ].siblingKeys ; }
		if ( constructorFn.require.locale ) { extraParameters.locale = runtime.locale ; }
	}

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

	v = new Instance( instanceOf , constructorFn , v , extraParameters , isDynamic , isApplicable , parentTarget , parentKey , follow ) ;

	// Link the current instance to its parent container
	if ( depth > 0 && runtime.stack[ depth - 1 ].value instanceof TagContainer ) {
		v.parent = runtime.stack[ depth - 1 ].value ;
	}

	if ( parentTarget ) {
		if ( parentTarget[ parentKey ] === runtime.stack[ depth ].value ) {
			parentTarget[ parentKey ] = v ;
			runtime.stack[ depth ].value = v ;
		}
		else {
			parentTarget[ parentKey ] = v ;
		}
	}
	else {
		runtime.stack[ depth ].value = v ;
	}

	runtime.meta.addInstance( v ) ;
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
	v.uid = hashKey( v.relPath + ':' + tagId ) ;

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
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/hashKey.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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





if ( process.browser ) {
	const sha1 = require( 'sha1-uint8array' ) ;

	module.exports = str => {
		var uint8Array = sha1.createHash().update( str ).digest() ;
		var buffer = Buffer.from( uint8Array.buffer , uint8Array.byteOffset , uint8Array.byteLength ) ;
		return buffer.toString( 'base64' ) ;
	} ;
}
else {
	const hashKit = require( 'hash-kit' ) ;
	module.exports = hashKit.hashKey ;
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/lxonParser.min.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	LXON parser generated by json-kit v0.7.3 (by Cédric Ronvel)
	Special features: lxon
*/
var depthLimit=Infinity;function parse(str,limit){var v,runtime={i:0};if(typeof str!=="string"){if(str&&typeof str==="object"){str=str.toString()}else{throw new TypeError("Argument #0 should be a string or an object with a .toString() method")}}parseIdle(str,runtime);if(runtime.i>=str.length){throw new SyntaxError("Empty")}v=parseValue(str,runtime);parseIdle(str,runtime);if(runtime.i<str.length){throw new SyntaxError("Unexpected "+str[runtime.i])}return v}module.exports=parse;function parseIdle(str,runtime){var c;for(;runtime.i<str.length;runtime.i++){c=str.charCodeAt(runtime.i);if(c>32){return c}if(c===32||c===10||c===13||c===9){continue}throw new SyntaxError("Unexpected "+str[runtime.i])}return-1}function parseValue(str,runtime){var c;c=str.charCodeAt(runtime.i);if(c===45){runtime.i++;parseIdle(str,runtime);c=str.charCodeAt(runtime.i);if(c>=65&&c<=90||c>=97&&c<=122){runtime.i++;return parseLxonConstant(str,runtime,LXON_NEGATIVE_CONSTANTS)}if(c>=48&&c<=57){return parseNegativeNumber(str,runtime)}throw new SyntaxError("Unexpected "+str[runtime.i])}if(c>=48&&c<=57){return parseNumber(str,runtime)}runtime.i++;switch(c){case 123:return parseObject(str,runtime);case 91:return parseArray(str,runtime);case 34:return parseString(str,runtime);default:if(c>=65&&c<=90||c>=97&&c<=122){return parseLxonConstant(str,runtime)}throw new SyntaxError("Unexpected "+str[runtime.i-1])}}const LXON_CONSTANTS=new Map([["null",null],["false",false],["true",true],["NaN",NaN],["nan",NaN],["Infinity",Infinity],["infinity",Infinity],["off",false],["on",true],["no",false],["yes",true]]);const LXON_NEGATIVE_CONSTANTS=new Map([["Infinity",-Infinity],["infinity",-Infinity]]);function parseLxonConstant(str,runtime,constants=LXON_CONSTANTS){var c,id,j=runtime.i,l=str.length;for(;j<l;j++){c=str.charCodeAt(j);if(!(c>=65&&c<=90||c>=97&&c<=122)){break}}id=str.slice(runtime.i-1,j);if(!constants.has(id)){throw new SyntaxError("Unexpected "+id)}runtime.i=j;return constants.get(id)}function parseNumber(str,runtime){var match=str.slice(runtime.i).match(/^-?[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/)[0];runtime.i+=match.length;return parseFloat(match)}function parseNegativeNumber(str,runtime){var match=str.slice(runtime.i).match(/^[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/)[0];runtime.i+=match.length;return-parseFloat(match)}function parseString(str,runtime){var c,j=runtime.i,l=str.length,v="";for(;j<l;j++){c=str.charCodeAt(j);if(c===34||c===92||c<=31){if(c===34){v+=str.slice(runtime.i,j);runtime.i=j+1;return v}else if(c===92){v+=str.slice(runtime.i,j);runtime.i=j+1;v+=parseBackSlash(str,runtime);j=runtime.i-1}else if(c<=31){throw new SyntaxError("Unexpected control char 0x"+c.toString(16))}}}throw new SyntaxError("Unexpected end, expecting a double-quote.")}var parseBackSlashLookup_=function createParseBackSlashLookup(){var c=0,lookup=new Array(128);for(;c<128;c++){if(c===98){lookup[c]="\b"}else if(c===102){lookup[c]="\f"}else if(c===110){lookup[c]="\n"}else if(c===114){lookup[c]="\r"}else if(c===116){lookup[c]="\t"}else if(c===92){lookup[c]="\\"}else if(c===47){lookup[c]="/"}else if(c===34){lookup[c]='"'}else{lookup[c]=""}}return lookup}();function parseBackSlash(str,runtime){var v,c=str.charCodeAt(runtime.i);if(runtime.i>=str.length){throw new SyntaxError("Unexpected end")}if(c===117){runtime.i++;v=parseUnicode(str,runtime);return v}else if((v=parseBackSlashLookup_[c]).length){runtime.i++;return v}throw new SyntaxError('Unexpected token: "'+str[runtime.i]+'"')}function parseUnicode(str,runtime){if(runtime.i+3>=str.length){throw new SyntaxError("Unexpected end")}var match=str.slice(runtime.i,runtime.i+4).match(/[0-9a-f]{4}/);if(!match){throw new SyntaxError("Unexpected "+str.slice(runtime.i,runtime.i+4))}runtime.i+=4;return String.fromCharCode(Number.parseInt(match[0],16))}function parseLxonUnquotedKey(str,runtime){var c,v,j=runtime.i+1,l=str.length;for(;j<l;j++){c=str.charCodeAt(j);if(!(c>=64&&c<=90||c>=97&&c<=122||c>=48&&c<=57||c===95||c===36||c===45)){v=str.slice(runtime.i,j);runtime.i=j;return v}}throw new SyntaxError("Unexpected end, expecting a colon.")}function parseArray(str,runtime){var j=0,c,v=[];c=parseIdle(str,runtime);if(c===93){runtime.i++;return v}for(;;j++){v[j]=parseValue(str,runtime);c=parseIdle(str,runtime);switch(c){case 44:runtime.i++;break;case 93:runtime.i++;return v;default:throw new Error("Unexpected "+str[runtime.i])}parseIdle(str,runtime)}}function parseObject(str,runtime){var c,v,k;c=parseIdle(str,runtime);if(c===125){runtime.i++;return{}}v={};for(;;){k=parseKey(str,runtime,c);c=parseIdle(str,runtime);if(c!==58){throw new Error("Unexpected "+str[runtime.i])}runtime.i++;parseIdle(str,runtime);v[k]=parseValue(str,runtime);c=parseIdle(str,runtime);switch(c){case 44:runtime.i++;break;case 125:runtime.i++;return v;default:throw new Error("Unexpected "+str[runtime.i])}c=parseIdle(str,runtime)}}function parseKey(str,runtime,c){if(c>=64&&c<=90||c>=97&&c<=122||c>=48&&c<=57||c===95||c===36||c===45){return parseLxonUnquotedKey(str,runtime)}if(c!==34){throw new Error("Unexpected "+str[runtime.i])}runtime.i++;return parseString(str,runtime)}function getPath(object,path){var i=0,iMax=path.length,p=object;try{for(;i<iMax;i++){p=p[path[i]]}}catch(error){throw new Error("Bad ref: path not found")}return p}function parseSkipString(str,runtime){var c;for(;runtime.i<str.length;runtime.i++){c=str.charCodeAt(runtime.i);if(c===34||c===92){runtime.i++;if(c===34){return}}}throw new SyntaxError("Unexpected end")}function parseSkipNested(str,runtime){var c,depth=1;for(;runtime.i<str.length;runtime.i++){c=str.charCodeAt(runtime.i);if(c===91||c===123||c===93||c===125||c===34){if(c===91||c===123){depth++}else if(c===93||c===125){depth--;if(depth===0){runtime.i++;return}}else if(c===34){runtime.i++;parseSkipString(str,runtime);runtime.i--}}}throw new SyntaxError("Unexpected end")}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/builtin.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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
	if ( v && typeof v !== 'object' && typeof v !== 'string' ) { throw new Error( "Expecting an object, an array, a string, or empty value, but got a " + typeof v ) ; }
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
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/kfgCommon.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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





const Tag = require( './Tag.js' ) ;
const TagContainer = require( './TagContainer.js' ) ;
const Operator = require( './Operator.js' ) ;
const Ref = require( 'kung-fig-ref' ) ;
const DynamicInstance = require( 'kung-fig-dynamic-instance' ) ;
const Expression = require( 'kung-fig-expression' ) ;
const template = require( 'kung-fig-template' ) ;
const TemplateSentence = template.Sentence ;
const TemplateAtom = template.Atom ;



// Simple KFG object, having data and meta, useful for instanceof
exports.KFG = function KFG( data , meta ) {
	this.data = data ;
	this.meta = meta ;
} ;



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



MultiLine.prototype.construct = function() {
	var content ;

	switch ( this.type ) {
		case 'string' :
			return this.getContent() ;

		case 'TemplateSentence' :
			content = new TemplateSentence( this.getContent() , this.options ) ;

			if ( this.applicable ) {
				content.__isDynamic__ = false ;
				content.__isApplicable__ = true ;
			}

			return content ;

			/*
		case 'TemplateAtom' :
			content = TemplateAtom.parse( this.getContent() , this.options ) ;

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



MultiLine.prototype.getContent = function( foldMore ) {
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



function Instance( instanceOf , fn , parameters , extraParameters , isDynamic , isApplicable , parent , key , follow ) {
	this.instanceOf = instanceOf ;	// instance of / class name, as displayed in the KFG source file
	this.fn = fn ;	// constructor
	this.parameters = parameters ;
	this.extraParameters = extraParameters ;
	this.isDynamic = !! isDynamic ;
	this.isApplicable = !! isApplicable ;
	this.parent = parent ;
	this.key = key ;
	this.follow = !! follow ;
}

exports.Instance = Instance ;



/*
	Construct instances, it should be done AFTER loading dependencies
*/
Instance.constructAll = function( kfg , options ) {
	// Instances should be created children first, parent last.
	for ( let instance of kfg.meta.instances ) {
		Instance.construct( kfg , instance , options ) ;
	}
} ;



Instance.construct = function( kfg , instance , options ) {
	var parent , key , constructedInstance ;

	if ( instance.parent ) {
		parent = exports.getTarget( instance.parent ) ;
		key = instance.key ;

		if ( instance.follow ) {
			( { parent , key } = exports.getIndirectTarget( parent[ key ] ) ) ;
		}

		// Do nothing if a merged includeRef has removed the instance
		if ( parent[ key ] !== instance ) { return ; }
	}
	// Do nothing if a merged includeRef has removed the instance
	else if ( kfg.data !== instance ) { return ; }

	try {
		if ( instance.isDynamic || instance.isApplicable ) {
			constructedInstance = new DynamicInstance( instance.fn , instance.parameters , instance.extraParameters , instance.instanceOf ) ;
			constructedInstance.__isDynamic__ = instance.isDynamic ;
			constructedInstance.__isApplicable__ = instance.isApplicable ;
		}
		else {
			constructedInstance = instance.fn( instance.parameters , instance.extraParameters ) ;
		}
	}
	catch ( error ) {
		let newError = new SyntaxError( "Cannot construct '" + instance.instanceOf + "', constructor error: " + error ) ;
		newError.from = error ;
		throw newError ;
	}

	if ( instance.parent ) {
		parent[ key ] = constructedInstance ;
	}
	else {
		// If no parent, we are changing the root itself
		kfg.data = constructedInstance ;
	}
} ;



function IncludeRef( parent , key , follow , directory , refString , required = false , merge = false , position = null ) {
	this.parent = parent ;
	this.key = key ;
	this.follow = !! follow ;
	this.directory = directory ;
	this.required = !! required ;
	this.merge = merge || false ;	// possible values: false (replace the value), after (replace existing key), before (only unexisting keys)
	this.position = position ?? null ;
	this.isAppended = null ;

	[ this.path , this.innerPath ] = refString.split( '#' ) ;
}

exports.IncludeRef = IncludeRef ;



// Only used by the stringifier
function OutputIncludeRef( path , innerPath , required ) {
	this.path = path ;
	this.innerPath = innerPath ;
	this.required = !! required ;
}

exports.OutputIncludeRef = OutputIncludeRef ;

// /!\ Needs some escaping!!!
OutputIncludeRef.prototype.stringify = function() {
	var sign = this.required ? '@@' : '@' ;

	if ( this.path && this.innerPath ) { return sign + this.path + '#' + this.innerPath ; }
	if ( this.path ) { return sign + this.path ; }
	if ( this.innerPath ) { return sign + '#' + this.innerPath ; }

	// Root reference
	return sign + '#' ;
} ;



// Return a parent[ key ] to the real target
exports.getIndirectTarget = function( object ) {
	if ( object instanceof Tag ) {
		return { parent: object , key: 'content' } ;
	}

	if ( object instanceof TagContainer ) {
		return { parent: object , key: 'children' } ;
	}

	if ( object instanceof Instance ) {
		return { parent: object , key: 'parameters' } ;
	}

	if ( object instanceof Operator ) {
		return { parent: object , key: 'operand' } ;
	}

	return ;
} ;



// Get the target for an object: the place where children are attached
exports.getTarget = function( object ) {
	if ( object instanceof Tag ) { object = object.content ; }
	if ( object instanceof TagContainer ) { object = object.children ; }

	if ( object instanceof Instance ) { object = object.parameters ; }
	else if ( object instanceof Operator ) { object = object.operand ; }

	return object ;
} ;

/*
exports.getTarget = function( object ) {
	if ( object instanceof Tag ) { return getTarget( object.value ) ; }
	if ( object instanceof TagContainer ) { return getTarget( object.children ) ; }

	if ( object instanceof Instance ) { return getTarget( object.parameters ) ; }
	else if ( object instanceof Operator ) { return getTarget( object.operand ) ; }

	return object ;
} ;
*/



exports.containerType = function( object ) {
	if ( object === undefined ) { return ; }
	else if ( typeof object === 'string' ) { return 'string' ; }		// strings act like a pseudo-container in KFG format
	else if ( ! object || typeof object !== 'object' ) { return 'scalar' ; }
	else if ( object instanceof Tag ) { return exports.containerType( object.value ) ; }
	else if ( Array.isArray( object ) ) { return 'Array' ; }
	else if ( object instanceof Set ) { return 'Set' ; }
	else if ( object instanceof Map ) { return 'Map' ; }
	else if ( object instanceof TagContainer ) { return 'TagContainer' ; }
	else if ( object instanceof Instance ) { return 'Instance' ; }
	else if ( object instanceof MultiLine ) { return 'MultiLine' ; }
	else if ( object instanceof TemplateSentence ) { return 'TemplateSentence' ; }
	else if ( object instanceof TemplateAtom ) { return 'TemplateAtom' ; }
	else if ( object instanceof Operator ) { return 'Operator' ; }
	else if ( object instanceof Ref ) { return 'Ref' ; }
	else if ( object instanceof Expression ) { return 'Expression' ; }
	return 'Object' ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/Tag.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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





function Tag( tag , attributes , content , shouldParse ) {
	Object.defineProperties( this , {
		name: { value: tag , enumerable: true } ,
		parent: { value: null , writable: true } ,
		content: {
			value: content , writable: true , enumerable: true
		} ,
		attributes: {
			value: shouldParse ? this.parseAttributes( attributes ) : attributes || null , writable: true , enumerable: true
		} ,
		line: { value: null , writable: true } ,
		file: { value: null , writable: true } ,
		masterFile: { value: null , writable: true } ,
		relPath: { value: null , writable: true } ,
		uid: { value: null , writable: true } ,
		location: {
			get: function() {
				var loc ;
				loc = 'line: ' + this.line ;
				if ( this.file ) { loc += ' -- file: ' + this.file ; }
				return loc ;
			}
		}
	} ) ;
}

module.exports = Tag ;

Tag.prototype.__prototypeUID__ = 'kung-fig/Tag' ;
Tag.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



const TagContainer = require( './TagContainer.js' ) ;
const Dynamic = require( 'kung-fig-dynamic' ) ;



Tag.prototype.stringifyAttributes = function() {
	return typeof this.attributes === 'string' ? this.attributes.trim() : '' ;
} ;



Tag.prototype.parseAttributes = function( attributes ) {
	return attributes && typeof attributes === 'string' ? attributes.trim() : null ;
} ;



Tag.prototype.getParentTag = function() { return ( this.parent instanceof TagContainer ) && this.parent.tag ; } ;



Tag.prototype.getRecursiveFinalContent = // <-- DEPRECATED
Tag.prototype.extractContent = function( ctx , bound ) {
	return Dynamic.extractFromStatic( this.content , ctx , bound , true ) ;
} ;



Tag.prototype.findAncestor = function( tagName ) {
	var tag = this ;

	while ( ( tag = tag.getParentTag() ) ) {
		if ( tag.name === tagName ) { return tag ; }
	}

	return null ;
} ;



Tag.prototype.findAncestorKV = function( key , value ) {
	var tag = this ;

	while ( ( tag = tag.getParentTag() ) ) {
		if ( tag[ key ] === value ) { return tag ; }
	}

	return null ;
} ;



Tag.prototype.setTagContainer = function( children ) {
	if ( this.content instanceof TagContainer ) { this.content.tag = null ; }
	this.content = new TagContainer( children , this ) ;
} ;



Tag.prototype.appendTag = function( tag ) {
	if ( ! ( tag instanceof Tag ) ) { return ; }

	if ( ! this.content ) {
		this.setTagContainer( [ tag ] ) ;
		return ;
	}

	if ( this.content instanceof TagContainer ) {
		this.content.appendTag( tag ) ;
	}
} ;



Tag.prototype.insertTag = function( tag , position = 0 ) {
	if ( ! ( tag instanceof Tag ) ) { return ; }

	if ( ! this.content ) {
		this.setTagContainer( [ tag ] ) ;
		return ;
	}

	if ( this.content instanceof TagContainer ) {
		this.content.insertTag( tag , position ) ;
	}
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/TagContainer.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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





function TagContainer( children , tag ) {
	Object.defineProperties( this , {
		// The tag been a tag container, if any
		tag: { value: tag instanceof Tag ? tag : null , writable: true } ,
		children: {
			value: Array.isArray( children ) ? children : [] , writable: true , enumerable: true
		}
	} ) ;
}

module.exports = TagContainer ;

TagContainer.prototype.__prototypeUID__ = 'kung-fig/TagContainer' ;
TagContainer.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



const Tag = require( './Tag.js' ) ;



TagContainer.prototype.get = function( id ) {
	var i , iMax ;

	if ( ! id ) { return ; }

	for ( i = 0 , iMax = this.children.length ; i < iMax ; i ++ ) {
		if ( id === this.children[ i ].id ) { return this.children[ i ] ; }
	}
} ;



TagContainer.prototype.getTags = function( tagName ) {
	if ( ! tagName || typeof tagName !== 'string' ) { return ; }

	return this.children.filter( e => e.name === tagName ) ;
} ;



TagContainer.prototype.getFirstTag = function( tagName ) {
	var i , iMax ;

	if ( ! tagName || typeof tagName !== 'string' ) { return ; }

	for ( i = 0 , iMax = this.children.length ; i < iMax ; i ++ ) {
		if ( tagName === this.children[ i ].name ) { return this.children[ i ] ; }
	}
} ;



// Same than getFirstTag(), but throw if multiple or no tag exist of this type
TagContainer.prototype.getUniqueTag = function( tagName ) {
	if ( ! tagName || typeof tagName !== 'string' ) { return ; }

	var tags = this.children.filter( e => e.name === tagName ) ;

	if ( tags.length !== 1 ) {
		throw new Error( "Expecting exactly one '" + tagName + "', but found " + tags.length + "." ) ;
	}

	return tags[ 0 ] ;
} ;



TagContainer.prototype.appendTag = function( tag ) {
	if ( tag instanceof Tag ) {
		this.children.push( tag ) ;
	}
} ;



TagContainer.prototype.insertTag = function( tag , position = 0 ) {
	if ( tag instanceof Tag ) {
		this.children.splice( position , 0 , tag ) ;
	}
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/Operator.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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





function Operator( operator , operand , priorityGroup = null ) {
	this.operator = operator ;
	this.operand = operand ;
	this.priorityGroup = priorityGroup ;
}

module.exports = Operator ;

Operator.prototype.__prototypeUID__ = 'kung-fig/Operator' ;
Operator.prototype.__prototypeVersion__ = require( '../package.json' ).version ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/Meta.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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





const TagContainer = require( './TagContainer.js' ) ;
const kfgCommon = require( './kfgCommon.js' ) ;
const IncludeRef = kfgCommon.IncludeRef ;
//const Instance = kfgCommon.Instance ;



function Meta( options ) {
	this.tags = null ;
	this.instances = [] ;
	this.prependedIncludeRefs = [] ;
	this.appendedIncludeRefs = [] ;
	this.includeRefsPerParent = new Map() ;

	if ( options && options.tags ) {
		if ( options.tags instanceof TagContainer ) { this.tags = options.tags ; }
		else if ( Array.isArray( options.tags ) ) { this.tags = new TagContainer( options.tags ) ; }
		else { this.tags = new TagContainer() ; }
	}
	else {
		this.tags = new TagContainer() ;
	}
}

module.exports = Meta ;



// Clean meta before passing to userland
Meta.prototype.clean = function() {
	this.instances = null ;
	this.prependedIncludeRefs = null ;
	this.appendedIncludeRefs = null ;
	this.includeRefsPerParent = null ;
} ;



Meta.prototype.addInstance = function( instance ) {
	this.instances.push( instance ) ;
} ;



Meta.prototype.getIncludeRef = function( parent , key ) {
	var includeRefs = this.includeRefsPerParent.get( parent ) ;
	if ( ! includeRefs ) { return ; }
	return includeRefs.get( key ) ;
} ;



// Meta internal
Meta.prototype.storeIncludeRef = function( includeRef ) {
	var refs = this.includeRefsPerParent.get( includeRef.parent ) ;

	if ( ! refs ) {
		refs = new Map() ;
		this.includeRefsPerParent.set( includeRef.parent , refs ) ;
	}

	refs.set( includeRef.key , includeRef ) ;
} ;



Meta.prototype.addIncludeRef = function( includeRef ) {
	if ( includeRef.isAppended ) { this.appendedIncludeRefs.push( includeRef ) ; }
	else { this.prependedIncludeRefs.push( includeRef ) ; }
	this.storeIncludeRef( includeRef ) ;
} ;



Meta.prototype.appendIncludeRef = function( ... args ) {
	var includeRef = args[ 0 ] instanceof IncludeRef ? args[ 0 ] : new IncludeRef( ... args ) ;
	includeRef.isAppended = true ;
	this.appendedIncludeRefs.push( includeRef ) ;
	//console.log( ".appendedIncludeRefs:" , this.appendedIncludeRefs ) ;
	this.storeIncludeRef( includeRef ) ;
	return includeRef ;
} ;



Meta.prototype.prependIncludeRef = function( ... args ) {
	var includeRef = args[ 0 ] instanceof IncludeRef ? args[ 0 ] : new IncludeRef( ... args ) ;
	includeRef.isAppended = false ;
	this.prependedIncludeRefs.push( includeRef ) ;
	//console.log( ".prependedIncludeRefs:" , this.prependedIncludeRefs ) ;
	this.storeIncludeRef( includeRef ) ;
	return includeRef ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/clone.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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





//const builtin = require( './builtin.js' ) ;
const kfgCommon = require( './kfgCommon.js' ) ;
//const MultiLine = kfgCommon.MultiLine ;
const Instance = kfgCommon.Instance ;
const IncludeRef = kfgCommon.IncludeRef ;
//const DepthLimit = kfgCommon.DepthLimit ;
//const Tag = require( './Tag.js' ) ;
//const TagContainer = require( './TagContainer.js' ) ;
const OrderedObject = require( './OrderedObject.js' ) ;



// Clone for array element repetition

function clone( value , fromParent , fromParentKey , toParent , toParentKey , meta ) {
	var proto , cloned , key , element ;

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
			//for ( [ key , element ] of value ) { cloned.set( clone( key , ... ) , clone( element , value , key , cloned , clonedElement , meta ) ) ; }
			for ( [ key , element ] of value ) { cloned.set( key , clone( element , value , key , cloned , key , meta ) ) ; }
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
	var includeRef = meta.getIncludeRef( fromParent , fromParentKey ) ;
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
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/lib/OrderedObject.js' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
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





function OrderedObject( object , keys ) {
	if ( object && typeof object === 'object' ) {
		if ( ! Array.isArray( keys ) ) { keys = Object.keys( object ) ; }

		Object.defineProperties( this , {
			_keys: { value: keys }
		} ) ;

		for ( let i = 0 ; i < keys.length ; i ++ ) {
			this._addKeyValue( keys[ i ] , object[ keys[ i ] ] ) ;
		}
	}
	else {
		Object.defineProperties( this , {
			_keys: { value: [] }
		} ) ;
	}
}

OrderedObject.prototype = Object.create( Array.prototype ) ;
OrderedObject.prototype.constructor = OrderedObject ;

module.exports = OrderedObject ;

OrderedObject.prototype.__prototypeUID__ = 'kung-fig/OrderedObject' ;
OrderedObject.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



OrderedObject.prototype._addKeyValue = function( key , value ) {
	Object.defineProperty( this , key , {
		value: value ,
		enumerable: true ,
		configurable: true
	} ) ;

	if ( value && typeof value === 'object' ) {
		Object.defineProperties( value , {
			_key: { value: key } ,
			_index: {
				enumerable: true ,
				get: () => this._keys.indexOf( key )
			}
		} ) ;
	}
} ;



OrderedObject.prototype.push = function( key , value ) {
	if ( ! this[ key ] ) {
		this._keys.push( key ) ;
	}

	this._addKeyValue( key , value ) ;
} ;



OrderedObject.prototype.unshift =
OrderedObject.prototype.insert = function( key , value ) {
	if ( ! this[ key ] ) {
		this._keys.unshift( key ) ;
	}

	this._addKeyValue( key , value ) ;
} ;



OrderedObject.prototype.pop = function() {
	var key = this._keys.pop() ;

	if ( ! key ) { return ; }

	var value = this[ key ] ;
	delete this[ key ] ;

	return { key , value } ;
} ;



OrderedObject.prototype.shift = function() {
	var key = this._keys.shift() ;

	if ( ! key ) { return ; }

	var value = this[ key ] ;
	delete this[ key ] ;

	return { key , value } ;
} ;



OrderedObject.prototype[Symbol.iterator] = function* () {
	for ( let i = 0 ; i < this._keys.length ; i ++ ) {
		yield this[ this._keys[ i ] ] ;
	}
} ;



OrderedObject.prototype.entries = function* () {
	var i , key ;

	for ( i = 0 ; i < this._keys.length ; i ++ ) {
		key = this._keys[ i ] ;
		yield [ key , this[ key ] ] ;
	}
} ;



OrderedObject.prototype.toJSON = function() {
	var object = {
		//_keys: this._keys ,
		// if undefined, it will be cuted off the stringified string anyway:
		_index: this._index
	} ;

	// Needed because we want to ensure all the properties come
	// in the correct order in the JSON string
	for ( let i = 0 ; i < this._keys.length ; i ++ ) {
		object[ this._keys[ i ] ] = this[ this._keys[ i ] ] ;
	}

	return object ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/package.json' , '/' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {
  "name": "kung-fig",
  "version": "0.68.4",
  "engines": {
    "node": ">=16.13.0"
  },
  "description": "The Kung Fu of configuration files!",
  "main": "lib/kungFig.js",
  "directories": {
    "test": "test"
  },
  "dependencies": {
    "glob": "^10.4.5",
    "hash-kit": "^0.3.14",
    "kung-fig-common": "^0.43.1",
    "kung-fig-dynamic": "^0.43.2",
    "kung-fig-dynamic-instance": "^0.45.0",
    "kung-fig-expression": "^0.49.1",
    "kung-fig-ref": "^0.46.3",
    "kung-fig-template": "^0.50.1",
    "seventh": "^0.9.4",
    "stats-modifiers": "^0.8.1",
    "string-kit": "^0.19.3",
    "tree-kit": "^0.8.8"
  },
  "devDependencies": {
    "babel-tower": "^0.21.3",
    "sha1-uint8array": "^0.10.7"
  },
  "scripts": {
    "test": "tea-time -R dot"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/cronvel/kung-fig.git"
  },
  "keywords": [
    "config",
    "file",
    "kfg",
    "tag",
    "parse",
    "stringify",
    "loader",
    "JSON"
  ],
  "author": "Cédric Ronvel",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/cronvel/kung-fig/issues"
  },
  "config": {
    "tea-time": {
      "coverDir": [
        "lib"
      ]
    }
  },
  "copyright": {
    "title": "Kung Fig",
    "years": [
      2015,
      2021
    ],
    "owner": "Cédric Ronvel"
  }
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/[core]/node_modules/path-browserify' , '/[core]/node_modules/path-browserify/index.js' , '/[core]/node_modules/path' ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/[core]/node_modules/path-browserify/index.js' , '/[core]/node_modules/path-browserify' , '/[core]/node_modules/path/index.js' , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/kung-fig-common' , '/node_modules/kung-fig-common/lib/common.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-common/lib/common.js' , '/node_modules/kung-fig-common' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig common

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





module.exports = {
	constants: require( './constants.js' ) ,
	parsers: require( './parsers.js' ) ,
	stringifiers: require( './stringifiers.js' )
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-common/lib/constants.js' , '/node_modules/kung-fig-common' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig common

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





const constants = Object.create( null ) ;
module.exports = constants ;

constants['null'] = null ;
constants['true'] = true ;
constants['false'] = false ;
constants['on'] = true ;
constants['off'] = false ;
constants['yes'] = true ;
constants['no'] = false ;
constants['NaN'] = NaN ;
constants['Infinity'] = Infinity ;
constants['-Infinity'] = -Infinity ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-common/lib/parsers.js' , '/node_modules/kung-fig-common' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig common

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





const parsers = {} ;
module.exports = parsers ;



// Unquoted strings should at least contains a non-whitespace char
parsers.parseUnquotedString = ( str , runtime ) => {
	var l = runtime.iEndOfLine !== undefined ? runtime.iEndOfLine : str.length ;
	var v = str.slice( runtime.i , l ).trim() || undefined ;
	runtime.i = l ;
	return v ;
} ;



parsers.parseQuotedString = ( str , runtime ) => {
	var c , j = runtime.i , v = '' ,
		l = runtime.iEndOfLine !== undefined ? runtime.iEndOfLine : str.length ;

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;

		// This construct is intended: this is much faster (15%)
		if ( c === 0x22 || c === 0x5c || c <= 0x1f ) {
			if ( c === 0x22	) {
				// double quote = end of the string
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				return v ;
			}
			else if ( c === 0x5c ) {
				// backslash
				v += str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				v += parseBackSlash( str , runtime ) ;
				j = runtime.i - 1 ;
			}
			else if ( c <= 0x1f ) {
				// illegal
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + locationStr( runtime ) + ")" ) ;
			}
		}
	}

	throw new SyntaxError( "Unexpected end of line/string, expecting a double-quote (" + locationStr( runtime ) + ")" ) ;
} ;



// Skip a quoted string, without interpreting it
parsers.skipQuotedString = ( str , runtime ) => {
	var c ,
		l = runtime.iEndOfLine !== undefined ? runtime.iEndOfLine : str.length ;

	for ( ; runtime.i < l ; runtime.i ++ ) {
		c = str.charCodeAt( runtime.i ) ;

		// This construct is intended: this is much faster (15%)
		if ( c === 0x22 || c === 0x5c || c <= 0x1f ) {
			if ( c === 0x22	) {
				// double quote = end of the string
				runtime.i ++ ;
				return ;
			}
			else if ( c === 0x5c ) {
				// backslash
				runtime.i ++ ;
			}
			else if ( c <= 0x1f ) {
				// illegal
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + locationStr( runtime ) + ")" ) ;
			}
		}
	}

	throw new SyntaxError( "Unexpected end of line/string, expecting a double-quote (" + locationStr( runtime ) + ")" ) ;
} ;



var parseBackSlashLookup =
( function() {
	var c = 0 , lookup = new Array( 0x80 ) ;

	for ( ; c < 0x80 ; c ++ ) {
		if ( c === 0x62 ) { // b
			lookup[ c ] = '\b' ;
		}
		else if ( c === 0x66 ) { // f
			lookup[ c ] = '\f' ;
		}
		else if ( c === 0x6e ) { // n
			lookup[ c ] = '\n' ;
		}
		else if ( c === 0x72 ) { // r
			lookup[ c ] = '\r' ;
		}
		else if ( c === 0x74 ) { // t
			lookup[ c ] = '\t' ;
		}
		else if ( c === 0x5c ) { // backslash
			lookup[ c ] = '\\' ;
		}
		else if ( c === 0x2f ) { // slash
			lookup[ c ] = '/' ;
		}
		else if ( c === 0x22 ) { // double-quote
			lookup[ c ] = '"' ;
		}
		else {
			lookup[ c ] = '' ;
		}
	}

	return lookup ;
} )() ;



function parseBackSlash( str , runtime ) {
	var v , c = str.charCodeAt( runtime.i ) ;

	if ( runtime.i >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }

	if ( c === 0x75 ) { // u
		runtime.i ++ ;
		v = parseUnicode( str , runtime ) ;
		return v ;
	}
	else if ( ( v = parseBackSlashLookup[ c ] ).length ) {
		runtime.i ++ ;
		return v ;
	}

	throw new SyntaxError( 'Unexpected token: "' + str[ runtime.i ] + '" (' + locationStr( runtime ) + ")" ) ;
}



function parseUnicode( str , runtime ) {
	if ( runtime.i + 3 >= str.length ) { throw new SyntaxError( "Unexpected end" ) ; }

	var match = str.slice( runtime.i , runtime.i + 4 ).match( /[0-9a-f]{4}/ ) ;

	if ( ! match ) { throw new SyntaxError( "Unexpected " + str.slice( runtime.i , runtime.i + 4 ) + " (" + locationStr( runtime ) + ")" ) ; }

	runtime.i += 4 ;

	// Or String.fromCodePoint() ?
	return String.fromCharCode( Number.parseInt( match[ 0 ] , 16 ) ) ;
}



var numberLineRegexp = /^(([+-]?)[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)(%?)\s*$/ ;
var numberRegexp = /^(([+-]?)[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)(%?)/ ;

parsers.parseNumber = ( str , runtime , iEnd = null ) => {
	var part , matches ;

	if ( iEnd === null ) {
		iEnd = runtime.iEndOfLine ?? str.length ;
	}

	part = str.slice( runtime.i , iEnd ) ;
	matches = part.match( numberRegexp ) ;
	if ( ! matches ) { return NaN ; }	// NaN or undefined?

	runtime.i += matches[ 0 ].length ;	// or iEnd?
	return endParseNumber( matches ) ;
} ;



// Require a runtime.iEndOfLine
parsers.parseNumberOrUnquotedString = ( str , runtime ) => {
	var part , matches ;

	// Line mode: the number should finish the line (KFG number value)
	part = str.slice( runtime.i , runtime.iEndOfLine ) ;
	matches = part.match( numberLineRegexp ) ;
	if ( ! matches ) { return parsers.parseUnquotedString( str , runtime ) ; }
	runtime.i = runtime.iEndOfLine ;
	return endParseNumber( matches ) ;
} ;



function endParseNumber( matches ) {
	var number = parseFloat( matches[ 1 ] ) ;

	if ( matches[ 3 ] ) {
		// Percent mode
		number /= 100 ;
		// Relative percent mode
		if ( matches[ 2 ] ) { number += 1 ; }
	}

	return number ;
}



// Used to report errors
function locationStr( runtime , line ) {
	var loc ;
	loc = 'line: ' + ( line !== undefined ? line : runtime.lineNumber ) ;
	if ( runtime.file ) { loc += ' -- file: ' + runtime.file ; }
	return loc ;
}

parsers.locationStr = locationStr ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-common/lib/stringifiers.js' , '/node_modules/kung-fig-common' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig common

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





const stringifiers = {} ;
module.exports = stringifiers ;



var stringReplaceRegex_ = /[\x00-\x1f\x7f"\\]/g ;



stringifiers.stringifyQuotedString = str => '"' + stringifiers.escapeString( str ) + '"' ;
stringifiers.escapeString = str => str.replace( stringReplaceRegex_ , stringReplaceCallback ) ;



function stringReplaceCallback( match ) {
	return stringLookup_[ match.charCodeAt( 0 ) ] ;
}



var stringLookup_ =
( function createStringifyStringLookup() {
	var c = 0 , lookup = new Array( 0x80 ) ;

	for ( ; c < 0x80 ; c ++ ) {
		if ( c === 0x09 ) {
			// tab
			lookup[ c ] = '\\t' ;
		}
		else if ( c === 0x0a ) {
			// new line
			lookup[ c ] = '\\n' ;
		}
		else if ( c === 0x0d ) {
			// carriage return
			lookup[ c ] = '\\r' ;
		}
		else if ( c <= 0x0f ) {
			// control chars
			lookup[ c ] = '\\u000' + c.toString( 16 ) ;
		}
		else if ( c <= 0x1f ) {
			// control chars
			lookup[ c ] = '\\u00' + c.toString( 16 ) ;
		}
		else if ( c === 0x5c ) {
			// backslash
			lookup[ c ] = '\\\\' ;
		}
		else if ( c === 0x22 ) {
			// double-quote
			lookup[ c ] = '\\"' ;
		}
		else if ( c === 0x7f ) {
			// backslash
			lookup[ c ] = '\\u007f' ;
		}
		else {
			lookup[ c ] = String.fromCharCode( c ) ;
		}
	}

	return lookup ;
} )() ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/kung-fig-ref' , '/node_modules/kung-fig-ref/lib/Ref.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-ref/lib/Ref.js' , '/node_modules/kung-fig-ref' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Ref

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





const Dynamic = require( 'kung-fig-dynamic' ) ;
const common = require( 'kung-fig-common' ) ;



function Ref( path ) {
	this.refParts = null ;
	this.setRef( path ) ;
}

module.exports = Ref ;

Ref.prototype = Object.create( Dynamic.prototype ) ;
Ref.prototype.constructor = Ref ;
Ref.prototype.__prototypeUID__ = 'kung-fig/Ref' ;
Ref.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

Ref.serializerFnId = 'Ref' ;
Ref.prototype.clone = function() { return new Ref( this.refParts ) ; } ;



Ref.serializer = function( object ) {
	return {
		args: [ object.refParts ] ,
		overideKeys: [ '__isDynamic__' , '__isApplicable__' ]
	} ;
} ;



Ref.prototype.setRef = function( arg ) {
	if ( Array.isArray( arg ) ) {
		// Don't set, copy it
		this.refParts = Array.from( arg ) ;
	}
	else if ( typeof arg === 'string' ) {
		this.refParts = parseRefParts( arg , { i: 0 , iEndOfLine: arg.length } ) ;
	}
	else if ( arg === undefined || arg === null ) {
		this.refParts = [] ;
	}
	else {
		throw new TypeError( 'Ref#setRef() argument should be an array or a string' ) ;
	}
} ;



Ref.prototype.getPath = function( arg ) {
	return this.refParts[ this.refParts.length - 1 ] === '' ?  this.refParts.join( '.' ) + '.' :
		this.refParts.join( '.' ) ;
} ;



// Used by stats-modifiers
Ref.prototype.appendPart = function( part ) { this.refParts.push( part ) ; } ;



Ref.prototype.getValue = Ref.prototype.get = function( ctx , bound , getArray , fromApply ) {
	if ( ! this.__isDynamic__ && ( ! fromApply || ! this.__isApplicable__ ) ) { return getArray ? [ this ] : this ; }

	var part , lastValue ,
		value = ctx ,
		i = 0 ,
		iMax = this.refParts.length ;

	for ( ; i < iMax ; i ++ ) {
		part = this.refParts[ i ] ;

		if ( ! value || ( typeof value !== 'object' && typeof value !== 'function' ) ) { return getArray ? [] : undefined ; }

		if ( part && typeof part === 'object' && part.__prototypeUID__ === 'kung-fig/Ref' ) {
			part = part.get( ctx , false , false , fromApply ) ;
		}

		lastValue = value ;
		value = value[ part ] ;
	}

	if ( bound && typeof value === 'function' ) { value = value.bind( lastValue ) ; }

	// Autoboxing root, useful for Babel-Temple
	if ( ! iMax && value && typeof value === 'object'
		&& ( ( value instanceof Boolean ) || ( value instanceof Number ) || ( value instanceof String ) )
	) {
		value = value.valueOf() ;
	}

	return getArray ? [ value , lastValue , part ] : value ;
} ;



Ref.prototype.apply = function( ctx , bound , getArray ) { return this.get( ctx , bound , getArray , true ) ; } ;



Ref.prototype.set = function( ctx , v , defineOnly , unset ) {
	if ( ! this.__isDynamic__ || ! this.refParts.length || ! ctx || ( typeof ctx !== 'object' && typeof ctx !== 'function' ) ) {
		return ;
	}

	var part , lastPart , lastBase ,
		base = ctx ,
		i = 0 ,
		iMax = this.refParts.length - 1 ,
		key = this.refParts[ this.refParts.length - 1 ] ;

	if ( key && typeof key === 'object' && key.__prototypeUID__ === 'kung-fig/Ref' ) {
		key = key.get( ctx ) ;
	}

	for ( ; i < iMax ; i ++ ) {
		part = this.refParts[ i ] ;

		if ( part && typeof part === 'object' && part.__prototypeUID__ === 'kung-fig/Ref' ) {
			part = part.get( ctx ) ;
		}

		if ( ! base || ( typeof base !== 'object' && typeof base !== 'function' ) ) {
			if ( unset ) { return ; }

			// Auto-create
			if ( typeof part === 'number' ) { base = lastBase[ lastPart ] = [] ; }
			else { base = lastBase[ lastPart ] = {} ; }
		}

		lastBase = base ;
		lastPart = part ;
		base = base[ part ] ;
	}

	if ( ! base || ( typeof base !== 'object' && typeof base !== 'function' ) ) {
		if ( unset ) { return ; }

		// Auto-create
		if ( typeof key === 'number' ) { base = lastBase[ part ] = [] ; }
		else { base = lastBase[ part ] = {} ; }
	}

	if ( unset ) {
		delete base[ key ] ;
	}
	else if ( ! defineOnly || base[ key ] === undefined ) {
		base[ key ] = v ;
	}
} ;



// Shorthand to .set() with the 'defineOnly' argument on
Ref.prototype.define = function( ctx , v ) { return this.set( ctx , v , true ) ; } ;

// Shorthand to .set() with the 'unset' argument on
Ref.prototype.unset = function( ctx ) { return this.set( ctx , undefined , false , true ) ; } ;



Ref.prototype.getFinalValue = function( ctx , bound , getArray ) {
	var array , value ;

	if ( getArray ) {
		array = this.get( ctx , bound , true ) ;

		while ( array[ 0 ] && typeof array[ 0 ] === 'object' && array[ 0 ].__isDynamic__ ) {
			array = array[ 0 ].get( ctx , bound , true ) ;
		}

		return array ;
	}

	value = this ;

	while ( value && typeof value === 'object' && value.__isDynamic__ ) {
		value = value.get( ctx , bound ) ;
	}

	return value ;

} ;



// Call the function pointed by the Ref, and set 'this' to the second last element of the Ref, like javascript does.
Ref.prototype.callFn = function( ctx , ... args ) {
	if ( ! this.__isDynamic__ ) { return this ; }

	var array = this.get( ctx , false , true ) ;

	if ( typeof array[ 0 ] !== 'function' ) { throw new TypeError( 'Ref#callFn(): this does not point to a function' ) ; }

	return array[ 0 ].apply( array[ 1 ] , args ) ;
} ;



const STRINGIFIED_KEY_NEEDING_QUOTES_REGEX = /[\s"[\].$\x00-\x1f\x7f]/ ;

Ref.prototype.stringify = function() {
	var str = '$' ;

	this.refParts.forEach( ( part , index ) => {
		if ( part instanceof Ref ) {
			str += '[' + part.stringify() + ']' ;
		}
		else if ( typeof part === 'number' ) {
			str += '[' + part + ']' ;
		}
		else if ( STRINGIFIED_KEY_NEEDING_QUOTES_REGEX.test( part ) ) {
			str += '[' + common.stringifiers.stringifyQuotedString( part ) + ']' ;
		}
		else if ( index ) {
			str += '.' + part ;
		}
		else {
			str += part ;
		}
	} ) ;

	return str ;
} ;



const JS_KEY_NOT_NEEDING_QUOTES_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/ ;

Ref.prototype.toJs = function() {
	var str = 'ctx' ;

	this.refParts.forEach( ( part , index ) => {
		if ( part instanceof Ref ) {
			str += '?.[' + part.toJs() + ']' ;
		}
		else if ( typeof part === 'number' ) {
			str += '?.[' + part + ']' ;
		}
		else if ( JS_KEY_NOT_NEEDING_QUOTES_REGEX.test( part ) ) {
			str += '?.' + part ;
		}
		else {
			str += '?.[' + common.stringifiers.stringifyQuotedString( part ) + ']' ;
		}
	} ) ;

	return str ;
} ;



Ref.prototype.compile = function() {
	return new Function( 'ctx' , 'return ' + this.toJs() ) ;
} ;



/* Parser */



Ref.parseFromKfg = function( str , runtime , applicable ) {
	var v = new Ref( parseRefParts( str , runtime ) ) ;

	if ( applicable ) {
		v.__isDynamic__ = false ;
		v.__isApplicable__ = true ;
	}

	return v ;
} ;



Ref.parse = function( str , options ) {
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length
	} ;

	return new Ref( parseRefParts( str , runtime , options && options.noInitialDollar ) ) ;
} ;



function parseRefParts( str , runtime , noDollar ) {
	var parts = [] ;

	// This mode is useful for Babel Tower's parser
	if ( ! noDollar ) {
		if ( str[ runtime.i ] !== '$' ) {
			throw new SyntaxError( "This is not a Ref, it should start with a '$' sign" ) ;
		}

		runtime.i ++ ;
	}

	// Note: Kung-Fig Expression allow missing space before/after the parens
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] !== ' ' && str[ runtime.i ] !== '(' && str[ runtime.i ] !== ')' ) {
		if ( str[ runtime.i ] === '[' ) {
			runtime.i ++ ;
			parts.push( parseBracketedPart( str , runtime ) ) ;
		}
		else if ( str[ runtime.i ] === ']' ) {
			runtime.i ++ ;
			return parts ;
		}
		else {
			parts.push( parsePart( str , runtime ) ) ;
		}
	}

	return parts ;
}



function parsePart( str , runtime ) {
	var c , j = runtime.i , l = runtime.iEndOfLine , v = '' ;

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;

		// This construct is intended: this is much faster (15%)
		if ( c === 0x2e || c === 0x5b || c === 0x5d || c === 0x20 || c === 0x28 || c === 0x29 || c <= 0x1f ) {
			if ( c === 0x2e ) {
				// dot .
				v = str.slice( runtime.i , j ) ;
				runtime.i = j + 1 ;
				return v ;
			}
			else if ( c === 0x5b ) {
				// open bracket [
				v = str.slice( runtime.i , j ) ;
				runtime.i = j ;	// do not eat the bracket
				return v ;
			}
			else if ( c === 0x5d ) {
				// close bracket ]
				v = str.slice( runtime.i , j ) ;
				runtime.i = j ;	// do not eat the bracket
				return v ;
			}
			// Note: Kung-Fig Expression allow missing space before/after the parens
			else if ( c === 0x20 || c === 0x28 || c === 0x29 ) {
				// space
				v = str.slice( runtime.i , j ) ;
				runtime.i = j ;
				return v ;
			}
			else if ( c <= 0x1f ) {
				// illegal
				throw new SyntaxError( "Unexpected control char 0x" + c.toString( 16 ) + " (" + runtime.lineNumber + ")" ) ;
			}
		}
	}

	v = str.slice( runtime.i , j ) ;
	runtime.i = j + 1 ;
	return v ;
}



function parseBracketedPart( str , runtime ) {
	var c , j = runtime.i , l = runtime.iEndOfLine , v ;

	c = str.charCodeAt( runtime.i ) ;

	if ( c >= 0x30 && c <= 0x39 ) {
		// digit
		v = parseIndex( str , runtime ) ;
	}
	else {
		switch ( c ) {
			case 0x22 :		// " double-quote: this is a string key
				runtime.i ++ ;
				v = common.parsers.parseQuotedString( str , runtime ) ;
				break ;
			case 0x24 :		// $ dollar: this is sub-reference
				v = new Ref( parseRefParts( str , runtime ) ) ;
				break ;
		}
	}

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;

		if ( c === 0x5d ) {
			// close bracket ]
			runtime.i = j + 1 ;
			if ( str[ runtime.i ] === '.' ) { runtime.i ++ ; }
			return v ;
		}
	}

	throw new SyntaxError( 'Ref parse error: missing closing bracket' ) ;
}



function parseIndex( str , runtime ) {
	var c , j = runtime.i , l = runtime.iEndOfLine ;

	for ( ; j < l ; j ++ ) {
		c = str.charCodeAt( j ) ;
		if ( c < 0x30 && c > 0x39 ) { break ; }
	}

	return parseInt( str.slice( runtime.i , j ) , 10 ) ;
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-ref/package.json' , '/node_modules/kung-fig-ref' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {
  "name": "kung-fig-ref",
  "version": "0.46.3",
  "engines": {
    "node": ">=14.15.0"
  },
  "description": "Ref objects for kung-fig.",
  "main": "lib/Ref.js",
  "directories": {
    "test": "test"
  },
  "dependencies": {
    "kung-fig-common": "^0.43.0",
    "kung-fig-dynamic": "^0.43.2"
  },
  "scripts": {
    "test": "tea-time -R dot"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/cronvel/kung-fig-ref.git"
  },
  "keywords": [
    "kung-fig",
    "ref",
    "object"
  ],
  "author": "Cédric Ronvel",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/cronvel/kung-fig-ref/issues"
  },
  "config": {
    "tea-time": {
      "coverDir": [
        "lib"
      ]
    }
  },
  "copyright": {
    "title": "Kung Fig Ref",
    "years": [
      2015,
      2021
    ],
    "owner": "Cédric Ronvel"
  }
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/kung-fig-expression' , '/node_modules/kung-fig-expression/lib/Expression.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-expression/lib/Expression.js' , '/node_modules/kung-fig-expression' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Expression

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





const Dynamic = require( 'kung-fig-dynamic' ) ;
const Ref = require( 'kung-fig-ref' ) ;
//const Template = require( 'kung-fig-template' ) ;
const common = require( 'kung-fig-common' ) ;
const expressionConstants = require( './constants.js' ) ;
const mode = require( './mode.js' ) ;
const fnOperators = require( './fnOperators.js' ) ;

const NOTHING = {} ;



function Expression( fnOperator , args , operators = null ) {
	this.fnOperator = fnOperator ;	// null= just args
	this.args = args ;
	this.xop = operators ;	// if set, this is an object containing eXtra OPerators (userland operators)
}

Expression.prototype = Object.create( Dynamic.prototype ) ;
Expression.prototype.constructor = Expression ;

module.exports = Expression ;

Expression.prototype.__prototypeUID__ = 'kung-fig/Expression' ;
Expression.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

const Stack = Expression.Stack = require( './Stack.js' ) ;
const ObjectEntry = Expression.ObjectEntry = require( './ObjectEntry.js' ) ;
Expression.getNamedParameters = require( './getNamedParameters.js' ) ;



Expression.operators = fnOperators ;
Expression.constants = expressionConstants ;
Expression.mode = mode ;

Expression.serializerFnId = 'Expression' ;

Expression.serializer = function( object ) {
	return {
		args: [ object.fnOperator.id , object.args ] ,
		overideKeys: [ '__isDynamic__' , '__isApplicable__' ]
	} ;
} ;

Expression.unserializer = function( fnOperatorId , args , operators ) {
	return new Expression( fnOperators[ fnOperatorId ] , args , operators ) ;
} ;



Expression.prototype.clone = function() { return cloneValue( this ) ; } ;

function cloneValue( v ) {
	if ( ! v || typeof v !== 'object' ) { return v ; }
	if ( Array.isArray( v ) ) { return v.map( e => cloneValue( e ) ) ; }
	if ( v instanceof Stack ) { return new Stack( ... v.map( e => cloneValue( e ) ) ) ; }
	if ( v instanceof ObjectEntry ) { return v.map( e => cloneValue( e ) ) ; }
	if ( v instanceof Expression ) { return new Expression( v.fnOperator , cloneValue( v.args ) , v.xop ) ; }
	if ( v instanceof Ref ) { return v.clone() ; }

	var key , out = {} ;
	for ( key in v ) { out[ key ] = v[ key ] ; }
	return out ;
}



Expression.prototype.getValue = Expression.prototype.get = function( ctx ) {
	if ( ! this.__isDynamic__ ) { return this ; }
	//if ( this.fnOperator.useCall ) { return this.fnOperator.call( ... this.solveArgs( ctx , this.fnOperator.boundFirst ) ) ; }
	return this.fnOperator( ... this.solveArgs( ctx , this.fnOperator.boundFirst ) ) ;
} ;



Expression.prototype.apply = function( ctx ) {
	if ( ! this.__isApplicable__ ) { return this ; }
	//if ( this.fnOperator.useCall ) { return this.fnOperator.call( ... this.solveArgs( ctx , this.fnOperator.boundFirst ) ) ; }
	return this.fnOperator( ... this.solveArgs( ctx , this.fnOperator.boundFirst ) ) ;
} ;



// Should getValue() and getFinalValue() be the same?
Expression.prototype.getFinalValue = Expression.prototype.getValue ;



Expression.prototype.solveArgs = function( ctx , boundFirst ) {
	var solved = [] ;

	this.args.forEach( ( element , index ) => {
		if ( element && typeof element === 'object' && element.__isDynamic__ ) {
			element = element.getFinalValue( ctx , ! index && boundFirst ) ;
		}

		if ( element instanceof Stack ) {
			solved.push( ... element ) ;
		}
		else {
			solved.push( element ) ;
		}
	} ) ;

	return solved ;
} ;



// /!\ Should supports custom constants /!\
Expression.prototype.stringify = function() {
	var str ,
		strArray = this.args.map( e => this.stringifyArg( e ) ) ;

	switch ( this.fnOperator.mode ) {
		case mode.FN :
			str = this.fnOperator.id ;

			if ( strArray.length ) {
				str += '( ' ;
				strArray.forEach( ( e , i ) => {
					if ( ! i ) { str += e ; }
					else { str += ' , ' + e ; }
				} ) ;
				str += ' )' ;
			}

			return str ;

		case mode.SINGLE_OP :
			strArray.splice( this.args.length <= 1 ? 0 : 1 , 0 , this.fnOperator.id ) ;
			break ;

		case mode.MULTI_OP :
			if ( this.args.length <= 1 ) {
				strArray.splice( 0 , 0 , this.fnOperator.id ) ;
			}
			else {
				return strArray.join( ' ' + this.fnOperator.id + ' ' ) ;
			}
			break ;

		case mode.SINGLE_OP_BEFORE :
			strArray.unshift( this.fnOperator.id ) ;
			break ;

		case mode.SINGLE_OP_AFTER :
			strArray.splice( this.args.length ? 1 : 0 , 0 , this.fnOperator.id ) ;
			break ;

		case mode.LIST :
			if ( ! this.args.length ) { return '[]' ; }

			str = '[ ' ;
			strArray.forEach( ( e , i ) => {
				if ( ! i ) { str += e ; }
				else { str += ' , ' + e ; }
			} ) ;
			str += ' ]' ;
			return str ;

		case mode.KV :
			if ( ! this.args.length ) { return '{}' ; }

			str = '{ ' ;
			strArray.forEach( ( e , i ) => {
				if ( ! i ) { str += e ; }
				else { str += ' , ' + e ; }
			} ) ;
			str += ' }' ;
			return str ;

		default :
			strArray.splice( 0 , 0 , this.fnOperator.id ) ;
			break ;
	}

	return strArray.join( ' ' ) ;
} ;



Expression.prototype.stringifyArg = function( arg ) {
	if ( arg instanceof Ref ) { return arg.stringify() ; }
	if ( arg instanceof Expression ) { return '( ' + arg.stringify() + ' )' ; }
	if ( arg instanceof ObjectEntry ) { return this.stringifyArg( arg[ 0 ] ) + ': ' + this.stringifyArg( arg[ 1 ] ) ; }
	if ( typeof arg === 'number' ) {
		// /!\ Should supports custom constants /!\
		if ( arg === expressionConstants.pi ) { return 'pi' ; }
		if ( arg === expressionConstants.e ) { return 'e' ; }
		if ( arg === expressionConstants.phi ) { return 'phi' ; }
		return '' + arg ;
	}
	if ( typeof arg === 'string' ) { return common.stringifiers.stringifyQuotedString( arg ) ; }
	if ( typeof arg === 'boolean' ) { return arg ? 'true' : 'false' ; }
	return 'null' ;
} ;



const regularFnNameRegex = /^[a-zA-Z]+$/ ;

Expression.prototype.toJs = function() {
	var i , str ;

	if ( this.fnOperator.mode === mode.LIST ) {
		if ( ! this.args.length ) { return '[]' ; }

		str = '[ ' ;

		this.args.forEach( ( arg , index ) => {
			arg = this.argToJs( arg ) ;
			if ( ! index ) { str += arg ; }
			else { str += ' , ' + arg ; }
		} ) ;

		str += ' ]' ;

		return str ;
	}

	if ( this.fnOperator.mode === mode.KV ) {
		if ( ! this.args.length ) { return '{}' ; }

		str = '{ ' ;

		this.args.forEach( ( arg , index ) => {
			arg = this.argToJs( arg ) ;
			if ( ! index ) { str += arg ; }
			else { str += ' , ' + arg ; }
		} ) ;

		str += ' }' ;

		return str ;
	}

	if ( this.fnOperator.jsSpecial ) {
		// So this is a special JS syntax
		switch ( this.fnOperator.jsSpecial ) {
			case 'navigation' :
				if ( ! this.args.length ) { return this.fnToJs() ; }

				str = this.argToJs( this.args[ 0 ] ) ;

				for ( i = 1 ; i < this.args.length ; i ++ ) {
					str += '?.[' + this.argToJs( this.args[ i ] ) + ']' ;
				}

				return str ;

			case 'ternary' :
				if ( this.args.length <= 1 ) {
					return '!! ' + this.argToJs( this.args[ 0 ] , true ) ;
				}

				// Also support switch-case-like
				str = '' ;
				for ( i = 0 ; i < this.args.length - 1 ; i += 2 ) {
					str += this.argToJs( this.args[ i ] , true ) + ' ? ' + this.argToJs( this.args[ i + 1 ] , true ) + ' : ' ;
				}

				if ( i < this.args.length ) { str += this.argToJs( this.args[ i ] , true ) ; }
				else { str += 'false' ; }

				return str ;

			case 'call' :
				if ( ! this.args.length ) { return this.fnToJs() ; }
				if ( this.args.length === 1 ) { return this.argToJs( this.args[ 0 ] , true ) + '()' ; }

				str = this.argToJs( this.args[ 0 ] , true ) + '( ' ;

				for ( i = 1 ; i < this.args.length ; i ++ ) {
					if ( i === 1 ) { str += this.argToJs( this.args[ i ] ) ; }
					else { str += ' , ' + this.argToJs( this.args[ i ] ) ; }
				}

				str += ' )' ;

				return str ;

			case 'spread' :
				if ( ! this.args.length ) { return this.fnToJs() ; }
				return '... ' + this.argToJs( this.args[ 0 ] ) ;

			default :
				return this.fnToJs() ;
		}
	}

	if ( ! this.fnOperator.jsOp ) {
		return this.fnToJs() ;
	}

	// So this is an operator
	switch ( this.fnOperator.mode ) {
		case mode.SINGLE_OP :
			if ( ! this.args.length || this.args.length >= 3 ) { return this.fnToJs() ; }
			if ( this.args.length === 1 ) { return this.fnOperator.jsOp + ' ' + this.argToJs( this.args[ 0 ] , true ) ; }
			return this.argToJs( this.args[ 0 ] , true ) + ' ' + this.fnOperator.jsOp + ' ' + this.argToJs( this.args[ 1 ] , true ) ;

		case mode.MULTI_OP :
			if ( this.args.length <= 1 ) { return this.fnToJs() ; }

			str = '' ;

			this.args.forEach( ( arg , index ) => {
				arg = this.argToJs( arg , true ) ;
				if ( ! index ) { str += arg ; }
				else { str += ' ' + this.fnOperator.jsOp + ' ' + arg ; }
			} ) ;

			return str ;

		case mode.SINGLE_OP_BEFORE :
			if ( this.args.length !== 1 ) { return this.fnToJs() ; }
			return this.fnOperator.jsOp + ' ' + this.argToJs( this.args[ 0 ] , true ) ;

		case mode.SINGLE_OP_AFTER :
			if ( this.args.length !== 2 ) { return this.fnToJs() ; }
			return this.argToJs( this.args[ 0 ] , true ) + ' ' + this.fnOperator.jsOp + ' ' + this.argToJs( this.args[ 1 ] , true ) ;
	}

	return 'null' ;
} ;



Expression.prototype.fnToJs = function() {
	var str , skipFirstArg = false , hasArg = false ;

	if ( this.fnOperator.nativeJsMethod ) {
		if ( this.fnOperator.nativeJsMethodCast ) {
			switch ( this.fnOperator.nativeJsMethodCast ) {
				case 'boolean' :
					str = '( !! ' + this.argToJs( this.args[ 0 ] ) + ' )' ;
					break ;
				case 'number' :
					str = '( + ' + this.argToJs( this.args[ 0 ] ) + ' )' ;
					break ;
				case 'string' :
					str = typeof this.args[ 0 ] === 'string' ? common.stringifiers.stringifyQuotedString( this.args[ 0 ] )
						: "( '' + " + this.argToJs( this.args[ 0 ] ) + ' )' ;
					break ;
				default :
					str = '( ' + this.argToJs( this.args[ 0 ] ) + ' )' ;
			}
		}
		else {
			str = this.argToJs( this.args[ 0 ] ) ;
		}

		str += '.' + this.fnOperator.nativeJsMethod + '(' ;
		skipFirstArg = true ;
	}
	else if ( this.fnOperator.nativeJsFn ) {
		str = this.fnOperator.nativeJsFn + '(' ;
	}
	else if ( this.fnOperator.jsFn ) {
		str = ( this.fnOperator.xop ? 'xop.' : 'op.' ) + this.fnOperator.jsFn + '(' ;
	}
	else if ( regularFnNameRegex.test( this.fnOperator.id ) ) {
		str = ( this.fnOperator.xop ? 'xop.' : 'op.' ) + this.fnOperator.id + '(' ;
	}
	else {
		str = ( this.fnOperator.xop ? 'xop[' : 'op[' ) + common.stringifiers.stringifyQuotedString( this.fnOperator.id ) + '](' ;
	}

	this.args.forEach( ( arg , index ) => {
		if ( ! index ) {
			if ( ! skipFirstArg ) {
				str += ' ' + this.argToJs( arg ) ;
				hasArg = true ;
			}
		}
		else if ( index === 1 && skipFirstArg ) {
			str += ' ' + this.argToJs( arg ) ;
			hasArg = true ;
		}
		else {
			str += ' , ' + this.argToJs( arg ) ;
			hasArg = true ;
		}
	} ) ;

	str += hasArg ? ' )' : ')' ;

	return str ;
} ;



Expression.prototype.argToJs = function( arg , expressionInParens ) {
	if ( arg instanceof Ref ) { return arg.toJs() ; }
	if ( arg instanceof Expression ) { return expressionInParens ? '( ' + arg.toJs() + ' )' : arg.toJs() ; }
	if ( arg instanceof ObjectEntry ) { return this.argToJs( arg[ 0 ] ) + ': ' + this.argToJs( arg[ 1 ] ) ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg === 'string' ) { return common.stringifiers.stringifyQuotedString( arg ) ; }
	if ( typeof arg === 'boolean' ) { return arg ? 'true' : 'false' ; }
	return 'null' ;
} ;



Expression.prototype.compile = function() {
	return new Function( 'op' , 'xop' , 'ctx' , 'return ' + this.toJs() ).bind( undefined , fnOperators , this.xop || null ) ;
} ;



function isObjectNotEmpty( object ) {
	if ( object && typeof object === 'object' ) {
		for ( let key in object ) {
			if ( typeof object[ key ] === 'function' ) { return true ; }
		}
	}

	return false ;
}



Expression.parse = function( str , operators , constants ) {
	var runtime = {
		i: 0 ,
		iEndOfLine: str.length ,
		depth: 0 ,
		operators: isObjectNotEmpty( operators ) ? operators : null ,
		constants: isObjectNotEmpty( constants ) ? constants : null
	} ;

	var expression = parseExpression( str , runtime ) ;

	return expression ;
} ;



Expression.parseFromKfg = function( str , runtime ) {
	return parseExpression( str , runtime ) ;
} ;



function parseStack( str , runtime ) {
	var c , expression ,
		objectEntry = null ,
		stack = new Stack() ;

	while ( runtime.i < runtime.iEndOfLine ) {
		expression = parseExpression( str , runtime ) ;
		c = str[ runtime.i ] ;

		if ( expression !== undefined ) {
			if ( c === ':' ) {
				objectEntry = new ObjectEntry( expression ) ;
				stack.push( objectEntry ) ;
			}
			else if ( objectEntry ) {
				objectEntry.push( expression ) ;
				objectEntry = null ;
			}
			else {
				stack.push( expression ) ;
			}
		}


		if ( c === ')' || c === ']' || c === '}' ) {
			// Close the stack
			runtime.i ++ ;
			break ;
		}
		else if ( c === ',' ) {
			// Next expression
			runtime.i ++ ;
			continue ;
		}
		else if ( c === ':' ) {
			// Next expression
			runtime.i ++ ;
			continue ;
		}
	}

	return stack ;
}



function parseExpression( str , runtime ) {
	var c , lastArg = NOTHING , args = [] ;

	while ( runtime.i < runtime.iEndOfLine ) {
		if ( lastArg === NOTHING || typeof lastArg === 'function' ) { parseSpaces( str , runtime ) ; }
		else { parseSpacesMaybeOneSemiColon( str , runtime ) ; }

		// Parse space may reach the end of the line
		if ( runtime.i >= runtime.iEndOfLine ) { break ; }

		c = str[ runtime.i ] ;
		if ( c === ',' || c === ':' || c === ')' || c === ']' || c === '}' ) { break ; }

		lastArg = parseArgument( str , runtime ) ;
		args.push( lastArg ) ;
	}

	return fromArguments( args , runtime ) ;
}



function parseArgument( str , runtime ) {
	var c , stack ;

	c = str.charCodeAt( runtime.i ) ;

	if ( c >= 0x30 && c <= 0x39 ) {
		// digit
		return parseNumber( str , runtime ) ;
	}

	switch ( c ) {

		case 0x2d :	// - minus
		case 0x2b : // + plus
			c = str.charCodeAt( runtime.i + 1 ) ;
			if ( c >= 0x30 && c <= 0x39 ) {
				// digit
				return parseNumber( str , runtime ) ;
			}

			return parseFnKeyConst( str , runtime ) ;

		case 0x22 :	// "   double-quote: this is a string
			runtime.i ++ ;
			return common.parsers.parseQuotedString( str , runtime ) ;

		case 0x28 :	// (   open parenthesis: this is a sub-expression
			runtime.i ++ ;
			return parseStack( str , runtime ) ;

		case 0x5b :	// [   open bracket: this is an array and its sub-expression
			runtime.i ++ ;
			stack = parseStack( str , runtime ) ;
			return new Expression( fnOperators.array , stack , runtime.operators ) ;

		case 0x7b :	// {   open curly brace: this is an object and its sub-expression
			runtime.i ++ ;
			stack = parseStack( str , runtime ) ;
			return new Expression( fnOperators.object , stack , runtime.operators ) ;

		case 0x24 :	// $   dollar: maybe a Template or a Ref
			c = str.charCodeAt( runtime.i + 1 ) ;

			/* Disable Template support, maybe it will be re-introduced later
			if ( c === 0x22 ) {
				runtime.i += 2 ;
				return Template.parseFromKfg( str , runtime ) ;
			}
			*/

			//runtime.i ++ ;
			return Ref.parseFromKfg( str , runtime ) ;

		default :
			return parseFnKeyConst( str , runtime ) ;
	}
}



function fromArguments( args , runtime ) {
	var fnOperator , finalArgs ;

	if ( ! args.length ) { return ; }

	if ( typeof args[ 0 ] === 'function' ) {
		fnOperator = args[ 0 ] ;

		// We remove arguments that are identical to the operator, case like: 1 + 2 + 3 + ...
		args = unstackAndDedup( args , fnOperator ) ;
		return new Expression( fnOperator , args , runtime.operators ) ;
	}

	if ( typeof args[ 1 ] === 'function' ) {
		fnOperator = args[ 1 ] ;

		// We remove arguments that are identical to the operator, case like: 1 + 2 + 3 + ...
		args = unstackAndDedup( args , fnOperator ) ;
		return new Expression( fnOperator , args , runtime.operators ) ;
	}

	args = unstackAndDedup( args ) ;

	if ( args.length >= 1 ) {
		return args[ 0 ] ;
	}

	return ;
}



function unstackAndDedup( args , exclude = NOTHING ) {
	var replacement ;

	if ( args.some( e => e instanceof Stack ) ) {
		replacement = [] ;
		args.forEach( e => {
			//if ( e !== fnOperator )
			if ( e instanceof Stack ) {
				replacement.push( ... e ) ;
			}
			else if ( e !== exclude ) {
				replacement.push( e ) ;
			}
		} ) ;

		return replacement ;
	}
	else if ( exclude !== NOTHING ) {
		return args.filter( e => e !== exclude ) ;
	}

	return args ;
}



// Skip spaces
function parseSpaces( str , runtime ) {
	while ( runtime.i < runtime.iEndOfLine && str[ runtime.i ] === ' ' ) { runtime.i ++ ; }
}



function parseSpacesMaybeOneSemiColon( str , runtime ) {
	parseSpaces( str , runtime ) ;
	if ( str[ runtime.i ] === ';' ) {
		runtime.i ++ ;
		parseSpaces( str , runtime ) ;
	}
}



function afterSpacesChar( str , runtime , i ) {
	while ( i < runtime.iEndOfLine && str[ i ] === ' ' ) { i ++ ; }
	return str[ i ] ;
}



function parseNumber( str , runtime ) {
	var iEnd = nextSeparator( str , runtime ) ;
	var number = common.parsers.parseNumber( str , runtime , iEnd ) ;
	runtime.i = iEnd ;
	return number ;
}



// Find the next separator: space, parens, comma, colon, double-quote, dollar, brackets
function nextSeparator( str , runtime ) {
	var i = runtime.i ,
		eol = runtime.iEndOfLine ;

	for ( ; i < eol ; i ++ ) {

		switch ( str.charCodeAt( i ) ) {
			case 0x20 :	//     space
			case 0x28 :	// (   open parenthesis
			case 0x29 :	// )   close parenthesis
			case 0x2c :	// ,   comma
			case 0x3a :	// :   colon
			case 0x3b :	// ;   semi-colon
			case 0x22 :	// "   double-quote
			case 0x24 :	// $   dollar
			case 0x5b :	// [   open bracket
			case 0x5d :	// ]   close bracket
			case 0x7b :	// {   open curly brace
			case 0x7d :	// }   close curly brace
				return i ;
		}
	}

	// return i/eol
	return i ;
}



// An identifier that is a function, a key or a constant
function parseFnKeyConst( str_ , runtime ) {
	var separatorIndex = nextSeparator( str_ , runtime ) ;

	var str = str_.slice( runtime.i , separatorIndex ) ;
	//console.log( 'str before:' , str_ ) ;
	//console.log( 'str after:' , str ) ;

	//var indexOf ;
	//str = str.slice( runtime.i , runtime.iEndOfLine ) ;
	//if ( ( indexOf = str.indexOf( ' ' ) ) !== -1 ) { str = str.slice( 0 , indexOf ) ; }

	runtime.i += str.length ;

	if (
		str_[ separatorIndex ] === ':' ||
		( str_[ separatorIndex ] === ' ' && afterSpacesChar( str_ , runtime , separatorIndex ) === ':' )
	) {
		// This is a key, return the unquoted string
		return str ;
	}
	else if ( str in common.constants ) {
		return common.constants[ str ] ;
	}
	else if ( fnOperators[ str ] ) {
		return fnOperators[ str ] ;
	}
	else if ( str in expressionConstants ) {
		return expressionConstants[ str ] ;
	}
	else if ( runtime.operators && runtime.operators[ str ] ) {
		if ( ! runtime.operators[ str ].xop ) { runtime.operators[ str ].xop = true ; }	// Mark the function as being from extra operators
		return runtime.operators[ str ] ;
	}
	else if ( runtime.constants && ( str in runtime.constants ) ) {
		return runtime.constants[ str ] ;
	}

	throw new SyntaxError( "Unexpected '" + str + "' in expression" ) ;
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-expression/lib/constants.js' , '/node_modules/kung-fig-expression' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Expression

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





// Expression-specific constants

exports.pi = exports['π'] = Math.PI ;
exports.e = Math.E ;
exports.phi = exports['φ'] = 1.618033988749895 ;	// ( 1 + Math.sqrt( 5 ) ) / 2 ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-expression/lib/mode.js' , '/node_modules/kung-fig-expression' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Expression

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





exports.FN = 0 ;
exports.SINGLE_OP = 1 ;
exports.MULTI_OP = 2 ;
exports.SINGLE_OP_BEFORE = 3 ;
exports.SINGLE_OP_AFTER = 4 ;
exports.LIST = 5 ;
exports.KV = 6 ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-expression/lib/fnOperators.js' , '/node_modules/kung-fig-expression' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Expression

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





const mode = require( './mode.js' ) ;
const EMPTY_ARRAY = [] ;
const Stack = require( './Stack.js' ) ;
const ObjectEntry = require( './ObjectEntry.js' ) ;



// Utilities

function toDash( str ) {
	return str.replace( /^([A-Z])|([A-Z])/g , ( match , firstLetter , letter ) => {
		if ( firstLetter ) { return firstLetter.toLowerCase() ; }
		return '-' + letter.toLowerCase() ;
	} ) ;
}

function batchOfNativeStatic( scope , scopeName , fnNames ) {
	fnNames.forEach( fnName => {
		//exports[ fnName ] = scope[ fnName ] ;		// This would modify a native method
		exports[ fnName ] = ( ... args ) => scope[ fnName ]( ... args ) ;
		exports[ fnName ].mode = mode.FN ;
		exports[ fnName ].nativeJsFn = scopeName + '.' + fnName ;
	} ) ;
}

function batchOfNativeStringMethod( mode_ , turnToDash , fnNames ) {
	fnNames.forEach( fnName => {
		var opName = turnToDash ? toDash( fnName ) : fnName ;
		//exports[ opName ] = String.prototype[ fnName ] ;	// This would modify a native method
		exports[ opName ] = ( str , ... args ) => ( '' + str )[ fnName ]( ... args ) ;
		exports[ opName ].mode = mode_ ;
		//exports[ opName ].useCall = true ;
		exports[ opName ].nativeJsMethod = fnName ;
		exports[ opName ].nativeJsMethodCast = 'string' ;
	} ) ;
}



// Any change here should be reflected in the official Atom grammar package



// Arithmetic operators

exports.add = exports['+'] = ( ... args ) => {
	var sum = 0 ;
	args.forEach( e => sum += + e ) ;
	return sum ;
} ;
exports['+'].mode = mode.MULTI_OP ;
exports['+'].jsOp = '+' ;

exports.sub = exports['-'] = ( ... args ) => {
	if ( args.length === 1 ) { return -args[ 0 ] ; }	// unary minus

	var i = 1 , iMax = args.length , v ;

	v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v -= + args[ i ] ; }
	return v ;
} ;
exports['-'].mode = mode.MULTI_OP ;
exports['-'].jsOp = '-' ;

exports.mul = exports['*'] = ( ... args ) => {
	var v = 1 ;
	args.forEach( e => v *= + e ) ;
	return v ;
} ;
exports['*'].mode = mode.MULTI_OP ;
exports['*'].jsOp = '*' ;

exports.div = exports['/'] = ( ... args ) => {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v /= + args[ i ] ; }
	return v ;
} ;
exports['/'].mode = mode.MULTI_OP ;
exports['/'].jsOp = '/' ;

exports.intdiv = exports['\\'] = ( ... args ) => {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v = Math.trunc( v / ( + args[ i ] ) ) ; }
	return v ;
} ;
exports['\\'].mode = mode.MULTI_OP ;
exports['\\'].jsFn = 'intdiv' ;

exports.modulo = exports['%'] = ( ... args ) => {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v = v % ( + args[ i ] ) ; }
	return v ;
} ;
exports['%'].mode = mode.MULTI_OP ;
exports['%'].jsOp = '%' ;

exports.floordiv = exports['\\\\'] = ( ... args ) => {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v = Math.floor( v / ( + args[ i ] ) ) ; }
	return v ;
} ;
exports['\\\\'].mode = mode.MULTI_OP ;
exports['\\'].jsFn = 'floordiv' ;

// Positive modulo
exports.positiveModulo = exports['%+'] = ( ... args ) => {
	var i = 1 , iMax = args.length , v = + args[ 0 ] ;

	for ( ; i < iMax ; i ++ ) {
		v = v % ( + args[ i ] ) ;
		if ( v < 0 ) { v += + args[ i ] ; }
	}

	return v ;
} ;
exports['%+'].mode = mode.MULTI_OP ;
exports['%+'].jsFn = 'positiveModulo' ;



// Comparison operators

exports['>'] = ( ... args ) => {
	var i = 0 , iMax = args.length - 1 ;

	for ( ; i < iMax ; i ++ ) {
		// Intentional construct, because of NaN
		if ( ! ( args[ i ] > args[ i + 1 ] ) ) { return false ; }
	}

	return true ;
} ;
exports['>'].mode = mode.MULTI_OP ;
exports['>'].jsOp = '>' ;

exports['≥'] = exports['>='] = ( ... args ) => {
	var i = 0 , iMax = args.length - 1 ;

	for ( ; i < iMax ; i ++ ) {
		// Intentional construct, because of NaN
		if ( ! ( args[ i ] >= args[ i + 1 ] ) ) { return false ; }
	}

	return true ;
} ;
exports['>='].mode = mode.MULTI_OP ;
exports['>='].jsOp = '>=' ;

exports['<'] = ( ... args ) => {
	var i = 0 , iMax = args.length - 1 ;

	for ( ; i < iMax ; i ++ ) {
		// Intentional construct, because of NaN
		if ( ! ( args[ i ] < args[ i + 1 ] ) ) { return false ; }
	}

	return true ;
} ;
exports['<'].mode = mode.MULTI_OP ;
exports['<'].jsOp = '<' ;

exports['≤'] = exports['<='] = ( ... args ) => {
	var i = 0 , iMax = args.length - 1 ;

	for ( ; i < iMax ; i ++ ) {
		// Intentional construct, because of NaN
		if ( ! ( args[ i ] <= args[ i + 1 ] ) ) { return false ; }
	}

	return true ;
} ;
exports['<='].mode = mode.MULTI_OP ;
exports['<='].jsOp = '<=' ;

exports['==='] = exports['=='] = exports['='] = ( ... args ) => {
	var i = 0 , iMax = args.length - 1 ;

	for ( ; i < iMax ; i ++ ) {
		if ( args[ i ] !== args[ i + 1 ] ) { return false ; }
	}

	return true ;
} ;
exports['='].mode = mode.MULTI_OP ;
exports['='].jsOp = '===' ;

exports['≠'] = exports['!=='] = exports['!='] = ( ... args ) => {
	var i = 0 , iMax = args.length - 1 ;

	for ( ; i < iMax ; i ++ ) {
		if ( args[ i ] === args[ i + 1 ] ) { return false ; }
	}

	return true ;
} ;
exports['!='].mode = mode.MULTI_OP ;
exports['!='].jsOp = '!==' ;

// Around, almost equal to, with a factor
exports.around = exports['≈'] = exports['%='] = ( left , right , maxRate ) => {
	if ( left === right ) { return true ; }

	if (
		typeof left !== 'number' ||
		typeof right !== 'number' ||
		typeof maxRate !== 'number' ||
		! ( left * right > 0 )		// to catch NaN...
	) {
		return false ;
	}

	if ( maxRate < 1 ) { maxRate = 1 / maxRate ; }

	var deltaRate = left / right ;
	if ( deltaRate < 1 ) { deltaRate = 1 / deltaRate ; }

	return deltaRate <= maxRate ;
} ;
exports['%='].mode = mode.SINGLE_OP_AFTER ;
exports['%='].jsFn = 'around' ;

// Is equal to one of the following
exports['is-one-of'] = ( ... args ) => {
	var i , iMax = args.length ;

	for ( i = 1 ; i < iMax ; i ++ ) {
		if ( args[ 0 ] === args[ i ] ) { return true ; }
	}

	return false ;
} ;
exports['is-one-of'].mode = mode.SINGLE_OP_AFTER ;



// Logical operators

exports.not = exports['!'] = arg => ! arg ;
exports['!'].mode = mode.SINGLE_OP_BEFORE ;
exports['!'].jsOp = '!' ;

exports.and = ( ... args ) => {
	var i = 1 , iMax = args.length , v = args[ 0 ] ;
	for ( ; v && i < iMax ; i ++ ) { v = v && args[ i ] ; }
	return !! v ;
} ;
exports.and.mode = mode.MULTI_OP ;

exports.or = ( ... args ) => {
	var i = 1 , iMax = args.length , v = args[ 0 ] ;
	for ( ; ! v && i < iMax ; i ++ ) { v = v || args[ i ] ; }
	return !! v ;
} ;
exports.or.mode = mode.MULTI_OP ;

/* Iterative XOR variant
exports.xor = function xor( args )
{
	var i = 1 , iMax = args.length , v = !! args[ 0 ] ;
	for ( ; i < iMax ; i ++ ) { v ^= !! args[ i ] ; }
	return !! v ;
} ;
//*/

//* True exclusive XOR variant
exports.xor = ( ... args ) => {
	var i = 0 , iMax = args.length , trueCount = 0 ;
	for ( ; trueCount <= 1 && i < iMax ; i ++ ) { trueCount += args[ i ] && 1 || 0 ; }
	return trueCount === 1 ;
} ;
//*/
exports.xor.mode = mode.MULTI_OP ;

// Guard operator
exports.guard = exports['&&'] = ( ... args ) => {
	var i = 1 , iMax = args.length , v = args[ 0 ] ;
	for ( ; v && i < iMax ; i ++ ) { v = v && args[ i ] ; }
	return v ;
} ;
exports['&&'].mode = mode.MULTI_OP ;
exports['&&'].jsOp = '&&' ;

// Default operator
exports.default = exports['||'] = ( ... args ) => {
	var i = 1 , iMax = args.length , v = args[ 0 ] ;
	for ( ; ! v && i < iMax ; i ++ ) { v = v || args[ i ] ; }
	return v ;
} ;
exports['||'].mode = mode.MULTI_OP ;
exports['||'].jsOp = '||' ;

// Ternary, with switch-case-like behavior (like JS inline/nested ternaries)
exports['?'] = ( condition , trueExpr = true , ... args ) => {
	if ( condition ) { return trueExpr ; }

	// Switch-case-like
	var i , iMax ;
	for ( i = 0 , iMax = args.length ; i < iMax - 1 ; i += 2 ) {
		if ( args[ i ] ) { return args[ i + 1 ] ; }
	}

	if ( i < iMax ) { return args[ i ] ; }
	return false ;
} ;
exports['?'].mode = mode.SINGLE_OP_AFTER ;
exports['?'].jsSpecial = 'ternary' ;

// Null-coalescing
exports['??'] = ( value , defaultExpr = false ) => value != null ? value : defaultExpr ;	/* eslint-disable-line eqeqeq */
exports['??'].mode = mode.SINGLE_OP_AFTER ;
exports['??'].jsOp = '??' ;

// Three-way operator
exports.threeWay = exports['???'] = ( evaluation , negativeExpr , equalExpr , positiveExpr ) => {
	if ( evaluation < 0 ) { return negativeExpr ; }
	else if ( evaluation > 0 ) { return positiveExpr ; }
	return equalExpr ;
} ;
exports['???'].mode = mode.SINGLE_OP_AFTER ;
exports['???'].jsFn = 'threeWay' ;


// Cast

exports['<boolean>'] = ( value ) => !! value ;
exports['<boolean>'].mode = mode.SINGLE_OP_BEFORE ;

exports['<integer>'] =
exports['<int>'] = ( value ) => {
	value = Math.round( + value ) ;
	if ( isFinite( value ) ) { return value ; }
	return NaN ;
} ;
exports['<int>'].mode = mode.SINGLE_OP_BEFORE ;

exports['<float>'] =
exports['<number>'] = ( value ) => + value ;
exports['<number>'].mode = mode.SINGLE_OP_BEFORE ;

exports['<string>'] = ( value ) => '' + value ;
exports['<string>'].mode = mode.SINGLE_OP_BEFORE ;

exports['<Array>'] =
exports['<array>'] = ( value ) => {
	if ( value === undefined || value === null ) { return [] ; }
	if ( Array.isArray( value ) ) { return value ; }
	if ( typeof value[ Symbol.iterator ] === 'function' ) { return Array.from( value ) ; }
	return [ value ] ;
} ;
exports['<array>'].mode = mode.SINGLE_OP_BEFORE ;

exports['<Set>'] =
exports['<set>'] = ( value ) => {
	if ( value === undefined || value === null ) { return new Set() ; }
	if ( value instanceof Set ) { return value ; }
	if ( Array.isArray( value ) ) { return new Set( value ) ; }
	if ( typeof value[ Symbol.iterator ] === 'function' ) {
		let s = new Set() ;
		for ( let item of value ) { s.add( item ) ; }
		return s ;
	}
	return new Set( [ value ] ) ;
} ;
exports['<set>'].mode = mode.SINGLE_OP_BEFORE ;


// Rounding

exports.round = ( value , step = 1 ) => {
	if ( step === 1 ) { return Math.round( value ) ; }
	// use: value * ( 1 / step )
	// not: value / step
	// reason: epsilon rounding errors
	return step * Math.round( value * ( 1 / step ) ) ;
} ;
exports.round.mode = mode.FN ;

exports.floor = ( value , step = 1 ) => {
	if ( step === 1 ) { return Math.floor( value ) ; }
	// use: value * ( 1 / step )
	// not: value / step
	// reason: epsilon rounding errors
	return step * Math.floor( value * ( 1 / step ) ) ;
} ;
exports.floor.mode = mode.FN ;

exports.ceil = ( value , step = 1 ) => {
	if ( step === 1 ) { return Math.ceil( value ) ; }
	// use: value * ( 1 / step )
	// not: value / step
	// reason: epsilon rounding errors
	return step * Math.ceil( value * ( 1 / step ) ) ;
} ;
exports.ceil.mode = mode.FN ;

exports.trunc = ( value , step = 1 ) => {
	if ( step === 1 ) { return Math.trunc( value ) ; }
	// use: value * ( 1 / step )
	// not: value / step
	// reason: epsilon rounding errors
	return step * Math.trunc( value * ( 1 / step ) ) ;
} ;
exports.trunc.mode = mode.FN ;


// Various math functions

batchOfNativeStatic( Math , 'Math' , [
	'sign' , 'abs' ,
	'max' , 'min' ,
	'pow' , 'exp' ,
	'sqrt' , 'cbrt' ,
	'log' , 'log2' , 'log10' ,
	'cos' , 'sin' , 'tan' , 'acos' , 'asin' , 'atan' , 'atan2' , 'cosh' , 'sinh' , 'tanh' , 'acosh' , 'asinh' , 'atanh' ,
	'hypot'
] ) ;

// Aliases of native static function
exports['^'] = exports.pow ;

// Clamp a value, ensure it in bounds
exports.clamp = ( v , min , max ) =>
	min <= max ? ( v < min ? min : v > max ? max : v ) :
	( v < max ? max : v > min ? min : v ) ;
exports.clamp.mode = mode.FN ;

exports.avg = ( ... args ) => args.reduce( ( s , e ) => s + e , 0 ) / args.length ;
exports.avg.mode = mode.FN ;

// Linear interpolation, t should be [0;1]
exports.lerp = ( a , b , t ) => a + t * ( b - a ) ;
exports.lerp.mode = mode.FN ;

// Fourier series: fourier( t , period , [ weight1 , phase1 ] , [ weight2 , phase2 ] , ... )
// If a number is found instead of an array, it is a weight without phase change.
// If a phase is omitted, it uses the previous one.
exports.fourier = ( t , period , ... args ) => {
	var i , iMax , v = 0 , phase = 0 , weight ,
		baseF = ( 2 * Math.PI ) / period ;

	for ( i = 0 , iMax = args.length ; i < iMax ; i ++ ) {
		if ( Array.isArray( args[ i ] ) ) {
			weight = args[ i ][ 0 ] ;
			if ( args[ i ][ 1 ] !== undefined ) { phase = args[ i ][ 1 ] ; }
		}
		else {
			weight = args[ i ] ;
		}

		v += weight * Math.cos( ( i + 1 ) * baseF * t + phase ) ;
	}

	return v ;
} ;
exports.fourier.mode = mode.FN ;


// String operators

// Strcat
exports.strcat = exports['..'] = ( ... args ) => args.join( '' ) ;
exports['..'].mode = mode.MULTI_OP ;
exports['..'].jsOp = '+' ;

batchOfNativeStringMethod( mode.SINGLE_OP_AFTER , true , [
	'startsWith' , 'endsWith' , 'includes'
] ) ;

batchOfNativeStringMethod( mode.SINGLE_OP , true , [
	'indexOf' , 'lastIndexOf' , 'padStart' , 'padEnd' , 'slice'
] ) ;

batchOfNativeStringMethod( mode.FN , true , [
	'trim' , 'trimStart' , 'trimEnd' , 'toLowerCase' , 'toUpperCase'
] ) ;

// Aliases of native methods
exports.ltrim = exports['trim-start'] ;
exports.rtrim = exports['trim-end'] ;

// Trim also extra inner spaces
exports.itrim = ( str ) => ( '' + str ).trim().replace( /  +/g , ' ' ) ;
exports.itrim.mode = mode.FN ;



// Array operators

exports.array = ( ... args ) => args ;
exports.array.mode = mode.LIST ;

exports.concat = ( ... args ) => Array.prototype.concat.call( EMPTY_ARRAY , ... args ) ;
exports.concat.mode = mode.FN ;

exports.join = ( array , glue ) => {
	if ( ! Array.isArray( array ) ) { return array ; }
	return array.join( typeof glue === 'string' ? glue : '' ) ;
} ;
exports.join.mode = mode.FN ;


// Object operators

//exports[':'] =
exports.object = ( ... args ) => Object.fromEntries( args ) ;
exports.object.mode = mode.KV ;

// Must not modify existing, merge in a new object
exports.merge = ( ... args ) => Object.assign( {} , ... args ) ;
exports.merge.mode = mode.FN ;



// Type checker operators

exports['is-set?'] = ( value , trueExpr = true , falseExpr = false ) => value !== undefined ? trueExpr : falseExpr ;
exports['is-set?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-empty?'] = ( value , trueExpr = true , falseExpr = false ) => {
	var proto ;

	return ! value ? trueExpr :
		typeof value !== 'object' ? falseExpr :
		value.length === 0 ? trueExpr :
		value.size === 0 ? trueExpr :
		( proto = Object.getPrototypeOf( value ) ) === Object.prototype && Object.keys( value ).length === 0 ? trueExpr :
		proto === null && Object.keys( value ).length === 0 ? trueExpr :
		falseExpr ;
} ;
exports['is-empty?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-not-empty?'] = ( value , trueExpr = true , falseExpr = false ) => {
	var proto ;

	return ! value ? falseExpr :
		typeof value !== 'object' ? trueExpr :
		value.length === 0 ? falseExpr :
		value.size === 0 ? falseExpr :
		( proto = Object.getPrototypeOf( value ) ) === Object.prototype && Object.keys( value ).length === 0 ? falseExpr :
		proto === null && Object.keys( value ).length === 0 ? falseExpr :
		trueExpr ;
} ;
exports['is-not-empty?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-boolean?'] = ( value , trueExpr = true , falseExpr = false ) => typeof value === 'boolean' ? trueExpr : falseExpr ;
exports['is-boolean?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-number?'] = ( value , trueExpr = true , falseExpr = false ) => typeof value === 'number' ? trueExpr : falseExpr ;
exports['is-number?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-real?'] = ( value , trueExpr = true , falseExpr = false ) =>
	typeof value === 'number' && ! Number.isNaN( value ) && value !== Infinity && value !== -Infinity ? trueExpr : falseExpr ;
exports['is-real?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-integer?'] =
exports['is-int?'] = ( value , trueExpr = true , falseExpr = false ) =>
	typeof value === 'number' && ! Number.isNaN( value ) && value !== Infinity && value !== -Infinity && value === Math.round( value ) ? trueExpr : falseExpr ;
exports['is-int?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-string?'] = ( value , trueExpr = true , falseExpr = false ) => typeof value === 'string' ? trueExpr : falseExpr ;
exports['is-string?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-array?'] = ( value , trueExpr = true , falseExpr = false ) => Array.isArray( value ) ? trueExpr : falseExpr ;
exports['is-array?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-object?'] = ( value , trueExpr = true , falseExpr = false ) => value && typeof value === 'object' && ! Array.isArray( value ) ? trueExpr : falseExpr ;
exports['is-object?'].mode = mode.SINGLE_OP_AFTER ;

// It's boring since it doesn't follow the previous naming convention, but it clashes with "is-set?"
// which check if the value is set and not if it's a Set.
exports['is-a-set?'] = ( value , trueExpr = true , falseExpr = false ) => value instanceof Set ? trueExpr : falseExpr ;
exports['is-a-set?'].mode = mode.SINGLE_OP_AFTER ;

exports['is-map?'] = ( value , trueExpr = true , falseExpr = false ) => value instanceof Map ? trueExpr : falseExpr ;
exports['is-map?'].mode = mode.SINGLE_OP_AFTER ;

// Misc operators

exports.has = ( stack , searchValue ) => {
	if ( ! stack || typeof stack !== 'object' ) { return false ; }
	else if ( Array.isArray( stack ) ) { return stack.includes( searchValue ) ; }
	else if ( typeof stack.has === 'function' ) { return !! stack.has( searchValue ) ; }
	return false ;
} ;
exports.has.mode = mode.SINGLE_OP_AFTER ;



// Navigation operator
exports['.'] = ( pointer , ... args ) => {
	for ( let i = 0 , iMax = args.length ; i < iMax ; i ++ ) {
		if ( ! pointer || typeof pointer !== 'object' ) { return undefined ; }
		pointer = pointer[ args[ i ] ] ;
	}

	return pointer ;
} ;
exports['.'].mode = mode.MULTI_OP ;
exports['.'].jsSpecial = 'navigation' ;



// Spread operator
exports['...'] = arg => {
	if ( Array.isArray( arg ) ) {
		// Transform an array to a Stack
		return new Stack( ... arg ) ;
	}

	if ( arg && typeof arg === 'object' ) {
		// Transform an object to a Stack of ObjectEntry
		return new Stack( ... Object.entries( arg ).map( e => new ObjectEntry( ... e ) ) ) ;
	}

	return arg ;
} ;
exports['...'].mode = mode.SINGLE_OP_BEFORE ;
exports['...'].jsSpecial = 'spread' ;



// Apply operator
exports['->'] = ( fn , ... args ) => {
	if ( typeof fn !== 'function' ) { throw new SyntaxError( 'The apply operator needs a function as its left-hand-side operand' ) ; }
	return fn( ... args ) ;
} ;
exports['->'].boundFirst = true ;	// We need to bound the function, which is the first argument
exports['->'].mode = mode.SINGLE_OP_AFTER ;
exports['->'].jsSpecial = 'call' ;



// Unit conversion
const units = {} ;
// Use radian
units.deg = units.degree = units['°'] = v => v / 180 * Math.PI ;
// Use Kelvin
units.celsius = units['°C'] = v => v + 273.15 ;

for ( let unit in units ) {
	exports[ unit ] = units[ unit ] ;
	exports[ unit ].mode = mode.SINGLE_OP_AFTER ;
	exports[ unit ].jsFn = unit ;
}



// The function itself should know its identifier
for ( let key in exports ) {
	if ( ! exports[ key ].id ) { exports[ key ].id = key ; }
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-expression/package.json' , '/node_modules/kung-fig-expression' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {
  "name": "kung-fig-expression",
  "version": "0.49.1",
  "engines": {
    "node": ">=14.15.0"
  },
  "description": "Expression objects for kung-fig.",
  "main": "lib/Expression.js",
  "directories": {
    "test": "test"
  },
  "dependencies": {
    "kung-fig-common": "^0.43.0",
    "kung-fig-dynamic": "^0.43.2",
    "kung-fig-ref": "^0.46.3"
  },
  "scripts": {
    "test": "tea-time -R dot"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/cronvel/kung-fig-expression.git"
  },
  "keywords": [
    "kung-fig",
    "expression",
    "object"
  ],
  "author": "Cédric Ronvel",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/cronvel/kung-fig-expression/issues"
  },
  "config": {
    "tea-time": {
      "coverDir": [
        "lib"
      ]
    }
  },
  "copyright": {
    "title": "Kung Fig Expression",
    "years": [
      2015,
      2021
    ],
    "owner": "Cédric Ronvel"
  }
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-expression/lib/Stack.js' , '/node_modules/kung-fig-expression' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Expression

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





class Stack extends Array {
	constructor( ... args ) {
		if ( args.length === 1 ) {
			// The Array constructor is ambigous, with one argument, it is used as the array length, not as the first element
			super() ;
			this[ 0 ] = args[ 0 ] ;
		}
		else {
			super( ... args ) ;
		}
	}

	// This allow stack.map()/.slice()/etc to return an Array, not a Stack
	static get [Symbol.species]() { return Array ; }
}

module.exports = Stack ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-expression/lib/ObjectEntry.js' , '/node_modules/kung-fig-expression' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Expression

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





class ObjectEntry extends Array {
	constructor( ... args ) {
		super( ... args ) ;
	}

	getFinalValue( ctx ) {
		return this.map( e => e && typeof e === 'object' && e.__isDynamic__ ? e.getFinalValue( ctx ) : e ) ;
	}

	// Commented out because we DO WANT that .map() from .getFinalValue() DO return an ObjectEntry
	// This allow stack.map()/.slice()/etc to return an Array, not a Stack
	//static get [Symbol.species]() { return Array ; }
}

module.exports = ObjectEntry ;

ObjectEntry.prototype.__isDynamic__ = true ;
ObjectEntry.serializerFnId = 'Expression.ObjectEntry' ;

ObjectEntry.serializer = function( object ) {
	return {
		args: object.args ,
		overideKeys: [ '__isDynamic__' , '__isApplicable__' ]
	} ;
} ;

ObjectEntry.unserializer = function( ... args ) {
	return new ObjectEntry( ... args ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-expression/lib/getNamedParameters.js' , '/node_modules/kung-fig-expression' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Expression

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





const ObjectEntry = require( './ObjectEntry.js' ) ;



// .getNamedParameters( parameters, paramToNamedMapping , defaultNamedParameters )
module.exports = ( params , mapping , named = {} ) => {
	var firstNamed = null ;

	params.forEach( ( element , index ) => {
		if ( element instanceof ObjectEntry ) {
			if ( firstNamed === null ) { firstNamed = index ; }
			named[ element[ 0 ] ] = element[ 1 ] ;
		}
	} ) ;

	// Regular parameter MUST comes before the first named
	if ( firstNamed !== null ) { params.length = firstNamed ; }

	if ( mapping ) {
		for ( let i = 0 , iMax = Math.min( params.length , mapping.length ) ; i < iMax ; i ++ ) {
			named[ mapping[ i ] ] = params[ i ] ;
		}

		params.length = 0 ;
	}

	return named ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/kung-fig-template' , '/node_modules/kung-fig-template/lib/template.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-template/lib/template.js' , '/node_modules/kung-fig-template' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Template

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





module.exports = {
	//Template: require( './Template' ) ,	// future Babel Temple template
	Sentence: require( './Sentence.js' ) ,
	Atom: require( './Atom.js' )
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-template/lib/Sentence.js' , '/node_modules/kung-fig-template' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Template

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





const common = require( 'kung-fig-common' ) ;
//const Dynamic = require( 'kung-fig-dynamic' ) ;
const Babel = require( 'babel-tower' ) ;
const Sentence = Babel.Sentence ;



function TemplateSentence( template , locale = null ) {
	if ( typeof template !== 'string' ) { template = '' ; }
	Sentence.call( this , template , Babel.default , locale ) ;
}



TemplateSentence.prototype = Object.create( Sentence.prototype ) ;
TemplateSentence.prototype.constructor = TemplateSentence ;

module.exports = TemplateSentence ;

TemplateSentence.prototype.__prototypeUID__ = 'kung-fig/TemplateSentence' ;
TemplateSentence.prototype.__prototypeVersion__ = require( '../package.json' ).version ;
TemplateSentence.prototype.__isDynamic__ = true ;
TemplateSentence.prototype.__isApplicable__ = false ;

TemplateSentence.serializerFnId = 'TemplateSentence' ;



TemplateSentence.serializer = object => ( {
	args: [ object.key ] ,
	overideKeys: [ '__isDynamic__' , '__isApplicable__' ]
} ) ;



TemplateSentence.prototype.toString = function( ... args ) {
	if ( ! this.__isDynamic__ ) { return this.key ; }
	return this.toStringKFG( ... args ) ;
} ;



TemplateSentence.prototype.getRecursiveFinalValue =	// <-- DEPRECATED
TemplateSentence.prototype.getDeepFinalValue =
TemplateSentence.prototype.getFinalValue =
TemplateSentence.prototype.get =
TemplateSentence.prototype.getValue = function( ctx ) {
	return this.__isDynamic__ ? this.toStringKFG( ctx ) : this ;
} ;



TemplateSentence.prototype.apply = function( ctx ) {
	return this.__isApplicable__ ? this.toStringKFG( ctx ) : this ;
} ;



// For instance, there is no difference
TemplateSentence.parse = template => new TemplateSentence( template ) ;



TemplateSentence.parseFromKfg = ( str , runtime , applicable ) => {
	var v = new TemplateSentence( common.parsers.parseQuotedString( str , runtime ) , runtime.locale ) ;

	if ( applicable ) {
		v.__isDynamic__ = false ;
		v.__isApplicable__ = true ;
	}

	return v ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-template/lib/Atom.js' , '/node_modules/kung-fig-template' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Template

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





//const common = require( 'kung-fig-common' ) ;
//const Dynamic = require( 'kung-fig-dynamic' ) ;
const Babel = require( 'babel-tower' ) ;
const Atom = Babel.Atom ;



function TemplateAtom( atom , locale ) {
	if ( typeof atom === 'string' ) {
		Atom.call( this , undefined , locale ) ;
		this.parse( atom ) ;
	}
	else if ( atom && typeof atom === 'object' ) {
		// Give precedence to the object locale
		Atom.call( this , atom , atom.l !== undefined ? atom.l : locale ) ;
	}
	else {
		Atom.call( this , atom , locale ) ;
	}
}



TemplateAtom.prototype = Object.create( Atom.prototype ) ;
TemplateAtom.prototype.constructor = TemplateAtom ;

module.exports = TemplateAtom ;

TemplateAtom.prototype.__prototypeUID__ = 'kung-fig/TemplateAtom' ;
TemplateAtom.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

TemplateAtom.serializerFnId = 'TemplateAtom' ;



TemplateAtom.serializer = object => ( { overide: object } ) ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-template/package.json' , '/node_modules/kung-fig-template' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {
  "name": "kung-fig-template",
  "version": "0.50.1",
  "engines": {
    "node": ">=14.15.0"
  },
  "description": "TemplateSentence and TemplateElement objects for kung-fig.",
  "main": "lib/template.js",
  "directories": {
    "test": "test"
  },
  "dependencies": {
    "babel-tower": "^0.21.3",
    "kung-fig-common": "^0.43.0"
  },
  "scripts": {
    "test": "tea-time -R dot"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/cronvel/kung-fig-template.git"
  },
  "keywords": [
    "kung-fig",
    "template",
    "object"
  ],
  "author": "Cédric Ronvel",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/cronvel/kung-fig-template/issues"
  },
  "config": {
    "tea-time": {
      "coverDir": [
        "lib"
      ]
    }
  },
  "copyright": {
    "title": "Kung Fig Template",
    "years": [
      2015,
      2020
    ],
    "owner": "Cédric Ronvel"
  }
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/sha1-uint8array' , '/node_modules/sha1-uint8array/lib/sha1-uint8array.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/sha1-uint8array/lib/sha1-uint8array.js' , '/node_modules/sha1-uint8array' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/**
 * sha1-uint8array.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHash = void 0;
const K = [
    0x5a827999 | 0,
    0x6ed9eba1 | 0,
    0x8f1bbcdc | 0,
    0xca62c1d6 | 0,
];
const algorithms = {
    sha1: 1,
};
function createHash(algorithm) {
    if (algorithm && !algorithms[algorithm] && !algorithms[algorithm.toLowerCase()]) {
        throw new Error("Digest method not supported");
    }
    return new Hash();
}
exports.createHash = createHash;
class Hash {
    constructor() {
        this.A = 0x67452301 | 0;
        this.B = 0xefcdab89 | 0;
        this.C = 0x98badcfe | 0;
        this.D = 0x10325476 | 0;
        this.E = 0xc3d2e1f0 | 0;
        this._size = 0;
        this._sp = 0; // surrogate pair
        if (!sharedBuffer || sharedOffset >= 8000 /* N.allocTotal */) {
            sharedBuffer = new ArrayBuffer(8000 /* N.allocTotal */);
            sharedOffset = 0;
        }
        this._byte = new Uint8Array(sharedBuffer, sharedOffset, 80 /* N.allocBytes */);
        this._word = new Int32Array(sharedBuffer, sharedOffset, 20 /* N.allocWords */);
        sharedOffset += 80 /* N.allocBytes */;
    }
    update(data) {
        // data: string
        if ("string" === typeof data) {
            return this._utf8(data);
        }
        // data: undefined
        if (data == null) {
            throw new TypeError("Invalid type: " + typeof data);
        }
        const byteOffset = data.byteOffset;
        const length = data.byteLength;
        let blocks = (length / 64 /* N.inputBytes */) | 0;
        let offset = 0;
        // longer than 1 block
        if (blocks && !(byteOffset & 3) && !(this._size % 64 /* N.inputBytes */)) {
            const block = new Int32Array(data.buffer, byteOffset, blocks * 16 /* N.inputWords */);
            while (blocks--) {
                this._int32(block, offset >> 2);
                offset += 64 /* N.inputBytes */;
            }
            this._size += offset;
        }
        // data: TypedArray | DataView
        const BYTES_PER_ELEMENT = data.BYTES_PER_ELEMENT;
        if (BYTES_PER_ELEMENT !== 1 && data.buffer) {
            const rest = new Uint8Array(data.buffer, byteOffset + offset, length - offset);
            return this._uint8(rest);
        }
        // no more bytes
        if (offset === length)
            return this;
        // data: Uint8Array | Int8Array
        return this._uint8(data, offset);
    }
    _uint8(data, offset) {
        const { _byte, _word } = this;
        const length = data.length;
        offset = offset | 0;
        while (offset < length) {
            const start = this._size % 64 /* N.inputBytes */;
            let index = start;
            while (offset < length && index < 64 /* N.inputBytes */) {
                _byte[index++] = data[offset++];
            }
            if (index >= 64 /* N.inputBytes */) {
                this._int32(_word);
            }
            this._size += index - start;
        }
        return this;
    }
    _utf8(text) {
        const { _byte, _word } = this;
        const length = text.length;
        let surrogate = this._sp;
        for (let offset = 0; offset < length;) {
            const start = this._size % 64 /* N.inputBytes */;
            let index = start;
            while (offset < length && index < 64 /* N.inputBytes */) {
                let code = text.charCodeAt(offset++) | 0;
                if (code < 0x80) {
                    // ASCII characters
                    _byte[index++] = code;
                }
                else if (code < 0x800) {
                    // 2 bytes
                    _byte[index++] = 0xC0 | (code >>> 6);
                    _byte[index++] = 0x80 | (code & 0x3F);
                }
                else if (code < 0xD800 || code > 0xDFFF) {
                    // 3 bytes
                    _byte[index++] = 0xE0 | (code >>> 12);
                    _byte[index++] = 0x80 | ((code >>> 6) & 0x3F);
                    _byte[index++] = 0x80 | (code & 0x3F);
                }
                else if (surrogate) {
                    // 4 bytes - surrogate pair
                    code = ((surrogate & 0x3FF) << 10) + (code & 0x3FF) + 0x10000;
                    _byte[index++] = 0xF0 | (code >>> 18);
                    _byte[index++] = 0x80 | ((code >>> 12) & 0x3F);
                    _byte[index++] = 0x80 | ((code >>> 6) & 0x3F);
                    _byte[index++] = 0x80 | (code & 0x3F);
                    surrogate = 0;
                }
                else {
                    surrogate = code;
                }
            }
            if (index >= 64 /* N.inputBytes */) {
                this._int32(_word);
                _word[0] = _word[16 /* N.inputWords */];
            }
            this._size += index - start;
        }
        this._sp = surrogate;
        return this;
    }
    _int32(data, offset) {
        let { A, B, C, D, E } = this;
        let i = 0;
        offset = offset | 0;
        while (i < 16 /* N.inputWords */) {
            W[i++] = swap32(data[offset++]);
        }
        for (i = 16 /* N.inputWords */; i < 80 /* N.workWords */; i++) {
            W[i] = rotate1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]);
        }
        for (i = 0; i < 80 /* N.workWords */; i++) {
            const S = (i / 20) | 0;
            const T = (rotate5(A) + ft(S, B, C, D) + E + W[i] + K[S]) | 0;
            E = D;
            D = C;
            C = rotate30(B);
            B = A;
            A = T;
        }
        this.A = (A + this.A) | 0;
        this.B = (B + this.B) | 0;
        this.C = (C + this.C) | 0;
        this.D = (D + this.D) | 0;
        this.E = (E + this.E) | 0;
    }
    digest(encoding) {
        const { _byte, _word } = this;
        let i = (this._size % 64 /* N.inputBytes */) | 0;
        _byte[i++] = 0x80;
        // pad 0 for current word
        while (i & 3) {
            _byte[i++] = 0;
        }
        i >>= 2;
        if (i > 14 /* N.highIndex */) {
            while (i < 16 /* N.inputWords */) {
                _word[i++] = 0;
            }
            i = 0;
            this._int32(_word);
        }
        // pad 0 for rest words
        while (i < 16 /* N.inputWords */) {
            _word[i++] = 0;
        }
        // input size
        const bits64 = this._size * 8;
        const low32 = (bits64 & 0xffffffff) >>> 0;
        const high32 = (bits64 - low32) / 0x100000000;
        if (high32)
            _word[14 /* N.highIndex */] = swap32(high32);
        if (low32)
            _word[15 /* N.lowIndex */] = swap32(low32);
        this._int32(_word);
        return (encoding === "hex") ? this._hex() : this._bin();
    }
    _hex() {
        const { A, B, C, D, E } = this;
        return hex32(A) + hex32(B) + hex32(C) + hex32(D) + hex32(E);
    }
    _bin() {
        const { A, B, C, D, E, _byte, _word } = this;
        _word[0] = swap32(A);
        _word[1] = swap32(B);
        _word[2] = swap32(C);
        _word[3] = swap32(D);
        _word[4] = swap32(E);
        return _byte.slice(0, 20);
    }
}
const W = new Int32Array(80 /* N.workWords */);
let sharedBuffer;
let sharedOffset = 0;
const hex32 = num => (num + 0x100000000).toString(16).substr(-8);
const swapLE = (c => (((c << 24) & 0xff000000) | ((c << 8) & 0xff0000) | ((c >> 8) & 0xff00) | ((c >> 24) & 0xff)));
const swapBE = (c => c);
const swap32 = isBE() ? swapBE : swapLE;
const rotate1 = num => (num << 1) | (num >>> 31);
const rotate5 = num => (num << 5) | (num >>> 27);
const rotate30 = num => (num << 30) | (num >>> 2);
function ft(s, b, c, d) {
    if (s === 0)
        return (b & c) | ((~b) & d);
    if (s === 2)
        return (b & c) | (b & d) | (c & d);
    return b ^ c ^ d;
}
function isBE() {
    const buf = new Uint8Array(new Uint16Array([0xFEFF]).buffer); // BOM
    return (buf[0] === 0xFE);
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/[core]/node_modules/buffer' , '/[core]/node_modules/buffer/index.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/[core]/node_modules/buffer/index.js' , '/[core]/node_modules/buffer' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



const base64 = require('base64-js')
const ieee754 = require('ieee754')
const customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

const K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    const arr = new Uint8Array(1)
    const proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  const buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof SharedArrayBuffer !== 'undefined' &&
      (isInstance(value, SharedArrayBuffer) ||
      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  const valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  const b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length)
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  const length = byteLength(string, encoding) | 0
  let buf = createBuffer(length)

  const actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  const length = array.length < 0 ? 0 : checked(array.length) | 0
  const buf = createBuffer(length)
  for (let i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayView (arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    const copy = new Uint8Array(arrayView)
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
  }
  return fromArrayLike(arrayView)
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  let buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    const len = checked(obj.length) | 0
    const buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  let x = a.length
  let y = b.length

  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  let i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  const buffer = Buffer.allocUnsafe(length)
  let pos = 0
  for (i = 0; i < list.length; ++i) {
    let buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      if (pos + buf.length > buffer.length) {
        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf)
        buf.copy(buffer, pos)
      } else {
        Uint8Array.prototype.set.call(
          buffer,
          buf,
          pos
        )
      }
    } else if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    } else {
      buf.copy(buffer, pos)
    }
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  const len = string.length
  const mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  let loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  let loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  const i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  const len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (let i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  const len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (let i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  const len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (let i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  const length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  let str = ''
  const max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  let x = thisEnd - thisStart
  let y = end - start
  const len = Math.min(x, y)

  const thisCopy = this.slice(thisStart, thisEnd)
  const targetCopy = target.slice(start, end)

  for (let i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  let indexSize = 1
  let arrLength = arr.length
  let valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  let i
  if (dir) {
    let foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      let found = true
      for (let j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  const remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  const strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  let i
  for (i = 0; i < length; ++i) {
    const parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  const remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  let loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
      case 'latin1':
      case 'binary':
        return asciiWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  const res = []

  let i = start
  while (i < end) {
    const firstByte = buf[i]
    let codePoint = null
    let bytesPerSequence = (firstByte > 0xEF)
      ? 4
      : (firstByte > 0xDF)
          ? 3
          : (firstByte > 0xBF)
              ? 2
              : 1

    if (i + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  const len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  let res = ''
  let i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  let ret = ''
  end = Math.min(buf.length, end)

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  let ret = ''
  end = Math.min(buf.length, end)

  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  const len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  let out = ''
  for (let i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  const bytes = buf.slice(start, end)
  let res = ''
  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
  for (let i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  const len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  const newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUintLE =
Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  let val = this[offset]
  let mul = 1
  let i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUintBE =
Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  let val = this[offset + --byteLength]
  let mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUint8 =
Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUint16LE =
Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUint16BE =
Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUint32LE =
Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUint32BE =
Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const lo = first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24

  const hi = this[++offset] +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    last * 2 ** 24

  return BigInt(lo) + (BigInt(hi) << BigInt(32))
})

Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const hi = first * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    this[++offset]

  const lo = this[++offset] * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    last

  return (BigInt(hi) << BigInt(32)) + BigInt(lo)
})

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  let val = this[offset]
  let mul = 1
  let i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  let i = byteLength
  let mul = 1
  let val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  const val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  const val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const val = this[offset + 4] +
    this[offset + 5] * 2 ** 8 +
    this[offset + 6] * 2 ** 16 +
    (last << 24) // Overflow

  return (BigInt(val) << BigInt(32)) +
    BigInt(first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24)
})

Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE (offset) {
  offset = offset >>> 0
  validateNumber(offset, 'offset')
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    boundsError(offset, this.length - 8)
  }

  const val = (first << 24) + // Overflow
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    this[++offset]

  return (BigInt(val) << BigInt(32)) +
    BigInt(this[++offset] * 2 ** 24 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 8 +
    last)
})

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUintLE =
Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  let mul = 1
  let i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUintBE =
Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  let i = byteLength - 1
  let mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUint8 =
Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUint16LE =
Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUint16BE =
Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUint32LE =
Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUint32BE =
Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function wrtBigUInt64LE (buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7)

  let lo = Number(value & BigInt(0xffffffff))
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  return offset
}

function wrtBigUInt64BE (buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7)

  let lo = Number(value & BigInt(0xffffffff))
  buf[offset + 7] = lo
  lo = lo >> 8
  buf[offset + 6] = lo
  lo = lo >> 8
  buf[offset + 5] = lo
  lo = lo >> 8
  buf[offset + 4] = lo
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset + 3] = hi
  hi = hi >> 8
  buf[offset + 2] = hi
  hi = hi >> 8
  buf[offset + 1] = hi
  hi = hi >> 8
  buf[offset] = hi
  return offset + 8
}

Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE (value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
})

Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE (value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
})

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    const limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  let i = 0
  let mul = 1
  let sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    const limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  let i = byteLength - 1
  let mul = 1
  let sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE (value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
})

Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE (value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
})

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  const len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      const code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  let i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    const bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    const len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// CUSTOM ERRORS
// =============

// Simplified versions from Node, changed for Buffer-only usage
const errors = {}
function E (sym, getMessage, Base) {
  errors[sym] = class NodeError extends Base {
    constructor () {
      super()

      Object.defineProperty(this, 'message', {
        value: getMessage.apply(this, arguments),
        writable: true,
        configurable: true
      })

      // Add the error code to the name to include it in the stack trace.
      this.name = `${this.name} [${sym}]`
      // Access the stack to generate the error message including the error code
      // from the name.
      this.stack // eslint-disable-line no-unused-expressions
      // Reset the name to the actual name.
      delete this.name
    }

    get code () {
      return sym
    }

    set code (value) {
      Object.defineProperty(this, 'code', {
        configurable: true,
        enumerable: true,
        value,
        writable: true
      })
    }

    toString () {
      return `${this.name} [${sym}]: ${this.message}`
    }
  }
}

E('ERR_BUFFER_OUT_OF_BOUNDS',
  function (name) {
    if (name) {
      return `${name} is outside of buffer bounds`
    }

    return 'Attempt to access memory outside buffer bounds'
  }, RangeError)
E('ERR_INVALID_ARG_TYPE',
  function (name, actual) {
    return `The "${name}" argument must be of type number. Received type ${typeof actual}`
  }, TypeError)
E('ERR_OUT_OF_RANGE',
  function (str, range, input) {
    let msg = `The value of "${str}" is out of range.`
    let received = input
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
      received = addNumericalSeparator(String(input))
    } else if (typeof input === 'bigint') {
      received = String(input)
      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
        received = addNumericalSeparator(received)
      }
      received += 'n'
    }
    msg += ` It must be ${range}. Received ${received}`
    return msg
  }, RangeError)

function addNumericalSeparator (val) {
  let res = ''
  let i = val.length
  const start = val[0] === '-' ? 1 : 0
  for (; i >= start + 4; i -= 3) {
    res = `_${val.slice(i - 3, i)}${res}`
  }
  return `${val.slice(0, i)}${res}`
}

// CHECK FUNCTIONS
// ===============

function checkBounds (buf, offset, byteLength) {
  validateNumber(offset, 'offset')
  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
    boundsError(offset, buf.length - (byteLength + 1))
  }
}

function checkIntBI (value, min, max, buf, offset, byteLength) {
  if (value > max || value < min) {
    const n = typeof min === 'bigint' ? 'n' : ''
    let range
    if (byteLength > 3) {
      if (min === 0 || min === BigInt(0)) {
        range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`
      } else {
        range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` +
                `${(byteLength + 1) * 8 - 1}${n}`
      }
    } else {
      range = `>= ${min}${n} and <= ${max}${n}`
    }
    throw new errors.ERR_OUT_OF_RANGE('value', range, value)
  }
  checkBounds(buf, offset, byteLength)
}

function validateNumber (value, name) {
  if (typeof value !== 'number') {
    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value)
  }
}

function boundsError (value, length, type) {
  if (Math.floor(value) !== value) {
    validateNumber(value, type)
    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value)
  }

  if (length < 0) {
    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()
  }

  throw new errors.ERR_OUT_OF_RANGE(type || 'offset',
                                    `>= ${type ? 1 : 0} and <= ${length}`,
                                    value)
}

// HELPER FUNCTIONS
// ================

const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  let codePoint
  const length = string.length
  let leadSurrogate = null
  const bytes = []

  for (let i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  const byteArray = []
  for (let i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  let c, hi, lo
  const byteArray = []
  for (let i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  let i
  for (i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
const hexSliceLookupTable = (function () {
  const alphabet = '0123456789abcdef'
  const table = new Array(256)
  for (let i = 0; i < 16; ++i) {
    const i16 = i * 16
    for (let j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

// Return not function with Error if BigInt not supported
function defineBigIntMethod (fn) {
  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn
}

function BufferBigIntNotDefined () {
  throw new Error('BigInt not supported')
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/kung-fig-dynamic' , '/node_modules/kung-fig-dynamic/lib/Dynamic.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-dynamic/lib/Dynamic.js' , '/node_modules/kung-fig-dynamic' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Dynamic

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





function Dynamic() { throw new Error( 'Dynamic should be derived' ) ; }
module.exports = Dynamic ;

Dynamic.prototype.__prototypeUID__ = 'kung-fig/Dynamic' ;
Dynamic.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

// It is either dynamic or applicable, but not both
Dynamic.prototype.__isDynamic__ = true ;
Dynamic.prototype.__isApplicable__ = false ;



Dynamic.prototype.getValue = Dynamic.prototype.get = function( /* ctx , bound */ ) { throw new Error( 'Dynamic#get() / Dynamic#getValue() should be overloaded' ) ; } ;
Dynamic.prototype.set = function( /* ctx , v */ ) { throw new Error( 'Dynamic#set() should be overloaded' ) ; } ;
Dynamic.prototype.apply = function( /* ctx , bound */ ) { throw new Error( 'Dynamic#apply() should be overloaded' ) ; } ;



Dynamic.prototype.toString = function( ctx ) {
	return '' + this.getFinalValue( ctx ) ;
} ;



Dynamic.prototype.getFinalValue = function( ctx , bound ) {
	var value = this ;

	while ( value && typeof value === 'object' && value.__isDynamic__ ) {
		value = value.getValue( ctx , bound ) ;
	}

	return value ;
} ;



Dynamic.prototype.getRecursiveFinalValue =
Dynamic.prototype.getDeepFinalValue = function( ctx , bound ) {
	return Dynamic.getDeepFinalValue( this , ctx , bound ) ;
} ;



Dynamic.prototype.extractFromStatic = function( ctx , bound ) {
	return Dynamic.extractFromStatic( this , ctx , bound ) ;
} ;



Dynamic.get = Dynamic.getValue = function( value , ctx , bound ) {
	if ( value && typeof value === 'object' && value.__isDynamic__ ) { return value.getValue( ctx , bound ) ; }
	return value ;
} ;



Dynamic.apply = function( value , ctx , bound ) {
	if ( value && typeof value === 'object' && value.__isApplicable__ ) { return value.apply( ctx , bound ) ; }
	return value ;
} ;



Dynamic.getFinalValue = function( value , ctx , bound ) {
	if ( value && typeof value === 'object' && value.__isDynamic__ ) { return value.getFinalValue( ctx , bound ) ; }
	return value ;
} ;



const OBJECTS_SEEN = new Set() ;

// Same than Dynamic.getDeepFinalValue() but check for circular dependencies
Dynamic.getSafeFinalValue = function( value , ctx , bound ) {
	if ( value && typeof value === 'object' && value.__isDynamic__ ) {
		if ( OBJECTS_SEEN.has( value ) ) { return undefined ; }
		OBJECTS_SEEN.add( value ) ;
		let newValue = value.getFinalValue( ctx , bound ) ;
		OBJECTS_SEEN.delete( value ) ;
		return newValue ;
	}

	return value ;
} ;



// Return true if the value constains dynamics at any depth, and thus should be cloned
Dynamic.isDeepDynamic = function( value ) {
	if ( ! value || typeof value !== 'object' ) { return false ; }
	if ( value.__isDynamic__ ) { return true ; }

	if ( Array.isArray( value ) ) {
		return value.some( e => Dynamic.isDeepDynamic( e ) ) ;
	}

	// Only clone plain objects
	var proto = Object.getPrototypeOf( value ) ;
	if ( proto === Object.prototype || proto === null ) {
		return Object.keys( value ).some( k => Dynamic.isDeepDynamic( value[ k ] ) ) ;
	}

	return false ;
} ;



Dynamic.getRecursiveFinalValue =
Dynamic.getDeepFinalValue = function( originalValue , ctx , bound , fromStatic = false ) {
	var clone , proto ,
		value = Dynamic.getFinalValue( originalValue , ctx , bound ) ;

	// After Dynamic.getFinalValue(), value can't be dynamic anymore

	// The value returned by .getFinalValue(), even if it's an object, should not be deep-inspected,
	// it is the responsibility of the instance's .getFinalValue() to call Dynamic.getDeepFinalValue()
	// all by itself if it needs to resolve further more.
	if ( ! value || typeof value !== 'object' || value !== originalValue ) { return value ; }

	// If there is no dynamic, there is no need to clone anything
	if ( ! fromStatic && ! Dynamic.isDeepDynamic( value ) ) { return value ; }

	// Here we have to clone, because there are some dynamics

	if ( Array.isArray( value ) ) {
		return value.map( v => Dynamic.getDeepFinalValue( v , ctx , bound , fromStatic ) ) ;
	}

	if ( fromStatic && typeof value.clone === 'function' ) { return value.clone() ; }

	// Only clone plain objects
	proto = Object.getPrototypeOf( value ) ;
	if ( proto === Object.prototype || proto === null ) {
		clone = {} ;
		Object.keys( value ).forEach( k => {
			clone[ k ] = Dynamic.getDeepFinalValue( value[ k ] , ctx , bound , fromStatic ) ;
		} ) ;

		return clone ;
	}

	return value ;
} ;



// Extract the value from the parsed script, all non-immutable objects have to be cloned, because a unique uncorrelated value
// could be extracted multiple times from the same “static script template” (e.g.: static script data inside a loop or a function).
Dynamic.extractFromStatic = function( originalValue , ctx , bound ) {
	return Dynamic.getDeepFinalValue( originalValue , ctx , bound , true ) ;
} ;



// For the record, until the transition is successful
Dynamic.prototype.getRecursiveFinalValue_old = function( ctx , bound ) {
	return Dynamic.getRecursiveFinalValue_old( this , ctx , bound ) ;
} ;

Dynamic.getRecursiveFinalValue_old = function( value , ctx , bound , clone1stGen ) {
	var k , copy , proto , originalValue = value , changed = false ;

	value = Dynamic.getFinalValue( value , ctx , bound ) ;

	// It should not be needed to check dynamic/applicable, since they shouldn't have the Object/null proto
	//if ( value && typeof value === 'object' && ! value.__isDynamic__ && ! value.__isApplicable__ ) {
	if ( value && typeof value === 'object' ) {
		copy = value ;

		proto = Object.getPrototypeOf( value ) ;

		if ( Array.isArray( value ) ) {
			if ( originalValue === value ) { copy = [] ; }

			value.forEach( ( v , i ) => {
				copy[ i ] = Dynamic.getRecursiveFinalValue_old( value[ i ] , ctx , bound , originalValue === value && clone1stGen ) ;
				changed = changed || copy[ i ] !== value[ i ] ;
			} ) ;
		}
		// Only clone plain objects
		else if ( proto === Object.prototype || proto === null ) {
			if ( originalValue === value ) { copy = {} ; }

			// 'for in' because we DO want to patch non-owned properties as well
			for ( k in value ) {
				copy[ k ] = Dynamic.getRecursiveFinalValue_old( value[ k ] , ctx , bound , originalValue === value && clone1stGen ) ;
				changed = changed || copy[ k ] !== value[ k ] ;
			}
		}

		// Do not use the copy if it is identical to the value
		if ( changed || clone1stGen ) { value = copy ; }
		//value = copy ;
	}

	return value ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-dynamic/package.json' , '/node_modules/kung-fig-dynamic' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {
  "name": "kung-fig-dynamic",
  "version": "0.43.2",
  "engines": {
    "node": ">=6.0.0"
  },
  "description": "Interface for Dynamic kung-fig objects.",
  "main": "lib/Dynamic.js",
  "directories": {
    "test": "test"
  },
  "dependencies": {},
  "devDependencies": {},
  "scripts": {
    "test": "tea-time -R dot"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/cronvel/kung-fig-dynamic.git"
  },
  "keywords": [
    "kung-fig",
    "dynamic",
    "object"
  ],
  "author": "Cédric Ronvel",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/cronvel/kung-fig-dynamic/issues"
  },
  "config": {
    "tea-time": {
      "coverDir": [
        "lib"
      ]
    }
  },
  "copyright": {
    "title": "Kung Fig Dynamic",
    "years": [
      2015,
      2021
    ],
    "owner": "Cédric Ronvel"
  }
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/kung-fig-dynamic-instance' , '/node_modules/kung-fig-dynamic-instance/lib/DynamicInstance.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-dynamic-instance/lib/DynamicInstance.js' , '/node_modules/kung-fig-dynamic-instance' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Kung Fig Dynamic Instance

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





const Dynamic = require( 'kung-fig-dynamic' ) ;
//const common = require( 'kung-fig-common' ) ;



function DynamicInstance( fn , parameters , extraParameters , name ) {
	this.fn = fn ;
	this.parameters = parameters ;
	this.extraParameters = extraParameters ;
	this.name = name || fn.stringifyId || fn.serializerId || fn.id || fn.name ;
}



DynamicInstance.prototype = Object.create( Dynamic.prototype ) ;
DynamicInstance.prototype.constructor = DynamicInstance ;

module.exports = DynamicInstance ;

DynamicInstance.prototype.__prototypeUID__ = 'kung-fig/DynamicInstance' ;
DynamicInstance.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

DynamicInstance.serializerFnId = 'DynamicInstance' ;



DynamicInstance.serializer = function( object ) {
	//throw new Error( 'DynamicInstance.serializer(): not coded!' ) ;
	// jsbindat should support serializing registered functions
	return {
		args: [ object.fn , object.parameters , object.extraParameters , object.name ] ,
		overideKeys: [ '__isDynamic__' , '__isApplicable__' ]
	} ;
} ;



DynamicInstance.prototype.getValue = DynamicInstance.prototype.get = function( ctx ) {
	if ( ! this.__isDynamic__ ) { return this ; }
	return this.fn( Dynamic.getRecursiveFinalValue( this.parameters , ctx ) , this.extraParameters ) ;
} ;



DynamicInstance.prototype.apply = function( ctx ) {
	if ( ! this.__isApplicable__ ) { return this ; }
	return this.fn( Dynamic.getRecursiveFinalValue( this.parameters , ctx ) , this.extraParameters ) ;
} ;



// Not sure if it should be done here
//DynamicInstance.prototype.stringify = function() {} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/kung-fig-dynamic-instance/package.json' , '/node_modules/kung-fig-dynamic-instance' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {
  "name": "kung-fig-dynamic-instance",
  "version": "0.45.0",
  "engines": {
    "node": ">=6.0.0"
  },
  "description": "Dynamic instances for kung-fig.",
  "main": "lib/DynamicInstance.js",
  "directories": {
    "test": "test"
  },
  "dependencies": {
    "kung-fig-dynamic": "^0.43.1"
  },
  "scripts": {
    "test": "tea-time -R dot"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/cronvel/kung-fig-dynamic-instance.git"
  },
  "keywords": [
    "kung-fig",
    "dynamic",
    "instance"
  ],
  "author": "Cédric Ronvel",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/cronvel/kung-fig-dynamic-instance/issues"
  },
  "config": {
    "tea-time": {
      "coverDir": [
        "lib"
      ]
    }
  },
  "copyright": {
    "title": "Kung Fig Dynamic Instance",
    "years": [
      2015,
      2021
    ],
    "owner": "Cédric Ronvel"
  }
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/stats-modifiers' , '/node_modules/stats-modifiers/lib/stats-modifiers.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/stats-modifiers.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





exports.Stat = require( './Stat.js' ) ;
exports.StatsTable = require( './StatsTable.js' ) ;
exports.Modifier = require( './Modifier.js' ) ;
exports.ModifiersTable = require( './ModifiersTable.js' ) ;

exports.NestedStats = require( './NestedStats.js' ) ;
exports.WildNestedStats = require( './WildNestedStats.js' ) ;

exports.NumberStat = require( './NumberStat.js' ) ;
exports.StringStat = require( './StringStat.js' ) ;
exports.TemplateStat = require( './TemplateStat.js' ) ;
exports.Traits = require( './Traits.js' ) ;

exports.CompoundStat = require( './CompoundStat.js' ) ;

exports.Pool = require( './Pool.js' ) ;

exports.HistoryGauge = require( './HistoryGauge.js' ) ;
exports.HistoryGaugeEntry = exports.HistoryGauge.Entry ;

exports.HistoryAlignometer = require( './HistoryAlignometer.js' ) ;
exports.HistoryAlignometerEntry = exports.HistoryAlignometer.Entry ;



const common = require( './common.js' ) ;
exports.SYMBOL_PARENT = common.SYMBOL_PARENT ;	// For unit test
exports.SYMBOL_PATH_KEY = common.SYMBOL_PATH_KEY ;
exports.UNPROXY = common.SYMBOL_UNPROXY ;
exports.createCloneId = common.createCloneId ;
exports.unitTestResetCloneId = common.unitTestResetCloneId ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/Stat.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





function Stat( base = null , parentTable = null , pathKey = null ) {
	this[ common.SYMBOL_PARENT ] = parentTable ;
	this.pathKey = pathKey ;
	this.base = base ;
	this.constraints = null ;	// TODO?

	this.proxy = {} ;
}

Stat.prototype.__prototypeUID__ = 'stats-modifiers/Stat' ;
Stat.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

module.exports = Stat ;



const NumberStat = require( './NumberStat.js' ) ;
const StringStat = require( './StringStat.js' ) ;
const TemplateStat = require( './TemplateStat.js' ) ;
const Traits = require( './Traits.js' ) ;
const CompoundStat = require( './CompoundStat.js' ) ;

const common = require( './common.js' ) ;



Stat.prototype.operandType = null ;
Stat.prototype.hasWildChildren = false ;

Stat.prototype.proxyMethods = {} ;
Stat.prototype.proxyEnumerableProperties = [ 'base' , 'actual' ] ;
Stat.prototype.proxyProperties = {} ;
Stat.prototype.proxyWritableProperties = {} ;
Stat.prototype.proxyGetters = {} ;
Stat.prototype.proxySetters = {} ;



Stat.create = function( parentTable , pathKey , params , clone ) {
	// Here params is always considered as immutable object

	if ( params instanceof Stat ) { return params.clone( parentTable , pathKey ) ; }

	var type = common.autoTypeOf( params ) ;
	//console.log( "Stat.create():" , type , params ) ;

	if ( type === 'number' ) { return new NumberStat( params , parentTable , pathKey ) ; }
	if ( type === 'string' ) { return new StringStat( params , parentTable , pathKey ) ; }
	if ( type === 'set' ) { return new Traits( params , parentTable , pathKey ) ; }

	if ( ! params || typeof params !== 'object' ) { return new Stat( params , parentTable , pathKey ) ; }

	// First, unproxy it if necessary
	if ( params[ common.SYMBOL_UNPROXY ] ) { params = params[ common.SYMBOL_UNPROXY ] ; }

	// Stat and all derivated
	if ( params instanceof Stat ) {
		if ( clone ) { return params.clone( parentTable , pathKey ) ; }
		params[ common.SYMBOL_PARENT ] = parentTable ;
		params.pathKey = pathKey ;
		return params ;
	}

	if ( params.__prototypeUID__ === 'kung-fig/Operator' ) {
		return new CompoundStat( params.operator , params.operand , parentTable , pathKey ) ;
	}

	if ( params.__prototypeUID__ === 'kung-fig/Expression' || params.__prototypeUID__ === 'kung-fig/Ref' ) {
		return new CompoundStat( params , parentTable , pathKey ) ;
	}

	if ( params.__prototypeUID__ === 'kung-fig/TemplateSentence' ) {
		return new TemplateStat( params , parentTable , pathKey ) ;
	}

	throw new Error( "Stat.create(): bad parameters" ) ;
} ;



Stat.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return new Stat( this.base , parentTable , pathKey ) ;
} ;



// Used when reassigning to a new parent
Stat.prototype.fixAttachment = function( to , key ) {
	if ( ! to[ common.SYMBOL_PARENT ] ) { return ; }

	var pathKey = to.pathKey ? to.pathKey + '.' + key : key ;

	if ( this[ common.SYMBOL_PARENT ] === to[ common.SYMBOL_PARENT ] && this.pathKey === pathKey ) { return ; }

	this[ common.SYMBOL_PARENT ] = to[ common.SYMBOL_PARENT ] ;
	this.pathKey = pathKey ;

	this.clearAfterFixAttachment() ;
} ;



// Should be derived...
Stat.prototype.clearAfterFixAttachment = function() {
	this.proxy = {} ;
} ;



// Should be derived
Stat.prototype.set = function( params ) {
	if ( ! params || typeof params !== 'object' ) {
		this.setBase( params ) ;
		return true ;
	}

	return false ;
} ;



// For instance, there is no difference between .set() and .setBase(), but this may change in the future
Stat.prototype.setBase = function( base ) { this.base = base ; return true ; } ;
//Stat.prototype.setFromStat = function( stat ) { this.base = stat.base ; } ;
Stat.prototype.getBase = function() { return this.base ; } ;
Stat.prototype.getActual = function( pathKey = this.pathKey ) { return this.computeModifiers( this.base , this.base , pathKey ) ; } ;



Stat.computeModifiers = function( operandType , actual , base , modifiers ) {
	//console.error( "Stat.computeModifiers(): " , operandType , actual , base , modifiers ) ;
	if ( ! modifiers ) { return actual ; }

	// It should be already sorted, since it's sorted on insertion
	for ( let modifier of modifiers ) {
		if ( modifier.active ) { actual = modifier.apply( operandType , actual , base ) ; }
	}

	//console.error( "    -->" , actual , "\n\n" ) ;
	return actual ;
} ;

Stat.prototype.computeModifiers = function( actual , base , pathKey = this.pathKey ) {
	//console.error( "Stat#computeModifiers(): " , actual , base , pathKey ) ;
	//console.error( "stm:" , this[ common.SYMBOL_PARENT ]?.statsModifiers ) ;
	// [ common.SYMBOL_PARENT ] could be null, it happens when a stat is detached from the table.
	// E.g.: during Spellcast scripting init phase.
	return Stat.computeModifiers( this.operandType , actual , base , this[ common.SYMBOL_PARENT ]?.statsModifiers[ pathKey ] ) ;
} ;



Stat.prototype.getProxy = function( pathKey = this.pathKey ) {
	//if ( pathKey !== this.pathKey ) { console.log( "GET PROXY PATH KEY:" , pathKey , "instead of" , this.pathKey ) ; }
	if ( this.proxy[ pathKey ] ) { return this.proxy[ pathKey ] ; }
	return this.proxy[ pathKey ] = new Proxy( { target: this , pathKey } , STAT_HANDLER ) ;
} ;

// ... args is for derivated class
Stat.prototype.cloneProxy = function( ... args ) { return this.clone( ... args ).getProxy() ; } ;



const STAT_HANDLER = {
	get: ( { target , pathKey } , property ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( property === common.SYMBOL_PATH_KEY ) { return pathKey ; }		// Debug and unit test
		if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return target.constructor ; }
		if ( property === 'toString' ) { return Object.prototype.toString ; }
		if ( property === 'clone' ) { return target.cloneProxy.bind( target ) ; }
		if ( property === 'set' ) { return target.set.bind( target ) ; }

		if ( Object.hasOwn( target.proxyMethods , property ) ) {
			return target[ target.proxyMethods[ property ] ].bind( target ) ;
		}

		if ( Object.hasOwn( target.proxyProperties , property ) ) {
			return target[ target.proxyProperties[ property ] ] ;
		}

		if ( Object.hasOwn( target.proxyGetters , property ) ) {
			return target[ target.proxyGetters[ property ] ]( pathKey ) ;
		}

		if ( property === 'base' ) { return target.getBase() ; }
		if ( property === 'actual' ) { return target.getActual( pathKey ) ; }

		return ;
	} ,
	// Mostly a copy of .get()
	has: ( { target } , property ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return true ; }
		if ( property === common.SYMBOL_PATH_KEY ) { return true ; }
		//if ( property === '__prototypeUID__' ) { return true ; }
		//if ( property === '__prototypeVersion__' ) { return true ; }
		if ( property === 'constructor' ) { return true ; }
		if ( property === 'toString' ) { return true ; }
		if ( property === 'clone' ) { return true ; }
		if ( property === 'set' ) { return true ; }
		if ( property === 'base' ) { return true ; }
		if ( property === 'actual' ) { return true ; }

		if ( Object.hasOwn( target.proxyMethods , property ) ) { return true ; }
		if ( Object.hasOwn( target.proxyProperties , property ) ) { return true ; }
		if ( Object.hasOwn( target.proxyGetters , property ) ) { return true ; }

		return false ;
	} ,
	set: ( { target , pathKey } , property , value ) => {
		if ( target.proxyWritableProperties[ property ] ) {
			target[ target.proxyProperties[ property ] ] = value ;
			return true ;
		}

		if ( Object.hasOwn( target.proxySetters , property ) ) {
			return target[ target.proxySetters[ property ] ]( value , pathKey ) ;
		}

		if ( property === 'base' ) {
			return target.setBase( value ) ;
		}

		return false ;
	} ,
	deleteProperty: () => false ,
	ownKeys: ( { target } ) => Array.from( target.proxyEnumerableProperties ) ,
	getOwnPropertyDescriptor: ( proxyTarget , property ) => {
		var target = proxyTarget.target ;

		// configurable:true is forced by Proxy Invariants
		if ( target.proxyProperties[ property ] ) {
			return {
				value: STAT_HANDLER.get( proxyTarget , target.proxyProperties[ property ] , proxyTarget ) , writable: true , enumerable: true , configurable: true
			} ;
		}

		if ( target.proxyGetters[ property ] ) {
			return {
				value: STAT_HANDLER.get( proxyTarget , target.proxyGetters[ property ] , proxyTarget ) , writable: true , enumerable: true , configurable: true
			} ;
		}

		if ( property === 'base' || property === 'actual' ) {
			return { value: STAT_HANDLER.get( proxyTarget , property , proxyTarget ) , enumerable: true , configurable: true } ;
		}
	} ,
	getPrototypeOf: ( { target } ) => Reflect.getPrototypeOf( target ) ,
	setPrototypeOf: () => false
} ;

Stat.STAT_HANDLER = STAT_HANDLER ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/StatsTable.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





function StatsTable( stats = null , clone = false ) {
	this.nestedStats = new NestedStats( null , this , '' ) ;
	this.modifiersTables = [] ;	// list of modifiersTable of the StatsTable
	this.statsModifiers = {} ;	// per stat modifier list (key is a key's full path)
	this.wildChildrenModifierKeys = {} ;

	this.proxy = null ;

	if ( stats ) { this.setStats( stats , clone ) ; }
}

StatsTable.prototype.__prototypeUID__ = 'stats-modifiers/StatsTable' ;
StatsTable.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

module.exports = StatsTable ;



const NestedStats = require( './NestedStats.js' ) ;
const Modifier = require( './Modifier.js' ) ;
const ModifiersTable = require( './ModifiersTable.js' ) ;

const common = require( './common.js' ) ;

const arrayKit = require( 'array-kit' ) ;



StatsTable.prototype.setStats = function( stats , clone = true ) {
	this.nestedStats.setStats( stats , clone ) ;
} ;



StatsTable.prototype.clone = function() {
	return new StatsTable( this.nestedStats , true ) ;
} ;

StatsTable.prototype.cloneProxy = function() { return this.clone().getProxy() ; } ;



// Clone then extend with stats
StatsTable.prototype.extend = function( stats ) {
	var statsTable = this.clone() ;
	statsTable.setStats( stats ) ;
	return statsTable ;
} ;

StatsTable.prototype.extendProxy = function( stats ) { return this.extend( stats ).getProxy() ; } ;



StatsTable.prototype.stack = function( modifiersTable ) {
	var statName , op , modifier ;

	if ( modifiersTable[ common.SYMBOL_UNPROXY ] ) { modifiersTable = modifiersTable[ common.SYMBOL_UNPROXY ] ; }
	if ( ! ( modifiersTable instanceof ModifiersTable ) ) { throw new Error( 'Not a ModifiersTable' ) ; }

	if ( modifiersTable.isTemplate ) {
		modifiersTable = modifiersTable.instanciate() ;
	}
	else if ( modifiersTable.stackedOn ) {
		if ( modifiersTable.stackedOn !== this ) {
			// Is it an error?
			// Should we unstack it from the statsTable it is stacked on?
			// Should we just exit now?
			//return false ;
			modifiersTable.stackedOn.unstack( modifiersTable ) ;
		}
		else {
			return false ;
		}
	}

	modifiersTable.stackedOn = this ;
	this.modifiersTables.push( modifiersTable ) ;

	for ( statName in modifiersTable.statsModifiers ) {
		//if ( ! this.checkModifiablePath( statName ) ) { continue ; }
		//console.error( "statName:" , statName ) ;
		let details = this.checkModifiablePath( statName , true ) ;
		//console.error( "details:" , details ) ;
		if ( ! details ) { continue ; }

		for ( op in modifiersTable.statsModifiers[ statName ] ) {
			modifier = modifiersTable.statsModifiers[ statName ][ op ] ;
			if ( ! this.statsModifiers[ statName ] ) { this.statsModifiers[ statName ] = [] ; }
			this.statsModifiers[ statName ].push( modifier ) ;
		}

		if ( this.statsModifiers[ statName ] && this.statsModifiers[ statName ].length ) {
			this.statsModifiers[ statName ].sort( Modifier.sortFn ) ;
		}

		if ( details.parent?.hasWildChildren ) {
			if ( ! this.wildChildrenModifierKeys[ details.parentPath ] ) { this.wildChildrenModifierKeys[ details.parentPath ] = {} ; }
			let modifiersForKey = this.wildChildrenModifierKeys[ details.parentPath ][ details.key ] ;
			if ( ! modifiersForKey ) { modifiersForKey = this.wildChildrenModifierKeys[ details.parentPath ][ details.key ] = [] ; }
			modifiersForKey.push( modifier ) ;
		}
	}

	return true ;
} ;



StatsTable.prototype.unstack = function( modifiersTable ) {
	var index ;

	if ( modifiersTable[ common.SYMBOL_UNPROXY ] ) { modifiersTable = modifiersTable[ common.SYMBOL_UNPROXY ] ; }

	if ( modifiersTable instanceof ModifiersTable ) {
		index = this.modifiersTables.indexOf( modifiersTable ) ;
		if ( index === - 1 ) { return ; }
		arrayKit.delete( this.modifiersTables , index ) ;
	}
	else if ( typeof modifiersTable === 'string' ) {
		// Delete by ID
		index = this.modifiersTables.findIndex( e => e.id === modifiersTable ) ;
		if ( index === - 1 ) { return ; }
		modifiersTable = this.modifiersTables[ index ] ;
		arrayKit.delete( this.modifiersTables , index ) ;
	}

	this.afterUnstack( modifiersTable ) ;

	modifiersTable.stackedOn = null ;
} ;



StatsTable.prototype.afterUnstack = function( modifiersTable ) {
	var statName , op , modifier ;

	for ( statName in modifiersTable.statsModifiers ) {
		//if ( ! this.checkModifiablePath( statName ) ) { continue ; }
		let details = this.checkModifiablePath( statName , true ) ;
		if ( ! details ) { continue ; }

		for ( op in modifiersTable.statsModifiers[ statName ] ) {
			modifier = modifiersTable.statsModifiers[ statName ][ op ] ;
			arrayKit.deleteValue( this.statsModifiers[ statName ] , modifier ) ;
			if ( ! this.statsModifiers[ statName ].length ) {
				delete this.statsModifiers[ statName ] ;
			}
		}

		if ( details.parent?.hasWildChildren ) {
			let modifiersForKey = this.wildChildrenModifierKeys[ details.parentPath ][ details.key ] ;

			if ( modifiersForKey ) {
				arrayKit.deleteValue( modifiersForKey , modifier ) ;
				if ( ! modifiersForKey.length ) {
					delete this.wildChildrenModifierKeys[ details.parentPath ][ details.key ] ;
				}
			}
		}
	}
} ;



// Used for updates, when a ModifiersTable is changed (add one modifier)
StatsTable.prototype.addOneStatModifier = function( statName , modifier ) {
	//if ( ! this.checkModifiablePath( statName ) ) { return ; }
	let details = this.checkModifiablePath( statName , true ) ;
	if ( ! details ) { return ; }

	if ( ! this.statsModifiers[ statName ] ) { this.statsModifiers[ statName ] = [] ; }
	this.statsModifiers[ statName ].push( modifier ) ;
	this.statsModifiers[ statName ].sort( Modifier.sortFn ) ;

	if ( details.parent?.hasWildChildren ) {
		if ( ! this.wildChildrenModifierKeys[ details.parentPath ] ) { this.wildChildrenModifierKeys[ details.parentPath ] = {} ; }
		let modifiersForKey = this.wildChildrenModifierKeys[ details.parentPath ][ details.key ] ;
		if ( ! modifiersForKey ) { modifiersForKey = this.wildChildrenModifierKeys[ details.parentPath ][ details.key ] = [] ; }
		modifiersForKey.push( modifier ) ;
	}
} ;



StatsTable.prototype.checkModifiablePath = function( path , getDetails = false ) {
	if ( ! path ) { return false ; }
	var pathArray = path.split( '.' ) ;
	return this.nestedStats.checkModifiablePath( pathArray , getDetails , 0 ) ;
} ;



// Trigger an event
StatsTable.prototype.trigger = function( eventName ) {
	this.modifiersTables.forEach( modifiersTable => modifiersTable.trigger( eventName ) ) ;
} ;



StatsTable.prototype.cleanModifiersTables = function() {
	var modifiersTable , index = 0 ;

	while ( index < this.modifiersTables.length ) {
		modifiersTable = this.modifiersTables[ index ] ;

		if ( modifiersTable.destroyed ) {
			arrayKit.delete( this.modifiersTables , index ) ;
			this.afterUnstack( modifiersTable ) ;
		}
		else {
			index ++ ;
		}
	}
} ;



StatsTable.prototype.getModifiersTables = function() {
	this.cleanModifiersTables() ;
	return this.modifiersTables ;
} ;



StatsTable.prototype.getModifiersTablesProxy = function() {
	var modifiersTable ,
		object = {} ;

	this.cleanModifiersTables() ;

	for ( modifiersTable of this.modifiersTables ) {
		object[ modifiersTable.id ] = modifiersTable.getProxy() ;
	}

	return object ;
} ;



StatsTable.prototype.getProxy = function() {
	if ( this.proxy ) { return this.proxy ; }
	this.proxy = new Proxy( this , STATS_TABLE_HANDLER ) ;
	return this.proxy ;
} ;



const STATS_TABLE_PROXY_METHODS = new Set( [ 'setStat' , 'stack' , 'unstack' , 'trigger' ] ) ;

const STATS_TABLE_HANDLER = {
	get: ( target , property ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return StatsTable ; }
		if ( property === 'toString' ) { return Object.prototype.toString ; }
		if ( property === 'clone' ) { return target.cloneProxy.bind( target ) ; }
		if ( property === 'extend' ) { return target.extendProxy.bind( target ) ; }

		if ( STATS_TABLE_PROXY_METHODS.has( property ) ) {
			return target[ property ].bind( target ) ;
		}

		if ( property === 'modifiersTables' || property === 'mods' ) {
			return target.getModifiersTablesProxy() ;
		}

		var proxy = target.nestedStats.getProxy() ;
		return proxy[ property ] ;
	} ,
	// Mostly a copy of .get()
	has: ( target , property ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return true ; }
		//if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		//if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return true ; }
		if ( property === 'toString' ) { return true ; }
		if ( property === 'clone' ) { return true ; }
		if ( property === 'extend' ) { return true ; }

		if ( STATS_TABLE_PROXY_METHODS.has( property ) ) {
			return true ;
		}

		if ( property === 'modifiersTables' || property === 'mods' ) {
			return true ;
		}

		var proxy = target.nestedStats.getProxy() ;
		return proxy.has( property ) ;
	} ,
	set: ( target , property , value ) => {
		if ( STATS_TABLE_PROXY_METHODS.has( property ) ) { return false ; }

		var proxy = target.nestedStats.getProxy() ;
		proxy[ property ] = value ;		// If not possible, it would throw, so we can always return true here...
		return true ;
	} ,
	deleteProperty: () => false ,
	ownKeys: ( target ) => {
		var proxy = target.nestedStats.getProxy() ;
		return [ 'mods' , ... Object.keys( proxy ) ] ;
	} ,
	getOwnPropertyDescriptor: ( target , property ) => {
		// configurable:true is forced by Proxy Invariants
		if ( property === 'modifiersTables' || property === 'mods' || target.nestedStats.stats[ property ] ) {
			return { value: STATS_TABLE_HANDLER.get( target , property , target ) , enumerable: true , configurable: true } ;
		}
	} ,
	getPrototypeOf: ( target ) => Reflect.getPrototypeOf( target ) ,
	setPrototypeOf: () => false
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/Modifier.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





function Modifier( id , operator , operand , priorityGroup = null , active = true ) {
	if ( ! operators[ operator ] ) { throw new Error( "Unknown operator '" + operator + "'" ) ; }

	if ( operators[ operator ].convert ) {
		operand = operators[ operator ]( operand ) ;
		operator = operators[ operator ].convert ;
	}

	this.id = id ;
	this.fn = operators[ operator ] ;	// operator function
	this.operator = this.fn.id ;	// operator identifier
	this.operand = operand ;
	this.priorityGroup = priorityGroup === null ? this.fn.priorityGroup : priorityGroup ;
	this.active = !! active ;
	this.proxy = null ;
}

Modifier.prototype.__prototypeUID__ = 'stats-modifiers/Modifier' ;
Modifier.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

module.exports = Modifier ;



const common = require( './common.js' ) ;
const operators = require( './operators.js' ) ;



Modifier.sortFn = ( a , b ) => b.priorityGroup - a.priorityGroup || b.fn.priority - a.fn.priority ;



Modifier.prototype.merge = function( operand ) {
	this.operand = this.fn.merge( this.operand , operand ) ;
} ;



Modifier.prototype.set =
Modifier.prototype.setOperand = function( operand ) {
	this.operand = operand ;
} ;



Modifier.prototype.apply = function( operandType , existingValue , base ) {
	if ( ! this.fn.anyType && operandType !== this.fn.type ) { return existingValue ; }
	return this.fn( existingValue , this.operand , base ) ;
} ;



Modifier.prototype.getProxy = function() {
	if ( this.proxy ) { return this.proxy ; }
	this.proxy = new Proxy( this , MODIFIER_HANDLER ) ;
	return this.proxy ;
} ;



const MODIFIER_PROXY_METHODS = new Set( [ 'merge' ] ) ;
const MODIFIER_PROXY_LOCAL = new Set( [ 'id' , 'operator' , 'operand' , 'priorityGroup' , 'active' ] ) ;

const MODIFIER_HANDLER = {
	get: ( target , property , receiver ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return Modifier ; }
		if ( property === 'toString' ) { return Object.prototype.toString ; }

		if ( MODIFIER_PROXY_METHODS.has( property ) ) {
			//return Reflect.get( target , property , receiver ) ;	// Don't work, not bounded
			return target[ property ].bind( target ) ;
		}

		if ( MODIFIER_PROXY_LOCAL.has( property ) ) {
			return Reflect.get( target , property , receiver ) ;
		}

		return ;
	} ,
	// Mostly a copy of .get()
	has: ( target , property ) => {
		//if ( property === common.SYMBOL_UNPROXY ) { return true ; }
		//if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		//if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return true ; }
		if ( property === 'toString' ) { return true ; }
		if ( MODIFIER_PROXY_METHODS.has( property ) ) { return true ; }
		if ( MODIFIER_PROXY_LOCAL.has( property ) ) { return true ; }
		return false ;
	} ,
	set: ( target , property , value ) => {
		if ( MODIFIER_PROXY_METHODS.has( property ) ) { return false ; }

		if ( property === 'operand' ) {
			target.setOperand( value ) ;
			return true ;
		}

		return false ;
	} ,
	deleteProperty: () => false ,
	ownKeys: () => [ ... MODIFIER_PROXY_LOCAL ] ,
	getOwnPropertyDescriptor: ( target , property ) => {
		// configurable:true is forced by Proxy Invariants
		if ( MODIFIER_PROXY_LOCAL.has( property ) ) {
			return { value: MODIFIER_HANDLER.get( target , property , target ) , configurable: true } ;
		}
	} ,
	getPrototypeOf: ( target ) => Reflect.getPrototypeOf( target ) ,
	setPrototypeOf: () => false
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/ModifiersTable.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





function ModifiersTable( id , statsModifiers = null , active = true , isTemplate = false , events = null ) {
	this.id = id ;
	this.statsModifiers = {} ;	// per-stat modifier
	this.active = !! active ;
	this.destroyed = false ;
	this.stackedOn = null ;				// can be stacked on only one stats table
	this.isTemplate = !! isTemplate ;	// templates are cloned before been stacked
	this.templateInstanceCount = 0 ;
	this.events = {} ;

	this.proxy = null ;

	if ( statsModifiers ) {
		for ( let statName in statsModifiers ) { this.setStatModifiers( statName , statsModifiers[ statName ] ) ; }
	}

	if ( Array.isArray( events ) ) {
		for ( let event of events ) {
			if ( event && typeof event === 'object' ) { this.setEvent( event ) ; }
		}
	}
}

ModifiersTable.prototype.__prototypeUID__ = 'stats-modifiers/ModifiersTable' ;
ModifiersTable.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

module.exports = ModifiersTable ;



const Modifier = require( './Modifier.js' ) ;

const common = require( './common.js' ) ;
const operators = require( './operators.js' ) ;
const eventActions = require( './eventActions.js' ) ;

const arrayKit = require( 'array-kit' ) ;



ModifiersTable.prototype.setStatModifiers = function( statName , modifiers ) {
	if ( this.destroyed ) { return ; }

	if ( common.isPlainObject( modifiers ) && modifiers.__prototypeUID__ !== 'kung-fig/Operator' ) {
		// Nested object syntax
		for ( let key in modifiers ) {
			this.setStatModifiers( statName + '.' + key , modifiers[ key ] ) ;
		}

		return ;
	}

	// Check for the mono-modifier syntax, enclose it inside an array
	if ( ! Array.isArray( modifiers ) ) { modifiers = [ modifiers ] ; }
	else if ( ! modifiers[ 0 ] || typeof modifiers[ 0 ] !== 'object' ) { modifiers = [ modifiers ] ; }

	if ( ! this.statsModifiers[ statName ] ) { this.statsModifiers[ statName ] = {} ; }

	for ( let modifier of modifiers ) {
		if ( modifier && typeof modifier === 'object' ) {
			// There is the “classic” array syntax, and the object syntax (later is used by the KFG operator syntax)
			let operator , operand , priorityGroup ;

			if ( Array.isArray( modifier ) ) {
				[ operator , operand , priorityGroup ] = modifier ;
			}
			else {
				( { operator , operand , priorityGroup } = modifier ) ;
			}

			if ( ! operator ) { throw new Error( "Modifier without an operator" ) ; }	// note that some operators don't need right-hand-side operand
			if ( ! operators[ operator ] ) { throw new Error( "Unknown operator '" + operator + "'" ) ; }	// unknown operator
			if ( operand === undefined ) { throw new Error( "Missing operand" ) ; }	// missing operand

			this.setStatModifier( statName , operator , operand , priorityGroup ) ;

			if ( operators[ operator ].operandSubtreeExpansion && common.isPlainObject( operand ) ) {
				// This is both a regular operator AND a nested object syntax.
				// This is useful for the existence operator '#' to define subtree and existence in only one key,
				// it's very useful for KFG.
				for ( let key in operand ) {
					this.setStatModifiers( statName + '.' + key , operand[ key ] ) ;
				}
			}
		}
	}
} ;



ModifiersTable.prototype.setStatModifier = function( statName , operator , operand , priorityGroup = null ) {
	if ( this.destroyed ) { return ; }

	var canonicalOperator , key ,
		ops = this.statsModifiers[ statName ] ;

	if ( ! operators[ operator ] ) { throw new Error( "Unknown operator '" + operator + "'" ) ; }

	if ( operators[ operator ].convert ) {
		operand = operators[ operator ]( operand ) ;
		operator = operators[ operator ].convert ;
	}

	key = canonicalOperator = operators[ operator ].id ;
	if ( priorityGroup !== null && priorityGroup !== operators[ operator ].priorityGroup ) {
		key += '_' + ( priorityGroup < 0 ? 'm' + ( - priorityGroup ) : 'p' + priorityGroup ) ;
	}

	if ( ops[ key ] ) {
		ops[ key ].merge( operand ) ;
	}
	else {
		ops[ key ] = new Modifier( this.id , canonicalOperator , operand , priorityGroup , this.active ) ;

		if ( this.stackedOn ) {
			this.stackedOn.addOneStatModifier( statName , ops[ key ] ) ;
		}
	}
} ;



// 'changeId' falsy: don't change ID, true: create a new id from current, any other truthy: the new ID
ModifiersTable.prototype.clone = function( changeId = true ) {
	return new ModifiersTable(
		! changeId ? this.id  :  changeId === true ? common.createCloneId( this.id )  :  changeId  ,
		null ,
		this.active ,
		this.isTemplate
	).extend( this ) ;
} ;

ModifiersTable.prototype.cloneProxy = function( changeId ) { return this.clone( changeId ).getProxy() ; } ;



// If fromCloneId is set, we want to clone rather than instanciate a template, but since this share a lot of code...
ModifiersTable.prototype.instanciate = function() {
	if ( ! this.isTemplate ) { return this ; }	// /!\ or error???
	return new ModifiersTable( this.id + '_' + ( this.templateInstanceCount ++ ) , null , this.active , false ).extend( this ) ;
} ;



// Extend the current modifiers table with another
ModifiersTable.prototype.extend = function( withModifiersTable ) {
	var statName , modifiers , eventName ;

	for ( statName in withModifiersTable.statsModifiers ) {
		modifiers = Object.values( withModifiersTable.statsModifiers[ statName ] ).map( e => [ e.operator , e.operand , e.priorityGroup ] ) ;
		this.setStatModifiers( statName , modifiers ) ;
	}

	for ( eventName in withModifiersTable.events ) {
		withModifiersTable.events[ eventName ].forEach( event => this.setEvent_( eventName , event.times , event.every , event.action , event.params ) ) ;
	}

	return this ;
} ;



ModifiersTable.prototype.destroy = function() {
	this.activate( false ) ;
	this.destroyed = true ;
} ;



ModifiersTable.prototype.deactivate = function() { return this.activate( false ) ; } ;
ModifiersTable.prototype.activate = function( active = true ) {
	if ( this.destroyed ) { return ; }

	active = !! active ;
	if ( active === this.active ) { return ; }
	this.active = active ;

	for ( let statName in this.statsModifiers ) {
		for ( let operator in this.statsModifiers[ statName ] ) {
			this.statsModifiers[ statName ][ operator ].active = this.active ;
		}
	}
} ;



const EVENT_RESERVED_KEYS = new Set( [ 'name' , 'times' , 'every' , 'action' , 'params' ] ) ;

ModifiersTable.prototype.setRecurringEvent = function( eventName , action , params ) { return this.setEvent_( eventName , Infinity , 1 , action , params ) ; } ;
ModifiersTable.prototype.setOneTimeEvent = function( eventName , action , params ) { return this.setEvent_( eventName , 1 , 1 , action , params ) ; } ;
ModifiersTable.prototype.setEveryEvent = function( eventName , every , action , params ) { return this.setEvent_( eventName , Infinity , every , action , params ) ; } ;
ModifiersTable.prototype.setCountdownEvent = function( eventName , countdown , action , params ) { return this.setEvent_( eventName , 1 , countdown , action , params ) ; } ;

// Mainly for KFG
ModifiersTable.prototype.setEvent = function( event ) {
	var params = null ;

	if ( ! event || typeof event !== 'object' ) { return ; }

	if ( event.params && typeof event.params === 'object' ) {
		params = event.params ;
	}
	else {
		// The params could be embedded on the top-level object (KFG shorthand syntax)
		for ( let key in event ) {
			if ( ! EVENT_RESERVED_KEYS.has( key ) ) {
				if ( ! params ) { params = {} ; }
				params[ key ] = event[ key ] ;
			}
		}
	}

	return this.setEvent_(
		event.name || '' ,
		event.times !== undefined ? + event.times || 0 : Infinity ,
		event.every !== undefined ? + event.every || 0 : 1 ,
		event.action || '' ,
		params
	) ;
} ;

/*
	action: the function ID
	times: how many times the event occurs
	every: triggered only every X eventName
*/
ModifiersTable.prototype.setEvent_ = function( eventName , times , every , action , params ) {
	if ( ! eventActions[ action ] ) { return ; }
	if ( ! this.events[ eventName ] ) { this.events[ eventName ] = [] ; }
	this.events[ eventName ].push( {
		action , times , every , params , count: 0 , done: false
	} ) ;
} ;



// Trigger an event
ModifiersTable.prototype.trigger = function( eventName ) {
	if ( this.destroyed ) { return ; }

	var deleteNeeded = false ,
		events = this.events[ eventName ] ;

	if ( ! events || ! events.length ) { return ; }

	events.forEach( eventData => {
		// If the action recursively trigger a .trigger(), we need to check for eventData.done now
		if ( eventData.done ) { deleteNeeded = true ; return ; }

		eventData.count ++ ;
		if ( eventData.count % eventData.every !== 0 ) { return ; }
		if ( eventData.count / eventData.every >= eventData.times ) { eventData.done = true ; }

		eventActions[ eventData.action ]( this , eventData , eventData.params ) ;

		// Should be added after the actionFn, because it can set it to done (e.g.: fade)
		if ( eventData.done ) { deleteNeeded = true ; }
	} ) ;

	if ( deleteNeeded ) {
		//arrayKit.inPlaceFilter( events , eventData => eventData.countdown === null || eventData.countdown > 0 ) ;
		arrayKit.inPlaceFilter( events , eventData => ! eventData.done ) ;
	}
} ;



ModifiersTable.prototype.forEachModifier = function( fn ) {
	var statName , op ;

	for ( statName in this.statsModifiers ) {
		for ( op in this.statsModifiers[ statName ] ) {
			fn( this.statsModifiers[ statName ][ op ] , statName ) ;
		}
	}
} ;



ModifiersTable.prototype.getProxy = function() {
	if ( this.proxy ) { return this.proxy ; }
	this.proxy = new Proxy( this , MODIFIERS_TABLE_HANDLER ) ;
	return this.proxy ;
} ;



const MODIFIERS_TABLE_PROXY_METHODS = new Set( [ 'setStatModifiers' , 'trigger' ] ) ;

const MODIFIERS_TABLE_HANDLER = {
	get: ( target , property ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return ModifiersTable ; }
		if ( property === 'toString' ) { return Object.prototype.toString ; }
		if ( property === 'clone' ) { return target.cloneProxy.bind( target ) ; }

		if ( MODIFIERS_TABLE_PROXY_METHODS.has( property ) ) {
			//return Reflect.get( target , property , receiver ) ;	// Don't work, not bounded
			return target[ property ].bind( target ) ;
		}

		if ( target.statsModifiers[ property ] ) {
			let modifiers = target.statsModifiers[ property ] ;
			if ( modifiers[ common.SYMBOL_PROXY ] ) { return modifiers[ common.SYMBOL_PROXY ] ; }
			modifiers[ common.SYMBOL_PARENT ] = target ;
			modifiers[ common.SYMBOL_STAT_NAME ] = property ;
			return modifiers[ common.SYMBOL_PROXY ] = new Proxy( modifiers , INTERMEDIATE_MODIFIERS_TABLE_HANDLER ) ;
		}

		return ;
	} ,
	// Mostly a copy of .get()
	has: ( target , property ) => {
		//if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		//if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		//if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return true ; }
		if ( property === 'toString' ) { return true ; }
		if ( property === 'clone' ) { return true ; }
		if ( MODIFIERS_TABLE_PROXY_METHODS.has( property ) ) { return true ; }
		if ( target.statsModifiers[ property ] ) { return true ; }
		return false ;
	} ,
	set: () => false ,
	deleteProperty: () => false ,
	ownKeys: ( target ) => [ ... Object.keys( target.statsModifiers ) ] ,
	getOwnPropertyDescriptor: ( target , property ) => {
		// configurable:true is forced by Proxy Invariants
		if ( target.statsModifiers[ property ] ) {
			return { value: MODIFIERS_TABLE_HANDLER.get( target , property , target ) , configurable: true } ;
		}
	} ,
	getPrototypeOf: ( target ) => Reflect.getPrototypeOf( target ) ,
	setPrototypeOf: () => false
} ;



// Proxy for the .statsModifiers[ key ] objects
const INTERMEDIATE_MODIFIERS_TABLE_HANDLER = {
	get: ( target , property , receiver ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( property === 'constructor' ) { return Object ; }
		if ( property === 'toString' ) { return Object.prototype.toString ; }

		var targetValue = target[ property ] ;

		if ( targetValue && typeof targetValue === 'object' ) {
			return targetValue.getProxy() ;
		}

		return Reflect.get( target , property , receiver ) ;
	} ,
	// Mostly a copy of .get()
	has: ( target , property ) => {
		if ( typeof property !== 'string' ) { return false ; }

		if ( property === 'constructor' ) { return true ; }
		if ( property === 'toString' ) { return true ; }

		return property in target ;
	} ,
	set: ( target , property , value ) => {
		if ( typeof property !== 'string' ) { return false ; }

		var targetValue = target[ property ] ;

		if ( targetValue && typeof targetValue === 'object' ) {
			if ( ! value || typeof value !== 'object' ) {
				targetValue.set( value ) ;
				return true ;
			}
		}

		if ( targetValue === undefined ) {
			let match = property.match( /^([a-zA-Z_]+)([0-9]*)$/ ) ;
			if ( ! match ) { return false ; }

			let parent = target[ common.SYMBOL_PARENT ] ,
				statName = target[ common.SYMBOL_STAT_NAME ] ,
				operator = match[ 1 ] ,
				priorityGroup = + match[ 2 ] ;

			parent.setStatModifier( statName , operator , value , priorityGroup ) ;

			return true ;
		}

		return false ;
	} ,
	deleteProperty: ( target , property ) => {
		if ( typeof property !== 'string' ) { return false ; }

		if ( Object.hasOwn( target , property ) ) {
			return delete target[ property ] ;
		}

		return false ;
	} ,
	ownKeys: ( target ) => Object.keys( target ) ,
	getOwnPropertyDescriptor: ( target , property ) => {
		if ( typeof property !== 'string' ) { return ; }
		if ( ! Object.hasOwn( target , property ) ) { return ; }

		return {
			value: target?.getProxy ? target.getProxy() : target ,
			writable: true ,
			// Mandatory, for some reasons .ownKeys() is always cross-checking each props using getOwnPropertyDescriptor().enumerable
			enumerable: true ,
			configurable: true
		} ;
	} ,
	getPrototypeOf: () => Object.prototype ,
	setPrototypeOf: () => false
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/NestedStats.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





function NestedStats( stats = null , parentTable = null , pathKey = null , clone = false ) {
	this[ common.SYMBOL_PARENT ] = parentTable ;
	this.pathKey = pathKey ;
	this.stats = {} ;

	this.proxy = {} ;

	if ( stats ) { this.setStats( stats , clone ) ; }
}

NestedStats.prototype.__prototypeUID__ = 'stats-modifiers/NestedStats' ;
NestedStats.prototype.__prototypeVersion__ = require( '../package.json' ).version ;

module.exports = NestedStats ;



const Stat = require( './Stat.js' ) ;
const common = require( './common.js' ) ;



NestedStats.prototype.operandType = null ;
NestedStats.prototype.specialKeys = new Set() ;



NestedStats.prototype.clear = function() {
	common.clearObject( this.stats ) ;
} ;



NestedStats.prototype.setFromNestedStats = function( nestedStats , clone = true ) {
	this.setStats( nestedStats.stats , clone ) ;
} ;



NestedStats.prototype.setStats = function( statsSource , clone = true ) {
	if ( ! common.isNested( statsSource ) ) { return ; }

	var sourceSpecialKeys ,
		stats = statsSource ;

	if ( statsSource instanceof NestedStats ) {
		stats = stats.stats ;
		sourceSpecialKeys = this.specialKeys ;
	}

	for ( let statName in stats ) {
		if ( ! this.specialKeys.has( statName ) && ( ! sourceSpecialKeys || ! sourceSpecialKeys.has( statName ) ) ) {
			this.setStat( statName , stats[ statName ] , clone ) ;
		}
	}
} ;



NestedStats.prototype.setStat = function( statName , statValue , clone = true , selfBase = this.stats ) {
	var pathKey = this.pathKey ? this.pathKey + '.' + statName : statName ;

	//console.log( ".setStat():" , statName , statValue , clone ) ;
	//console.log( ".setStat():" , statName , clone ) ;

	if ( statValue === null ) {
		//console.log( "\t| DELETED" ) ;
		delete selfBase[ statName ] ;
		return true ;
	}

	// In some configuration (e.g. in KFG), it is possible that the proxy is passed instead of the real instance
	statValue = statValue?.[ common.SYMBOL_UNPROXY ] || statValue ;

	// First, check if there is really something to do...
	if ( statValue === selfBase[ statName ] ) { return true ; }

	if ( common.isNested( statValue ) ) {
		// Nested stats
		if ( ! selfBase[ statName ] ) {
			if ( statValue instanceof NestedStats ) {
				if ( clone ) {
					//console.log( "\t| null <-- NestedStats ©" ) ;
					selfBase[ statName ] = statValue.clone( this[ common.SYMBOL_PARENT ] , pathKey ) ;
					return true ;
				}

				//console.log( "\t| null <-- NestedStats" ) ;
				selfBase[ statName ] = statValue ;
				statValue.fixAttachment( this , statName ) ;
				return true ;
			}

			//console.log( "\t| null <-- Object" + ( clone ? ' ©' : '' ) ) ;
			selfBase[ statName ] = new NestedStats( statValue , this[ common.SYMBOL_PARENT ] , pathKey , clone ) ;
			return true ;
		}

		if ( selfBase[ statName ] instanceof NestedStats ) {
			//selfBase[ statName ].clear() ;	// This would cause trouble when deep-extending...

			if ( statValue instanceof NestedStats ) {
				//console.log( "\t| NestedStats <-- NestedStats ©" ) ;
				//selfBase[ statName ].setStats( statValue.stats ) ;
				selfBase[ statName ].setFromNestedStats( statValue ) ;
				return true ;
			}

			//console.log( "\t| NestedStats <-- Object ©" ) ;
			selfBase[ statName ].setStats( statValue ) ;
			return true ;
		}

		// Uncompatible: drop it (or error?)
		//console.log( "\t| ? <-- NestedStats" ) ;
		return false ;
	}

	if ( statValue instanceof Stat ) {
		if ( ! selfBase[ statName ] ) {
			//console.log( "\t| null <-- Stat" ) ;
			selfBase[ statName ] = statValue.clone( this[ common.SYMBOL_PARENT ] , pathKey ) ;
			return true ;
		}

		if ( selfBase[ statName ] instanceof Stat ) {
			//console.log( "\t| Stat <-- Stat" ) ;

			// Seems better to replace it...
			// Setting it from another Stat instance seems more complicated and error prone, especially when it comes from different subclasses
			//selfBase[ statName ].setFromStat( statValue ) ;
			selfBase[ statName ] = statValue.clone( this[ common.SYMBOL_PARENT ] , pathKey ) ;
			return true ;
		}

		// drop?
		//console.log( "\t| ? <-- Stat" ) ;
		return false ;
	}

	if ( ! selfBase[ statName ] ) {
		//console.log( "\t| null <-- any stat" ) ;
		selfBase[ statName ] = Stat.create( this[ common.SYMBOL_PARENT ] , pathKey , statValue , clone ) ;
		return true ;
	}

	if ( selfBase[ statName ] instanceof Stat ) {
		//console.log( "\t| Stat <-- any stat" ) ;
		selfBase[ statName ].set( statValue ) ;
		return true ;
	}

	// drop?
	//console.log( "\t| ? <-- any stat" ) ;
	return false ;
} ;



NestedStats.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return new NestedStats( this.stats , parentTable , pathKey , true ) ;
} ;



// Used when reassigning to a new parent
NestedStats.prototype.fixAttachment = function( to , key ) {
	if ( ! to[ common.SYMBOL_PARENT ] ) { return ; }

	var pathKey = to.pathKey ? to.pathKey + '.' + key : key ;

	if ( this[ common.SYMBOL_PARENT ] === to[ common.SYMBOL_PARENT ] && this.pathKey === pathKey ) { return ; }

	this[ common.SYMBOL_PARENT ] = to[ common.SYMBOL_PARENT ] ;
	this.pathKey = pathKey ;
	this.proxy = {} ;

	for ( let property in this.stats ) {
		this.stats[ property ].fixAttachment( this , property ) ;
	}
} ;



// Check if a stat path is correct: it points to a Stat or to an intermediate object with wildcard support
// If getDetails = true, it returns an object { target , parent , key , parentPath }
NestedStats.prototype.checkModifiablePath = function( pathArray , getDetails = false , depth = 0 ) {
	if ( depth >= pathArray.length ) { return false ; }

	var isOk ,
		parent = this ,
		key = pathArray[ depth ] ,
		target = this.stats[ key ] ;

	if ( depth === pathArray.length - 1 ) {
		// This is the last part
		if ( target instanceof Stat ) { isOk = true ; }
		else if ( this.hasWildChildren ) { isOk = true ; }
		else { isOk = false ; }
	}
	else {
		if ( target instanceof Stat ) {
			if ( target.hasWildChildren && depth === pathArray.length - 2 ) {
				isOk = true ;
				parent = target ;
				key = pathArray[ depth + 1 ] ;
			}
			else {
				isOk = false ;
			}
		}
		else if ( target instanceof NestedStats ) {
			return target.checkModifiablePath( pathArray , getDetails , depth + 1 ) ;
		}
		else if ( this.hasWildChildren && this[ this.wildBranch ] ) {
			let wildTarget = this[ this.wildBranch ] ;

			if ( wildTarget instanceof Stat ) {
				if ( wildTarget.hasWildChildren && depth === pathArray.length - 2 ) {
					isOk = true ;
					parent = wildTarget ;
					key = pathArray[ depth + 1 ] ;
				}
				else {
					isOk = false ;
				}
			}
			else if ( wildTarget instanceof NestedStats ) {
				return wildTarget.checkModifiablePath( pathArray , getDetails , depth + 1 ) ;
			}
			else {
				isOk = false ;
			}
		}
		else {
			isOk = false ;
		}
	}

	if ( ! isOk ) { return false ; }
	if ( ! getDetails ) { return true ; }

	pathArray.length -- ;
	let parentPath = pathArray.join( '.' ) ;

	return { parent , key , parentPath } ;
} ;



NestedStats.prototype.getProxy = function( pathKey = this.pathKey ) {
	if ( this.proxy[ pathKey ] ) { return this.proxy[ pathKey ] ; }
	return this.proxy[ pathKey ] = new Proxy( { target: this , pathKey } , NESTED_HANDLER ) ;
} ;

// ...args is for derivated class
NestedStats.prototype.cloneProxy = function( ... args ) { return this.clone( ... args ).getProxy() ; } ;



const NESTED_HANDLER = {
	get: ( { target , pathKey } , property ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( property === common.SYMBOL_PATH_KEY ) { return pathKey ; }		// Debug and unit test
		if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return target.constructor ; }
		if ( property === 'toString' ) { return Object.prototype.toString ; }
		if ( property === 'clone' ) { return target.cloneProxy.bind( target ) ; }

		var finalTarget = target.stats[ property ] ;
		if ( ! finalTarget ) { return ; }

		/*
		console.log( "property:" , property ) ;
		console.log( "pathKey:" , pathKey ) ;
		console.log( "next pathKey:" , pathKey ? pathKey + '.' + property : property ) ;
		console.log( "target:" , target ) ;
		console.log( "finalTarget:" , finalTarget ) ;
		console.log( "finalTarget.getProxy:" , finalTarget.getProxy ) ;
		//*/

		if ( finalTarget?.getProxy ) {
			return finalTarget.getProxy( pathKey ? pathKey + '.' + property : property ) ;
		}

		if ( typeof finalTarget === 'function' ) { return finalTarget.bind( target ) ; }
		return finalTarget ;
	} ,
	// Mostly a copy of .get()
	has: ( { target } , property ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return true ; }
		if ( property === common.SYMBOL_PATH_KEY ) { return true ; }		// Debug and unit test
		//if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		//if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return true ; }
		if ( property === 'toString' ) { return true ; }
		if ( property === 'clone' ) { return true ; }
		return property in target.stats ;
	} ,
	set: ( { target } , property , value ) => {
		return target.setStat( property , value ) ;
	} ,
	deleteProperty: ( { target } , property ) => {
		if ( ! ( property in target.stats ) ) { return false ; }
		return delete target.stats[ property ] ;
	} ,
	ownKeys: ( { target } ) => [ ... Object.keys( target.stats ) ] ,
	getOwnPropertyDescriptor: ( { target , pathKey } , property ) => {
		//console.error( ".getOwnPropertyDescriptor() triggered!" , property ) ;
		if ( ! property || typeof property !== 'string' ) { return ; }

		var finalTarget = target.stats[ property ] ;
		if ( ! finalTarget ) { return ; }

		return {
			value: finalTarget?.getProxy ? finalTarget.getProxy( pathKey ? pathKey + '.' + property : property ) : finalTarget ,
			writable: true ,
			// Mandatory, for some reasons .ownKeys() is always cross-checking each props using getOwnPropertyDescriptor().enumerable
			enumerable: true ,
			configurable: true
		} ;
	} ,
	getPrototypeOf: ( { target } ) => Reflect.getPrototypeOf( target ) ,
	setPrototypeOf: () => false
} ;

NestedStats.NESTED_HANDLER = NESTED_HANDLER ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/WildNestedStats.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





function WildNestedStats( stats = null , parentTable = null , pathKey = null , clone = false ) {
	NestedStats.call( this , stats , parentTable , pathKey , clone ) ;

	this.template = null ;

	this.baseProxy = {} ;
	this.actualProxy = {} ;

	var template = stats && ( stats.template || stats._ ) ;
	if ( template ) { this.setTemplate( template ) ; }
}

const NestedStats = require( './NestedStats.js' ) ;
WildNestedStats.prototype = Object.create( NestedStats.prototype ) ;
WildNestedStats.prototype.constructor = WildNestedStats ;
WildNestedStats.prototype.__prototypeUID__ = 'stats-modifiers/WildNestedStats' ;

module.exports = WildNestedStats ;



const Stat = require( './Stat.js' ) ;
const common = require( './common.js' ) ;



WildNestedStats.prototype.operandType = 'boolean' ;
WildNestedStats.prototype.hasWildChildren = true ;
WildNestedStats.prototype.wildBranch = 'template' ;
WildNestedStats.prototype.specialKeys = new Set( [ '_' , 'template' ] ) ;



WildNestedStats.prototype.clear = function() {
	common.clearObject( this.stats ) ;
} ;



WildNestedStats.prototype.setFromNestedStats = function( nestedStats , clone = true ) {
	//console.error( ".setFromNestedStats()" , nestedStats ) ;
	this.setStats( nestedStats.stats , clone ) ;
	if ( nestedStats instanceof WildNestedStats ) { this.setTemplate( nestedStats.template , clone ) ; }
} ;



WildNestedStats.prototype.setTemplate = function( templateStatValue , clone = true ) {
	return this.setStat( 'template' , templateStatValue , clone , this ) ;
} ;



WildNestedStats.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	var clone = new WildNestedStats( null , parentTable , pathKey ) ;
	clone.setFromNestedStats( this , true ) ;
	return clone ;
} ;



WildNestedStats.prototype.fixAttachment = function( to , key ) {
	if ( ! to[ common.SYMBOL_PARENT ] ) { return ; }

	var pathKey = to.pathKey ? to.pathKey + '.' + key : key ;

	if ( this[ common.SYMBOL_PARENT ] === to[ common.SYMBOL_PARENT ] && this.pathKey === pathKey ) { return ; }

	this[ common.SYMBOL_PARENT ] = to[ common.SYMBOL_PARENT ] ;
	this.pathKey = pathKey ;
	this.proxy = {} ;
	this.baseProxy = {} ;
	this.actualProxy = {} ;

	for ( let property in this.stats ) {
		this.stats[ property ].fixAttachment( this , property ) ;
	}

	if ( this.template ) {
		this.template.fixAttachment( this , 'template' ) ;
	}
} ;



WildNestedStats.prototype.computeModifiers = function( actual , base , pathKey = this.pathKey ) {
	//console.error( "Stat#computeModifiers(): " , actual , base , pathKey ) ;
	//console.error( "stm:" , this[ common.SYMBOL_PARENT ]?.statsModifiers ) ;
	// [ common.SYMBOL_PARENT ] could be null, it happens when a stat is detached from the table.
	// E.g.: during Spellcast scripting init phase.
	return Stat.computeModifiers( this.operandType , actual , base , this[ common.SYMBOL_PARENT ]?.statsModifiers[ pathKey ] ) ;
} ;



WildNestedStats.prototype.getProxy = function( pathKey = this.pathKey ) {
	if ( this.proxy[ pathKey ] ) { return this.proxy[ pathKey ] ; }
	return this.proxy[ pathKey ] = new Proxy( { target: this , pathKey } , NESTED_HANDLER ) ;
} ;

// ...args is for derivated class
WildNestedStats.prototype.cloneProxy = function( ... args ) { return this.clone( ... args ).getProxy() ; } ;



WildNestedStats.prototype.getBase =
WildNestedStats.prototype.getBaseProxy = function( pathKey = this.pathKey ) {
	if ( this.baseProxy[ pathKey ] ) { return this.baseProxy[ pathKey ] ; }
	return this.baseProxy[ pathKey ] = new Proxy( { target: this , pathKey } , BASE_HANDLER ) ;
} ;



WildNestedStats.prototype.getActual = function( pathKey = this.pathKey ) {
	if ( this.actualProxy[ pathKey ] ) { return this.actualProxy[ pathKey ] ; }
	return this.actualProxy[ pathKey ] = new Proxy( { target: this , pathKey } , ACTUAL_HANDLER ) ;
} ;



const NESTED_HANDLER = {
	get: ( { target , pathKey } , property ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( property === common.SYMBOL_PATH_KEY ) { return pathKey ; }		// Debug and unit test
		if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return target.constructor ; }
		if ( property === 'toString' ) { return Object.prototype.toString ; }
		if ( property === 'clone' ) { return target.cloneProxy.bind( target ) ; }

		if ( property === 'template' || property === '_' ) { return target.template && target.template.getProxy( pathKey ? pathKey + '.template' : 'template' ) ; }
		if ( property === 'base' ) { return target.getBase( pathKey ) ; }
		if ( property === 'actual' ) { return target.getActual( pathKey ) ; }

		var finalTarget = target.stats[ property ] ;
		if ( ! finalTarget ) { return ; }

		/*
		console.log( "??? t:" , target ) ;
		console.log( "??? p:" , property ) ;
		console.log( "??? t[p]:" , target.stats[ property ] ) ;
		//*/

		if ( finalTarget?.getProxy ) { return finalTarget.getProxy( pathKey ? pathKey + '.' + property : property ) ; }
		if ( typeof finalTarget === 'function' ) { return finalTarget.bind( target ) ; }
		return finalTarget ;
	} ,
	// Mostly a copy of .get()
	has: ( { target } , property ) => {
		if ( property === common.SYMBOL_UNPROXY ) { return true ; }
		if ( property === common.SYMBOL_PATH_KEY ) { return true ; }        // Debug and unit test
		//if ( property === '__prototypeUID__' ) { return target.__prototypeUID__ ; }
		//if ( property === '__prototypeVersion__' ) { return target.__prototypeVersion__ ; }
		if ( property === 'constructor' ) { return true ; }
		if ( property === 'toString' ) { return true ; }
		if ( property === 'clone' ) { return true ; }

		if ( property === 'template' || property === '_' ) { return true ; }
		if ( property === 'base' ) { return true ; }
		if ( property === 'actual' ) { return true ; }

		return property in target.stats ;
	} ,
	set: ( { target } , property , value ) => {
		return target.setStat( property , value ) ;
	} ,
	deleteProperty: ( { target } , property ) => {
		if ( ! ( property in target.stats ) ) { return false ; }
		return delete target.stats[ property ] ;
	} ,
	ownKeys: ( { target } ) => [ 'template' , ... Object.keys( target.stats ) ] ,
	getOwnPropertyDescriptor: ( { target , pathKey } , property ) => {
		if ( ! property || typeof property !== 'string' ) { return ; }

		var finalTarget ;

		if ( property === 'template' || property === '_' ) {
			finalTarget = target.template ;
		}
		else {
			finalTarget = target.stats[ property ] ;
		}

		if ( ! finalTarget ) { return ; }

		return {
			value: finalTarget?.getProxy ? finalTarget.getProxy( pathKey ? pathKey + '.' + property : property ) : finalTarget ,
			writable: true ,
			// Mandatory, for some reasons .ownKeys() is always cross-checking each props using getOwnPropertyDescriptor().enumerable
			enumerable: true ,
			configurable: true
		} ;
	} ,
	getPrototypeOf: ( { target } ) => Reflect.getPrototypeOf( target ) ,
	setPrototypeOf: () => false
} ;

WildNestedStats.NESTED_HANDLER = NESTED_HANDLER ;



const BASE_HANDLER = {
	get: ( { target } , property ) => {
		//if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( ! property || typeof property !== 'string' ) { return null ; }

		var finalTarget = target.stats[ property ] ;
		if ( ! finalTarget ) { return ; }

		if ( finalTarget.getProxy ) { return finalTarget.getProxy() ; }
		//if ( typeof finalTarget === 'function' ) { return finalTarget.bind( target ) ; }
		return finalTarget ;
	} ,
	has: ( { target } , property ) => {
		return property in target.stats ;
	} ,
	set: ( { target } , property , value ) => {
		if ( ! property || typeof property !== 'string' ) { return false ; }
		return target.setStat( property , value ) ;
	} ,
	deleteProperty: ( { target } , property ) => {
		if ( ! ( property in target.stats ) ) { return false ; }
		return delete target.stats[ property ] ;
	} ,
	ownKeys: ( { target } ) => [ ... Object.keys( target.stats ) ] ,
	getOwnPropertyDescriptor: ( { target } , property ) => {
		if ( ! property || typeof property !== 'string' ) { return ; }

		var finalTarget = target.stats[ property ] ;
		if ( ! finalTarget ) { return ; }

		return {
			value: finalTarget?.getProxy ? finalTarget.getProxy() : finalTarget ,
			writable: true ,
			// Mandatory, for some reasons .ownKeys() is always cross-checking each props using getOwnPropertyDescriptor().enumerable
			enumerable: true ,
			configurable: true
		} ;
	} ,
	getPrototypeOf: () => Object.prototype ,
	setPrototypeOf: () => false
} ;

WildNestedStats.BASE_HANDLER = BASE_HANDLER ;



const ACTUAL_HANDLER = {
	get: ( { target , pathKey } , property ) => {
		//console.log( "Actual get handler" , property , target , target[ common.SYMBOL_PARENT ].computeModifiers) ;
		//if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( ! property || typeof property !== 'string' ) { return null ; }

		var baseExists = Object.hasOwn( target.stats , property ) ,
			actualExists = target.computeModifiers( baseExists , baseExists , pathKey + '.' + property ) ;

		//console.log( "Testing" , pathKey + '.' + property , baseExists , actualExists , target.stats ) ;
		if ( ! actualExists ) { return ; }

		var finalTarget = baseExists ? target.stats[ property ] : target.template ;
		if ( ! finalTarget ) { return ; }

		if ( finalTarget.getProxy ) { return finalTarget.getProxy( pathKey ? pathKey + '.' + property : property ) ; }
		//if ( typeof finalTarget === 'function' ) { return finalTarget.bind( target ) ; }
		return finalTarget ;
	} ,
	// Mostly a copy of .get()
	has: ( { target , pathKey } , property ) => {
		if ( ! property || typeof property !== 'string' ) { return false ; }

		var baseExists = Object.hasOwn( target.stats , property ) ,
			actualExists = target.computeModifiers( baseExists , baseExists , pathKey + '.' + property ) ;

		return actualExists ;
	} ,
	set: () => false ,
	deleteProperty: () => false ,
	ownKeys: ( { target , pathKey } ) => {
		var parent = target[ common.SYMBOL_PARENT ] ,
			keys = new Set( Object.keys( target.stats ) ) ;

		for ( let property in parent.wildChildrenModifierKeys[ pathKey ] ) {
			if ( ! property || typeof property !== 'string' ) { continue ; }

			let baseExists = Object.hasOwn( target.stats , property ) ,
				actualExists = target.computeModifiers( baseExists , baseExists , pathKey + '.' + property ) ;

			if ( actualExists ) { keys.add( property ) ; }
			else { keys.delete( property ) ; }
		}

		//console.error( "keys:" , keys ) ;
		return [ ... keys ] ;
	} ,
	getOwnPropertyDescriptor: ( { target , pathKey } , property ) => {
		if ( ! property || typeof property !== 'string' ) { return ; }

		var baseExists = Object.hasOwn( target.stats , property ) ,
			actualExists = target.computeModifiers( baseExists , baseExists , pathKey + '.' + property ) ;

		if ( ! actualExists ) { return ; }

		var finalTarget = baseExists ? target.stats[ property ] : target.template ;
		if ( ! finalTarget ) { return ; }

		if ( finalTarget.getProxy ) { finalTarget = finalTarget.getProxy( pathKey ? pathKey + '.' + property : property ) ; }

		return {
			value: finalTarget ,
			writable: false ,
			// Mandatory, for some reasons .ownKeys() is always cross-checking each props using getOwnPropertyDescriptor().enumerable
			enumerable: true ,
			configurable: true
		} ;
	} ,
	getPrototypeOf: () => Object.prototype ,
	setPrototypeOf: () => false
} ;

WildNestedStats.ACTUAL_HANDLER = ACTUAL_HANDLER ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/NumberStat.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





/*
	The most basic stat: it's just a number.
	It's also the default stat.
*/

function NumberStat( params = {} , parentTable = null , pathKey = null ) {
	var base =
		params && typeof params === 'object' ? + params.base || 0 :
		+ params || 0 ;

	Stat.call( this , base , parentTable , pathKey ) ;
}

const Stat = require( './Stat.js' ) ;
NumberStat.prototype = Object.create( Stat.prototype ) ;
NumberStat.prototype.constructor = NumberStat ;
NumberStat.prototype.__prototypeUID__ = 'stats-modifiers/NumberStat' ;

module.exports = NumberStat ;



const common = require( './common.js' ) ;



NumberStat.prototype.operandType = 'number' ;

/*
NumberStat.prototype.proxyMethods = {} ;
NumberStat.prototype.proxyEnumerableProperties = [] ;
NumberStat.prototype.proxyProperties = {} ;
NumberStat.prototype.proxyWritableProperties = {} ;
NumberStat.prototype.proxyGetters = {} ;
NumberStat.prototype.proxySetters = {} ;
*/



NumberStat.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return new NumberStat( this , parentTable , pathKey ) ;
} ;



// Called by Spellcast when extending a data structure
NumberStat.prototype.set = function( params ) {
	if ( typeof params === 'number' ) {
		this.setBase( params ) ;
		return true ;
	}

	return false ;
} ;



NumberStat.prototype.setBase = function( base ) {
	this.base = + base || 0 ;
	return true ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/StringStat.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





/*
	This is a string stat, like a name, description, quality, etc...
*/

function StringStat( params = {} , parentTable = null , pathKey = null ) {
	var base =
		params && typeof params === 'object' ? '' + params.base :
		'' + params ;

	Stat.call( this , base , parentTable , pathKey ) ;
}

const Stat = require( './Stat.js' ) ;
StringStat.prototype = Object.create( Stat.prototype ) ;
StringStat.prototype.constructor = StringStat ;
StringStat.prototype.__prototypeUID__ = 'stats-modifiers/StringStat' ;

module.exports = StringStat ;



const common = require( './common.js' ) ;



StringStat.prototype.operandType = 'string' ;

/*
StringStat.prototype.proxyMethods = {} ;
StringStat.prototype.proxyEnumerableProperties = [] ;
StringStat.prototype.proxyProperties = {} ;
StringStat.prototype.proxyWritableProperties = {} ;
StringStat.prototype.proxyGetters = {} ;
StringStat.prototype.proxySetters = {} ;
*/



StringStat.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return new StringStat( this , parentTable , pathKey ) ;
} ;



// Called by Spellcast when extending a data structure
StringStat.prototype.set = function( extender ) {
	if ( typeof extender === 'string' ) {
		this.setBase( extender ) ;
		return true ;
	}

	return false ;
} ;



StringStat.prototype.setBase = function( base ) {
	this.base = '' + base ;
	return true ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/TemplateStat.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





/*
	This is a KungFig's TemplateSentence
*/

function TemplateStat( base , parentTable = null , pathKey = null ) {
	Stat.call( this , base , parentTable , pathKey ) ;
}

const Stat = require( './Stat.js' ) ;
TemplateStat.prototype = Object.create( Stat.prototype ) ;
TemplateStat.prototype.constructor = TemplateStat ;
TemplateStat.prototype.__prototypeUID__ = 'stats-modifiers/TemplateStat' ;

module.exports = TemplateStat ;



const common = require( './common.js' ) ;



TemplateStat.prototype.operandType = 'template' ;

/*
TemplateStat.prototype.proxyMethods = {} ;
TemplateStat.prototype.proxyEnumerableProperties = [] ;
TemplateStat.prototype.proxyProperties = {} ;
TemplateStat.prototype.proxyWritableProperties = {} ;
TemplateStat.prototype.proxyGetters = {} ;
TemplateStat.prototype.proxySetters = {} ;
*/



TemplateStat.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return new TemplateStat( this.base , parentTable , pathKey ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/Traits.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





/*
	Traits stats are a collection of traits, or tags.
	They can be useful to add/remove properties to/from an entity.
*/

function Traits( base , parentTable = null , pathKey = null ) {
	Stat.call( this , {} , parentTable , pathKey ) ;

	if ( base ) { this.setBase( base ) ; }

	this.baseProxy = {} ;
	this.actualProxy = {} ;
}

const Stat = require( './Stat.js' ) ;
Traits.prototype = Object.create( Stat.prototype ) ;
Traits.prototype.constructor = Traits ;
Traits.prototype.__prototypeUID__ = 'stats-modifiers/Traits' ;

module.exports = Traits ;



const common = require( './common.js' ) ;



Traits.prototype.operandType = 'boolean' ;
Traits.prototype.hasWildChildren = true ;

Traits.prototype.proxyMethods = {} ;
Traits.prototype.proxyEnumerableProperties = [ 'base' , 'actual' ] ;
Traits.prototype.proxyProperties = {} ;
Traits.prototype.proxyWritableProperties = {} ;
Traits.prototype.proxyGetters = {} ;
Traits.prototype.proxySetters = {} ;



Traits.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return new Traits( this.base , parentTable , pathKey ) ;
} ;



Traits.prototype.clearAfterFixAttachment = function() {
	this.proxy = {} ;
	this.baseProxy = {} ;
	this.actualProxy = {} ;
} ;



// Called by Spellcast when extending a data structure
Traits.prototype.set =
Traits.prototype.setBase = function( base ) {
	if ( Array.isArray( base ) || base instanceof Set ) {
		common.clearObject( this.base ) ;
		for ( let trait of base ) {
			if ( trait && typeof trait === 'string' ) {
				this.base[ trait ] = true ;
			}
		}

		return true ;
	}
	else if ( common.isPlainObject( base ) ) {
		common.clearObject( this.base ) ;
		for ( let trait in base ) {
			if ( trait && typeof trait === 'string' && base[ trait ] ) {
				this.base[ trait ] = true ;
			}
		}

		return true ;
	}
	else if ( base && typeof base === 'string' ) {
		common.clearObject( this.base ) ;
		this.base[ base ] = true ;
		return true ;
	}

	return false ;
} ;



Traits.prototype.getBase =
Traits.prototype.getBaseProxy = function( pathKey = this.pathKey ) {
	//if ( pathKey !== this.pathKey ) { console.log( "GET PROXY PATH KEY:" , pathKey , "instead of" , this.pathKey ) ; }
	if ( this.baseProxy[ pathKey ] ) { return this.baseProxy[ pathKey ] ; }
	return this.baseProxy[ pathKey ] = new Proxy( { target: this , pathKey } , BASE_HANDLER ) ;
} ;



Traits.prototype.getActual = function( pathKey = this.pathKey ) {
	//if ( pathKey !== this.pathKey ) { console.log( "GET PROXY PATH KEY:" , pathKey , "instead of" , this.pathKey ) ; }
	if ( this.actualProxy[ pathKey ] ) { return this.actualProxy[ pathKey ] ; }
	return this.actualProxy[ pathKey ] = new Proxy( { target: this , pathKey } , ACTUAL_HANDLER ) ;
} ;



Traits.prototype.clear = function() { common.clearObject( this.base ) ; } ;



const BASE_HANDLER = {
	get: ( { target } , property ) => {
		//if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( ! property || typeof property !== 'string' ) { return null ; }
		return target.base[ property ] === true ;
	} ,
	// Mostly a copy of .get()
	has: ( { target } , property ) => {
		if ( ! property || typeof property !== 'string' ) { return false ; }
		return target.base[ property ] === true ;
	} ,
	set: ( { target } , property , value ) => {
		if ( ! property || typeof property !== 'string' ) { return false ; }
		if ( value ) { target.base[ property ] = true ; }
		else { delete target.base[ property ] ; }
		return true ;
	} ,
	deleteProperty: () => false ,
	ownKeys: ( { target } ) => [ ... Object.keys( target.base ) ] ,
	getOwnPropertyDescriptor: ( { target }  , property ) => {
		if ( ! property || typeof property !== 'string' ) { return ; }

		return {
			value: target.base[ property ] === true ,
			writable: true ,
			// Mandatory, for some reasons .ownKeys() is always cross-checking each props using getOwnPropertyDescriptor().enumerable
			enumerable: true ,
			configurable: true
		} ;
	} ,
	getPrototypeOf: () => Object.prototype ,
	setPrototypeOf: () => false
} ;

Traits.BASE_HANDLER = BASE_HANDLER ;



const ACTUAL_HANDLER = {
	get: ( { target , pathKey }  , property ) => {
		//if ( property === common.SYMBOL_UNPROXY ) { return target ; }
		if ( ! property || typeof property !== 'string' ) { return null ; }
		var base = target.base[ property ] === true ;
		return target.computeModifiers( base , base , pathKey ? pathKey + '.' + property : property ) ;
	} ,
	// Mostly a copy of .get()
	has: ( { target , pathKey }  , property ) => {
		if ( ! property || typeof property !== 'string' ) { return false ; }
		var base = target.base[ property ] === true ;
		return !! target.computeModifiers( base , base , pathKey ? pathKey + '.' + property : property ) ;
	} ,
	set: () => false ,
	deleteProperty: () => false ,
	ownKeys: ( { target , pathKey } ) => {
		var parent = target[ common.SYMBOL_PARENT ] ,
			keys = new Set( Object.keys( target.base ) ) ;

		if ( parent ) {	// When the Traits is not yet attached, the proxy cause trouble, so we ensure that there is a parent...
			for ( let property in parent.wildChildrenModifierKeys[ pathKey ] ) {
				if ( ! property || typeof property !== 'string' ) { continue ; }

				let base = target.base[ property ] === true ,
					actual = target.computeModifiers( base , base , pathKey ? pathKey + '.' + property : property ) ;

				if ( actual ) { keys.add( property ) ; }
				else { keys.delete( property ) ; }
			}
		}

		//console.error( "keys:" , keys ) ;
		return [ ... keys ] ;
	} ,
	getOwnPropertyDescriptor: ( { target , pathKey } , property ) => {
		if ( ! property || typeof property !== 'string' ) { return ; }

		var base = target.base[ property ] === true ,
			actual = target.computeModifiers( base , base , pathKey ? pathKey + '.' + property : property ) ;

		return {
			value: actual ,
			writable: false ,
			// Mandatory, for some reasons .ownKeys() is always cross-checking each props using getOwnPropertyDescriptor().enumerable
			enumerable: true ,
			configurable: true
		} ;
	} ,
	getPrototypeOf: () => Object.prototype ,
	setPrototypeOf: () => false
} ;

Traits.ACTUAL_HANDLER = ACTUAL_HANDLER ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/CompoundStat.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





function CompoundStat( arg1 , arg2 , parentTable , pathKey ) {
	if ( arg2 instanceof StatsTable ) {
		pathKey = parentTable ;
		parentTable = arg2 ;
	}

	Stat.call( this , undefined , parentTable , pathKey ) ;

	this.baseFn = null ;
	this.actualFn = null ;
	this.statNames = null ;
	this.isBuiltin = true ;

	if ( typeof arg1 === 'string' ) {
		if ( ! compounds[ arg1 ] ) { throw new Error( "Unknown compound operator '" + arg1 + "'" ) ; }
		this.baseFn = this.actualFn = compounds[ arg1 ] ;
		this.statNames = Array.isArray( arg2 ) ? arg2 : [ arg2 ] ;
	}
	else if ( typeof arg1 === 'function' && typeof arg2 === 'function' ) {
		this.baseFn = arg1 ;
		this.actualFn = arg2 ;
		this.isBuiltin = false ;
	}
	else if ( arg1?.__prototypeUID__ === 'kung-fig/Expression' ) {
		this.baseFn = CompoundStat.expressionToFn( arg1 , 'base' ) ;
		this.actualFn = CompoundStat.expressionToFn( arg1 , 'actual' ) ;
		this.isBuiltin = false ;
	}
	else if ( arg1?.__prototypeUID__ === 'kung-fig/Ref' ) {
		this.baseFn = CompoundStat.refToFn( arg1 , 'base' ) ;
		this.actualFn = CompoundStat.refToFn( arg1 , 'actual' ) ;
		this.isBuiltin = false ;
	}
	else {
		throw new Error( "CompoundStat: bad operator type" ) ;
	}
}

const Stat = require( './Stat.js' ) ;
CompoundStat.prototype = Object.create( Stat.prototype ) ;
CompoundStat.prototype.constructor = CompoundStat ;
CompoundStat.prototype.__prototypeUID__ = 'stats-modifiers/CompoundStat' ;

module.exports = CompoundStat ;



const StatsTable = require( './StatsTable.js' ) ;

const common = require( './common.js' ) ;
const compounds = require( './compounds.js' ) ;

const dotPath = require( 'tree-kit/lib/dotPath.js' ) ;



CompoundStat.prototype.operandType = 'number' ;

CompoundStat.prototype.proxyMethods = {} ;
CompoundStat.prototype.proxyEnumerableProperties = [ 'base' , 'actual' ] ;
CompoundStat.prototype.proxyProperties = {} ;
CompoundStat.prototype.proxyWritableProperties = {} ;
CompoundStat.prototype.proxyGetters = {} ;
CompoundStat.prototype.proxySetters = {} ;



CompoundStat.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return this.isBuiltin ?
		new CompoundStat( this.actualFn.id , [ ... this.statNames ] , parentTable , pathKey ) :
		new CompoundStat( this.baseFn , this.actualFn , parentTable , pathKey ) ;
} ;



CompoundStat.prototype.getBase = function( pathKey = this.pathKey ) {
	var proxy = this[ common.SYMBOL_PARENT ].getProxy( pathKey ) ;

	if ( this.isBuiltin ) {
		return this.baseFn( this.statNames.map( statName => {
			var stat = dotPath.get( proxy , statName )[ common.SYMBOL_UNPROXY ] ;
			return stat instanceof Stat ? stat.getBase() : null ;
		} ) ) ;
	}

	return this.baseFn( proxy ) ;
} ;



CompoundStat.prototype.getActual = function( pathKey = this.pathKey ) {
	var actual ,
		base = this.getBase() ,
		proxy = this[ common.SYMBOL_PARENT ].getProxy( pathKey ) ;

	if ( this.isBuiltin ) {
		actual = this.actualFn( this.statNames.map( statName => {
			var stat = dotPath.get( proxy , statName )[ common.SYMBOL_UNPROXY ] ;
			return stat instanceof Stat ? stat.getActual() : null ;
		} ) ) ;
	}
	else {
		actual = this.actualFn( proxy ) ;
	}

	return this.computeModifiers( actual , base , pathKey ) ;
} ;



// Patch Kung Fig expression, to append .actual to each ref
CompoundStat.patchExpressionRef = function( expression , suffix ) {
	for ( let arg of expression.args ) {
		if ( arg && typeof arg === 'object' ) {
			if ( arg.__prototypeUID__ === 'kung-fig/Ref' ) { arg.appendPart( suffix ) ; }
			else if ( arg.__prototypeUID__ === 'kung-fig/Expression' ) { CompoundStat.patchExpressionRef( arg , suffix ) ; }
		}
	}
} ;



CompoundStat.expressionToFn = function( expression , suffix = null ) {
	// Do not modify the original Expression, coming from the KFG
	if ( suffix ) {
		expression = expression.clone() ;
		CompoundStat.patchExpressionRef( expression , suffix ) ;
	}

	return expression.compile() ;
} ;



CompoundStat.refToFn = function( ref_ , suffix = null ) {
	// Do not modify the original Expression, coming from the KFG
	if ( suffix ) {
		ref_ = ref_.clone() ;
		ref_.appendPart( suffix ) ;
	}

	return ref_.compile() ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/Pool.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





/*
	A Pool is used for pool system like hit points, action points, and generaly things that can be used, depleted, restored,
	replenished on a new turn, and so on...
*/

function Pool( params = {} , parentTable = null , pathKey = null ) {
	if ( typeof params === 'number' ) { params = { base: params , used: 0 } ; }
	Stat.call( this , 0 , parentTable , pathKey ) ;

	this.used = 0 ;		// the quantity used and wasted, this is the main value affecting .actual, aside from modifiers
	this.allocated = 0 ;	// prepare to use this quantity, but do not commit it yet, does not change .actual until commited

	this.reserveFactor = 0 ;	// if set, the pool has a secondary reserve, which can be used to restore the main pool
	this.reserveUsed = 0 ;	// the quantity of the reserve that have been used, to refill the main pool

	/*
		Modes and default behavior:
		We want .internalOveruse to be on by default because it is CONSISTENT.
		It is possible to .stack() modifiers and .use() some of the pool's quantity in any order, then .unstack()
		and get consistent results.
	*/
	this.internalOveruse = true ;	// allow to use more than the remaining (.used can be > .max), producing .actual < 0 if .actualOveruse is set
	this.internalOverflow = false ;	// allow .used to be negative, producing .actual > .max if .actualOverflow is set
	this.actualOveruse = false ;	// allow .actual value to be negative
	this.actualOverflow = false ;	// allow .actual value to be negative (not capped at 0)
	this.actualRound = null ;	// round .actual (not .used), can be: null, "round", "ceil" or "floor"

	if ( params ) { this.set( params ) ; }
}

const Stat = require( './Stat.js' ) ;
Pool.prototype = Object.create( Stat.prototype ) ;
Pool.prototype.constructor = Pool ;
Pool.prototype.__prototypeUID__ = 'stats-modifiers/Pool' ;

module.exports = Pool ;



const common = require( './common.js' ) ;



Pool.prototype.operandType = 'number' ;

Pool.prototype.proxyMethods = {
	commit: 'commit' ,
	replenish: 'replenish' ,
	replenishReserve: 'replenishReserve' ,
	'replenish-reserve': 'replenishReserve' ,
	empty: 'empty' ,
	emptyReserve: 'emptyReserve' ,
	'empty-reserve': 'emptyReserve' ,
	cleanUp: 'cleanUp' ,
	'clean-up': 'cleanUp' ,
	add: 'add' ,
	preAdd: 'preAdd' ,
	'pre-add': 'preAdd' ,
	addToReserve: 'addToReserve' ,
	'add-to-reserve': 'addToReserve' ,
	gain: 'gain' ,
	preGain: 'preGain' ,
	'pre-gain': 'preGain' ,
	gainReserve: 'gainReserve' ,
	'gain-reserve': 'gainReserve' ,
	lose: 'lose' ,
	preLose: 'preLose' ,
	'pre-lose': 'preLose' ,
	loseReserve: 'loseReserve' ,
	'lose-reserve': 'loseReserve' ,
	restore: 'restore' ,
	preRestore: 'preRestore' ,
	'pre-restore': 'preRestore' ,
	restoreReserve: 'restoreReserve' ,
	'restore-reserve': 'restoreReserve' ,
	deplete: 'deplete' ,
	preDeplete: 'preDeplete' ,
	'pre-deplete': 'preDeplete' ,
	depleteReserve: 'depleteReserve' ,
	'deplete-reserve': 'depleteReserve' ,
	use: 'use' ,
	allocate: 'allocate' ,
	preUse: 'preUse' ,
	'pre-use': 'preUse' ,
	tap: 'tap' ,
	tapIntoReserve: 'tap' ,
	'tap-into-reserve': 'tap' ,
	stash: 'stash' ,
	stashInReserve: 'stash' ,
	'stash-in-reserve': 'stash' ,
	balance: 'balance' ,
	balanceReserve: 'balance' ,
	'balance-reserve': 'balance'
} ;

Pool.prototype.proxyEnumerableProperties = [
	'base' , 'actual' , 'used' , 'allocated' , 'reserve-factor' , 'reserve-used'
] ;

Pool.prototype.proxyProperties = {
	used: 'used' ,
	lost: 'used' ,
	reserveFactor: 'reserveFactor' ,
	'reserve-factor': 'reserveFactor' ,
	reserveUsed: 'reserveUsed' ,
	'reserve-used': 'reserveUsed' ,
	reserveLost: 'reserveUsed' ,
	'reserve-lost': 'reserveUsed' ,
	allocated: 'allocated' ,
	internalOveruse: 'internalOveruse' ,
	'internal-overuse': 'internalOveruse' ,
	internalOverflow: 'internalOverflow' ,
	'internal-overflow': 'internalOverflow' ,
	actualOveruse: 'actualOveruse' ,
	'actual-overuse': 'actualOveruse' ,
	actualOverflow: 'actualOverflow' ,
	'actual-overflow': 'actualOverflow' ,
	actualRound: 'actualRound' ,
	'actual-round': 'actualRound'
} ;

Pool.prototype.proxyWritableProperties = {} ;

Pool.prototype.proxyGetters = {
	actualMax: 'getActualMax' ,
	'actual-max': 'getActualMax' ,
	actualReserve: 'getActualReserve' ,
	'actual-reserve': 'getActualReserve' ,
	actualPoolAndReserve: 'getActualPoolAndReserve' ,
	'actual-pool-and-reserve': 'getActualPoolAndReserve' ,
	actualReserveMax: 'getActualReserveMax' ,
	'actual-reserve-max': 'getActualReserveMax' ,
	isFull: 'isFull' ,
	'is-full': 'isFull' ,
	isReserveFull: 'isReserveFull' ,
	'is-reserve-full': 'isReserveFull' ,
	isEmpty: 'isEmpty' ,
	'is-empty': 'isEmpty' ,
	isReserveEmpty: 'isReserveEmpty' ,
	'is-reserve-empty': 'isReserveEmpty' ,
	overuse: 'getOveruse' ,
	overflow: 'getOverflow'
} ;

Pool.prototype.proxySetters = {
	actual: 'setActual' ,
	used: 'setUsed' ,
	lost: 'setUsed' ,
	actualReserve: 'setActualReserve' ,
	'actual-reserve': 'setActualReserve' ,
	reserveUsed: 'setReserveUsed' ,
	'reserve-used': 'setReserveUsed' ,
	reserveLost: 'setReserveUsed' ,
	'reserve-lost': 'setReserveUsed' ,
	reserveFactor: 'setReserveFactor' ,
	'reserve-factor': 'setReserveFactor' ,
	internalOveruse: 'setInternalOveruse' ,
	'internal-overuse': 'setInternalOveruse' ,
	internalOverflow: 'setInternalOverflow' ,
	'internal-overflow': 'setInternalOverflow' ,
	actualOveruse: 'setActualOveruse' ,
	'actual-overuse': 'setActualOveruse' ,
	actualOverflow: 'setActualOverflow' ,
	'actual-overflow': 'setActualOverflow' ,
	overuse: 'setOveruse' ,
	overflow: 'setOverflow' ,
	actualRound: 'setActualRound' ,
	'actual-round': 'setActualRound'
} ;



Pool.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return new Pool( this , parentTable , pathKey ) ;
} ;



// Called by Spellcast when extending a data structure
Pool.prototype.set = function( params ) {
	if ( typeof params === 'number' ) {
		this.setBase( params ) ;
		return true ;
	}

	if ( common.isPlainObject( params ) || params instanceof Pool ) {
		// The order matters! .used should be set AFTER .internalOverflow and .internalOveruse
		if ( params.base !== undefined ) { this.setBase( params.base ) ; }

		if ( params.overuse !== undefined ) { this.setOveruse( params.overuse ) ; }
		if ( params.overflow !== undefined ) { this.setOverflow( params.overflow ) ; }

		if ( params.internalOveruse !== undefined ) { this.setInternalOveruse( params.internalOveruse ) ; }
		else if ( params['internal-overuse'] !== undefined ) { this.setInternalOveruse( params['internal-overuse'] ) ; }

		if ( params.internalOverflow !== undefined ) { this.setInternalOverflow( params.internalOverflow ) ; }
		else if ( params['internal-overflow'] !== undefined ) { this.setInternalOverflow( params['internal-overflow'] ) ; }

		if ( params.actualOveruse !== undefined ) { this.setActualOveruse( params.actualOveruse ) ; }
		else if ( params['actual-overuse'] !== undefined ) { this.setActualOveruse( params['actual-overuse'] ) ; }

		if ( params.actualOverflow !== undefined ) { this.setActualOverflow( params.actualOverflow ) ; }
		else if ( params['actual-overflow'] !== undefined ) { this.setActualOverflow( params['actual-overflow'] ) ; }

		if ( params.actualRound !== undefined ) { this.setActualRound( params.actualRound ) ; }
		else if ( params['actual-round'] !== undefined ) { this.setActualRound( params['actual-round'] ) ; }

		if ( params.used !== undefined ) { this.setUsed( params.used ) ; }
		if ( params.allocated !== undefined ) { this.setAllocated( params.allocated ) ; }

		if ( params.reserveFactor !== undefined ) { this.setReserveFactor( params.reserveFactor ) ; }
		else if ( params['reserve-factor'] !== undefined ) { this.setReserveFactor( params['reserve-factor'] ) ; }

		if ( params.reserveUsed !== undefined ) { this.setReserveUsed( params.reserveUsed ) ; }
		else if ( params['reserve-used'] !== undefined ) { this.setReserveUsed( params['reserve-used'] ) ; }

		return true ;
	}

	return false ;
} ;



Pool.prototype.setBase = function( base ) {
	this.base = + base || 0 ;
	return true ;
} ;



Pool.prototype.setUsed = function( used ) {
	this.used = + used || 0 ;

	if ( ! this.internalOveruse ) {
		let max = Math.max( 0 , this.getActualMax() ) ;
		let maxMinusAllocated = this.allocated > 0 ? max - this.allocated : max ;
		if ( this.used > maxMinusAllocated ) { this.used = maxMinusAllocated ; }
	}

	// .internalOverflow, has a greater importance than .internalOveruse
	if ( ! this.internalOverflow && this.used < 0 ) { this.used = 0 ; }

	return true ;
} ;



Pool.prototype.setAllocated = function( allocated ) {
	this.allocated = + allocated || 0 ;

	if ( ! this.internalOveruse ) {
		let max = Math.max( 0 , this.getActualMax() ) ;
		let maxMinusUsed = this.used > 0 ? max - this.used : max ;
		if ( this.allocated > maxMinusUsed ) { this.allocated = maxMinusUsed ; }
	}

	// .internalOverflow, has a greater importance than .internalOveruse
	if ( ! this.internalOverflow && this.allocated < 0 ) { this.allocated = 0 ; }

	return true ;
} ;



Pool.prototype.getOveruse = function() { return this.internalOveruse && this.actualOveruse ; } ;
Pool.prototype.getOverflow = function() { return this.internalOverflow && this.actualOverflow ; } ;
Pool.prototype.setOveruse = function( overuse ) { this.setInternalOveruse( overuse ) ; this.setActualOveruse( overuse ) ; return true ; } ;
Pool.prototype.setOverflow = function( overflow ) { this.setInternalOverflow( overflow ) ; this.setActualOverflow( overflow ) ; return true ; } ;



Pool.prototype.setInternalOveruse = function( overuse ) {
	overuse = !! overuse ;
	if ( this.internalOveruse === overuse ) { return true ; }
	this.internalOveruse = overuse ;

	if ( ! this.internalOveruse ) {
		// It's safer to re-use the same process.
		// If it's overused, allocated will be truncated first.
		this.setAllocated( this.allocated ) ;
		this.setUsed( this.used ) ;
	}

	return true ;
} ;



Pool.prototype.setInternalOverflow = function( overflow ) {
	overflow = !! overflow ;
	if ( this.internalOverflow === overflow ) { return true ; }
	this.internalOverflow = overflow ;

	if ( ! this.internalOverflow ) {
		if ( this.used < 0 ) { this.used = 0 ; }
		if ( this.allocated < 0 ) { this.allocated = 0 ; }
	}

	return true ;
} ;



Pool.prototype.setActualOveruse = function( overuse ) {
	this.actualOveruse = !! overuse ;
	return true ;
} ;



Pool.prototype.setActualOverflow = function( overflow ) {
	this.actualOverflow = !! overflow ;
	return true ;
} ;



Pool.prototype.setActualRound = function( round ) {
	this.actualRound = ! round ? null :
		round === 'ceil' ? 'ceil' :
		round === 'floor' ? 'floor' :
		'round' ;
	return true ;
} ;



Pool.prototype.setReserveFactor = function( factor ) {
	factor = + factor || 0 ;
	if ( factor < 0 ) { factor = 0 ; }
	this.reserveFactor = factor ;
	return true ;
} ;



Pool.prototype.setReserveUsed = function( used ) {
	used = + used || 0 ;
	if ( used < 0 ) { used = 0 ; }
	this.reserveUsed = used ;
	return true ;
} ;



Pool.prototype.getActual = function( pathKey = this.pathKey ) {
	var max = this.getActualMax() ,
		actual = max - this.used ;

	return this._postProcessActual( actual , max ) ;
} ;



Pool.prototype.setActual = function( actual ) {
	actual = + actual || 0 ;
	var max = this.getActualMax() ;

	// This is debatable if it is better to apply rounding or not for this method...
	// If so it should comes BEFORE anything else.
	if ( this.actualRound ) { actual = this._round( actual , this.actualRound ) ; }

	if ( ! this.actualOveruse && actual < 0 ) { actual = 0 ; }

	// .actualOverflow, has a greater importance than .actualOveruse
	if ( ! this.actualOverflow && actual > max ) { actual = max ; }

	this.used = max - actual ;

	if ( ! this.internalOveruse && this.used > max ) { this.used = max ; }

	// .internalOverflow, has a greater importance than .internalOveruse
	if ( ! this.internalOverflow && this.used < 0 ) { this.used = 0 ; }

	return true ;
} ;



// Return the sum of the reserve and the main pool, i.e. actual + actualReserve.
// Note: result can differs due to .actualRound, since here rounding occurs only once at the end (as well as overuse/overflow).
Pool.prototype.getActualPoolAndReserve = function() {
	var max = this.getActualMax() ,
		actual = max - this.used ,
		reserveMax = this.reserveFactor * max ,
		actualReserve = reserveMax - this.reserveUsed ;

	return this._postProcessActual( actual + actualReserve , max + reserveMax ) ;
} ;



Pool.prototype.getActualReserve = function() {
	var max = this.getActualReserveMax() ,
		actual = max - this.reserveUsed ;

	return this._postProcessActual( actual , max ) ;
} ;



Pool.prototype.setActualReserve = function( actual ) {
	actual = + actual || 0 ;
	var max = this.getActualReserveMax() ;

	// This is debatable if it is better to apply rounding or not for this method...
	// If so it should comes BEFORE anything else.
	if ( this.actualRound ) { actual = this._round( actual , this.actualRound ) ; }

	if ( ! this.actualOveruse && actual < 0 ) { actual = 0 ; }

	// .actualOverflow, has a greater importance than .actualOveruse
	if ( ! this.actualOverflow && actual > max ) { actual = max ; }

	this.reserveUsed = max - actual ;

	if ( ! this.internalOveruse && this.reserveUsed > max ) { this.reserveUsed = max ; }

	// .internalOverflow, has a greater importance than .internalOveruse
	if ( ! this.internalOverflow && this.reserveUsed < 0 ) { this.reserveUsed = 0 ; }

	return true ;
} ;



Pool.prototype.getActualMax = function() {
	return this.computeModifiers( this.base , this.base , this.pathKey ) ;
} ;



Pool.prototype.getActualReserveMax = function() {
	if ( ! this.reserveFactor ) { return 0 ; }
	return this.reserveFactor * this.getActualMax() ;
} ;



Pool.prototype.isFull = function() { return this.used <= 0 ; } ;
Pool.prototype.isReserveFull = function() { return this.reserveUsed <= 0 ; } ;
Pool.prototype.isEmpty = function() { return this.getActual() <= 0 ; } ;
Pool.prototype.isReserveEmpty = function() { return this.getActualReserve() <= 0 ; } ;



// Remove overusage or overflow, for both the main pool and the reserve.
// Does not take into consideration the allocated points.
Pool.prototype.cleanUp = function() {
	var max = this.getActualMax() ,
		reserveMax = this.reserveFactor * max ;

	// Order matters
	if ( this.used > max ) { this.used = max ; }
	if ( this.used < 0 ) { this.used = 0 ; }

	if ( this.reserveUsed > reserveMax ) { this.reserveUsed = reserveMax ; }
	if ( this.reserveUsed < 0 ) { this.reserveUsed = 0 ; }
} ;



// Commit the pre-allocated quantity, there are now considered used
Pool.prototype.commit = function() {
	this.used += this.allocated ;
	this.allocated = 0 ;
} ;



// Restore the pool to its max and return the gained quantity
Pool.prototype.replenish = function() {
	if ( this.used <= 0 ) { return 0 ; }
	var restored = this.used ;
	this.used = 0 ;
	return restored ;
} ;

Pool.prototype.replenishReserve = function() {
	if ( this.reserveUsed <= 0 ) { return 0 ; }
	var restored = this.reserveUsed ;
	this.reserveUsed = 0 ;
	return restored ;
} ;



// Empty the pool and return the removed quantity
Pool.prototype.empty = function() {
	var max = this.getActualMax() ,
		emptied = max - this.used - this.allocated ;
	if ( emptied <= 0 ) { return 0 ; }
	this.used += emptied ;
	return emptied ;
} ;

Pool.prototype.emptyReserve = function() {
	var max = this.getActualReserveMax() ,
		emptied = max - this.reserveUsed ;
	if ( emptied <= 0 ) { return 0 ; }
	this.reserveUsed += emptied ;
	return emptied ;
} ;



// Add a relative (positive or negative) quantity and return the quantity actually added
Pool.prototype.add = function( value ) {
	value = + value || 0 ;
	if ( value > 0 ) { return this._gain( value ) ; }
	if ( value < 0 ) { return - this._lose( - value ) ; }
	return 0 ;
} ;

Pool.prototype.preAdd = function( value ) {
	value = + value || 0 ;
	if ( value > 0 ) { return this._preGain( value ) ; }
	if ( value < 0 ) { return - this._preLose( - value ) ; }
	return 0 ;
} ;

Pool.prototype.addToReserve = function( value ) {
	value = + value || 0 ;
	if ( value > 0 ) { return this._gainReserve( value ) ; }
	if ( value < 0 ) { return - this._loseReserve( - value ) ; }
	return 0 ;
} ;

// Gain a (positive) quantity and return the quantity actually gained.
Pool.prototype.gain = function( value ) { return this._gain( value ) ; } ;
Pool.prototype.preGain = function( value ) { return this._preGain( value ) ; } ;
Pool.prototype.gainReserve = function( value ) { return this._gainReserve( value ) ; } ;

// Lose a (positive) quantity and return the quantity actually lost.
Pool.prototype.lose = function( value ) { return this._lose( value ) ; } ;
Pool.prototype.preLose = function( value ) { return this._preLose( value ) ; } ;
Pool.prototype.loseReserve = function( value ) { return this._loseReserve( value ) ; } ;

// Restore/gain a (positive) quantity but never overflow, and return the quantity actually restored/gained
Pool.prototype.restore = function( value ) { return this._gain( value , false ) ; } ;
Pool.prototype.preRestore = function( value ) { return this._preGain( value , false ) ; } ;
Pool.prototype.restoreReserve = function( value ) { return this._gainReserve( value , false ) ; } ;

// Restore/gain a (positive) quantity but never overflow, and return the quantity actually restored/gained
Pool.prototype.deplete = function( value ) { return this._lose( value , false ) ; } ;
Pool.prototype.preDeplete = function( value ) { return this._preLose( value , false ) ; } ;
Pool.prototype.depleteReserve = function( value ) { return this._loseReserve( value , false ) ; } ;

// Use a (positive) quantity but never overuse, it will fail if the quantity is not available.
// Return false if it's not possible to spend that many points, or true if possible and had lost exactly that quantity.
Pool.prototype.use = function( value ) {
	var lost = this._lose( value , false , true ) ;
	return lost === value ;
} ;

// Allocate a (positive) quantity but never overuse, it will fail if the quantity is not available.
// Return false if it's not possible to spend that many points, or true if possible and had lost exactly that quantity.
Pool.prototype.allocate =
Pool.prototype.preUse = function( value ) {
	var lost = this._preLose( value , false , true ) ;
	return lost === value ;
} ;

// Tap into the reserve for a (positive) quantity but never overuse the reserve or overflow the main quantity, if so it would fail.
// Return true if succeeded or false otherwise.
Pool.prototype.tapIntoReserve =
Pool.prototype.tap = function( value ) {
	if ( ! value ) { return true ; }

	var oldReserveUsed = this.reserveUsed ;

	var lost = this._loseReserve( value , false , true ) ;
	if ( ! lost ) { return false ; }

	var gained = this._gain( lost , false , true ) ;
	if ( ! gained ) {
		// That value can't be gained, so we cancel the reserve lost...
		this.reserveUsed = oldReserveUsed ;
		return false ;
	}

	return true ;
} ;

// Stash in the reserve a (positive) quantity but never overflow the reserve or overuse the main quantity, if so it would fail.
// Return true if succeeded or false otherwise.
Pool.prototype.stashInReserve =
Pool.prototype.stash = function( value ) {
	if ( ! value ) { return true ; }

	var oldUsed = this.used ;

	var lost = this._lost( lost , false , true ) ;
	if ( ! lost ) { return false ; }

	var gained = this._gainReserve( value , false , true ) ;
	if ( ! gained ) {
		// That value can't be gained, so we cancel the main pool lost...
		this.used = oldUsed ;
		return false ;
	}

	return true ;
} ;

/*
	Restore the balance between the reserve with the main quantity.
	If reserveFactor=1 it makes it so both actual=actualReserve.
	For other value, the balance is using the relative weight between reserve and main.
	It returns the balance applied to the main quantity, thus can be positive, negative or 0.
	If it's not possible to balance due to any factor (allocation, overuse, overflow), nothing is done and it returns 0.
*/
Pool.prototype.reserveBalance =
Pool.prototype.balance = function() {
	if ( ! this.reserveFactor ) { return 0 ; }

	var max = this.getActualMax() ,
		actual = max - this.used ,
		reserveMax = this.reserveFactor * max ,
		actualReserve = reserveMax - this.reserveUsed ,
		sum = actual + actualReserve ,
		wantedActual = sum / ( 1 + this.reserveFactor ) ;

	if ( this.actualRound ) { wantedActual = this._round( wantedActual , this.actualRound ) ; }

	var balance = wantedActual - actual ;

	if ( balance > 0 ) {
		return this.tap( balance ) ? balance : 0 ;
	}

	if ( balance < 0 ) {
		return this.stash( - balance ) ? balance : 0 ;
	}

	return 0 ;
} ;



/*
	Internal.

	value: the value to gain, must be positive
	overflow: force an overflow mode instead of using the defined behavior
	onlyIfExact: if set, it does nothing if the pool can't gain that exact value
*/
Pool.prototype._gain = function( value , overflow = this.internalOverflow , onlyIfExact = false ) {
	value = + value || 0 ;
	if ( value <= 0 ) { return 0 ; }

	var used = this.used ;

	if ( overflow ) {
		used -= value ;
	}
	else {
		// Got double constraint on both actual used value and to-be-commited value
		if ( this.used <= 0 || this.used + this.allocated <= 0 ) { return 0 ; }	// Avoid truncating it when using ._gain()

		used -= value ;
		if ( used + this.allocated < 0 ) { used = - this.allocated ; }
		if ( used < 0 ) { used = 0 ; }
	}

	var actualValue = this.used - used ;

	if ( onlyIfExact && actualValue !== value ) { return 0 ; }

	this.used = used ;
	return actualValue ;
} ;



/*
	Internal.

	value: the value to gain, must be positive
	overflow: force an overflow mode instead of using the defined behavior
	onlyIfExact: if set, it does nothing if the pool can't gain that exact value
*/
Pool.prototype._preGain = function( value , overflow = this.internalOverflow , onlyIfExact = false ) {
	value = + value || 0 ;
	if ( value <= 0 ) { return 0 ; }

	var allocated = this.allocated ;

	if ( overflow ) {
		allocated -= value ;
	}
	else {
		if ( this.used + this.allocated <= 0 ) { return 0 ; }	// Avoid truncating it when using ._preGain()

		allocated -= value ;
		if ( allocated + this.used < 0 ) { allocated = - this.used ; }
	}

	var actualValue = this.allocated - allocated ;

	if ( onlyIfExact && actualValue !== value ) { return 0 ; }

	this.allocated = allocated ;
	return actualValue ;
} ;



/*
	Internal.

	value: the value to gain, must be positive
	overflow: force an overflow mode instead of using the defined behavior
	onlyIfExact: if set, it does nothing if the pool can't gain that exact value
*/
Pool.prototype._gainReserve = function( value , overflow = this.internalOverflow , onlyIfExact = false ) {
	value = + value || 0 ;
	if ( value <= 0 ) { return 0 ; }

	var reserveUsed = this.reserveUsed ;

	if ( overflow ) {
		reserveUsed -= value ;
	}
	else {
		if ( this.reserveUsed <= 0 ) { return 0 ; }	// Avoid truncating it when using ._gainReserve()

		reserveUsed -= value ;
		if ( reserveUsed < 0 ) { reserveUsed = 0 ; }
	}

	var actualValue = this.reserveUsed - reserveUsed ;

	if ( onlyIfExact && actualValue !== value ) { return 0 ; }

	this.reserveUsed = reserveUsed ;
	return actualValue ;
} ;



/*
	Internal.

	value: the value to lose, must be positive
	overuse: force an overuse mode instead of using the defined behavior
	onlyIfExact: if set, it does nothing if the pool can't lose that exact value
*/
Pool.prototype._lose = function( value , overuse = this.internalOveruse , onlyIfExact = false ) {
	value = + value || 0 ;
	if ( value <= 0 ) { return 0 ; }

	var used = this.used ;

	if ( overuse ) {
		used += value ;
	}
	else {
		// Got double constraint on both actual used value and to-be-commited value
		let max = Math.max( 0 , this.getActualMax() ) ;
		if ( this.used >= max || this.used + this.allocated >= max ) { return 0 ; }	// Avoid truncating it when using ._lose()

		used += value ;
		if ( used + this.allocated > max ) { used = max - this.allocated ; }
		if ( used > max ) { used = max ; }
	}

	var actualValue = used - this.used ;

	if ( onlyIfExact && actualValue !== value ) { return 0 ; }

	this.used = used ;
	return actualValue ;
} ;



/*
	Internal.

	value: the value to lose, must be positive
	overuse: force an overuse mode instead of using the defined behavior
	onlyIfExact: if set, it does nothing if the pool can't lose that exact value
*/
Pool.prototype._preLose = function( value , overuse = this.internalOveruse , onlyIfExact = false ) {
	value = + value || 0 ;
	if ( value <= 0 ) { return 0 ; }

	var allocated = this.allocated ;

	if ( overuse ) {
		allocated += value ;
	}
	else {
		let max = Math.max( 0 , this.getActualMax() ) ;
		if ( this.used + this.allocated >= max ) { return 0 ; }	// Avoid truncating it when using ._preLose()

		allocated += value ;
		if ( allocated + this.used > max ) { allocated = max - this.used ; }
	}

	var actualValue = allocated - this.allocated ;

	if ( onlyIfExact && actualValue !== value ) { return 0 ; }

	this.allocated = allocated ;
	return actualValue ;
} ;



/*
	Internal.

	value: the value to lose, must be positive
	overuse: force an overuse mode instead of using the defined behavior
	onlyIfExact: if set, it does nothing if the pool can't lose that exact value
*/
Pool.prototype._loseReserve = function( value , overuse = this.internalOveruse , onlyIfExact = false ) {
	value = + value || 0 ;
	if ( value <= 0 ) { return 0 ; }

	var reserveUsed = this.reserveUsed ;

	if ( overuse ) {
		reserveUsed += value ;
	}
	else {
		let max = Math.max( 0 , this.getActualReserveMax() ) ;
		if ( this.reserveUsed >= max ) { return 0 ; }	// Avoid truncating it when using ._loseReserve()

		reserveUsed += value ;
		if ( reserveUsed > max ) { reserveUsed = max ; }
	}

	var actualValue = reserveUsed - this.reserveUsed ;

	if ( onlyIfExact && actualValue !== value ) { return 0 ; }

	this.reserveUsed = reserveUsed ;
	return actualValue ;
} ;



// Internal.
// Apply actualOveruse/actualOverflow/actualRounding to an actual value (used by .getActual(), .getActualReserve(), etc...)
Pool.prototype._postProcessActual = function( actual , max ) {
	if ( ! this.actualOveruse && actual < 0 ) { actual = 0 ; }

	// .actualOverflow, has a greater importance than .actualOveruse
	if ( ! this.actualOverflow && actual > max ) { actual = max ; }

	// This should come last
	if ( this.actualRound ) { actual = this._round( actual , this.actualRound ) ; }

	return actual ;
} ;



// Add or substract before Math.round(), .ceil() or .floor()
const ROUND_EPSILON = 0.000000001 ;	// 10e-9

Pool.prototype._round = function( value , type ) {
	switch ( type ) {
		case 'round' :
			// For .round() we add epsilon to preserve the halve-up behavior
			return Math.round( value + ROUND_EPSILON ) ;
		case 'floor' :
			return Math.floor( value + ROUND_EPSILON ) ;
		case 'ceil' :
			return Math.ceil( value - ROUND_EPSILON ) ;
		default :
			return value ;
	}
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/HistoryGauge.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





/*
	An HistoryGauge is used for complex gauge system like hit points tracking each injuries.
*/

function HistoryGauge( params = {} , parentTable = null , pathKey = null , clone = false ) {
	Stat.call( this , + params.base || 0 , parentTable , pathKey ) ;

	this.min = + params.min || 0 ;
	this.max = + params.max || 0 ;

	this.maxEntries = params.maxEntries ?? params['max-entries'] ;
	this.maxEntries = Number.isFinite( this.maxEntries ) && this.maxEntries > 0 ? this.maxEntries : Infinity ;

	this.entries = Array.isArray( params.entries ) ? params.entries.map( e => ( e instanceof Entry ) && ! clone ? e : new Entry( e ) ) : [] ;
}

const Stat = require( './Stat.js' ) ;
HistoryGauge.prototype = Object.create( Stat.prototype ) ;
HistoryGauge.prototype.constructor = HistoryGauge ;
HistoryGauge.prototype.__prototypeUID__ = 'stats-modifiers/HistoryGauge' ;

module.exports = HistoryGauge ;



const common = require( './common.js' ) ;
const arrayKit = require( 'array-kit' ) ;



HistoryGauge.prototype.operandType = 'number' ;

HistoryGauge.prototype.proxyMethods = {
	add: 'add' ,
	addMerge: 'addMerge' ,
	'add-merge': 'addMerge' ,
	recover: 'recover'
} ;

HistoryGauge.prototype.proxyEnumerableProperties = [
	'base' , 'actual' , 'entries' , 'min' , 'max'
] ;

HistoryGauge.prototype.proxyProperties = {
	min: 'min' ,
	max: 'max' ,
	maxEntries: 'maxEntries' ,
	'max-entries': 'maxEntries' ,
	entries: 'entries'
} ;

HistoryGauge.prototype.proxyWritableProperties = {
	min: 'min' ,
	max: 'max' ,
	maxEntries: 'maxEntries' ,
	'max-entries': 'maxEntries'
} ;

HistoryGauge.prototype.proxyGetters = {} ;
HistoryGauge.prototype.proxySetters = {} ;



HistoryGauge.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return new HistoryGauge( this , parentTable , pathKey , true ) ;
} ;



// Called by Spellcast when extending a data structure
HistoryGauge.prototype.set = function( params ) {
	if ( typeof params === 'number' ) {
		this.setBase( params ) ;
		return true ;
	}

	return false ;
} ;



HistoryGauge.prototype.setBase = function( base ) {
	this.base = + base || 0 ;
	return true ;
} ;



/*
	An entry is an object with those properties:
	* value: any real number (usually between -1 and 1), that will modify the gauge
	* weight: not directly used, but userland can use it for use case like hit point recovery
	* description: string, optional
*/
function Entry( value , weight , description ) {
	// Change here should be reflected in HistoryGauge#addMerge()
	if ( value && typeof value === 'object' ) {
		( { value , weight , description } = value ) ;
	}

	this.value = + value || 0 ;
	this.weight = Number.isFinite( weight ) && weight > 0 ? weight : 1 ;
	this.description = typeof description === 'string' ? description : null ;
}

HistoryGauge.Entry = Entry ;



HistoryGauge.prototype.getActual = function( pathKey = this.pathKey ) {
	var base = this.getBase() ,
		actual = this.entries.reduce( ( accumulator , entry ) => accumulator + entry.value , base ) ;

	actual = this.computeModifiers( actual , base , pathKey ) ;
	actual = Math.max( this.min , Math.min( this.max , actual ) ) ;
	return actual ;
} ;



HistoryGauge.prototype.add = function( value , weight , description ) {
	var entry ;

	if ( value instanceof Entry ) {
		entry = value ;
	}
	else {
		if ( value && typeof value === 'object' ) {
			( { value , weight , description } = value ) ;
		}

		if ( ! value ) { return ; }
		entry = new Entry( value , weight , description ) ;
	}

	this.entries.push( entry ) ;

	if ( this.entries.length > this.maxEntries ) {
		this.entries = this.entries.splice( 0 , this.entries.length - this.maxEntries ) ;
	}
} ;



HistoryGauge.prototype.addMerge = function( value , weight , description ) {
	// Same argument management than Entry constructor
	if ( value && typeof value === 'object' ) {
		( { value , weight , description } = value ) ;
	}

	value = + value ;
	if ( ! value ) { return ; }

	weight = Number.isFinite( weight ) && weight > 0 ? weight : 1 ;
	description = typeof description === 'string' ? description : null ;

	var compatibleEntry = this.entries.find( entry =>
		entry.weight === weight && entry.description === description && entry.value * value > 0
	) ;

	if ( compatibleEntry ) {
		compatibleEntry.value += value ;
	}
	else {
		this.add( value , weight , description ) ;
	}
} ;



HistoryGauge.prototype.recover = function( value ) {
	var entry , minWeightEntry , recoverValue , useFactor , minWeight , changed = false ;

	// Better than for(;;) because of rounding errors
	while ( value ) {
		minWeight = Infinity ;
		minWeightEntry = null ;

		// First, find the entry with the lowest weight, which will be the easiest to recover from
		for ( entry of this.entries ) {
			// Ensure that the recover value is going on the other side of the entry value
			if ( entry.weight < minWeight && entry.value * value < 0 ) {
				minWeight = entry.weight ;
				minWeightEntry = entry ;
			}
		}

		if ( ! minWeightEntry ) { break ; }

		changed = true ;
		recoverValue = value / minWeightEntry.weight ;

		if ( Math.abs( recoverValue ) <= Math.abs( minWeightEntry.value ) ) {
			// All the recover value is used
			minWeightEntry.value += recoverValue ;
			value = 0 ;
			break ;
		}

		// Only a part of recover value is used
		useFactor = Math.abs( minWeightEntry.value ) / Math.abs( recoverValue ) ;
		value *= 1 - useFactor ;
		minWeightEntry.value = 0 ;
	}

	if ( changed ) {
		arrayKit.inPlaceFilter( this.entries , e => e.value !== 0 ) ;
	}
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/HistoryAlignometer.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





/*
	An HistoryAlignometer is used to mesure things like good/evil alignment, tracking each good or bad action.
*/

function HistoryAlignometer( params = {} , parentTable = null , pathKey = null , clone = false ) {
	Stat.call( this , + params.base || 0 , parentTable , pathKey ) ;

	this.min = + params.min || 0 ;
	this.max = + params.max || 0 ;

	this.maxEntries = params.maxEntries ?? params['max-entries'] ;
	this.maxEntries = Number.isFinite( this.maxEntries ) && this.maxEntries > 0 ? this.maxEntries : 50 ;

	this.entries = Array.isArray( params.entries ) ? params.entries.map( e => ( e instanceof Entry ) && ! clone ? e : new Entry( e ) ) : [] ;

	this.minWeight = params.minWeight ?? params['min-weight'] ;
	this.minWeight = Number.isFinite( this.minWeight ) && this.minWeight > 0 ? this.minWeight : 20 ;

	this.instantMaxWeight = params.instantMaxWeight ?? params['instant-max-weight'] ;
	this.instantMaxWeight = Number.isFinite( this.instantMaxWeight ) && this.instantMaxWeight > 0 ? this.instantMaxWeight : 50 ;
}

const Stat = require( './Stat.js' ) ;
HistoryAlignometer.prototype = Object.create( Stat.prototype ) ;
HistoryAlignometer.prototype.constructor = HistoryAlignometer ;
HistoryAlignometer.prototype.__prototypeUID__ = 'stats-modifiers/HistoryAlignometer' ;

module.exports = HistoryAlignometer ;



const common = require( './common.js' ) ;



HistoryAlignometer.prototype.operandType = 'number' ;

HistoryAlignometer.prototype.proxyMethods = {
	add: 'add' ,
	toward: 'toward' ,
	upward: 'upward' ,
	downward: 'downward'
} ;

HistoryAlignometer.prototype.proxyEnumerableProperties = [
	'base' , 'actual' , 'instant' , 'entries' , 'min' , 'max'
] ;

HistoryAlignometer.prototype.proxyProperties = {
	min: 'min' ,
	max: 'max' ,
	maxEntries: 'maxEntries' ,
	'max-entries': 'maxEntries' ,
	entries: 'entries' ,
	minWeight: 'minWeight' ,
	'min-weight': 'minWeight' ,
	instantMaxWeight: 'instantMaxWeight' ,
	'instant-max-weight': 'instantMaxWeight'
} ;

HistoryAlignometer.prototype.proxyWritableProperties = {
	min: 'min' ,
	max: 'max' ,
	maxEntries: 'maxEntries' ,
	'max-entries': 'maxEntries' ,
	minWeight: 'minWeight' ,
	'min-weight': 'minWeight' ,
	instantMaxWeight: 'instantMaxWeight' ,
	'instant-max-weight': 'instantMaxWeight'
} ;

HistoryAlignometer.prototype.proxyGetters = {
	instant: 'getInstant'
} ;

HistoryAlignometer.prototype.proxySetters = {} ;



HistoryAlignometer.prototype.clone = function( parentTable = this[ common.SYMBOL_PARENT ] , pathKey = this.pathKey ) {
	return new HistoryAlignometer( this , parentTable , pathKey , true ) ;
} ;



// Called by Spellcast when extending a data structure
HistoryAlignometer.prototype.set = function( params ) {
	if ( typeof params === 'number' ) {
		this.setBase( params ) ;
		return true ;
	}

	return false ;
} ;



HistoryAlignometer.prototype.setBase = function( base ) {
	this.base = + base || 0 ;
	return true ;
} ;



const ENTRY_VALUE_CONSTANTS = {
	full: 1 ,
	half: 0.5 ,
	neutral: 0 ,
	halfInverse: - 0.5	// <- should find a better name here
} ;

const DIRECTION_CONSTANTS = {
	"1": 1 ,
	up: 1 ,
	"-1": - 1 ,
	down: - 1 ,
	both: 0
} ;



/*
	An entry is an object with those properties:
	* direction: if that entry improves or not the indicator, can be 1, 0, -1 or "up", "down", "both"
	* value: number, the target value of the entry
	* weight: number, the importance of the entry (default to 1)
	* description: string, optional
*/
function Entry( direction , value , weight , description ) {
	if ( direction && typeof direction === 'object' ) {
		( { direction , value , weight , description } = direction ) ;
	}

	this.direction = DIRECTION_CONSTANTS[ direction ] || 0 ;
	this.value = Number.isFinite( value ) ? value :
		! ENTRY_VALUE_CONSTANTS[ value ] ? 0 :
		ENTRY_VALUE_CONSTANTS[ value ] * this.direction ;
	this.weight = Number.isFinite( weight ) && weight > 0 ? weight : 1 ;
	this.description = typeof description === 'string' ? description : null ;
}

HistoryAlignometer.Entry = Entry ;



HistoryAlignometer.prototype.add = function( direction , value , weight , description ) {
	var entry ;

	if ( value instanceof Entry ) {
		entry = value ;
	}
	else {
		if ( value && typeof value === 'object' ) {
			( { direction , value , weight , description } = value ) ;
		}

		entry = new Entry( direction , value , weight , description ) ;
	}

	this.entries.push( entry ) ;

	if ( this.entries.length > this.maxEntries ) {
		this.entries = this.entries.splice( 0 , this.entries.length - this.maxEntries ) ;
	}
} ;



HistoryAlignometer.prototype.toward = function( value , weight , description ) { return this.add( 0 , value , weight , description ) ; } ;
HistoryAlignometer.prototype.upward = function( value , weight , description ) { return this.add( 1 , value , weight , description ) ; } ;
HistoryAlignometer.prototype.downward = function( value , weight , description ) { return this.add( - 1 , value , weight , description ) ; } ;



HistoryAlignometer.prototype.getActual = function( pathKey = this.pathKey , weightLimit = Infinity ) {
	var i , upArray = [] , downArray = [] , entry , upEntry , downEntry , tmpActual , actual ,
		base = this.getBase() ,
		sum = 0 ,
		weightSum = 0 ,
		weightCount = 0 ;

	for ( i = this.entries.length - 1 ; i >= 0 && weightCount < weightLimit ; i -- ) {
		entry = this.entries[ i ] ;
		weightCount += entry.weight ;

		if ( weightCount > weightLimit ) {
			// Create an entry that don't surpass the limit
			entry = new Entry( entry ) ;
			entry.weight -= weightCount - weightLimit ;
			weightCount = weightLimit ;
		}

		if ( entry.direction === 1 ) {
			upArray.push( entry ) ;
		}
		else if ( entry.direction === - 1 ) {
			downArray.push( entry ) ;
		}
		else {
			// Both direction, immediately add the value
			sum += entry.value * entry.weight ;
			weightSum += entry.weight ;
		}
	}

	// weight should at least be equal to minWeight, if not, we add the base value with the missing weight
	if ( weightCount < this.minWeight ) {
		let baseWeight = this.minWeight - weightCount ;
		sum += base * baseWeight ;
		weightSum += baseWeight ;
		//console.log( "Add base:" , base , baseWeight , "=>" , sum , weightSum ) ;
	}

	// From the weakest to the strongest (they are pop'ed from the array, so we really start with the strongest value to the weakest)
	upArray.sort( ( a , b ) => a.value - b.value ) ;
	downArray.sort( ( a , b ) => b.value - a.value ) ;
	//console.log( "up" , upArray , "\ndown" , downArray ) ;

	upEntry = upArray.pop() ;
	downEntry = downArray.pop() ;

	for ( ;; ) {
		// To have better precision, we reconstruct the average value from scratch every time,
		// instead of updating existing one (to avoid rounding error)
		tmpActual = sum ? sum / weightSum : 0 ;

		if ( upEntry && ( ! downEntry || upEntry.value - tmpActual >= tmpActual - downEntry.value ) ) {
			if ( tmpActual > upEntry.value ) { break ; }
			sum += upEntry.value * upEntry.weight ;
			weightSum += upEntry.weight ;
			//console.log( "Add up:" , upEntry.value , upEntry.weight , "=>" , sum , weightSum ) ;
			upEntry = upArray.pop() ;
		}
		else if ( downEntry && ( ! upEntry || upEntry.value - tmpActual <= tmpActual - downEntry.value ) ) {
			if ( downEntry.value > tmpActual ) { break ; }
			sum += downEntry.value * downEntry.weight ;
			weightSum += downEntry.weight ;
			//console.log( "Add down:" , downEntry.value , downEntry.weight , "=>" , sum , weightSum ) ;
			downEntry = downArray.pop() ;
		}
		else {
			break ;
		}
	}

	actual = sum ? sum / weightSum : 0 ;

	actual = this.computeModifiers( actual , base , pathKey ) ;
	actual = Math.max( this.min , Math.min( this.max , actual ) ) ;
	return actual ;
} ;



HistoryAlignometer.prototype.getInstant = function( pathKey = this.pathKey ) {
	return this.getActual( pathKey , this.instantMaxWeight ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/common.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





//exports.SYMBOL_ID = Symbol( 'id' ) ;
exports.SYMBOL_PARENT = Symbol( 'parent' ) ;

exports.SYMBOL_STAT_NAME = Symbol( 'statName' ) ;
exports.SYMBOL_PATH_KEY = Symbol( 'pathKey' ) ;
exports.SYMBOL_PROXY = Symbol( 'proxy' ) ;
exports.SYMBOL_UNPROXY = Symbol( 'unproxy' ) ;

exports.clearObject = object => Object.keys( object ).forEach( key => delete object[ key ] ) ;

exports.isPlainObject = value => {
	if ( ! value || typeof value !== 'object' ) { return false ; }
	var proto = Object.getPrototypeOf( value ) ;
	if ( proto === Object.prototype || proto === null ) { return true ; }
	return false ;
} ;

exports.isPlainObjectOrArray = value => {
	if ( ! value || typeof value !== 'object' ) { return false ; }
	if ( Array.isArray( value ) ) { return true ; }
	var proto = Object.getPrototypeOf( value ) ;
	if ( proto === Object.prototype || proto === null ) { return true ; }
	return false ;
} ;

const NestedStats = require( './NestedStats.js' ) ;

exports.isNested = value => {
	if ( ! value || typeof value !== 'object' ) { return false ; }
	if ( Array.isArray( value ) ) { return false ; }

	if ( value.__prototypeUID__ ) {
		let uid = value.__prototypeUID__ ;
		if ( uid === 'kung-fig/Operator' || uid === 'kung-fig/Expression' || uid === 'kung-fig/Ref' ) {
			return false ;
		}
	}

	if ( value instanceof NestedStats ) { return true ; }

	var proto = Object.getPrototypeOf( value ) ;
	if ( proto === Object.prototype || proto === null ) { return true ; }
	return false ;
} ;

exports.autoTypeOf = value => {
	var type = typeof value ;

	if ( type !== 'object' ) { return type ; }

	if ( value === null ) { return 'null' ; }
	if ( Array.isArray( value ) ) { return 'array' ; }
	if ( value instanceof Set ) { return 'set' ; }

	var proto = Object.getPrototypeOf( value ) ;
	if ( proto === Object.prototype || proto === null ) { return 'plainObject' ; }
	return 'object' ;
} ;



// Utilities...

const cloneRegexp = /_clone_[0-9]+/ ;
var cloneAutoId = 0 ;

exports.createCloneId = id => {
	if ( id.match( cloneRegexp ) ) {
		return id.replace( cloneRegexp , '_clone_' + ( cloneAutoId ++ ) ) ;
	}

	return id + '_clone_' + ( cloneAutoId ++ ) ;
} ;

// Unit test only
exports.unitTestResetCloneId = () => cloneAutoId = 0 ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/package.json' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {
  "name": "stats-modifiers",
  "version": "0.8.1",
  "description": "Stats and modifiers lib for gamedev.",
  "main": "lib/stats-modifiers.js",
  "engines": {
    "node": ">=16.13.0"
  },
  "directories": {
    "test": "test"
  },
  "dependencies": {
    "array-kit": "^0.2.6",
    "tree-kit": "^0.8.8"
  },
  "devDependencies": {
    "kung-fig-expression": "^0.49.1"
  },
  "scripts": {
    "test": "tea-time -R dot -O"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/cronvel/stats-modifiers.git"
  },
  "keywords": [
    "stats",
    "modifiers",
    "game",
    "rpg"
  ],
  "author": "Cédric Ronvel",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/cronvel/stats-modifiers/issues"
  },
  "config": {
    "tea-time": {
      "coverDir": [
        "lib"
      ]
    }
  },
  "copyright": {
    "title": "Stats Modifiers",
    "years": [
      2021
    ],
    "owner": "Cédric Ronvel"
  }
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/operators.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





const ops = {} ;
module.exports = ops ;



// Universal operators

// base, set before anything else
ops[ ':' ] =
ops.base = ( existing , operand ) => operand ;
ops.base.priorityGroup = 1 ;
ops.base.priority = 1000 ;
ops.base.anyType = true ;

// set, set after anything else
ops[ '=' ] =
ops.set = ( existing , operand ) => operand ;
ops.set.priorityGroup = - 1 ;
ops.set.priority = - 1000 ;
ops.set.anyType = true ;



// Number operators

ops[ '+' ] =
ops.plus = ( existing , operand ) => existing + operand ;
ops.plus.priority = 1 ;
ops.plus.neutral = 0 ;
ops.plus.type = 'number' ;

ops[ '-' ] =
ops.minus = v => - v ;
ops.minus.convert = 'plus' ;

// % (work with KFG percent syntax)
ops[ '%' ] =
ops.plusBaseRate = ( existing , operand , base ) => existing + base * ( operand - 1 ) ;
ops.plusBaseRate.merge = ( a , b ) => a + b - 1  ;
ops.plusBaseRate.priority = 1 ;
ops.plusBaseRate.neutral = 1 ;
ops.plusBaseRate.type = 'number' ;

ops[ '*' ] =
ops.multiply = ( existing , operand ) => existing * operand ;
ops.multiply.priority = 0 ;
ops.multiply.neutral = 1 ;
ops.multiply.type = 'number' ;

ops[ '/' ] =
ops.divide = v => 1 / v ;
ops.divide.convert = 'multiply' ;

ops[ '^' ] =
ops[ '**' ] =
ops.power = ( existing , operand ) => existing ** operand ;
ops.power.merge = ( a , b ) => a * b ;
ops.power.priority = - 1 ;
ops.power.neutral = 1 ;
ops.power.type = 'number' ;

// at least
ops[ '>=' ] =
ops.atLeast = ( existing , operand ) => Math.max( existing , operand ) ;
ops.atLeast.priorityGroup = - 1 ;
ops.atLeast.priority = - 999 ;
ops.atLeast.type = 'number' ;

// at most
ops[ '<=' ] =
ops.atMost = ( existing , operand ) => Math.min( existing , operand ) ;
ops.atMost.priorityGroup = - 1 ;
ops.atMost.priority = - 999 ;
ops.atMost.type = 'number' ;



// String operators

ops[ '_+' ] =
ops.append = ( existing , operand ) => existing + ' ' + operand ;
ops.append.priority = 1 ;
ops.append.type = 'string' ;

ops[ '+_' ] =
ops.prepend = ( existing , operand ) => operand + ' ' + existing ;
ops.prepend.priority = 1 ;
ops.prepend.type = 'string' ;



// KungFig's TemplateSentence operators

ops[ '$_+' ] =
ops.appendToTemplate = ( existing , operand ) =>
	new existing.constructor( existing.key + ' ' + ( typeof operand === 'string' ? operand : operand.key ) ) ;
ops.appendToTemplate.priority = 1 ;
ops.appendToTemplate.type = 'template' ;

ops[ '+$_' ] =
ops.prependToTemplate = ( existing , operand ) =>
	new existing.constructor( ( typeof operand === 'string' ? operand : operand.key ) + ' ' + existing.key ) ;
ops.prependToTemplate.priority = 1 ;
ops.prependToTemplate.type = 'template' ;



// Boolean/existence operators

ops[ '#' ] =
ops.activate = ( existing , operand ) => !! operand ;
ops.activate.priority = 10 ;
ops.activate.type = 'boolean' ;
ops.activate.operandSubtreeExpansion = true ;



for ( let key in ops ) {
	// The function itself should know its canonical identifier
	if ( ! ops[ key ].id ) { ops[ key ].id = key ; }
	if ( ! ops[ key ].merge ) { ops[ key ].merge = ops[ key ] ; }
	if ( ! ops[ key ].priorityGroup ) { ops[ key ].priorityGroup = 0 ; }
	if ( ! ops[ key ].priority ) { ops[ key ].priority = 0 ; }
	if ( ops[ key ].neutral === undefined ) { ops[ key ].neutral = null ; }
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/eventActions.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





exports.activate = modifiersTable => modifiersTable.activate() ;
exports.deactivate = modifiersTable => modifiersTable.deactivate() ;
exports.remove = modifiersTable => modifiersTable.destroy() ;

exports.fade = ( modifiersTable , eventData , params ) => {
	var done = true ,
		neutralized = true ,
		amount = Math.abs( + params?.amount || 1 ) ;

	modifiersTable.forEachModifier( modifier => {
		var neutral = modifier.fn.neutral ;

		if ( neutral === null ) {
			neutralized = false ;
		}
		else if ( modifier.operand <= neutral + amount && modifier.operand >= neutral - amount ) {
			modifier.operand = neutral ;
		}
		else if ( modifier.operand > neutral ) {
			modifier.operand -= amount ;
			done = neutralized = false ;
		}
		else {
			modifier.operand += amount ;
			done = neutralized = false ;
		}
	} ) ;

	if ( done ) {
		eventData.done = true ;

		// Default to true if neutralized, because by default we should avoid having deprecated effect still hanging around,
		// they should be garbage collected by the lib.
		if ( neutralized ? params?.destroy !== false : params?.destroy === true ) {
			modifiersTable.destroy() ;
		}
	}
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/stats-modifiers/lib/compounds.js' , '/node_modules/stats-modifiers' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Stats Modifiers

	Copyright (c) 2021 Cédric Ronvel

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





exports.avg =
exports.average = stats => stats.reduce( ( sum , stat ) => sum + stat , 0 ) / stats.length ;

exports['+'] =
exports.plus = stats => stats.reduce( ( accumulator , stat ) => accumulator + stat , 0 ) ;

// First stat minus all other
exports['-'] =
exports.minus = stats => stats.reduce( ( accumulator , stat , index ) => index ? accumulator - stat : stat , 0 ) ;



//var count = 0 ;

for ( let key in exports ) {
	// The function itself should know its canonical identifier
	if ( ! exports[ key ].id ) { exports[ key ].id = key ; }

	//count ++ ;
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/string-kit' , '/node_modules/string-kit/lib/string.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/string.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const stringKit = {} ;
module.exports = stringKit ;



/*
// Tier 0: add polyfills to stringKit
const polyfill = require( './polyfill.js' ) ;

for ( let fn_ in polyfill ) {
	stringKit[ fn ] = function( str , ... args ) {
		return polyfill[ fn ].call( str , ... args ) ;
	} ;
}
//*/



Object.assign( stringKit ,

	// Tier 1
	{ escape: require( './escape.js' ) } ,
	{ ansi: require( './ansi.js' ) } ,
	{ unicode: require( './unicode.js' ) }
) ;



Object.assign( stringKit ,

	// Tier 2
	require( './format.js' ) ,

	// Tier 3
	require( './misc.js' ) ,
	require( './inspect.js' ) ,
	require( './regexp.js' ) ,
	require( './camel.js' ) ,
	{
		latinize: require( './latinize.js' ) ,
		toTitleCase: require( './toTitleCase.js' ) ,
		wordwrap: require( './wordwrap.js' ) ,
		naturalSort: require( './naturalSort.js' ) ,
		fuzzy: require( './fuzzy.js' ) ,
		StringNumber: require( './StringNumber.js' ) ,
		english: require( './english.js' ) ,
		emoji: require( './emoji.js' )
	}
) ;



/*
// Install all polyfill into String.prototype
stringKit.installPolyfills = function installPolyfills() {
	for ( let fn in polyfill ) {
		if ( ! String.prototype[ fn ] ) {
			String.prototype[ fn ] = polyfill[ fn ] ;
		}
	}
} ;
//*/
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/escape.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	Escape collection.
*/







// From Mozilla Developper Network
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
exports.regExp = exports.regExpPattern = str => str.replace( /([.*+?^${}()|[\]/\\])/g , '\\$1' ) ;

// This replace any single $ by a double $$
exports.regExpReplacement = str => str.replace( /\$/g , '$$$$' ) ;

// Escape for string.format()
// This replace any single % by a double %%
exports.format = str => str.replace( /%/g , '%%' ) ;

exports.jsSingleQuote = str => exports.control( str ).replace( /'/g , "\\'" ) ;
exports.jsDoubleQuote = str => exports.control( str ).replace( /"/g , '\\"' ) ;

exports.shellArg = str => '\'' + str.replace( /'/g , "'\\''" ) + '\'' ;



var escapeControlMap = {
	'\r': '\\r' ,
	'\n': '\\n' ,
	'\t': '\\t' ,
	'\x7f': '\\x7f'
} ;

// Escape \r \n \t so they become readable again, escape all ASCII control character as well, using \x syntaxe
exports.control = ( str , keepNewLineAndTab = false ) => str.replace( /[\x00-\x1f\x7f]/g , match => {
	if ( keepNewLineAndTab && ( match === '\n' || match === '\t' ) ) { return match ; }
	if ( escapeControlMap[ match ] !== undefined ) { return escapeControlMap[ match ] ; }
	var hex = match.charCodeAt( 0 ).toString( 16 ) ;
	if ( hex.length % 2 ) { hex = '0' + hex ; }
	return '\\x' + hex ;
} ) ;



var escapeHtmlMap = {
	'&': '&amp;' ,
	'<': '&lt;' ,
	'>': '&gt;' ,
	'"': '&quot;' ,
	"'": '&#039;'
} ;

// Only escape & < > so this is suited for content outside tags
exports.html = str => str.replace( /[&<>]/g , match => escapeHtmlMap[ match ] ) ;

// Escape & < > " so this is suited for content inside a double-quoted attribute
exports.htmlAttr = str => str.replace( /[&<>"]/g , match => escapeHtmlMap[ match ] ) ;

// Escape all html special characters & < > " '
exports.htmlSpecialChars = str => str.replace( /[&<>"']/g , match => escapeHtmlMap[ match ] ) ;

// Percent-encode all control chars and codepoint greater than 255 using percent encoding
exports.unicodePercentEncode = str => str.replace( /[\x00-\x1f\u0100-\uffff\x7f%]/g , match => {
	try {
		return encodeURI( match ) ;
	}
	catch ( error ) {
		// encodeURI can throw on bad surrogate pairs, but we just strip those characters
		return '' ;
	}
} ) ;

// Encode HTTP header value
exports.httpHeaderValue = str => exports.unicodePercentEncode( str ) ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/ansi.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





// To solve dependency hell, we do not rely on terminal-kit anymore.
const ansi = {
	reset: '\x1b[0m' ,
	bold: '\x1b[1m' ,
	dim: '\x1b[2m' ,
	italic: '\x1b[3m' ,
	underline: '\x1b[4m' ,
	inverse: '\x1b[7m' ,

	defaultColor: '\x1b[39m' ,
	black: '\x1b[30m' ,
	red: '\x1b[31m' ,
	green: '\x1b[32m' ,
	yellow: '\x1b[33m' ,
	blue: '\x1b[34m' ,
	magenta: '\x1b[35m' ,
	cyan: '\x1b[36m' ,
	white: '\x1b[37m' ,
	grey: '\x1b[90m' ,
	gray: '\x1b[90m' ,
	brightBlack: '\x1b[90m' ,
	brightRed: '\x1b[91m' ,
	brightGreen: '\x1b[92m' ,
	brightYellow: '\x1b[93m' ,
	brightBlue: '\x1b[94m' ,
	brightMagenta: '\x1b[95m' ,
	brightCyan: '\x1b[96m' ,
	brightWhite: '\x1b[97m' ,

	defaultBgColor: '\x1b[49m' ,
	bgBlack: '\x1b[40m' ,
	bgRed: '\x1b[41m' ,
	bgGreen: '\x1b[42m' ,
	bgYellow: '\x1b[43m' ,
	bgBlue: '\x1b[44m' ,
	bgMagenta: '\x1b[45m' ,
	bgCyan: '\x1b[46m' ,
	bgWhite: '\x1b[47m' ,
	bgGrey: '\x1b[100m' ,
	bgGray: '\x1b[100m' ,
	bgBrightBlack: '\x1b[100m' ,
	bgBrightRed: '\x1b[101m' ,
	bgBrightGreen: '\x1b[102m' ,
	bgBrightYellow: '\x1b[103m' ,
	bgBrightBlue: '\x1b[104m' ,
	bgBrightMagenta: '\x1b[105m' ,
	bgBrightCyan: '\x1b[106m' ,
	bgBrightWhite: '\x1b[107m'
} ;

module.exports = ansi ;



ansi.fgColor = {
	defaultColor: ansi.defaultColor ,
	black: ansi.black ,
	red: ansi.red ,
	green: ansi.green ,
	yellow: ansi.yellow ,
	blue: ansi.blue ,
	magenta: ansi.magenta ,
	cyan: ansi.cyan ,
	white: ansi.white ,
	grey: ansi.grey ,
	gray: ansi.gray ,
	brightBlack: ansi.brightBlack ,
	brightRed: ansi.brightRed ,
	brightGreen: ansi.brightGreen ,
	brightYellow: ansi.brightYellow ,
	brightBlue: ansi.brightBlue ,
	brightMagenta: ansi.brightMagenta ,
	brightCyan: ansi.brightCyan ,
	brightWhite: ansi.brightWhite
} ;



ansi.bgColor = {
	defaultColor: ansi.defaultBgColor ,
	black: ansi.bgBlack ,
	red: ansi.bgRed ,
	green: ansi.bgGreen ,
	yellow: ansi.bgYellow ,
	blue: ansi.bgBlue ,
	magenta: ansi.bgMagenta ,
	cyan: ansi.bgCyan ,
	white: ansi.bgWhite ,
	grey: ansi.bgGrey ,
	gray: ansi.bgGray ,
	brightBlack: ansi.bgBrightBlack ,
	brightRed: ansi.bgBrightRed ,
	brightGreen: ansi.bgBrightGreen ,
	brightYellow: ansi.bgBrightYellow ,
	brightBlue: ansi.bgBrightBlue ,
	brightMagenta: ansi.bgBrightMagenta ,
	brightCyan: ansi.bgBrightCyan ,
	brightWhite: ansi.bgBrightWhite
} ;



ansi.trueColor = ( r , g , b ) => {
	if ( g === undefined && typeof r === 'string' ) {
		let hex = r ;
		if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }	// Strip the # if necessary
		if ( hex.length === 3 ) { hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ; }
		r = parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ;
		g = parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ;
		b = parseInt( hex.slice( 4 , 6 ) , 16 ) || 0 ;
	}

	return '\x1b[38;2;' + r + ';' + g + ';' + b + 'm' ;
} ;



ansi.bgTrueColor = ( r , g , b ) => {
	if ( g === undefined && typeof r === 'string' ) {
		let hex = r ;
		if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }	// Strip the # if necessary
		if ( hex.length === 3 ) { hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ; }
		r = parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ;
		g = parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ;
		b = parseInt( hex.slice( 4 , 6 ) , 16 ) || 0 ;
	}

	return '\x1b[48;2;' + r + ';' + g + ';' + b + 'm' ;
} ;



const ANSI_CODES = {
	'0': null ,

	'1': { bold: true } ,
	'2': { dim: true } ,
	'22': { bold: false , dim: false } ,
	'3': { italic: true } ,
	'23': { italic: false } ,
	'4': { underline: true } ,
	'24': { underline: false } ,
	'5': { blink: true } ,
	'25': { blink: false } ,
	'7': { inverse: true } ,
	'27': { inverse: false } ,
	'8': { hidden: true } ,
	'28': { hidden: false } ,
	'9': { strike: true } ,
	'29': { strike: false } ,

	'30': { color: 0 } ,
	'31': { color: 1 } ,
	'32': { color: 2 } ,
	'33': { color: 3 } ,
	'34': { color: 4 } ,
	'35': { color: 5 } ,
	'36': { color: 6 } ,
	'37': { color: 7 } ,
	//'39': { defaultColor: true } ,
	'39': { color: 'default' } ,

	'90': { color: 8 } ,
	'91': { color: 9 } ,
	'92': { color: 10 } ,
	'93': { color: 11 } ,
	'94': { color: 12 } ,
	'95': { color: 13 } ,
	'96': { color: 14 } ,
	'97': { color: 15 } ,

	'40': { bgColor: 0 } ,
	'41': { bgColor: 1 } ,
	'42': { bgColor: 2 } ,
	'43': { bgColor: 3 } ,
	'44': { bgColor: 4 } ,
	'45': { bgColor: 5 } ,
	'46': { bgColor: 6 } ,
	'47': { bgColor: 7 } ,
	//'49': { bgDefaultColor: true } ,
	'49': { bgColor: 'default' } ,

	'100': { bgColor: 8 } ,
	'101': { bgColor: 9 } ,
	'102': { bgColor: 10 } ,
	'103': { bgColor: 11 } ,
	'104': { bgColor: 12 } ,
	'105': { bgColor: 13 } ,
	'106': { bgColor: 14 } ,
	'107': { bgColor: 15 }
} ;



// Parse ANSI codes, output is compatible with the markup parser
ansi.parse = str => {
	var ansiCodes , raw , part , style , output = [] ;

	for ( [ , ansiCodes , raw ] of str.matchAll( /\x1b\[([0-9;]+)m|(.[^\x1b]*)/g ) ) {
		if ( raw ) {
			if ( output.length ) { output[ output.length - 1 ].text += raw ; }
			else { output.push( { text: raw } ) ; }
		}
		else {
			ansiCodes.split( ';' ).forEach( ansiCode => {
				style = ANSI_CODES[ ansiCode ] ;
				if ( style === undefined ) { return ; }

				if ( ! output.length || output[ output.length - 1 ].text ) {
					if ( ! style ) {
						part = { text: '' } ;
					}
					else {
						part = Object.assign( {} , part , style ) ;
						part.text = '' ;
					}

					output.push( part ) ;
				}
				else {
					// There is no text, no need to create a new part
					if ( ! style ) {
						// Replace the last part
						output[ output.length - 1 ] = { text: '' } ;
					}
					else {
						// update the last part
						Object.assign( part , style ) ;
					}
				}
			} ) ;
		}
	}

	return output ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/unicode.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





/*
	Javascript does not use UTF-8 but UCS-2.
	The purpose of this module is to process correctly strings containing UTF-8 characters that take more than 2 bytes.

	Since the punycode module is deprecated in Node.js v8.x, this is an adaptation of punycode.ucs2.x
	as found on Aug 16th 2017 at: https://github.com/bestiejs/punycode.js/blob/master/punycode.js.

	2021 note -- Modern Javascript is way more unicode friendly since many years, e.g. `Array.from( string )` and `for ( char of string )` are unicode aware.
	Some methods here are now useless, but have been modernized to use the correct ES features.
*/



// Create the module and export it
const unicode = {} ;
module.exports = unicode ;



unicode.encode = array => String.fromCodePoint( ... array ) ;

// Decode a string into an array of unicode codepoints.
// The 2nd argument of Array.from() is a map function, it avoids creating intermediate array.
unicode.decode = str => Array.from( str , c => c.codePointAt( 0 ) ) ;

// DEPRECATED: This function is totally useless now, with modern JS.
unicode.firstCodePoint = str => str.codePointAt( 0 ) ;

// Extract only the first char.
unicode.firstChar = str => str.length ? String.fromCodePoint( str.codePointAt( 0 ) ) : undefined ;

// DEPRECATED: This function is totally useless now, with modern JS.
unicode.toArray = str => Array.from( str ) ;



// Decode a string into an array of Cell (used by Terminal-kit).
// Wide chars have an additionnal filler cell, so position is correct
unicode.toCells = ( Cell , str , tabWidth = 4 , linePosition = 0 , ... extraCellArgs ) => {
	var char , code , fillSize , width ,
		output = [] ;

	for ( char of str ) {
		code = char.codePointAt( 0 ) ;

		if ( code === 0x0a ) {	// New line
			linePosition = 0 ;
		}
		else if ( code === 0x09 ) {	// Tab
			// Depends upon the next tab-stop
			fillSize = tabWidth - ( linePosition % tabWidth ) - 1 ;
			//output.push( new Cell( '\t' , ... extraCellArgs ) ) ;
			output.push( new Cell( '\t' , 1 , ... extraCellArgs ) ) ;
			linePosition += 1 + fillSize ;

			// Add a filler cell
			while ( fillSize -- ) { output.push( new Cell( ' ' , -2 , ... extraCellArgs ) ) ; }
		}
		else {
			width = unicode.codePointWidth( code ) ,
			output.push( new Cell( char , width , ... extraCellArgs ) ) ;
			linePosition += width ;

			// Add an anti-filler cell (a cell with 0 width, following a wide char)
			while ( -- width > 0 ) { output.push( new Cell( ' ' , -1 , ... extraCellArgs ) ) ; }
		}
	}

	return output ;
} ;



unicode.fromCells = ( cells ) => {
	var cell , str = '' ;

	for ( cell of cells ) {
		if ( ! cell.filler ) { str += cell.char ; }
	}

	return str ;
} ;



// Get the length of an unicode string
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
// /!\ Use Array.from().length instead??? Not using it is potentially faster, but it needs benchmark to be sure.
unicode.length = str => {
	// for ... of is unicode-aware
	var char , length = 0 ;
	for ( char of str ) { length ++ ; }		/* eslint-disable-line no-unused-vars */
	return length ;
} ;



// Return a string that does not exceed the character limit
unicode.truncateLength = unicode.truncate = ( str , limit ) => {
	var position = 0 , length = 0 ;

	for ( let char of str ) {
		if ( length === limit ) { return str.slice( 0 , position ) ; }
		length ++ ;
		position += char.length ;
	}

	// The string remains unchanged
	return str ;
} ;



// Return the width of a string in a terminal/monospace font
unicode.width = str => {
	// for ... of is unicode-aware
	var char , count = 0 ;
	for ( char of str ) { count += unicode.codePointWidth( char.codePointAt( 0 ) ) ; }
	return count ;
} ;



// Return the width of an array of string in a terminal/monospace font
unicode.arrayWidth = ( array , limit ) => {
	var index , count = 0 ;

	if ( limit === undefined ) { limit = array.length ; }

	for ( index = 0 ; index < limit ; index ++ ) {
		count += unicode.isFullWidth( array[ index ] ) ? 2 : 1 ;
	}

	return count ;
} ;



// Userland may use this, it is more efficient than .truncateWidth() + .width(),
// and BTW even more than testing .width() then .truncateWidth() + .width()
var lastTruncateWidth = 0 ;
unicode.getLastTruncateWidth = () => lastTruncateWidth ;

// Return a string that does not exceed the width limit (taking wide-char into considerations)
unicode.widthLimit =	// DEPRECATED
unicode.truncateWidth = ( str , limit ) => {
	var char , charWidth , position = 0 ;

	// Module global:
	lastTruncateWidth = 0 ;

	for ( char of str ) {
		charWidth = unicode.codePointWidth( char.codePointAt( 0 ) ) ;

		if ( lastTruncateWidth + charWidth > limit ) {
			return str.slice( 0 , position ) ;
		}

		lastTruncateWidth += charWidth ;
		position += char.length ;
	}

	// The string remains unchanged
	return str ;
} ;



/*
	** PROBABLY DEPRECATED **

	Check if a UCS2 char is a surrogate pair.

	Returns:
		0: single char
		1: leading surrogate
		-1: trailing surrogate

	Note: it does not check input, to gain perfs.
*/
unicode.surrogatePair = char => {
	var code = char.charCodeAt( 0 ) ;

	if ( code < 0xd800 || code >= 0xe000 ) { return 0 ; }
	else if ( code < 0xdc00 ) { return 1 ; }
	return -1 ;
} ;



// Check if a character is a full-width char or not
unicode.isFullWidth = char => unicode.isFullWidthCodePoint( char.codePointAt( 0 ) ) ;

// Return the width of a char, leaner than .width() for one char
unicode.charWidth = char => unicode.codePointWidth( char.codePointAt( 0 ) ) ;



/*
	Build the Emoji width lookup.
	The ranges file (./lib/unicode-emoji-width-ranges.json) is produced by a Terminal-Kit script ([terminal-kit]/utilities/build-emoji-width-lookup.js),
	that writes each emoji and check the cursor location.
*/
const emojiWidthLookup = new Map() ;

( function() {
	var ranges = require( './json-data/unicode-emoji-width-ranges.json' ) ;
	for ( let range of ranges ) {
		for ( let i = range.s ; i <= range.e ; i ++ ) {
			emojiWidthLookup.set( i , range.w ) ;
		}
	}
} )() ;

/*
	Check if a codepoint represent a full-width char or not.
*/
unicode.codePointWidth = code => {
	// Assuming all emoji are wide here
	if ( unicode.isEmojiCodePoint( code ) ) {
		return emojiWidthLookup.get( code ) ?? 2 ;
	}

	// Code points are derived from:
	// http://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
	if ( code >= 0x1100 && (
		code <= 0x115f ||	// Hangul Jamo
		code === 0x2329 || // LEFT-POINTING ANGLE BRACKET
		code === 0x232a || // RIGHT-POINTING ANGLE BRACKET
		// CJK Radicals Supplement .. Enclosed CJK Letters and Months
		( 0x2e80 <= code && code <= 0x3247 && code !== 0x303f ) ||
		// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
		( 0x3250 <= code && code <= 0x4dbf ) ||
		// CJK Unified Ideographs .. Yi Radicals
		( 0x4e00 <= code && code <= 0xa4c6 ) ||
		// Hangul Jamo Extended-A
		( 0xa960 <= code && code <= 0xa97c ) ||
		// Hangul Syllables
		( 0xac00 <= code && code <= 0xd7a3 ) ||
		// CJK Compatibility Ideographs
		( 0xf900 <= code && code <= 0xfaff ) ||
		// Vertical Forms
		( 0xfe10 <= code && code <= 0xfe19 ) ||
		// CJK Compatibility Forms .. Small Form Variants
		( 0xfe30 <= code && code <= 0xfe6b ) ||
		// Halfwidth and Fullwidth Forms
		( 0xff01 <= code && code <= 0xff60 ) ||
		( 0xffe0 <= code && code <= 0xffe6 ) ||
		// Kana Supplement
		( 0x1b000 <= code && code <= 0x1b001 ) ||
		// Enclosed Ideographic Supplement
		( 0x1f200 <= code && code <= 0x1f251 ) ||
		// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
		( 0x20000 <= code && code <= 0x3fffd )
	) ) {
		return 2 ;
	}

	if (
		unicode.isEmojiModifierCodePoint( code ) ||
		unicode.isZeroWidthDiacriticCodePoint( code )
	) {
		return 0 ;
	}

	return 1 ;
} ;

// For a true/false type of result
unicode.isFullWidthCodePoint = code => unicode.codePointWidth( code ) === 2 ;



// Convert normal ASCII chars to their full-width counterpart
unicode.toFullWidth = str => {
	return String.fromCodePoint( ... Array.from( str , char => {
		var code = char.codePointAt( 0 ) ;
		return code >= 33 && code <= 126  ?  0xff00 + code - 0x20  :  code ;
	} ) ) ;
} ;



// Check if a character is a diacritic with zero-width or not
unicode.isZeroWidthDiacritic = char => unicode.isZeroWidthDiacriticCodePoint( char.codePointAt( 0 ) ) ;

// Some doc found here: https://en.wikipedia.org/wiki/Combining_character
// Diacritics and other characters that combines with previous one (zero-width)
unicode.isZeroWidthDiacriticCodePoint = code =>
	// Combining Diacritical Marks
	( 0x300 <= code && code <= 0x36f ) ||
	// Combining Diacritical Marks Extended
	( 0x1ab0 <= code && code <= 0x1aff ) ||
	// Combining Diacritical Marks Supplement
	( 0x1dc0 <= code && code <= 0x1dff ) ||
	// Combining Diacritical Marks for Symbols
	( 0x20d0 <= code && code <= 0x20ff ) ||
	// Combining Half Marks
	( 0xfe20 <= code && code <= 0xfe2f ) ||
	// Dakuten and handakuten (japanese)
	code === 0x3099 || code === 0x309a ||
	// Devanagari
	( 0x900 <= code && code <= 0x903 ) ||
	( 0x93a <= code && code <= 0x957 && code !== 0x93d && code !== 0x950 ) ||
	code === 0x962 || code === 0x963 ||
	// Thai
	code === 0xe31 ||
	( 0xe34 <= code && code <= 0xe3a ) ||
	( 0xe47 <= code && code <= 0xe4e ) ;

// Check if a character is an emoji or not
unicode.isEmoji = char => unicode.isEmojiCodePoint( char.codePointAt( 0 ) ) ;

// Some doc found here: https://stackoverflow.com/questions/30470079/emoji-value-range
unicode.isEmojiCodePoint = code =>
	// Miscellaneous symbols
	( 0x2600 <= code && code <= 0x26ff ) ||
	// Dingbats
	( 0x2700 <= code && code <= 0x27bf ) ||
	// Emoji
	( 0x1f000 <= code && code <= 0x1f1ff ) ||
	( 0x1f300 <= code && code <= 0x1f3fa ) ||
	( 0x1f400 <= code && code <= 0x1faff ) ;

// Emoji modifier
unicode.isEmojiModifier = char => unicode.isEmojiModifierCodePoint( char.codePointAt( 0 ) ) ;
unicode.isEmojiModifierCodePoint = code =>
	( 0x1f3fb <= code && code <= 0x1f3ff ) ||	// (Fitzpatrick): https://en.wikipedia.org/wiki/Miscellaneous_Symbols_and_Pictographs#Emoji_modifiers
	code === 0xfe0f ;	// VARIATION SELECTOR-16 [VS16] {emoji variation selector}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/format.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	String formater, inspired by C's sprintf().
*/







const inspect = require( './inspect.js' ).inspect ;
const inspectError = require( './inspect.js' ).inspectError ;
const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;
const unicode = require( './unicode.js' ) ;
const naturalSort = require( './naturalSort.js' ) ;
const StringNumber = require( './StringNumber.js' ) ;



/*
	%%		a single %
	%s		string
	%S		string, interpret ^ formatting
	%r		raw string: without sanitizer
	%n		natural: output the most natural representation for this type, object entries are sorted by keys
	%N		even more natural: avoid type hinting marks like bracket for array
	%f		float
	%k		number with metric system prefixes
	%e		for exponential notation (e.g. 1.23e+2)
	%K		for scientific notation (e.g. 1.23 × 10²)
	%i	%d	integer
	%u		unsigned integer
	%U		unsigned positive integer (>0)
	%P		number to (absolute) percent (e.g.: 0.75 -> 75%)
	%p		number to relative percent (e.g.: 1.25 -> +25% ; 0.75 -> -25%)
	%T		date/time display, using ISO date, or Intl module
	%t		time duration, convert ms into h min s, e.g.: 2h14min52s or 2:14:52
	%m		convert degree into degree, minutes and seconds
	%h		hexadecimal (input is a number)
	%x		hexadecimal (input is a number), force pair of symbols (e.g. 'f' -> '0f')
	%o		octal
	%b		binary
	%X		hexadecimal: convert a string into hex charcode, force pair of symbols (e.g. 'f' -> '0f')
	%z		base64
	%Z		base64url
	%I		call string-kit's inspect()
	%Y		call string-kit's inspect(), but do not inspect non-enumerable
	%O		object (like inspect, but with ultra minimal options)
	%E		call string-kit's inspectError()
	%J		JSON.stringify()
	%v		roman numerals, additive variant (e.g. 4 is IIII instead of IV)
	%V		roman numerals
	%D		drop
	%F		filter function existing in the 'this' context, e.g. %[filter:%a%a]F
	%a		argument for a function

	Candidate format:
	%A		for automatic type? probably not good: it's like %n Natural
	%c		for char? (can receive a string or an integer translated into an UTF8 chars)
	%C		for currency formating?
	%B		for Buffer objects?
*/

exports.formatMethod = function( ... args ) {
	var arg ,
		str = args[ 0 ] ,
		autoIndex = 1 ,
		length = args.length ;

	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var runtime = {
		hasMarkup: false ,
		shift: null ,
		markupStack: []
	} ;

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ) + str ;
	}

	//console.log( 'format args:' , arguments ) ;

	// /!\ each changes here should be reported on string.format.count() and string.format.hasFormatting() too /!\
	// Note: the closing bracket is optional to prevent ReDoS
	str = str.replace( /\^\[([^\]]*)]?|\^(.)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/g ,
		( match , complexMarkup , markup , doublePercent , relative , index , modeArg , mode ) => {
			var replacement , i , tmp , fn , fnArgString , argMatches , argList = [] ;

			//console.log( 'replaceArgs:' , arguments ) ;
			if ( doublePercent ) { return '%' ; }

			if ( complexMarkup ) { markup = complexMarkup ; }
			if ( markup ) {
				if ( this.noMarkup ) { return '^' + markup ; }
				return markupReplace.call( this , runtime , match , markup ) ;
			}

			if ( index ) {
				index = parseInt( index , 10 ) ;

				if ( relative ) {
					if ( relative === '+' ) { index = autoIndex + index ; }
					else if ( relative === '-' ) { index = autoIndex - index ; }
				}
			}
			else {
				index = autoIndex ;
			}

			autoIndex ++ ;

			if ( index >= length || index < 1 ) { arg = undefined ; }
			else { arg = args[ index ] ; }

			if ( modes[ mode ] ) {
				replacement = modes[ mode ]( arg , modeArg , this ) ;
				if ( this.argumentSanitizer && ! modes[ mode ].noSanitize ) { replacement = this.argumentSanitizer( replacement ) ; }
				if ( this.escapeMarkup && ! modes[ mode ].noEscapeMarkup ) { replacement = exports.escapeMarkup( replacement ) ; }
				if ( modeArg && ! modes[ mode ].noCommonModeArg ) { replacement = commonModeArg( replacement , modeArg ) ; }
				return replacement ;
			}

			// Function mode
			if ( mode === 'F' ) {
				autoIndex -- ;	// %F does not eat any arg

				if ( modeArg === undefined ) { return '' ; }
				tmp = modeArg.split( ':' ) ;
				fn = tmp[ 0 ] ;
				fnArgString = tmp[ 1 ] ;
				if ( ! fn ) { return '' ; }

				if ( fnArgString && ( argMatches = fnArgString.match( /%([+-]?)([0-9]*)[a-zA-Z]/g ) ) ) {
					//console.log( argMatches ) ;
					//console.log( fnArgString ) ;
					for ( i = 0 ; i < argMatches.length ; i ++ ) {
						relative = argMatches[ i ][ 1 ] ;
						index = argMatches[ i ][ 2 ] ;

						if ( index ) {
							index = parseInt( index , 10 ) ;

							if ( relative ) {
								if ( relative === '+' ) { index = autoIndex + index ; }		// jshint ignore:line
								else if ( relative === '-' ) { index = autoIndex - index ; }	// jshint ignore:line
							}
						}
						else {
							index = autoIndex ;
						}

						autoIndex ++ ;

						if ( index >= length || index < 1 ) { argList[ i ] = undefined ; }
						else { argList[ i ] = args[ index ] ; }
					}
				}

				if ( ! this || ! this.fn || typeof this.fn[ fn ] !== 'function' ) { return '' ; }
				return this.fn[ fn ].apply( this , argList ) ;
			}

			return '' ;
		}
	) ;

	if ( runtime.hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ;
	}

	if ( this.extraArguments ) {
		for ( ; autoIndex < length ; autoIndex ++ ) {
			arg = args[ autoIndex ] ;
			if ( arg === null || arg === undefined ) { continue ; }
			else if ( typeof arg === 'string' ) { str += arg ; }
			else if ( typeof arg === 'number' ) { str += arg ; }
			else if ( typeof arg.toString === 'function' ) { str += arg.toString() ; }
		}
	}

	return str ;
} ;



exports.markupMethod = function( str ) {
	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var runtime = {
		hasMarkup: false ,
		shift: null ,
		markupStack: []
	} ;

	if ( this.parse ) {
		let markupObjects , markupObject , match , complexMarkup , markup , raw , lastChunk ,
			output = [] ;

		// Note: the closing bracket is optional to prevent ReDoS
		for ( [ match , complexMarkup , markup , raw ] of str.matchAll( /\^\[([^\]]*)]?|\^(.)|([^^]+)/g ) ) {
			if ( raw ) {
				if ( output.length ) { output[ output.length - 1 ].text += raw ; }
				else { output.push( { text: raw } ) ; }
				continue ;
			}

			if ( complexMarkup ) { markup = complexMarkup ; }
			markupObjects = markupReplace.call( this , runtime , match , markup ) ;

			if ( ! Array.isArray( markupObjects ) ) { markupObjects = [ markupObjects ] ; }

			for ( markupObject of markupObjects ) {
				lastChunk = output.length ? output[ output.length - 1 ] : null ;
				if ( typeof markupObject === 'string' ) {
					// This markup is actually a text to add to the last chunk (e.g. "^^" markup is converted to a single "^")
					if ( lastChunk ) { lastChunk.text += markupObject ; }
					else { output.push( { text: markupObject } ) ; }
				}
				else if ( ! markupObject ) {
					// Null is for a markup's style reset
					if ( lastChunk && lastChunk.text.length && Object.keys( lastChunk ).length > 1 ) {
						// If there was style and text on the last chunk, then this means that the new markup starts a new chunk
						// markupObject can be null for markup reset function, but we have to create a new chunk
						output.push( { text: '' } ) ;
					}
				}
				else {
					if ( lastChunk && lastChunk.text.length ) {
						// If there was text on the last chunk, then this means that the new markup starts a new chunk
						output.push( Object.assign( { text: '' } , ... runtime.markupStack ) ) ;
					}
					else {
						// There wasn't any text added, so append the current markup style to the current chunk
						if ( lastChunk ) { Object.assign( lastChunk , markupObject ) ; }
						else { output.push( Object.assign( { text: '' } , markupObject ) ) ; }
					}
				}
			}
		}

		return output ;
	}

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ) + str ;
	}

	str = str.replace( /\^\[([^\]]*)]?|\^(.)/g , ( match , complexMarkup , markup ) => markupReplace.call( this , runtime , match , complexMarkup || markup ) ) ;

	if ( runtime.hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ;
	}

	return str ;
} ;



// Used by both formatMethod and markupMethod
function markupReplace( runtime , match , markup ) {
	var markupTarget , key , value , replacement , colonIndex ;

	if ( markup === '^' ) { return '^' ; }

	if ( this.shiftMarkup && this.shiftMarkup[ markup ] ) {
		runtime.shift = this.shiftMarkup[ markup ] ;
		return '' ;
	}

	if ( markup.length > 1 && this.dataMarkup && ( colonIndex = markup.indexOf( ':' ) ) !== -1 ) {
		key = markup.slice( 0 , colonIndex ) ;
		markupTarget = this.dataMarkup[ key ] ;

		if ( markupTarget === undefined ) {
			if ( this.markupCatchAll === undefined ) { return '' ; }
			markupTarget = this.markupCatchAll ;
		}

		runtime.hasMarkup = true ;
		value = markup.slice( colonIndex + 1 ) ;

		if ( typeof markupTarget === 'function' ) {
			replacement = markupTarget( runtime.markupStack , key , value ) ;
			// method should manage markup stack themselves
		}
		else {
			replacement = { [ markupTarget ]: value } ;
			stackMarkup( runtime , replacement ) ;
		}

		return replacement ;
	}

	if ( runtime.shift ) {
		markupTarget = this.shiftedMarkup?.[ runtime.shift ]?.[ markup ] ;
		runtime.shift = null ;
	}
	else {
		markupTarget = this.markup?.[ markup ] ;
	}

	if ( markupTarget === undefined ) {
		if ( this.markupCatchAll === undefined ) { return '' ; }
		markupTarget = this.markupCatchAll ;
	}

	runtime.hasMarkup = true ;

	if ( typeof markupTarget === 'function' ) {
		replacement = markupTarget( runtime.markupStack , markup ) ;
		// method should manage markup stack themselves
	}
	else {
		replacement = markupTarget ;
		stackMarkup( runtime , replacement ) ;
	}

	return replacement ;
}



// internal method for markupReplace()
function stackMarkup( runtime , replacement ) {
	if ( Array.isArray( replacement ) ) {
		for ( let item of replacement ) {
			if ( item === null ) { runtime.markupStack.length = 0 ; }
			else { runtime.markupStack.push( item ) ; }
		}
	}
	else {
		if ( replacement === null ) { runtime.markupStack.length = 0 ; }
		else { runtime.markupStack.push( replacement ) ; }
	}
}



// Note: the closing bracket is optional to prevent ReDoS
exports.stripMarkup = str => str.replace( /\^\[[^\]]*]?|\^./g , match =>
	match === '^^' ? '^' :
	match === '^ ' ? ' ' :
	''
) ;

exports.escapeMarkup = str => str.replace( /\^/g , '^^' ) ;



const DEFAULT_FORMATTER = {
	argumentSanitizer: str => escape.control( str , true ) ,
	extraArguments: true ,
	color: false ,
	noMarkup: false ,
	escapeMarkup: false ,
	endingMarkupReset: true ,
	startingMarkupReset: false ,
	markupReset: ansi.reset ,
	shiftMarkup: {
		'#': 'background'
	} ,
	markup: {
		":": ansi.reset ,
		" ": ansi.reset + " " ,

		"-": ansi.dim ,
		"+": ansi.bold ,
		"_": ansi.underline ,
		"/": ansi.italic ,
		"!": ansi.inverse ,

		"b": ansi.blue ,
		"B": ansi.brightBlue ,
		"c": ansi.cyan ,
		"C": ansi.brightCyan ,
		"g": ansi.green ,
		"G": ansi.brightGreen ,
		"k": ansi.black ,
		"K": ansi.brightBlack ,
		"m": ansi.magenta ,
		"M": ansi.brightMagenta ,
		"r": ansi.red ,
		"R": ansi.brightRed ,
		"w": ansi.white ,
		"W": ansi.brightWhite ,
		"y": ansi.yellow ,
		"Y": ansi.brightYellow
	} ,
	shiftedMarkup: {
		background: {
			":": ansi.reset ,
			" ": ansi.reset + " " ,

			"b": ansi.bgBlue ,
			"B": ansi.bgBrightBlue ,
			"c": ansi.bgCyan ,
			"C": ansi.bgBrightCyan ,
			"g": ansi.bgGreen ,
			"G": ansi.bgBrightGreen ,
			"k": ansi.bgBlack ,
			"K": ansi.bgBrightBlack ,
			"m": ansi.bgMagenta ,
			"M": ansi.bgBrightMagenta ,
			"r": ansi.bgRed ,
			"R": ansi.bgBrightRed ,
			"w": ansi.bgWhite ,
			"W": ansi.bgBrightWhite ,
			"y": ansi.bgYellow ,
			"Y": ansi.bgBrightYellow
		}
	} ,
	dataMarkup: {
		fg: ( markupStack , key , value ) => {
			var str = ansi.fgColor[ value ] || ansi.trueColor( value ) ;
			markupStack.push( str ) ;
			return str ;
		} ,
		bg: ( markupStack , key , value ) => {
			var str = ansi.bgColor[ value ] || ansi.bgTrueColor( value ) ;
			markupStack.push( str ) ;
			return str ;
		}
	} ,
	markupCatchAll: ( markupStack , key , value ) => {
		var str = '' ;

		if ( value === undefined ) {
			if ( key[ 0 ] === '#' ) {
				str = ansi.trueColor( key ) ;
			}
			else if ( typeof ansi[ key ] === 'string' ) {
				str = ansi[ key ] ;
			}
		}

		markupStack.push( str ) ;
		return str ;
	}
} ;

// Aliases
DEFAULT_FORMATTER.dataMarkup.color = DEFAULT_FORMATTER.dataMarkup.c = DEFAULT_FORMATTER.dataMarkup.fgColor = DEFAULT_FORMATTER.dataMarkup.fg ;
DEFAULT_FORMATTER.dataMarkup.bgColor = DEFAULT_FORMATTER.dataMarkup.bg ;



exports.createFormatter = ( options ) => exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , options ) ) ;
exports.format = exports.formatMethod.bind( DEFAULT_FORMATTER ) ;
exports.format.default = DEFAULT_FORMATTER ;

exports.formatNoMarkup = exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , { noMarkup: true } ) ) ;
// For passing string to Terminal-Kit, it will interpret markup on its own
exports.formatThirdPartyMarkup = exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , { noMarkup: true , escapeMarkup: true } ) ) ;

exports.createMarkup = ( options ) => exports.markupMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , options ) ) ;
exports.markup = exports.markupMethod.bind( DEFAULT_FORMATTER ) ;



// Count the number of parameters needed for this string
exports.format.count = function( str , noMarkup = false ) {
	var markup , index , relative , autoIndex = 1 , maxIndex = 0 ;

	if ( typeof str !== 'string' ) { return 0 ; }

	// This regex differs slightly from the main regex: we do not count '%%' and %F is excluded
	// Note: the closing bracket is optional to prevent ReDoS
	var regexp = noMarkup ?
		/%([+-]?)([0-9]*)(?:\[[^\]]*\])?[a-zA-EG-Z]/g :
		/%([+-]?)([0-9]*)(?:\[[^\]]*\])?[a-zA-EG-Z]|(\^\[[^\]]*]?|\^.)/g ;

	for ( [ , relative , index , markup ] of str.matchAll( regexp ) ) {
		if ( markup ) { continue ; }

		if ( index ) {
			index = parseInt( index , 10 ) ;

			if ( relative ) {
				if ( relative === '+' ) { index = autoIndex + index ; }
				else if ( relative === '-' ) { index = autoIndex - index ; }
			}
		}
		else {
			index = autoIndex ;
		}

		autoIndex ++ ;

		if ( maxIndex < index ) { maxIndex = index ; }
	}

	return maxIndex ;
} ;



// Tell if this string contains formatter chars
exports.format.hasFormatting = function( str ) {
	if ( str.search( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/ ) !== -1 ) { return true ; }
	return false ;
} ;



// --- Format MODES ---

const modes = {} ;
exports.format.modes = modes ;	// <-- expose modes, used by Babel-Tower for String Kit interop'



// string
modes.s = ( arg , modeArg ) => {
	var subModes = stringModeArg( modeArg ) ;

	if ( typeof arg === 'string' ) { return arg ; }
	if ( arg === null || arg === undefined || arg === false ) { return subModes.empty ? '' : '(' + arg + ')' ; }
	if ( arg === true ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }
	return '(' + arg + ')' ;
} ;

modes.r = arg => modes.s( arg ) ;
modes.r.noSanitize = true ;



// string, interpret ^ formatting
modes.S = ( arg , modeArg , options ) => {
	var subModes = stringModeArg( modeArg ) ;

	// We do the sanitizing part on our own
	var interpret = options.escapeMarkup ? str => ( options.argumentSanitizer ? options.argumentSanitizer( str ) : str ) :
		str => exports.markupMethod.call( options , options.argumentSanitizer ? options.argumentSanitizer( str ) : str ) ;

	if ( typeof arg === 'string' ) { return interpret( arg ) ; }
	if ( arg === null || arg === undefined || arg === false ) { return subModes.empty ? '' : '(' + arg + ')' ; }
	if ( arg === true ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return interpret( arg.toString() ) ; }
	return interpret( '(' + arg + ')' ) ;
} ;

modes.S.noSanitize = true ;
modes.S.noEscapeMarkup = true ;
modes.S.noCommonModeArg = true ;



// natural (WIP)
modes.N = ( arg , modeArg ) => genericNaturalMode( arg , modeArg , false ) ;
modes.n = ( arg , modeArg ) => genericNaturalMode( arg , modeArg , true ) ;



// float
modes.f = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.f.noSanitize = true ;



// roman numeral, additive variant
modes.v = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = StringNumber.additiveRoman( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.v.noSanitize = true ;



// roman numeral
modes.V = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = StringNumber.roman( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.V.noSanitize = true ;



// absolute percent
modes.P = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	arg *= 100 ;

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	// Force rounding to zero by default
	if ( subModes.rounding !== null || ! subModes.precision ) { sn.round( subModes.rounding || 0 ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toNoExpString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) + '%' ;
} ;

modes.P.noSanitize = true ;



// relative percent
modes.p = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	arg = ( arg - 1 ) * 100 ;

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	// Force rounding to zero by default
	if ( subModes.rounding !== null || ! subModes.precision ) { sn.round( subModes.rounding || 0 ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	// 4th argument force a '+' sign
	return sn.toNoExpString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal , true ) + '%' ;
} ;

modes.p.noSanitize = true ;



// metric system
modes.k = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '0' ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	// Default to 3 numbers precision
	if ( subModes.precision || subModes.rounding === null ) { sn.precision( subModes.precision || 3 ) ; }

	return sn.toMetricString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.k.noSanitize = true ;



// exponential notation, a.k.a. "E notation" (e.g. 1.23e+2)
modes.e = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toExponential() ;
} ;

modes.e.noSanitize = true ;



// scientific notation (e.g. 1.23 × 10²)
modes.K = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toScientific() ;
} ;

modes.K.noSanitize = true ;



// integer
modes.d = modes.i = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.floor( arg ) ; }
	return '0' ;
} ;

modes.i.noSanitize = true ;



// unsigned integer
modes.u = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ) ; }
	return '0' ;
} ;

modes.u.noSanitize = true ;



// unsigned positive integer
modes.U = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 1 ) ; }
	return '1' ;
} ;

modes.U.noSanitize = true ;



// /!\ Should use StringNumber???
// Degree, minutes and seconds.
// Unlike %t which receive ms, here the input is in degree.
modes.m = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var minus = '' ;
	if ( arg < 0 ) { minus = '-' ; arg = -arg ; }

	var degrees = epsilonFloor( arg ) ,
		frac = arg - degrees ;

	if ( ! frac ) { return minus + degrees + '°' ; }

	var minutes = epsilonFloor( frac * 60 ) ,
		seconds = epsilonFloor( frac * 3600 - minutes * 60 ) ;

	if ( seconds ) {
		return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' + ( '' + seconds ).padStart( 2 , '0' ) + '″' ;
	}

	return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' ;

} ;

modes.m.noSanitize = true ;



// Date/time
// Minimal Date formating, only support sort of ISO ATM.
// It will be improved later.
modes.T = ( arg , modeArg ) => {
	// Always get a copy of the arg
	try {
		arg = new Date( arg ) ;
	}
	catch ( error ) {
		return '(invalid)' ;
	}

	if ( Number.isNaN( arg.getTime() ) ) {
		return '(invalid)' ;
	}

	var datePart = '' ,
		timePart = '' ,
		str = '' ,
		subModes = dateTimeModeArg( modeArg ) ,
		roundingType = subModes.roundingType ,
		forceDecimalSeparator = subModes.useAbbreviation ;

	// For instance, we only support the ISO-like type

	if ( subModes.years ) {
		if ( datePart ) { datePart += '-' ; }
		datePart += arg.getFullYear() ;
	}

	if ( subModes.months ) {
		if ( datePart ) { datePart += '-' ; }
		datePart += ( '' + ( arg.getMonth() + 1 ) ).padStart( 2 , '0' ) ;
	}

	if ( subModes.days ) {
		if ( datePart ) { datePart += '-' ; }
		datePart += ( '' + arg.getDate() ).padStart( 2 , '0' ) ;
	}

	if ( subModes.hours ) {
		if ( timePart && ! subModes.useAbbreviation ) { timePart += ':' ; }
		timePart += ( '' + arg.getHours() ).padStart( 2 , '0' ) ;
		if ( subModes.useAbbreviation ) { timePart += 'h' ; }
	}

	if ( subModes.minutes ) {
		if ( timePart && ! subModes.useAbbreviation ) { timePart += ':' ; }
		timePart += ( '' + arg.getMinutes() ).padStart( 2 , '0' ) ;
		if ( subModes.useAbbreviation ) { timePart += 'min' ; }
	}

	if ( subModes.seconds ) {
		if ( timePart && ! subModes.useAbbreviation ) { timePart += ':' ; }
		timePart += ( '' + arg.getSeconds() ).padStart( 2 , '0' ) ;
		if ( subModes.useAbbreviation ) { timePart += 's' ; }
	}

	if ( datePart ) {
		if ( str ) { str += ' ' ; }
		str += datePart ;
	}

	if ( timePart ) {
		if ( str ) { str += ' ' ; }
		str += timePart ;
	}

	return str ;
} ;

modes.T.noSanitize = true ;



// Time duration, transform ms into H:min:s
modes.t = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var h , min , s , sn , sStr ,
		sign = '' ,
		subModes = timeDurationModeArg( modeArg ) ,
		roundingType = subModes.roundingType ,
		hSeparator = subModes.useAbbreviation ? 'h' : ':' ,
		minSeparator = subModes.useAbbreviation ? 'min' : ':' ,
		sSeparator = subModes.useAbbreviation ? 's' : '.' ,
		forceDecimalSeparator = subModes.useAbbreviation ;

	s = arg / 1000 ;

	if ( s < 0 ) {
		s = -s ;
		roundingType *= -1 ;
		sign = '-' ;
	}

	if ( s < 60 && ! subModes.forceMinutes ) {
		sn = new StringNumber( s , { decimalSeparator: sSeparator , forceDecimalSeparator } ) ;
		sn.round( subModes.rounding , roundingType ) ;

		// Check if rounding has made it reach 60
		if ( sn.toNumber() < 60 ) {
			sStr = sn.toString( 1 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
			return sign + sStr ;
		}

		s = 60 ;

	}

	min = Math.floor( s / 60 ) ;
	s = s % 60 ;

	sn = new StringNumber( s , { decimalSeparator: sSeparator , forceDecimalSeparator } ) ;
	sn.round( subModes.rounding , roundingType ) ;

	// Check if rounding has made it reach 60
	if ( sn.toNumber() < 60 ) {
		sStr = sn.toString( 2 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
	}
	else {
		min ++ ;
		s = 0 ;
		sn.set( s ) ;
		sStr = sn.toString( 2 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
	}

	if ( min < 60 && ! subModes.forceHours ) {
		return sign + min + minSeparator + sStr ;
	}

	h = Math.floor( min / 60 ) ;
	min = min % 60 ;

	return sign + h + hSeparator + ( '' + min ).padStart( 2 , '0' ) + minSeparator + sStr ;
} ;

modes.t.noSanitize = true ;



// unsigned hexadecimal
modes.h = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ; }
	return '0' ;
} ;

modes.h.noSanitize = true ;



// unsigned hexadecimal, force pair of symboles
modes.x = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '00' ; }

	var value = '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ;

	if ( value.length % 2 ) { value = '0' + value ; }
	return value ;
} ;

modes.x.noSanitize = true ;



// unsigned octal
modes.o = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 8 ) ; }
	return '0' ;
} ;

modes.o.noSanitize = true ;



// unsigned binary
modes.b = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 2 ) ; }
	return '0' ;
} ;

modes.b.noSanitize = true ;



// String to hexadecimal, force pair of symboles
modes.X = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'hex' ) ;
} ;

modes.X.noSanitize = true ;



// base64
modes.z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ) ;
} ;



// base64url
modes.Z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ).replace( /\+/g , '-' )
		.replace( /\//g , '_' )
		.replace( /[=]{1,2}$/g , '' ) ;
} ;



// Inspect
const I_OPTIONS = {} ;
modes.I = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , I_OPTIONS ) ;
modes.I.noSanitize = true ;



// More minimalist inspect
const Y_OPTIONS = {
	noFunc: true ,
	enumOnly: true ,
	noDescriptor: true ,
	useInspect: true ,
	useInspectPropertyBlackList: true
} ;
modes.Y = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , Y_OPTIONS ) ;
modes.Y.noSanitize = true ;



// Even more minimalist inspect
const O_OPTIONS = { minimal: true , bulletIndex: true , noMarkup: true } ;
modes.O = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , O_OPTIONS ) ;
modes.O.noSanitize = true ;



// Inspect error
const E_OPTIONS = {} ;
modes.E = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , E_OPTIONS , true ) ;
modes.E.noSanitize = true ;



// JSON
modes.J = arg => arg === undefined ? 'null' : JSON.stringify( arg ) ;



// drop
modes.D = () => '' ;
modes.D.noSanitize = true ;



// ModeArg formats

// The format for commonModeArg
const COMMON_MODE_ARG_FORMAT_REGEX = /([a-zA-Z])(.[^a-zA-Z]*)/g ;

// The format for specific mode arg
const MODE_ARG_FORMAT_REGEX = /([a-zA-Z]|^)([^a-zA-Z]*)/g ;



// Called when there is a modeArg and the mode allow common mode arg
// CONVENTION: reserve upper-cased letters for common mode arg
function commonModeArg( str , modeArg ) {
	for ( let [ , k , v ] of modeArg.matchAll( COMMON_MODE_ARG_FORMAT_REGEX ) ) {
		if ( k === 'L' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = ' '.repeat( v - width ) + str ; }
		}
		else if ( k === 'R' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = str + ' '.repeat( v - width ) ; }
		}
	}

	return str ;
}



const FLOAT_MODES = {
	leftPadding: 1 ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	rounding: null ,
	precision: null ,
	groupSeparator: ''
} ;

// Generic number modes
function floatModeArg( modeArg ) {
	FLOAT_MODES.leftPadding = 1 ;
	FLOAT_MODES.rightPadding = 0 ;
	FLOAT_MODES.rightPaddingOnlyIfDecimal = false ;
	FLOAT_MODES.rounding = null ;
	FLOAT_MODES.precision = null ;
	FLOAT_MODES.groupSeparator = '' ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'z' ) {
				// Zero-left padding
				FLOAT_MODES.leftPadding = + v ;
			}
			else if ( k === 'g' ) {
				// Group separator
				FLOAT_MODES.groupSeparator = v || ' ' ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						FLOAT_MODES.rounding = FLOAT_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						FLOAT_MODES.rounding = FLOAT_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						FLOAT_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						FLOAT_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
				else if ( v[ v.length - 1 ] === '.' ) {
					// Rounding before the decimal
					FLOAT_MODES.rounding = -parseInt( v.slice( 0 , -1 ) , 10 ) || 0 ;
				}
				else {
					// Precision, but only if integer
					FLOAT_MODES.precision = parseInt( v , 10 ) || null ;
				}
			}
		}
	}

	return FLOAT_MODES ;
}



const STRING_MODES = {
	empty: false
} ;

// Generic number modes
function stringModeArg( modeArg ) {
	STRING_MODES.empty = false ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'e' ) {
				// Empty mode:
				STRING_MODES.empty = true ;
			}
		}
	}

	return STRING_MODES ;
}



const DATE_TIME_MODES = {
	useAbbreviation: false ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	years: true ,
	months: true ,
	days: true ,
	hours: true ,
	minutes: true ,
	seconds: true
} ;

// Generic number modes
function dateTimeModeArg( modeArg ) {
	DATE_TIME_MODES.rightPadding = 0 ;
	DATE_TIME_MODES.rightPaddingOnlyIfDecimal = false ;
	DATE_TIME_MODES.rounding = 0 ;
	DATE_TIME_MODES.roundingType = -1 ;
	DATE_TIME_MODES.years = DATE_TIME_MODES.months = DATE_TIME_MODES.days = false ;
	DATE_TIME_MODES.hours = DATE_TIME_MODES.minutes = DATE_TIME_MODES.seconds = false ;
	DATE_TIME_MODES.useAbbreviation = false ;

	var hasSelector = false ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'T' ) {
				DATE_TIME_MODES.years = DATE_TIME_MODES.months = DATE_TIME_MODES.days = false ;
				DATE_TIME_MODES.hours = DATE_TIME_MODES.minutes = DATE_TIME_MODES.seconds = true ;
				hasSelector = true ;
			}
			else if ( k === 'D' ) {
				DATE_TIME_MODES.years = DATE_TIME_MODES.months = DATE_TIME_MODES.days = true ;
				DATE_TIME_MODES.hours = DATE_TIME_MODES.minutes = DATE_TIME_MODES.seconds = false ;
				hasSelector = true ;
			}
			else if ( k === 'Y' ) {
				DATE_TIME_MODES.years = true ;
				hasSelector = true ;
			}
			else if ( k === 'M' ) {
				DATE_TIME_MODES.months = true ;
				hasSelector = true ;
			}
			else if ( k === 'd' ) {
				DATE_TIME_MODES.days = true ;
				hasSelector = true ;
			}
			else if ( k === 'h' ) {
				DATE_TIME_MODES.hours = true ;
				hasSelector = true ;
			}
			else if ( k === 'm' ) {
				DATE_TIME_MODES.minutes = true ;
				hasSelector = true ;
			}
			else if ( k === 's' ) {
				DATE_TIME_MODES.seconds = true ;
				hasSelector = true ;
			}
			else if ( k === 'r' ) {
				DATE_TIME_MODES.roundingType = 0 ;
			}
			else if ( k === 'f' ) {
				DATE_TIME_MODES.roundingType = -1 ;
			}
			else if ( k === 'c' ) {
				DATE_TIME_MODES.roundingType = 1 ;
			}
			else if ( k === 'a' ) {
				DATE_TIME_MODES.useAbbreviation = true ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						DATE_TIME_MODES.rounding = DATE_TIME_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						DATE_TIME_MODES.rounding = DATE_TIME_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						DATE_TIME_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						DATE_TIME_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
			}
		}
	}

	if ( ! hasSelector ) {
		DATE_TIME_MODES.years = DATE_TIME_MODES.months = DATE_TIME_MODES.days = true ;
		DATE_TIME_MODES.hours = DATE_TIME_MODES.minutes = DATE_TIME_MODES.seconds = true ;
	}

	return DATE_TIME_MODES ;
}



const TIME_DURATION_MODES = {
	useAbbreviation: false ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	rounding: 0 ,
	roundingType: -1 ,	// -1: floor, 0: round, 1: ceil
	forceHours: false ,
	forceMinutes: false
} ;

// Generic number modes
function timeDurationModeArg( modeArg ) {
	TIME_DURATION_MODES.rightPadding = 0 ;
	TIME_DURATION_MODES.rightPaddingOnlyIfDecimal = false ;
	TIME_DURATION_MODES.rounding = 0 ;
	TIME_DURATION_MODES.roundingType = -1 ;
	TIME_DURATION_MODES.useAbbreviation = TIME_DURATION_MODES.forceHours = TIME_DURATION_MODES.forceMinutes = false ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'h' ) {
				TIME_DURATION_MODES.forceHours = TIME_DURATION_MODES.forceMinutes = true ;
			}
			else if ( k === 'm' ) {
				TIME_DURATION_MODES.forceMinutes = true ;
			}
			else if ( k === 'r' ) {
				TIME_DURATION_MODES.roundingType = 0 ;
			}
			else if ( k === 'f' ) {
				TIME_DURATION_MODES.roundingType = -1 ;
			}
			else if ( k === 'c' ) {
				TIME_DURATION_MODES.roundingType = 1 ;
			}
			else if ( k === 'a' ) {
				TIME_DURATION_MODES.useAbbreviation = true ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						TIME_DURATION_MODES.rounding = TIME_DURATION_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						TIME_DURATION_MODES.rounding = TIME_DURATION_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						TIME_DURATION_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						TIME_DURATION_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
			}
		}
	}

	return TIME_DURATION_MODES ;
}



// Generic Natural Mode
function genericNaturalMode( arg , modeArg , delimiters ) {
	var depthLimit = 2 ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( ! k ) {
				depthLimit = parseInt( v , 10 ) || 1 ;
			}
		}
	}

	return genericNaturalModeRecursive( arg , delimiters , depthLimit , 0 ) ;
}

function genericNaturalModeRecursive( arg , delimiters , depthLimit , depth ) {
	if ( typeof arg === 'string' ) { return arg ; }

	if ( arg === null || arg === undefined || arg === true || arg === false ) {
		return '' + arg ;
	}

	if ( typeof arg === 'number' ) {
		return modes.f( arg , '.3g ' ) ;
	}

	if ( arg instanceof Set ) { arg = [ ... arg ] ; }

	if ( Array.isArray( arg ) ) {
		if ( depth >= depthLimit ) { return '[...]' ; }

		arg = arg.map( e => genericNaturalModeRecursive( e , true , depthLimit , depth + 1 ) ) ;

		if ( delimiters ) { return '[' + arg.join( ',' ) + ']' ; }
		return arg.join( ', ' ) ;
	}

	if ( Buffer.isBuffer( arg ) ) {
		arg = [ ... arg ].map( e => {
			e = e.toString( 16 ) ;
			if ( e.length === 1 ) { e = '0' + e ; }
			return e ;
		} ) ;
		return '<' + arg.join( ' ' ) + '>' ;
	}

	var proto = Object.getPrototypeOf( arg ) ;

	if ( proto === null || proto === Object.prototype ) {
		// Plain objects
		if ( depth >= depthLimit ) { return '{...}' ; }

		arg = Object.entries( arg ).sort( naturalSort )
			.map( e => e[ 0 ] + ': ' + genericNaturalModeRecursive( e[ 1 ] , true , depthLimit , depth + 1 ) ) ;

		if ( delimiters ) { return '{' + arg.join( ', ' ) + '}' ; }
		return arg.join( ', ' ) ;
	}

	if ( typeof arg.inspect === 'function' ) { return arg.inspect() ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }

	return '(' + arg + ')' ;
}



// Generic inspect
function genericInspectMode( arg , modeArg , options , modeOptions , isInspectError = false ) {
	var outputMaxLength ,
		maxLength ,
		depth = 3 ,
		style = options && options.color ? 'color' : 'none' ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'c' ) {
				if ( v === '+' ) { style = 'color' ; }
				else if ( v === '-' ) { style = 'none' ; }
			}
			else if ( k === 'i' ) {
				style = 'inline' ;
			}
			else if ( k === 'l' ) {
				// total output max length
				outputMaxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( k === 's' ) {
				// string max length
				maxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( ! k ) {
				depth = parseInt( v , 10 ) || 1 ;
			}
		}
	}

	if ( isInspectError ) {
		return inspectError( Object.assign( {
			depth , style , outputMaxLength , maxLength
		} , modeOptions ) , arg ) ;
	}

	return inspect( Object.assign( {
		depth , style , outputMaxLength , maxLength
	} , modeOptions ) , arg ) ;
}



// From math-kit module
// /!\ Should be updated with the new way the math-kit module do it!!! /!\
const EPSILON = 0.0000000001 ;
const INVERSE_EPSILON = Math.round( 1 / EPSILON ) ;

function epsilonRound( v ) {
	return Math.round( v * INVERSE_EPSILON ) / INVERSE_EPSILON ;
}

function epsilonFloor( v ) {
	return Math.floor( v + EPSILON ) ;
}

// Round with precision
function round( v , step ) {
	// use: v * ( 1 / step )
	// not: v / step
	// reason: epsilon rounding errors
	return epsilonRound( step * Math.round( v * ( 1 / step ) ) ) ;
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/misc.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





exports.resize = function( str , length ) {
	if ( str.length === length ) {
		return str ;
	}
	else if ( str.length > length ) {
		return str.slice( 0 , length ) ;
	}

	return str + ' '.repeat( length - str.length ) ;

} ;



exports.occurrenceCount = function( str , subStr , overlap = false ) {
	if ( ! str || ! subStr ) { return 0 ; }

	var count = 0 , index = 0 ,
		inc = overlap ? 1 : subStr.length ;

	while ( ( index = str.indexOf( subStr , index ) ) !== -1 ) {
		count ++ ;
		index += inc ;
	}

	return count ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/inspect.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	Variable inspector.
*/





const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;

const EMPTY = {} ;
const TRIVIAL_CONSTRUCTOR = new Set( [ Object , Array ] ) ;



/*
	Inspect a variable, return a string ready to be displayed with console.log(), or even as an HTML output.

	Options:
		* style:
			* 'none': (default) normal output suitable for console.log() or writing in a file
			* 'inline': like 'none', but without newlines
			* 'color': colorful output suitable for terminal
			* 'html': html output
			* any object: full controle, inheriting from 'none'
		* tab: `string` override the tab of the style
		* depth: depth limit, default: 3
		* maxLength: length limit for strings, default: 250
		* outputMaxLength: length limit for the inspect output string, default: 5000
		* noFunc: do not display functions
		* noDescriptor: do not display descriptor information
		* noArrayProperty: do not display array properties
		* noIndex: do not display array indexes
		* bulletIndex: do not display array indexes, instead display a bullet: *
		* noType: do not display type and constructor
		* noTypeButConstructor: do not display type, display non-trivial constructor (not Object or Array, but all others)
		* enumOnly: only display enumerable properties
		* funcDetails: display function's details
		* proto: display object's prototype
		* sort: sort the keys
		* noMarkup: don't add Javascript/JSON markup: {}[],"
		* minimal: imply noFunc: true, noDescriptor: true, noType: true, noArrayProperty: true, enumOnly: true, proto: false and funcDetails: false.
		  Display a minimal JSON-like output
		* minimalPlusConstructor: like minimal, but output non-trivial constructor
		* protoBlackList: `Set` of blacklisted object prototype (will not recurse inside it)
		* propertyBlackList: `Set` of blacklisted property names (will not even display it)
		* useInspect: use .inspect() method when available on an object (default to false)
		* useInspectPropertyBlackList: if set and if the object to be inspected has an 'inspectPropertyBlackList' property which value is a `Set`,
		  use it like the 'propertyBlackList' option
*/

function inspect( options , variable ) {
	if ( arguments.length < 2 ) { variable = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	var runtime = { depth: 0 , ancestors: [] } ;

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }
	// Too slow:
	//else { options.style = Object.assign( {} , inspectStyle.none , options.style ) ; }

	if ( options.depth === undefined ) { options.depth = 3 ; }
	if ( options.maxLength === undefined ) { options.maxLength = 250 ; }
	if ( options.outputMaxLength === undefined ) { options.outputMaxLength = 5000 ; }

	// /!\ nofunc is deprecated
	if ( options.nofunc ) { options.noFunc = true ; }

	if ( options.minimal ) {
		options.noFunc = true ;
		options.noDescriptor = true ;
		options.noType = true ;
		options.noArrayProperty = true ;
		options.enumOnly = true ;
		options.proto = false ;
		options.funcDetails = false ;
	}

	if ( options.minimalPlusConstructor ) {
		options.noFunc = true ;
		options.noDescriptor = true ;
		options.noTypeButConstructor = true ;
		options.noArrayProperty = true ;
		options.enumOnly = true ;
		options.proto = false ;
		options.funcDetails = false ;
	}

	var str = inspect_( runtime , options , variable ) ;

	if ( str.length > options.outputMaxLength ) {
		str = options.style.truncate( str , options.outputMaxLength ) ;
	}

	return str ;
}

exports.inspect = inspect ;



function inspect_( runtime , options , variable ) {
	var i , funcName , length , proto , propertyList , isTrivialConstructor , constructor , keyIsProperty ,
		type , pre , isArray , isFunc , specialObject ,
		str = '' , key = '' , descriptorStr = '' , indent = '' ,
		descriptor , nextAncestors ;

	// Prepare things (indentation, key, descriptor, ... )

	type = typeof variable ;

	if ( runtime.depth ) {
		indent = ( options.tab ?? options.style.tab ).repeat( options.noMarkup ? runtime.depth - 1 : runtime.depth ) ;
	}

	if ( type === 'function' && options.noFunc ) { return '' ; }

	if ( runtime.key !== undefined ) {
		if ( runtime.descriptor ) {
			descriptorStr = [] ;

			if ( runtime.descriptor.error ) {
				descriptorStr = '[' + runtime.descriptor.error + ']' ;
			}
			else {
				if ( ! runtime.descriptor.configurable ) { descriptorStr.push( '-conf' ) ; }
				if ( ! runtime.descriptor.enumerable ) { descriptorStr.push( '-enum' ) ; }

				// Already displayed by runtime.forceType
				//if ( runtime.descriptor.get || runtime.descriptor.set ) { descriptorStr.push( 'getter/setter' ) ; } else
				if ( ! runtime.descriptor.writable ) { descriptorStr.push( '-w' ) ; }

				//if ( descriptorStr.length ) { descriptorStr = '(' + descriptorStr.join( ' ' ) + ')' ; }
				if ( descriptorStr.length ) { descriptorStr = descriptorStr.join( ' ' ) ; }
				else { descriptorStr = '' ; }
			}
		}

		if ( runtime.keyIsProperty ) {
			if ( ! options.noMarkup && keyNeedingQuotes( runtime.key ) ) {
				key = '"' + options.style.key( runtime.key ) + '": ' ;
			}
			else {
				key = options.style.key( runtime.key ) + ': ' ;
			}
		}
		else if ( options.bulletIndex ) {
			key = ( typeof options.bulletIndex === 'string' ? options.bulletIndex : '*' ) + ' ' ;
		}
		else if ( ! options.noIndex ) {
			key = options.style.index( runtime.key ) ;
		}

		if ( descriptorStr ) { descriptorStr = ' ' + options.style.type( descriptorStr ) ; }
	}

	pre = runtime.noPre ? '' : indent + key ;


	// Describe the current variable

	if ( variable === undefined ) {
		str += pre + options.style.constant( 'undefined' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === EMPTY ) {
		str += pre + options.style.constant( '[empty]' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === null ) {
		str += pre + options.style.constant( 'null' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === false ) {
		str += pre + options.style.constant( 'false' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === true ) {
		str += pre + options.style.constant( 'true' ) + descriptorStr + options.style.newline ;
	}
	else if ( type === 'number' ) {
		str += pre + options.style.number( variable.toString() ) +
			( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'number' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'string' ) {
		if ( variable.length > options.maxLength ) {
			str += pre + ( options.noMarkup ? '' : '"' ) + options.style.string( escape.control( variable.slice( 0 , options.maxLength - 1 ) ) ) + '…' + ( options.noMarkup ? '' : '"' ) +
				( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ' - TRUNCATED)' ) ) +
				descriptorStr + options.style.newline ;
		}
		else {
			str += pre + ( options.noMarkup ? '' : '"' ) + options.style.string( escape.control( variable ) ) + ( options.noMarkup ? '' : '"' ) +
				( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ')' ) ) +
				descriptorStr + options.style.newline ;
		}
	}
	else if ( Buffer.isBuffer( variable ) ) {
		str += pre + options.style.inspect( variable.inspect() ) +
			( options.noType ? '' : ' ' + options.style.type( 'Buffer' ) + options.style.length( '(' + variable.length + ')' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'object' || type === 'function' ) {
		funcName = length = '' ;
		isFunc = false ;

		if ( type === 'function' ) {
			isFunc = true ;
			funcName = ' ' + options.style.funcName( ( variable.name ? variable.name : '(anonymous)' ) ) ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		isArray = false ;

		if ( Array.isArray( variable ) ) {
			isArray = true ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		if ( ! variable.constructor ) { constructor = '(no constructor)' ; }
		else if ( ! variable.constructor.name ) { constructor = '(anonymous)' ; }
		else { constructor = variable.constructor.name ; }

		isTrivialConstructor = ! variable.constructor || TRIVIAL_CONSTRUCTOR.has( variable.constructor ) ;

		constructor = options.style.constructorName( constructor ) ;
		proto = Object.getPrototypeOf( variable ) ;

		str += pre ;

		if ( ! options.noType && ( ! options.noTypeButConstructor || ! isTrivialConstructor ) ) {
			if ( runtime.forceType && ! options.noType && ! options.noTypeButConstructor ) {
				str += options.style.type( runtime.forceType ) ;
			}
			else if ( options.noTypeButConstructor ) {
				str += constructor ;
			}
			else {
				str += constructor + funcName + length + ' ' + options.style.type( type ) + descriptorStr ;
			}

			if ( ! isFunc || options.funcDetails ) { str += ' ' ; }	// if no funcDetails imply no space here
		}

		if ( isArray && options.noArrayProperty ) {
			propertyList = [ ... Array( variable.length ).keys() ] ;
		}
		else {
			propertyList = Object.getOwnPropertyNames( variable ) ;
		}

		if ( options.sort ) { propertyList.sort() ; }

		// Special Objects
		specialObject = specialObjectSubstitution( variable , runtime , options ) ;

		if ( options.protoBlackList && options.protoBlackList.has( proto ) ) {
			str += options.style.limit( '[skip]' ) + options.style.newline ;
		}
		else if ( specialObject !== undefined ) {
			if ( typeof specialObject === 'string' ) {
				str += '=> ' + specialObject + options.style.newline ;
			}
			else {
				str += '=> ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					specialObject
				) ;
			}
		}
		else if ( isFunc && ! options.funcDetails ) {
			str += options.style.newline ;
		}
		else if ( ! propertyList.length && ! options.proto ) {
			str += ( options.noMarkup ? '' : isArray ? '[]' : '{}' ) + options.style.newline ;
		}
		else if ( runtime.depth >= options.depth ) {
			str += options.style.limit( '[depth limit]' ) + options.style.newline ;
		}
		else if ( runtime.ancestors.indexOf( variable ) !== -1 ) {
			str += options.style.limit( '[circular]' ) + options.style.newline ;
		}
		else {
			/*
			str +=
				options.noMarkup ? ( isArray && options.noIndex && ! runtime.keyIsProperty ? '' : options.style.newline ) :
				( isArray ? '[' : '{' ) + options.style.newline ;
			//*/
			//*
			str += ( options.noMarkup ? '' : isArray ? '[' : '{'  ) + options.style.newline ;
			//*/

			// Do not use .concat() here, it doesn't works as expected with arrays...
			nextAncestors = runtime.ancestors.slice() ;
			nextAncestors.push( variable ) ;

			for ( i = 0 ; i < propertyList.length && str.length < options.outputMaxLength ; i ++ ) {
				if ( ! isArray && (
					( options.propertyBlackList && options.propertyBlackList.has( propertyList[ i ] ) )
					|| ( options.useInspectPropertyBlackList && ( variable.inspectPropertyBlackList instanceof Set ) && variable.inspectPropertyBlackList.has( propertyList[ i ] ) )
				) ) {
					//str += options.style.limit( '[skip]' ) + options.style.newline ;
					continue ;
				}

				if ( isArray && options.noArrayProperty && ! ( propertyList[ i ] in variable ) ) {
					// Hole in the array (sparse array, item deleted, ...)
					str += inspect_(
						{
							depth: runtime.depth + 1 ,
							ancestors: nextAncestors ,
							key: propertyList[ i ] ,
							keyIsProperty: false
						} ,
						options ,
						EMPTY
					) ;
				}
				else {
					try {
						descriptor = Object.getOwnPropertyDescriptor( variable , propertyList[ i ] ) ;
						// Note: descriptor can be undefined, this happens when the object is a Proxy with a bad implementation:
						// it reports that key (Object.keys()) but doesn't give the descriptor for it.

						if ( descriptor && ! descriptor.enumerable && options.enumOnly ) { continue ; }
						keyIsProperty = ! isArray || ! descriptor.enumerable || isNaN( propertyList[ i ] ) ;

						if ( ! options.noDescriptor && descriptor && ( descriptor.get || descriptor.set ) ) {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: descriptor ,
									forceType: 'getter/setter'
								} ,
								options ,
								{ get: descriptor.get , set: descriptor.set }
							) ;
						}
						else {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: options.noDescriptor ? undefined : descriptor || { error: "Bad Proxy Descriptor" }
								} ,
								options ,
								variable[ propertyList[ i ] ]
							) ;
						}
					}
					catch ( error ) {
						str += inspect_(
							{
								depth: runtime.depth + 1 ,
								ancestors: nextAncestors ,
								key: propertyList[ i ] ,
								keyIsProperty: keyIsProperty ,
								descriptor: options.noDescriptor ? undefined : descriptor
							} ,
							options ,
							error
						) ;
					}
				}

				if ( i < propertyList.length - 1 ) { str += options.style.comma ; }
			}

			if ( options.proto ) {
				str += inspect_(
					{
						depth: runtime.depth + 1 ,
						ancestors: nextAncestors ,
						key: '__proto__' ,
						keyIsProperty: true
					} ,
					options ,
					proto
				) ;
			}

			str += options.noMarkup ? '' : indent + ( isArray ? ']' : '}' ) + options.style.newline ;
		}
	}


	// Finalizing


	if ( runtime.depth === 0 ) {
		if ( options.style.trim ) { str = str.trim() ; }
		if ( options.style === 'html' ) { str = escape.html( str ) ; }
	}

	return str ;
}



function keyNeedingQuotes( key ) {
	if ( ! key.length ) { return true ; }
	return false ;
}



var promiseStates = [ 'pending' , 'fulfilled' , 'rejected' ] ;



// Some special object are better written down when substituted by something else
function specialObjectSubstitution( object , runtime , options ) {
	if ( typeof object.constructor !== 'function' ) {
		// Some objects have no constructor, e.g.: Object.create(null)
		//console.error( object ) ;
		return ;
	}

	if ( object instanceof String ) {
		return object.toString() ;
	}

	if ( object instanceof RegExp ) {
		return object.toString() ;
	}

	if ( object instanceof Date ) {
		return object.toString() + ' [' + object.getTime() + ']' ;
	}

	if ( typeof Set === 'function' && object instanceof Set ) {
		// This is an ES6 'Set' Object
		return Array.from( object ) ;
	}

	if ( typeof Map === 'function' && object instanceof Map ) {
		// This is an ES6 'Map' Object
		return Array.from( object ) ;
	}

	if ( object instanceof Promise ) {
		if ( process && process.binding && process.binding( 'util' ) && process.binding( 'util' ).getPromiseDetails ) {
			let details = process.binding( 'util' ).getPromiseDetails( object ) ;
			let state =  promiseStates[ details[ 0 ] ] ;
			let str = 'Promise <' + state + '>' ;

			if ( state === 'fulfilled' ) {
				str += ' ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					details[ 1 ]
				) ;
			}
			else if ( state === 'rejected' ) {
				if ( details[ 1 ] instanceof Error ) {
					str += ' ' + inspectError(
						{
							style: options.style ,
							noErrorStack: true
						} ,
						details[ 1 ]
					) ;
				}
				else {
					str += ' ' + inspect_(
						{
							depth: runtime.depth ,
							ancestors: runtime.ancestors ,
							noPre: true
						} ,
						options ,
						details[ 1 ]
					) ;
				}
			}

			return str ;
		}
	}

	if ( object._bsontype ) {
		// This is a MongoDB ObjectID, rather boring to display in its original form
		// due to esoteric characters that confuse both the user and the terminal displaying it.
		// Substitute it to its string representation
		return object.toString() ;
	}

	if ( options.useInspect && typeof object.inspect === 'function' ) {
		return object.inspect() ;
	}

	return ;
}



/*
	Options:
		noErrorStack: set to true if the stack should not be displayed
*/
function inspectError( options , error ) {
	var str = '' , stack , type , code ;

	if ( arguments.length < 2 ) { error = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( ! ( error instanceof Error ) ) {
		str += '[not an Error] ' ;

		if ( typeof error === 'string' ) {
			let maxLength = 5000 ;

			if ( error.length > maxLength ) {
				str += options.style.errorMessage( escape.control( error.slice( 0 , maxLength - 1 ) , true ) ) + '…'
					+ options.style.length( '(' + error.length + ' - TRUNCATED)' )
					+ options.style.newline ;
			}
			else {
				str += options.style.errorMessage( escape.control( error , true ) )
					+ options.style.newline ;
			}

			return str ;
		}
		else if ( ! error || typeof error !== 'object' || ! error.name || typeof error.name !== 'string' || ! error.message || typeof error.message !== 'string' ) {
			str += inspect( options , error ) ;
			return str ;
		}

		// It's an object, but it's compatible with Error, so we can move on...
	}

	if ( error.stack && ! options.noErrorStack ) { stack = inspectStack( options , error.stack ) ; }

	type = error.type || error.constructor.name ;
	code = error.code || error.name || error.errno || error.number ;

	str += options.style.errorType( type ) +
		( code ? ' [' + options.style.errorType( code ) + ']' : '' ) + ': ' ;
	str += options.style.errorMessage( error.message ) + '\n' ;

	if ( stack ) { str += options.style.errorStack( stack ) + '\n' ; }

	if ( error.from ) {
		str += options.style.newline + options.style.errorFromMessage( 'From error:' ) + options.style.newline + inspectError( options , error.from ) ;
	}

	return str ;
}

exports.inspectError = inspectError ;



function inspectStack( options , stack ) {
	if ( arguments.length < 2 ) { stack = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( ! stack ) { return ; }

	if ( ( options.browser || process.browser ) && stack.indexOf( '@' ) !== -1 ) {
		// Assume a Firefox-compatible stack-trace here...
		stack = stack
			.replace( /[</]*(?=@)/g , '' )	// Firefox output some WTF </</</</< stuff in its stack trace -- removing that
			.replace(
				/^\s*([^@]*)\s*@\s*([^\n]*)(?::([0-9]+):([0-9]+))?$/mg ,
				( matches , method , file , line , column ) => {
					return options.style.errorStack( '    at ' ) +
						( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
						options.style.errorStack( '(' ) +
						( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
						( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
						( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
						options.style.errorStack( ')' ) ;
				}
			) ;
	}
	else {
		stack = stack.replace( /^[^\n]*\n/ , '' ) ;
		stack = stack.replace(
			/^\s*(at)\s+(?:(?:(async|new)\s+)?([^\s:()[\]\n]+(?:\([^)]+\))?)\s)?(?:\[as ([^\s:()[\]\n]+)\]\s)?(?:\(?([^:()[\]\n]+):([0-9]+):([0-9]+)\)?)?$/mg ,
			( matches , at , keyword , method , as , file , line , column ) => {
				return options.style.errorStack( '    at ' ) +
					( keyword ? options.style.errorStackKeyword( keyword ) + ' ' : '' ) +
					( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
					( as ? options.style.errorStack( '[as ' ) + options.style.errorStackMethodAs( as ) + options.style.errorStack( '] ' ) : '' ) +
					options.style.errorStack( '(' ) +
					( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
					( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
					( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
					options.style.errorStack( ')' ) ;
			}
		) ;
	}

	return stack ;
}

exports.inspectStack = inspectStack ;



// Inspect's styles

var inspectStyle = {} ;

var inspectStyleNoop = str => str ;



inspectStyle.none = {
	trim: false ,
	tab: '    ' ,
	newline: '\n' ,
	comma: '' ,
	limit: inspectStyleNoop ,
	type: str => '<' + str + '>' ,
	constant: inspectStyleNoop ,
	funcName: inspectStyleNoop ,
	constructorName: str => '<' + str + '>' ,
	length: inspectStyleNoop ,
	key: inspectStyleNoop ,
	index: str => '[' + str + '] ' ,
	number: inspectStyleNoop ,
	inspect: inspectStyleNoop ,
	string: inspectStyleNoop ,
	errorType: inspectStyleNoop ,
	errorMessage: inspectStyleNoop ,
	errorStack: inspectStyleNoop ,
	errorStackKeyword: inspectStyleNoop ,
	errorStackMethod: inspectStyleNoop ,
	errorStackMethodAs: inspectStyleNoop ,
	errorStackFile: inspectStyleNoop ,
	errorStackLine: inspectStyleNoop ,
	errorStackColumn: inspectStyleNoop ,
	errorFromMessage: inspectStyleNoop ,
	truncate: ( str , maxLength ) => str.slice( 0 , maxLength - 1 ) + '…'
} ;



inspectStyle.inline = Object.assign( {} , inspectStyle.none , {
	trim: true ,
	tab: '' ,
	newline: ' ' ,
	comma: ', ' ,
	length: () => '' ,
	index: () => ''
	//type: () => '' ,
} ) ;



inspectStyle.color = Object.assign( {} , inspectStyle.none , {
	limit: str => ansi.bold + ansi.brightRed + str + ansi.reset ,
	type: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	constant: str => ansi.cyan + str + ansi.reset ,
	funcName: str => ansi.italic + ansi.magenta + str + ansi.reset ,
	constructorName: str => ansi.magenta + str + ansi.reset ,
	length: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	key: str => ansi.green + str + ansi.reset ,
	index: str => ansi.blue + '[' + str + ']' + ansi.reset + ' ' ,
	number: str => ansi.cyan + str + ansi.reset ,
	inspect: str => ansi.cyan + str + ansi.reset ,
	string: str => ansi.blue + str + ansi.reset ,
	errorType: str => ansi.red + ansi.bold + str + ansi.reset ,
	errorMessage: str => ansi.red + ansi.italic + str + ansi.reset ,
	errorStack: str => ansi.brightBlack + str + ansi.reset ,
	errorStackKeyword: str => ansi.italic + ansi.bold + str + ansi.reset ,
	errorStackMethod: str => ansi.brightYellow + str + ansi.reset ,
	errorStackMethodAs: str => ansi.yellow + str + ansi.reset ,
	errorStackFile: str => ansi.brightCyan + str + ansi.reset ,
	errorStackLine: str => ansi.blue + str + ansi.reset ,
	errorStackColumn: str => ansi.magenta + str + ansi.reset ,
	errorFromMessage: str => ansi.yellow + ansi.underline + str + ansi.reset ,
	truncate: ( str , maxLength ) => {
		var trail = ansi.gray + '…' + ansi.reset ;
		str = str.slice( 0 , maxLength - trail.length ) ;

		// Search for an ansi escape sequence at the end, that could be truncated.
		// The longest one is '\x1b[107m': 6 characters.
		var lastEscape = str.lastIndexOf( '\x1b' ) ;
		if ( lastEscape >= str.length - 6 ) { str = str.slice( 0 , lastEscape ) ; }

		return str + trail ;
	}
} ) ;



inspectStyle.html = Object.assign( {} , inspectStyle.none , {
	tab: '&nbsp;&nbsp;&nbsp;&nbsp;' ,
	newline: '<br />' ,
	limit: str => '<span style="color:red">' + str + '</span>' ,
	type: str => '<i style="color:gray">' + str + '</i>' ,
	constant: str => '<span style="color:cyan">' + str + '</span>' ,
	funcName: str => '<i style="color:magenta">' + str + '</i>' ,
	constructorName: str => '<span style="color:magenta">' + str + '</span>' ,
	length: str => '<i style="color:gray">' + str + '</i>' ,
	key: str => '<span style="color:green">' + str + '</span>' ,
	index: str => '<span style="color:blue">[' + str + ']</span> ' ,
	number: str => '<span style="color:cyan">' + str + '</span>' ,
	inspect: str => '<span style="color:cyan">' + str + '</span>' ,
	string: str => '<span style="color:blue">' + str + '</span>' ,
	errorType: str => '<span style="color:red">' + str + '</span>' ,
	errorMessage: str => '<span style="color:red">' + str + '</span>' ,
	errorStack: str => '<span style="color:gray">' + str + '</span>' ,
	errorStackKeyword: str => '<i>' + str + '</i>' ,
	errorStackMethod: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackMethodAs: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackFile: str => '<span style="color:cyan">' + str + '</span>' ,
	errorStackLine: str => '<span style="color:blue">' + str + '</span>' ,
	errorStackColumn: str => '<span style="color:gray">' + str + '</span>' ,
	errorFromMessage: str => '<span style="color:yellow">' + str + '</span>'
} ) ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/regexp.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





var escape = require( './escape.js' ) ;



exports.regexp = {} ;



exports.regexp.array2alternatives = function array2alternatives( array ) {
	var i , sorted = array.slice() ;

	// Sort descending by string length
	sorted.sort( ( a , b ) => {
		return b.length - a.length ;
	} ) ;

	// Then escape what should be
	for ( i = 0 ; i < sorted.length ; i ++ ) {
		sorted[ i ] = escape.regExpPattern( sorted[ i ] ) ;
	}

	return sorted.join( '|' ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/camel.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





var camel = {} ;
module.exports = camel ;



// Transform alphanum separated by underscore or minus to camel case
camel.toCamelCase = function( str , preserveUpperCase = false , initialUpperCase = false ) {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	return str.replace(
		/(?:^[\s_-]*|([\s_-]+))(([^\s_-]?)([^\s_-]*))/g ,
		( match , isNotFirstWord , word , firstLetter , endOfWord ) => {
			if ( preserveUpperCase ) {
				if ( ! isNotFirstWord && ! initialUpperCase ) { return word ; }
				if ( ! firstLetter ) { return '' ; }
				return firstLetter.toUpperCase() + endOfWord ;
			}

			if ( ! isNotFirstWord && ! initialUpperCase ) { return word.toLowerCase() ; }
			if ( ! firstLetter ) { return '' ; }
			return firstLetter.toUpperCase() + endOfWord.toLowerCase() ;
		}
	) ;
} ;



camel.camelCaseToSeparated = function( str , separator = ' ' , acronym = true ) {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	if ( ! acronym ) {
		return str.replace( /^([A-Z])|([A-Z])/g , ( match , firstLetter , letter ) => {
			if ( firstLetter ) { return firstLetter.toLowerCase() ; }
			return separator + letter.toLowerCase() ;
		} ) ;
	}

	// (^)? and (^)? does not work, so we have to use (?:(^)|)) and (?:($)|)) to capture end or not
	return str.replace( /(?:(^)|)([A-Z]+)(?:($)|(?=[a-z]))/g , ( match , isStart , letters , isEnd ) => {
		isStart = isStart === '' ;
		isEnd = isEnd === '' ;

		var prefix = isStart ? '' : separator ;

		return letters.length === 1 ? prefix + letters.toLowerCase() :
			isEnd ? prefix + letters :
			letters.length === 2 ? prefix + letters[ 0 ].toLowerCase() + separator + letters[ 1 ].toLowerCase() :
			prefix + letters.slice( 0 , -1 ) + separator + letters.slice( -1 ).toLowerCase() ;
	} ) ;
} ;



// Transform camel case to alphanum separated by minus
camel.camelCaseToDash =
camel.camelCaseToDashed = ( str ) => camel.camelCaseToSeparated( str , '-' , false ) ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/latinize.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const latinizeMap = require( './json-data/latinize-map.json' ) ;

module.exports = function( str ) {
	return str.replace( /[^\u0000-\u007e]/g , ( c ) => { return latinizeMap[ c ] || c ; } ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/toTitleCase.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const DEFAULT_OPTIONS = {
	underscoreToSpace: true ,
	lowerCaseWords: new Set( [
		// Articles
		'a' , 'an' , 'the' ,
		// Conjunctions (only coordinating conjunctions, maybe we will have to add subordinating and correlative conjunctions)
		'for' , 'and' , 'nor' , 'but' , 'or' , 'yet' , 'so' ,
		// Prepositions (there are more, but usually only preposition with 2 or 3 letters are lower-cased)
		'of' , 'on' , 'off' , 'in' , 'into' , 'by' , 'with' , 'to' , 'at' , 'up' , 'down' , 'as'
	] )
} ;



module.exports = ( str , options = DEFAULT_OPTIONS ) => {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	// Manage options
	var dashToSpace = options.dashToSpace ?? DEFAULT_OPTIONS.dashToSpace ,
		underscoreToSpace = options.underscoreToSpace ?? DEFAULT_OPTIONS.underscoreToSpace ,
		zealous = options.zealous ?? DEFAULT_OPTIONS.zealous ,
		preserveAllCaps = options.preserveAllCaps ?? DEFAULT_OPTIONS.preserveAllCaps ,
		lowerCaseWords = options.lowerCaseWords ?? DEFAULT_OPTIONS.lowerCaseWords ;

	lowerCaseWords =
		lowerCaseWords instanceof Set ? lowerCaseWords :
		Array.isArray( lowerCaseWords ) ? new Set( lowerCaseWords ) :
		null ;


	if ( dashToSpace ) { str = str.replace( /-+/g , ' ' ) ; }
	if ( underscoreToSpace ) { str = str.replace( /_+/g , ' ' ) ; }

	// Squash multiple spaces into only one, and trim
	str = str.replace( / +/g , ' ' ).trim() ;


	return str.replace( /[^\s_-]+/g , ( part , position ) => {
		// Check word that must be lower-cased (excluding the first and the last word)
		if ( lowerCaseWords && position && position + part.length < str.length ) {
			let lowerCased = part.toLowerCase() ;
			if ( lowerCaseWords.has( lowerCased ) ) { return lowerCased ; }
		}

		if ( zealous ) {
			if ( preserveAllCaps && part === part.toUpperCase() ) {
				// This is a ALLCAPS word
				return part ;
			}

			return part[ 0 ].toUpperCase() + part.slice( 1 ).toLowerCase() ;
		}

		return part[ 0 ].toUpperCase() + part.slice( 1 ) ;
	} ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/wordwrap.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const unicode = require( './unicode.js' ) ;



// French typography rules with '!', '?', ':' and ';'
const FRENCH_DOUBLE_GRAPH_TYPO = {
	'!': true ,
	'?': true ,
	':': true ,
	';': true
} ;



/*
	.wordwrap( str , width )
	.wordwrap( str , options )

	str: the string to process
	width: the max width (default to 80)
	options: object, where:
		width: the max width (default to 80)
		glue: (optional) the char used to join lines, by default: lines are joined with '\n',
		noJoin: (optional) if set: don't join, instead return an array of lines
		offset: (optional) offset of the first-line
		updateOffset: (optional) if set, options.offset is updated with the last line width
		noTrim: (optional) if set, don't right-trim lines, if not set, right-trim all lines except the last
		fill: (optional) if set, fill the remaining width with space (it forces noTrim)
		skipFn: (optional) a function used to skip a whole sequence, useful for special sequences
			like ANSI escape sequence, and so on...
		charWidthFn: (optional) a function used to compute the width of one char/group of chars
		regroupFn: (optional) a function used to regroup chars together
*/
module.exports = function wordwrap( str , options ) {
	var start = 0 , end , skipEnd , lineWidth , currentLine , currentWidth , length ,
		lastEnd , lastWidth , lastWasSpace , charWidthFn ,
		explicitNewLine = true ,
		strArray = unicode.toArray( str ) ,
		trimNewLine = false ,
		line , lines = [] ;

	if ( typeof options !== 'object' ) {
		options = { width: options } ;
	}

	// Catch NaN, zero or negative and non-number
	if ( ! options.width || typeof options.width !== 'number' || options.width <= 0 ) { options.width = 80 ; }

	lineWidth = options.offset ? options.width - options.offset : options.width ;

	if ( typeof options.glue !== 'string' ) { options.glue = '\n' ; }

	if ( options.regroupFn ) {
		strArray = options.regroupFn( strArray ) ;
		// If char are grouped, use unicode.width() as a default
		charWidthFn = options.charWidthFn || unicode.width ;
	}
	else {
		// If char are not grouped, use unicode.charWidth() as a default
		charWidthFn = options.charWidthFn || unicode.charWidth ;
	}

	length = strArray.length ;

	var getNextLine = () => {
		//originStart = start ;

		if ( ! explicitNewLine || trimNewLine ) {
			// Find the first non-space char
			while ( strArray[ start ] === ' ' ) { start ++ ; }

			if ( trimNewLine && strArray[ start ] === '\n' ) {
				explicitNewLine = true ;
				start ++ ;
				/*
				originStart = start ;
				while ( strArray[ start ] === ' ' ) { start ++ ; }
				*/
			}
		}

		if ( start >= length ) { return null ; }

		explicitNewLine = false ;
		trimNewLine = false ;
		lastWasSpace = false ;
		end = lastEnd = start ;
		currentWidth = lastWidth = 0 ;

		for ( ;; ) {
			if ( end >= length ) {
				return strArray.slice( start , end ).join( '' ) ;
			}

			if ( strArray[ end ] === '\n' ) {
				explicitNewLine = true ;
				currentLine = strArray.slice( start , end ++ ).join( '' ) ;

				if ( options.fill ) {
					currentLine += ' '.repeat( lineWidth - currentWidth ) ;
				}

				return currentLine ;
			}

			if ( options.skipFn ) {
				skipEnd = options.skipFn( strArray , end ) ;
				if ( skipEnd !== end ) {
					end = skipEnd ;
					continue ;
				}
			}

			if ( strArray[ end ] === ' ' && ! lastWasSpace && ! FRENCH_DOUBLE_GRAPH_TYPO[ strArray[ end + 1 ] ] ) {
				// This is the first space of a group of space
				lastEnd = end ;
				lastWidth = currentWidth ;
			}
			else {
				lastWasSpace = false ;
			}

			currentWidth += charWidthFn( strArray[ end ] ) ;

			if ( currentWidth > lineWidth ) {
				// If lastEnd === start, this is a word that takes the whole line: cut it
				// If not, use the lastEnd
				trimNewLine = true ;

				if ( lastEnd !== start ) {
					end = lastEnd ;
				}
				else if ( lineWidth < options.width ) {
					// This is the first line with an offset, so just start over in line two
					end = start ;
					return '' ;
				}

				currentLine = strArray.slice( start , end ).join( '' ) ;

				if ( options.fill ) {
					currentLine += ' '.repeat( lineWidth - lastWidth ) ;
				}

				return currentLine ;
			}

			// Do not move that inside the for(;;), some part are using a continue statement and manage the end value by themself
			end ++ ;
		}
	} ;

	while ( start < length && ( line = getNextLine() ) !== null ) {
		lines.push( line ) ;
		start = end ;
		lineWidth = options.width ;
	}

	// If it ends with an explicit newline, we have to reproduce it now!
	if ( explicitNewLine ) { lines.push( '' ) ; }

	if ( ! options.noTrim && ! options.fill ) {
		lines = lines.map( ( line_ , index ) => index === lines.length - 1 ? line_ : line_.trimRight() ) ;
	}

	if ( ! options.noJoin ) { lines = lines.join( options.glue ) ; }

	if ( options.updateOffset ) { options.offset = currentWidth ; }

	return lines ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/naturalSort.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const CONTROL_CLASS = 1 ;
const WORD_SEPARATOR_CLASS = 2 ;
const LETTER_CLASS = 3 ;
const NUMBER_CLASS = 4 ;
const SYMBOL_CLASS = 5 ;



function getCharacterClass( char , code ) {
	if ( isWordSeparator( code ) ) { return WORD_SEPARATOR_CLASS ; }
	if ( code <= 0x1f || code === 0x7f ) { return CONTROL_CLASS ; }
	if ( isNumber( code ) ) { return NUMBER_CLASS ; }
	// Here we assume that a letter is a char with a “case”
	if ( char.toUpperCase() !== char.toLowerCase() ) { return LETTER_CLASS ; }
	return SYMBOL_CLASS ;
}



function isWordSeparator( code ) {
	if (
		// space, tab, no-break space
		code === 0x20 || code === 0x09 || code === 0xa0 ||
		// hyphen, underscore
		code === 0x2d || code === 0x5f
	) {
		return true ;
	}

	return false ;
}



function isNumber( code ) {
	if ( code >= 0x30 && code <= 0x39 ) { return true ; }
	return false ;
}



function naturalSort( a , b ) {
	a = '' + a ;
	b = '' + b ;

	var aIndex , aEndIndex , aChar , aCode , aClass , aCharLc , aNumber ,
		aTrim = a.trim() ,
		aLength = aTrim.length ,
		bIndex , bEndIndex , bChar , bCode , bClass , bCharLc , bNumber ,
		bTrim = b.trim() ,
		bLength = bTrim.length ,
		advantage = 0 ;

	for ( aIndex = bIndex = 0 ; aIndex < aLength && bIndex < bLength ; aIndex ++ , bIndex ++ ) {
		aChar = aTrim[ aIndex ] ;
		bChar = bTrim[ bIndex ] ;
		aCode = aTrim.charCodeAt( aIndex ) ;
		bCode = bTrim.charCodeAt( bIndex ) ;
		aClass = getCharacterClass( aChar , aCode ) ;
		bClass = getCharacterClass( bChar , bCode ) ;
		if ( aClass !== bClass ) { return aClass - bClass ; }

		switch ( aClass ) {
			case WORD_SEPARATOR_CLASS :
				// Eat all white chars and continue
				while ( isWordSeparator( aTrim.charCodeAt( aIndex + 1 ) ) ) { aIndex ++ ; }
				while ( isWordSeparator( bTrim.charCodeAt( bIndex + 1 ) ) ) { bIndex ++ ; }
				break ;

			case CONTROL_CLASS :
			case SYMBOL_CLASS :
				if ( aCode !== bCode ) { return aCode - bCode ; }
				break ;

			case LETTER_CLASS :
				aCharLc = aChar.toLowerCase() ;
				bCharLc = bChar.toLowerCase() ;
				if ( aCharLc !== bCharLc ) { return aCharLc > bCharLc ? 1 : -1 ; }

				// As a last resort, we would sort uppercase first
				if ( ! advantage && aChar !== bChar ) { advantage = aChar !== aCharLc ? -1 : 1 ; }

				break ;

			case NUMBER_CLASS :
				// Lookup for a whole number and parse it
				aEndIndex = aIndex + 1 ;
				while ( isNumber( aTrim.charCodeAt( aEndIndex ) ) ) { aEndIndex ++ ; }
				aNumber = parseFloat( aTrim.slice( aIndex , aEndIndex ) ) ;

				bEndIndex = bIndex + 1 ;
				while ( isNumber( bTrim.charCodeAt( bEndIndex ) ) ) { bEndIndex ++ ; }
				bNumber = parseFloat( bTrim.slice( bIndex , bEndIndex ) ) ;

				if ( aNumber !== bNumber ) { return aNumber - bNumber ; }

				// As a last resort, we would sort the number with the less char first
				if ( ! advantage && aEndIndex - aIndex !== bEndIndex - bIndex ) { advantage = ( aEndIndex - aIndex ) - ( bEndIndex - bIndex ) ; }

				// Advance the index at the end of the number area
				aIndex = aEndIndex - 1 ;
				bIndex = bEndIndex - 1 ;
				break ;
		}
	}

	// If there was an “advantage”, use it now
	if ( advantage ) { return advantage ; }

	// Finally, sort by remaining char, or by trimmed length or by full length
	return ( aLength - aIndex ) - ( bLength - bIndex ) || aLength - bLength || a.length - b.length ;
}

module.exports = naturalSort ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/fuzzy.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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




const fuzzy = {} ;
module.exports = fuzzy ;



fuzzy.score = ( input , pattern ) => {
	if ( input === pattern ) { return 1 ; }
	if ( input.length === 0 || pattern.length === 0 ) { return 0 ; }
	//return 1 - fuzzy.levenshtein( input , pattern ) / ( pattern.length >= input.length ? pattern.length : input.length ) ;
	return Math.max( 0 , 1 - fuzzy.levenshtein( input , pattern ) / pattern.length ) ;
} ;



const DEFAULT_SCORE_LIMIT = 0 ;
const DEFAULT_TOKEN_DISPARITY_PENALTY = 0.88 ;
// deltaRate should be just above tokenDisparityPenalty
const DEFAULT_DELTA_RATE = 0.9 ;



fuzzy.bestMatch = ( input , patterns , options = {} ) => {
	var bestScore = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		i , iMax , currentScore , currentPattern ,
		bestIndex = -1 ,
		bestPattern = null ;

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentScore = fuzzy.score( input , currentPattern ) ;
		if ( currentScore === 1 ) { return options.indexOf ? i : currentPattern ; }
		if ( currentScore > bestScore ) {
			bestScore = currentScore ;
			bestPattern = currentPattern ;
			bestIndex = i ;
		}
	}

	return options.indexOf ? bestIndex : bestPattern ;
} ;



fuzzy.topMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		deltaRate = options.deltaRate || DEFAULT_DELTA_RATE ,
		i , iMax , patternScores ;

	patternScores = patterns.map( ( pattern , index ) => ( { pattern , index , score: fuzzy.score( input , pattern ) } ) ) ;
	patternScores.sort( ( a , b ) => b.score - a.score ) ;

	//console.log( patternScores ) ;

	if ( patternScores[ 0 ].score <= scoreLimit ) { return [] ; }
	scoreLimit = Math.max( scoreLimit , patternScores[ 0 ].score * deltaRate ) ;

	for ( i = 1 , iMax = patternScores.length ; i < iMax ; i ++ ) {
		if ( patternScores[ i ].score < scoreLimit ) {
			patternScores.length = i ;
			break ;
		}
	}

	return options.indexOf ?
		patternScores.map( e => e.index ) :
		patternScores.map( e => e.pattern ) ;
} ;



const englishBlackList = new Set( [
	'a' , 'an' , 'the' , 'this' , 'that' , 'those' , 'some' ,
	'of' , 'in' , 'on' , 'at' ,
	'my' , 'your' , 'her' , 'his' , 'its' , 'our' , 'their'
] ) ;

function tokenize( str , blackList = englishBlackList ) {
	return str.split( /[ '"/|,:_-]+/g ).filter( s => s && ! blackList.has( s ) ) ;
}



// This is almost the same code than .topTokenMatch(): both must be in sync
fuzzy.bestTokenMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		tokenDisparityPenalty = options.tokenDisparityPenalty || DEFAULT_TOKEN_DISPARITY_PENALTY ,
		i , iMax , j , jMax , z , zMax ,
		currentPattern , currentPatternTokens , currentPatternToken , currentPatternScore ,
		bestPatternScore = scoreLimit ,
		//currentPatternScores = [] ,
		currentInputToken , currentScore ,
		inputTokens = tokenize( input ) ,
		bestScore ,
		bestIndex = -1 ,
		bestPattern = null ;

	//console.log( inputTokens ) ;
	if ( ! inputTokens.length || ! patterns.length ) { return options.indexOf ? bestIndex : bestPattern ; }

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentPatternTokens = tokenize( currentPattern ) ;
		//currentPatternScores.length = 0 ;
		currentPatternScore = 0 ;

		for ( j = 0 , jMax = inputTokens.length ; j < jMax ; j ++ ) {
			currentInputToken = inputTokens[ j ] ;
			bestScore = 0 ;

			for ( z = 0 , zMax = currentPatternTokens.length ; z < zMax ; z ++ ) {
				currentPatternToken = currentPatternTokens[ z ] ;
				currentScore = fuzzy.score( currentInputToken , currentPatternToken ) ;

				if ( currentScore > bestScore ) {
					bestScore = currentScore ;
					if ( currentScore === 1 ) { break ; }
				}
			}

			//currentPatternScores[ j ] = bestScore ;
			currentPatternScore += bestScore ;
		}

		//currentPatternScore = Math.hypot( ... currentPatternScores ) ;
		currentPatternScore /= inputTokens.length ;

		// Apply a small penalty if there isn't enough tokens
		if ( inputTokens.length !== currentPatternTokens.length ) {
			currentPatternScore *= tokenDisparityPenalty ** Math.abs( currentPatternTokens.length - inputTokens.length ) ;
		}

		//console.log( currentPattern + ': ' + currentPatternScore ) ;
		if ( currentPatternScore > bestPatternScore ) {
			bestPatternScore = currentPatternScore ;
			bestPattern = currentPattern ;
			bestIndex = i ;
		}
	}

	return options.indexOf ? bestIndex : bestPattern ;
} ;



// This is almost the same code than .bestTokenMatch(): both must be in sync
// deltaRate should be just above tokenDisparityPenalty
fuzzy.topTokenMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		tokenDisparityPenalty = options.tokenDisparityPenalty || DEFAULT_TOKEN_DISPARITY_PENALTY ,
		deltaRate = options.deltaRate || DEFAULT_DELTA_RATE ,
		i , iMax , j , jMax , z , zMax ,
		currentPattern , currentPatternTokens , currentPatternToken , currentPatternScore ,
		currentInputToken , currentScore ,
		inputTokens = tokenize( input ) ,
		bestScore ,
		patternScores = [] ;

	//console.log( inputTokens ) ;
	if ( ! inputTokens.length || ! patterns.length ) { return [] ; }

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentPatternTokens = tokenize( currentPattern ) ;
		//currentPatternScores.length = 0 ;
		currentPatternScore = 0 ;

		for ( j = 0 , jMax = inputTokens.length ; j < jMax ; j ++ ) {
			currentInputToken = inputTokens[ j ] ;
			bestScore = 0 ;

			for ( z = 0 , zMax = currentPatternTokens.length ; z < zMax ; z ++ ) {
				currentPatternToken = currentPatternTokens[ z ] ;
				currentScore = fuzzy.score( currentInputToken , currentPatternToken ) ;

				if ( currentScore > bestScore ) {
					bestScore = currentScore ;
					if ( currentScore === 1 ) { break ; }
				}
			}

			//currentPatternScores[ j ] = bestScore ;
			currentPatternScore += bestScore ;
		}

		//currentPatternScore = Math.hypot( ... currentPatternScores ) ;
		currentPatternScore /= inputTokens.length ;

		// Apply a small penalty if there isn't enough tokens
		if ( inputTokens.length !== currentPatternTokens.length ) {
			currentPatternScore *= tokenDisparityPenalty ** Math.abs( currentPatternTokens.length - inputTokens.length ) ;
		}

		patternScores.push( { pattern: currentPattern , index: i , score: currentPatternScore } ) ;
	}

	patternScores.sort( ( a , b ) => b.score - a.score ) ;
	//console.log( "Before truncating:" , patternScores ) ;

	if ( patternScores[ 0 ].score <= scoreLimit ) { return [] ; }
	scoreLimit = Math.max( scoreLimit , patternScores[ 0 ].score * deltaRate ) ;

	for ( i = 1 , iMax = patternScores.length ; i < iMax ; i ++ ) {
		if ( patternScores[ i ].score < scoreLimit ) {
			patternScores.length = i ;
			break ;
		}
	}

	//console.log( "After truncating:" , patternScores ) ;

	return options.indexOf ?
		patternScores.map( e => e.index ) :
		patternScores.map( e => e.pattern ) ;
} ;



// The .levenshtein() function is derivated from https://github.com/sindresorhus/leven by Sindre Sorhus (MIT License)
const _tracker = [] ;
const _leftCharCodeCache = [] ;

fuzzy.levenshtein = ( left , right ) => {
	if ( left === right ) { return 0 ; }

	// Swapping the strings if `a` is longer than `b` so we know which one is the
	// shortest & which one is the longest
	if ( left.length > right.length ) {
		let swap = left ;
		left = right ;
		right = swap ;
	}

	let leftLength = left.length ;
	let rightLength = right.length ;

	// Performing suffix trimming:
	// We can linearly drop suffix common to both strings since they
	// don't increase distance at all
	while ( leftLength > 0 && ( left.charCodeAt( leftLength - 1 ) === right.charCodeAt( rightLength - 1 ) ) ) {
		leftLength -- ;
		rightLength -- ;
	}

	// Performing prefix trimming
	// We can linearly drop prefix common to both strings since they
	// don't increase distance at all
	let start = 0 ;

	while ( start < leftLength && ( left.charCodeAt( start ) === right.charCodeAt( start ) ) ) {
		start ++ ;
	}

	leftLength -= start ;
	rightLength -= start ;

	if ( leftLength === 0 ) { return rightLength ; }

	let rightCharCode ;
	let result ;
	let temp ;
	let temp2 ;
	let i = 0 ;
	let j = 0 ;

	while ( i < leftLength ) {
		_leftCharCodeCache[ i ] = left.charCodeAt( start + i ) ;
		_tracker[ i ] = ++ i ;
	}

	while ( j < rightLength ) {
		rightCharCode = right.charCodeAt( start + j ) ;
		temp = j ++ ;
		result = j ;

		for ( i = 0 ; i < leftLength ; i ++ ) {
			temp2 = rightCharCode === _leftCharCodeCache[ i ] ? temp : temp + 1 ;
			temp = _tracker[ i ] ;
			// eslint-disable-next-line no-nested-ternary
			result = _tracker[ i ] = temp > result   ?   temp2 > result ? result + 1 : temp2   :   temp2 > temp ? temp + 1 : temp2 ;
		}
	}

	return result ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/StringNumber.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





/*
	Number formatting class.
	.format() should entirely use it for everything related to number formatting.
	It avoids unsolvable rounding error with epsilon.
	It is dedicated for number display, not for computing.
*/



const NUMERALS = [
	'0' , '1' , '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' ,
	'a' , 'b' , 'c' , 'd' , 'e' , 'f' ,
	'g' , 'h' , 'i' , 'j' , 'k' , 'l' , 'm' , 'n' , 'o' , 'p' , 'q' , 'r' , 's' , 't' , 'u' , 'v' , 'w' , 'x' , 'y' , 'z'
] ;

//const NUMERAL_MAP = buildNumeralMap( NUMERALS ) ;



function StringNumber( number , options = {} ) {
	this.sign = 1 ;
	this.digits = [] ;
	this.exposant = 0 ;
	this.special = null ;	// It stores special values like NaN, Infinity, etc

	this.decimalSeparator = options.decimalSeparator ?? '.' ;
	this.forceDecimalSeparator = !! options.forceDecimalSeparator ;
	this.groupSeparator = options.groupSeparator ?? '' ;

	this.numerals = options.numerals ?? NUMERALS ;
	this.numeralZero = options.numeralZero ?? null ;	// Special numeral when the result is EXACTLY 0 (used for Roman Numerals)
	this.placeNumerals = options.placeNumerals ?? null ;
	//this.numeralMap = NUMERAL_MAP ;
	//if ( options.numerals ) { this.numeralMap = buildNumeralMap( options.numerals ) ; }

	this.set( number ) ;
}

module.exports = StringNumber ;



/*
function buildNumeralMap( numbers ) {
	var map = new Map() ;

	for ( let i = 0 ; i < numbers.length ; i ++ ) {
		let number = numbers[ i ] ;
		map.set( NUMERALS[ i ] , numbers[ i ] ) ;
	}

	return map ;
}
*/



StringNumber.prototype.set = function( number ) {
	var matches , v , i , iMax , index , hasNonZeroHead , tailIndex ;

	number = + number ;

	// Reset anything, if it was already used...
	this.sign = 1 ;
	this.digits.length = 0 ;
	this.exposant = 0 ;
	this.special = null ;

	if ( ! Number.isFinite( number ) ) {
		this.special = number ;
		return null ;
	}

	number = '' + number ;
	matches = number.match( /(-)?([0-9]+)(?:.([0-9]+))?(?:e([+-][0-9]+))?/ ) ;
	if ( ! matches ) { throw new Error( 'Unexpected error' ) ; }

	this.sign = matches[ 1 ] ? -1 : 1 ;
	this.exposant = matches[ 2 ].length + ( parseInt( matches[ 4 ] , 10 ) || 0 ) ;

	// Copy each digits and cast them back into a number
	index = 0 ;
	hasNonZeroHead = false ;
	tailIndex = 0 ;	// used to cut trailing zero

	for ( i = 0 , iMax = matches[ 2 ].length ; i < iMax ; i ++ ) {
		v = + matches[ 2 ][ i ] ;
		if ( v !== 0 ) {
			hasNonZeroHead = true ;
			this.digits[ index ] = v ;
			index ++ ;
			tailIndex = index ;
		}
		else if ( hasNonZeroHead ) {
			this.digits[ index ] = v ;
			index ++ ;
		}
		else {
			this.exposant -- ;
		}
	}

	if ( matches[ 3 ] ) {
		for ( i = 0 , iMax = matches[ 3 ].length ; i < iMax ; i ++ ) {
			v = + matches[ 3 ][ i ] ;

			if ( v !== 0 ) {
				hasNonZeroHead = true ;
				this.digits[ index ] = v ;
				index ++ ;
				tailIndex = index ;
			}
			else if ( hasNonZeroHead ) {
				this.digits[ index ] = v ;
				index ++ ;
			}
			else {
				this.exposant -- ;
			}
		}
	}

	if ( tailIndex !== index ) {
		this.digits.length = tailIndex ;
	}
} ;



StringNumber.prototype.toNumber = function() {
	// Using a string representation
	if ( this.special !== null ) { return this.special ; }
	return parseFloat( ( this.sign < 0 ? '-' : '' ) + '0.' + this.digits.join( '' ) + 'e' + this.exposant ) ;
} ;



StringNumber.prototype.toString = function( ... args ) {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( this.exposant > 20 || this.exposant < -20 ) { return this.toScientificString( ... args ) ; }
	return this.toNoExpString( ... args ) ;
} ;



StringNumber.prototype.toExponential =
StringNumber.prototype.toExponentialString = function() {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;
	if ( ! this.digits.length ) { return str + '0' ; }

	str += this.digits[ 0 ] ;

	if ( this.digits.length > 1 ) {
		str += this.decimalSeparator + this.digits.join( '' ).slice( 1 ) ;
	}

	str += 'e' + ( this.exposant > 0 ? '+' : '' ) + ( this.exposant - 1 ) ;
	return str ;
} ;



const SUPER_NUMBER = [ '⁰' , '¹' , '²' , '³' , '⁴' , '⁵' , '⁶' , '⁷' , '⁸' , '⁹' ] ;
const SUPER_PLUS = '⁺' ;
const SUPER_MINUS = '⁻' ;
const ZERO_CHAR_CODE = '0'.charCodeAt( 0 ) ;

StringNumber.prototype.toScientific =
StringNumber.prototype.toScientificString = function() {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;
	if ( ! this.digits.length ) { return str + '0' ; }

	str += this.digits[ 0 ] ;

	if ( this.digits.length > 1 ) {
		str += this.decimalSeparator + this.digits.join( '' ).slice( 1 ) ;
	}

	var exposantStr =
		( this.exposant <= 0 ? SUPER_MINUS : '' ) +
		( '' + Math.abs( this.exposant - 1 ) ).split( '' ).map( c => SUPER_NUMBER[ c.charCodeAt( 0 ) - ZERO_CHAR_CODE ] )
			.join( '' ) ;

	str += ' × 10' + exposantStr ;
	return str ;
} ;



// leadingZero = minimal number of numbers before the dot, they will be left-padded with zero if needed.
// trailingZero = minimal number of numbers after the dot, they will be right-padded with zero if needed.
// onlyIfDecimal: set it to true if you don't want right padding zero when there is no decimal
StringNumber.prototype.toNoExp =
StringNumber.prototype.toNoExpString = function( leadingZero = 1 , trailingZero = 0 , onlyIfDecimal = false , forcePlusSign = false , exposant = this.exposant ) {
	if ( this.special !== null ) { return '' + this.special ; }

	var integerDigits = [] , decimalDigits = [] ,
		str = this.sign < 0 ? '-' : forcePlusSign ? '+' : '' ;

	if ( ! this.digits.length ) {
		if ( leadingZero > 1 ) {
			this.fillZeroes( integerDigits , leadingZero - 1 , leadingZero ) ;
		}

		integerDigits.push( this.numeralZero ?? this.placeNumerals?.[ 0 ]?.[ 0 ] ?? this.numerals[ 0 ] ) ;

		if ( trailingZero && ! onlyIfDecimal ) {
			this.fillZeroes( decimalDigits , trailingZero ) ;
		}
	}
	else if ( exposant <= 0 ) {
		// This number is of type 0.[0...]xyz
		this.fillZeroes( integerDigits , leadingZero ) ;

		this.fillZeroes( decimalDigits , -exposant , trailingZero - this.digits.length ) ;
		this.appendNumerals( decimalDigits , this.digits , undefined , undefined , -exposant - 1 ) ;

		if ( trailingZero && this.digits.length - exposant < trailingZero ) {
			this.fillZeroes( decimalDigits , trailingZero - this.digits.length + exposant ) ;
		}
	}
	else if ( exposant >= this.digits.length ) {
		// This number is of type xyz[0...]
		if ( exposant < leadingZero ) { this.fillZeroes( integerDigits , leadingZero - exposant , exposant - 1 ) ; }
		this.appendNumerals( integerDigits , this.digits , undefined , undefined , exposant - 1 ) ;
		this.fillZeroes( integerDigits , exposant - this.digits.length ) ;

		if ( trailingZero && ! onlyIfDecimal ) {
			this.fillZeroes( decimalDigits , trailingZero ) ;
		}
	}
	else {
		// Here the digits are splitted with a dot in the middle
		if ( exposant < leadingZero ) { this.fillZeroes( integerDigits , leadingZero - exposant ) ; }
		this.appendNumerals( integerDigits , this.digits , 0 , exposant , exposant - 1 ) ;

		this.appendNumerals( decimalDigits , this.digits , exposant , undefined , this.digits.length - exposant ) ;

		if (
			trailingZero && this.digits.length - exposant < trailingZero
			&& ( ! onlyIfDecimal || this.digits.length - exposant > 0 )
		) {
			this.fillZeroes( decimalDigits , trailingZero - this.digits.length + exposant ) ;
		}
	}

	str += this.groupSeparator ?
		this.groupDigits( integerDigits , this.groupSeparator ) :
		integerDigits.join( '' ) ;

	if ( decimalDigits.length ) {
		str += this.decimalSeparator + (
			this.decimalGroupSeparator ?
				this.groupDigits( decimalDigits , this.decimalGroupSeparator ) :
				decimalDigits.join( '' )
		) ;
	}
	else if ( this.forceDecimalSeparator ) {
		str += this.decimalSeparator ;
	}

	return str ;
} ;



// Metric prefix
const MUL_PREFIX = [ '' , 'k' , 'M' , 'G' , 'T' , 'P' , 'E' , 'Z' , 'Y' ] ;
const SUB_MUL_PREFIX = [ '' , 'm' , 'µ' , 'n' , 'p' , 'f' , 'a' , 'z' , 'y' ] ;



StringNumber.prototype.toMetric =
StringNumber.prototype.toMetricString = function( leadingZero = 1 , trailingZero = 0 , onlyIfDecimal = false , forcePlusSign = false ) {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( ! this.digits.length ) { return this.sign > 0 ? '0' : '-0' ; }

	var prefix = '' , fakeExposant ;

	if ( this.exposant > 0 ) {
		fakeExposant = 1 + ( ( this.exposant - 1 ) % 3 ) ;
		prefix = MUL_PREFIX[ Math.floor( ( this.exposant - 1 ) / 3 ) ] ;
		// Fallback to scientific if the number is to big
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}
	else {
		fakeExposant = 3 - ( -this.exposant % 3 ) ;
		prefix = SUB_MUL_PREFIX[ 1 + Math.floor( -this.exposant / 3 ) ] ;
		// Fallback to scientific if the number is to small
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}

	return this.toNoExpString( leadingZero , trailingZero , onlyIfDecimal , forcePlusSign , fakeExposant ) + prefix ;
} ;



/*
	type: 0=round, -1=floor, 1=ceil
	Floor if < .99999
	Ceil if >= .00001
*/
StringNumber.prototype.precision = function( n , type = 0 ) {
	var roundUp ;

	if ( this.special !== null || n >= this.digits.length ) { return this ; }

	if ( n < 0 ) { this.digits.length = 0 ; return this ; }

	type *= this.sign ;

	if ( type < 0 ) {
		roundUp =
			this.digits.length > n + 4
			&& this.digits[ n ] === 9 && this.digits[ n + 1 ] === 9
			&& this.digits[ n + 2 ] === 9 && this.digits[ n + 3 ] === 9 && this.digits[ n + 4 ] === 9 ;
	}
	else if ( type > 0 ) {
		roundUp =
			this.digits[ n ] > 0 || this.digits[ n + 1 ] > 0
			|| this.digits[ n + 2 ] > 0 || this.digits[ n + 3 ] > 0 || this.digits[ n + 4 ] > 0 ;
	}
	else {
		roundUp = this.digits[ n ] >= 5 ;
	}

	if ( roundUp ) {
		let i = n - 1 ,
			done = false ;

		// Cascading increase
		for ( ; i >= 0 ; i -- ) {
			if ( this.digits[ i ] < 9 ) { this.digits[ i ] ++ ; done = true ; break ; }
			else { this.digits[ i ] = 0 ; }
		}

		if ( ! done ) {
			this.exposant ++ ;
			this.digits[ 0 ] = 1 ;
			this.digits.length = 1 ;
		}
		else {
			this.digits.length = i + 1 ;
		}
	}
	else {
		this.digits.length = n ;
		this.removeTrailingZero() ;
	}

	return this ;
} ;



StringNumber.prototype.round = function( decimalPlace = 0 , type = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , type ) ;
} ;



StringNumber.prototype.floor = function( decimalPlace = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , -1 ) ;
} ;



StringNumber.prototype.ceil = function( decimalPlace = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , 1 ) ;
} ;



StringNumber.prototype.removeTrailingZero = function() {
	var i = this.digits.length - 1 ;
	while( i >= 0 && this.digits[ i ] === 0 ) { i -- ; }
	this.digits.length = i + 1 ;
} ;



const GROUP_SIZE = 3 ;

StringNumber.prototype.groupDigits = function( digits , separator , inverseOrder = false ) {
	var str = '' ,
		offset = inverseOrder ? 0 : GROUP_SIZE - ( digits.length % GROUP_SIZE ) ,
		i = 0 ,
		iMax = digits.length ;

	for ( ; i < iMax ; i ++ ) {
		str += i && ( ( i + offset ) % GROUP_SIZE === 0 ) ? separator + digits[ i ] : digits[ i ] ;
	}

	return str ;
} ;



StringNumber.prototype.appendNumerals = function( intoArray , sourceArray , start = 0 , end = sourceArray.length , leftPlace = end ) {
	//console.log( "appendNumerals:" , { intoArray , sourceArray , start , end , leftPlace } ) ;
	for ( let i = start , place = leftPlace ; i < end ; i ++ , place -- ) {
		let numerals = this.placeNumerals?.[ place ] ?? this.numerals ;
		intoArray.push( numerals[ sourceArray[ i ] ] ?? sourceArray[ i ] ) ;
	}

	return intoArray ;
} ;



StringNumber.prototype.fillZeroes = function( intoArray , count , leftPlace = count - 1 ) {
	//console.log( "fillZeroes:" , { intoArray , count , leftPlace } ) ;
	for ( let i = 0 , place = leftPlace ; i < count ; i ++ , place -- ) {
		let numerals = this.placeNumerals?.[ place ] ?? this.numerals ;
		intoArray.push( numerals[ 0 ] ?? 0 ) ;
	}

	return intoArray ;
} ;



const ROMAN_OPTIONS = {
	numeralZero: 'N' ,
	placeNumerals: [
		[ '' , 'I' , 'II' , 'III' , 'IV' , 'V' , 'VI' , 'VII' , 'VIII' , 'IX' ] ,
		[ '' , 'X' , 'XX' , 'XXX' , 'XL' , 'L' , 'LX' , 'LXX' , 'LXXX' , 'XC' ] ,
		[ '' , 'C' , 'CC' , 'CCC' , 'CD' , 'D' , 'DC' , 'DCC' , 'DCCC' , 'CM' ] ,
		[ '' , 'M' , 'MM' , 'MMM' , 'MMMM' , 'ↁ' , 'ↁↀ' , 'ↁↀↀ' , 'ↁↀↀↀ' , 'ↁↀↀↀↀ' ]
	]
} ;

const ADDITIVE_ROMAN_OPTIONS = {
	numeralZero: 'N' ,
	placeNumerals: [
		[ '' , 'I' , 'II' , 'III' , 'IIII' , 'V' , 'VI' , 'VII' , 'VIII' , 'VIIII' ] ,
		[ '' , 'X' , 'XX' , 'XXX' , 'XXXX' , 'L' , 'LX' , 'LXX' , 'LXXX' , 'LXXXX' ] ,
		[ '' , 'C' , 'CC' , 'CCC' , 'CCCC' , 'D' , 'DC' , 'DCC' , 'DCCC' , 'DCCCC' ] ,
		[ '' , 'M' , 'MM' , 'MMM' , 'MMMM' , 'ↁ' , 'ↁↀ' , 'ↁↀↀ' , 'ↁↀↀↀ' , 'ↁↀↀↀↀ' ]
	]
} ;

const APOSTROPHUS_ROMAN_OPTIONS = {
	numeralZero: 'N' ,
	placeNumerals: [
		[ '' , 'I' , 'II' , 'III' , 'IV' , 'V' , 'VI' , 'VII' , 'VIII' , 'IX' ] ,
		[ '' , 'X' , 'XX' , 'XXX' , 'XL' , 'L' , 'LX' , 'LXX' , 'LXXX' , 'XC' ] ,
		[ '' , 'C' , 'CC' , 'CCC' , 'CD' , 'D' , 'DC' , 'DCC' , 'DCCC' , 'CM' ] ,
		[ '' , 'M' , 'MM' , 'MMM' , 'MMMM' , 'IↃↃ' , 'IↃↃCIↃ' , 'IↃↃCIↃCIↃ' , 'IↃↃCIↃCIↃCIↃ' , 'IↃↃCIↃCIↃCIↃCIↃ' ] ,
		[ '' , 'CCIↃↃ' , 'CCIↃↃCCIↃↃ' , 'CCIↃↃCCIↃↃCCIↃↃ' , 'CCIↃↃCCIↃↃCCIↃↃCCIↃↃ' , 'IↃↃↃ' , 'IↃↃↃCCIↃↃ' , 'IↃↃↃCCIↃↃCCIↃↃ' , 'IↃↃↃCCIↃↃCCIↃↃCCIↃↃ' , 'IↃↃↃCCIↃↃCCIↃↃCCIↃↃCCIↃↃ' ] ,
		[ '' , 'CCCIↃↃↃ' , 'CCCIↃↃↃCCCIↃↃↃ' , 'CCCIↃↃↃCCCIↃↃↃCCCIↃↃↃ' , 'CCCIↃↃↃCCCIↃↃↃCCCIↃↃↃCCCIↃↃↃ' , 'IↃↃↃↃ' , 'IↃↃↃↃCCCIↃↃↃ' , 'IↃↃↃↃCCCIↃↃↃCCCIↃↃↃ' , 'IↃↃↃↃCCCIↃↃↃCCCIↃↃↃCCCIↃↃↃ' , 'IↃↃↃↃCCCIↃↃↃCCCIↃↃↃCCCIↃↃↃCCCIↃↃↃ' ]
	]
} ;

StringNumber.roman = ( number , options ) => {
	options = options ? Object.assign( {} , options , ROMAN_OPTIONS ) : ROMAN_OPTIONS ;
	return new StringNumber( number , options ) ;
} ;

StringNumber.additiveRoman = ( number , options ) => {
	options = options ? Object.assign( {} , options , ADDITIVE_ROMAN_OPTIONS ) : ADDITIVE_ROMAN_OPTIONS ;
	return new StringNumber( number , options ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/english.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Book Source

	Copyright (c) 2023 Cédric Ronvel

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





const english = {} ;
module.exports = english ;



const VOWELS = new Set( [ 'a' , 'e' , 'i' , 'o' , 'u' , 'y' ] ) ;
const VOWELS_ADDING_E = new Set( [ 'a' , 'i' , 'o' , 'u' ] ) ;
const CONSONANTS_AFTER_VOWEL_ADDING_E = new Set( [ 's' ] ) ;
const CONSONANTS_ADDING_E = new Set( [ 'v' ] ) ;
const CONSONANTS_NOT_ADDING_E = new Set( [ 'w' , 'x' ] ) ;
const DOUBLE_CONSONANTS_ADDING_E = new Set( [ 'cl' , 'dl' , 'gl' , 'kl' , 'nc' , 'pl' , 'tl' ] ) ;
const REDUCING_DOUBLE_CONSONANTS = new Set( [ 'd' , 'g' , 'm' , 'n' , 'p' ] ) ;
const CONSONANTS_AFTER_VOWELS_COMBO_NOT_ADDING_E = new Set( [ 'or' ] ) ;	// Last chance fix

// Remove -ing and transform to a proper verb or noun
english.undoPresentParticiple = word => {
	if ( word.endsWith( 'ing' ) && word.length >= 6 && ! word.endsWith( 'ghtning' ) ) {
		let ingSuffix = 'ing' ;
		//if ( word.endsWith( 'ling' ) ) { ingSuffix = 'ling' ; }

		let ingLen = ingSuffix.length ;

		let before = word[ word.length - ingLen - 1 ] ,
			before2 = word[ word.length - ingLen - 2 ] ,
			before3 = word[ word.length - ingLen - 3 ] ;

		if ( VOWELS.has( before ) ) {
			word = word.slice( 0 , -ingLen ) ;
		}
		else if ( VOWELS.has( before2 ) ) {
			if ( VOWELS.has( before3 ) ) {
				if ( CONSONANTS_AFTER_VOWEL_ADDING_E.has( before ) && ! CONSONANTS_AFTER_VOWELS_COMBO_NOT_ADDING_E.has( before2 + before ) ) {
					word = word.slice( 0 , -ingLen ) + 'e' ;
				}
				else {
					word = word.slice( 0 , -ingLen ) ;
				}
			}
			else if ( VOWELS_ADDING_E.has( before2 ) && ! CONSONANTS_NOT_ADDING_E.has( before ) ) {
				word = word.slice( 0 , -ingLen ) + 'e' ;
			}
			else {
				word = word.slice( 0 , -ingLen ) ;
			}
		}
		else if ( before === before2 && REDUCING_DOUBLE_CONSONANTS.has( before ) ) {
			word = word.slice( 0 , -ingLen - 1 ) ;
		}
		else if ( CONSONANTS_ADDING_E.has( before ) || DOUBLE_CONSONANTS_ADDING_E.has( before2 + before ) ) {
			word = word.slice( 0 , -ingLen ) + 'e' ;
		}
		else {
			word = word.slice( 0 , -ingLen ) ;
		}
	}

	return word ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/emoji.js' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Book Source

	Copyright (c) 2023 Cédric Ronvel

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





const latinize = require( './latinize.js' ) ;
const english = require( './english.js' ) ;

const KEYWORD_TO_CHARLIST = require( './json-data/emoji-keyword-to-charlist.json' ) ;
const CHAR_TO_CANONICAL_NAME = require( './json-data/emoji-char-to-canonical-name.json' ) ;



const emoji = {} ;
module.exports = emoji ;



emoji.getCanonicalName = emojiChar => CHAR_TO_CANONICAL_NAME[ emojiChar ] ;



const emojiToKeywordsCache = {} ;

// Return a cached and frozen array
emoji.getKeywords = emojiChar => {
	if ( ! CHAR_TO_CANONICAL_NAME[ emojiChar ] ) { return ; }

	if ( ! emojiToKeywordsCache[ emojiChar ] ) {
		emojiToKeywordsCache[ emojiChar ] = emoji.splitIntoKeywords( CHAR_TO_CANONICAL_NAME[ emojiChar ] ) ;
		Object.freeze( emojiToKeywordsCache[ emojiChar ] ) ;
	}

	return emojiToKeywordsCache[ emojiChar ] ;
} ;



emoji.search = ( name , bestOnly = false ) => {
	var keywords = emoji.splitIntoKeywords( name ) ,
		matches = {} ,
		score ,
		bestScore = 0 ;

	for ( let keyword of keywords ) {
		if ( ! KEYWORD_TO_CHARLIST[ keyword ] ) { continue ; }

		for ( let emojiChar of KEYWORD_TO_CHARLIST[ keyword ] ) {
			if ( ! matches[ emojiChar ] ) {
				score = 1 ;
				matches[ emojiChar ] = {
					emoji: emojiChar ,
					score ,
					canonical: CHAR_TO_CANONICAL_NAME[ emojiChar ] ,
					keywords: emoji.getKeywords( emojiChar )
				} ;
			}
			else {
				score = matches[ emojiChar ].score + 1 ;
				matches[ emojiChar ].score = score ;
			}

			if ( score > bestScore ) { bestScore = score ; }
		}
	}

	var results = [ ... Object.values( matches ) ] ;
	if ( bestOnly ) { results = results.filter( e => e.score === bestScore ) ; }
	results.sort( ( a , b ) => ( b.score - a.score ) || ( a.keywords.length - b.keywords.length ) ) ;
	return results ;
} ;

emoji.searchBest = name => emoji.search( name , true ) ;
emoji.get = name => emoji.search( name , true )[ 0 ]?.emoji ;





// Internal API, exposed because it is used by the builder



emoji.simplifyName = name => {
	name = name.toLowerCase().replace( /[“”().!]/g , '' ).replace( /[ ’',]/g , '-' ).replace( /-+/g , '-' ) ;
	name = latinize( name ) ;
	return name ;
} ;



emoji.simplifyKeyword = inputKeyword => {
	var kw = inputKeyword ;
	kw = english.undoPresentParticiple( kw ) ;

	//if ( kw !== inputKeyword ) { console.log( "Changing KW:" , inputKeyword , "-->" , kw ) ; }
	return kw ;
} ;



const KEYWORD_EXCLUSION = new Set( [ 'with' , 'of' ] ) ;

emoji.splitIntoKeywords = ( name , noSimplify = false ) => {
	if ( ! noSimplify ) { name = emoji.simplifyName( name ) ; }
	var keywords = name.split( /-/g ).filter( keyword => keyword.length >= 2 && ! KEYWORD_EXCLUSION.has( keyword ) ) ;
	keywords = keywords.map( emoji.simplifyKeyword ) ;
	keywords = [ ... new Set( keywords ) ] ;	// Make them unique
	return keywords ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/json-data/unicode-emoji-width-ranges.json' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = [{"s":9728,"e":9747,"w":1},{"s":9748,"e":9749,"w":2},{"s":9750,"e":9799,"w":1},{"s":9800,"e":9811,"w":2},{"s":9812,"e":9854,"w":1},{"s":9855,"e":9855,"w":2},{"s":9856,"e":9874,"w":1},{"s":9875,"e":9875,"w":2},{"s":9876,"e":9888,"w":1},{"s":9889,"e":9889,"w":2},{"s":9890,"e":9897,"w":1},{"s":9898,"e":9899,"w":2},{"s":9900,"e":9916,"w":1},{"s":9917,"e":9918,"w":2},{"s":9919,"e":9923,"w":1},{"s":9924,"e":9925,"w":2},{"s":9926,"e":9933,"w":1},{"s":9934,"e":9934,"w":2},{"s":9935,"e":9939,"w":1},{"s":9940,"e":9940,"w":2},{"s":9941,"e":9961,"w":1},{"s":9962,"e":9962,"w":2},{"s":9963,"e":9969,"w":1},{"s":9970,"e":9971,"w":2},{"s":9972,"e":9972,"w":1},{"s":9973,"e":9973,"w":2},{"s":9974,"e":9977,"w":1},{"s":9978,"e":9978,"w":2},{"s":9979,"e":9980,"w":1},{"s":9981,"e":9981,"w":2},{"s":9982,"e":9983,"w":1},{"s":9984,"e":9988,"w":1},{"s":9989,"e":9989,"w":2},{"s":9990,"e":9993,"w":1},{"s":9994,"e":9995,"w":2},{"s":9996,"e":10023,"w":1},{"s":10024,"e":10024,"w":2},{"s":10025,"e":10059,"w":1},{"s":10060,"e":10060,"w":2},{"s":10061,"e":10061,"w":1},{"s":10062,"e":10062,"w":2},{"s":10063,"e":10066,"w":1},{"s":10067,"e":10069,"w":2},{"s":10070,"e":10070,"w":1},{"s":10071,"e":10071,"w":2},{"s":10072,"e":10132,"w":1},{"s":10133,"e":10135,"w":2},{"s":10136,"e":10159,"w":1},{"s":10160,"e":10160,"w":2},{"s":10161,"e":10174,"w":1},{"s":10175,"e":10175,"w":2},{"s":126976,"e":126979,"w":1},{"s":126980,"e":126980,"w":2},{"s":126981,"e":127182,"w":1},{"s":127183,"e":127183,"w":2},{"s":127184,"e":127373,"w":1},{"s":127374,"e":127374,"w":2},{"s":127375,"e":127376,"w":1},{"s":127377,"e":127386,"w":2},{"s":127387,"e":127487,"w":1},{"s":127744,"e":127776,"w":2},{"s":127777,"e":127788,"w":1},{"s":127789,"e":127797,"w":2},{"s":127798,"e":127798,"w":1},{"s":127799,"e":127868,"w":2},{"s":127869,"e":127869,"w":1},{"s":127870,"e":127891,"w":2},{"s":127892,"e":127903,"w":1},{"s":127904,"e":127946,"w":2},{"s":127947,"e":127950,"w":1},{"s":127951,"e":127955,"w":2},{"s":127956,"e":127967,"w":1},{"s":127968,"e":127984,"w":2},{"s":127985,"e":127987,"w":1},{"s":127988,"e":127988,"w":2},{"s":127989,"e":127991,"w":1},{"s":127992,"e":127994,"w":2},{"s":128000,"e":128062,"w":2},{"s":128063,"e":128063,"w":1},{"s":128064,"e":128064,"w":2},{"s":128065,"e":128065,"w":1},{"s":128066,"e":128252,"w":2},{"s":128253,"e":128254,"w":1},{"s":128255,"e":128317,"w":2},{"s":128318,"e":128330,"w":1},{"s":128331,"e":128334,"w":2},{"s":128335,"e":128335,"w":1},{"s":128336,"e":128359,"w":2},{"s":128360,"e":128377,"w":1},{"s":128378,"e":128378,"w":2},{"s":128379,"e":128404,"w":1},{"s":128405,"e":128406,"w":2},{"s":128407,"e":128419,"w":1},{"s":128420,"e":128420,"w":2},{"s":128421,"e":128506,"w":1},{"s":128507,"e":128591,"w":2},{"s":128592,"e":128639,"w":1},{"s":128640,"e":128709,"w":2},{"s":128710,"e":128715,"w":1},{"s":128716,"e":128716,"w":2},{"s":128717,"e":128719,"w":1},{"s":128720,"e":128722,"w":2},{"s":128723,"e":128724,"w":1},{"s":128725,"e":128727,"w":2},{"s":128728,"e":128746,"w":1},{"s":128747,"e":128748,"w":2},{"s":128749,"e":128755,"w":1},{"s":128756,"e":128764,"w":2},{"s":128765,"e":128991,"w":1},{"s":128992,"e":129003,"w":2},{"s":129004,"e":129291,"w":1},{"s":129292,"e":129338,"w":2},{"s":129339,"e":129339,"w":1},{"s":129340,"e":129349,"w":2},{"s":129350,"e":129350,"w":1},{"s":129351,"e":129400,"w":2},{"s":129401,"e":129401,"w":1},{"s":129402,"e":129483,"w":2},{"s":129484,"e":129484,"w":1},{"s":129485,"e":129535,"w":2},{"s":129536,"e":129647,"w":1},{"s":129648,"e":129652,"w":2},{"s":129653,"e":129655,"w":1},{"s":129656,"e":129658,"w":2},{"s":129659,"e":129663,"w":1},{"s":129664,"e":129670,"w":2},{"s":129671,"e":129679,"w":1},{"s":129680,"e":129704,"w":2},{"s":129705,"e":129711,"w":1},{"s":129712,"e":129718,"w":2},{"s":129719,"e":129727,"w":1},{"s":129728,"e":129730,"w":2},{"s":129731,"e":129743,"w":1},{"s":129744,"e":129750,"w":2},{"s":129751,"e":129791,"w":1}] ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/json-data/latinize-map.json' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {"߀":"0","́":""," ":" ","Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ɓ":"B","ｃ":"C","Ⓒ":"C","Ｃ":"C","Ꜿ":"C","Ḉ":"C","Ç":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ɗ":"D","Ɖ":"D","ᴅ":"D","Ꝺ":"D","Ð":"Dh","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","ɛ":"E","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","ᴇ":"E","ꝼ":"F","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","ɢ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","ȷ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","ϻ":"M","Ꞥ":"N","Ƞ":"N","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ɲ":"N","Ꞑ":"N","ᴎ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Œ":"OE","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Þ":"Th","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ɑ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","Ƃ":"b","ⓒ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","C":"c","Ć":"c","Ĉ":"c","Ċ":"c","Č":"c","Ƈ":"c","Ȼ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","Ƌ":"d","Ꮷ":"d","ԁ":"d","Ɦ":"d","ð":"dh","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ﬀ":"ff","ﬁ":"fi","ﬂ":"fl","ﬃ":"ffi","ﬄ":"ffl","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ꝿ":"g","ᵹ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ɭ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ԉ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ɔ":"o","ᴑ":"o","œ":"oe","ƣ":"oi","ꝏ":"oo","ȣ":"ou","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ρ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ʂ":"s","ß":"ss","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","þ":"th","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z"} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/json-data/emoji-keyword-to-charlist.json' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {"10":["🔟"],"grin":["😀","😃","😄","😆","😅","😺","😸"],"face":["😀","😃","😄","😁","😆","😅","😂","🙂","🙃","🫠","😉","😊","😇","🥰","😍","😘","😗","☺️","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🫢","🫣","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😶‍🌫️","😏","😒","🙄","😬","😮‍💨","🤥","🫨","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","😵‍💫","🤠","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","☹️","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","🤡","🤛","🤜","🐵","🐶","🐱","🐯","🐴","🐮","🐷","🐭","🐰","🐥","🐲","🌚","🌛","🌜","🌝","🌞","🌬️","📄"],"big":["😃"],"eyes":["😃","😄","😁","😊","😍","😚","😙","🫢","🙄","😵","😵‍💫","😸","😻","👀"],"smile":["😄","😁","🙂","😊","😇","🥰","😍","☺️","😙","🥲","🤗","😎","😈","😸","😻","😼"],"beam":["😁"],"squint":["😆","😝"],"sweat":["😅","😰","😓","💦"],"roll":["🤣","🙄","🧻"],"on":["🤣","🤬","❤️‍🔥","🍖","⛱️","🔛"],"the":["🤣","🤘","🫵"],"floor":["🤣"],"laugh":["🤣"],"tears":["😂","🥹","😹"],"joy":["😂","😹"],"slightly":["🙂","🙁"],"upside":["🙃"],"down":["🙃","🫳","👇","👎","↘️","⬇️","↙️","↕️","⤵️","⏬","🔻"],"melt":["🫠"],"wink":["😉","😜"],"halo":["😇"],"hearts":["🥰","💞","💕"],"heart":["😍","😻","💘","💝","💖","💗","💓","💟","❣️","💔","❤️‍🔥","❤️‍🩹","❤️","🩷","🧡","💛","💚","💙","🩵","💜","🤎","🖤","🩶","🤍","🫶","🫀","💑","👩‍❤️‍👨","👨‍❤️‍👨","👩‍❤️‍👩","♥️"],"star":["🤩","⭐","🌟","🌠","✡️","☪️","🔯","✴️"],"struck":["🤩"],"blow":["😘"],"kiss":["😘","😗","😚","😙","😽","💋","💏","👩‍❤️‍💋‍👨","👨‍❤️‍💋‍👨","👩‍❤️‍💋‍👩"],"closed":["😚","🌂","📕","📫","📪"],"tear":["🥲","📆"],"savore":["😋"],"food":["😋","🥘","🍲","🥫"],"tongue":["😛","😜","😝","👅"],"zany":["🤪"],"money":["🤑","💰","💸"],"mouth":["🤑","🤭","🫢","🤐","😶","🫤","😮","😦","🤬","👄"],"open":["🤗","🫢","😮","😦","👐","📖","📬","📭","📂","🈺"],"hands":["🤗","👏","🙌","🫶","👐","🙏","🧑‍🤝‍🧑","👭","👫","👬"],"hand":["🤭","🫢","👋","🤚","🖐️","✋","🫱","🫲","🫳","🫴","🫷","🫸","👌","🤏","✌️","🫰","🤙","✍️","💁","💁‍♂️","💁‍♀️","🙋","🙋‍♂️","🙋‍♀️","🪭"],"over":["🤭","🫢","🌄"],"and":["🫢","☠️","🫰","👫","🍽️","🍴","⛈️","⚒️","🛠️","🏹","🔩","🛋️","☪️"],"peek":["🫣"],"eye":["🫣","👁️‍🗨️","👁️"],"shush":["🤫"],"think":["🤔"],"salute":["🫡","🖖"],"zipper":["🤐"],"raised":["🤨","🤚","✋","✊","📫","📬"],"eyebrow":["🤨"],"neutral":["😐"],"expressionless":["😑"],"without":["😶","🍵","⛄"],"dotted":["🫥","🔯"],"line":["🫥"],"in":["😶‍🌫️","😱","👁️‍🗨️","🤵","🤵‍♂️","🤵‍♀️","🧑‍🦼","👨‍🦼","👩‍🦼","🧑‍🦽","👨‍🦽","👩‍🦽","🕴️","🧖","🧖‍♂️","🧖‍♀️","🧘","🧘‍♂️","🧘‍♀️","🛌","👤","👥","🍃","⛳","🚮"],"clouds":["😶‍🌫️"],"smirk":["😏"],"unamused":["😒"],"grimace":["😬"],"exhale":["😮‍💨"],"lying":["🤥"],"shake":["🫨"],"relieved":["😌","😥"],"pensive":["😔"],"sleepy":["😪"],"drool":["🤤"],"sleep":["😴"],"medical":["😷","⚕️"],"mask":["😷","🤿"],"thermometer":["🤒","🌡️"],"head":["🤕","🤯","🗣️"],"bandage":["🤕","🩹"],"nauseated":["🤢"],"vomite":["🤮"],"sneez":["🤧"],"hot":["🥵","🌶️","🌭","☕","♨️"],"cold":["🥶"],"woozy":["🥴"],"crossed":["😵","🤞","🫰","⚔️","🎌"],"out":["😵"],"spiral":["😵‍💫","🐚","🗒️","🗓️"],"explode":["🤯"],"cowboy":["🤠"],"hat":["🤠","👒","🎩"],"party":["🥳","🎉"],"disguised":["🥸"],"sunglasses":["😎","🕶️"],"nerd":["🤓"],"monocle":["🧐"],"confused":["😕"],"diagonal":["🫤"],"worried":["😟"],"frown":["🙁","☹️","😦","🙍","🙍‍♂️","🙍‍♀️"],"hushed":["😯"],"astonished":["😲"],"flushed":["😳"],"plead":["🥺"],"hold":["🥹","🧑‍🤝‍🧑","👭","👫","👬"],"back":["🥹","🤚","🔙"],"anguished":["😧"],"fearful":["😨"],"anxious":["😰"],"sad":["😥"],"but":["😥"],"cry":["😢","😭","😿"],"loudly":["😭"],"scream":["😱"],"fear":["😱"],"confounded":["😖"],"persever":["😣"],"disappointed":["😞"],"downcast":["😓"],"weary":["😩","🙀"],"tired":["😫"],"yawn":["🥱"],"steam":["😤","🍜"],"from":["😤"],"nose":["😤","👃","🐽"],"enraged":["😡"],"angry":["😠","👿"],"symbols":["🤬","🔣"],"horns":["😈","👿","🤘"],"skull":["💀","☠️"],"crossbones":["☠️"],"pile":["💩"],"poo":["💩"],"clown":["🤡"],"ogre":["👹"],"goblin":["👺"],"ghost":["👻"],"alien":["👽","👾"],"monster":["👾"],"robot":["🤖"],"cat":["😺","😸","😹","😻","😼","😽","🙀","😿","😾","🐱","🐈","🐈‍⬛"],"wry":["😼"],"pout":["😾","🙎","🙎‍♂️","🙎‍♀️"],"see":["🙈"],"no":["🙈","🙉","🙊","🙅","🙅‍♂️","🙅‍♀️","⛔","🚳","🚭","🚯","🚷","📵","🔞","🈵"],"evil":["🙈","🙉","🙊"],"monkey":["🙈","🙉","🙊","🐵","🐒"],"hear":["🙉","🦻"],"speak":["🙊","🗣️"],"love":["💌","🤟","🏩"],"letter":["💌"],"arrow":["💘","📲","📩","🏹","⬆️","↗️","➡️","↘️","⬇️","↙️","⬅️","↖️","↕️","↔️","↩️","↪️","⤴️","⤵️","🔙","🔚","🔛","🔜","🔝"],"ribbon":["💝","🎀","🎗️"],"sparkle":["💖","❇️"],"grow":["💗"],"beat":["💓"],"revolve":["💞"],"two":["💕","🐫","🕑","🕝"],"decoration":["💟","🎍"],"exclamation":["❣️","‼️","⁉️","❕","❗"],"broken":["💔"],"fire":["❤️‍🔥","🚒","🔥","🧯"],"mend":["❤️‍🩹"],"red":["❤️","👨‍🦰","👩‍🦰","🧑‍🦰","🍎","🧧","🀄","🏮","❓","❗","⭕","🔴","🟥","🔺","🔻"],"pink":["🩷"],"orange":["🧡","📙","🟠","🟧","🔶","🔸"],"yellow":["💛","🟡","🟨"],"green":["💚","🍏","🥬","🥗","📗","🟢","🟩"],"blue":["💙","🩵","📘","🔵","🟦","🔷","🔹"],"light":["🩵","🚈","🚨","🚥","🚦","💡"],"purple":["💜","🟣","🟪"],"brown":["🤎","🟤","🟫"],"black":["🖤","🐈‍⬛","🐦‍⬛","✒️","⚫","⬛","◼️","◾","▪️","🔲","🏴"],"grey":["🩶"],"white":["🤍","👨‍🦳","👩‍🦳","🧑‍🦳","🧑‍🦯","👨‍🦯","👩‍🦯","💮","🦯","❔","❕","⚪","⬜","◻️","◽","▫️","🔳","🏳️"],"mark":["💋","‼️","⁉️","❓","❔","❕","❗","✅","✔️","❌","❎","〽️","™️"],"hundred":["💯"],"points":["💯"],"anger":["💢","🗯️"],"symbol":["💢","♿","🚼","⚛️","☮️","⚧️","⚕️","♻️","🔰"],"collision":["💥"],"dizzy":["💫"],"droplets":["💦"],"dash":["💨","〰️"],"away":["💨"],"hole":["🕳️","⛳"],"speech":["💬","👁️‍🗨️","🗨️"],"balloon":["💬","💭","🎈"],"bubble":["👁️‍🗨️","🗨️","🗯️","🧋"],"left":["🗨️","👈","🤛","🔍","🛅","↙️","⬅️","↖️","↔️","↩️","↪️"],"right":["🗯️","👉","🤜","🔎","↗️","➡️","↘️","↔️","↩️","↪️","⤴️","⤵️"],"thought":["💭"],"zzz":["💤"],"wave":["👋","🌊"],"fingers":["🖐️","🤌","🤞"],"splayed":["🖐️"],"vulcan":["🖖"],"rightwards":["🫱","🫸"],"leftwards":["🫲","🫷"],"palm":["🫳","🫴","🌴"],"up":["🫴","👆","☝️","👍","🤲","📄","🗞️","⬆️","↗️","↖️","↕️","⤴️","⏫","🆙","🔺"],"push":["🫷","🫸"],"ok":["👌","🙆","🙆‍♂️","🙆‍♀️","🆗"],"pinched":["🤌"],"pinch":["🤏"],"victory":["✌️"],"index":["🫰","👈","👉","👆","👇","☝️","🫵","🗂️","📇"],"finger":["🫰","🖕"],"thumb":["🫰"],"you":["🤟"],"gesture":["🤟","🙅","🙅‍♂️","🙅‍♀️","🙆","🙆‍♂️","🙆‍♀️"],"sign":["🤘","🛑","🏧","🚮","♀️","♂️","🟰","💲"],"call":["🤙"],"me":["🤙"],"backhand":["👈","👉","👆","👇"],"point":["👈","👉","👆","👇","☝️","🫵"],"middle":["🖕"],"at":["🫵","🌆","🌉"],"viewer":["🫵"],"thumbs":["👍","👎"],"fist":["✊","👊","🤛","🤜"],"oncome":["👊","🚍","🚔","🚖","🚘"],"clap":["👏"],"raise":["🙌","🙋","🙋‍♂️","🙋‍♀️"],"palms":["🤲"],"together":["🤲"],"handshake":["🤝"],"folded":["🙏"],"write":["✍️"],"nail":["💅"],"polish":["💅"],"selfie":["🤳"],"flexed":["💪"],"biceps":["💪"],"mechanical":["🦾","🦿"],"arm":["🦾"],"leg":["🦿","🦵","🍗"],"foot":["🦶"],"ear":["👂","🦻","🌽"],"aid":["🦻"],"brain":["🧠"],"anatomical":["🫀"],"lungs":["🫁"],"tooth":["🦷"],"bone":["🦴","🍖"],"bite":["🫦"],"lip":["🫦"],"baby":["👶","👩‍🍼","👨‍🍼","🧑‍🍼","👼","🐤","🐥","🍼","🚼"],"child":["🧒"],"boy":["👦","👨‍👩‍👦","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👨‍👦","👨‍👨‍👧‍👦","👨‍👨‍👦‍👦","👩‍👩‍👦","👩‍👩‍👧‍👦","👩‍👩‍👦‍👦","👨‍👦","👨‍👦‍👦","👨‍👧‍👦","👩‍👦","👩‍👦‍👦","👩‍👧‍👦"],"girl":["👧","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👧‍👧","👨‍👨‍👧","👨‍👨‍👧‍👦","👨‍👨‍👧‍👧","👩‍👩‍👧","👩‍👩‍👧‍👦","👩‍👩‍👧‍👧","👨‍👧","👨‍👧‍👦","👨‍👧‍👧","👩‍👧","👩‍👧‍👦","👩‍👧‍👧"],"person":["🧑","👱","🧔","🧑‍🦰","🧑‍🦱","🧑‍🦳","🧑‍🦲","🧓","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷","🫅","👳","👲","🤵","👰","🫄","🧑‍🍼","💆","💇","🚶","🧍","🧎","🧑‍🦯","🧑‍🦼","🧑‍🦽","🏃","🕴️","🧖","🧗","🤺","🏌️","🏄","🚣","🏊","⛹️","🏋️","🚴","🚵","🤸","🤽","🤾","🤹","🧘","🛀","🛌"],"blond":["👱","👱‍♀️","👱‍♂️"],"hair":["👱","👨‍🦰","👨‍🦱","👨‍🦳","👩‍🦰","🧑‍🦰","👩‍🦱","🧑‍🦱","👩‍🦳","🧑‍🦳","👱‍♀️","👱‍♂️","🪮"],"man":["👨","🧔‍♂️","👨‍🦰","👨‍🦱","👨‍🦳","👨‍🦲","👱‍♂️","👴","🙍‍♂️","🙎‍♂️","🙅‍♂️","🙆‍♂️","💁‍♂️","🙋‍♂️","🧏‍♂️","🙇‍♂️","🤦‍♂️","🤷‍♂️","👨‍⚕️","👨‍🎓","👨‍🏫","👨‍⚖️","👨‍🌾","👨‍🍳","👨‍🔧","👨‍🏭","👨‍💼","👨‍🔬","👨‍💻","👨‍🎤","👨‍🎨","👨‍✈️","👨‍🚀","👨‍🚒","👮‍♂️","🕵️‍♂️","💂‍♂️","👷‍♂️","👳‍♂️","🤵‍♂️","👰‍♂️","🫃","👨‍🍼","🦸‍♂️","🦹‍♂️","🧙‍♂️","🧚‍♂️","🧛‍♂️","🧝‍♂️","🧞‍♂️","🧟‍♂️","💆‍♂️","💇‍♂️","🚶‍♂️","🧍‍♂️","🧎‍♂️","👨‍🦯","👨‍🦼","👨‍🦽","🏃‍♂️","🕺","🧖‍♂️","🧗‍♂️","🏌️‍♂️","🏄‍♂️","🚣‍♂️","🏊‍♂️","⛹️‍♂️","🏋️‍♂️","🚴‍♂️","🚵‍♂️","🤸‍♂️","🤽‍♂️","🤾‍♂️","🤹‍♂️","🧘‍♂️","👫","👩‍❤️‍💋‍👨","👨‍❤️‍💋‍👨","👩‍❤️‍👨","👨‍❤️‍👨","👨‍👩‍👦","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👩‍👧‍👧","👨‍👨‍👦","👨‍👨‍👧","👨‍👨‍👧‍👦","👨‍👨‍👦‍👦","👨‍👨‍👧‍👧","👨‍👦","👨‍👦‍👦","👨‍👧","👨‍👧‍👦","👨‍👧‍👧","👞","🇮🇲"],"beard":["🧔","🧔‍♂️","🧔‍♀️"],"woman":["🧔‍♀️","👩","👩‍🦰","👩‍🦱","👩‍🦳","👩‍🦲","👱‍♀️","👵","🙍‍♀️","🙎‍♀️","🙅‍♀️","🙆‍♀️","💁‍♀️","🙋‍♀️","🧏‍♀️","🙇‍♀️","🤦‍♀️","🤷‍♀️","👩‍⚕️","👩‍🎓","👩‍🏫","👩‍⚖️","👩‍🌾","👩‍🍳","👩‍🔧","👩‍🏭","👩‍💼","👩‍🔬","👩‍💻","👩‍🎤","👩‍🎨","👩‍✈️","👩‍🚀","👩‍🚒","👮‍♀️","🕵️‍♀️","💂‍♀️","👷‍♀️","👳‍♀️","🧕","🤵‍♀️","👰‍♀️","🤰","👩‍🍼","🦸‍♀️","🦹‍♀️","🧙‍♀️","🧚‍♀️","🧛‍♀️","🧝‍♀️","🧞‍♀️","🧟‍♀️","💆‍♀️","💇‍♀️","🚶‍♀️","🧍‍♀️","🧎‍♀️","👩‍🦯","👩‍🦼","👩‍🦽","🏃‍♀️","💃","🧖‍♀️","🧗‍♀️","🏌️‍♀️","🏄‍♀️","🚣‍♀️","🏊‍♀️","⛹️‍♀️","🏋️‍♀️","🚴‍♀️","🚵‍♀️","🤸‍♀️","🤽‍♀️","🤾‍♀️","🤹‍♀️","🧘‍♀️","👫","👩‍❤️‍💋‍👨","👩‍❤️‍💋‍👩","👩‍❤️‍👨","👩‍❤️‍👩","👨‍👩‍👦","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👩‍👧‍👧","👩‍👩‍👦","👩‍👩‍👧","👩‍👩‍👧‍👦","👩‍👩‍👦‍👦","👩‍👩‍👧‍👧","👩‍👦","👩‍👦‍👦","👩‍👧","👩‍👧‍👦","👩‍👧‍👧","👚","👡","👢","👒"],"curly":["👨‍🦱","👩‍🦱","🧑‍🦱","➰","➿"],"bald":["👨‍🦲","👩‍🦲","🧑‍🦲"],"older":["🧓"],"old":["👴","👵","🗝️"],"tip":["💁","💁‍♂️","💁‍♀️"],"deaf":["🧏","🧏‍♂️","🧏‍♀️"],"bow":["🙇","🙇‍♂️","🙇‍♀️","🏹"],"facepalm":["🤦","🤦‍♂️","🤦‍♀️"],"shrug":["🤷","🤷‍♂️","🤷‍♀️"],"health":["🧑‍⚕️","👨‍⚕️","👩‍⚕️"],"worker":["🧑‍⚕️","👨‍⚕️","👩‍⚕️","🧑‍🏭","👨‍🏭","👩‍🏭","🧑‍💼","👨‍💼","👩‍💼","👷","👷‍♂️","👷‍♀️","⛑️"],"student":["🧑‍🎓","👨‍🎓","👩‍🎓"],"teacher":["🧑‍🏫","👨‍🏫","👩‍🏫"],"judge":["🧑‍⚖️","👨‍⚖️","👩‍⚖️"],"farmer":["🧑‍🌾","👨‍🌾","👩‍🌾"],"cook":["🧑‍🍳","👨‍🍳","👩‍🍳","🍳","🇨🇰"],"mechanic":["🧑‍🔧","👨‍🔧","👩‍🔧"],"factory":["🧑‍🏭","👨‍🏭","👩‍🏭","🏭"],"office":["🧑‍💼","👨‍💼","👩‍💼","🏢","🏣","🏤"],"scientist":["🧑‍🔬","👨‍🔬","👩‍🔬"],"technologist":["🧑‍💻","👨‍💻","👩‍💻"],"singer":["🧑‍🎤","👨‍🎤","👩‍🎤"],"artist":["🧑‍🎨","👨‍🎨","👩‍🎨","🎨"],"pilot":["🧑‍✈️","👨‍✈️","👩‍✈️"],"astronaut":["🧑‍🚀","👨‍🚀","👩‍🚀"],"firefighter":["🧑‍🚒","👨‍🚒","👩‍🚒"],"police":["👮","👮‍♂️","👮‍♀️","🚓","🚔","🚨"],"officer":["👮","👮‍♂️","👮‍♀️"],"detective":["🕵️","🕵️‍♂️","🕵️‍♀️"],"guard":["💂","💂‍♂️","💂‍♀️"],"ninja":["🥷"],"construction":["👷","👷‍♂️","👷‍♀️","🏗️","🚧"],"crown":["🫅","👑"],"prince":["🤴"],"princess":["👸"],"wear":["👳","👳‍♂️","👳‍♀️"],"turban":["👳","👳‍♂️","👳‍♀️"],"skullcap":["👲"],"headscarf":["🧕"],"tuxedo":["🤵","🤵‍♂️","🤵‍♀️"],"veil":["👰","👰‍♂️","👰‍♀️"],"pregnant":["🤰","🫃","🫄"],"breast":["🤱"],"feed":["🤱","👩‍🍼","👨‍🍼","🧑‍🍼"],"angel":["👼"],"santa":["🎅"],"claus":["🎅","🤶","🧑‍🎄"],"mrs":["🤶"],"mx":["🧑‍🎄"],"superhero":["🦸","🦸‍♂️","🦸‍♀️"],"supervillain":["🦹","🦹‍♂️","🦹‍♀️"],"mage":["🧙","🧙‍♂️","🧙‍♀️"],"fairy":["🧚","🧚‍♂️","🧚‍♀️"],"vampire":["🧛","🧛‍♂️","🧛‍♀️"],"merperson":["🧜"],"merman":["🧜‍♂️"],"mermaid":["🧜‍♀️"],"elf":["🧝","🧝‍♂️","🧝‍♀️"],"genie":["🧞","🧞‍♂️","🧞‍♀️"],"zombie":["🧟","🧟‍♂️","🧟‍♀️"],"troll":["🧌"],"gett":["💆","💆‍♂️","💆‍♀️","💇","💇‍♂️","💇‍♀️"],"massage":["💆","💆‍♂️","💆‍♀️"],"haircut":["💇","💇‍♂️","💇‍♀️"],"walk":["🚶","🚶‍♂️","🚶‍♀️"],"stand":["🧍","🧍‍♂️","🧍‍♀️"],"kneel":["🧎","🧎‍♂️","🧎‍♀️"],"cane":["🧑‍🦯","👨‍🦯","👩‍🦯","🦯"],"motorized":["🧑‍🦼","👨‍🦼","👩‍🦼","🦼"],"wheelchair":["🧑‍🦼","👨‍🦼","👩‍🦼","🧑‍🦽","👨‍🦽","👩‍🦽","🦽","🦼","♿"],"manual":["🧑‍🦽","👨‍🦽","👩‍🦽","🦽"],"run":["🏃","🏃‍♂️","🏃‍♀️","🎽","👟"],"dance":["💃","🕺"],"suit":["🕴️","♠️","♥️","♦️","♣️"],"levitate":["🕴️"],"people":["👯","🤼","🧑‍🤝‍🧑","🫂"],"bunny":["👯","👯‍♂️","👯‍♀️"],"ears":["👯","👯‍♂️","👯‍♀️"],"men":["👯‍♂️","🤼‍♂️","👬","🚹"],"women":["👯‍♀️","🤼‍♀️","👭","🚺"],"steamy":["🧖","🧖‍♂️","🧖‍♀️"],"room":["🧖","🧖‍♂️","🧖‍♀️","🚹","🚺"],"climb":["🧗","🧗‍♂️","🧗‍♀️"],"fence":["🤺"],"horse":["🏇","🐴","🐎","🎠"],"race":["🏇","🏎️"],"skier":["⛷️"],"snowboarder":["🏂"],"golf":["🏌️","🏌️‍♂️","🏌️‍♀️"],"surf":["🏄","🏄‍♂️","🏄‍♀️"],"row":["🚣","🚣‍♂️","🚣‍♀️"],"boat":["🚣","🚣‍♂️","🚣‍♀️","🛥️"],"swim":["🏊","🏊‍♂️","🏊‍♀️"],"bounce":["⛹️","⛹️‍♂️","⛹️‍♀️"],"ball":["⛹️","⛹️‍♂️","⛹️‍♀️","🍙","🎊","⚽","🎱","🔮","🪩"],"lift":["🏋️","🏋️‍♂️","🏋️‍♀️"],"weights":["🏋️","🏋️‍♂️","🏋️‍♀️"],"bike":["🚴","🚴‍♂️","🚴‍♀️","🚵","🚵‍♂️","🚵‍♀️"],"mountain":["🚵","🚵‍♂️","🚵‍♀️","🏔️","⛰️","🚞","🚠"],"cartwheel":["🤸","🤸‍♂️","🤸‍♀️"],"wrestle":["🤼","🤼‍♂️","🤼‍♀️"],"play":["🤽","🤽‍♂️","🤽‍♀️","🤾","🤾‍♂️","🤾‍♀️","🎴","▶️","⏯️"],"water":["🤽","🤽‍♂️","🤽‍♀️","🐃","🌊","🔫","🚰","🚾","🚱"],"polo":["🤽","🤽‍♂️","🤽‍♀️"],"handball":["🤾","🤾‍♂️","🤾‍♀️"],"juggle":["🤹","🤹‍♂️","🤹‍♀️"],"lotus":["🧘","🧘‍♂️","🧘‍♀️","🪷"],"position":["🧘","🧘‍♂️","🧘‍♀️"],"take":["🛀"],"bath":["🛀"],"bed":["🛌","🛏️"],"couple":["💑","👩‍❤️‍👨","👨‍❤️‍👨","👩‍❤️‍👩"],"family":["👪","👨‍👩‍👦","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👩‍👧‍👧","👨‍👨‍👦","👨‍👨‍👧","👨‍👨‍👧‍👦","👨‍👨‍👦‍👦","👨‍👨‍👧‍👧","👩‍👩‍👦","👩‍👩‍👧","👩‍👩‍👧‍👦","👩‍👩‍👦‍👦","👩‍👩‍👧‍👧","👨‍👦","👨‍👦‍👦","👨‍👧","👨‍👧‍👦","👨‍👧‍👧","👩‍👦","👩‍👦‍👦","👩‍👧","👩‍👧‍👦","👩‍👧‍👧"],"bust":["👤"],"silhouette":["👤","👥"],"busts":["👥"],"hug":["🫂"],"footprints":["👣"],"gorilla":["🦍"],"orangutan":["🦧"],"dog":["🐶","🐕","🦮","🐕‍🦺","🌭"],"guide":["🦮"],"service":["🐕‍🦺","🈂️"],"poodle":["🐩"],"wolf":["🐺"],"fox":["🦊"],"raccoon":["🦝"],"lion":["🦁"],"tiger":["🐯","🐅"],"leopard":["🐆"],"moose":["🫎"],"donkey":["🫏"],"unicorn":["🦄"],"zebra":["🦓"],"deer":["🦌"],"bison":["🦬"],"cow":["🐮","🐄"],"ox":["🐂"],"buffalo":["🐃"],"pig":["🐷","🐖","🐽"],"boar":["🐗"],"ram":["🐏"],"ewe":["🐑"],"goat":["🐐"],"camel":["🐪","🐫"],"hump":["🐫"],"llama":["🦙"],"giraffe":["🦒"],"elephant":["🐘"],"mammoth":["🦣"],"rhinoceros":["🦏"],"hippopotamus":["🦛"],"mouse":["🐭","🐁","🖱️","🪤"],"rat":["🐀"],"hamster":["🐹"],"rabbit":["🐰","🐇"],"chipmunk":["🐿️"],"beaver":["🦫"],"hedgehog":["🦔"],"bat":["🦇"],"bear":["🐻","🐻‍❄️","🧸"],"polar":["🐻‍❄️"],"koala":["🐨"],"panda":["🐼"],"sloth":["🦥"],"otter":["🦦"],"skunk":["🦨"],"kangaroo":["🦘"],"badger":["🦡"],"paw":["🐾"],"prints":["🐾"],"turkey":["🦃","🇹🇷"],"chicken":["🐔"],"rooster":["🐓"],"hatch":["🐣"],"chick":["🐣","🐤","🐥"],"front":["🐥"],"bird":["🐦","🐦‍⬛"],"penguin":["🐧"],"dove":["🕊️"],"eagle":["🦅"],"duck":["🦆"],"swan":["🦢"],"owl":["🦉"],"dodo":["🦤"],"feather":["🪶"],"flamingo":["🦩"],"peacock":["🦚"],"parrot":["🦜"],"wing":["🪽"],"goose":["🪿"],"frog":["🐸"],"crocodile":["🐊"],"turtle":["🐢"],"lizard":["🦎"],"snake":["🐍"],"dragon":["🐲","🐉","🀄"],"sauropod":["🦕"],"rex":["🦖"],"spout":["🐳"],"whale":["🐳","🐋"],"dolphin":["🐬"],"seal":["🦭"],"fish":["🐟","🐠","🍥","🎣"],"tropical":["🐠","🍹"],"blowfish":["🐡"],"shark":["🦈"],"octopus":["🐙"],"shell":["🐚"],"coral":["🪸"],"jellyfish":["🪼"],"snail":["🐌"],"butterfly":["🦋"],"bug":["🐛"],"ant":["🐜"],"honeybee":["🐝"],"beetle":["🪲","🐞"],"lady":["🐞"],"cricket":["🦗","🏏"],"cockroach":["🪳"],"spider":["🕷️","🕸️"],"web":["🕸️"],"scorpion":["🦂"],"mosquito":["🦟"],"fly":["🪰","🛸","🥏"],"worm":["🪱"],"microbe":["🦠"],"bouquet":["💐"],"cherry":["🌸"],"blossom":["🌸","🌼"],"flower":["💮","🥀","🎴"],"rosette":["🏵️"],"rose":["🌹"],"wilted":["🥀"],"hibiscus":["🌺"],"sunflower":["🌻"],"tulip":["🌷"],"hyacinth":["🪻"],"seedle":["🌱"],"potted":["🪴"],"plant":["🪴"],"evergreen":["🌲"],"tree":["🌲","🌳","🌴","🎄","🎋"],"deciduous":["🌳"],"cactus":["🌵"],"sheaf":["🌾"],"rice":["🌾","🍘","🍙","🍚","🍛"],"herb":["🌿"],"shamrock":["☘️"],"four":["🍀","🕓","🕟"],"leaf":["🍀","🍁","🍂","🍃"],"clover":["🍀"],"maple":["🍁"],"fallen":["🍂"],"flutter":["🍃"],"wind":["🍃","🌬️","🎐"],"empty":["🪹"],"nest":["🪹","🪺","🪆"],"eggs":["🪺"],"mushroom":["🍄"],"grapes":["🍇"],"melon":["🍈"],"watermelon":["🍉"],"tangerine":["🍊"],"lemon":["🍋"],"banana":["🍌"],"pineapple":["🍍"],"mango":["🥭"],"apple":["🍎","🍏"],"pear":["🍐"],"peach":["🍑"],"cherries":["🍒"],"strawberry":["🍓"],"blueberries":["🫐"],"kiwi":["🥝"],"fruit":["🥝"],"tomato":["🍅"],"olive":["🫒"],"coconut":["🥥"],"avocado":["🥑"],"eggplant":["🍆"],"potato":["🥔","🍠"],"carrot":["🥕"],"corn":["🌽"],"pepper":["🌶️","🫑"],"bell":["🫑","🛎️","🔔","🔕"],"cucumber":["🥒"],"leafy":["🥬"],"broccoli":["🥦"],"garlic":["🧄"],"onion":["🧅"],"peanuts":["🥜"],"beans":["🫘"],"chestnut":["🌰"],"ginger":["🫚"],"root":["🫚"],"pea":["🫛"],"pod":["🫛"],"bread":["🍞","🥖"],"croissant":["🥐"],"baguette":["🥖"],"flatbread":["🫓","🥙"],"pretzel":["🥨"],"bagel":["🥯"],"pancakes":["🥞"],"waffle":["🧇"],"cheese":["🧀"],"wedge":["🧀"],"meat":["🍖","🥩"],"poultry":["🍗"],"cut":["🥩"],"bacon":["🥓"],"hamburger":["🍔"],"french":["🍟","🇬🇫","🇵🇫","🇹🇫"],"fries":["🍟"],"pizza":["🍕"],"sandwich":["🥪","🇬🇸"],"taco":["🌮"],"burrito":["🌯"],"tamale":["🫔"],"stuffed":["🥙"],"falafel":["🧆"],"egg":["🥚"],"shallow":["🥘"],"pan":["🥘"],"pot":["🍲","🍯"],"fondue":["🫕"],"bowl":["🥣","🍜","🎳"],"spoon":["🥣","🥄"],"salad":["🥗"],"popcorn":["🍿"],"butter":["🧈"],"salt":["🧂"],"canned":["🥫"],"bento":["🍱"],"box":["🍱","🥡","🧃","🥊","🗳️","🗃️","☑️"],"cracker":["🍘"],"cooked":["🍚"],"curry":["🍛"],"spaghetti":["🍝"],"roasted":["🍠"],"sweet":["🍠"],"oden":["🍢"],"sushi":["🍣"],"fried":["🍤"],"shrimp":["🍤","🦐"],"cake":["🍥","🥮","🎂"],"swirl":["🍥"],"moon":["🥮","🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘","🌙","🌚","🌛","🌜","🌝","🎑"],"dango":["🍡"],"dumple":["🥟"],"fortune":["🥠"],"cookie":["🥠","🍪"],"takeout":["🥡"],"crab":["🦀"],"lobster":["🦞"],"squid":["🦑"],"oyster":["🦪"],"soft":["🍦"],"ice":["🍦","🍧","🍨","🧊","🏒","⛸️"],"cream":["🍦","🍨"],"shaved":["🍧"],"doughnut":["🍩"],"birthday":["🎂"],"shortcake":["🍰"],"cupcake":["🧁"],"pie":["🥧"],"chocolate":["🍫"],"bar":["🍫","📊"],"candy":["🍬"],"lollipop":["🍭"],"custard":["🍮"],"honey":["🍯"],"bottle":["🍼","🍾","🧴"],"glass":["🥛","🍷","🍸","🥃","🔍","🔎"],"milk":["🥛"],"beverage":["☕","🧃"],"teapot":["🫖"],"teacup":["🍵"],"handle":["🍵"],"sake":["🍶"],"pop":["🍾"],"cork":["🍾"],"wine":["🍷"],"cocktail":["🍸"],"drink":["🍹"],"beer":["🍺","🍻"],"mug":["🍺"],"clink":["🍻","🥂"],"mugs":["🍻"],"glasses":["🥂","👓"],"tumbler":["🥃"],"pour":["🫗"],"liquid":["🫗"],"cup":["🥤"],"straw":["🥤"],"tea":["🧋"],"mate":["🧉"],"chopsticks":["🥢"],"fork":["🍽️","🍴"],"knife":["🍽️","🍴","🔪"],"plate":["🍽️"],"kitchen":["🔪"],"jar":["🫙"],"amphora":["🏺"],"globe":["🌍","🌎","🌏","🌐"],"show":["🌍","🌎","🌏"],"europe":["🌍"],"africa":["🌍","🇿🇦"],"americas":["🌎"],"asia":["🌏"],"australia":["🌏","🇦🇺"],"meridians":["🌐"],"world":["🗺️"],"map":["🗺️","🗾"],"japan":["🗾","🇯🇵"],"compass":["🧭"],"snow":["🏔️","🌨️","⛄"],"capped":["🏔️"],"volcano":["🌋"],"mount":["🗻"],"fuji":["🗻"],"camp":["🏕️"],"beach":["🏖️"],"umbrella":["🏖️","🌂","☂️","☔","⛱️"],"desert":["🏜️","🏝️"],"island":["🏝️","🇦🇨","🇧🇻","🇨🇵","🇨🇽","🇳🇫"],"national":["🏞️"],"park":["🏞️"],"stadium":["🏟️"],"classical":["🏛️"],"build":["🏛️","🏗️","🏢"],"brick":["🧱"],"rock":["🪨"],"wood":["🪵"],"hut":["🛖"],"houses":["🏘️"],"derelict":["🏚️"],"house":["🏚️","🏠","🏡"],"garden":["🏡"],"japanese":["🏣","🏯","🎎","🔰","🈁","🈂️","🈷️","🈶","🈯","🉐","🈹","🈚","🈲","🉑","🈸","🈴","🈳","㊗️","㊙️","🈺","🈵"],"post":["🏣","🏤"],"hospital":["🏥"],"bank":["🏦"],"hotel":["🏨","🏩"],"convenience":["🏪"],"store":["🏪","🏬"],"school":["🏫"],"department":["🏬"],"castle":["🏯","🏰"],"wed":["💒"],"tokyo":["🗼"],"tower":["🗼"],"statue":["🗽"],"liberty":["🗽"],"church":["⛪"],"mosque":["🕌"],"hindu":["🛕"],"temple":["🛕"],"synagogue":["🕍"],"shinto":["⛩️"],"shrine":["⛩️"],"kaaba":["🕋"],"fountain":["⛲","🖋️"],"tent":["⛺","🎪"],"foggy":["🌁"],"night":["🌃","🌉"],"stars":["🌃"],"cityscape":["🏙️","🌆"],"sunrise":["🌄","🌅"],"mountains":["🌄"],"dusk":["🌆"],"sunset":["🌇"],"bridge":["🌉"],"springs":["♨️"],"carousel":["🎠"],"playground":["🛝"],"slide":["🛝"],"ferris":["🎡"],"wheel":["🎡","🛞","☸️"],"roller":["🎢","🛼"],"coaster":["🎢"],"barber":["💈"],"pole":["💈","🎣"],"circus":["🎪"],"locomotive":["🚂"],"railway":["🚃","🚞","🛤️","🚟"],"car":["🚃","🚋","🚓","🚔","🏎️","🚨"],"high":["🚄","⚡","👠","🔊"],"speed":["🚄"],"train":["🚄","🚅","🚆"],"bullet":["🚅"],"metro":["🚇"],"rail":["🚈"],"station":["🚉"],"tram":["🚊","🚋"],"monorail":["🚝"],"bus":["🚌","🚍","🚏"],"trolleybus":["🚎"],"minibus":["🚐"],"ambulance":["🚑"],"engine":["🚒"],"taxi":["🚕","🚖"],"automobile":["🚗","🚘"],"sport":["🚙"],"utility":["🚙"],"vehicle":["🚙"],"pickup":["🛻"],"truck":["🛻","🚚"],"delivery":["🚚"],"articulated":["🚛"],"lorry":["🚛"],"tractor":["🚜"],"motorcycle":["🏍️"],"motor":["🛵","🛥️"],"scooter":["🛵","🛴"],"auto":["🛺"],"rickshaw":["🛺"],"bicycle":["🚲"],"kick":["🛴"],"skateboard":["🛹"],"skate":["🛼","⛸️"],"stop":["🚏","🛑","⏹️"],"motorway":["🛣️"],"track":["🛤️","⏭️","⏮️"],"oil":["🛢️"],"drum":["🛢️","🥁","🪘"],"fuel":["⛽"],"pump":["⛽"],"horizontal":["🚥"],"traffic":["🚥","🚦"],"vertical":["🚦","🔃"],"anchor":["⚓"],"ring":["🛟","💍"],"buoy":["🛟"],"sailboat":["⛵"],"canoe":["🛶"],"speedboat":["🚤"],"passenger":["🛳️"],"ship":["🛳️","🚢"],"ferry":["⛴️"],"airplane":["✈️","🛩️","🛫","🛬"],"small":["🛩️","🌤️","◾","◽","▪️","▫️","🔸","🔹"],"departure":["🛫"],"arrival":["🛬"],"parachute":["🪂"],"seat":["💺"],"helicopter":["🚁"],"suspension":["🚟"],"cableway":["🚠"],"aerial":["🚡"],"tramway":["🚡"],"satellite":["🛰️","📡"],"rocket":["🚀"],"saucer":["🛸"],"bellhop":["🛎️"],"luggage":["🧳","🛅"],"hourglass":["⌛","⏳"],"done":["⌛","⏳"],"not":["⏳","🈶"],"watch":["⌚"],"alarm":["⏰"],"clock":["⏰","⏲️","🕰️","🕛","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚"],"stopwatch":["⏱️"],"timer":["⏲️"],"mantelpiece":["🕰️"],"twelve":["🕛","🕧"],"thirty":["🕧","🕜","🕝","🕞","🕟","🕠","🕡","🕢","🕣","🕤","🕥","🕦"],"one":["🕐","🕜","🩱","🔞"],"three":["🕒","🕞"],"five":["🕔","🕠"],"six":["🕕","🕡","🔯"],"seven":["🕖","🕢"],"eight":["🕗","🕣","✳️","✴️"],"nine":["🕘","🕤"],"ten":["🕙","🕥"],"eleven":["🕚","🕦"],"new":["🌑","🌚","🆕","🇳🇨","🇳🇿","🇵🇬"],"wax":["🌒","🌔"],"crescent":["🌒","🌘","🌙","☪️"],"first":["🌓","🌛"],"quarter":["🌓","🌗","🌛","🌜"],"gibbous":["🌔","🌖"],"full":["🌕","🌝"],"wane":["🌖","🌘"],"last":["🌗","🌜","⏮️"],"sun":["☀️","🌞","⛅","🌤️","🌥️","🌦️"],"ringed":["🪐"],"planet":["🪐"],"glow":["🌟"],"shoot":["🌠"],"milky":["🌌"],"way":["🌌"],"cloud":["☁️","⛅","⛈️","🌤️","🌥️","🌦️","🌧️","🌨️","🌩️"],"behind":["⛅","🌤️","🌥️","🌦️"],"lightning":["⛈️","🌩️"],"rain":["⛈️","🌦️","🌧️","☔"],"large":["🌥️","⬛","⬜","🔶","🔷"],"tornado":["🌪️"],"fog":["🌫️"],"cyclone":["🌀"],"rainbow":["🌈","🏳️‍🌈"],"drops":["☔"],"ground":["⛱️"],"voltage":["⚡"],"snowflake":["❄️"],"snowman":["☃️","⛄"],"comet":["☄️"],"droplet":["💧"],"jack":["🎃"],"lantern":["🎃","🏮"],"christmas":["🎄","🇨🇽"],"fireworks":["🎆"],"sparkler":["🎇"],"firecracker":["🧨"],"sparkles":["✨"],"popper":["🎉"],"confetti":["🎊"],"tanabata":["🎋"],"pine":["🎍"],"dolls":["🎎","🪆"],"carp":["🎏"],"streamer":["🎏"],"chime":["🎐"],"view":["🎑"],"ceremony":["🎑"],"envelope":["🧧","✉️","📨","📩"],"wrapped":["🎁"],"gift":["🎁"],"reminder":["🎗️"],"admission":["🎟️"],"tickets":["🎟️"],"ticket":["🎫"],"military":["🎖️","🪖"],"medal":["🎖️","🏅","🥇","🥈","🥉"],"trophy":["🏆"],"sports":["🏅"],"1st":["🥇"],"place":["🥇","🥈","🥉","🛐"],"2nd":["🥈"],"3rd":["🥉"],"soccer":["⚽"],"baseball":["⚾"],"softball":["🥎"],"basketball":["🏀"],"volleyball":["🏐"],"american":["🏈","🇦🇸"],"football":["🏈","🏉"],"rugby":["🏉"],"tennis":["🎾"],"disc":["🥏"],"game":["🏏","🎮","🎲"],"field":["🏑"],"hockey":["🏑","🏒"],"lacrosse":["🥍"],"ping":["🏓"],"pong":["🏓"],"badminton":["🏸"],"glove":["🥊"],"martial":["🥋"],"arts":["🥋","🎭"],"uniform":["🥋"],"goal":["🥅"],"net":["🥅"],"flag":["⛳","📫","📪","📬","📭","🏁","🚩","🏴","🏳️","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️","🇦🇨","🇦🇩","🇦🇪","🇦🇫","🇦🇬","🇦🇮","🇦🇱","🇦🇲","🇦🇴","🇦🇶","🇦🇷","🇦🇸","🇦🇹","🇦🇺","🇦🇼","🇦🇽","🇦🇿","🇧🇦","🇧🇧","🇧🇩","🇧🇪","🇧🇫","🇧🇬","🇧🇭","🇧🇮","🇧🇯","🇧🇱","🇧🇲","🇧🇳","🇧🇴","🇧🇶","🇧🇷","🇧🇸","🇧🇹","🇧🇻","🇧🇼","🇧🇾","🇧🇿","🇨🇦","🇨🇨","🇨🇩","🇨🇫","🇨🇬","🇨🇭","🇨🇮","🇨🇰","🇨🇱","🇨🇲","🇨🇳","🇨🇴","🇨🇵","🇨🇷","🇨🇺","🇨🇻","🇨🇼","🇨🇽","🇨🇾","🇨🇿","🇩🇪","🇩🇬","🇩🇯","🇩🇰","🇩🇲","🇩🇴","🇩🇿","🇪🇦","🇪🇨","🇪🇪","🇪🇬","🇪🇭","🇪🇷","🇪🇸","🇪🇹","🇪🇺","🇫🇮","🇫🇯","🇫🇰","🇫🇲","🇫🇴","🇫🇷","🇬🇦","🇬🇧","🇬🇩","🇬🇪","🇬🇫","🇬🇬","🇬🇭","🇬🇮","🇬🇱","🇬🇲","🇬🇳","🇬🇵","🇬🇶","🇬🇷","🇬🇸","🇬🇹","🇬🇺","🇬🇼","🇬🇾","🇭🇰","🇭🇲","🇭🇳","🇭🇷","🇭🇹","🇭🇺","🇮🇨","🇮🇩","🇮🇪","🇮🇱","🇮🇲","🇮🇳","🇮🇴","🇮🇶","🇮🇷","🇮🇸","🇮🇹","🇯🇪","🇯🇲","🇯🇴","🇯🇵","🇰🇪","🇰🇬","🇰🇭","🇰🇮","🇰🇲","🇰🇳","🇰🇵","🇰🇷","🇰🇼","🇰🇾","🇰🇿","🇱🇦","🇱🇧","🇱🇨","🇱🇮","🇱🇰","🇱🇷","🇱🇸","🇱🇹","🇱🇺","🇱🇻","🇱🇾","🇲🇦","🇲🇨","🇲🇩","🇲🇪","🇲🇫","🇲🇬","🇲🇭","🇲🇰","🇲🇱","🇲🇲","🇲🇳","🇲🇴","🇲🇵","🇲🇶","🇲🇷","🇲🇸","🇲🇹","🇲🇺","🇲🇻","🇲🇼","🇲🇽","🇲🇾","🇲🇿","🇳🇦","🇳🇨","🇳🇪","🇳🇫","🇳🇬","🇳🇮","🇳🇱","🇳🇴","🇳🇵","🇳🇷","🇳🇺","🇳🇿","🇴🇲","🇵🇦","🇵🇪","🇵🇫","🇵🇬","🇵🇭","🇵🇰","🇵🇱","🇵🇲","🇵🇳","🇵🇷","🇵🇸","🇵🇹","🇵🇼","🇵🇾","🇶🇦","🇷🇪","🇷🇴","🇷🇸","🇷🇺","🇷🇼","🇸🇦","🇸🇧","🇸🇨","🇸🇩","🇸🇪","🇸🇬","🇸🇭","🇸🇮","🇸🇯","🇸🇰","🇸🇱","🇸🇲","🇸🇳","🇸🇴","🇸🇷","🇸🇸","🇸🇹","🇸🇻","🇸🇽","🇸🇾","🇸🇿","🇹🇦","🇹🇨","🇹🇩","🇹🇫","🇹🇬","🇹🇭","🇹🇯","🇹🇰","🇹🇱","🇹🇲","🇹🇳","🇹🇴","🇹🇷","🇹🇹","🇹🇻","🇹🇼","🇹🇿","🇺🇦","🇺🇬","🇺🇲","🇺🇳","🇺🇸","🇺🇾","🇺🇿","🇻🇦","🇻🇨","🇻🇪","🇻🇬","🇻🇮","🇻🇳","🇻🇺","🇼🇫","🇼🇸","🇽🇰","🇾🇪","🇾🇹","🇿🇦","🇿🇲","🇿🇼","🏴󠁧󠁢󠁥󠁮󠁧󠁿","🏴󠁧󠁢󠁳󠁣󠁴󠁿","🏴󠁧󠁢󠁷󠁬󠁳󠁿"],"dive":["🤿"],"shirt":["🎽","👕"],"skis":["🎿"],"sled":["🛷"],"curl":["🥌","📃"],"stone":["🥌","💎"],"bullseye":["🎯"],"yo":["🪀"],"kite":["🪁"],"pistol":["🔫"],"pool":["🎱"],"crystal":["🔮"],"magic":["🪄"],"wand":["🪄"],"video":["🎮","📹"],"joystick":["🕹️"],"slot":["🎰"],"machine":["🎰","📠"],"die":["🎲"],"puzzle":["🧩"],"piece":["🧩","🩱"],"teddy":["🧸"],"pinata":["🪅"],"mirror":["🪩","🪞"],"spade":["♠️"],"diamond":["♦️","🔶","🔷","🔸","🔹","💠"],"club":["♣️"],"chess":["♟️"],"pawn":["♟️"],"joker":["🃏"],"mahjong":["🀄"],"cards":["🎴"],"perform":["🎭"],"framed":["🖼️"],"picture":["🖼️"],"palette":["🎨"],"thread":["🧵"],"sew":["🪡"],"needle":["🪡"],"yarn":["🧶"],"knot":["🪢"],"goggles":["🥽"],"lab":["🥼"],"coat":["🥼","🧥"],"safety":["🦺","🧷"],"vest":["🦺"],"necktie":["👔"],"jeans":["👖"],"scarf":["🧣"],"gloves":["🧤"],"socks":["🧦"],"dress":["👗"],"kimono":["👘"],"sari":["🥻"],"swimsuit":["🩱"],"briefs":["🩲"],"shorts":["🩳"],"bikini":["👙"],"clothes":["👚"],"fold":["🪭"],"fan":["🪭"],"purse":["👛"],"handbag":["👜"],"clutch":["👝"],"bag":["👝","💰"],"shop":["🛍️","🛒"],"bags":["🛍️"],"backpack":["🎒"],"thong":["🩴"],"sandal":["🩴","👡"],"shoe":["👞","👟","🥿","👠"],"hike":["🥾"],"boot":["🥾","👢"],"flat":["🥿"],"heeled":["👠"],"ballet":["🩰"],"shoes":["🩰"],"pick":["🪮","⛏️","⚒️"],"top":["🎩","🔝"],"graduation":["🎓"],"cap":["🎓","🧢"],"billed":["🧢"],"helmet":["🪖","⛑️"],"rescue":["⛑️"],"prayer":["📿"],"beads":["📿"],"lipstick":["💄"],"gem":["💎"],"muted":["🔇"],"speaker":["🔇","🔈","🔉","🔊"],"low":["🔈","🪫"],"volume":["🔈","🔉","🔊"],"medium":["🔉","◼️","◻️","◾","◽"],"loudspeaker":["📢"],"megaphone":["📣"],"postal":["📯"],"horn":["📯"],"slash":["🔕"],"musical":["🎼","🎵","🎶","🎹"],"score":["🎼"],"note":["🎵"],"notes":["🎶"],"studio":["🎙️"],"microphone":["🎙️","🎤"],"level":["🎚️"],"slider":["🎚️"],"control":["🎛️","🛂"],"knobs":["🎛️"],"headphone":["🎧"],"radio":["📻","🔘"],"saxophone":["🎷"],"accordion":["🪗"],"guitar":["🎸"],"keyboard":["🎹","⌨️"],"trumpet":["🎺"],"violin":["🎻"],"banjo":["🪕"],"long":["🪘"],"maracas":["🪇"],"flute":["🪈"],"mobile":["📱","📲","📵","📴"],"phone":["📱","📲","📴"],"telephone":["☎️","📞"],"receiver":["📞"],"pager":["📟"],"fax":["📠"],"battery":["🔋","🪫"],"electric":["🔌"],"plug":["🔌"],"laptop":["💻"],"desktop":["🖥️"],"computer":["🖥️","🖱️","💽"],"printer":["🖨️"],"trackball":["🖲️"],"disk":["💽","💾","💿"],"floppy":["💾"],"optical":["💿"],"dvd":["📀"],"abacus":["🧮"],"movie":["🎥"],"camera":["🎥","📷","📸","📹"],"film":["🎞️","📽️"],"frames":["🎞️"],"projector":["📽️"],"clapper":["🎬"],"board":["🎬"],"television":["📺"],"flash":["📸"],"videocassette":["📼"],"magnify":["🔍","🔎"],"tilted":["🔍","🔎"],"candle":["🕯️"],"bulb":["💡"],"flashlight":["🔦"],"paper":["🏮","🧻"],"diya":["🪔"],"lamp":["🪔","🛋️"],"notebook":["📔","📓"],"decorative":["📔"],"cover":["📔"],"book":["📕","📖","📗","📘","📙"],"books":["📚"],"ledger":["📒"],"page":["📃","📄"],"scroll":["📜"],"newspaper":["📰","🗞️"],"rolled":["🗞️"],"bookmark":["📑","🔖"],"tabs":["📑"],"label":["🏷️"],"coin":["🪙"],"yen":["💴","💹"],"banknote":["💴","💵","💶","💷"],"dollar":["💵","💲"],"euro":["💶"],"pound":["💷"],"wings":["💸"],"credit":["💳"],"card":["💳","🗂️","📇","🗃️","🪪"],"receipt":["🧾"],"chart":["💹","📈","📉","📊"],"increase":["💹","📈"],"mail":["📧"],"income":["📨"],"outbox":["📤"],"tray":["📤","📥"],"inbox":["📥"],"package":["📦"],"mailbox":["📫","📪","📬","📭"],"lowered":["📪","📭"],"postbox":["📮"],"ballot":["🗳️"],"pencil":["✏️"],"nib":["✒️"],"pen":["🖋️","🖊️","🔏"],"paintbrush":["🖌️"],"crayon":["🖍️"],"memo":["📝"],"briefcase":["💼"],"file":["📁","📂","🗃️","🗄️"],"folder":["📁","📂"],"dividers":["🗂️"],"calendar":["📅","📆","🗓️"],"off":["📆","📴"],"notepad":["🗒️"],"decrease":["📉"],"clipboard":["📋"],"pushpin":["📌","📍"],"round":["📍"],"paperclip":["📎"],"linked":["🖇️"],"paperclips":["🖇️"],"straight":["📏"],"ruler":["📏","📐"],"triangular":["📐","🚩"],"scissors":["✂️"],"cabinet":["🗄️"],"wastebasket":["🗑️"],"locked":["🔒","🔏","🔐"],"unlocked":["🔓"],"key":["🔐","🔑","🗝️"],"hammer":["🔨","⚒️","🛠️"],"axe":["🪓"],"wrench":["🛠️","🔧"],"dagger":["🗡️"],"swords":["⚔️"],"bomb":["💣"],"boomerang":["🪃"],"shield":["🛡️"],"carpentry":["🪚"],"saw":["🪚"],"screwdriver":["🪛"],"nut":["🔩"],"bolt":["🔩"],"gear":["⚙️"],"clamp":["🗜️"],"balance":["⚖️"],"scale":["⚖️"],"link":["🔗"],"chains":["⛓️"],"hook":["🪝"],"toolbox":["🧰"],"magnet":["🧲"],"ladder":["🪜"],"alembic":["⚗️"],"test":["🧪"],"tube":["🧪"],"petri":["🧫"],"dish":["🧫"],"dna":["🧬"],"microscope":["🔬"],"telescope":["🔭"],"antenna":["📡","📶"],"syringe":["💉"],"drop":["🩸"],"blood":["🩸","🅰️","🆎","🅱️","🅾️"],"pill":["💊"],"adhesive":["🩹"],"crutch":["🩼"],"stethoscope":["🩺"],"ray":["🩻"],"door":["🚪"],"elevator":["🛗"],"window":["🪟"],"couch":["🛋️"],"chair":["🪑"],"toilet":["🚽"],"plunger":["🪠"],"shower":["🚿"],"bathtub":["🛁"],"trap":["🪤"],"razor":["🪒"],"lotion":["🧴"],"pin":["🧷"],"broom":["🧹"],"basket":["🧺"],"bucket":["🪣"],"soap":["🧼"],"bubbles":["🫧"],"toothbrush":["🪥"],"sponge":["🧽"],"extinguisher":["🧯"],"cart":["🛒"],"cigarette":["🚬"],"coffin":["⚰️"],"headstone":["🪦"],"funeral":["⚱️"],"urn":["⚱️"],"nazar":["🧿"],"amulet":["🧿"],"hamsa":["🪬"],"moai":["🗿"],"placard":["🪧"],"identification":["🪪"],"atm":["🏧"],"litter":["🚮","🚯"],"bin":["🚮"],"potable":["🚰","🚱"],"restroom":["🚻"],"closet":["🚾"],"passport":["🛂"],"customs":["🛃"],"baggage":["🛄"],"claim":["🛄"],"warn":["⚠️"],"children":["🚸"],"cross":["🚸","✝️","☦️","❌","❎"],"entry":["⛔"],"prohibited":["🚫","🈲"],"bicycles":["🚳"],"smoke":["🚭"],"non":["🚱"],"pedestrians":["🚷"],"phones":["📵"],"under":["🔞"],"eighteen":["🔞"],"radioactive":["☢️"],"biohazard":["☣️"],"curve":["↩️","↪️","⤴️","⤵️"],"clockwise":["🔃"],"arrows":["🔃","🔄"],"counterclockwise":["🔄"],"button":["🔄","🔀","🔁","🔂","▶️","⏩","⏭️","⏯️","◀️","⏪","⏮️","🔼","⏫","🔽","⏬","⏸️","⏹️","⏺️","⏏️","🔅","🔆","✅","❎","🅰️","🆎","🅱️","🆑","🆒","🆓","🆔","🆕","🆖","🅾️","🆗","🅿️","🆘","🆙","🆚","🈁","🈂️","🈷️","🈶","🈯","🉐","🈹","🈚","🈲","🉑","🈸","🈴","🈳","㊗️","㊙️","🈺","🈵","🔘","🔳","🔲"],"end":["🔚"],"soon":["🔜"],"worship":["🛐"],"atom":["⚛️"],"om":["🕉️"],"david":["✡️"],"dharma":["☸️"],"yin":["☯️"],"yang":["☯️"],"latin":["✝️","🔠","🔡","🔤"],"orthodox":["☦️"],"peace":["☮️"],"menorah":["🕎"],"pointed":["🔯","✴️","🔺","🔻"],"khanda":["🪯"],"aries":["♈"],"taurus":["♉"],"gemini":["♊"],"cancer":["♋"],"leo":["♌"],"virgo":["♍"],"libra":["♎"],"scorpio":["♏"],"sagittarius":["♐"],"capricorn":["♑"],"aquarius":["♒"],"pisces":["♓"],"ophiuchus":["⛎"],"shuffle":["🔀"],"tracks":["🔀"],"repeat":["🔁","🔂"],"single":["🔂"],"fast":["⏩","⏪","⏫","⏬"],"forward":["⏩"],"next":["⏭️"],"or":["⏯️"],"pause":["⏯️","⏸️"],"reverse":["◀️","⏪"],"upwards":["🔼"],"downwards":["🔽"],"record":["⏺️"],"eject":["⏏️"],"cinema":["🎦"],"dim":["🔅"],"bright":["🔆"],"bars":["📶"],"wireless":["🛜"],"vibration":["📳"],"mode":["📳"],"female":["♀️"],"male":["♂️"],"transgender":["⚧️","🏳️‍⚧️"],"multiply":["✖️"],"plus":["➕"],"minus":["➖"],"divide":["➗"],"heavy":["🟰","💲"],"equals":["🟰"],"infinity":["♾️"],"double":["‼️","➿"],"question":["⁉️","❓","❔"],"wavy":["〰️"],"currency":["💱"],"exchange":["💱"],"recycle":["♻️"],"fleur":["⚜️"],"de":["⚜️"],"lis":["⚜️"],"trident":["🔱"],"emblem":["🔱"],"name":["📛"],"badge":["📛"],"for":["🔰","🈺"],"beginner":["🔰"],"hollow":["⭕"],"circle":["⭕","🔴","🟠","🟡","🟢","🔵","🟣","🟤","⚫","⚪"],"check":["✅","☑️","✔️"],"loop":["➰","➿"],"part":["〽️"],"alternation":["〽️"],"spoked":["✳️"],"asterisk":["✳️"],"copyright":["©️"],"registered":["®️"],"trade":["™️"],"keycap":["#️⃣","*️⃣","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"],"input":["🔠","🔡","🔢","🔣","🔤"],"uppercase":["🔠"],"lowercase":["🔡"],"numbers":["🔢"],"letters":["🔤"],"type":["🅰️","🆎","🅱️","🅾️"],"ab":["🆎"],"cl":["🆑"],"cool":["🆒"],"free":["🆓","🈶","🈚"],"information":["ℹ️"],"id":["🆔"],"circled":["Ⓜ️"],"ng":["🆖"],"sos":["🆘"],"vs":["🆚"],"here":["🈁"],"charge":["🈂️","🈶","🈚"],"monthly":["🈷️"],"amount":["🈷️"],"reserved":["🈯"],"bargain":["🉐"],"discount":["🈹"],"acceptable":["🉑"],"application":["🈸"],"pass":["🈴"],"grade":["🈴"],"vacancy":["🈳","🈵"],"congratulations":["㊗️"],"secret":["㊙️"],"business":["🈺"],"square":["🟥","🟧","🟨","🟩","🟦","🟪","🟫","⬛","⬜","◼️","◻️","◾","◽","▪️","▫️","🔳","🔲"],"triangle":["🔺","🔻"],"dot":["💠"],"chequered":["🏁"],"flags":["🎌"],"pirate":["🏴‍☠️"],"ascension":["🇦🇨"],"andorra":["🇦🇩"],"united":["🇦🇪","🇬🇧","🇺🇳","🇺🇸"],"arab":["🇦🇪"],"emirates":["🇦🇪"],"afghanistan":["🇦🇫"],"antigua":["🇦🇬"],"barbuda":["🇦🇬"],"anguilla":["🇦🇮"],"albania":["🇦🇱"],"armenia":["🇦🇲"],"angola":["🇦🇴"],"antarctica":["🇦🇶"],"argentina":["🇦🇷"],"samoa":["🇦🇸","🇼🇸"],"austria":["🇦🇹"],"aruba":["🇦🇼"],"aland":["🇦🇽"],"islands":["🇦🇽","🇨🇨","🇨🇰","🇫🇰","🇫🇴","🇬🇸","🇭🇲","🇮🇨","🇰🇾","🇲🇭","🇲🇵","🇵🇳","🇸🇧","🇹🇨","🇺🇲","🇻🇬","🇻🇮"],"azerbaijan":["🇦🇿"],"bosnia":["🇧🇦"],"herzegovina":["🇧🇦"],"barbados":["🇧🇧"],"bangladesh":["🇧🇩"],"belgium":["🇧🇪"],"burkina":["🇧🇫"],"faso":["🇧🇫"],"bulgaria":["🇧🇬"],"bahrain":["🇧🇭"],"burundi":["🇧🇮"],"benin":["🇧🇯"],"st":["🇧🇱","🇰🇳","🇱🇨","🇲🇫","🇵🇲","🇸🇭","🇻🇨"],"barthelemy":["🇧🇱"],"bermuda":["🇧🇲"],"brunei":["🇧🇳"],"bolivia":["🇧🇴"],"caribbean":["🇧🇶"],"netherlands":["🇧🇶","🇳🇱"],"brazil":["🇧🇷"],"bahamas":["🇧🇸"],"bhutan":["🇧🇹"],"bouvet":["🇧🇻"],"botswana":["🇧🇼"],"belarus":["🇧🇾"],"belize":["🇧🇿"],"canada":["🇨🇦"],"cocos":["🇨🇨"],"keel":["🇨🇨"],"congo":["🇨🇩","🇨🇬"],"kinshasa":["🇨🇩"],"central":["🇨🇫"],"african":["🇨🇫"],"republic":["🇨🇫","🇩🇴"],"brazzaville":["🇨🇬"],"switzerland":["🇨🇭"],"cote":["🇨🇮"],"ivoire":["🇨🇮"],"chile":["🇨🇱"],"cameroon":["🇨🇲"],"china":["🇨🇳","🇭🇰","🇲🇴"],"colombia":["🇨🇴"],"clipperton":["🇨🇵"],"costa":["🇨🇷"],"rica":["🇨🇷"],"cuba":["🇨🇺"],"cape":["🇨🇻"],"verde":["🇨🇻"],"curacao":["🇨🇼"],"cyprus":["🇨🇾"],"czechia":["🇨🇿"],"germany":["🇩🇪"],"diego":["🇩🇬"],"garcia":["🇩🇬"],"djibouti":["🇩🇯"],"denmark":["🇩🇰"],"dominica":["🇩🇲"],"dominican":["🇩🇴"],"algeria":["🇩🇿"],"ceuta":["🇪🇦"],"melilla":["🇪🇦"],"ecuador":["🇪🇨"],"estonia":["🇪🇪"],"egypt":["🇪🇬"],"western":["🇪🇭"],"sahara":["🇪🇭"],"eritrea":["🇪🇷"],"spain":["🇪🇸"],"ethiopia":["🇪🇹"],"european":["🇪🇺"],"union":["🇪🇺"],"finland":["🇫🇮"],"fiji":["🇫🇯"],"falkland":["🇫🇰"],"micronesia":["🇫🇲"],"faroe":["🇫🇴"],"france":["🇫🇷"],"gabon":["🇬🇦"],"kingdom":["🇬🇧"],"grenada":["🇬🇩"],"georgia":["🇬🇪","🇬🇸"],"guiana":["🇬🇫"],"guernsey":["🇬🇬"],"ghana":["🇬🇭"],"gibraltar":["🇬🇮"],"greenland":["🇬🇱"],"gambia":["🇬🇲"],"guinea":["🇬🇳","🇬🇶","🇬🇼","🇵🇬"],"guadeloupe":["🇬🇵"],"equatorial":["🇬🇶"],"greece":["🇬🇷"],"south":["🇬🇸","🇰🇷","🇸🇸","🇿🇦"],"guatemala":["🇬🇹"],"guam":["🇬🇺"],"bissau":["🇬🇼"],"guyana":["🇬🇾"],"hong":["🇭🇰"],"kong":["🇭🇰"],"sar":["🇭🇰","🇲🇴"],"heard":["🇭🇲"],"mcdonald":["🇭🇲"],"honduras":["🇭🇳"],"croatia":["🇭🇷"],"haiti":["🇭🇹"],"hungary":["🇭🇺"],"canary":["🇮🇨"],"indonesia":["🇮🇩"],"ireland":["🇮🇪"],"israel":["🇮🇱"],"isle":["🇮🇲"],"india":["🇮🇳"],"british":["🇮🇴","🇻🇬"],"indian":["🇮🇴"],"ocean":["🇮🇴"],"territory":["🇮🇴"],"iraq":["🇮🇶"],"iran":["🇮🇷"],"iceland":["🇮🇸"],"italy":["🇮🇹"],"jersey":["🇯🇪"],"jamaica":["🇯🇲"],"jordan":["🇯🇴"],"kenya":["🇰🇪"],"kyrgyzstan":["🇰🇬"],"cambodia":["🇰🇭"],"kiribati":["🇰🇮"],"comoros":["🇰🇲"],"kitts":["🇰🇳"],"nevis":["🇰🇳"],"north":["🇰🇵","🇲🇰"],"korea":["🇰🇵","🇰🇷"],"kuwait":["🇰🇼"],"cayman":["🇰🇾"],"kazakhstan":["🇰🇿"],"laos":["🇱🇦"],"lebanon":["🇱🇧"],"lucia":["🇱🇨"],"liechtenstein":["🇱🇮"],"sri":["🇱🇰"],"lanka":["🇱🇰"],"liberia":["🇱🇷"],"lesotho":["🇱🇸"],"lithuania":["🇱🇹"],"luxembourg":["🇱🇺"],"latvia":["🇱🇻"],"libya":["🇱🇾"],"morocco":["🇲🇦"],"monaco":["🇲🇨"],"moldova":["🇲🇩"],"montenegro":["🇲🇪"],"martin":["🇲🇫"],"madagascar":["🇲🇬"],"marshall":["🇲🇭"],"macedonia":["🇲🇰"],"mali":["🇲🇱"],"myanmar":["🇲🇲"],"burma":["🇲🇲"],"mongolia":["🇲🇳"],"macao":["🇲🇴"],"northern":["🇲🇵"],"mariana":["🇲🇵"],"martinique":["🇲🇶"],"mauritania":["🇲🇷"],"montserrat":["🇲🇸"],"malta":["🇲🇹"],"mauritius":["🇲🇺"],"maldives":["🇲🇻"],"malawi":["🇲🇼"],"mexico":["🇲🇽"],"malaysia":["🇲🇾"],"mozambique":["🇲🇿"],"namibia":["🇳🇦"],"caledonia":["🇳🇨"],"niger":["🇳🇪"],"norfolk":["🇳🇫"],"nigeria":["🇳🇬"],"nicaragua":["🇳🇮"],"norway":["🇳🇴"],"nepal":["🇳🇵"],"nauru":["🇳🇷"],"niue":["🇳🇺"],"zealand":["🇳🇿"],"oman":["🇴🇲"],"panama":["🇵🇦"],"peru":["🇵🇪"],"polynesia":["🇵🇫"],"papua":["🇵🇬"],"philippines":["🇵🇭"],"pakistan":["🇵🇰"],"poland":["🇵🇱"],"pierre":["🇵🇲"],"miquelon":["🇵🇲"],"pitcairn":["🇵🇳"],"puerto":["🇵🇷"],"rico":["🇵🇷"],"palestinian":["🇵🇸"],"territories":["🇵🇸","🇹🇫"],"portugal":["🇵🇹"],"palau":["🇵🇼"],"paraguay":["🇵🇾"],"qatar":["🇶🇦"],"reunion":["🇷🇪"],"romania":["🇷🇴"],"serbia":["🇷🇸"],"russia":["🇷🇺"],"rwanda":["🇷🇼"],"saudi":["🇸🇦"],"arabia":["🇸🇦"],"solomon":["🇸🇧"],"seychelles":["🇸🇨"],"sudan":["🇸🇩","🇸🇸"],"sweden":["🇸🇪"],"singapore":["🇸🇬"],"helena":["🇸🇭"],"slovenia":["🇸🇮"],"svalbard":["🇸🇯"],"jan":["🇸🇯"],"mayen":["🇸🇯"],"slovakia":["🇸🇰"],"sierra":["🇸🇱"],"leone":["🇸🇱"],"san":["🇸🇲"],"marino":["🇸🇲"],"senegal":["🇸🇳"],"somalia":["🇸🇴"],"suriname":["🇸🇷"],"sao":["🇸🇹"],"tome":["🇸🇹"],"principe":["🇸🇹"],"el":["🇸🇻"],"salvador":["🇸🇻"],"sint":["🇸🇽"],"maarten":["🇸🇽"],"syria":["🇸🇾"],"eswatini":["🇸🇿"],"tristan":["🇹🇦"],"da":["🇹🇦"],"cunha":["🇹🇦"],"turks":["🇹🇨"],"caicos":["🇹🇨"],"chad":["🇹🇩"],"southern":["🇹🇫"],"togo":["🇹🇬"],"thailand":["🇹🇭"],"tajikistan":["🇹🇯"],"tokelau":["🇹🇰"],"timor":["🇹🇱"],"leste":["🇹🇱"],"turkmenistan":["🇹🇲"],"tunisia":["🇹🇳"],"tonga":["🇹🇴"],"trinidad":["🇹🇹"],"tobago":["🇹🇹"],"tuvalu":["🇹🇻"],"taiwan":["🇹🇼"],"tanzania":["🇹🇿"],"ukraine":["🇺🇦"],"uganda":["🇺🇬"],"us":["🇺🇲","🇻🇮"],"outly":["🇺🇲"],"nations":["🇺🇳"],"states":["🇺🇸"],"uruguay":["🇺🇾"],"uzbekistan":["🇺🇿"],"vatican":["🇻🇦"],"city":["🇻🇦"],"vincent":["🇻🇨"],"grenadines":["🇻🇨"],"venezuela":["🇻🇪"],"virgin":["🇻🇬","🇻🇮"],"vietnam":["🇻🇳"],"vanuatu":["🇻🇺"],"wallis":["🇼🇫"],"futuna":["🇼🇫"],"kosovo":["🇽🇰"],"yemen":["🇾🇪"],"mayotte":["🇾🇹"],"zambia":["🇿🇲"],"zimbabwe":["🇿🇼"],"england":["🏴󠁧󠁢󠁥󠁮󠁧󠁿"],"scotland":["🏴󠁧󠁢󠁳󠁣󠁴󠁿"],"wales":["🏴󠁧󠁢󠁷󠁬󠁳󠁿"]} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/string-kit/lib/json-data/emoji-char-to-canonical-name.json' , '/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {"😀":"grinning-face","😃":"grinning-face-with-big-eyes","😄":"grinning-face-with-smiling-eyes","😁":"beaming-face-with-smiling-eyes","😆":"grinning-squinting-face","😅":"grinning-face-with-sweat","🤣":"rolling-on-the-floor-laughing","😂":"face-with-tears-of-joy","🙂":"slightly-smiling-face","🙃":"upside-down-face","🫠":"melting-face","😉":"winking-face","😊":"smiling-face-with-smiling-eyes","😇":"smiling-face-with-halo","🥰":"smiling-face-with-hearts","😍":"smiling-face-with-heart-eyes","🤩":"star-struck","😘":"face-blowing-a-kiss","😗":"kissing-face","☺️":"smiling-face","😚":"kissing-face-with-closed-eyes","😙":"kissing-face-with-smiling-eyes","🥲":"smiling-face-with-tear","😋":"face-savoring-food","😛":"face-with-tongue","😜":"winking-face-with-tongue","🤪":"zany-face","😝":"squinting-face-with-tongue","🤑":"money-mouth-face","🤗":"smiling-face-with-open-hands","🤭":"face-with-hand-over-mouth","🫢":"face-with-open-eyes-and-hand-over-mouth","🫣":"face-with-peeking-eye","🤫":"shushing-face","🤔":"thinking-face","🫡":"saluting-face","🤐":"zipper-mouth-face","🤨":"face-with-raised-eyebrow","😐":"neutral-face","😑":"expressionless-face","😶":"face-without-mouth","🫥":"dotted-line-face","😶‍🌫️":"face-in-clouds","😏":"smirking-face","😒":"unamused-face","🙄":"face-with-rolling-eyes","😬":"grimacing-face","😮‍💨":"face-exhaling","🤥":"lying-face","🫨":"shaking-face","😌":"relieved-face","😔":"pensive-face","😪":"sleepy-face","🤤":"drooling-face","😴":"sleeping-face","😷":"face-with-medical-mask","🤒":"face-with-thermometer","🤕":"face-with-head-bandage","🤢":"nauseated-face","🤮":"face-vomiting","🤧":"sneezing-face","🥵":"hot-face","🥶":"cold-face","🥴":"woozy-face","😵":"face-with-crossed-out-eyes","😵‍💫":"face-with-spiral-eyes","🤯":"exploding-head","🤠":"cowboy-hat-face","🥳":"partying-face","🥸":"disguised-face","😎":"smiling-face-with-sunglasses","🤓":"nerd-face","🧐":"face-with-monocle","😕":"confused-face","🫤":"face-with-diagonal-mouth","😟":"worried-face","🙁":"slightly-frowning-face","☹️":"frowning-face","😮":"face-with-open-mouth","😯":"hushed-face","😲":"astonished-face","😳":"flushed-face","🥺":"pleading-face","🥹":"face-holding-back-tears","😦":"frowning-face-with-open-mouth","😧":"anguished-face","😨":"fearful-face","😰":"anxious-face-with-sweat","😥":"sad-but-relieved-face","😢":"crying-face","😭":"loudly-crying-face","😱":"face-screaming-in-fear","😖":"confounded-face","😣":"persevering-face","😞":"disappointed-face","😓":"downcast-face-with-sweat","😩":"weary-face","😫":"tired-face","🥱":"yawning-face","😤":"face-with-steam-from-nose","😡":"enraged-face","😠":"angry-face","🤬":"face-with-symbols-on-mouth","😈":"smiling-face-with-horns","👿":"angry-face-with-horns","💀":"skull","☠️":"skull-and-crossbones","💩":"pile-of-poo","🤡":"clown-face","👹":"ogre","👺":"goblin","👻":"ghost","👽":"alien","👾":"alien-monster","🤖":"robot","😺":"grinning-cat","😸":"grinning-cat-with-smiling-eyes","😹":"cat-with-tears-of-joy","😻":"smiling-cat-with-heart-eyes","😼":"cat-with-wry-smile","😽":"kissing-cat","🙀":"weary-cat","😿":"crying-cat","😾":"pouting-cat","🙈":"see-no-evil-monkey","🙉":"hear-no-evil-monkey","🙊":"speak-no-evil-monkey","💌":"love-letter","💘":"heart-with-arrow","💝":"heart-with-ribbon","💖":"sparkling-heart","💗":"growing-heart","💓":"beating-heart","💞":"revolving-hearts","💕":"two-hearts","💟":"heart-decoration","❣️":"heart-exclamation","💔":"broken-heart","❤️‍🔥":"heart-on-fire","❤️‍🩹":"mending-heart","❤️":"red-heart","🩷":"pink-heart","🧡":"orange-heart","💛":"yellow-heart","💚":"green-heart","💙":"blue-heart","🩵":"light-blue-heart","💜":"purple-heart","🤎":"brown-heart","🖤":"black-heart","🩶":"grey-heart","🤍":"white-heart","💋":"kiss-mark","💯":"hundred-points","💢":"anger-symbol","💥":"collision","💫":"dizzy","💦":"sweat-droplets","💨":"dashing-away","🕳️":"hole","💬":"speech-balloon","👁️‍🗨️":"eye-in-speech-bubble","🗨️":"left-speech-bubble","🗯️":"right-anger-bubble","💭":"thought-balloon","💤":"zzz","👋":"waving-hand","🤚":"raised-back-of-hand","🖐️":"hand-with-fingers-splayed","✋":"raised-hand","🖖":"vulcan-salute","🫱":"rightwards-hand","🫲":"leftwards-hand","🫳":"palm-down-hand","🫴":"palm-up-hand","🫷":"leftwards-pushing-hand","🫸":"rightwards-pushing-hand","👌":"ok-hand","🤌":"pinched-fingers","🤏":"pinching-hand","✌️":"victory-hand","🤞":"crossed-fingers","🫰":"hand-with-index-finger-and-thumb-crossed","🤟":"love-you-gesture","🤘":"sign-of-the-horns","🤙":"call-me-hand","👈":"backhand-index-pointing-left","👉":"backhand-index-pointing-right","👆":"backhand-index-pointing-up","🖕":"middle-finger","👇":"backhand-index-pointing-down","☝️":"index-pointing-up","🫵":"index-pointing-at-the-viewer","👍":"thumbs-up","👎":"thumbs-down","✊":"raised-fist","👊":"oncoming-fist","🤛":"left-facing-fist","🤜":"right-facing-fist","👏":"clapping-hands","🙌":"raising-hands","🫶":"heart-hands","👐":"open-hands","🤲":"palms-up-together","🤝":"handshake","🙏":"folded-hands","✍️":"writing-hand","💅":"nail-polish","🤳":"selfie","💪":"flexed-biceps","🦾":"mechanical-arm","🦿":"mechanical-leg","🦵":"leg","🦶":"foot","👂":"ear","🦻":"ear-with-hearing-aid","👃":"nose","🧠":"brain","🫀":"anatomical-heart","🫁":"lungs","🦷":"tooth","🦴":"bone","👀":"eyes","👁️":"eye","👅":"tongue","👄":"mouth","🫦":"biting-lip","👶":"baby","🧒":"child","👦":"boy","👧":"girl","🧑":"person","👱":"person-blond-hair","👨":"man","🧔":"person-beard","🧔‍♂️":"man-beard","🧔‍♀️":"woman-beard","👨‍🦰":"man-red-hair","👨‍🦱":"man-curly-hair","👨‍🦳":"man-white-hair","👨‍🦲":"man-bald","👩":"woman","👩‍🦰":"woman-red-hair","🧑‍🦰":"person-red-hair","👩‍🦱":"woman-curly-hair","🧑‍🦱":"person-curly-hair","👩‍🦳":"woman-white-hair","🧑‍🦳":"person-white-hair","👩‍🦲":"woman-bald","🧑‍🦲":"person-bald","👱‍♀️":"woman-blond-hair","👱‍♂️":"man-blond-hair","🧓":"older-person","👴":"old-man","👵":"old-woman","🙍":"person-frowning","🙍‍♂️":"man-frowning","🙍‍♀️":"woman-frowning","🙎":"person-pouting","🙎‍♂️":"man-pouting","🙎‍♀️":"woman-pouting","🙅":"person-gesturing-no","🙅‍♂️":"man-gesturing-no","🙅‍♀️":"woman-gesturing-no","🙆":"person-gesturing-ok","🙆‍♂️":"man-gesturing-ok","🙆‍♀️":"woman-gesturing-ok","💁":"person-tipping-hand","💁‍♂️":"man-tipping-hand","💁‍♀️":"woman-tipping-hand","🙋":"person-raising-hand","🙋‍♂️":"man-raising-hand","🙋‍♀️":"woman-raising-hand","🧏":"deaf-person","🧏‍♂️":"deaf-man","🧏‍♀️":"deaf-woman","🙇":"person-bowing","🙇‍♂️":"man-bowing","🙇‍♀️":"woman-bowing","🤦":"person-facepalming","🤦‍♂️":"man-facepalming","🤦‍♀️":"woman-facepalming","🤷":"person-shrugging","🤷‍♂️":"man-shrugging","🤷‍♀️":"woman-shrugging","🧑‍⚕️":"health-worker","👨‍⚕️":"man-health-worker","👩‍⚕️":"woman-health-worker","🧑‍🎓":"student","👨‍🎓":"man-student","👩‍🎓":"woman-student","🧑‍🏫":"teacher","👨‍🏫":"man-teacher","👩‍🏫":"woman-teacher","🧑‍⚖️":"judge","👨‍⚖️":"man-judge","👩‍⚖️":"woman-judge","🧑‍🌾":"farmer","👨‍🌾":"man-farmer","👩‍🌾":"woman-farmer","🧑‍🍳":"cook","👨‍🍳":"man-cook","👩‍🍳":"woman-cook","🧑‍🔧":"mechanic","👨‍🔧":"man-mechanic","👩‍🔧":"woman-mechanic","🧑‍🏭":"factory-worker","👨‍🏭":"man-factory-worker","👩‍🏭":"woman-factory-worker","🧑‍💼":"office-worker","👨‍💼":"man-office-worker","👩‍💼":"woman-office-worker","🧑‍🔬":"scientist","👨‍🔬":"man-scientist","👩‍🔬":"woman-scientist","🧑‍💻":"technologist","👨‍💻":"man-technologist","👩‍💻":"woman-technologist","🧑‍🎤":"singer","👨‍🎤":"man-singer","👩‍🎤":"woman-singer","🧑‍🎨":"artist","👨‍🎨":"man-artist","👩‍🎨":"woman-artist","🧑‍✈️":"pilot","👨‍✈️":"man-pilot","👩‍✈️":"woman-pilot","🧑‍🚀":"astronaut","👨‍🚀":"man-astronaut","👩‍🚀":"woman-astronaut","🧑‍🚒":"firefighter","👨‍🚒":"man-firefighter","👩‍🚒":"woman-firefighter","👮":"police-officer","👮‍♂️":"man-police-officer","👮‍♀️":"woman-police-officer","🕵️":"detective","🕵️‍♂️":"man-detective","🕵️‍♀️":"woman-detective","💂":"guard","💂‍♂️":"man-guard","💂‍♀️":"woman-guard","🥷":"ninja","👷":"construction-worker","👷‍♂️":"man-construction-worker","👷‍♀️":"woman-construction-worker","🫅":"person-with-crown","🤴":"prince","👸":"princess","👳":"person-wearing-turban","👳‍♂️":"man-wearing-turban","👳‍♀️":"woman-wearing-turban","👲":"person-with-skullcap","🧕":"woman-with-headscarf","🤵":"person-in-tuxedo","🤵‍♂️":"man-in-tuxedo","🤵‍♀️":"woman-in-tuxedo","👰":"person-with-veil","👰‍♂️":"man-with-veil","👰‍♀️":"woman-with-veil","🤰":"pregnant-woman","🫃":"pregnant-man","🫄":"pregnant-person","🤱":"breast-feeding","👩‍🍼":"woman-feeding-baby","👨‍🍼":"man-feeding-baby","🧑‍🍼":"person-feeding-baby","👼":"baby-angel","🎅":"santa-claus","🤶":"mrs-claus","🧑‍🎄":"mx-claus","🦸":"superhero","🦸‍♂️":"man-superhero","🦸‍♀️":"woman-superhero","🦹":"supervillain","🦹‍♂️":"man-supervillain","🦹‍♀️":"woman-supervillain","🧙":"mage","🧙‍♂️":"man-mage","🧙‍♀️":"woman-mage","🧚":"fairy","🧚‍♂️":"man-fairy","🧚‍♀️":"woman-fairy","🧛":"vampire","🧛‍♂️":"man-vampire","🧛‍♀️":"woman-vampire","🧜":"merperson","🧜‍♂️":"merman","🧜‍♀️":"mermaid","🧝":"elf","🧝‍♂️":"man-elf","🧝‍♀️":"woman-elf","🧞":"genie","🧞‍♂️":"man-genie","🧞‍♀️":"woman-genie","🧟":"zombie","🧟‍♂️":"man-zombie","🧟‍♀️":"woman-zombie","🧌":"troll","💆":"person-getting-massage","💆‍♂️":"man-getting-massage","💆‍♀️":"woman-getting-massage","💇":"person-getting-haircut","💇‍♂️":"man-getting-haircut","💇‍♀️":"woman-getting-haircut","🚶":"person-walking","🚶‍♂️":"man-walking","🚶‍♀️":"woman-walking","🧍":"person-standing","🧍‍♂️":"man-standing","🧍‍♀️":"woman-standing","🧎":"person-kneeling","🧎‍♂️":"man-kneeling","🧎‍♀️":"woman-kneeling","🧑‍🦯":"person-with-white-cane","👨‍🦯":"man-with-white-cane","👩‍🦯":"woman-with-white-cane","🧑‍🦼":"person-in-motorized-wheelchair","👨‍🦼":"man-in-motorized-wheelchair","👩‍🦼":"woman-in-motorized-wheelchair","🧑‍🦽":"person-in-manual-wheelchair","👨‍🦽":"man-in-manual-wheelchair","👩‍🦽":"woman-in-manual-wheelchair","🏃":"person-running","🏃‍♂️":"man-running","🏃‍♀️":"woman-running","💃":"woman-dancing","🕺":"man-dancing","🕴️":"person-in-suit-levitating","👯":"people-with-bunny-ears","👯‍♂️":"men-with-bunny-ears","👯‍♀️":"women-with-bunny-ears","🧖":"person-in-steamy-room","🧖‍♂️":"man-in-steamy-room","🧖‍♀️":"woman-in-steamy-room","🧗":"person-climbing","🧗‍♂️":"man-climbing","🧗‍♀️":"woman-climbing","🤺":"person-fencing","🏇":"horse-racing","⛷️":"skier","🏂":"snowboarder","🏌️":"person-golfing","🏌️‍♂️":"man-golfing","🏌️‍♀️":"woman-golfing","🏄":"person-surfing","🏄‍♂️":"man-surfing","🏄‍♀️":"woman-surfing","🚣":"person-rowing-boat","🚣‍♂️":"man-rowing-boat","🚣‍♀️":"woman-rowing-boat","🏊":"person-swimming","🏊‍♂️":"man-swimming","🏊‍♀️":"woman-swimming","⛹️":"person-bouncing-ball","⛹️‍♂️":"man-bouncing-ball","⛹️‍♀️":"woman-bouncing-ball","🏋️":"person-lifting-weights","🏋️‍♂️":"man-lifting-weights","🏋️‍♀️":"woman-lifting-weights","🚴":"person-biking","🚴‍♂️":"man-biking","🚴‍♀️":"woman-biking","🚵":"person-mountain-biking","🚵‍♂️":"man-mountain-biking","🚵‍♀️":"woman-mountain-biking","🤸":"person-cartwheeling","🤸‍♂️":"man-cartwheeling","🤸‍♀️":"woman-cartwheeling","🤼":"people-wrestling","🤼‍♂️":"men-wrestling","🤼‍♀️":"women-wrestling","🤽":"person-playing-water-polo","🤽‍♂️":"man-playing-water-polo","🤽‍♀️":"woman-playing-water-polo","🤾":"person-playing-handball","🤾‍♂️":"man-playing-handball","🤾‍♀️":"woman-playing-handball","🤹":"person-juggling","🤹‍♂️":"man-juggling","🤹‍♀️":"woman-juggling","🧘":"person-in-lotus-position","🧘‍♂️":"man-in-lotus-position","🧘‍♀️":"woman-in-lotus-position","🛀":"person-taking-bath","🛌":"person-in-bed","🧑‍🤝‍🧑":"people-holding-hands","👭":"women-holding-hands","👫":"woman-and-man-holding-hands","👬":"men-holding-hands","💏":"kiss","👩‍❤️‍💋‍👨":"kiss-woman-man","👨‍❤️‍💋‍👨":"kiss-man-man","👩‍❤️‍💋‍👩":"kiss-woman-woman","💑":"couple-with-heart","👩‍❤️‍👨":"couple-with-heart-woman-man","👨‍❤️‍👨":"couple-with-heart-man-man","👩‍❤️‍👩":"couple-with-heart-woman-woman","👪":"family","👨‍👩‍👦":"family-man-woman-boy","👨‍👩‍👧":"family-man-woman-girl","👨‍👩‍👧‍👦":"family-man-woman-girl-boy","👨‍👩‍👦‍👦":"family-man-woman-boy-boy","👨‍👩‍👧‍👧":"family-man-woman-girl-girl","👨‍👨‍👦":"family-man-man-boy","👨‍👨‍👧":"family-man-man-girl","👨‍👨‍👧‍👦":"family-man-man-girl-boy","👨‍👨‍👦‍👦":"family-man-man-boy-boy","👨‍👨‍👧‍👧":"family-man-man-girl-girl","👩‍👩‍👦":"family-woman-woman-boy","👩‍👩‍👧":"family-woman-woman-girl","👩‍👩‍👧‍👦":"family-woman-woman-girl-boy","👩‍👩‍👦‍👦":"family-woman-woman-boy-boy","👩‍👩‍👧‍👧":"family-woman-woman-girl-girl","👨‍👦":"family-man-boy","👨‍👦‍👦":"family-man-boy-boy","👨‍👧":"family-man-girl","👨‍👧‍👦":"family-man-girl-boy","👨‍👧‍👧":"family-man-girl-girl","👩‍👦":"family-woman-boy","👩‍👦‍👦":"family-woman-boy-boy","👩‍👧":"family-woman-girl","👩‍👧‍👦":"family-woman-girl-boy","👩‍👧‍👧":"family-woman-girl-girl","🗣️":"speaking-head","👤":"bust-in-silhouette","👥":"busts-in-silhouette","🫂":"people-hugging","👣":"footprints","🐵":"monkey-face","🐒":"monkey","🦍":"gorilla","🦧":"orangutan","🐶":"dog-face","🐕":"dog","🦮":"guide-dog","🐕‍🦺":"service-dog","🐩":"poodle","🐺":"wolf","🦊":"fox","🦝":"raccoon","🐱":"cat-face","🐈":"cat","🐈‍⬛":"black-cat","🦁":"lion","🐯":"tiger-face","🐅":"tiger","🐆":"leopard","🐴":"horse-face","🫎":"moose","🫏":"donkey","🐎":"horse","🦄":"unicorn","🦓":"zebra","🦌":"deer","🦬":"bison","🐮":"cow-face","🐂":"ox","🐃":"water-buffalo","🐄":"cow","🐷":"pig-face","🐖":"pig","🐗":"boar","🐽":"pig-nose","🐏":"ram","🐑":"ewe","🐐":"goat","🐪":"camel","🐫":"two-hump-camel","🦙":"llama","🦒":"giraffe","🐘":"elephant","🦣":"mammoth","🦏":"rhinoceros","🦛":"hippopotamus","🐭":"mouse-face","🐁":"mouse","🐀":"rat","🐹":"hamster","🐰":"rabbit-face","🐇":"rabbit","🐿️":"chipmunk","🦫":"beaver","🦔":"hedgehog","🦇":"bat","🐻":"bear","🐻‍❄️":"polar-bear","🐨":"koala","🐼":"panda","🦥":"sloth","🦦":"otter","🦨":"skunk","🦘":"kangaroo","🦡":"badger","🐾":"paw-prints","🦃":"turkey","🐔":"chicken","🐓":"rooster","🐣":"hatching-chick","🐤":"baby-chick","🐥":"front-facing-baby-chick","🐦":"bird","🐧":"penguin","🕊️":"dove","🦅":"eagle","🦆":"duck","🦢":"swan","🦉":"owl","🦤":"dodo","🪶":"feather","🦩":"flamingo","🦚":"peacock","🦜":"parrot","🪽":"wing","🐦‍⬛":"black-bird","🪿":"goose","🐸":"frog","🐊":"crocodile","🐢":"turtle","🦎":"lizard","🐍":"snake","🐲":"dragon-face","🐉":"dragon","🦕":"sauropod","🦖":"t-rex","🐳":"spouting-whale","🐋":"whale","🐬":"dolphin","🦭":"seal","🐟":"fish","🐠":"tropical-fish","🐡":"blowfish","🦈":"shark","🐙":"octopus","🐚":"spiral-shell","🪸":"coral","🪼":"jellyfish","🐌":"snail","🦋":"butterfly","🐛":"bug","🐜":"ant","🐝":"honeybee","🪲":"beetle","🐞":"lady-beetle","🦗":"cricket","🪳":"cockroach","🕷️":"spider","🕸️":"spider-web","🦂":"scorpion","🦟":"mosquito","🪰":"fly","🪱":"worm","🦠":"microbe","💐":"bouquet","🌸":"cherry-blossom","💮":"white-flower","🪷":"lotus","🏵️":"rosette","🌹":"rose","🥀":"wilted-flower","🌺":"hibiscus","🌻":"sunflower","🌼":"blossom","🌷":"tulip","🪻":"hyacinth","🌱":"seedling","🪴":"potted-plant","🌲":"evergreen-tree","🌳":"deciduous-tree","🌴":"palm-tree","🌵":"cactus","🌾":"sheaf-of-rice","🌿":"herb","☘️":"shamrock","🍀":"four-leaf-clover","🍁":"maple-leaf","🍂":"fallen-leaf","🍃":"leaf-fluttering-in-wind","🪹":"empty-nest","🪺":"nest-with-eggs","🍄":"mushroom","🍇":"grapes","🍈":"melon","🍉":"watermelon","🍊":"tangerine","🍋":"lemon","🍌":"banana","🍍":"pineapple","🥭":"mango","🍎":"red-apple","🍏":"green-apple","🍐":"pear","🍑":"peach","🍒":"cherries","🍓":"strawberry","🫐":"blueberries","🥝":"kiwi-fruit","🍅":"tomato","🫒":"olive","🥥":"coconut","🥑":"avocado","🍆":"eggplant","🥔":"potato","🥕":"carrot","🌽":"ear-of-corn","🌶️":"hot-pepper","🫑":"bell-pepper","🥒":"cucumber","🥬":"leafy-green","🥦":"broccoli","🧄":"garlic","🧅":"onion","🥜":"peanuts","🫘":"beans","🌰":"chestnut","🫚":"ginger-root","🫛":"pea-pod","🍞":"bread","🥐":"croissant","🥖":"baguette-bread","🫓":"flatbread","🥨":"pretzel","🥯":"bagel","🥞":"pancakes","🧇":"waffle","🧀":"cheese-wedge","🍖":"meat-on-bone","🍗":"poultry-leg","🥩":"cut-of-meat","🥓":"bacon","🍔":"hamburger","🍟":"french-fries","🍕":"pizza","🌭":"hot-dog","🥪":"sandwich","🌮":"taco","🌯":"burrito","🫔":"tamale","🥙":"stuffed-flatbread","🧆":"falafel","🥚":"egg","🍳":"cooking","🥘":"shallow-pan-of-food","🍲":"pot-of-food","🫕":"fondue","🥣":"bowl-with-spoon","🥗":"green-salad","🍿":"popcorn","🧈":"butter","🧂":"salt","🥫":"canned-food","🍱":"bento-box","🍘":"rice-cracker","🍙":"rice-ball","🍚":"cooked-rice","🍛":"curry-rice","🍜":"steaming-bowl","🍝":"spaghetti","🍠":"roasted-sweet-potato","🍢":"oden","🍣":"sushi","🍤":"fried-shrimp","🍥":"fish-cake-with-swirl","🥮":"moon-cake","🍡":"dango","🥟":"dumpling","🥠":"fortune-cookie","🥡":"takeout-box","🦀":"crab","🦞":"lobster","🦐":"shrimp","🦑":"squid","🦪":"oyster","🍦":"soft-ice-cream","🍧":"shaved-ice","🍨":"ice-cream","🍩":"doughnut","🍪":"cookie","🎂":"birthday-cake","🍰":"shortcake","🧁":"cupcake","🥧":"pie","🍫":"chocolate-bar","🍬":"candy","🍭":"lollipop","🍮":"custard","🍯":"honey-pot","🍼":"baby-bottle","🥛":"glass-of-milk","☕":"hot-beverage","🫖":"teapot","🍵":"teacup-without-handle","🍶":"sake","🍾":"bottle-with-popping-cork","🍷":"wine-glass","🍸":"cocktail-glass","🍹":"tropical-drink","🍺":"beer-mug","🍻":"clinking-beer-mugs","🥂":"clinking-glasses","🥃":"tumbler-glass","🫗":"pouring-liquid","🥤":"cup-with-straw","🧋":"bubble-tea","🧃":"beverage-box","🧉":"mate","🧊":"ice","🥢":"chopsticks","🍽️":"fork-and-knife-with-plate","🍴":"fork-and-knife","🥄":"spoon","🔪":"kitchen-knife","🫙":"jar","🏺":"amphora","🌍":"globe-showing-europe-africa","🌎":"globe-showing-americas","🌏":"globe-showing-asia-australia","🌐":"globe-with-meridians","🗺️":"world-map","🗾":"map-of-japan","🧭":"compass","🏔️":"snow-capped-mountain","⛰️":"mountain","🌋":"volcano","🗻":"mount-fuji","🏕️":"camping","🏖️":"beach-with-umbrella","🏜️":"desert","🏝️":"desert-island","🏞️":"national-park","🏟️":"stadium","🏛️":"classical-building","🏗️":"building-construction","🧱":"brick","🪨":"rock","🪵":"wood","🛖":"hut","🏘️":"houses","🏚️":"derelict-house","🏠":"house","🏡":"house-with-garden","🏢":"office-building","🏣":"japanese-post-office","🏤":"post-office","🏥":"hospital","🏦":"bank","🏨":"hotel","🏩":"love-hotel","🏪":"convenience-store","🏫":"school","🏬":"department-store","🏭":"factory","🏯":"japanese-castle","🏰":"castle","💒":"wedding","🗼":"tokyo-tower","🗽":"statue-of-liberty","⛪":"church","🕌":"mosque","🛕":"hindu-temple","🕍":"synagogue","⛩️":"shinto-shrine","🕋":"kaaba","⛲":"fountain","⛺":"tent","🌁":"foggy","🌃":"night-with-stars","🏙️":"cityscape","🌄":"sunrise-over-mountains","🌅":"sunrise","🌆":"cityscape-at-dusk","🌇":"sunset","🌉":"bridge-at-night","♨️":"hot-springs","🎠":"carousel-horse","🛝":"playground-slide","🎡":"ferris-wheel","🎢":"roller-coaster","💈":"barber-pole","🎪":"circus-tent","🚂":"locomotive","🚃":"railway-car","🚄":"high-speed-train","🚅":"bullet-train","🚆":"train","🚇":"metro","🚈":"light-rail","🚉":"station","🚊":"tram","🚝":"monorail","🚞":"mountain-railway","🚋":"tram-car","🚌":"bus","🚍":"oncoming-bus","🚎":"trolleybus","🚐":"minibus","🚑":"ambulance","🚒":"fire-engine","🚓":"police-car","🚔":"oncoming-police-car","🚕":"taxi","🚖":"oncoming-taxi","🚗":"automobile","🚘":"oncoming-automobile","🚙":"sport-utility-vehicle","🛻":"pickup-truck","🚚":"delivery-truck","🚛":"articulated-lorry","🚜":"tractor","🏎️":"racing-car","🏍️":"motorcycle","🛵":"motor-scooter","🦽":"manual-wheelchair","🦼":"motorized-wheelchair","🛺":"auto-rickshaw","🚲":"bicycle","🛴":"kick-scooter","🛹":"skateboard","🛼":"roller-skate","🚏":"bus-stop","🛣️":"motorway","🛤️":"railway-track","🛢️":"oil-drum","⛽":"fuel-pump","🛞":"wheel","🚨":"police-car-light","🚥":"horizontal-traffic-light","🚦":"vertical-traffic-light","🛑":"stop-sign","🚧":"construction","⚓":"anchor","🛟":"ring-buoy","⛵":"sailboat","🛶":"canoe","🚤":"speedboat","🛳️":"passenger-ship","⛴️":"ferry","🛥️":"motor-boat","🚢":"ship","✈️":"airplane","🛩️":"small-airplane","🛫":"airplane-departure","🛬":"airplane-arrival","🪂":"parachute","💺":"seat","🚁":"helicopter","🚟":"suspension-railway","🚠":"mountain-cableway","🚡":"aerial-tramway","🛰️":"satellite","🚀":"rocket","🛸":"flying-saucer","🛎️":"bellhop-bell","🧳":"luggage","⌛":"hourglass-done","⏳":"hourglass-not-done","⌚":"watch","⏰":"alarm-clock","⏱️":"stopwatch","⏲️":"timer-clock","🕰️":"mantelpiece-clock","🕛":"twelve-o-clock","🕧":"twelve-thirty","🕐":"one-o-clock","🕜":"one-thirty","🕑":"two-o-clock","🕝":"two-thirty","🕒":"three-o-clock","🕞":"three-thirty","🕓":"four-o-clock","🕟":"four-thirty","🕔":"five-o-clock","🕠":"five-thirty","🕕":"six-o-clock","🕡":"six-thirty","🕖":"seven-o-clock","🕢":"seven-thirty","🕗":"eight-o-clock","🕣":"eight-thirty","🕘":"nine-o-clock","🕤":"nine-thirty","🕙":"ten-o-clock","🕥":"ten-thirty","🕚":"eleven-o-clock","🕦":"eleven-thirty","🌑":"new-moon","🌒":"waxing-crescent-moon","🌓":"first-quarter-moon","🌔":"waxing-gibbous-moon","🌕":"full-moon","🌖":"waning-gibbous-moon","🌗":"last-quarter-moon","🌘":"waning-crescent-moon","🌙":"crescent-moon","🌚":"new-moon-face","🌛":"first-quarter-moon-face","🌜":"last-quarter-moon-face","🌡️":"thermometer","☀️":"sun","🌝":"full-moon-face","🌞":"sun-with-face","🪐":"ringed-planet","⭐":"star","🌟":"glowing-star","🌠":"shooting-star","🌌":"milky-way","☁️":"cloud","⛅":"sun-behind-cloud","⛈️":"cloud-with-lightning-and-rain","🌤️":"sun-behind-small-cloud","🌥️":"sun-behind-large-cloud","🌦️":"sun-behind-rain-cloud","🌧️":"cloud-with-rain","🌨️":"cloud-with-snow","🌩️":"cloud-with-lightning","🌪️":"tornado","🌫️":"fog","🌬️":"wind-face","🌀":"cyclone","🌈":"rainbow","🌂":"closed-umbrella","☂️":"umbrella","☔":"umbrella-with-rain-drops","⛱️":"umbrella-on-ground","⚡":"high-voltage","❄️":"snowflake","☃️":"snowman","⛄":"snowman-without-snow","☄️":"comet","🔥":"fire","💧":"droplet","🌊":"water-wave","🎃":"jack-o-lantern","🎄":"christmas-tree","🎆":"fireworks","🎇":"sparkler","🧨":"firecracker","✨":"sparkles","🎈":"balloon","🎉":"party-popper","🎊":"confetti-ball","🎋":"tanabata-tree","🎍":"pine-decoration","🎎":"japanese-dolls","🎏":"carp-streamer","🎐":"wind-chime","🎑":"moon-viewing-ceremony","🧧":"red-envelope","🎀":"ribbon","🎁":"wrapped-gift","🎗️":"reminder-ribbon","🎟️":"admission-tickets","🎫":"ticket","🎖️":"military-medal","🏆":"trophy","🏅":"sports-medal","🥇":"1st-place-medal","🥈":"2nd-place-medal","🥉":"3rd-place-medal","⚽":"soccer-ball","⚾":"baseball","🥎":"softball","🏀":"basketball","🏐":"volleyball","🏈":"american-football","🏉":"rugby-football","🎾":"tennis","🥏":"flying-disc","🎳":"bowling","🏏":"cricket-game","🏑":"field-hockey","🏒":"ice-hockey","🥍":"lacrosse","🏓":"ping-pong","🏸":"badminton","🥊":"boxing-glove","🥋":"martial-arts-uniform","🥅":"goal-net","⛳":"flag-in-hole","⛸️":"ice-skate","🎣":"fishing-pole","🤿":"diving-mask","🎽":"running-shirt","🎿":"skis","🛷":"sled","🥌":"curling-stone","🎯":"bullseye","🪀":"yo-yo","🪁":"kite","🔫":"water-pistol","🎱":"pool-8-ball","🔮":"crystal-ball","🪄":"magic-wand","🎮":"video-game","🕹️":"joystick","🎰":"slot-machine","🎲":"game-die","🧩":"puzzle-piece","🧸":"teddy-bear","🪅":"pinata","🪩":"mirror-ball","🪆":"nesting-dolls","♠️":"spade-suit","♥️":"heart-suit","♦️":"diamond-suit","♣️":"club-suit","♟️":"chess-pawn","🃏":"joker","🀄":"mahjong-red-dragon","🎴":"flower-playing-cards","🎭":"performing-arts","🖼️":"framed-picture","🎨":"artist-palette","🧵":"thread","🪡":"sewing-needle","🧶":"yarn","🪢":"knot","👓":"glasses","🕶️":"sunglasses","🥽":"goggles","🥼":"lab-coat","🦺":"safety-vest","👔":"necktie","👕":"t-shirt","👖":"jeans","🧣":"scarf","🧤":"gloves","🧥":"coat","🧦":"socks","👗":"dress","👘":"kimono","🥻":"sari","🩱":"one-piece-swimsuit","🩲":"briefs","🩳":"shorts","👙":"bikini","👚":"woman-s-clothes","🪭":"folding-hand-fan","👛":"purse","👜":"handbag","👝":"clutch-bag","🛍️":"shopping-bags","🎒":"backpack","🩴":"thong-sandal","👞":"man-s-shoe","👟":"running-shoe","🥾":"hiking-boot","🥿":"flat-shoe","👠":"high-heeled-shoe","👡":"woman-s-sandal","🩰":"ballet-shoes","👢":"woman-s-boot","🪮":"hair-pick","👑":"crown","👒":"woman-s-hat","🎩":"top-hat","🎓":"graduation-cap","🧢":"billed-cap","🪖":"military-helmet","⛑️":"rescue-worker-s-helmet","📿":"prayer-beads","💄":"lipstick","💍":"ring","💎":"gem-stone","🔇":"muted-speaker","🔈":"speaker-low-volume","🔉":"speaker-medium-volume","🔊":"speaker-high-volume","📢":"loudspeaker","📣":"megaphone","📯":"postal-horn","🔔":"bell","🔕":"bell-with-slash","🎼":"musical-score","🎵":"musical-note","🎶":"musical-notes","🎙️":"studio-microphone","🎚️":"level-slider","🎛️":"control-knobs","🎤":"microphone","🎧":"headphone","📻":"radio","🎷":"saxophone","🪗":"accordion","🎸":"guitar","🎹":"musical-keyboard","🎺":"trumpet","🎻":"violin","🪕":"banjo","🥁":"drum","🪘":"long-drum","🪇":"maracas","🪈":"flute","📱":"mobile-phone","📲":"mobile-phone-with-arrow","☎️":"telephone","📞":"telephone-receiver","📟":"pager","📠":"fax-machine","🔋":"battery","🪫":"low-battery","🔌":"electric-plug","💻":"laptop","🖥️":"desktop-computer","🖨️":"printer","⌨️":"keyboard","🖱️":"computer-mouse","🖲️":"trackball","💽":"computer-disk","💾":"floppy-disk","💿":"optical-disk","📀":"dvd","🧮":"abacus","🎥":"movie-camera","🎞️":"film-frames","📽️":"film-projector","🎬":"clapper-board","📺":"television","📷":"camera","📸":"camera-with-flash","📹":"video-camera","📼":"videocassette","🔍":"magnifying-glass-tilted-left","🔎":"magnifying-glass-tilted-right","🕯️":"candle","💡":"light-bulb","🔦":"flashlight","🏮":"red-paper-lantern","🪔":"diya-lamp","📔":"notebook-with-decorative-cover","📕":"closed-book","📖":"open-book","📗":"green-book","📘":"blue-book","📙":"orange-book","📚":"books","📓":"notebook","📒":"ledger","📃":"page-with-curl","📜":"scroll","📄":"page-facing-up","📰":"newspaper","🗞️":"rolled-up-newspaper","📑":"bookmark-tabs","🔖":"bookmark","🏷️":"label","💰":"money-bag","🪙":"coin","💴":"yen-banknote","💵":"dollar-banknote","💶":"euro-banknote","💷":"pound-banknote","💸":"money-with-wings","💳":"credit-card","🧾":"receipt","💹":"chart-increasing-with-yen","✉️":"envelope","📧":"e-mail","📨":"incoming-envelope","📩":"envelope-with-arrow","📤":"outbox-tray","📥":"inbox-tray","📦":"package","📫":"closed-mailbox-with-raised-flag","📪":"closed-mailbox-with-lowered-flag","📬":"open-mailbox-with-raised-flag","📭":"open-mailbox-with-lowered-flag","📮":"postbox","🗳️":"ballot-box-with-ballot","✏️":"pencil","✒️":"black-nib","🖋️":"fountain-pen","🖊️":"pen","🖌️":"paintbrush","🖍️":"crayon","📝":"memo","💼":"briefcase","📁":"file-folder","📂":"open-file-folder","🗂️":"card-index-dividers","📅":"calendar","📆":"tear-off-calendar","🗒️":"spiral-notepad","🗓️":"spiral-calendar","📇":"card-index","📈":"chart-increasing","📉":"chart-decreasing","📊":"bar-chart","📋":"clipboard","📌":"pushpin","📍":"round-pushpin","📎":"paperclip","🖇️":"linked-paperclips","📏":"straight-ruler","📐":"triangular-ruler","✂️":"scissors","🗃️":"card-file-box","🗄️":"file-cabinet","🗑️":"wastebasket","🔒":"locked","🔓":"unlocked","🔏":"locked-with-pen","🔐":"locked-with-key","🔑":"key","🗝️":"old-key","🔨":"hammer","🪓":"axe","⛏️":"pick","⚒️":"hammer-and-pick","🛠️":"hammer-and-wrench","🗡️":"dagger","⚔️":"crossed-swords","💣":"bomb","🪃":"boomerang","🏹":"bow-and-arrow","🛡️":"shield","🪚":"carpentry-saw","🔧":"wrench","🪛":"screwdriver","🔩":"nut-and-bolt","⚙️":"gear","🗜️":"clamp","⚖️":"balance-scale","🦯":"white-cane","🔗":"link","⛓️":"chains","🪝":"hook","🧰":"toolbox","🧲":"magnet","🪜":"ladder","⚗️":"alembic","🧪":"test-tube","🧫":"petri-dish","🧬":"dna","🔬":"microscope","🔭":"telescope","📡":"satellite-antenna","💉":"syringe","🩸":"drop-of-blood","💊":"pill","🩹":"adhesive-bandage","🩼":"crutch","🩺":"stethoscope","🩻":"x-ray","🚪":"door","🛗":"elevator","🪞":"mirror","🪟":"window","🛏️":"bed","🛋️":"couch-and-lamp","🪑":"chair","🚽":"toilet","🪠":"plunger","🚿":"shower","🛁":"bathtub","🪤":"mouse-trap","🪒":"razor","🧴":"lotion-bottle","🧷":"safety-pin","🧹":"broom","🧺":"basket","🧻":"roll-of-paper","🪣":"bucket","🧼":"soap","🫧":"bubbles","🪥":"toothbrush","🧽":"sponge","🧯":"fire-extinguisher","🛒":"shopping-cart","🚬":"cigarette","⚰️":"coffin","🪦":"headstone","⚱️":"funeral-urn","🧿":"nazar-amulet","🪬":"hamsa","🗿":"moai","🪧":"placard","🪪":"identification-card","🏧":"atm-sign","🚮":"litter-in-bin-sign","🚰":"potable-water","♿":"wheelchair-symbol","🚹":"men-s-room","🚺":"women-s-room","🚻":"restroom","🚼":"baby-symbol","🚾":"water-closet","🛂":"passport-control","🛃":"customs","🛄":"baggage-claim","🛅":"left-luggage","⚠️":"warning","🚸":"children-crossing","⛔":"no-entry","🚫":"prohibited","🚳":"no-bicycles","🚭":"no-smoking","🚯":"no-littering","🚱":"non-potable-water","🚷":"no-pedestrians","📵":"no-mobile-phones","🔞":"no-one-under-eighteen","☢️":"radioactive","☣️":"biohazard","⬆️":"up-arrow","↗️":"up-right-arrow","➡️":"right-arrow","↘️":"down-right-arrow","⬇️":"down-arrow","↙️":"down-left-arrow","⬅️":"left-arrow","↖️":"up-left-arrow","↕️":"up-down-arrow","↔️":"left-right-arrow","↩️":"right-arrow-curving-left","↪️":"left-arrow-curving-right","⤴️":"right-arrow-curving-up","⤵️":"right-arrow-curving-down","🔃":"clockwise-vertical-arrows","🔄":"counterclockwise-arrows-button","🔙":"back-arrow","🔚":"end-arrow","🔛":"on-arrow","🔜":"soon-arrow","🔝":"top-arrow","🛐":"place-of-worship","⚛️":"atom-symbol","🕉️":"om","✡️":"star-of-david","☸️":"wheel-of-dharma","☯️":"yin-yang","✝️":"latin-cross","☦️":"orthodox-cross","☪️":"star-and-crescent","☮️":"peace-symbol","🕎":"menorah","🔯":"dotted-six-pointed-star","🪯":"khanda","♈":"aries","♉":"taurus","♊":"gemini","♋":"cancer","♌":"leo","♍":"virgo","♎":"libra","♏":"scorpio","♐":"sagittarius","♑":"capricorn","♒":"aquarius","♓":"pisces","⛎":"ophiuchus","🔀":"shuffle-tracks-button","🔁":"repeat-button","🔂":"repeat-single-button","▶️":"play-button","⏩":"fast-forward-button","⏭️":"next-track-button","⏯️":"play-or-pause-button","◀️":"reverse-button","⏪":"fast-reverse-button","⏮️":"last-track-button","🔼":"upwards-button","⏫":"fast-up-button","🔽":"downwards-button","⏬":"fast-down-button","⏸️":"pause-button","⏹️":"stop-button","⏺️":"record-button","⏏️":"eject-button","🎦":"cinema","🔅":"dim-button","🔆":"bright-button","📶":"antenna-bars","🛜":"wireless","📳":"vibration-mode","📴":"mobile-phone-off","♀️":"female-sign","♂️":"male-sign","⚧️":"transgender-symbol","✖️":"multiply","➕":"plus","➖":"minus","➗":"divide","🟰":"heavy-equals-sign","♾️":"infinity","‼️":"double-exclamation-mark","⁉️":"exclamation-question-mark","❓":"red-question-mark","❔":"white-question-mark","❕":"white-exclamation-mark","❗":"red-exclamation-mark","〰️":"wavy-dash","💱":"currency-exchange","💲":"heavy-dollar-sign","⚕️":"medical-symbol","♻️":"recycling-symbol","⚜️":"fleur-de-lis","🔱":"trident-emblem","📛":"name-badge","🔰":"japanese-symbol-for-beginner","⭕":"hollow-red-circle","✅":"check-mark-button","☑️":"check-box-with-check","✔️":"check-mark","❌":"cross-mark","❎":"cross-mark-button","➰":"curly-loop","➿":"double-curly-loop","〽️":"part-alternation-mark","✳️":"eight-spoked-asterisk","✴️":"eight-pointed-star","❇️":"sparkle","©️":"copyright","®️":"registered","™️":"trade-mark","#️⃣":"keycap-#","*️⃣":"keycap-*","0️⃣":"keycap-0","1️⃣":"keycap-1","2️⃣":"keycap-2","3️⃣":"keycap-3","4️⃣":"keycap-4","5️⃣":"keycap-5","6️⃣":"keycap-6","7️⃣":"keycap-7","8️⃣":"keycap-8","9️⃣":"keycap-9","🔟":"keycap-10","🔠":"input-latin-uppercase","🔡":"input-latin-lowercase","🔢":"input-numbers","🔣":"input-symbols","🔤":"input-latin-letters","🅰️":"a-button-blood-type","🆎":"ab-button-blood-type","🅱️":"b-button-blood-type","🆑":"cl-button","🆒":"cool-button","🆓":"free-button","ℹ️":"information","🆔":"id-button","Ⓜ️":"circled-m","🆕":"new-button","🆖":"ng-button","🅾️":"o-button-blood-type","🆗":"ok-button","🅿️":"p-button","🆘":"sos-button","🆙":"up-button","🆚":"vs-button","🈁":"japanese-here-button","🈂️":"japanese-service-charge-button","🈷️":"japanese-monthly-amount-button","🈶":"japanese-not-free-of-charge-button","🈯":"japanese-reserved-button","🉐":"japanese-bargain-button","🈹":"japanese-discount-button","🈚":"japanese-free-of-charge-button","🈲":"japanese-prohibited-button","🉑":"japanese-acceptable-button","🈸":"japanese-application-button","🈴":"japanese-passing-grade-button","🈳":"japanese-vacancy-button","㊗️":"japanese-congratulations-button","㊙️":"japanese-secret-button","🈺":"japanese-open-for-business-button","🈵":"japanese-no-vacancy-button","🔴":"red-circle","🟠":"orange-circle","🟡":"yellow-circle","🟢":"green-circle","🔵":"blue-circle","🟣":"purple-circle","🟤":"brown-circle","⚫":"black-circle","⚪":"white-circle","🟥":"red-square","🟧":"orange-square","🟨":"yellow-square","🟩":"green-square","🟦":"blue-square","🟪":"purple-square","🟫":"brown-square","⬛":"black-large-square","⬜":"white-large-square","◼️":"black-medium-square","◻️":"white-medium-square","◾":"black-medium-small-square","◽":"white-medium-small-square","▪️":"black-small-square","▫️":"white-small-square","🔶":"large-orange-diamond","🔷":"large-blue-diamond","🔸":"small-orange-diamond","🔹":"small-blue-diamond","🔺":"red-triangle-pointed-up","🔻":"red-triangle-pointed-down","💠":"diamond-with-a-dot","🔘":"radio-button","🔳":"white-square-button","🔲":"black-square-button","🏁":"chequered-flag","🚩":"triangular-flag","🎌":"crossed-flags","🏴":"black-flag","🏳️":"white-flag","🏳️‍🌈":"rainbow-flag","🏳️‍⚧️":"transgender-flag","🏴‍☠️":"pirate-flag","🇦🇨":"flag-ascension-island","🇦🇩":"flag-andorra","🇦🇪":"flag-united-arab-emirates","🇦🇫":"flag-afghanistan","🇦🇬":"flag-antigua-&-barbuda","🇦🇮":"flag-anguilla","🇦🇱":"flag-albania","🇦🇲":"flag-armenia","🇦🇴":"flag-angola","🇦🇶":"flag-antarctica","🇦🇷":"flag-argentina","🇦🇸":"flag-american-samoa","🇦🇹":"flag-austria","🇦🇺":"flag-australia","🇦🇼":"flag-aruba","🇦🇽":"flag-aland-islands","🇦🇿":"flag-azerbaijan","🇧🇦":"flag-bosnia-&-herzegovina","🇧🇧":"flag-barbados","🇧🇩":"flag-bangladesh","🇧🇪":"flag-belgium","🇧🇫":"flag-burkina-faso","🇧🇬":"flag-bulgaria","🇧🇭":"flag-bahrain","🇧🇮":"flag-burundi","🇧🇯":"flag-benin","🇧🇱":"flag-st-barthelemy","🇧🇲":"flag-bermuda","🇧🇳":"flag-brunei","🇧🇴":"flag-bolivia","🇧🇶":"flag-caribbean-netherlands","🇧🇷":"flag-brazil","🇧🇸":"flag-bahamas","🇧🇹":"flag-bhutan","🇧🇻":"flag-bouvet-island","🇧🇼":"flag-botswana","🇧🇾":"flag-belarus","🇧🇿":"flag-belize","🇨🇦":"flag-canada","🇨🇨":"flag-cocos-keeling-islands","🇨🇩":"flag-congo-kinshasa","🇨🇫":"flag-central-african-republic","🇨🇬":"flag-congo-brazzaville","🇨🇭":"flag-switzerland","🇨🇮":"flag-cote-d-ivoire","🇨🇰":"flag-cook-islands","🇨🇱":"flag-chile","🇨🇲":"flag-cameroon","🇨🇳":"flag-china","🇨🇴":"flag-colombia","🇨🇵":"flag-clipperton-island","🇨🇷":"flag-costa-rica","🇨🇺":"flag-cuba","🇨🇻":"flag-cape-verde","🇨🇼":"flag-curacao","🇨🇽":"flag-christmas-island","🇨🇾":"flag-cyprus","🇨🇿":"flag-czechia","🇩🇪":"flag-germany","🇩🇬":"flag-diego-garcia","🇩🇯":"flag-djibouti","🇩🇰":"flag-denmark","🇩🇲":"flag-dominica","🇩🇴":"flag-dominican-republic","🇩🇿":"flag-algeria","🇪🇦":"flag-ceuta-&-melilla","🇪🇨":"flag-ecuador","🇪🇪":"flag-estonia","🇪🇬":"flag-egypt","🇪🇭":"flag-western-sahara","🇪🇷":"flag-eritrea","🇪🇸":"flag-spain","🇪🇹":"flag-ethiopia","🇪🇺":"flag-european-union","🇫🇮":"flag-finland","🇫🇯":"flag-fiji","🇫🇰":"flag-falkland-islands","🇫🇲":"flag-micronesia","🇫🇴":"flag-faroe-islands","🇫🇷":"flag-france","🇬🇦":"flag-gabon","🇬🇧":"flag-united-kingdom","🇬🇩":"flag-grenada","🇬🇪":"flag-georgia","🇬🇫":"flag-french-guiana","🇬🇬":"flag-guernsey","🇬🇭":"flag-ghana","🇬🇮":"flag-gibraltar","🇬🇱":"flag-greenland","🇬🇲":"flag-gambia","🇬🇳":"flag-guinea","🇬🇵":"flag-guadeloupe","🇬🇶":"flag-equatorial-guinea","🇬🇷":"flag-greece","🇬🇸":"flag-south-georgia-&-south-sandwich-islands","🇬🇹":"flag-guatemala","🇬🇺":"flag-guam","🇬🇼":"flag-guinea-bissau","🇬🇾":"flag-guyana","🇭🇰":"flag-hong-kong-sar-china","🇭🇲":"flag-heard-&-mcdonald-islands","🇭🇳":"flag-honduras","🇭🇷":"flag-croatia","🇭🇹":"flag-haiti","🇭🇺":"flag-hungary","🇮🇨":"flag-canary-islands","🇮🇩":"flag-indonesia","🇮🇪":"flag-ireland","🇮🇱":"flag-israel","🇮🇲":"flag-isle-of-man","🇮🇳":"flag-india","🇮🇴":"flag-british-indian-ocean-territory","🇮🇶":"flag-iraq","🇮🇷":"flag-iran","🇮🇸":"flag-iceland","🇮🇹":"flag-italy","🇯🇪":"flag-jersey","🇯🇲":"flag-jamaica","🇯🇴":"flag-jordan","🇯🇵":"flag-japan","🇰🇪":"flag-kenya","🇰🇬":"flag-kyrgyzstan","🇰🇭":"flag-cambodia","🇰🇮":"flag-kiribati","🇰🇲":"flag-comoros","🇰🇳":"flag-st-kitts-&-nevis","🇰🇵":"flag-north-korea","🇰🇷":"flag-south-korea","🇰🇼":"flag-kuwait","🇰🇾":"flag-cayman-islands","🇰🇿":"flag-kazakhstan","🇱🇦":"flag-laos","🇱🇧":"flag-lebanon","🇱🇨":"flag-st-lucia","🇱🇮":"flag-liechtenstein","🇱🇰":"flag-sri-lanka","🇱🇷":"flag-liberia","🇱🇸":"flag-lesotho","🇱🇹":"flag-lithuania","🇱🇺":"flag-luxembourg","🇱🇻":"flag-latvia","🇱🇾":"flag-libya","🇲🇦":"flag-morocco","🇲🇨":"flag-monaco","🇲🇩":"flag-moldova","🇲🇪":"flag-montenegro","🇲🇫":"flag-st-martin","🇲🇬":"flag-madagascar","🇲🇭":"flag-marshall-islands","🇲🇰":"flag-north-macedonia","🇲🇱":"flag-mali","🇲🇲":"flag-myanmar-burma","🇲🇳":"flag-mongolia","🇲🇴":"flag-macao-sar-china","🇲🇵":"flag-northern-mariana-islands","🇲🇶":"flag-martinique","🇲🇷":"flag-mauritania","🇲🇸":"flag-montserrat","🇲🇹":"flag-malta","🇲🇺":"flag-mauritius","🇲🇻":"flag-maldives","🇲🇼":"flag-malawi","🇲🇽":"flag-mexico","🇲🇾":"flag-malaysia","🇲🇿":"flag-mozambique","🇳🇦":"flag-namibia","🇳🇨":"flag-new-caledonia","🇳🇪":"flag-niger","🇳🇫":"flag-norfolk-island","🇳🇬":"flag-nigeria","🇳🇮":"flag-nicaragua","🇳🇱":"flag-netherlands","🇳🇴":"flag-norway","🇳🇵":"flag-nepal","🇳🇷":"flag-nauru","🇳🇺":"flag-niue","🇳🇿":"flag-new-zealand","🇴🇲":"flag-oman","🇵🇦":"flag-panama","🇵🇪":"flag-peru","🇵🇫":"flag-french-polynesia","🇵🇬":"flag-papua-new-guinea","🇵🇭":"flag-philippines","🇵🇰":"flag-pakistan","🇵🇱":"flag-poland","🇵🇲":"flag-st-pierre-&-miquelon","🇵🇳":"flag-pitcairn-islands","🇵🇷":"flag-puerto-rico","🇵🇸":"flag-palestinian-territories","🇵🇹":"flag-portugal","🇵🇼":"flag-palau","🇵🇾":"flag-paraguay","🇶🇦":"flag-qatar","🇷🇪":"flag-reunion","🇷🇴":"flag-romania","🇷🇸":"flag-serbia","🇷🇺":"flag-russia","🇷🇼":"flag-rwanda","🇸🇦":"flag-saudi-arabia","🇸🇧":"flag-solomon-islands","🇸🇨":"flag-seychelles","🇸🇩":"flag-sudan","🇸🇪":"flag-sweden","🇸🇬":"flag-singapore","🇸🇭":"flag-st-helena","🇸🇮":"flag-slovenia","🇸🇯":"flag-svalbard-&-jan-mayen","🇸🇰":"flag-slovakia","🇸🇱":"flag-sierra-leone","🇸🇲":"flag-san-marino","🇸🇳":"flag-senegal","🇸🇴":"flag-somalia","🇸🇷":"flag-suriname","🇸🇸":"flag-south-sudan","🇸🇹":"flag-sao-tome-&-principe","🇸🇻":"flag-el-salvador","🇸🇽":"flag-sint-maarten","🇸🇾":"flag-syria","🇸🇿":"flag-eswatini","🇹🇦":"flag-tristan-da-cunha","🇹🇨":"flag-turks-&-caicos-islands","🇹🇩":"flag-chad","🇹🇫":"flag-french-southern-territories","🇹🇬":"flag-togo","🇹🇭":"flag-thailand","🇹🇯":"flag-tajikistan","🇹🇰":"flag-tokelau","🇹🇱":"flag-timor-leste","🇹🇲":"flag-turkmenistan","🇹🇳":"flag-tunisia","🇹🇴":"flag-tonga","🇹🇷":"flag-turkey","🇹🇹":"flag-trinidad-&-tobago","🇹🇻":"flag-tuvalu","🇹🇼":"flag-taiwan","🇹🇿":"flag-tanzania","🇺🇦":"flag-ukraine","🇺🇬":"flag-uganda","🇺🇲":"flag-us-outlying-islands","🇺🇳":"flag-united-nations","🇺🇸":"flag-united-states","🇺🇾":"flag-uruguay","🇺🇿":"flag-uzbekistan","🇻🇦":"flag-vatican-city","🇻🇨":"flag-st-vincent-&-grenadines","🇻🇪":"flag-venezuela","🇻🇬":"flag-british-virgin-islands","🇻🇮":"flag-us-virgin-islands","🇻🇳":"flag-vietnam","🇻🇺":"flag-vanuatu","🇼🇫":"flag-wallis-&-futuna","🇼🇸":"flag-samoa","🇽🇰":"flag-kosovo","🇾🇪":"flag-yemen","🇾🇹":"flag-mayotte","🇿🇦":"flag-south-africa","🇿🇲":"flag-zambia","🇿🇼":"flag-zimbabwe","🏴󠁧󠁢󠁥󠁮󠁧󠁿":"flag-england","🏴󠁧󠁢󠁳󠁣󠁴󠁿":"flag-scotland","🏴󠁧󠁢󠁷󠁬󠁳󠁿":"flag-wales"} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/[core]/node_modules/base64-js' , '/[core]/node_modules/base64-js/index.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/[core]/node_modules/base64-js/index.js' , '/[core]/node_modules/base64-js' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/[core]/node_modules/ieee754' , '/[core]/node_modules/ieee754/index.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/[core]/node_modules/ieee754/index.js' , '/[core]/node_modules/ieee754' , null , ( module , exports , require , __dirname , __filename ) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/babel-tower' , '/node_modules/babel-tower/lib/Babel.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/lib/Babel.js' , '/node_modules/babel-tower' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Babel Tower

	Copyright (c) 2016 - 2020 Cédric Ronvel

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





const path = require( 'path' ) ;



// new Babel( [rootLocale] , [autoEscape] ) {
function Babel( rootLocale , autoEscape ) {
	if ( rootLocale instanceof RegExp ) {
		autoEscape = rootLocale ;
		rootLocale = null ;
	}

	Object.defineProperties( this , {
		root: { value: this } ,
		db: { value: {} , enumerable: true } ,
		loadedLocaleExtensions: { value: {} , enumerable: true } ,
		rootLocale: { value: rootLocale , enumerable: true } ,
		locale: { value: null , enumerable: true , writable: true } ,
		autoEscape: {
			value: ( autoEscape instanceof RegExp ) && autoEscape.substitution ? autoEscape : null ,
			enumerable: true ,
			writable: true
		}
	} ) ;

	this.setLocale( rootLocale ) ;
}

module.exports = Babel ;



const Atom = Babel.Atom = require( './Atom.js' ) ;
Babel.Element = Atom ;	// Backward compatibility
const Sentence = Babel.Sentence = require( './Sentence.js' ) ;



// For backward compatibility
Babel.create = function( autoEscape ) { return new Babel( autoEscape ) ; } ;



// Adhoc rendering
Babel.prototype.render =
Babel.prototype.solve = function( str , ... args ) {
	return ( new Sentence( str , this ) ).solveWithBabel_( false , this , ... args ) ;
} ;



Babel.prototype.initLocale = function( locale ) {
	var defaultEnum = [
		new Sentence( '' , this ) ,
		new Sentence( '$' , this ) ,
		new Sentence( ' $' , this )
	] ;

	this.db[ locale ] = {
		undefinedString: '(undefined)' ,
		trueString: 'true' ,
		falseString: 'false' ,
		defaultEnum: defaultEnum ,
		nOffset: -1 ,	// Default offset for 'n' (number) for all languages, unless redefined
		propertyIndexes: {
			// Default index for 'g' (gender) for all languages, unless redefined
			g: {
				m: 0 , f: 1 , n: 2 , e: 3 , default: 2
			} ,
			// Default index for 'p' (person) for all languages, unless redefined
			p: {
				'1': 0 , '2': 1 , '3': 2 , default: 2
			} ,
			// Default index for 'a' (article) for all languages, unless redefined
			a: {
				i: 0 ,
				d: 1 ,
				p: 2 ,
				P: 3 ,
				z: 4 ,
				default: 4
			}
		} ,
		functions: {} ,
		sentences: new Map() ,
		atoms: new Map()
	} ;
} ;



Babel.prototype.setLocale = function( locale ) {
	if ( ! locale ) { locale = 'none' ; }

	if ( ! this.db[ locale ] ) { this.initLocale( locale ) ; }
	if ( ! this.loadedLocaleExtensions[ locale ] ) { this.loadLocaleExtension( locale ) ; }

	this.locale = locale ;
} ;



const LOCALE_EXTENSIONS_CACHE = {} ;

// Load built-in locale extensions.
// Should manage plug-ins later...
Babel.prototype.loadLocaleExtension = function( locale ) {
	if ( ! locale || this.loadedLocaleExtensions[ locale ] ) { return ; }

	var localeDb = LOCALE_EXTENSIONS_CACHE[ locale ] ;

	if ( localeDb === false ) { return ; }

	if ( localeDb ) {
		this.loadedLocaleExtensions[ locale ] = true ;
		this.extendLocale( locale , localeDb ) ;
		return ;
	}

	try {
		localeDb = require( path.join( __dirname , 'builtin-locales' , locale , 'extension.js' ) ) ;
	}
	catch ( error ) {
		// No problem, there is no built-in extension, that's all...
		LOCALE_EXTENSIONS_CACHE[ locale ] = false ;
		return ;
	}

	LOCALE_EXTENSIONS_CACHE[ locale ] = localeDb ;
	this.loadedLocaleExtensions[ locale ] = true ;
	this.extendLocale( locale , localeDb ) ;
} ;



Babel.prototype.use = function( locale ) {
	var babel = Object.create( this ) ;
	babel.setLocale( locale ) ;
	return babel ;
} ;



Babel.prototype.extend = function( db ) {
	var locale ;

	for ( locale in db ) {
		this.extendLocale( locale , db[ locale ] ) ;
	}
} ;



// .extendLocale( [locale=this.locale] , localeDb )
Babel.prototype.extendLocale = function( locale , localeDb ) {
	var k , from , to ;

	// Manage arguments
	if ( ! localeDb ) {
		localeDb = locale ;
		locale = this.locale ;
	}

	if ( ! this.db[ locale ] ) { this.initLocale( locale ) ; }

	if ( typeof localeDb.undefinedString === 'string' ) { this.db[ locale ].undefinedString = localeDb.undefinedString ; }
	if ( typeof localeDb.trueString === 'string' ) { this.db[ locale ].trueString = localeDb.trueString ; }
	if ( typeof localeDb.falseString === 'string' ) { this.db[ locale ].falseString = localeDb.falseString ; }
	if ( typeof localeDb.nOffset === 'number' ) { this.db[ locale ].nOffset = localeDb.nOffset ; }

	if ( Array.isArray( localeDb.defaultEnum ) ) {
		this.db[ locale ].defaultEnum = localeDb.defaultEnum.map( e => e instanceof Sentence ? e : new Sentence( e ) ) ;
	}

	for ( k in localeDb.propertyIndexes ) {
		this.db[ locale ].propertyIndexes[ k ] = localeDb.propertyIndexes[ k ] ;
	}

	for ( k in localeDb.functions ) {
		this.db[ locale ].functions[ k ] = typeof localeDb.functions[ k ] === 'string' ?
			Atom.parse( localeDb.functions[ k ] ) :
			localeDb.functions[ k ] ;
	}


	// 'from' should be a string, while 'to' should be a Sentence instance
	if ( localeDb.sentences instanceof Map ) {
		for ( [ from , to ] of localeDb.sentences ) {
			if ( from instanceof Sentence ) { from = from.key ; }
			if ( ! ( to instanceof Sentence ) ) { to = new Sentence( to , this ) ; }
			this.db[ locale ].sentences.set( from , to ) ;
		}
	}
	else {
		for ( from in localeDb.sentences ) {
			to = localeDb.sentences[ from ] ;
			if ( ! ( to instanceof Sentence ) ) { to = new Sentence( to , this ) ; }
			this.db[ locale ].sentences.set( from , to ) ;
		}
	}


	if ( localeDb.atoms instanceof Map ) {
		for ( [ from , to ] of localeDb.atoms ) {
			if ( from instanceof Atom ) { from = from.k ; }
			if ( ! ( to instanceof Atom ) ) {
				if ( typeof to === 'string' ) { to = Atom.parse( to ) ; }
				else { to = new Atom( to ) ; }
			}

			this.db[ locale ].atoms.set( from , to ) ;
		}
	}
	else {
		for ( from in localeDb.atoms ) {
			to = localeDb.atoms[ from ] ;

			if ( ! ( to instanceof Atom ) ) {
				if ( typeof to === 'string' ) { to = Atom.parse( to ) ; }
				else { to = new Atom( to ) ; }
			}

			this.db[ locale ].atoms.set( from , to ) ;
		}
	}
} ;



// Adhoc variable names
Babel.getNamedVars = function( str ) {
	return ( new Sentence( str ) ).getNamedVars() ;
} ;



// Useful for Sentence constructor, when no Babel instances are given
Babel.default = new Babel() ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/lib/Atom.js' , '/node_modules/babel-tower' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Babel Tower

	Copyright (c) 2016 - 2020 Cédric Ronvel

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





const builtinFilters = require( './filters.js' ) ;



/*
	Atom parts:

	- babel: Babel instance
	- k: translation key
	- s: invariable string
	- canon: (getter) canonical string
	- l: RESERVED "locale" of the source? translate only if the locale change
	- lc/lx: RESERVED "lexical category" (noun, verb, determiner, ...).
	  Useful:
		- n: noun
		- v: verb
		- adj: adjective
		- adv: adverb
	  Not so useful:
		- p: pronoun
		- d: determiner
		- adp: adposition
		- ... (full list: https://en.wikipedia.org/wiki/Template:Lexical_categories)
	- f/fl/fx/flx: RESERVED "flexion", this atom may change according to number, gender, and so on?
	  It would basically supersed "n?", "ng?", and so on, with default behvior?
	- n: atom count (integer), or '++' (=Infinity)
	- g: atom gender, char: 'm' (male), 'f' (female), 'n' (neutral), 'e' (epicenity: lack of gender distinction,
	  or plural mixed gender)
	- nOffset: offset for the altn variation
	- p: person, char '1' (first person), '2' (second person), '3' (third person), also '1i' and '1x' may be used
	  in language having distinct pronoun for inclusive/exclusive 'we'
	- a: article type, char: 'i' (indefinite), 'd' (definite), 'p' (partitive), 'P' (proper, for proper noun),
	  'z' (zero, no article, e.g.: sent to prison),
	  RESERVED: 'n' (negative, e.g.: no man), but it should be solved using property 'n' in conjunction with 'a'
	- d: RESERVED for determiners, 'a' (article), demonstrative: 'dp' (demonstrative proximal), 'dd' (demonstrative distal),
	  'p' (possessive).
	  Determiner that are hard to automatize: quantifier (all, some, many, few, no, etc...),
	  distributive (each, any, either, neither, etc...), interogative (which, what, whose, etc...)
	  Wikipedia:
		Common kinds of determiners include definite and indefinite articles (like the English the and a or an),
		demonstratives (this and that), possessive determiners (my and their), cardinal numerals, quantifiers (many, all and no),
		distributive determiners (each, any), and interrogative determiners (which).
	- v: RESERVED for verbs?
	- t/vt: RESERVED for verbs? (tense, fr: temps, past/present/future)
	- m/vm: RESERVED for verbs? (fr: mode)
	- def/default: default value, if none is provided
	- alt: (array of)^N variations
	- ord: array of property names to be used to navigate inside of 'alt' array structure
	- n?: array of variations by atom number
	- g?: array of variations by atom gender
	- p?: array of variations by atom's 1st/2nd/3rd person
	- a?: array of variations, by article i/d/p/P/z
	- ng?: array of variations by atom number and gender (array of array, [number][gender])
	- list: list of things
	- enum: handle enumeration of list
	- +: do not display anything, but keep the atom for the next iteration (lastAtom)
	- x: cross the lastAtom with this one
	- uv: unit of measurements: list of values
	- uf: unit of measurements: format, should match 'uv'
	- um: unit of measurements: mode
	- uenum: enumeration, when the mode include concatenation of multiple units, e.g.: 2 feets and 3 inches
*/



function Atom( arg , locale = null , isTmp = false ) {
	if ( arg && typeof arg === 'object' ) {
		this.assign( arg ) ;
	}
	else if ( typeof arg === 'string' ) {
		this.k = arg ;
	}
	else if ( typeof arg === 'number' ) {
		this.n = arg ;
	}
	else if ( typeof arg === 'boolean' ) {
		this.b = arg ;
	}

	if ( locale ) { this.l = locale ; }
	if ( isTmp ) { this._tmp = true ; }
}

module.exports = Atom ;



const Babel = require( './Babel.js' ) ;
const Sentence = require( './Sentence.js' ) ;



// For backward compatibility
Atom.create = function( arg , proto ) {
	var atom ;

	if ( proto ) {
		atom = Object.create( proto ) ;
		Atom.call( atom , arg ) ;
		return atom ;
	}

	return new Atom( arg ) ;
} ;



// Canonical form
Object.defineProperty( Atom.prototype , 'canon' , {
	enumerable: false ,
	get: function() {
		var ptr ;

		if ( this.alt ) {
			ptr = this.alt ;
			while ( Array.isArray( ptr ) ) { ptr = ptr[ 0 ] ; }
			if ( ptr ) { return ptr ; }
		}

		return this.s || this.k ;
	}
} ) ;



Atom.prototype.toStringKFG = function( ctx ) {
	return this.solve( ( ctx && ctx.__babel ) || Babel.default , null , ctx ) ;
} ;



Atom.prototype.toString =
Atom.prototype.render =
Atom.prototype.solve = function( babel , lastAtom = null , kungFigCtx = null ) {
	var atom , str ;

	babel = babel || this.babel || Babel.default ;

	atom = this.localize( babel ) ;

	if ( atom.x && lastAtom ) {
		atom = atom.merge( lastAtom , true ) ;
	}

	if ( atom.enum ) {
		if ( ! Array.isArray( atom.list ) ) {
			if ( atom.s !== undefined ) { atom.list = [ atom.s ] ; }
			else if ( atom.n !== undefined ) { atom.list = [ atom.n ] ; }
			else if ( atom.k !== undefined ) { atom.list = [ atom.k ] ; }
			else { atom.list = [] ; }
		}

		str = atom.solveEnum( babel , null , kungFigCtx ) ;
	}
	else {
		str = atom.solveOne( babel , lastAtom , kungFigCtx ) ;
	}

	// + = do not display anything, it will simply populate the next solve()'s lastAtom
	if ( atom['+'] ) {
		delete atom['+'] ;
		delete atom.beforeStr ;
		delete atom.afterStr ;
		return atom ;
	}

	if ( atom.beforeStr ) { str = atom.beforeStr + str ; }
	if ( atom.afterStr ) { str = str + atom.afterStr ; }

	// Apply filters here
	if ( atom.postFilters ) { str = Atom.applyFilters( str , atom.postFilters ) ; }

	return str ;
} ;



Atom.prototype.solveOne = function( babel , lastAtom , kungFigCtx ) {
	var str , atom , returnVal ;

	// We need a temporary object to work on
	atom = this.tmp() ;


	// Preliminaries...
	atom.k = atom.k !== undefined ? atom.k : atom.def ;

	atom.nOffset = atom.nOffset !== undefined ? atom.nOffset : babel.db[ babel.locale ].nOffset ;

	if ( atom.n === undefined && atom.list ) {
		atom.n = Atom.listToN( babel , atom.list ) ;
	}

	if ( atom.n === '++' ) {
		atom.n = Infinity ;
	}
	else {
		atom.n = + atom.n ;	// Cast anything to a number
		if ( isNaN( atom.n ) ) { atom.n = undefined ; }
	}


	// Cast special functions now
	if ( atom.fn ) {
		returnVal = atom.solveFn( babel , lastAtom , kungFigCtx ) ;
		if ( returnVal instanceof Atom ) { atom = returnVal ; }
		else { return returnVal ; }
	}


	// Now start solving...

	// There is an alternative
	if ( atom.alt && atom.ord ) {
		str = atom.solveAlt( babel , kungFigCtx ) ;
		if ( str !== undefined ) { return str ; }
	}

	// There is a unit system using n
	if ( atom.uv && atom.uf && typeof atom.n === 'number' ) {
		return this.solveMeasure( babel , atom.n , atom , kungFigCtx ) ;
	}

	// There is an alternative, retry with fallback
	if ( atom.alt && atom.ord ) {
		str = atom.solveAlt( babel , kungFigCtx , true ) ;
		if ( str !== undefined ) { return str ; }
	}

	// This is an invariable string
	if ( atom.s !== undefined ) {
		return atom.s ;
	}

	// This is a translation key
	if ( atom.k !== undefined ) {
		return atom.k ;
	}

	// This is a number
	if ( atom.n !== undefined ) {
		return '' + atom.n ;
	}

	// This is a boolean
	if ( atom.b !== undefined ) {
		return toBoolean( atom.b ) ? babel.db[ babel.locale ].trueString : babel.db[ babel.locale ].falseString ;
	}

	// This is the default value
	if ( atom.def !== undefined ) {
		return atom.def ;
	}

	if ( babel ) {
		return babel.db[ babel.locale ].undefinedString ;
	}

	return atom.k ;
} ;



function toInteger( v ) {
	if ( v === '++' ) { return Infinity ; }
	return Math.max( 0 , Math.round( + v ) ) || 0 ;
}



function toBoolean( v ) {
	if ( v === true || v === 'true' ) { return true ; }
	if ( v === false || v === 'false' ) { return false ; }
	return !! toInteger( v ) ;
}



Atom.prototype.solveAlt = function( babel , kungFigCtx , fallback ) {
	var index , indexMax , pName , pValue , pIndexes , ptr , sk ;

	// s or k
	sk = this.s || this.k ;

	ptr = this.alt ;

	for ( index = 0 , indexMax = this.ord.length ; index < indexMax ; index ++ ) {
		if ( ! Array.isArray( ptr ) ) { return ptr ; }

		pName = this.ord[ index ] ;

		if ( pName === 'b' ) {
			if ( this.b === undefined ) {
				if ( ! fallback ) { return ; }

				if ( this.n !== undefined ) {
					pValue = + ! toBoolean( this.n ) ;
				}
				else {
					pValue = + ! toBoolean( sk ) ;
				}
			}
			else {
				pValue = + ! toBoolean( this.b ) ;
			}

			pValue = Math.max( 0 , Math.min( pValue , ptr.length - 1 ) ) || 0 ;
			ptr = ptr[ pValue ] ;
		}
		else if ( pName === 'n' || pName === 'n0' ) {
			if ( this.n === undefined ) {
				if ( ! fallback ) { return ; }

				//pValue = toInteger( sk ) ;
				pValue = 1 ;
			}
			else {
				pValue = toInteger( this.n ) ;
			}

			if ( pName === 'n' ) { pValue -- ; }

			pValue = Math.max( 0 , Math.min( pValue , ptr.length - 1 ) ) || 0 ;
			ptr = ptr[ pValue ] ;
		}
		else {
			if ( this[ pName ] === undefined ) {
				if ( ! fallback ) { return ; }
				pValue = sk !== undefined ? sk : 'default' ;
			}
			else {
				pValue = this[ pName ] ;
			}

			pIndexes = babel.db[ babel.locale ].propertyIndexes[ pName ] ;

			if ( pIndexes ) {
				pValue = pValue in pIndexes ? pIndexes[ pValue ] : pIndexes.default || 0 ;
				if ( pValue >= ptr.length ) { pValue = 0 ; }
				ptr = ptr[ pValue ] ;
			}
		}
	}

	return ptr ;
} ;



Atom.prototype.solveEnum = function( babel , enum_ , kungFigCtx ) {
	var atom = this , i , iMax , enumIndex , str = '' ;

	if ( ! enum_ ) {
		enum_ = Array.isArray( atom.enum ) && atom.enum.length ? atom.enum : babel.db[ babel.locale ].defaultEnum ;
	}

	// Empty list, return the first sub-sentence in the list
	if ( ! atom.list.length ) { return enum_[ 0 ].solveWithBabel_( true , babel , null , kungFigCtx ) ; }

	for ( i = 0 , iMax = atom.list.length ; i < iMax ; i ++ ) {
		if ( i === 0 ) { enumIndex = 1 ; }
		else if ( i === iMax - 1 ) { enumIndex = 3 ; }
		else { enumIndex = 2 ; }

		enumIndex = Math.min( enumIndex , enum_.length - 1 ) ;
		str += enum_[ enumIndex ].solveWithBabel_( true , babel , atom.list[ i ] , kungFigCtx ) ;
	}

	return str ;
} ;



Atom.prototype.solveMeasure = function( babel , value , atom , kungFigCtx ) {
	var i , iMax = atom.uf.length , currentValue , strArray = [] ,
		currentRatio , closestIndex , closestDelta = Infinity ;

	if ( ! iMax ) { return '' ; }

	switch ( atom.um ) {
		case 'N+' :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentValue = value / atom.uv[ i ] ;

				if ( currentValue < 1 ) { continue ; }

				currentValue = Math.trunc( currentValue ) ;
				value = value - currentValue * atom.uv[ i ] ;

				strArray.push( atom.uf[ i ].solveWithBabel_( true , babel , currentValue , kungFigCtx ) ) ;
			}

			return this.merge( { list: strArray } , true ).solveEnum( babel , atom.uenum , kungFigCtx ) ;

		case 'R1+' :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentRatio = value >= atom.uv[ i ] ? value - atom.uv[ i ] : 2 * atom.uv[ i ] - value ;
				if ( currentRatio >= closestDelta ) { continue ; }

				closestDelta = currentRatio ;
				closestIndex = i ;
			}

			return atom.uf[ closestIndex ].solveWithBabel_( true , babel , value / atom.uv[ closestIndex ] , kungFigCtx ) ;

		case 'R' :
		default :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentRatio = Math.abs( value - atom.uv[ i ] ) ;
				if ( currentRatio >= closestDelta ) { continue ; }

				closestDelta = currentRatio ;
				closestIndex = i ;
			}

			return atom.uf[ closestIndex ].solveWithBabel_( true , babel , value / atom.uv[ closestIndex ] , kungFigCtx ) ;
	}
} ;



Atom.prototype.solveFn = function( babel , lastAtom , kungFigCtx ) {
	var i , iMax , fn , returnVal ,
		atom = this.tmp() ;

	for ( i = 0 , iMax = atom.fn.length ; i < iMax ; i ++ ) {
		fn = babel.db[ babel.locale ].functions[ atom.fn[ i ].key ] ;

		if ( typeof fn === 'function' ) {
			returnVal = fn( atom , atom.fn[ i ].value , lastAtom , babel , kungFigCtx ) ;

			if ( returnVal !== undefined ) {
				if ( returnVal instanceof Atom ) {
					atom = returnVal ;
				}
				else if ( typeof returnVal === 'string' ) {
					return returnVal ;
				}
				else {
					atom = new Atom( returnVal , true ) ;
				}

				// Preserve filters...
				if ( this.preFilters ) { atom.preFilters = this.preFilters ; }
				if ( this.postFilters ) { atom.postFilters = this.postFilters ; }
			}
		}
		else if ( fn && typeof fn === 'object' ) {
			atom.assign( fn ) ;
		}
	}

	return atom ;
} ;



Atom.prototype.localize = function( babel ) {
	if ( this._loc ) { return this ; }

	var l10n , atom ;

	babel = babel || this.babel || Babel.default ;

	atom = this.tmp() ;
	atom._loc = true ;

	if ( ! this.k || ! babel || ( this.l && babel.locale === this.l ) ) {
		return atom ;
	}

	if ( this.k && babel ) {
		l10n = babel.db[ babel.locale ].atoms.get( this.k ) ;
		if ( l10n && l10n !== this ) {
			// We found a translation for this atom, so we overwrite current properties with the existing translation.
			// We merge because things like n should be preserved if there are not defined in the l10n atom.
			atom = atom.assign( l10n ) ;
		}
	}

	return atom ;
} ;



Atom.applyFilters = function( str , filters ) {
	var i , iMax , filter , filterFn ;

	for ( i = 0 , iMax = filters.length ; i < iMax ; i ++ ) {
		filter = filters[ i ] ;
		filterFn = builtinFilters[ filter.id ] ;
		if ( filterFn ) { str = filterFn( str , filter.params ) ; }
	}

	return str ;
} ;



Atom.listToN = function( babel , list ) {
	var i , iMax , item , l10n , nSum = 0 , n ;

	for ( i = 0 , iMax = list.length ; i < iMax ; i ++ ) {
		item = list[ i ] ;

		if ( item && typeof item === 'object' ) {

			if ( 'n' in item ) {
				n = item.n ;
			}
			else if ( item.k && babel && ( l10n = babel.db[ babel.locale ].atoms.get( item.k ) ) && l10n.n ) {
				n = l10n.n ;
			}
			else {
				n = 1 ;
			}
		}
		else {
			n = 1 ;
		}

		if ( n === undefined ) { nSum ++ ; }
		else if ( n === '++' ) { nSum = '++' ; break ; }
		else { nSum += + n || 0 ; }
	}

	return nSum ;
} ;



// Aliases
const ALIASES = {
	"default": "def"
} ;



const ALT_ALIASES_ORD = {
	"a?": [ 'a' ] ,
	"n?": [ 'n' ] ,
	"n0?": [ 'n0' ] ,
	"g?": [ 'g' ] ,
	"p?": [ 'p' ] ,
	"na?": [ 'n' , 'a' ] ,
	"n0a?": [ 'n0' , 'a' ] ,
	"ng?": [ 'n' , 'g' ] ,
	"n0g?": [ 'n0' , 'g' ] ,
	"np?": [ 'n' , 'p' ] ,
	"n0p?": [ 'n0' , 'p' ] ,
	"npg?": [ 'n' , 'p' , 'g' ] ,
	"n0pg?": [ 'n0' , 'p' , 'g' ] ,

	// Boolean
	"b?": [ 'b' ] ,
	"?": [ 'b' ]
} ;



Atom.prototype.assign = function( object ) {
	var key , cKey ;

	for ( key in object ) {
		if ( object[ key ] === undefined || key === 'canon' || key === 'ord' ) { continue ; }

		if ( key === 'babel' ) {
			// Not enumerable
			Object.defineProperty( this , 'babel' , { value: object.babel , writable: true } ) ;
		}
		else if ( key === 'fn' ) {
			if ( ! this[ key ] ) { this[ key ] = object[ key ] ; }
			else { this[ key ] = [ ... this[ key ] , ... object[ key ] ] ; }
		}
		else {
			cKey = ALIASES[ key ] || key ;

			if ( ALT_ALIASES_ORD[ cKey ] ) {
				this.alt = object[ key ] ;
				this.ord = Array.from( ALT_ALIASES_ORD[ cKey ] ) ;
			}
			else if ( cKey === 'alt' ) {
				this.alt = object[ key ] ;
				this.ord = object.ord ;
			}
			else {
				this[ cKey ] = object[ key ] ;
			}
		}
	}

	return this ;
} ;



Atom.prototype.merge = function( object , isTmp ) {
	var atom ;

	if ( this._tmp ) {
		// This is a tmp object, just assign...
		return this.assign( object ) ;
	}

	atom = Object.create( this ).assign( object ) ;
	if ( isTmp ) { atom._tmp = true ; }
	return atom ;
} ;



// Return a temporary variante
Atom.prototype.tmp = function() {
	// If this is already a tmp object, nothing to do...
	if ( this._tmp ) { return this ; }

	var atom = Object.create( this ) ;
	atom._tmp = true ;
	return atom ;
} ;



Atom.prototype.before = function( str ) {
	if ( ! this.beforeStr ) { this.beforeStr = str ; }
	else { this.beforeStr = str + this.beforeStr ; }
} ;



Atom.prototype.sOrBefore = function( str ) {
	if ( ! this.s ) { this.s = str ; }
	else if ( ! this.beforeStr ) { this.beforeStr = str ; }
	else { this.beforeStr = str + this.beforeStr ; }
} ;



Atom.prototype.after = function( str ) {
	if ( ! this.afterStr ) { this.afterStr = str ; }
	else { this.afterStr = this.afterStr + str ; }
} ;



// Parser



Atom.parse = function( str , options ) {
	var atom ;

	options = options || {}  ;

	if ( options.proto ) {
		atom = Object.create( options.proto ) ;
		Atom.call( atom , { babel: options.babel } ) ;
	}
	else {
		atom = new Atom( { babel: options.babel } ) ;
	}

	if ( options.locale || options.l ) { atom.l = options.locale || options.l ; }

	atom.parse( str ) ;
	return atom ;
} ;



Atom.prototype.parse = function( str ) {
	var runtime = {
		i: 0 ,
		atom: this
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	parseStandAloneAtom( str , runtime ) ;
} ;



Atom.parseFromSentence = function( str , runtime , part ) {
	runtime.atom = part.atom = new Atom( { babel: runtime.sentence.babel } ) ;
	if ( runtime.sentence.locale ) { runtime.atom.l = runtime.sentence.locale ; }
	parseAtom( str , runtime ) ;
} ;



function parseStandAloneAtom( str , runtime ) {
	parseTranslatable( str , runtime ) ;
	parseAtom( str , runtime ) ;
}



function parseTranslatable( str , runtime ) {
	var start = runtime.i ;

	while ( runtime.i < str.length && str[ runtime.i ] !== '[' ) { runtime.i ++ ; }

	if ( start < runtime.i ) {
		runtime.atom.k = str.slice( start , runtime.i ) ;
	}
}



function parseAtom( str , runtime ) {
	var bracketStr , iBkup ;

	bracketStr = parseLevelContent( str , runtime ) ;

	if ( ! bracketStr ) { return ; }

	iBkup = runtime.i ;
	runtime.i = 0 ;

	parseInner( bracketStr , runtime ) ;

	runtime.i = iBkup ;
}



function parseInner( str , runtime ) {
	if ( str[ runtime.i ] === '/' ) { runtime.i ++ ; }

	while ( runtime.i < str.length ) {
		if ( str[ runtime.i ] === '/' ) {
			parseFilters( str.slice( runtime.i + 1 ) , runtime.atom ) ;
			return ;
		}

		parseKeyValue( str , runtime ) ;
		if ( str[ runtime.i ] !== '/' ) { break ; }
		runtime.i ++ ;
	}
}



function parseKeyValue( str , runtime ) {
	var key , value , iBkup ;

	key = parseKey( str , runtime ) ;
	value = parseValue( str , runtime ) ;

	key = ALIASES[ key ] || key ;

	if ( ALT_ALIASES_ORD[ key ] ) {
		runtime.atom.ord = Array.from( ALT_ALIASES_ORD[ key ] ) ;
		key = 'alt' ;
	}

	iBkup = runtime.i ;
	runtime.i = 0 ;

	switch ( key ) {
		case 'k' :
		case 'l' :
		case 's' :
		case 'n' :
		case 'g' :
		case 'a' :
		case 'd' :
		case 'b' :
		case 'um' :
		case 'def' :
			if ( value !== null ) { runtime.atom[ key ] = unescape( value ) ; }
			break ;

		case 'p' :
			runtime.atom.p = value === null ? '3' : unescape( value ) ;
			break ;

		case '+' :
		case 'x' :
			runtime.atom[ key ] = true ;
			break ;

		case 'alt' :
		case 'list' :
			if ( value !== null ) { runtime.atom[ key ] = parseArray( value , runtime ) ; }
			break ;

		case 'uv' :
			if ( value !== null ) { runtime.atom[ key ] = parseArray( value , runtime ).map( v => parseFloat( v ) ) ; }
			break ;

		case 'uf' :
		case 'uenum' :
		case 'enum' :
			if ( value === null ) {
				runtime.atom[ key ] = true ;
			}
			else {
				runtime.atom[ key ] = parseArray( value , runtime )
					.map( e => Sentence.parse( e , runtime.atom.babel ) ) ;
			}
			break ;

		default :
			// Special function
			if ( value !== null ) {
				value = parseArray( value , runtime ) ;
			}

			if ( runtime.atom.fn ) { runtime.atom.fn.push( { key: key , value: value } ) ; }
			else { runtime.atom.fn = [ { key: key , value: value } ] ; }
	}

	runtime.i = iBkup ;
	//runtime.atom[ key ] = value ;
}



function parseKey( str , runtime ) {
	var start = runtime.i , c ;

	runtime.noValue = false ;

	while ( runtime.i < str.length ) {
		c = str[ runtime.i ] ;

		if ( c === ':' ) {
			runtime.i ++ ;
			return str.slice( start , runtime.i - 1 ) ;
		}
		else if ( c === '?' ) {
			runtime.i ++ ;
			return str.slice( start , runtime.i ) ;
		}
		else if ( c === '/' ) {
			// This is a special function
			runtime.noValue = true ;
			return str.slice( start , runtime.i ) ;
		}

		runtime.i ++ ;
	}

	// This is a special function
	runtime.noValue = true ;
	return str.slice( start ) ;
}



function parseValue( str , runtime ) {
	if ( runtime.noValue ) { return null ; }

	var start = runtime.i ;

	while ( runtime.i < str.length ) {
		if ( str[ runtime.i ] === '\\' ) {
			runtime.i ++ ;
		}
		else if ( str[ runtime.i ] === '/' ) {
			return str.slice( start , runtime.i ) ;
		}

		runtime.i ++ ;
	}

	return str.slice( start , runtime.i ) ;
}



function parseArray( str , runtime ) {
	var c , subStr , subValue , iBkup ,
		start = runtime.i ,
		array = [] ;

	while ( runtime.i < str.length ) {
		c = str[ runtime.i ] ;

		if ( str[ runtime.i ] === '\\' ) {
			runtime.i += 2 ;
		}
		else if ( c === '[' ) {
			// Skip the bracket
			parseLevelContent( str , runtime ) ;
		}
		else if ( c === '(' ) {
			subStr = parseLevelContent( str , runtime , '(' , ')' ) ;

			iBkup = runtime.i ;
			runtime.i = 0 ;
			subValue = parseArray( subStr , runtime ) ;
			runtime.i = iBkup ;
		}
		else if ( c === ']' || c === ')' ) {
			return array ;
		}
		else if ( c === '|' ) {
			if ( subValue ) {
				array.push( subValue ) ;
				subValue = null ;
			}
			else {
				array.push( unescape( str.slice( start , runtime.i ) ) ) ;
			}

			start = ++ runtime.i ;
		}
		else {
			runtime.i ++ ;
		}
	}

	if ( subValue ) {
		array.push( subValue ) ;
	}
	else {
		array.push( unescape( str.slice( start , runtime.i ) ) ) ;
	}

	return array ;
}



function parseLevelContent( str , runtime , openChar = '[' , closeChar = ']' ) {
	if ( str[ runtime.i ] !== openChar ) { return ; }

	runtime.i ++ ;

	var start = runtime.i , level = 1 ;

	while ( runtime.i < str.length && level ) {
		if ( str[ runtime.i ] === '\\' ) { runtime.i ++ ; }
		else if ( str[ runtime.i ] === openChar ) { level ++ ; }
		else if ( str[ runtime.i ] === closeChar ) { level -- ; }
		runtime.i ++ ;
	}

	if ( level ) { return ; }

	return str.slice( start , runtime.i - 1 ) ;
}



function parseFilters( str , object ) {
	str.split( '/' ).forEach( filterStr => {
		var filter ,
			index = filterStr.indexOf( ':' ) ;

		if ( index === -1 ) {
			filter = { id: filterStr , params: null } ;
		}
		else {
			filter = { id: filterStr.slice( 0 , index ) , params: filterStr.slice( index + 1 ) } ;
		}

		if ( builtinFilters[ filter.id ]?.pre ) {
			if ( ! object.preFilters ) { object.preFilters = [] ; }
			object.preFilters.push( filter ) ;
		}
		else {
			if ( ! object.postFilters ) { object.postFilters = [] ; }
			object.postFilters.push( filter ) ;
		}
	} ) ;
}

// Export it, used by Sentence
Atom.parseFilters = parseFilters ;



function unescape( str ) {
	return str.replace( /\\(.)/g , match => match[ 1 ] ) ;
}



function unescapeAny( value ) {
	if ( Array.isArray( value ) ) {
		return value.map( v => unescapeAny( v ) ) ;
	}
	else if ( typeof value === 'string' ) {
		return value.replace( /\\(.)/g , match => match[ 1 ] ) ;
	}

	return value ;
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/lib/Sentence.js' , '/node_modules/babel-tower' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Babel Tower

	Copyright (c) 2016 - 2020 Cédric Ronvel

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





const Ref = require( 'kung-fig-ref' ) ;



function Sentence( template , babel , locale = null ) {
	this.locale = locale ;
	this.key = template ;
	this.parts = null ;

	//this.babel = babel || Babel.default ;
	//this.babel = null ;
	Object.defineProperty( this , 'babel' , { value: babel || Babel.default , writable: true } ) ;
}

module.exports = Sentence ;



const Babel = require( './Babel.js' ) ;
const Atom = require( './Atom.js' ) ;



// For backward compatibility
Sentence.create = function( template , babel ) { return new Sentence( template , babel ) ; } ;



Sentence.prototype.toStringKFG = function( ctx ) {
	var babel = ( ctx && ctx.__babel ) || Babel.default ;
	return this.solveWithBabel_( false , babel , ctx ) ;
} ;



Sentence.prototype.toString =
Sentence.prototype.render =
Sentence.prototype.solve = function( ... args ) {
	return this.solveWithBabel_( false , this.babel , ... args ) ;
} ;



Sentence.prototype.solveWithBabel = function( babel , ... args ) {
	return this.solveWithBabel_( false , babel , ... args ) ;
} ;



Sentence.prototype.solveWithBabel_ = function( isSubcall , babel , ... args ) {
	var sentence , i , iMax , part , str = '' , strPart , input , tvar , atom ,
		lastAtom = null ,
		index = 0 ,
		kungFigCtx = args[ args.length - 1 ] ,
		l10n =
			this.locale === babel.locale ? this :
			babel.db[ babel.locale ].sentences.get( this.key ) ;


	if ( ! l10n && ! isSubcall ) {
		// The sentence was not found in current localization DB, use the root babel
		babel = babel.root ;
	}

	// We check  l10n === this  because 'this' has more chance to be compiled than l10n.
	// /!\ l10n === this.key  => it's strange, maybe DEPRECATED code, need to further inspection
	sentence = ! l10n || l10n === this || l10n === this.key ? this : l10n ;

	// Lazy compilation
	if ( ! sentence.parts ) {
		if ( ! sentence.key ) { return '' ; }
		sentence.parse( sentence.key ) ;
	}

	for ( i = 0 , iMax = sentence.parts.length ; i < iMax ; i ++ ) {
		part = sentence.parts[ i ] ;

		if ( typeof part === 'string' ) {
			str += part ;
		}
		else {
			atom = part.atom ;

			if ( atom ) {
				atom = atom.localize( babel ) ;
			}

			if ( part.index !== Sentence.REPEAT_LAST_VALUE ) {
				if ( part.index >= 0 ) { index = part.index ; }
				input = part.ref ? part.ref.getValue( args[ index ] ) : args[ index ] ;
				if ( atom && atom.preFilters ) { input = Atom.applyFilters( input , atom.preFilters ) ; }
				if ( part.preFilters ) { input = Atom.applyFilters( input , part.preFilters ) ; }
				tvar = Sentence.localizeTvar( babel , input , kungFigCtx ) ;
			}
			else if ( ! tvar && part.index < 0 ) {
				input = args[ 0 ] ;
				if ( atom && atom.preFilters ) { input = Atom.applyFilters( input , atom.preFilters ) ; }
				if ( part.preFilters ) { input = Atom.applyFilters( input , part.preFilters ) ; }
				tvar = Sentence.localizeTvar( babel , input , kungFigCtx ) ;
			}

			if ( tvar === undefined ) {
				if ( atom ) {
					strPart = atom.solve( babel , lastAtom , kungFigCtx ) ;
				}
				else {
					strPart = babel.db[ babel.locale ].undefinedString ;
				}
			}
			else if ( Array.isArray( tvar ) ) {
				if ( atom ) {
					atom = atom.merge( { list: tvar } ) ;
					strPart = atom.solve( babel , lastAtom , kungFigCtx ) ;
				}
				else {
					strPart = Atom.listToN( babel , tvar ) ;
				}
			}
			else if ( atom ) {
				// The order matter, the atom overwrite the tvar
				atom = tvar.merge( atom ) ;
				strPart = atom.solve( babel , lastAtom , kungFigCtx ) ;
			}
			else {
				atom = tvar ;
				strPart = atom.solve( babel , lastAtom , kungFigCtx ) ;
			}

			if ( strPart instanceof Atom ) {
				lastAtom = strPart ;
			}
			else {
				// Apply filters here...
				// If there are filters on an atom-side, they are applied first
				if ( part.postFilters ) { strPart = Atom.applyFilters( strPart , part.postFilters ) ; }

				if ( babel.autoEscape ) {
					strPart = strPart.replace( babel.autoEscape , babel.autoEscape.substitution ) ;
				}

				str += strPart ;
				lastAtom = atom ;
			}
		}
	}

	return str ;
} ;



// Localize a Template Variable, transform it into an atom
Sentence.localizeTvar = function( babel , tvar , kungFigCtx ) {
	var atom = Sentence.convertTvar( babel , tvar , kungFigCtx ) ;

	if ( atom && ! Array.isArray( atom ) ) {
		atom = atom.localize( babel ) ;

		// untemp it! or REPEAT_LAST_VALUE will bug!
		atom._tmp = false ;
	}

	return atom ;
} ;



// Convert a Template Variable into an Atom
Sentence.convertTvar = function( babel , tvar , kungFigCtx ) {
	var proto ;

	/*
	if ( tvar === undefined ) {
		return new Atom( { s: babel.db[ babel.locale ].undefinedString } ) ;
	}
	*/

	if ( tvar === undefined ) { return tvar ; }

	if ( tvar && typeof tvar === 'object' ) {
		if ( Array.isArray( tvar ) || ( tvar instanceof Atom ) ) { return tvar ; }
		if ( tvar instanceof String ) { return new Atom( '' + tvar ) ; }
		if ( tvar instanceof Number ) { return new Atom( + tvar ) ; }

		// Kung-Fig interoperability...
		if ( tvar.__isDynamic__ ) {
			return Sentence.convertTvar( babel , tvar.getDeepFinalValue( kungFigCtx ) , kungFigCtx ) ;
		}

		// Check if it's iterable, if so convert it to an array...
		if ( typeof tvar[ Symbol.iterator ] === 'function' ) { return [ ... tvar ] ; }

		proto = Object.getPrototypeOf( tvar ) ;

		if ( proto !== Object.prototype && proto !== null && tvar.toString ) {
			// All non-plain object are stringified
			return new Atom( tvar.toString() ) ;
		}
	}

	return new Atom( tvar ) ;
} ;



Sentence.prototype.getNamedVars = function() {
	// Lazy compilation
	if ( ! this.parts ) {
		if ( ! this.key ) { return [] ; }
		this.parse( this.key ) ;
	}

	var namedVars = new Set() ;

	this.parts.forEach( part => {
		if ( ! part || typeof part !== 'object' || ! part.ref ) { return ; }
		namedVars.add( part.ref.getPath() ) ;
	} ) ;

	return [ ... namedVars ] ;
} ;



// Parser



Sentence.REPEAT_LAST_INDEX = -2 ;
Sentence.REPEAT_LAST_VALUE = -3 ;



Sentence.parse = function( str , babel , options ) {
	var sentence ;

	options = options || {}  ;

	if ( options.proto ) {
		sentence = Object.create( options.proto ) ;
		Sentence.call( sentence , str , babel ) ;
	}
	else {
		sentence = new Sentence( str , babel ) ;
	}

	sentence.parse( str ) ;

	return sentence ;
} ;



Sentence.prototype.parse = function( str ) {
	var runtime = {
		i: 0 ,
		sentence: this
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	this.key = str ;
	this.parts = [] ;

	parseSentence( str , runtime ) ;
} ;



function parseSentence( str , runtime ) {
	var start = runtime.i , needUnescape = false ;

	while ( runtime.i < str.length ) {
		if ( str[ runtime.i ] === '$' ) {
			if ( str[ runtime.i + 1 ] === '$' ) {
				needUnescape = true ;
				runtime.i ++ ;
			}
			else {
				parseAddRawText( str , runtime , start , needUnescape ) ;
				parseTvar( str , runtime ) ;
				start = runtime.i ;
				// runtime.i should not be incremented: it can be another $
				continue ;
			}
		}

		runtime.i ++ ;
	}

	parseAddRawText( str , runtime , start , needUnescape ) ;
}



function parseAddRawText( str , runtime , start , needUnescape ) {
	if ( start >= runtime.i ) { return ; }
	var text = str.slice( start , runtime.i ) ;
	if ( needUnescape ) { text = unescape( text ) ; }
	runtime.sentence.parts.push( text ) ;
}



function parseTvar( str , runtime ) {
	var c ;

	var part = {
		type: 'tvar' ,
		index: Sentence.REPEAT_LAST_INDEX ,
		ref: null ,
		filters: null
	} ;

	runtime.i ++ ;

	c = str.charCodeAt( runtime.i ) ;

	if ( c >= 0x30 && c <= 0x39 ) {
		part.index = Math.max( 0 , c - 0x31 ) ;
		runtime.i ++ ;
	}
	//else if ( c === 0x23 ) {	'#'
	//	part.index = Sentence.REPEAT_LAST_VALUE ;
	//	runtime.i ++ ;
	//}
	else if ( c !== 0x7b ) {	// '{'
		part.index = Sentence.REPEAT_LAST_VALUE ;
	}

	if ( str[ runtime.i ] === '{' ) {
		runtime.i ++ ;
		parseTvarPath( str , runtime , part ) ;
	}

	if ( str[ runtime.i ] === '[' ) {
		Atom.parseFromSentence( str , runtime , part ) ;
	}

	runtime.sentence.parts.push( part ) ;
}



function parseTvarPath( str , runtime , part ) {
	var start = runtime.i , doubleSlashIndex ;

	while ( str[ runtime.i ] !== '}' ) {
		if ( runtime.i >= str.length ) {
			throw new SyntaxError( 'Unexpected end of string' ) ;
		}

		if ( str[ runtime.i ] === '/' && str[ runtime.i + 1 ] === '/' ) {
			doubleSlashIndex = runtime.i ;
		}

		runtime.i ++ ;
	}

	if ( doubleSlashIndex !== undefined ) {
		part.ref = Ref.parse( str.slice( start , doubleSlashIndex ) , { noInitialDollar: true } ) ;
		Atom.parseFilters( str.slice( doubleSlashIndex + 2 , runtime.i ) , part ) ;
	}
	else {
		part.ref = Ref.parse( str.slice( start , runtime.i ) , { noInitialDollar: true } ) ;
	}

	runtime.i ++ ;
}



function unescape( str ) {
	return str.replace( /\$\$/g , () => '$' ) ;
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/lib/filters.js' , '/node_modules/babel-tower' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Babel Tower

	Copyright (c) 2016 - 2020 Cédric Ronvel

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





const string = require( 'string-kit' ) ;



// Case filters

exports.lc = exports.lowercase = exports.lowerCase = str => str.toLowerCase() ;
exports.uc = exports.uppercase = exports.upperCase = str => str.toUpperCase() ;
exports.uc1 = exports.uppercasefirst = exports.upperCaseFirst = str => str ? str[ 0 ].toUpperCase() + str.slice( 1 ) : str ;
exports.cc = exports.camelcase = exports.camelCase = str => string.toCamelCase( str ) ;
exports.dashed = str => string.camelCaseToDashed( str ) ;
exports.dash2space = str => str.replace( /-+/g , ' ' ) ;



// Letter filters

exports.latinize = str => string.latinize( str ) ;



// String-kit format's modes used as pre-filters (mostly for number)

const FORMAT_MODES = [ 'f' , 'P' , 'p' , 'k' , 'e' , 'K' , 'd' , 'i' , 'u' , 'U' , 'm' , 't' , 'h' , 'x' , 'o' , 'b' ] ;
FORMAT_MODES.forEach( mode => {
	var fn = string.format.modes[ mode ] ;
	exports[ mode ] = ( input , params ) => fn( input , params ) ;
	exports[ mode ].pre = true ;
} ) ;



// Escape filters

exports.sharg = exports.shellarg = exports.shellArg = str => string.escape.shellArg( str ) ;
exports.regex = exports.regexp = exports.regExp = str => string.escape.regExp( str ) ;
exports.ctrl = exports.control = str => string.escape.control( str ) ;
exports.html = exports.htmlcontent = exports.htmlContent = str => string.escape.html( str ) ;
exports.htmlattr = exports.htmlAttr = exports.htmlAttribute = str => string.escape.htmlAttr( str ) ;
exports.htmlsp = exports.htmlspecialchars = exports.htmlSpecialChars = str => string.escape.htmlSpecialChars( str ) ;



// Path filters

const path = require( 'path' ) ;

exports.dirname = str => path.dirname( str ) ;
exports.basename = str => path.basename( str ) ;
exports.extname = str => path.extname( str ) ;
exports.basenameNoExt = exports.baseNameNoExt = str => path.basename( str , path.extname( str ) ) ;



// English grammar filters

const vowels = [ 'a' , 'e' , 'i' , 'o' , 'u' ] ;

// Add 'the' article except if str starts with an uppercase letter
exports['en;the'] = str => str[ 0 ].toLowerCase() !== str[ 0 ] ? str : 'the ' + str ;

// Add 'a' or 'an' article except if str starts with an uppercase letter
exports['en;a'] = str => {
	if ( str[ 0 ].toLowerCase() !== str[ 0 ] ) { return str ; }
	return ( vowels.indexOf( str[ 0 ] ) !== -1 ? 'an ' : 'a ' ) + str ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/array-kit' , '/node_modules/array-kit/lib/array-kit.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/array-kit/lib/array-kit.js' , '/node_modules/array-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Array Kit

	Copyright (c) 2014 - 2020 Cédric Ronvel

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





const arrayKit = {
	range: require( './range.js' ) ,
	sample: require( './sample.js' ) ,
	inPlaceFilter: require( './inPlaceFilter.js' ) ,
	delete: require( './delete.js' ) ,
	deleteValue: require( './deleteValue.js' )
} ;

module.exports = arrayKit ;

arrayKit.randomInteger = ( min , max ) => min + Math.floor( ( max - min + 1 ) * Math.random() ) ;

arrayKit.random = arrayKit.randomElement = array => array[ Math.floor( array.length * Math.random() ) ] ;
arrayKit.shuffle = array => arrayKit.sample( array , array.length , true ) ;
arrayKit.randomSampleSize = ( array , min , max , inPlace ) => arrayKit.sample( array , arrayKit.randomInteger( min , max ) , inPlace ) ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/array-kit/lib/range.js' , '/node_modules/array-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Array Kit

	Copyright (c) 2014 - 2020 Cédric Ronvel

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





/*
	Create an array.

	.range( [start] , end , [step] ), where:

	* start `number` (default: 0) the value of the first item
	* end `number` the values end at this number (excluded)
	* step `number` (default: 1) the value of the increment
*/
module.exports = function( start , end , step ) {
	if ( ! arguments.length ) { return [] ; }

	if ( arguments.length === 1 ) {
		end = start ;
		start = 0 ;
	}

	if ( ! step ) { step = start <= end ? 1 : -1 ; }

	if ( ( step > 0 && start >= end ) || ( step < 0 && start <= end ) ) {
		return [] ;
	}

	var i = 0 , v = start , output = [] ;

	if ( step > 0 ) {
		for ( ; v < end ; i ++ , v += step ) { output[ i ] = v ; }
	}
	else {
		for ( ; v > end ; i ++ , v += step ) { output[ i ] = v ; }
	}

	return output ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/array-kit/lib/sample.js' , '/node_modules/array-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Array Kit

	Copyright (c) 2014 - 2020 Cédric Ronvel

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





/*
	.sample( array , count , inPlace ): Return a new array with random element from the first one.

	* array: the source array
	* count: the number of element to keep
	* inPlace: boolean, true if the array should be shuffled in-place
*/
module.exports = ( array , count = Infinity , inPlace = false ) => {
	var currentIndex , randomIndex , temp ,
		sample = inPlace ? array : [ ... array ] ;

	count = Math.max( Math.min( count , array.length ) , 0 ) ;

	for ( currentIndex = 0 ; currentIndex < count ; currentIndex ++ ) {
		randomIndex = currentIndex + Math.floor( ( sample.length - currentIndex ) * Math.random() ) ;
		temp = sample[ currentIndex ] ;
		sample[ currentIndex ] = sample[ randomIndex ] ;
		sample[ randomIndex ] = temp ;
	}

	sample.length = count ;

	return sample ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/array-kit/lib/inPlaceFilter.js' , '/node_modules/array-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Array Kit

	Copyright (c) 2014 - 2020 Cédric Ronvel

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





/*
	Like array#filter(), but modify the array in-place.

	* src `Array` the source array
	* fn `Function( element , [index] , [array] )`, the condition function used on all element of the array, where:
		* element the current element
		* index the index of the current element
		* the array
	* thisArg: what is used as `this` inside the callback function
	* forceKey: for that key instead of the index of the current element (useful for other libs)
*/
module.exports = ( src , fn , thisArg , forceKey ) => {
	var hasForcedKey = arguments.length >= 4 ,
		value ,
		i = 0 ,
		j = 0 ;

	while ( i < src.length ) {
		value = src[ i ] ;

		if ( fn.call( thisArg , value , hasForcedKey ? forceKey : i , src ) ) {
			src[ j ] = value ;
			j ++ ;
		}

		i ++ ;
	}

	src.length = j ;

	return src ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/array-kit/lib/delete.js' , '/node_modules/array-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Array Kit

	Copyright (c) 2014 - 2020 Cédric Ronvel

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





/*
	Delete an element of the array in-place, and move remaining elements one index to the left.
	Faster than splice, since it does not return an array.

	* src `Array` the source array
	* index the index to delete
*/
module.exports = ( src , index ) => {
	if ( index >= src.length ) { return ; }

	var iMax = src.length - 2 ;

	while ( index <= iMax ) {
		src[ index ] = src[ index + 1 ] ;
		index ++ ;
	}

	src.length -- ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/array-kit/lib/deleteValue.js' , '/node_modules/array-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Array Kit

	Copyright (c) 2014 - 2020 Cédric Ronvel

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





// This is a copy of .inPlaceFilter() with a hard-coded function.

/*
	Delete all occurencies of a value, in-place.

	* src `Array` the source array
	* value: the value to delete
*/
module.exports = ( src , value ) => {
	var currentValue , deletedCount ,
		i = 0 ,
		j = 0 ;

	while ( i < src.length ) {
		currentValue = src[ i ] ;

		// The left-part is for checking NaN (because NaN !== NaN),
		// checking value is fast and avoid unecessary call to Number.isNaN() which is a function call.
		if ( value !== currentValue && ( value || ! Number.isNaN( value ) || ! Number.isNaN( currentValue ) ) ) {
			src[ j ] = currentValue ;
			j ++ ;
		}

		i ++ ;
	}

	deletedCount = src.length - j ;
	src.length = j ;

	return deletedCount ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/tree-kit' , '/node_modules/tree-kit/lib/tree.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/tree-kit/lib/dotPath.js' , '/node_modules/tree-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	Tree Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const dotPath = {} ;
module.exports = dotPath ;



const EMPTY_PATH = [] ;
const PROTO_POLLUTION_MESSAGE = 'This would cause prototype pollution' ;



function toPathArray( path ) {
	if ( Array.isArray( path ) ) {
		/*
		let i , iMax = path.length ;
		for ( i = 0 ; i < iMax ; i ++ ) {
			if ( typeof path[ i ] !== 'string' || typeof path[ i ] !== 'number' ) { path[ i ] = '' + path[ i ] ; }
		}
		//*/
		return path ;
	}

	if ( ! path ) { return EMPTY_PATH ; }
	if ( typeof path === 'string' ) {
		return path[ path.length - 1 ] === '.' ? path.slice( 0 , - 1 ).split( '.' ) : path.split( '.' ) ;
	}

	throw new TypeError( '[tree.dotPath]: the path argument should be a string or an array' ) ;
}

// Expose toPathArray()
dotPath.toPathArray = toPathArray ;



// Walk the tree using the path array.
function walk( object , pathArray , maxOffset = 0 ) {
	var index , indexMax , key ,
		pointer = object ;

	for ( index = 0 , indexMax = pathArray.length + maxOffset ; index < indexMax ; index ++ ) {
		key = pathArray[ index ] ;

		if ( typeof key === 'object' || key === '__proto__' || typeof pointer === 'function' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }
		if ( ! pointer || typeof pointer !== 'object' ) { return undefined ; }

		pointer = pointer[ key ] ;
	}

	return pointer ;
}



// Walk the tree, create missing element: pave the path up to before the last part of the path.
// Return that before-the-last element.
// Object MUST be an object! no check are performed for the first step!
function pave( object , pathArray ) {
	var index , indexMax , key ,
		pointer = object ;

	for ( index = 0 , indexMax = pathArray.length - 1 ; index < indexMax ; index ++ ) {
		key = pathArray[ index ] ;

		if ( typeof key === 'object' || key === '__proto__' || typeof pointer[ key ] === 'function' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }
		if ( ! pointer[ key ] || typeof pointer[ key ] !== 'object' ) { pointer[ key ] = {} ; }

		pointer = pointer[ key ] ;
	}

	return pointer ;
}



dotPath.get = ( object , path ) => walk( object , toPathArray( path ) ) ;



dotPath.set = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) { return ; }

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	pointer[ key ] = value ;

	return value ;
} ;



dotPath.define = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) { return ; }

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! ( key in pointer ) ) { pointer[ key ] = value ; }

	return pointer[ key ] ;
} ;



dotPath.inc = ( object , path ) => {
	if ( ! object || typeof object !== 'object' ) { return ; }

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( typeof pointer[ key ] === 'number' ) { pointer[ key ] ++ ; }
	else if ( ! pointer[ key ] || typeof pointer[ key ] !== 'object' ) { pointer[ key ] = 1 ; }

	return pointer[ key ] ;
} ;



dotPath.dec = ( object , path ) => {
	if ( ! object || typeof object !== 'object' ) { return ; }

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( typeof pointer[ key ] === 'number' ) { pointer[ key ] -- ; }
	else if ( ! pointer[ key ] || typeof pointer[ key ] !== 'object' ) { pointer[ key ] = - 1 ; }

	return pointer[ key ] ;
} ;



dotPath.concat = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) { return ; }

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! pointer[ key ] ) { pointer[ key ] = value ; }
	else if ( Array.isArray( pointer[ key ] ) && Array.isArray( value ) ) {
		pointer[ key ] = pointer[ key ].concat( value ) ;
	}
	//else ? do nothing???

	return pointer[ key ] ;
} ;



dotPath.insert = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) { return ; }

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! pointer[ key ] ) { pointer[ key ] = value ; }
	else if ( Array.isArray( pointer[ key ] ) && Array.isArray( value ) ) {
		pointer[ key ] = value.concat( pointer[ key ] ) ;
	}
	//else ? do nothing???

	return pointer[ key ] ;
} ;



dotPath.delete = ( object , path ) => {
	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = walk( object , pathArray , - 1 ) ;

	if ( ! pointer || typeof pointer !== 'object' || ! Object.hasOwn( pointer , key ) ) { return false ; }

	delete pointer[ key ] ;

	return true ;
} ;



dotPath.autoPush = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) { return ; }

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( pointer[ key ] === undefined ) { pointer[ key ] = value ; }
	else if ( Array.isArray( pointer[ key ] ) ) { pointer[ key ].push( value ) ; }
	else { pointer[ key ] = [ pointer[ key ] , value ] ; }

	return pointer[ key ] ;
} ;



dotPath.append = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) { return ; }

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! pointer[ key ] ) { pointer[ key ] = [ value ] ; }
	else if ( Array.isArray( pointer[ key ] ) ) { pointer[ key ].push( value ) ; }
	//else ? do nothing???

	return pointer[ key ] ;
} ;



dotPath.prepend = ( object , path , value ) => {
	if ( ! object || typeof object !== 'object' ) { return ; }

	var pathArray = toPathArray( path ) ,
		key = pathArray[ pathArray.length - 1 ] ;

	if ( typeof key === 'object' || key === '__proto__' ) { throw new Error( PROTO_POLLUTION_MESSAGE ) ; }

	var pointer = pave( object , pathArray ) ;

	if ( ! pointer[ key ] ) { pointer[ key ] = [ value ] ; }
	else if ( Array.isArray( pointer[ key ] ) ) { pointer[ key ].unshift( value ) ; }
	//else ? do nothing???

	return pointer[ key ] ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Package.prepare( '/node_modules/babel-tower/node_modules/string-kit' , '/node_modules/babel-tower/node_modules/string-kit/lib/string.js' , null ) ;
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/string.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const stringKit = {} ;
module.exports = stringKit ;



/*
// Tier 0: add polyfills to stringKit
const polyfill = require( './polyfill.js' ) ;

for ( let fn_ in polyfill ) {
	stringKit[ fn ] = function( str , ... args ) {
		return polyfill[ fn ].call( str , ... args ) ;
	} ;
}
//*/



Object.assign( stringKit ,

	// Tier 1
	{ escape: require( './escape.js' ) } ,
	{ ansi: require( './ansi.js' ) } ,
	{ unicode: require( './unicode.js' ) }
) ;



Object.assign( stringKit ,

	// Tier 2
	require( './format.js' ) ,

	// Tier 3
	require( './misc.js' ) ,
	require( './inspect.js' ) ,
	require( './regexp.js' ) ,
	require( './camel.js' ) ,
	{
		latinize: require( './latinize.js' ) ,
		toTitleCase: require( './toTitleCase.js' ) ,
		wordwrap: require( './wordwrap.js' ) ,
		naturalSort: require( './naturalSort.js' ) ,
		fuzzy: require( './fuzzy.js' ) ,
		StringNumber: require( './StringNumber.js' )
	}
) ;



/*
// Install all polyfill into String.prototype
stringKit.installPolyfills = function installPolyfills() {
	for ( let fn in polyfill ) {
		if ( ! String.prototype[ fn ] ) {
			String.prototype[ fn ] = polyfill[ fn ] ;
		}
	}
} ;
//*/
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/escape.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	Escape collection.
*/







// From Mozilla Developper Network
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
exports.regExp = exports.regExpPattern = str => str.replace( /([.*+?^${}()|[\]/\\])/g , '\\$1' ) ;

// This replace any single $ by a double $$
exports.regExpReplacement = str => str.replace( /\$/g , '$$$$' ) ;

// Escape for string.format()
// This replace any single % by a double %%
exports.format = str => str.replace( /%/g , '%%' ) ;

exports.jsSingleQuote = str => exports.control( str ).replace( /'/g , "\\'" ) ;
exports.jsDoubleQuote = str => exports.control( str ).replace( /"/g , '\\"' ) ;

exports.shellArg = str => '\'' + str.replace( /'/g , "'\\''" ) + '\'' ;



var escapeControlMap = {
	'\r': '\\r' ,
	'\n': '\\n' ,
	'\t': '\\t' ,
	'\x7f': '\\x7f'
} ;

// Escape \r \n \t so they become readable again, escape all ASCII control character as well, using \x syntaxe
exports.control = ( str , keepNewLineAndTab = false ) => str.replace( /[\x00-\x1f\x7f]/g , match => {
	if ( keepNewLineAndTab && ( match === '\n' || match === '\t' ) ) { return match ; }
	if ( escapeControlMap[ match ] !== undefined ) { return escapeControlMap[ match ] ; }
	var hex = match.charCodeAt( 0 ).toString( 16 ) ;
	if ( hex.length % 2 ) { hex = '0' + hex ; }
	return '\\x' + hex ;
} ) ;



var escapeHtmlMap = {
	'&': '&amp;' ,
	'<': '&lt;' ,
	'>': '&gt;' ,
	'"': '&quot;' ,
	"'": '&#039;'
} ;

// Only escape & < > so this is suited for content outside tags
exports.html = str => str.replace( /[&<>]/g , match => escapeHtmlMap[ match ] ) ;

// Escape & < > " so this is suited for content inside a double-quoted attribute
exports.htmlAttr = str => str.replace( /[&<>"]/g , match => escapeHtmlMap[ match ] ) ;

// Escape all html special characters & < > " '
exports.htmlSpecialChars = str => str.replace( /[&<>"']/g , match => escapeHtmlMap[ match ] ) ;

// Percent-encode all control chars and codepoint greater than 255 using percent encoding
exports.unicodePercentEncode = str => str.replace( /[\x00-\x1f\u0100-\uffff\x7f%]/g , match => {
	try {
		return encodeURI( match ) ;
	}
	catch ( error ) {
		// encodeURI can throw on bad surrogate pairs, but we just strip those characters
		return '' ;
	}
} ) ;

// Encode HTTP header value
exports.httpHeaderValue = str => exports.unicodePercentEncode( str ) ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/ansi.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





// To solve dependency hell, we do not rely on terminal-kit anymore.
const ansi = {
	reset: '\x1b[0m' ,
	bold: '\x1b[1m' ,
	dim: '\x1b[2m' ,
	italic: '\x1b[3m' ,
	underline: '\x1b[4m' ,
	inverse: '\x1b[7m' ,

	defaultColor: '\x1b[39m' ,
	black: '\x1b[30m' ,
	red: '\x1b[31m' ,
	green: '\x1b[32m' ,
	yellow: '\x1b[33m' ,
	blue: '\x1b[34m' ,
	magenta: '\x1b[35m' ,
	cyan: '\x1b[36m' ,
	white: '\x1b[37m' ,
	grey: '\x1b[90m' ,
	gray: '\x1b[90m' ,
	brightBlack: '\x1b[90m' ,
	brightRed: '\x1b[91m' ,
	brightGreen: '\x1b[92m' ,
	brightYellow: '\x1b[93m' ,
	brightBlue: '\x1b[94m' ,
	brightMagenta: '\x1b[95m' ,
	brightCyan: '\x1b[96m' ,
	brightWhite: '\x1b[97m' ,

	defaultBgColor: '\x1b[49m' ,
	bgBlack: '\x1b[40m' ,
	bgRed: '\x1b[41m' ,
	bgGreen: '\x1b[42m' ,
	bgYellow: '\x1b[43m' ,
	bgBlue: '\x1b[44m' ,
	bgMagenta: '\x1b[45m' ,
	bgCyan: '\x1b[46m' ,
	bgWhite: '\x1b[47m' ,
	bgGrey: '\x1b[100m' ,
	bgGray: '\x1b[100m' ,
	bgBrightBlack: '\x1b[100m' ,
	bgBrightRed: '\x1b[101m' ,
	bgBrightGreen: '\x1b[102m' ,
	bgBrightYellow: '\x1b[103m' ,
	bgBrightBlue: '\x1b[104m' ,
	bgBrightMagenta: '\x1b[105m' ,
	bgBrightCyan: '\x1b[106m' ,
	bgBrightWhite: '\x1b[107m'
} ;

module.exports = ansi ;



ansi.fgColor = {
	defaultColor: ansi.defaultColor ,
	black: ansi.black ,
	red: ansi.red ,
	green: ansi.green ,
	yellow: ansi.yellow ,
	blue: ansi.blue ,
	magenta: ansi.magenta ,
	cyan: ansi.cyan ,
	white: ansi.white ,
	grey: ansi.grey ,
	gray: ansi.gray ,
	brightBlack: ansi.brightBlack ,
	brightRed: ansi.brightRed ,
	brightGreen: ansi.brightGreen ,
	brightYellow: ansi.brightYellow ,
	brightBlue: ansi.brightBlue ,
	brightMagenta: ansi.brightMagenta ,
	brightCyan: ansi.brightCyan ,
	brightWhite: ansi.brightWhite
} ;



ansi.bgColor = {
	defaultColor: ansi.defaultBgColor ,
	black: ansi.bgBlack ,
	red: ansi.bgRed ,
	green: ansi.bgGreen ,
	yellow: ansi.bgYellow ,
	blue: ansi.bgBlue ,
	magenta: ansi.bgMagenta ,
	cyan: ansi.bgCyan ,
	white: ansi.bgWhite ,
	grey: ansi.bgGrey ,
	gray: ansi.bgGray ,
	brightBlack: ansi.bgBrightBlack ,
	brightRed: ansi.bgBrightRed ,
	brightGreen: ansi.bgBrightGreen ,
	brightYellow: ansi.bgBrightYellow ,
	brightBlue: ansi.bgBrightBlue ,
	brightMagenta: ansi.bgBrightMagenta ,
	brightCyan: ansi.bgBrightCyan ,
	brightWhite: ansi.bgBrightWhite
} ;



ansi.trueColor = ( r , g , b ) => {
	if ( g === undefined && typeof r === 'string' ) {
		let hex = r ;
		if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }	// Strip the # if necessary
		if ( hex.length === 3 ) { hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ; }
		r = parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ;
		g = parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ;
		b = parseInt( hex.slice( 4 , 6 ) , 16 ) || 0 ;
	}

	return '\x1b[38;2;' + r + ';' + g + ';' + b + 'm' ;
} ;



ansi.bgTrueColor = ( r , g , b ) => {
	if ( g === undefined && typeof r === 'string' ) {
		let hex = r ;
		if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }	// Strip the # if necessary
		if ( hex.length === 3 ) { hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ; }
		r = parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ;
		g = parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ;
		b = parseInt( hex.slice( 4 , 6 ) , 16 ) || 0 ;
	}

	return '\x1b[48;2;' + r + ';' + g + ';' + b + 'm' ;
} ;



const ANSI_CODES = {
	'0': null ,

	'1': { bold: true } ,
	'2': { dim: true } ,
	'22': { bold: false , dim: false } ,
	'3': { italic: true } ,
	'23': { italic: false } ,
	'4': { underline: true } ,
	'24': { underline: false } ,
	'5': { blink: true } ,
	'25': { blink: false } ,
	'7': { inverse: true } ,
	'27': { inverse: false } ,
	'8': { hidden: true } ,
	'28': { hidden: false } ,
	'9': { strike: true } ,
	'29': { strike: false } ,

	'30': { color: 0 } ,
	'31': { color: 1 } ,
	'32': { color: 2 } ,
	'33': { color: 3 } ,
	'34': { color: 4 } ,
	'35': { color: 5 } ,
	'36': { color: 6 } ,
	'37': { color: 7 } ,
	//'39': { defaultColor: true } ,
	'39': { color: 'default' } ,

	'90': { color: 8 } ,
	'91': { color: 9 } ,
	'92': { color: 10 } ,
	'93': { color: 11 } ,
	'94': { color: 12 } ,
	'95': { color: 13 } ,
	'96': { color: 14 } ,
	'97': { color: 15 } ,

	'40': { bgColor: 0 } ,
	'41': { bgColor: 1 } ,
	'42': { bgColor: 2 } ,
	'43': { bgColor: 3 } ,
	'44': { bgColor: 4 } ,
	'45': { bgColor: 5 } ,
	'46': { bgColor: 6 } ,
	'47': { bgColor: 7 } ,
	//'49': { bgDefaultColor: true } ,
	'49': { bgColor: 'default' } ,

	'100': { bgColor: 8 } ,
	'101': { bgColor: 9 } ,
	'102': { bgColor: 10 } ,
	'103': { bgColor: 11 } ,
	'104': { bgColor: 12 } ,
	'105': { bgColor: 13 } ,
	'106': { bgColor: 14 } ,
	'107': { bgColor: 15 }
} ;



// Parse ANSI codes, output is compatible with the markup parser
ansi.parse = str => {
	var ansiCodes , raw , part , style , output = [] ;

	for ( [ , ansiCodes , raw ] of str.matchAll( /\x1b\[([0-9;]+)m|(.[^\x1b]*)/g ) ) {
		if ( raw ) {
			if ( output.length ) { output[ output.length - 1 ].text += raw ; }
			else { output.push( { text: raw } ) ; }
		}
		else {
			ansiCodes.split( ';' ).forEach( ansiCode => {
				style = ANSI_CODES[ ansiCode ] ;
				if ( style === undefined ) { return ; }

				if ( ! output.length || output[ output.length - 1 ].text ) {
					if ( ! style ) {
						part = { text: '' } ;
					}
					else {
						part = Object.assign( {} , part , style ) ;
						part.text = '' ;
					}

					output.push( part ) ;
				}
				else {
					// There is no text, no need to create a new part
					if ( ! style ) {
						// Replace the last part
						output[ output.length - 1 ] = { text: '' } ;
					}
					else {
						// update the last part
						Object.assign( part , style ) ;
					}
				}
			} ) ;
		}
	}

	return output ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/unicode.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





/*
	Javascript does not use UTF-8 but UCS-2.
	The purpose of this module is to process correctly strings containing UTF-8 characters that take more than 2 bytes.

	Since the punycode module is deprecated in Node.js v8.x, this is an adaptation of punycode.ucs2.x
	as found on Aug 16th 2017 at: https://github.com/bestiejs/punycode.js/blob/master/punycode.js.

	2021 note -- Modern Javascript is way more unicode friendly since many years, e.g. `Array.from( string )` and `for ( char of string )` are unicode aware.
	Some methods here are now useless, but have been modernized to use the correct ES features.
*/



// Create the module and export it
const unicode = {} ;
module.exports = unicode ;



unicode.encode = array => String.fromCodePoint( ... array ) ;

// Decode a string into an array of unicode codepoints.
// The 2nd argument of Array.from() is a map function, it avoids creating intermediate array.
unicode.decode = str => Array.from( str , c => c.codePointAt( 0 ) ) ;

// DEPRECATED: This function is totally useless now, with modern JS.
unicode.firstCodePoint = str => str.codePointAt( 0 ) ;

// Extract only the first char.
unicode.firstChar = str => str.length ? String.fromCodePoint( str.codePointAt( 0 ) ) : undefined ;

// DEPRECATED: This function is totally useless now, with modern JS.
unicode.toArray = str => Array.from( str ) ;



// Decode a string into an array of Cell (used by Terminal-kit).
// Wide chars have an additionnal filler cell, so position is correct
unicode.toCells = ( Cell , str , tabWidth = 4 , linePosition = 0 , ... extraCellArgs ) => {
	var char , code , fillSize , width ,
		output = [] ;

	for ( char of str ) {
		code = char.codePointAt( 0 ) ;

		if ( code === 0x0a ) {	// New line
			linePosition = 0 ;
		}
		else if ( code === 0x09 ) {	// Tab
			// Depends upon the next tab-stop
			fillSize = tabWidth - ( linePosition % tabWidth ) - 1 ;
			//output.push( new Cell( '\t' , ... extraCellArgs ) ) ;
			output.push( new Cell( '\t' , 1 , ... extraCellArgs ) ) ;
			linePosition += 1 + fillSize ;

			// Add a filler cell
			while ( fillSize -- ) { output.push( new Cell( ' ' , -2 , ... extraCellArgs ) ) ; }
		}
		else {
			width = unicode.codePointWidth( code ) ,
			output.push( new Cell( char , width , ... extraCellArgs ) ) ;
			linePosition += width ;

			// Add an anti-filler cell (a cell with 0 width, following a wide char)
			while ( -- width > 0 ) { output.push( new Cell( ' ' , -1 , ... extraCellArgs ) ) ; }
		}
	}

	return output ;
} ;



unicode.fromCells = ( cells ) => {
	var cell , str = '' ;

	for ( cell of cells ) {
		if ( ! cell.filler ) { str += cell.char ; }
	}

	return str ;
} ;



// Get the length of an unicode string
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
// /!\ Use Array.from().length instead??? Not using it is potentially faster, but it needs benchmark to be sure.
unicode.length = str => {
	// for ... of is unicode-aware
	var char , length = 0 ;
	for ( char of str ) { length ++ ; }		/* eslint-disable-line no-unused-vars */
	return length ;
} ;



// Return the width of a string in a terminal/monospace font
unicode.width = str => {
	// for ... of is unicode-aware
	var char , count = 0 ;
	for ( char of str ) { count += unicode.codePointWidth( char.codePointAt( 0 ) ) ; }
	return count ;
} ;



// Return the width of an array of string in a terminal/monospace font
unicode.arrayWidth = ( array , limit ) => {
	var index , count = 0 ;

	if ( limit === undefined ) { limit = array.length ; }

	for ( index = 0 ; index < limit ; index ++ ) {
		count += unicode.isFullWidth( array[ index ] ) ? 2 : 1 ;
	}

	return count ;
} ;



// Userland may use this, it is more efficient than .truncateWidth() + .width(),
// and BTW even more than testing .width() then .truncateWidth() + .width()
var lastTruncateWidth = 0 ;
unicode.getLastTruncateWidth = () => lastTruncateWidth ;



// Return a string that does not exceed the limit.
unicode.widthLimit =	// DEPRECATED
unicode.truncateWidth = ( str , limit ) => {
	var char , charWidth , position = 0 ;

	// Module global:
	lastTruncateWidth = 0 ;

	for ( char of str ) {
		charWidth = unicode.codePointWidth( char.codePointAt( 0 ) ) ;

		if ( lastTruncateWidth + charWidth > limit ) {
			return str.slice( 0 , position ) ;
		}

		lastTruncateWidth += charWidth ;
		position += char.length ;
	}

	// The string remains unchanged
	return str ;
} ;



/*
	** PROBABLY DEPRECATED **

	Check if a UCS2 char is a surrogate pair.

	Returns:
		0: single char
		1: leading surrogate
		-1: trailing surrogate

	Note: it does not check input, to gain perfs.
*/
unicode.surrogatePair = char => {
	var code = char.charCodeAt( 0 ) ;

	if ( code < 0xd800 || code >= 0xe000 ) { return 0 ; }
	else if ( code < 0xdc00 ) { return 1 ; }
	return -1 ;
} ;



// Check if a character is a full-width char or not
unicode.isFullWidth = char => unicode.isFullWidthCodePoint( char.codePointAt( 0 ) ) ;

// Return the width of a char, leaner than .width() for one char
unicode.charWidth = char => unicode.codePointWidth( char.codePointAt( 0 ) ) ;



/*
	Build the Emoji width lookup.
	The ranges file (./lib/unicode-emoji-width-ranges.json) is produced by a Terminal-Kit script ([terminal-kit]/utilities/build-emoji-width-lookup.js),
	that writes each emoji and check the cursor location.
*/
const emojiWidthLookup = new Map() ;

( function() {
	var ranges = require( './unicode-emoji-width-ranges.json' ) ;
	for ( let range of ranges ) {
		for ( let i = range.s ; i <= range.e ; i ++ ) {
			emojiWidthLookup.set( i , range.w ) ;
		}
	}
} )() ;

/*
	Check if a codepoint represent a full-width char or not.
*/
unicode.codePointWidth = code => {
	// Assuming all emoji are wide here
	if ( unicode.isEmojiCodePoint( code ) ) {
		return emojiWidthLookup.get( code ) ?? 2 ;
	}

	// Code points are derived from:
	// http://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
	if ( code >= 0x1100 && (
		code <= 0x115f ||	// Hangul Jamo
		code === 0x2329 || // LEFT-POINTING ANGLE BRACKET
		code === 0x232a || // RIGHT-POINTING ANGLE BRACKET
		// CJK Radicals Supplement .. Enclosed CJK Letters and Months
		( 0x2e80 <= code && code <= 0x3247 && code !== 0x303f ) ||
		// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
		( 0x3250 <= code && code <= 0x4dbf ) ||
		// CJK Unified Ideographs .. Yi Radicals
		( 0x4e00 <= code && code <= 0xa4c6 ) ||
		// Hangul Jamo Extended-A
		( 0xa960 <= code && code <= 0xa97c ) ||
		// Hangul Syllables
		( 0xac00 <= code && code <= 0xd7a3 ) ||
		// CJK Compatibility Ideographs
		( 0xf900 <= code && code <= 0xfaff ) ||
		// Vertical Forms
		( 0xfe10 <= code && code <= 0xfe19 ) ||
		// CJK Compatibility Forms .. Small Form Variants
		( 0xfe30 <= code && code <= 0xfe6b ) ||
		// Halfwidth and Fullwidth Forms
		( 0xff01 <= code && code <= 0xff60 ) ||
		( 0xffe0 <= code && code <= 0xffe6 ) ||
		// Kana Supplement
		( 0x1b000 <= code && code <= 0x1b001 ) ||
		// Enclosed Ideographic Supplement
		( 0x1f200 <= code && code <= 0x1f251 ) ||
		// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
		( 0x20000 <= code && code <= 0x3fffd )
	) ) {
		return 2 ;
	}

	if (
		unicode.isEmojiModifierCodePoint( code ) ||
		unicode.isZeroWidthDiacriticCodePoint( code )
	) {
		return 0 ;
	}

	return 1 ;
} ;

// For a true/false type of result
unicode.isFullWidthCodePoint = code => unicode.codePointWidth( code ) === 2 ;



// Convert normal ASCII chars to their full-width counterpart
unicode.toFullWidth = str => {
	return String.fromCodePoint( ... Array.from( str , char => {
		var code = char.codePointAt( 0 ) ;
		return code >= 33 && code <= 126  ?  0xff00 + code - 0x20  :  code ;
	} ) ) ;
} ;



// Check if a character is a diacritic with zero-width or not
unicode.isZeroWidthDiacritic = char => unicode.isZeroWidthDiacriticCodePoint( char.codePointAt( 0 ) ) ;

// Some doc found here: https://en.wikipedia.org/wiki/Combining_character
// Diacritics and other characters that combines with previous one (zero-width)
unicode.isZeroWidthDiacriticCodePoint = code =>
	// Combining Diacritical Marks
	( 0x300 <= code && code <= 0x36f ) ||
	// Combining Diacritical Marks Extended
	( 0x1ab0 <= code && code <= 0x1aff ) ||
	// Combining Diacritical Marks Supplement
	( 0x1dc0 <= code && code <= 0x1dff ) ||
	// Combining Diacritical Marks for Symbols
	( 0x20d0 <= code && code <= 0x20ff ) ||
	// Combining Half Marks
	( 0xfe20 <= code && code <= 0xfe2f ) ||
	// Dakuten and handakuten (japanese)
	code === 0x3099 || code === 0x309a ||
	// Devanagari
	( 0x900 <= code && code <= 0x903 ) ||
	( 0x93a <= code && code <= 0x957 && code !== 0x93d && code !== 0x950 ) ||
	code === 0x962 || code === 0x963 ||
	// Thai
	code === 0xe31 ||
	( 0xe34 <= code && code <= 0xe3a ) ||
	( 0xe47 <= code && code <= 0xe4e ) ;

// Check if a character is an emoji or not
unicode.isEmoji = char => unicode.isEmojiCodePoint( char.codePointAt( 0 ) ) ;

// Some doc found here: https://stackoverflow.com/questions/30470079/emoji-value-range
unicode.isEmojiCodePoint = code =>
	// Miscellaneous symbols
	( 0x2600 <= code && code <= 0x26ff ) ||
	// Dingbats
	( 0x2700 <= code && code <= 0x27bf ) ||
	// Emoji
	( 0x1f000 <= code && code <= 0x1f1ff ) ||
	( 0x1f300 <= code && code <= 0x1f3fa ) ||
	( 0x1f400 <= code && code <= 0x1faff ) ;

// Emoji modifier
unicode.isEmojiModifier = char => unicode.isEmojiModifierCodePoint( char.codePointAt( 0 ) ) ;
unicode.isEmojiModifierCodePoint = code =>
	( 0x1f3fb <= code && code <= 0x1f3ff ) ||	// (Fitzpatrick): https://en.wikipedia.org/wiki/Miscellaneous_Symbols_and_Pictographs#Emoji_modifiers
	code === 0xfe0f ;	// VARIATION SELECTOR-16 [VS16] {emoji variation selector}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/format.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	String formater, inspired by C's sprintf().
*/







const inspect = require( './inspect.js' ).inspect ;
const inspectError = require( './inspect.js' ).inspectError ;
const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;
const unicode = require( './unicode.js' ) ;
const naturalSort = require( './naturalSort.js' ) ;
const StringNumber = require( './StringNumber.js' ) ;



/*
	%%		a single %
	%s		string
	%S		string, interpret ^ formatting
	%r		raw string: without sanitizer
	%n		natural: output the most natural representation for this type, object entries are sorted by keys
	%N		even more natural: avoid type hinting marks like bracket for array
	%f		float
	%k		number with metric system prefixes
	%e		for exponential notation (e.g. 1.23e+2)
	%K		for scientific notation (e.g. 1.23 × 10²)
	%i	%d	integer
	%u		unsigned integer
	%U		unsigned positive integer (>0)
	%P		number to (absolute) percent (e.g.: 0.75 -> 75%)
	%p		number to relative percent (e.g.: 1.25 -> +25% ; 0.75 -> -25%)
	%t		time duration, convert ms into h min s, e.g.: 2h14min52s or 2:14:52
	%m		convert degree into degree, minutes and seconds
	%h		hexadecimal (input is a number)
	%x		hexadecimal (input is a number), force pair of symbols (e.g. 'f' -> '0f')
	%o		octal
	%b		binary
	%X		hexadecimal: convert a string into hex charcode, force pair of symbols (e.g. 'f' -> '0f')
	%z		base64
	%Z		base64url
	%I		call string-kit's inspect()
	%Y		call string-kit's inspect(), but do not inspect non-enumerable
	%O		object (like inspect, but with ultra minimal options)
	%E		call string-kit's inspectError()
	%J		JSON.stringify()
	%D		drop
	%F		filter function existing in the 'this' context, e.g. %[filter:%a%a]F
	%a		argument for a function

	Candidate format:
	%A		for automatic type? probably not good: it's like %n Natural
	%c		for char? (can receive a string or an integer translated into an UTF8 chars)
	%C		for currency formating?
	%B		for Buffer objects?
*/

exports.formatMethod = function( ... args ) {
	var arg ,
		str = args[ 0 ] ,
		autoIndex = 1 ,
		length = args.length ;

	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var runtime = {
		hasMarkup: false ,
		shift: null ,
		markupStack: []
	} ;

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ) + str ;
	}

	//console.log( 'format args:' , arguments ) ;

	// /!\ each changes here should be reported on string.format.count() and string.format.hasFormatting() too /!\
	// Note: the closing bracket is optional to prevent ReDoS
	str = str.replace( /\^\[([^\]]*)]?|\^(.)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/g ,
		( match , complexMarkup , markup , doublePercent , relative , index , modeArg , mode ) => {
			var replacement , i , tmp , fn , fnArgString , argMatches , argList = [] ;

			//console.log( 'replaceArgs:' , arguments ) ;
			if ( doublePercent ) { return '%' ; }

			if ( complexMarkup ) { markup = complexMarkup ; }
			if ( markup ) {
				if ( this.noMarkup ) { return '^' + markup ; }
				return markupReplace.call( this , runtime , match , markup ) ;
			}

			if ( index ) {
				index = parseInt( index , 10 ) ;

				if ( relative ) {
					if ( relative === '+' ) { index = autoIndex + index ; }
					else if ( relative === '-' ) { index = autoIndex - index ; }
				}
			}
			else {
				index = autoIndex ;
			}

			autoIndex ++ ;

			if ( index >= length || index < 1 ) { arg = undefined ; }
			else { arg = args[ index ] ; }

			if ( modes[ mode ] ) {
				replacement = modes[ mode ]( arg , modeArg , this ) ;
				if ( this.argumentSanitizer && ! modes[ mode ].noSanitize ) { replacement = this.argumentSanitizer( replacement ) ; }
				if ( this.escapeMarkup && ! modes[ mode ].noEscapeMarkup ) { replacement = exports.escapeMarkup( replacement ) ; }
				if ( modeArg && ! modes[ mode ].noCommonModeArg ) { replacement = commonModeArg( replacement , modeArg ) ; }
				return replacement ;
			}

			// Function mode
			if ( mode === 'F' ) {
				autoIndex -- ;	// %F does not eat any arg

				if ( modeArg === undefined ) { return '' ; }
				tmp = modeArg.split( ':' ) ;
				fn = tmp[ 0 ] ;
				fnArgString = tmp[ 1 ] ;
				if ( ! fn ) { return '' ; }

				if ( fnArgString && ( argMatches = fnArgString.match( /%([+-]?)([0-9]*)[a-zA-Z]/g ) ) ) {
					//console.log( argMatches ) ;
					//console.log( fnArgString ) ;
					for ( i = 0 ; i < argMatches.length ; i ++ ) {
						relative = argMatches[ i ][ 1 ] ;
						index = argMatches[ i ][ 2 ] ;

						if ( index ) {
							index = parseInt( index , 10 ) ;

							if ( relative ) {
								if ( relative === '+' ) { index = autoIndex + index ; }		// jshint ignore:line
								else if ( relative === '-' ) { index = autoIndex - index ; }	// jshint ignore:line
							}
						}
						else {
							index = autoIndex ;
						}

						autoIndex ++ ;

						if ( index >= length || index < 1 ) { argList[ i ] = undefined ; }
						else { argList[ i ] = args[ index ] ; }
					}
				}

				if ( ! this || ! this.fn || typeof this.fn[ fn ] !== 'function' ) { return '' ; }
				return this.fn[ fn ].apply( this , argList ) ;
			}

			return '' ;
		}
	) ;

	if ( runtime.hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ;
	}

	if ( this.extraArguments ) {
		for ( ; autoIndex < length ; autoIndex ++ ) {
			arg = args[ autoIndex ] ;
			if ( arg === null || arg === undefined ) { continue ; }
			else if ( typeof arg === 'string' ) { str += arg ; }
			else if ( typeof arg === 'number' ) { str += arg ; }
			else if ( typeof arg.toString === 'function' ) { str += arg.toString() ; }
		}
	}

	return str ;
} ;



exports.markupMethod = function( str ) {
	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var runtime = {
		hasMarkup: false ,
		shift: null ,
		markupStack: []
	} ;

	if ( this.parse ) {
		let markupObjects , markupObject , match , complexMarkup , markup , raw , lastChunk ,
			output = [] ;

		// Note: the closing bracket is optional to prevent ReDoS
		for ( [ match , complexMarkup , markup , raw ] of str.matchAll( /\^\[([^\]]*)]?|\^(.)|([^^]+)/g ) ) {
			if ( raw ) {
				if ( output.length ) { output[ output.length - 1 ].text += raw ; }
				else { output.push( { text: raw } ) ; }
				continue ;
			}

			if ( complexMarkup ) { markup = complexMarkup ; }
			markupObjects = markupReplace.call( this , runtime , match , markup ) ;

			if ( ! Array.isArray( markupObjects ) ) { markupObjects = [ markupObjects ] ; }

			for ( markupObject of markupObjects ) {
				lastChunk = output.length ? output[ output.length - 1 ] : null ;
				if ( typeof markupObject === 'string' ) {
					// This markup is actually a text to add to the last chunk (e.g. "^^" markup is converted to a single "^")
					if ( lastChunk ) { lastChunk.text += markupObject ; }
					else { output.push( { text: markupObject } ) ; }
				}
				else if ( ! markupObject ) {
					// Null is for a markup's style reset
					if ( lastChunk && lastChunk.text.length && Object.keys( lastChunk ).length > 1 ) {
						// If there was style and text on the last chunk, then this means that the new markup starts a new chunk
						// markupObject can be null for markup reset function, but we have to create a new chunk
						output.push( { text: '' } ) ;
					}
				}
				else {
					if ( lastChunk && lastChunk.text.length ) {
						// If there was text on the last chunk, then this means that the new markup starts a new chunk
						output.push( Object.assign( { text: '' } , ... runtime.markupStack ) ) ;
					}
					else {
						// There wasn't any text added, so append the current markup style to the current chunk
						if ( lastChunk ) { Object.assign( lastChunk , markupObject ) ; }
						else { output.push( Object.assign( { text: '' } , markupObject ) ) ; }
					}
				}
			}
		}

		return output ;
	}

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ) + str ;
	}

	str = str.replace( /\^\[([^\]]*)]?|\^(.)/g , ( match , complexMarkup , markup ) => markupReplace.call( this , runtime , match , complexMarkup || markup ) ) ;

	if ( runtime.hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ;
	}

	return str ;
} ;



// Used by both formatMethod and markupMethod
function markupReplace( runtime , match , markup ) {
	var markupTarget , key , value , replacement , colonIndex ;

	if ( markup === '^' ) { return '^' ; }

	if ( this.shiftMarkup && this.shiftMarkup[ markup ] ) {
		runtime.shift = this.shiftMarkup[ markup ] ;
		return '' ;
	}

	if ( markup.length > 1 && this.dataMarkup && ( colonIndex = markup.indexOf( ':' ) ) !== -1 ) {
		key = markup.slice( 0 , colonIndex ) ;
		markupTarget = this.dataMarkup[ key ] ;

		if ( markupTarget === undefined ) {
			if ( this.markupCatchAll === undefined ) { return '' ; }
			markupTarget = this.markupCatchAll ;
		}

		runtime.hasMarkup = true ;
		value = markup.slice( colonIndex + 1 ) ;

		if ( typeof markupTarget === 'function' ) {
			replacement = markupTarget( runtime.markupStack , key , value ) ;
			// method should manage markup stack themselves
		}
		else {
			replacement = { [ markupTarget ]: value } ;
			stackMarkup( runtime , replacement ) ;
		}

		return replacement ;
	}

	if ( runtime.shift ) {
		markupTarget = this.shiftedMarkup?.[ runtime.shift ]?.[ markup ] ;
		runtime.shift = null ;
	}
	else {
		markupTarget = this.markup?.[ markup ] ;
	}

	if ( markupTarget === undefined ) {
		if ( this.markupCatchAll === undefined ) { return '' ; }
		markupTarget = this.markupCatchAll ;
	}

	runtime.hasMarkup = true ;

	if ( typeof markupTarget === 'function' ) {
		replacement = markupTarget( runtime.markupStack , markup ) ;
		// method should manage markup stack themselves
	}
	else {
		replacement = markupTarget ;
		stackMarkup( runtime , replacement ) ;
	}

	return replacement ;
}



// internal method for markupReplace()
function stackMarkup( runtime , replacement ) {
	if ( Array.isArray( replacement ) ) {
		for ( let item of replacement ) {
			if ( item === null ) { runtime.markupStack.length = 0 ; }
			else { runtime.markupStack.push( item ) ; }
		}
	}
	else {
		if ( replacement === null ) { runtime.markupStack.length = 0 ; }
		else { runtime.markupStack.push( replacement ) ; }
	}
}



// Note: the closing bracket is optional to prevent ReDoS
exports.stripMarkup = str => str.replace( /\^\[[^\]]*]?|\^./g , match =>
	match === '^^' ? '^' :
	match === '^ ' ? ' ' :
	''
) ;

exports.escapeMarkup = str => str.replace( /\^/g , '^^' ) ;



const DEFAULT_FORMATTER = {
	argumentSanitizer: str => escape.control( str , true ) ,
	extraArguments: true ,
	color: false ,
	noMarkup: false ,
	escapeMarkup: false ,
	endingMarkupReset: true ,
	startingMarkupReset: false ,
	markupReset: ansi.reset ,
	shiftMarkup: {
		'#': 'background'
	} ,
	markup: {
		":": ansi.reset ,
		" ": ansi.reset + " " ,

		"-": ansi.dim ,
		"+": ansi.bold ,
		"_": ansi.underline ,
		"/": ansi.italic ,
		"!": ansi.inverse ,

		"b": ansi.blue ,
		"B": ansi.brightBlue ,
		"c": ansi.cyan ,
		"C": ansi.brightCyan ,
		"g": ansi.green ,
		"G": ansi.brightGreen ,
		"k": ansi.black ,
		"K": ansi.brightBlack ,
		"m": ansi.magenta ,
		"M": ansi.brightMagenta ,
		"r": ansi.red ,
		"R": ansi.brightRed ,
		"w": ansi.white ,
		"W": ansi.brightWhite ,
		"y": ansi.yellow ,
		"Y": ansi.brightYellow
	} ,
	shiftedMarkup: {
		background: {
			":": ansi.reset ,
			" ": ansi.reset + " " ,

			"b": ansi.bgBlue ,
			"B": ansi.bgBrightBlue ,
			"c": ansi.bgCyan ,
			"C": ansi.bgBrightCyan ,
			"g": ansi.bgGreen ,
			"G": ansi.bgBrightGreen ,
			"k": ansi.bgBlack ,
			"K": ansi.bgBrightBlack ,
			"m": ansi.bgMagenta ,
			"M": ansi.bgBrightMagenta ,
			"r": ansi.bgRed ,
			"R": ansi.bgBrightRed ,
			"w": ansi.bgWhite ,
			"W": ansi.bgBrightWhite ,
			"y": ansi.bgYellow ,
			"Y": ansi.bgBrightYellow
		}
	} ,
	dataMarkup: {
		fg: ( markupStack , key , value ) => {
			var str = ansi.fgColor[ value ] || ansi.trueColor( value ) ;
			markupStack.push( str ) ;
			return str ;
		} ,
		bg: ( markupStack , key , value ) => {
			var str = ansi.bgColor[ value ] || ansi.bgTrueColor( value ) ;
			markupStack.push( str ) ;
			return str ;
		}
	} ,
	markupCatchAll: ( markupStack , key , value ) => {
		var str = '' ;

		if ( value === undefined ) {
			if ( key[ 0 ] === '#' ) {
				str = ansi.trueColor( key ) ;
			}
			else if ( typeof ansi[ key ] === 'string' ) {
				str = ansi[ key ] ;
			}
		}

		markupStack.push( str ) ;
		return str ;
	}
} ;

// Aliases
DEFAULT_FORMATTER.dataMarkup.color = DEFAULT_FORMATTER.dataMarkup.c = DEFAULT_FORMATTER.dataMarkup.fgColor = DEFAULT_FORMATTER.dataMarkup.fg ;
DEFAULT_FORMATTER.dataMarkup.bgColor = DEFAULT_FORMATTER.dataMarkup.bg ;



exports.createFormatter = ( options ) => exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , options ) ) ;
exports.format = exports.formatMethod.bind( DEFAULT_FORMATTER ) ;
exports.format.default = DEFAULT_FORMATTER ;

exports.formatNoMarkup = exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , { noMarkup: true } ) ) ;
// For passing string to Terminal-Kit, it will interpret markup on its own
exports.formatThirdPartyMarkup = exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , { noMarkup: true , escapeMarkup: true } ) ) ;

exports.createMarkup = ( options ) => exports.markupMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , options ) ) ;
exports.markup = exports.markupMethod.bind( DEFAULT_FORMATTER ) ;



// Count the number of parameters needed for this string
exports.format.count = function( str , noMarkup = false ) {
	var markup , index , relative , autoIndex = 1 , maxIndex = 0 ;

	if ( typeof str !== 'string' ) { return 0 ; }

	// This regex differs slightly from the main regex: we do not count '%%' and %F is excluded
	// Note: the closing bracket is optional to prevent ReDoS
	var regexp = noMarkup ?
		/%([+-]?)([0-9]*)(?:\[[^\]]*\])?[a-zA-EG-Z]/g :
		/%([+-]?)([0-9]*)(?:\[[^\]]*\])?[a-zA-EG-Z]|(\^\[[^\]]*]?|\^.)/g ;

	for ( [ , relative , index , markup ] of str.matchAll( regexp ) ) {
		if ( markup ) { continue ; }

		if ( index ) {
			index = parseInt( index , 10 ) ;

			if ( relative ) {
				if ( relative === '+' ) { index = autoIndex + index ; }
				else if ( relative === '-' ) { index = autoIndex - index ; }
			}
		}
		else {
			index = autoIndex ;
		}

		autoIndex ++ ;

		if ( maxIndex < index ) { maxIndex = index ; }
	}

	return maxIndex ;
} ;



// Tell if this string contains formatter chars
exports.format.hasFormatting = function( str ) {
	if ( str.search( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/ ) !== -1 ) { return true ; }
	return false ;
} ;



// --- Format MODES ---

const modes = {} ;
exports.format.modes = modes ;	// <-- expose modes, used by Babel-Tower for String Kit interop'



// string
modes.s = arg => {
	if ( typeof arg === 'string' ) { return arg ; }
	if ( arg === null || arg === undefined || arg === true || arg === false ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }
	return '(' + arg + ')' ;
} ;

modes.r = arg => modes.s( arg ) ;
modes.r.noSanitize = true ;



// string, interpret ^ formatting
modes.S = ( arg , modeArg , options ) => {
	// We do the sanitizing part on our own
	var interpret = options.escapeMarkup ? str => ( options.argumentSanitizer ? options.argumentSanitizer( str ) : str ) :
		str => exports.markupMethod.call( options , options.argumentSanitizer ? options.argumentSanitizer( str ) : str ) ;

	if ( typeof arg === 'string' ) { return interpret( arg ) ; }
	if ( arg === null || arg === undefined || arg === true || arg === false ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return interpret( arg.toString() ) ; }
	return interpret( '(' + arg + ')' ) ;
} ;

modes.S.noSanitize = true ;
modes.S.noEscapeMarkup = true ;
modes.S.noCommonModeArg = true ;



// natural (WIP)
modes.N = ( arg , isSubCall ) => {
	if ( typeof arg === 'string' ) { return arg ; }

	if ( arg === null || arg === undefined || arg === true || arg === false ) {
		return '' + arg ;
	}

	if ( typeof arg === 'number' ) {
		return modes.f( arg , '.3g ' ) ;
	}

	if ( Array.isArray( arg ) ) {
		arg = arg.map( e => modes.N( e , true ) ) ;

		if ( isSubCall ) {
			return '[' + arg.join( ',' ) + ']' ;
		}

		return arg.join( ', ' ) ;
	}

	if ( Buffer.isBuffer( arg ) ) {
		arg = [ ... arg ].map( e => {
			e = e.toString( 16 ) ;
			if ( e.length === 1 ) { e = '0' + e ; }
			return e ;
		} ) ;
		return '<' + arg.join( ' ' ) + '>' ;
	}

	var proto = Object.getPrototypeOf( arg ) ;

	if ( proto === null || proto === Object.prototype ) {
		// Plain objects
		arg = Object.entries( arg ).sort( naturalSort )
			.map( e => e[ 0 ] + ': ' + modes.N( e[ 1 ] , true ) ) ;

		if ( isSubCall ) {
			return '{' + arg.join( ', ' ) + '}' ;
		}

		return arg.join( ', ' ) ;
	}

	if ( typeof arg.inspect === 'function' ) { return arg.inspect() ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }

	return '(' + arg + ')' ;
} ;

modes.n = arg => modes.N( arg , true ) ;



// float
modes.f = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.f.noSanitize = true ;



// absolute percent
modes.P = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	arg *= 100 ;

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	// Force rounding to zero by default
	if ( subModes.rounding !== null || ! subModes.precision ) { sn.round( subModes.rounding || 0 ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toNoExpString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) + '%' ;
} ;

modes.P.noSanitize = true ;



// relative percent
modes.p = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	arg = ( arg - 1 ) * 100 ;

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	// Force rounding to zero by default
	if ( subModes.rounding !== null || ! subModes.precision ) { sn.round( subModes.rounding || 0 ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	// 4th argument force a '+' sign
	return sn.toNoExpString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal , true ) + '%' ;
} ;

modes.p.noSanitize = true ;



// metric system
modes.k = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '0' ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	// Default to 3 numbers precision
	if ( subModes.precision || subModes.rounding === null ) { sn.precision( subModes.precision || 3 ) ; }

	return sn.toMetricString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.k.noSanitize = true ;



// exponential notation, a.k.a. "E notation" (e.g. 1.23e+2)
modes.e = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toExponential() ;
} ;

modes.e.noSanitize = true ;



// scientific notation (e.g. 1.23 × 10²)
modes.K = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , '.' , subModes.groupSeparator ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toScientific() ;
} ;

modes.K.noSanitize = true ;



// integer
modes.d = modes.i = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.floor( arg ) ; }
	return '0' ;
} ;

modes.i.noSanitize = true ;



// unsigned integer
modes.u = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ) ; }
	return '0' ;
} ;

modes.u.noSanitize = true ;



// unsigned positive integer
modes.U = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 1 ) ; }
	return '1' ;
} ;

modes.U.noSanitize = true ;



// /!\ Should use StringNumber???
// Degree, minutes and seconds.
// Unlike %t which receive ms, here the input is in degree.
modes.m = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var minus = '' ;
	if ( arg < 0 ) { minus = '-' ; arg = -arg ; }

	var degrees = epsilonFloor( arg ) ,
		frac = arg - degrees ;

	if ( ! frac ) { return minus + degrees + '°' ; }

	var minutes = epsilonFloor( frac * 60 ) ,
		seconds = epsilonFloor( frac * 3600 - minutes * 60 ) ;

	if ( seconds ) {
		return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' + ( '' + seconds ).padStart( 2 , '0' ) + '″' ;
	}

	return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' ;

} ;

modes.m.noSanitize = true ;



// time duration, transform ms into H:min:s
// Later it should format Date as well: number=duration, date object=date
// Note that it would not replace moment.js, but it could uses it.
modes.t = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var h , min , s , sn , sStr ,
		sign = '' ,
		subModes = timeModeArg( modeArg ) ,
		roundingType = subModes.roundingType ,
		hSeparator = subModes.useAbbreviation ? 'h' : ':' ,
		minSeparator = subModes.useAbbreviation ? 'min' : ':' ,
		sSeparator = subModes.useAbbreviation ? 's' : '.' ,
		forceDecimalSeparator = subModes.useAbbreviation ;

	s = arg / 1000 ;

	if ( s < 0 ) {
		s = -s ;
		roundingType *= -1 ;
		sign = '-' ;
	}

	if ( s < 60 && ! subModes.forceMinutes ) {
		sn = new StringNumber( s , sSeparator , undefined , forceDecimalSeparator ) ;
		sn.round( subModes.rounding , roundingType ) ;

		// Check if rounding has made it reach 60
		if ( sn.toNumber() < 60 ) {
			sStr = sn.toString( 1 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
			return sign + sStr ;
		}

		s = 60 ;

	}

	min = Math.floor( s / 60 ) ;
	s = s % 60 ;

	sn = new StringNumber( s , sSeparator , undefined , forceDecimalSeparator ) ;
	sn.round( subModes.rounding , roundingType ) ;

	// Check if rounding has made it reach 60
	if ( sn.toNumber() < 60 ) {
		sStr = sn.toString( 2 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
	}
	else {
		min ++ ;
		s = 0 ;
		sn.set( s ) ;
		sStr = sn.toString( 2 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
	}

	if ( min < 60 && ! subModes.forceHours ) {
		return sign + min + minSeparator + sStr ;
	}

	h = Math.floor( min / 60 ) ;
	min = min % 60 ;

	return sign + h + hSeparator + ( '' + min ).padStart( 2 , '0' ) + minSeparator + sStr ;
} ;

modes.t.noSanitize = true ;



// unsigned hexadecimal
modes.h = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ; }
	return '0' ;
} ;

modes.h.noSanitize = true ;



// unsigned hexadecimal, force pair of symboles
modes.x = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '00' ; }

	var value = '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ;

	if ( value.length % 2 ) { value = '0' + value ; }
	return value ;
} ;

modes.x.noSanitize = true ;



// unsigned octal
modes.o = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 8 ) ; }
	return '0' ;
} ;

modes.o.noSanitize = true ;



// unsigned binary
modes.b = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 2 ) ; }
	return '0' ;
} ;

modes.b.noSanitize = true ;



// String to hexadecimal, force pair of symboles
modes.X = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'hex' ) ;
} ;

modes.X.noSanitize = true ;



// base64
modes.z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ) ;
} ;



// base64url
modes.Z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ).replace( /\+/g , '-' )
		.replace( /\//g , '_' )
		.replace( /[=]{1,2}$/g , '' ) ;
} ;



// Inspect
const I_OPTIONS = {} ;
modes.I = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , I_OPTIONS ) ;
modes.I.noSanitize = true ;



// More minimalist inspect
const Y_OPTIONS = {
	noFunc: true ,
	enumOnly: true ,
	noDescriptor: true ,
	useInspect: true ,
	useInspectPropertyBlackList: true
} ;
modes.Y = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , Y_OPTIONS ) ;
modes.Y.noSanitize = true ;



// Even more minimalist inspect
const O_OPTIONS = { minimal: true , bulletIndex: true , noMarkup: true } ;
modes.O = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , O_OPTIONS ) ;
modes.O.noSanitize = true ;



// Inspect error
const E_OPTIONS = {} ;
modes.E = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , E_OPTIONS , true ) ;
modes.E.noSanitize = true ;



// JSON
modes.J = arg => arg === undefined ? 'null' : JSON.stringify( arg ) ;



// drop
modes.D = () => '' ;
modes.D.noSanitize = true ;



// ModeArg formats

// The format for commonModeArg
const COMMON_MODE_ARG_FORMAT_REGEX = /([a-zA-Z])(.[^a-zA-Z]*)/g ;

// The format for specific mode arg
const MODE_ARG_FORMAT_REGEX = /([a-zA-Z]|^)([^a-zA-Z]*)/g ;



// Called when there is a modeArg and the mode allow common mode arg
// CONVENTION: reserve upper-cased letters for common mode arg
function commonModeArg( str , modeArg ) {
	for ( let [ , k , v ] of modeArg.matchAll( COMMON_MODE_ARG_FORMAT_REGEX ) ) {
		if ( k === 'L' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = ' '.repeat( v - width ) + str ; }
		}
		else if ( k === 'R' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = str + ' '.repeat( v - width ) ; }
		}
	}

	return str ;
}



const FLOAT_MODES = {
	leftPadding: 1 ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	rounding: null ,
	precision: null ,
	groupSeparator: ''
} ;

// Generic number modes
function floatModeArg( modeArg ) {
	FLOAT_MODES.leftPadding = 1 ;
	FLOAT_MODES.rightPadding = 0 ;
	FLOAT_MODES.rightPaddingOnlyIfDecimal = false ;
	FLOAT_MODES.rounding = null ;
	FLOAT_MODES.precision = null ;
	FLOAT_MODES.groupSeparator = '' ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'z' ) {
				// Zero-left padding
				FLOAT_MODES.leftPadding = + v ;
			}
			else if ( k === 'g' ) {
				// Group separator
				FLOAT_MODES.groupSeparator = v || ' ' ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						FLOAT_MODES.rounding = FLOAT_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						FLOAT_MODES.rounding = FLOAT_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						FLOAT_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						FLOAT_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
				else if ( v[ v.length - 1 ] === '.' ) {
					// Rounding before the decimal
					FLOAT_MODES.rounding = -parseInt( v.slice( 0 , -1 ) , 10 ) || 0 ;
				}
				else {
					// Precision, but only if integer
					FLOAT_MODES.precision = parseInt( v , 10 ) || null ;
				}
			}
		}
	}

	return FLOAT_MODES ;
}



const TIME_MODES = {
	useAbbreviation: false ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	rounding: 0 ,
	roundingType: -1 ,	// -1: floor, 0: round, 1: ceil
	forceHours: false ,
	forceMinutes: false
} ;

// Generic number modes
function timeModeArg( modeArg ) {
	TIME_MODES.rightPadding = 0 ;
	TIME_MODES.rightPaddingOnlyIfDecimal = false ;
	TIME_MODES.rounding = 0 ;
	TIME_MODES.roundingType = -1 ;
	TIME_MODES.useAbbreviation = TIME_MODES.forceHours = TIME_MODES.forceMinutes = false ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'h' ) {
				TIME_MODES.forceHours = TIME_MODES.forceMinutes = true ;
			}
			else if ( k === 'm' ) {
				TIME_MODES.forceMinutes = true ;
			}
			else if ( k === 'r' ) {
				TIME_MODES.roundingType = 0 ;
			}
			else if ( k === 'f' ) {
				TIME_MODES.roundingType = -1 ;
			}
			else if ( k === 'c' ) {
				TIME_MODES.roundingType = 1 ;
			}
			else if ( k === 'a' ) {
				TIME_MODES.useAbbreviation = true ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						TIME_MODES.rounding = TIME_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						TIME_MODES.rounding = TIME_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						TIME_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						TIME_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
			}
		}
	}

	return TIME_MODES ;
}



// Generic inspect
function genericInspectMode( arg , modeArg , options , modeOptions , isInspectError = false ) {
	var outputMaxLength ,
		maxLength ,
		depth = 3 ,
		style = options && options.color ? 'color' : 'none' ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'c' ) {
				if ( v === '+' ) { style = 'color' ; }
				else if ( v === '-' ) { style = 'none' ; }
			}
			else if ( k === 'i' ) {
				style = 'inline' ;
			}
			else if ( k === 'l' ) {
				// total output max length
				outputMaxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( k === 's' ) {
				// string max length
				maxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( ! k ) {
				depth = parseInt( v , 10 ) || 1 ;
			}
		}
	}

	if ( isInspectError ) {
		return inspectError( Object.assign( {
			depth , style , outputMaxLength , maxLength
		} , modeOptions ) , arg ) ;
	}

	return inspect( Object.assign( {
		depth , style , outputMaxLength , maxLength
	} , modeOptions ) , arg ) ;
}



// From math-kit module
// /!\ Should be updated with the new way the math-kit module do it!!! /!\
const EPSILON = 0.0000000001 ;
const INVERSE_EPSILON = Math.round( 1 / EPSILON ) ;

function epsilonRound( v ) {
	return Math.round( v * INVERSE_EPSILON ) / INVERSE_EPSILON ;
}

function epsilonFloor( v ) {
	return Math.floor( v + EPSILON ) ;
}

// Round with precision
function round( v , step ) {
	// use: v * ( 1 / step )
	// not: v / step
	// reason: epsilon rounding errors
	return epsilonRound( step * Math.round( v * ( 1 / step ) ) ) ;
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/misc.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





exports.resize = function( str , length ) {
	if ( str.length === length ) {
		return str ;
	}
	else if ( str.length > length ) {
		return str.slice( 0 , length ) ;
	}

	return str + ' '.repeat( length - str.length ) ;

} ;



exports.occurrenceCount = function( str , subStr , overlap = false ) {
	if ( ! str || ! subStr ) { return 0 ; }

	var count = 0 , index = 0 ,
		inc = overlap ? 1 : subStr.length ;

	while ( ( index = str.indexOf( subStr , index ) ) !== -1 ) {
		count ++ ;
		index += inc ;
	}

	return count ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/inspect.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

/*
	Variable inspector.
*/





const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;

const EMPTY = {} ;
const TRIVIAL_CONSTRUCTOR = new Set( [ Object , Array ] ) ;



/*
	Inspect a variable, return a string ready to be displayed with console.log(), or even as an HTML output.

	Options:
		* style:
			* 'none': (default) normal output suitable for console.log() or writing in a file
			* 'inline': like 'none', but without newlines
			* 'color': colorful output suitable for terminal
			* 'html': html output
			* any object: full controle, inheriting from 'none'
		* tab: `string` override the tab of the style
		* depth: depth limit, default: 3
		* maxLength: length limit for strings, default: 250
		* outputMaxLength: length limit for the inspect output string, default: 5000
		* noFunc: do not display functions
		* noDescriptor: do not display descriptor information
		* noArrayProperty: do not display array properties
		* noIndex: do not display array indexes
		* bulletIndex: do not display array indexes, instead display a bullet: *
		* noType: do not display type and constructor
		* noTypeButConstructor: do not display type, display non-trivial constructor (not Object or Array, but all others)
		* enumOnly: only display enumerable properties
		* funcDetails: display function's details
		* proto: display object's prototype
		* sort: sort the keys
		* noMarkup: don't add Javascript/JSON markup: {}[],"
		* minimal: imply noFunc: true, noDescriptor: true, noType: true, noArrayProperty: true, enumOnly: true, proto: false and funcDetails: false.
		  Display a minimal JSON-like output
		* minimalPlusConstructor: like minimal, but output non-trivial constructor
		* protoBlackList: `Set` of blacklisted object prototype (will not recurse inside it)
		* propertyBlackList: `Set` of blacklisted property names (will not even display it)
		* useInspect: use .inspect() method when available on an object (default to false)
		* useInspectPropertyBlackList: if set and if the object to be inspected has an 'inspectPropertyBlackList' property which value is a `Set`,
		  use it like the 'propertyBlackList' option
*/

function inspect( options , variable ) {
	if ( arguments.length < 2 ) { variable = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	var runtime = { depth: 0 , ancestors: [] } ;

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }
	// Too slow:
	//else { options.style = Object.assign( {} , inspectStyle.none , options.style ) ; }

	if ( options.depth === undefined ) { options.depth = 3 ; }
	if ( options.maxLength === undefined ) { options.maxLength = 250 ; }
	if ( options.outputMaxLength === undefined ) { options.outputMaxLength = 5000 ; }

	// /!\ nofunc is deprecated
	if ( options.nofunc ) { options.noFunc = true ; }

	if ( options.minimal ) {
		options.noFunc = true ;
		options.noDescriptor = true ;
		options.noType = true ;
		options.noArrayProperty = true ;
		options.enumOnly = true ;
		options.proto = false ;
		options.funcDetails = false ;
	}

	if ( options.minimalPlusConstructor ) {
		options.noFunc = true ;
		options.noDescriptor = true ;
		options.noTypeButConstructor = true ;
		options.noArrayProperty = true ;
		options.enumOnly = true ;
		options.proto = false ;
		options.funcDetails = false ;
	}

	var str = inspect_( runtime , options , variable ) ;

	if ( str.length > options.outputMaxLength ) {
		str = options.style.truncate( str , options.outputMaxLength ) ;
	}

	return str ;
}

exports.inspect = inspect ;



function inspect_( runtime , options , variable ) {
	var i , funcName , length , proto , propertyList , isTrivialConstructor , constructor , keyIsProperty ,
		type , pre , isArray , isFunc , specialObject ,
		str = '' , key = '' , descriptorStr = '' , indent = '' ,
		descriptor , nextAncestors ;

	// Prepare things (indentation, key, descriptor, ... )

	type = typeof variable ;

	if ( runtime.depth ) {
		indent = ( options.tab ?? options.style.tab ).repeat( options.noMarkup ? runtime.depth - 1 : runtime.depth ) ;
	}

	if ( type === 'function' && options.noFunc ) { return '' ; }

	if ( runtime.key !== undefined ) {
		if ( runtime.descriptor ) {
			descriptorStr = [] ;

			if ( runtime.descriptor.error ) {
				descriptorStr = '[' + runtime.descriptor.error + ']' ;
			}
			else {
				if ( ! runtime.descriptor.configurable ) { descriptorStr.push( '-conf' ) ; }
				if ( ! runtime.descriptor.enumerable ) { descriptorStr.push( '-enum' ) ; }

				// Already displayed by runtime.forceType
				//if ( runtime.descriptor.get || runtime.descriptor.set ) { descriptorStr.push( 'getter/setter' ) ; } else
				if ( ! runtime.descriptor.writable ) { descriptorStr.push( '-w' ) ; }

				//if ( descriptorStr.length ) { descriptorStr = '(' + descriptorStr.join( ' ' ) + ')' ; }
				if ( descriptorStr.length ) { descriptorStr = descriptorStr.join( ' ' ) ; }
				else { descriptorStr = '' ; }
			}
		}

		if ( runtime.keyIsProperty ) {
			if ( ! options.noMarkup && keyNeedingQuotes( runtime.key ) ) {
				key = '"' + options.style.key( runtime.key ) + '": ' ;
			}
			else {
				key = options.style.key( runtime.key ) + ': ' ;
			}
		}
		else if ( options.bulletIndex ) {
			key = ( typeof options.bulletIndex === 'string' ? options.bulletIndex : '*' ) + ' ' ;
		}
		else if ( ! options.noIndex ) {
			key = options.style.index( runtime.key ) ;
		}

		if ( descriptorStr ) { descriptorStr = ' ' + options.style.type( descriptorStr ) ; }
	}

	pre = runtime.noPre ? '' : indent + key ;


	// Describe the current variable

	if ( variable === undefined ) {
		str += pre + options.style.constant( 'undefined' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === EMPTY ) {
		str += pre + options.style.constant( '[empty]' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === null ) {
		str += pre + options.style.constant( 'null' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === false ) {
		str += pre + options.style.constant( 'false' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === true ) {
		str += pre + options.style.constant( 'true' ) + descriptorStr + options.style.newline ;
	}
	else if ( type === 'number' ) {
		str += pre + options.style.number( variable.toString() ) +
			( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'number' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'string' ) {
		if ( variable.length > options.maxLength ) {
			str += pre + ( options.noMarkup ? '' : '"' ) + options.style.string( escape.control( variable.slice( 0 , options.maxLength - 1 ) ) ) + '…' + ( options.noMarkup ? '' : '"' ) +
				( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ' - TRUNCATED)' ) ) +
				descriptorStr + options.style.newline ;
		}
		else {
			str += pre + ( options.noMarkup ? '' : '"' ) + options.style.string( escape.control( variable ) ) + ( options.noMarkup ? '' : '"' ) +
				( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ')' ) ) +
				descriptorStr + options.style.newline ;
		}
	}
	else if ( Buffer.isBuffer( variable ) ) {
		str += pre + options.style.inspect( variable.inspect() ) +
			( options.noType ? '' : ' ' + options.style.type( 'Buffer' ) + options.style.length( '(' + variable.length + ')' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'object' || type === 'function' ) {
		funcName = length = '' ;
		isFunc = false ;

		if ( type === 'function' ) {
			isFunc = true ;
			funcName = ' ' + options.style.funcName( ( variable.name ? variable.name : '(anonymous)' ) ) ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		isArray = false ;

		if ( Array.isArray( variable ) ) {
			isArray = true ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		if ( ! variable.constructor ) { constructor = '(no constructor)' ; }
		else if ( ! variable.constructor.name ) { constructor = '(anonymous)' ; }
		else { constructor = variable.constructor.name ; }

		isTrivialConstructor = ! variable.constructor || TRIVIAL_CONSTRUCTOR.has( variable.constructor ) ;

		constructor = options.style.constructorName( constructor ) ;
		proto = Object.getPrototypeOf( variable ) ;

		str += pre ;

		if ( ! options.noType && ( ! options.noTypeButConstructor || ! isTrivialConstructor ) ) {
			if ( runtime.forceType && ! options.noType && ! options.noTypeButConstructor ) {
				str += options.style.type( runtime.forceType ) ;
			}
			else if ( options.noTypeButConstructor ) {
				str += constructor ;
			}
			else {
				str += constructor + funcName + length + ' ' + options.style.type( type ) + descriptorStr ;
			}

			if ( ! isFunc || options.funcDetails ) { str += ' ' ; }	// if no funcDetails imply no space here
		}

		if ( isArray && options.noArrayProperty ) {
			propertyList = [ ... Array( variable.length ).keys() ] ;
		}
		else {
			propertyList = Object.getOwnPropertyNames( variable ) ;
		}

		if ( options.sort ) { propertyList.sort() ; }

		// Special Objects
		specialObject = specialObjectSubstitution( variable , runtime , options ) ;

		if ( options.protoBlackList && options.protoBlackList.has( proto ) ) {
			str += options.style.limit( '[skip]' ) + options.style.newline ;
		}
		else if ( specialObject !== undefined ) {
			if ( typeof specialObject === 'string' ) {
				str += '=> ' + specialObject + options.style.newline ;
			}
			else {
				str += '=> ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					specialObject
				) ;
			}
		}
		else if ( isFunc && ! options.funcDetails ) {
			str += options.style.newline ;
		}
		else if ( ! propertyList.length && ! options.proto ) {
			str += ( options.noMarkup ? '' : isArray ? '[]' : '{}' ) + options.style.newline ;
		}
		else if ( runtime.depth >= options.depth ) {
			str += options.style.limit( '[depth limit]' ) + options.style.newline ;
		}
		else if ( runtime.ancestors.indexOf( variable ) !== -1 ) {
			str += options.style.limit( '[circular]' ) + options.style.newline ;
		}
		else {
			/*
			str +=
				options.noMarkup ? ( isArray && options.noIndex && ! runtime.keyIsProperty ? '' : options.style.newline ) :
				( isArray ? '[' : '{' ) + options.style.newline ;
			//*/
			//*
			str += ( options.noMarkup ? '' : isArray ? '[' : '{'  ) + options.style.newline ;
			//*/

			// Do not use .concat() here, it doesn't works as expected with arrays...
			nextAncestors = runtime.ancestors.slice() ;
			nextAncestors.push( variable ) ;

			for ( i = 0 ; i < propertyList.length && str.length < options.outputMaxLength ; i ++ ) {
				if ( ! isArray && (
					( options.propertyBlackList && options.propertyBlackList.has( propertyList[ i ] ) )
					|| ( options.useInspectPropertyBlackList && ( variable.inspectPropertyBlackList instanceof Set ) && variable.inspectPropertyBlackList.has( propertyList[ i ] ) )
				) ) {
					//str += options.style.limit( '[skip]' ) + options.style.newline ;
					continue ;
				}

				if ( isArray && options.noArrayProperty && ! ( propertyList[ i ] in variable ) ) {
					// Hole in the array (sparse array, item deleted, ...)
					str += inspect_(
						{
							depth: runtime.depth + 1 ,
							ancestors: nextAncestors ,
							key: propertyList[ i ] ,
							keyIsProperty: false
						} ,
						options ,
						EMPTY
					) ;
				}
				else {
					try {
						descriptor = Object.getOwnPropertyDescriptor( variable , propertyList[ i ] ) ;
						// Note: descriptor can be undefined, this happens when the object is a Proxy with a bad implementation:
						// it reports that key (Object.keys()) but doesn't give the descriptor for it.

						if ( descriptor && ! descriptor.enumerable && options.enumOnly ) { continue ; }
						keyIsProperty = ! isArray || ! descriptor.enumerable || isNaN( propertyList[ i ] ) ;

						if ( ! options.noDescriptor && descriptor && ( descriptor.get || descriptor.set ) ) {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: descriptor ,
									forceType: 'getter/setter'
								} ,
								options ,
								{ get: descriptor.get , set: descriptor.set }
							) ;
						}
						else {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: options.noDescriptor ? undefined : descriptor || { error: "Bad Proxy Descriptor" }
								} ,
								options ,
								variable[ propertyList[ i ] ]
							) ;
						}
					}
					catch ( error ) {
						str += inspect_(
							{
								depth: runtime.depth + 1 ,
								ancestors: nextAncestors ,
								key: propertyList[ i ] ,
								keyIsProperty: keyIsProperty ,
								descriptor: options.noDescriptor ? undefined : descriptor
							} ,
							options ,
							error
						) ;
					}
				}

				if ( i < propertyList.length - 1 ) { str += options.style.comma ; }
			}

			if ( options.proto ) {
				str += inspect_(
					{
						depth: runtime.depth + 1 ,
						ancestors: nextAncestors ,
						key: '__proto__' ,
						keyIsProperty: true
					} ,
					options ,
					proto
				) ;
			}

			str += options.noMarkup ? '' : indent + ( isArray ? ']' : '}' ) + options.style.newline ;
		}
	}


	// Finalizing


	if ( runtime.depth === 0 ) {
		if ( options.style.trim ) { str = str.trim() ; }
		if ( options.style === 'html' ) { str = escape.html( str ) ; }
	}

	return str ;
}



function keyNeedingQuotes( key ) {
	if ( ! key.length ) { return true ; }
	return false ;
}



var promiseStates = [ 'pending' , 'fulfilled' , 'rejected' ] ;



// Some special object are better written down when substituted by something else
function specialObjectSubstitution( object , runtime , options ) {
	if ( typeof object.constructor !== 'function' ) {
		// Some objects have no constructor, e.g.: Object.create(null)
		//console.error( object ) ;
		return ;
	}

	if ( object instanceof String ) {
		return object.toString() ;
	}

	if ( object instanceof RegExp ) {
		return object.toString() ;
	}

	if ( object instanceof Date ) {
		return object.toString() + ' [' + object.getTime() + ']' ;
	}

	if ( typeof Set === 'function' && object instanceof Set ) {
		// This is an ES6 'Set' Object
		return Array.from( object ) ;
	}

	if ( typeof Map === 'function' && object instanceof Map ) {
		// This is an ES6 'Map' Object
		return Array.from( object ) ;
	}

	if ( object instanceof Promise ) {
		if ( process && process.binding && process.binding( 'util' ) && process.binding( 'util' ).getPromiseDetails ) {
			let details = process.binding( 'util' ).getPromiseDetails( object ) ;
			let state =  promiseStates[ details[ 0 ] ] ;
			let str = 'Promise <' + state + '>' ;

			if ( state === 'fulfilled' ) {
				str += ' ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					details[ 1 ]
				) ;
			}
			else if ( state === 'rejected' ) {
				if ( details[ 1 ] instanceof Error ) {
					str += ' ' + inspectError(
						{
							style: options.style ,
							noErrorStack: true
						} ,
						details[ 1 ]
					) ;
				}
				else {
					str += ' ' + inspect_(
						{
							depth: runtime.depth ,
							ancestors: runtime.ancestors ,
							noPre: true
						} ,
						options ,
						details[ 1 ]
					) ;
				}
			}

			return str ;
		}
	}

	if ( object._bsontype ) {
		// This is a MongoDB ObjectID, rather boring to display in its original form
		// due to esoteric characters that confuse both the user and the terminal displaying it.
		// Substitute it to its string representation
		return object.toString() ;
	}

	if ( options.useInspect && typeof object.inspect === 'function' ) {
		return object.inspect() ;
	}

	return ;
}



/*
	Options:
		noErrorStack: set to true if the stack should not be displayed
*/
function inspectError( options , error ) {
	var str = '' , stack , type , code ;

	if ( arguments.length < 2 ) { error = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( ! ( error instanceof Error ) ) {
		str += '[not an Error] ' ;

		if ( typeof error === 'string' ) {
			let maxLength = 5000 ;

			if ( error.length > maxLength ) {
				str += options.style.errorMessage( escape.control( error.slice( 0 , maxLength - 1 ) , true ) ) + '…'
					+ options.style.length( '(' + error.length + ' - TRUNCATED)' )
					+ options.style.newline ;
			}
			else {
				str += options.style.errorMessage( escape.control( error , true ) )
					+ options.style.newline ;
			}

			return str ;
		}
		else if ( ! error || typeof error !== 'object' || ! error.name || typeof error.name !== 'string' || ! error.message || typeof error.message !== 'string' ) {
			str += inspect( options , error ) ;
			return str ;
		}

		// It's an object, but it's compatible with Error, so we can move on...
	}

	if ( error.stack && ! options.noErrorStack ) { stack = inspectStack( options , error.stack ) ; }

	type = error.type || error.constructor.name ;
	code = error.code || error.name || error.errno || error.number ;

	str += options.style.errorType( type ) +
		( code ? ' [' + options.style.errorType( code ) + ']' : '' ) + ': ' ;
	str += options.style.errorMessage( error.message ) + '\n' ;

	if ( stack ) { str += options.style.errorStack( stack ) + '\n' ; }

	if ( error.from ) {
		str += options.style.newline + options.style.errorFromMessage( 'From error:' ) + options.style.newline + inspectError( options , error.from ) ;
	}

	return str ;
}

exports.inspectError = inspectError ;



function inspectStack( options , stack ) {
	if ( arguments.length < 2 ) { stack = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( ! stack ) { return ; }

	if ( ( options.browser || process.browser ) && stack.indexOf( '@' ) !== -1 ) {
		// Assume a Firefox-compatible stack-trace here...
		stack = stack
			.replace( /[</]*(?=@)/g , '' )	// Firefox output some WTF </</</</< stuff in its stack trace -- removing that
			.replace(
				/^\s*([^@]*)\s*@\s*([^\n]*)(?::([0-9]+):([0-9]+))?$/mg ,
				( matches , method , file , line , column ) => {
					return options.style.errorStack( '    at ' ) +
						( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
						options.style.errorStack( '(' ) +
						( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
						( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
						( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
						options.style.errorStack( ')' ) ;
				}
			) ;
	}
	else {
		stack = stack.replace( /^[^\n]*\n/ , '' ) ;
		stack = stack.replace(
			/^\s*(at)\s+(?:(?:(async|new)\s+)?([^\s:()[\]\n]+(?:\([^)]+\))?)\s)?(?:\[as ([^\s:()[\]\n]+)\]\s)?(?:\(?([^:()[\]\n]+):([0-9]+):([0-9]+)\)?)?$/mg ,
			( matches , at , keyword , method , as , file , line , column ) => {
				return options.style.errorStack( '    at ' ) +
					( keyword ? options.style.errorStackKeyword( keyword ) + ' ' : '' ) +
					( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
					( as ? options.style.errorStack( '[as ' ) + options.style.errorStackMethodAs( as ) + options.style.errorStack( '] ' ) : '' ) +
					options.style.errorStack( '(' ) +
					( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
					( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
					( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
					options.style.errorStack( ')' ) ;
			}
		) ;
	}

	return stack ;
}

exports.inspectStack = inspectStack ;



// Inspect's styles

var inspectStyle = {} ;

var inspectStyleNoop = str => str ;



inspectStyle.none = {
	trim: false ,
	tab: '    ' ,
	newline: '\n' ,
	comma: '' ,
	limit: inspectStyleNoop ,
	type: str => '<' + str + '>' ,
	constant: inspectStyleNoop ,
	funcName: inspectStyleNoop ,
	constructorName: str => '<' + str + '>' ,
	length: inspectStyleNoop ,
	key: inspectStyleNoop ,
	index: str => '[' + str + '] ' ,
	number: inspectStyleNoop ,
	inspect: inspectStyleNoop ,
	string: inspectStyleNoop ,
	errorType: inspectStyleNoop ,
	errorMessage: inspectStyleNoop ,
	errorStack: inspectStyleNoop ,
	errorStackKeyword: inspectStyleNoop ,
	errorStackMethod: inspectStyleNoop ,
	errorStackMethodAs: inspectStyleNoop ,
	errorStackFile: inspectStyleNoop ,
	errorStackLine: inspectStyleNoop ,
	errorStackColumn: inspectStyleNoop ,
	errorFromMessage: inspectStyleNoop ,
	truncate: ( str , maxLength ) => str.slice( 0 , maxLength - 1 ) + '…'
} ;



inspectStyle.inline = Object.assign( {} , inspectStyle.none , {
	trim: true ,
	tab: '' ,
	newline: ' ' ,
	comma: ', ' ,
	length: () => '' ,
	index: () => ''
	//type: () => '' ,
} ) ;



inspectStyle.color = Object.assign( {} , inspectStyle.none , {
	limit: str => ansi.bold + ansi.brightRed + str + ansi.reset ,
	type: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	constant: str => ansi.cyan + str + ansi.reset ,
	funcName: str => ansi.italic + ansi.magenta + str + ansi.reset ,
	constructorName: str => ansi.magenta + str + ansi.reset ,
	length: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	key: str => ansi.green + str + ansi.reset ,
	index: str => ansi.blue + '[' + str + ']' + ansi.reset + ' ' ,
	number: str => ansi.cyan + str + ansi.reset ,
	inspect: str => ansi.cyan + str + ansi.reset ,
	string: str => ansi.blue + str + ansi.reset ,
	errorType: str => ansi.red + ansi.bold + str + ansi.reset ,
	errorMessage: str => ansi.red + ansi.italic + str + ansi.reset ,
	errorStack: str => ansi.brightBlack + str + ansi.reset ,
	errorStackKeyword: str => ansi.italic + ansi.bold + str + ansi.reset ,
	errorStackMethod: str => ansi.brightYellow + str + ansi.reset ,
	errorStackMethodAs: str => ansi.yellow + str + ansi.reset ,
	errorStackFile: str => ansi.brightCyan + str + ansi.reset ,
	errorStackLine: str => ansi.blue + str + ansi.reset ,
	errorStackColumn: str => ansi.magenta + str + ansi.reset ,
	errorFromMessage: str => ansi.yellow + ansi.underline + str + ansi.reset ,
	truncate: ( str , maxLength ) => {
		var trail = ansi.gray + '…' + ansi.reset ;
		str = str.slice( 0 , maxLength - trail.length ) ;

		// Search for an ansi escape sequence at the end, that could be truncated.
		// The longest one is '\x1b[107m': 6 characters.
		var lastEscape = str.lastIndexOf( '\x1b' ) ;
		if ( lastEscape >= str.length - 6 ) { str = str.slice( 0 , lastEscape ) ; }

		return str + trail ;
	}
} ) ;



inspectStyle.html = Object.assign( {} , inspectStyle.none , {
	tab: '&nbsp;&nbsp;&nbsp;&nbsp;' ,
	newline: '<br />' ,
	limit: str => '<span style="color:red">' + str + '</span>' ,
	type: str => '<i style="color:gray">' + str + '</i>' ,
	constant: str => '<span style="color:cyan">' + str + '</span>' ,
	funcName: str => '<i style="color:magenta">' + str + '</i>' ,
	constructorName: str => '<span style="color:magenta">' + str + '</span>' ,
	length: str => '<i style="color:gray">' + str + '</i>' ,
	key: str => '<span style="color:green">' + str + '</span>' ,
	index: str => '<span style="color:blue">[' + str + ']</span> ' ,
	number: str => '<span style="color:cyan">' + str + '</span>' ,
	inspect: str => '<span style="color:cyan">' + str + '</span>' ,
	string: str => '<span style="color:blue">' + str + '</span>' ,
	errorType: str => '<span style="color:red">' + str + '</span>' ,
	errorMessage: str => '<span style="color:red">' + str + '</span>' ,
	errorStack: str => '<span style="color:gray">' + str + '</span>' ,
	errorStackKeyword: str => '<i>' + str + '</i>' ,
	errorStackMethod: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackMethodAs: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackFile: str => '<span style="color:cyan">' + str + '</span>' ,
	errorStackLine: str => '<span style="color:blue">' + str + '</span>' ,
	errorStackColumn: str => '<span style="color:gray">' + str + '</span>' ,
	errorFromMessage: str => '<span style="color:yellow">' + str + '</span>'
} ) ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/regexp.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





var escape = require( './escape.js' ) ;



exports.regexp = {} ;



exports.regexp.array2alternatives = function array2alternatives( array ) {
	var i , sorted = array.slice() ;

	// Sort descending by string length
	sorted.sort( ( a , b ) => {
		return b.length - a.length ;
	} ) ;

	// Then escape what should be
	for ( i = 0 ; i < sorted.length ; i ++ ) {
		sorted[ i ] = escape.regExpPattern( sorted[ i ] ) ;
	}

	return sorted.join( '|' ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/camel.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





var camel = {} ;
module.exports = camel ;



// Transform alphanum separated by underscore or minus to camel case
camel.toCamelCase = function( str , preserveUpperCase = false , initialUpperCase = false ) {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	return str.replace(
		/(?:^[\s_-]*|([\s_-]+))(([^\s_-]?)([^\s_-]*))/g ,
		( match , isNotFirstWord , word , firstLetter , endOfWord ) => {
			if ( preserveUpperCase ) {
				if ( ! isNotFirstWord && ! initialUpperCase ) { return word ; }
				if ( ! firstLetter ) { return '' ; }
				return firstLetter.toUpperCase() + endOfWord ;
			}

			if ( ! isNotFirstWord && ! initialUpperCase ) { return word.toLowerCase() ; }
			if ( ! firstLetter ) { return '' ; }
			return firstLetter.toUpperCase() + endOfWord.toLowerCase() ;
		}
	) ;
} ;



camel.camelCaseToSeparated = function( str , separator = ' ' , acronym = true ) {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	if ( ! acronym ) {
		return str.replace( /^([A-Z])|([A-Z])/g , ( match , firstLetter , letter ) => {
			if ( firstLetter ) { return firstLetter.toLowerCase() ; }
			return separator + letter.toLowerCase() ;
		} ) ;
	}

	// (^)? and (^)? does not work, so we have to use (?:(^)|)) and (?:($)|)) to capture end or not
	return str.replace( /(?:(^)|)([A-Z]+)(?:($)|(?=[a-z]))/g , ( match , isStart , letters , isEnd ) => {
		isStart = isStart === '' ;
		isEnd = isEnd === '' ;

		var prefix = isStart ? '' : separator ;

		return letters.length === 1 ? prefix + letters.toLowerCase() :
			isEnd ? prefix + letters :
			letters.length === 2 ? prefix + letters[ 0 ].toLowerCase() + separator + letters[ 1 ].toLowerCase() :
			prefix + letters.slice( 0 , -1 ) + separator + letters.slice( -1 ).toLowerCase() ;
	} ) ;
} ;



// Transform camel case to alphanum separated by minus
camel.camelCaseToDash =
camel.camelCaseToDashed = ( str ) => camel.camelCaseToSeparated( str , '-' , false ) ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/latinize.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





var map = require( './latinize-map.json' ) ;

module.exports = function( str ) {
	return str.replace( /[^\u0000-\u007e]/g , ( c ) => { return map[ c ] || c ; } ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/toTitleCase.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const DEFAULT_OPTIONS = {
	underscoreToSpace: true ,
	lowerCaseWords: new Set( [
		// Articles
		'a' , 'an' , 'the' ,
		// Conjunctions (only coordinating conjunctions, maybe we will have to add subordinating and correlative conjunctions)
		'for' , 'and' , 'nor' , 'but' , 'or' , 'yet' , 'so' ,
		// Prepositions (there are more, but usually only preposition with 2 or 3 letters are lower-cased)
		'of' , 'on' , 'off' , 'in' , 'into' , 'by' , 'with' , 'to' , 'at' , 'up' , 'down' , 'as'
	] )
} ;



module.exports = ( str , options = DEFAULT_OPTIONS ) => {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	// Manage options
	var dashToSpace = options.dashToSpace ?? DEFAULT_OPTIONS.dashToSpace ,
		underscoreToSpace = options.underscoreToSpace ?? DEFAULT_OPTIONS.underscoreToSpace ,
		zealous = options.zealous ?? DEFAULT_OPTIONS.zealous ,
		preserveAllCaps = options.preserveAllCaps ?? DEFAULT_OPTIONS.preserveAllCaps ,
		lowerCaseWords = options.lowerCaseWords ?? DEFAULT_OPTIONS.lowerCaseWords ;

	lowerCaseWords =
		lowerCaseWords instanceof Set ? lowerCaseWords :
		Array.isArray( lowerCaseWords ) ? new Set( lowerCaseWords ) :
		null ;


	if ( dashToSpace ) { str = str.replace( /-+/g , ' ' ) ; }
	if ( underscoreToSpace ) { str = str.replace( /_+/g , ' ' ) ; }

	// Squash multiple spaces into only one, and trim
	str = str.replace( / +/g , ' ' ).trim() ;


	return str.replace( /[^\s_-]+/g , ( part , position ) => {
		// Check word that must be lower-cased (excluding the first and the last word)
		if ( lowerCaseWords && position && position + part.length < str.length ) {
			let lowerCased = part.toLowerCase() ;
			if ( lowerCaseWords.has( lowerCased ) ) { return lowerCased ; }
		}

		if ( zealous ) {
			if ( preserveAllCaps && part === part.toUpperCase() ) {
				// This is a ALLCAPS word
				return part ;
			}

			return part[ 0 ].toUpperCase() + part.slice( 1 ).toLowerCase() ;
		}

		return part[ 0 ].toUpperCase() + part.slice( 1 ) ;
	} ) ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/wordwrap.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const unicode = require( './unicode.js' ) ;



// French typography rules with '!', '?', ':' and ';'
const FRENCH_DOUBLE_GRAPH_TYPO = {
	'!': true ,
	'?': true ,
	':': true ,
	';': true
} ;



/*
	.wordwrap( str , width )
	.wordwrap( str , options )

	str: the string to process
	width: the max width (default to 80)
	options: object, where:
		width: the max width (default to 80)
		glue: (optional) the char used to join lines, by default: lines are joined with '\n',
		noJoin: (optional) if set: don't join, instead return an array of lines
		offset: (optional) offset of the first-line
		updateOffset: (optional) if set, options.offset is updated with the last line width
		noTrim: (optional) if set, don't right-trim lines, if not set, right-trim all lines except the last
		fill: (optional) if set, fill the remaining width with space (it forces noTrim)
		skipFn: (optional) a function used to skip a whole sequence, useful for special sequences
			like ANSI escape sequence, and so on...
		charWidthFn: (optional) a function used to compute the width of one char/group of chars
		regroupFn: (optional) a function used to regroup chars together
*/
module.exports = function wordwrap( str , options ) {
	var start = 0 , end , skipEnd , lineWidth , currentLine , currentWidth , length ,
		lastEnd , lastWidth , lastWasSpace , charWidthFn ,
		explicitNewLine = true ,
		strArray = unicode.toArray( str ) ,
		trimNewLine = false ,
		line , lines = [] ;

	if ( typeof options !== 'object' ) {
		options = { width: options } ;
	}

	// Catch NaN, zero or negative and non-number
	if ( ! options.width || typeof options.width !== 'number' || options.width <= 0 ) { options.width = 80 ; }

	lineWidth = options.offset ? options.width - options.offset : options.width ;

	if ( typeof options.glue !== 'string' ) { options.glue = '\n' ; }

	if ( options.regroupFn ) {
		strArray = options.regroupFn( strArray ) ;
		// If char are grouped, use unicode.width() as a default
		charWidthFn = options.charWidthFn || unicode.width ;
	}
	else {
		// If char are not grouped, use unicode.charWidth() as a default
		charWidthFn = options.charWidthFn || unicode.charWidth ;
	}

	length = strArray.length ;

	var getNextLine = () => {
		//originStart = start ;

		if ( ! explicitNewLine || trimNewLine ) {
			// Find the first non-space char
			while ( strArray[ start ] === ' ' ) { start ++ ; }

			if ( trimNewLine && strArray[ start ] === '\n' ) {
				explicitNewLine = true ;
				start ++ ;
				/*
				originStart = start ;
				while ( strArray[ start ] === ' ' ) { start ++ ; }
				*/
			}
		}

		if ( start >= length ) { return null ; }

		explicitNewLine = false ;
		trimNewLine = false ;
		lastWasSpace = false ;
		end = lastEnd = start ;
		currentWidth = lastWidth = 0 ;

		for ( ;; ) {
			if ( end >= length ) {
				return strArray.slice( start , end ).join( '' ) ;
			}

			if ( strArray[ end ] === '\n' ) {
				explicitNewLine = true ;
				currentLine = strArray.slice( start , end ++ ).join( '' ) ;

				if ( options.fill ) {
					currentLine += ' '.repeat( lineWidth - currentWidth ) ;
				}

				return currentLine ;
			}

			if ( options.skipFn ) {
				skipEnd = options.skipFn( strArray , end ) ;
				if ( skipEnd !== end ) {
					end = skipEnd ;
					continue ;
				}
			}

			if ( strArray[ end ] === ' ' && ! lastWasSpace && ! FRENCH_DOUBLE_GRAPH_TYPO[ strArray[ end + 1 ] ] ) {
				// This is the first space of a group of space
				lastEnd = end ;
				lastWidth = currentWidth ;
			}
			else {
				lastWasSpace = false ;
			}

			currentWidth += charWidthFn( strArray[ end ] ) ;

			if ( currentWidth > lineWidth ) {
				// If lastEnd === start, this is a word that takes the whole line: cut it
				// If not, use the lastEnd
				trimNewLine = true ;

				if ( lastEnd !== start ) {
					end = lastEnd ;
				}
				else if ( lineWidth < options.width ) {
					// This is the first line with an offset, so just start over in line two
					end = start ;
					return '' ;
				}

				currentLine = strArray.slice( start , end ).join( '' ) ;

				if ( options.fill ) {
					currentLine += ' '.repeat( lineWidth - lastWidth ) ;
				}

				return currentLine ;
			}

			// Do not move that inside the for(;;), some part are using a continue statement and manage the end value by themself
			end ++ ;
		}
	} ;

	while ( start < length && ( line = getNextLine() ) !== null ) {
		lines.push( line ) ;
		start = end ;
		lineWidth = options.width ;
	}

	// If it ends with an explicit newline, we have to reproduce it now!
	if ( explicitNewLine ) { lines.push( '' ) ; }

	if ( ! options.noTrim && ! options.fill ) {
		lines = lines.map( ( line_ , index ) => index === lines.length - 1 ? line_ : line_.trimRight() ) ;
	}

	if ( ! options.noJoin ) { lines = lines.join( options.glue ) ; }

	if ( options.updateOffset ) { options.offset = currentWidth ; }

	return lines ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/naturalSort.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





const CONTROL_CLASS = 1 ;
const WORD_SEPARATOR_CLASS = 2 ;
const LETTER_CLASS = 3 ;
const NUMBER_CLASS = 4 ;
const SYMBOL_CLASS = 5 ;



function getCharacterClass( char , code ) {
	if ( isWordSeparator( code ) ) { return WORD_SEPARATOR_CLASS ; }
	if ( code <= 0x1f || code === 0x7f ) { return CONTROL_CLASS ; }
	if ( isNumber( code ) ) { return NUMBER_CLASS ; }
	// Here we assume that a letter is a char with a “case”
	if ( char.toUpperCase() !== char.toLowerCase() ) { return LETTER_CLASS ; }
	return SYMBOL_CLASS ;
}



function isWordSeparator( code ) {
	if (
		// space, tab, no-break space
		code === 0x20 || code === 0x09 || code === 0xa0 ||
		// hyphen, underscore
		code === 0x2d || code === 0x5f
	) {
		return true ;
	}

	return false ;
}



function isNumber( code ) {
	if ( code >= 0x30 && code <= 0x39 ) { return true ; }
	return false ;
}



function naturalSort( a , b ) {
	a = '' + a ;
	b = '' + b ;

	var aIndex , aEndIndex , aChar , aCode , aClass , aCharLc , aNumber ,
		aTrim = a.trim() ,
		aLength = aTrim.length ,
		bIndex , bEndIndex , bChar , bCode , bClass , bCharLc , bNumber ,
		bTrim = b.trim() ,
		bLength = bTrim.length ,
		advantage = 0 ;

	for ( aIndex = bIndex = 0 ; aIndex < aLength && bIndex < bLength ; aIndex ++ , bIndex ++ ) {
		aChar = aTrim[ aIndex ] ;
		bChar = bTrim[ bIndex ] ;
		aCode = aTrim.charCodeAt( aIndex ) ;
		bCode = bTrim.charCodeAt( bIndex ) ;
		aClass = getCharacterClass( aChar , aCode ) ;
		bClass = getCharacterClass( bChar , bCode ) ;
		if ( aClass !== bClass ) { return aClass - bClass ; }

		switch ( aClass ) {
			case WORD_SEPARATOR_CLASS :
				// Eat all white chars and continue
				while ( isWordSeparator( aTrim.charCodeAt( aIndex + 1 ) ) ) { aIndex ++ ; }
				while ( isWordSeparator( bTrim.charCodeAt( bIndex + 1 ) ) ) { bIndex ++ ; }
				break ;

			case CONTROL_CLASS :
			case SYMBOL_CLASS :
				if ( aCode !== bCode ) { return aCode - bCode ; }
				break ;

			case LETTER_CLASS :
				aCharLc = aChar.toLowerCase() ;
				bCharLc = bChar.toLowerCase() ;
				if ( aCharLc !== bCharLc ) { return aCharLc > bCharLc ? 1 : -1 ; }

				// As a last resort, we would sort uppercase first
				if ( ! advantage && aChar !== bChar ) { advantage = aChar !== aCharLc ? -1 : 1 ; }

				break ;

			case NUMBER_CLASS :
				// Lookup for a whole number and parse it
				aEndIndex = aIndex + 1 ;
				while ( isNumber( aTrim.charCodeAt( aEndIndex ) ) ) { aEndIndex ++ ; }
				aNumber = parseFloat( aTrim.slice( aIndex , aEndIndex ) ) ;

				bEndIndex = bIndex + 1 ;
				while ( isNumber( bTrim.charCodeAt( bEndIndex ) ) ) { bEndIndex ++ ; }
				bNumber = parseFloat( bTrim.slice( bIndex , bEndIndex ) ) ;

				if ( aNumber !== bNumber ) { return aNumber - bNumber ; }

				// As a last resort, we would sort the number with the less char first
				if ( ! advantage && aEndIndex - aIndex !== bEndIndex - bIndex ) { advantage = ( aEndIndex - aIndex ) - ( bEndIndex - bIndex ) ; }

				// Advance the index at the end of the number area
				aIndex = aEndIndex - 1 ;
				bIndex = bEndIndex - 1 ;
				break ;
		}
	}

	// If there was an “advantage”, use it now
	if ( advantage ) { return advantage ; }

	// Finally, sort by remaining char, or by trimmed length or by full length
	return ( aLength - aIndex ) - ( bLength - bIndex ) || aLength - bLength || a.length - b.length ;
}

module.exports = naturalSort ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/fuzzy.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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




const fuzzy = {} ;
module.exports = fuzzy ;



fuzzy.score = ( input , pattern ) => {
	if ( input === pattern ) { return 1 ; }
	if ( input.length === 0 || pattern.length === 0 ) { return 0 ; }
	//return 1 - fuzzy.levenshtein( input , pattern ) / ( pattern.length >= input.length ? pattern.length : input.length ) ;
	return Math.max( 0 , 1 - fuzzy.levenshtein( input , pattern ) / pattern.length ) ;
} ;



const DEFAULT_SCORE_LIMIT = 0 ;
const DEFAULT_TOKEN_DISPARITY_PENALTY = 0.88 ;
// deltaRate should be just above tokenDisparityPenalty
const DEFAULT_DELTA_RATE = 0.9 ;



fuzzy.bestMatch = ( input , patterns , options = {} ) => {
	var bestScore = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		i , iMax , currentScore , currentPattern ,
		bestIndex = -1 ,
		bestPattern = null ;

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentScore = fuzzy.score( input , currentPattern ) ;
		if ( currentScore === 1 ) { return options.indexOf ? i : currentPattern ; }
		if ( currentScore > bestScore ) {
			bestScore = currentScore ;
			bestPattern = currentPattern ;
			bestIndex = i ;
		}
	}

	return options.indexOf ? bestIndex : bestPattern ;
} ;



fuzzy.topMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		deltaRate = options.deltaRate || DEFAULT_DELTA_RATE ,
		i , iMax , patternScores ;

	patternScores = patterns.map( ( pattern , index ) => ( { pattern , index , score: fuzzy.score( input , pattern ) } ) ) ;
	patternScores.sort( ( a , b ) => b.score - a.score ) ;

	//console.log( patternScores ) ;

	if ( patternScores[ 0 ].score <= scoreLimit ) { return [] ; }
	scoreLimit = Math.max( scoreLimit , patternScores[ 0 ].score * deltaRate ) ;

	for ( i = 1 , iMax = patternScores.length ; i < iMax ; i ++ ) {
		if ( patternScores[ i ].score < scoreLimit ) {
			patternScores.length = i ;
			break ;
		}
	}

	return options.indexOf ?
		patternScores.map( e => e.index ) :
		patternScores.map( e => e.pattern ) ;
} ;



const englishBlackList = new Set( [
	'a' , 'an' , 'the' , 'this' , 'that' , 'those' , 'some' ,
	'of' , 'in' , 'on' , 'at' ,
	'my' , 'your' , 'her' , 'his' , 'its' , 'our' , 'their'
] ) ;

function tokenize( str , blackList = englishBlackList ) {
	return str.split( /[ '"/|,:_-]+/g ).filter( s => s && ! blackList.has( s ) ) ;
}



// This is almost the same code than .topTokenMatch(): both must be in sync
fuzzy.bestTokenMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		tokenDisparityPenalty = options.tokenDisparityPenalty || DEFAULT_TOKEN_DISPARITY_PENALTY ,
		i , iMax , j , jMax , z , zMax ,
		currentPattern , currentPatternTokens , currentPatternToken , currentPatternScore ,
		bestPatternScore = scoreLimit ,
		//currentPatternScores = [] ,
		currentInputToken , currentScore ,
		inputTokens = tokenize( input ) ,
		bestScore ,
		bestIndex = -1 ,
		bestPattern = null ;

	//console.log( inputTokens ) ;
	if ( ! inputTokens.length || ! patterns.length ) { return options.indexOf ? bestIndex : bestPattern ; }

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentPatternTokens = tokenize( currentPattern ) ;
		//currentPatternScores.length = 0 ;
		currentPatternScore = 0 ;

		for ( j = 0 , jMax = inputTokens.length ; j < jMax ; j ++ ) {
			currentInputToken = inputTokens[ j ] ;
			bestScore = 0 ;

			for ( z = 0 , zMax = currentPatternTokens.length ; z < zMax ; z ++ ) {
				currentPatternToken = currentPatternTokens[ z ] ;
				currentScore = fuzzy.score( currentInputToken , currentPatternToken ) ;

				if ( currentScore > bestScore ) {
					bestScore = currentScore ;
					if ( currentScore === 1 ) { break ; }
				}
			}

			//currentPatternScores[ j ] = bestScore ;
			currentPatternScore += bestScore ;
		}

		//currentPatternScore = Math.hypot( ... currentPatternScores ) ;
		currentPatternScore /= inputTokens.length ;

		// Apply a small penalty if there isn't enough tokens
		if ( inputTokens.length !== currentPatternTokens.length ) {
			currentPatternScore *= tokenDisparityPenalty ** Math.abs( currentPatternTokens.length - inputTokens.length ) ;
		}

		//console.log( currentPattern + ': ' + currentPatternScore ) ;
		if ( currentPatternScore > bestPatternScore ) {
			bestPatternScore = currentPatternScore ;
			bestPattern = currentPattern ;
			bestIndex = i ;
		}
	}

	return options.indexOf ? bestIndex : bestPattern ;
} ;



// This is almost the same code than .bestTokenMatch(): both must be in sync
// deltaRate should be just above tokenDisparityPenalty
fuzzy.topTokenMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		tokenDisparityPenalty = options.tokenDisparityPenalty || DEFAULT_TOKEN_DISPARITY_PENALTY ,
		deltaRate = options.deltaRate || DEFAULT_DELTA_RATE ,
		i , iMax , j , jMax , z , zMax ,
		currentPattern , currentPatternTokens , currentPatternToken , currentPatternScore ,
		currentInputToken , currentScore ,
		inputTokens = tokenize( input ) ,
		bestScore ,
		patternScores = [] ;

	//console.log( inputTokens ) ;
	if ( ! inputTokens.length || ! patterns.length ) { return [] ; }

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentPatternTokens = tokenize( currentPattern ) ;
		//currentPatternScores.length = 0 ;
		currentPatternScore = 0 ;

		for ( j = 0 , jMax = inputTokens.length ; j < jMax ; j ++ ) {
			currentInputToken = inputTokens[ j ] ;
			bestScore = 0 ;

			for ( z = 0 , zMax = currentPatternTokens.length ; z < zMax ; z ++ ) {
				currentPatternToken = currentPatternTokens[ z ] ;
				currentScore = fuzzy.score( currentInputToken , currentPatternToken ) ;

				if ( currentScore > bestScore ) {
					bestScore = currentScore ;
					if ( currentScore === 1 ) { break ; }
				}
			}

			//currentPatternScores[ j ] = bestScore ;
			currentPatternScore += bestScore ;
		}

		//currentPatternScore = Math.hypot( ... currentPatternScores ) ;
		currentPatternScore /= inputTokens.length ;

		// Apply a small penalty if there isn't enough tokens
		if ( inputTokens.length !== currentPatternTokens.length ) {
			currentPatternScore *= tokenDisparityPenalty ** Math.abs( currentPatternTokens.length - inputTokens.length ) ;
		}

		patternScores.push( { pattern: currentPattern , index: i , score: currentPatternScore } ) ;
	}

	patternScores.sort( ( a , b ) => b.score - a.score ) ;
	//console.log( "Before truncating:" , patternScores ) ;

	if ( patternScores[ 0 ].score <= scoreLimit ) { return [] ; }
	scoreLimit = Math.max( scoreLimit , patternScores[ 0 ].score * deltaRate ) ;

	for ( i = 1 , iMax = patternScores.length ; i < iMax ; i ++ ) {
		if ( patternScores[ i ].score < scoreLimit ) {
			patternScores.length = i ;
			break ;
		}
	}

	//console.log( "After truncating:" , patternScores ) ;

	return options.indexOf ?
		patternScores.map( e => e.index ) :
		patternScores.map( e => e.pattern ) ;
} ;



// The .levenshtein() function is derivated from https://github.com/sindresorhus/leven by Sindre Sorhus (MIT License)
const _tracker = [] ;
const _leftCharCodeCache = [] ;

fuzzy.levenshtein = ( left , right ) => {
	if ( left === right ) { return 0 ; }

	// Swapping the strings if `a` is longer than `b` so we know which one is the
	// shortest & which one is the longest
	if ( left.length > right.length ) {
		let swap = left ;
		left = right ;
		right = swap ;
	}

	let leftLength = left.length ;
	let rightLength = right.length ;

	// Performing suffix trimming:
	// We can linearly drop suffix common to both strings since they
	// don't increase distance at all
	while ( leftLength > 0 && ( left.charCodeAt( leftLength - 1 ) === right.charCodeAt( rightLength - 1 ) ) ) {
		leftLength -- ;
		rightLength -- ;
	}

	// Performing prefix trimming
	// We can linearly drop prefix common to both strings since they
	// don't increase distance at all
	let start = 0 ;

	while ( start < leftLength && ( left.charCodeAt( start ) === right.charCodeAt( start ) ) ) {
		start ++ ;
	}

	leftLength -= start ;
	rightLength -= start ;

	if ( leftLength === 0 ) { return rightLength ; }

	let rightCharCode ;
	let result ;
	let temp ;
	let temp2 ;
	let i = 0 ;
	let j = 0 ;

	while ( i < leftLength ) {
		_leftCharCodeCache[ i ] = left.charCodeAt( start + i ) ;
		_tracker[ i ] = ++ i ;
	}

	while ( j < rightLength ) {
		rightCharCode = right.charCodeAt( start + j ) ;
		temp = j ++ ;
		result = j ;

		for ( i = 0 ; i < leftLength ; i ++ ) {
			temp2 = rightCharCode === _leftCharCodeCache[ i ] ? temp : temp + 1 ;
			temp = _tracker[ i ] ;
			// eslint-disable-next-line no-nested-ternary
			result = _tracker[ i ] = temp > result   ?   temp2 > result ? result + 1 : temp2   :   temp2 > temp ? temp + 1 : temp2 ;
		}
	}

	return result ;
} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/StringNumber.js' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
"use strict" ;
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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





/*
	Number formatting class.
	.format() should entirely use it for everything related to number formatting.
	It avoids unsolvable rounding error with epsilon.
	It is dedicated for number display, not for computing.
*/



function StringNumber( number , decimalSeparator = '.' , groupSeparator = '' , forceDecimalSeparator = false ) {
	this.sign = 1 ;
	this.digits = [] ;
	this.exposant = 0 ;
	this.special = null ;	// 'special' store special values like NaN, Infinity, etc

	this.decimalSeparator = decimalSeparator ;
	this.forceDecimalSeparator = !! forceDecimalSeparator ;
	this.groupSeparator = groupSeparator ;

	this.set( number ) ;
}

module.exports = StringNumber ;



StringNumber.prototype.set = function( number ) {
	var matches , digits , exposant , v , i , iMax , index , hasNonZeroHead , tailIndex ;

	number = + number ;

	// Reset anything, if it was already used...
	this.sign = 1 ;
	this.digits.length = 0 ;
	this.exposant = 0 ;
	this.special = null ;

	if ( ! Number.isFinite( number ) ) {
		this.special = number ;
		return null ;
	}

	number = '' + number ;
	matches = number.match( /(-)?([0-9]+)(?:.([0-9]+))?(?:e([+-][0-9]+))?/ ) ;
	if ( ! matches ) { throw new Error( 'Unexpected error' ) ; }

	this.sign = matches[ 1 ] ? -1 : 1 ;
	this.exposant = matches[ 2 ].length + ( parseInt( matches[ 4 ] , 10 ) || 0 ) ;

	// Copy each digits and cast them back into a number
	index = 0 ;
	hasNonZeroHead = false ;
	tailIndex = 0 ;	// used to cut trailing zero

	for ( i = 0 , iMax = matches[ 2 ].length ; i < iMax ; i ++ ) {
		v = + matches[ 2 ][ i ] ;
		if ( v !== 0 ) {
			hasNonZeroHead = true ;
			this.digits[ index ] = v ;
			index ++ ;
			tailIndex = index ;
		}
		else if ( hasNonZeroHead ) {
			this.digits[ index ] = v ;
			index ++ ;
		}
		else {
			this.exposant -- ;
		}
	}

	if ( matches[ 3 ] ) {
		for ( i = 0 , iMax = matches[ 3 ].length ; i < iMax ; i ++ ) {
			v = + matches[ 3 ][ i ] ;

			if ( v !== 0 ) {
				hasNonZeroHead = true ;
				this.digits[ index ] = v ;
				index ++ ;
				tailIndex = index ;
			}
			else if ( hasNonZeroHead ) {
				this.digits[ index ] = v ;
				index ++ ;
			}
			else {
				this.exposant -- ;
			}
		}
	}

	if ( tailIndex !== index ) {
		this.digits.length = tailIndex ;
	}
} ;



StringNumber.prototype.toNumber = function() {
	// Using a string representation
	if ( this.special !== null ) { return this.special ; }
	return parseFloat( ( this.sign < 0 ? '-' : '' ) + '0.' + this.digits.join( '' ) + 'e' + this.exposant ) ;
} ;



StringNumber.prototype.toString = function( ... args ) {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( this.exposant > 20 || this.exposant < -20 ) { return this.toScientificString( ... args ) ; }
	return this.toNoExpString( ... args ) ;
} ;



StringNumber.prototype.toExponential =
StringNumber.prototype.toExponentialString = function() {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;
	if ( ! this.digits.length ) { return str + '0' ; }

	str += this.digits[ 0 ] ;

	if ( this.digits.length > 1 ) {
		str += this.decimalSeparator + this.digits.join( '' ).slice( 1 ) ;
	}

	str += 'e' + ( this.exposant > 0 ? '+' : '' ) + ( this.exposant - 1 ) ;
	return str ;
} ;



const SUPER_NUMBER = [ '⁰' , '¹' , '²' , '³' , '⁴' , '⁵' , '⁶' , '⁷' , '⁸' , '⁹' ] ;
const SUPER_PLUS = '⁺' ;
const SUPER_MINUS = '⁻' ;
const ZERO_CHAR_CODE = '0'.charCodeAt( 0 ) ;

StringNumber.prototype.toScientific =
StringNumber.prototype.toScientificString = function() {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;
	if ( ! this.digits.length ) { return str + '0' ; }

	str += this.digits[ 0 ] ;

	if ( this.digits.length > 1 ) {
		str += this.decimalSeparator + this.digits.join( '' ).slice( 1 ) ;
	}

	var exposantStr =
		( this.exposant <= 0 ? SUPER_MINUS : '' ) +
		( '' + Math.abs( this.exposant - 1 ) ).split( '' ).map( c => SUPER_NUMBER[ c.charCodeAt( 0 ) - ZERO_CHAR_CODE ] )
			.join( '' ) ;

	str += ' × 10' + exposantStr ;
	return str ;
} ;



// leadingZero = minimal number of numbers before the dot, they will be left-padded with zero if needed.
// trailingZero = minimal number of numbers after the dot, they will be right-padded with zero if needed.
// onlyIfDecimal: set it to true if you don't want right padding zero when there is no decimal
StringNumber.prototype.toNoExp =
StringNumber.prototype.toNoExpString = function( leadingZero = 1 , trailingZero = 0 , onlyIfDecimal = false , forcePlusSign = false , exposant = this.exposant ) {
	if ( this.special !== null ) { return '' + this.special ; }

	var integerDigits = [] , decimalDigits = [] ,
		str = this.sign < 0 ? '-' : forcePlusSign ? '+' : '' ;

	if ( ! this.digits.length ) {
		arrayFill( integerDigits , 0 , leadingZero ) ;

		if ( trailingZero && ! onlyIfDecimal ) {
			arrayFill( decimalDigits , 0 , trailingZero ) ;
		}
	}
	else if ( exposant <= 0 ) {
		// This number is of type 0.[0...]xyz
		arrayFill( integerDigits , 0 , leadingZero ) ;

		arrayFill( decimalDigits , 0 , -exposant ) ;
		arrayConcatSlice( decimalDigits , this.digits ) ;

		if ( trailingZero && this.digits.length - exposant < trailingZero ) {
			arrayFill( decimalDigits , 0 , trailingZero - this.digits.length + exposant ) ;
		}
	}
	else if ( exposant >= this.digits.length ) {
		// This number is of type xyz[0...]
		if ( exposant < leadingZero ) { arrayFill( integerDigits , 0 , leadingZero - exposant ) ; }
		arrayConcatSlice( integerDigits , this.digits ) ;
		arrayFill( integerDigits , 0 , exposant - this.digits.length ) ;

		if ( trailingZero && ! onlyIfDecimal ) {
			arrayFill( decimalDigits , 0 , trailingZero ) ;
		}
	}
	else {
		// Here the digits are splitted with a dot in the middle
		if ( exposant < leadingZero ) { arrayFill( integerDigits , 0 , leadingZero - exposant ) ; }
		arrayConcatSlice( integerDigits , this.digits , 0 , exposant ) ;

		arrayConcatSlice( decimalDigits , this.digits , exposant ) ;

		if (
			trailingZero && this.digits.length - exposant < trailingZero
			&& ( ! onlyIfDecimal || this.digits.length - exposant > 0 )
		) {
			arrayFill( decimalDigits , 0 , trailingZero - this.digits.length + exposant ) ;
		}
	}

	str += this.groupSeparator ?
		this.groupDigits( integerDigits , this.groupSeparator ) :
		integerDigits.join( '' ) ;

	if ( decimalDigits.length ) {
		str += this.decimalSeparator + (
			this.decimalGroupSeparator ?
				this.groupDigits( decimalDigits , this.decimalGroupSeparator ) :
				decimalDigits.join( '' )
		) ;
	}
	else if ( this.forceDecimalSeparator ) {
		str += this.decimalSeparator ;
	}

	return str ;
} ;



// Metric prefix
const MUL_PREFIX = [ '' , 'k' , 'M' , 'G' , 'T' , 'P' , 'E' , 'Z' , 'Y' ] ;
const SUB_MUL_PREFIX = [ '' , 'm' , 'µ' , 'n' , 'p' , 'f' , 'a' , 'z' , 'y' ] ;



StringNumber.prototype.toMetric =
StringNumber.prototype.toMetricString = function( leadingZero = 1 , trailingZero = 0 , onlyIfDecimal = false , forcePlusSign = false ) {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( ! this.digits.length ) { return this.sign > 0 ? '0' : '-0' ; }

	var prefix = '' , fakeExposant ;

	if ( this.exposant > 0 ) {
		fakeExposant = 1 + ( ( this.exposant - 1 ) % 3 ) ;
		prefix = MUL_PREFIX[ Math.floor( ( this.exposant - 1 ) / 3 ) ] ;
		// Fallback to scientific if the number is to big
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}
	else {
		fakeExposant = 3 - ( -this.exposant % 3 ) ;
		prefix = SUB_MUL_PREFIX[ 1 + Math.floor( -this.exposant / 3 ) ] ;
		// Fallback to scientific if the number is to small
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}

	return this.toNoExpString( leadingZero , trailingZero , onlyIfDecimal , forcePlusSign , fakeExposant ) + prefix ;
} ;



/*
	type: 0=round, -1=floor, 1=ceil
	Floor if < .99999
	Ceil if >= .00001
*/
StringNumber.prototype.precision = function( n , type = 0 ) {
	var roundUp ;

	if ( this.special !== null || n >= this.digits.length ) { return this ; }

	if ( n < 0 ) { this.digits.length = 0 ; return this ; }

	type *= this.sign ;

	if ( type < 0 ) {
		roundUp =
			this.digits.length > n + 4
			&& this.digits[ n ] === 9 && this.digits[ n + 1 ] === 9
			&& this.digits[ n + 2 ] === 9 && this.digits[ n + 3 ] === 9 && this.digits[ n + 4 ] === 9 ;
	}
	else if ( type > 0 ) {
		roundUp =
			this.digits[ n ] > 0 || this.digits[ n + 1 ] > 0
			|| this.digits[ n + 2 ] > 0 || this.digits[ n + 3 ] > 0 || this.digits[ n + 4 ] > 0 ;
	}
	else {
		roundUp = this.digits[ n ] >= 5 ;
	}

	if ( roundUp ) {
		let i = n - 1 ,
			done = false ;

		// Cascading increase
		for ( ; i >= 0 ; i -- ) {
			if ( this.digits[ i ] < 9 ) { this.digits[ i ] ++ ; done = true ; break ; }
			else { this.digits[ i ] = 0 ; }
		}

		if ( ! done ) {
			this.exposant ++ ;
			this.digits[ 0 ] = 1 ;
			this.digits.length = 1 ;
		}
		else {
			this.digits.length = i + 1 ;
		}
	}
	else {
		this.digits.length = n ;
		this.removeTrailingZero() ;
	}

	return this ;
} ;



StringNumber.prototype.round = function( decimalPlace = 0 , type = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , type ) ;
} ;



StringNumber.prototype.floor = function( decimalPlace = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , -1 ) ;
} ;



StringNumber.prototype.ceil = function( decimalPlace = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , 1 ) ;
} ;



StringNumber.prototype.removeTrailingZero = function() {
	var i = this.digits.length - 1 ;
	while( i >= 0 && this.digits[ i ] === 0 ) { i -- ; }
	this.digits.length = i + 1 ;
} ;



const GROUP_SIZE = 3 ;

StringNumber.prototype.groupDigits = function( digits , separator , inverseOrder = false ) {
	var str = '' ,
		offset = inverseOrder ? 0 : GROUP_SIZE - ( digits.length % GROUP_SIZE ) ,
		i = 0 ,
		iMax = digits.length ;

	for ( ; i < iMax ; i ++ ) {
		str += i && ( ( i + offset ) % GROUP_SIZE === 0 ) ? separator + digits[ i ] : digits[ i ] ;
	}

	return str ;
} ;



function arrayFill( intoArray , value , repeat ) {
	while ( repeat -- ) { intoArray[ intoArray.length ] = value ; }
	return intoArray ;
}



function arrayConcatSlice( intoArray , sourceArray , start = 0 , end = sourceArray.length ) {
	for ( let i = start ; i < end ; i ++ ) { intoArray[ intoArray.length ] = sourceArray[ i ] ; }
	return intoArray ;
}
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/unicode-emoji-width-ranges.json' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = [{"s":9728,"e":9747,"w":1},{"s":9748,"e":9749,"w":2},{"s":9750,"e":9799,"w":1},{"s":9800,"e":9811,"w":2},{"s":9812,"e":9854,"w":1},{"s":9855,"e":9855,"w":2},{"s":9856,"e":9874,"w":1},{"s":9875,"e":9875,"w":2},{"s":9876,"e":9888,"w":1},{"s":9889,"e":9889,"w":2},{"s":9890,"e":9897,"w":1},{"s":9898,"e":9899,"w":2},{"s":9900,"e":9916,"w":1},{"s":9917,"e":9918,"w":2},{"s":9919,"e":9923,"w":1},{"s":9924,"e":9925,"w":2},{"s":9926,"e":9933,"w":1},{"s":9934,"e":9934,"w":2},{"s":9935,"e":9939,"w":1},{"s":9940,"e":9940,"w":2},{"s":9941,"e":9961,"w":1},{"s":9962,"e":9962,"w":2},{"s":9963,"e":9969,"w":1},{"s":9970,"e":9971,"w":2},{"s":9972,"e":9972,"w":1},{"s":9973,"e":9973,"w":2},{"s":9974,"e":9977,"w":1},{"s":9978,"e":9978,"w":2},{"s":9979,"e":9980,"w":1},{"s":9981,"e":9981,"w":2},{"s":9982,"e":9983,"w":1},{"s":9984,"e":9988,"w":1},{"s":9989,"e":9989,"w":2},{"s":9990,"e":9993,"w":1},{"s":9994,"e":9995,"w":2},{"s":9996,"e":10023,"w":1},{"s":10024,"e":10024,"w":2},{"s":10025,"e":10059,"w":1},{"s":10060,"e":10060,"w":2},{"s":10061,"e":10061,"w":1},{"s":10062,"e":10062,"w":2},{"s":10063,"e":10066,"w":1},{"s":10067,"e":10069,"w":2},{"s":10070,"e":10070,"w":1},{"s":10071,"e":10071,"w":2},{"s":10072,"e":10132,"w":1},{"s":10133,"e":10135,"w":2},{"s":10136,"e":10159,"w":1},{"s":10160,"e":10160,"w":2},{"s":10161,"e":10174,"w":1},{"s":10175,"e":10175,"w":2},{"s":126976,"e":126979,"w":1},{"s":126980,"e":126980,"w":2},{"s":126981,"e":127182,"w":1},{"s":127183,"e":127183,"w":2},{"s":127184,"e":127373,"w":1},{"s":127374,"e":127374,"w":2},{"s":127375,"e":127376,"w":1},{"s":127377,"e":127386,"w":2},{"s":127387,"e":127487,"w":1},{"s":127744,"e":127776,"w":2},{"s":127777,"e":127788,"w":1},{"s":127789,"e":127797,"w":2},{"s":127798,"e":127798,"w":1},{"s":127799,"e":127868,"w":2},{"s":127869,"e":127869,"w":1},{"s":127870,"e":127891,"w":2},{"s":127892,"e":127903,"w":1},{"s":127904,"e":127946,"w":2},{"s":127947,"e":127950,"w":1},{"s":127951,"e":127955,"w":2},{"s":127956,"e":127967,"w":1},{"s":127968,"e":127984,"w":2},{"s":127985,"e":127987,"w":1},{"s":127988,"e":127988,"w":2},{"s":127989,"e":127991,"w":1},{"s":127992,"e":127994,"w":2},{"s":128000,"e":128062,"w":2},{"s":128063,"e":128063,"w":1},{"s":128064,"e":128064,"w":2},{"s":128065,"e":128065,"w":1},{"s":128066,"e":128252,"w":2},{"s":128253,"e":128254,"w":1},{"s":128255,"e":128317,"w":2},{"s":128318,"e":128330,"w":1},{"s":128331,"e":128334,"w":2},{"s":128335,"e":128335,"w":1},{"s":128336,"e":128359,"w":2},{"s":128360,"e":128377,"w":1},{"s":128378,"e":128378,"w":2},{"s":128379,"e":128404,"w":1},{"s":128405,"e":128406,"w":2},{"s":128407,"e":128419,"w":1},{"s":128420,"e":128420,"w":2},{"s":128421,"e":128506,"w":1},{"s":128507,"e":128591,"w":2},{"s":128592,"e":128639,"w":1},{"s":128640,"e":128709,"w":2},{"s":128710,"e":128715,"w":1},{"s":128716,"e":128716,"w":2},{"s":128717,"e":128719,"w":1},{"s":128720,"e":128722,"w":2},{"s":128723,"e":128724,"w":1},{"s":128725,"e":128727,"w":2},{"s":128728,"e":128746,"w":1},{"s":128747,"e":128748,"w":2},{"s":128749,"e":128755,"w":1},{"s":128756,"e":128764,"w":2},{"s":128765,"e":128991,"w":1},{"s":128992,"e":129003,"w":2},{"s":129004,"e":129291,"w":1},{"s":129292,"e":129338,"w":2},{"s":129339,"e":129339,"w":1},{"s":129340,"e":129349,"w":2},{"s":129350,"e":129350,"w":1},{"s":129351,"e":129400,"w":2},{"s":129401,"e":129401,"w":1},{"s":129402,"e":129483,"w":2},{"s":129484,"e":129484,"w":1},{"s":129485,"e":129535,"w":2},{"s":129536,"e":129647,"w":1},{"s":129648,"e":129652,"w":2},{"s":129653,"e":129655,"w":1},{"s":129656,"e":129658,"w":2},{"s":129659,"e":129663,"w":1},{"s":129664,"e":129670,"w":2},{"s":129671,"e":129679,"w":1},{"s":129680,"e":129704,"w":2},{"s":129705,"e":129711,"w":1},{"s":129712,"e":129718,"w":2},{"s":129719,"e":129727,"w":1},{"s":129728,"e":129730,"w":2},{"s":129731,"e":129743,"w":1},{"s":129744,"e":129750,"w":2},{"s":129751,"e":129791,"w":1}] ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_START_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
Module.prepare( '/node_modules/babel-tower/node_modules/string-kit/lib/latinize-map.json' , '/node_modules/babel-tower/node_modules/string-kit' , null , ( module , exports , require , __dirname , __filename ) => {
module.exports = {"߀":"0","́":""," ":" ","Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ɓ":"B","ｃ":"C","Ⓒ":"C","Ｃ":"C","Ꜿ":"C","Ḉ":"C","Ç":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ɗ":"D","Ɖ":"D","ᴅ":"D","Ꝺ":"D","Ð":"Dh","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","ɛ":"E","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","ᴇ":"E","ꝼ":"F","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","ɢ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","ȷ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","ϻ":"M","Ꞥ":"N","Ƞ":"N","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ɲ":"N","Ꞑ":"N","ᴎ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Œ":"OE","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Þ":"Th","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ɑ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","Ƃ":"b","ⓒ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","C":"c","Ć":"c","Ĉ":"c","Ċ":"c","Č":"c","Ƈ":"c","Ȼ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","Ƌ":"d","Ꮷ":"d","ԁ":"d","Ɦ":"d","ð":"dh","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ﬀ":"ff","ﬁ":"fi","ﬂ":"fl","ﬃ":"ffi","ﬄ":"ffl","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ꝿ":"g","ᵹ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ɭ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ԉ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ɔ":"o","ᴑ":"o","œ":"oe","ƣ":"oi","ꝏ":"oo","ȣ":"ou","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ρ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ʂ":"s","ß":"ss","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","þ":"th","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z"} ;
} ) ;
BROTHERHOOD_END_MODULE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
BROTHERHOOD_END_PACKAGE('oAa5dJYgPxeK9PKQEM02RpKHorZTF3cV');
const process = {
	browser: true ,
	title: 'browser' ,
	env: {} ,
	argv: [] ,
	version: '' ,
	versions: {} ,
	listeners: () => [] ,
	cwd: () => '/' ,
	chdir: () => { throw new Error( 'process.chdir is not supported' ) ; } ,
	umask: () => 0 ,
	binding: () => { throw new Error( 'process.binding is not supported' ) ; } ,
	nextTick: fn => setTimeout( fn , 0 )
} ;
[
	'on' ,
	'once' ,
	'off' ,
	'addListener' ,
	'removeListener' ,
	'removeAllListeners' ,
	'emit' ,
	'prependListener' ,
	'prependOnceListener'
].forEach( p => process[ p ] = () => undefined ) ;
const Buffer = Module.require( 'buffer' , '/[core]' ).Buffer ;
Module.main.load() ;
export default Module.main.exports ;
