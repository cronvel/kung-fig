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



function IncludeRef( parent , key , follow , directory , refString , required = false , merge = false ) {
	this.parent = parent ;
	this.key = key ;
	this.follow = !! follow ;
	this.directory = directory ;
	this.required = !! required ;
	this.merge = merge || false ;	// possible values: false (replace the value), after (replace existing key), before (only unexisting keys)
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

