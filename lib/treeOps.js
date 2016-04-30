/*
	Copyright (c) 2015 - 2016 Cédric Ronvel 
	
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



// Load modules
var tree = require( 'tree-kit' ) ;



// Create and export the module
var treeOps = {} ;
module.exports = treeOps ;



// Stack multiple object structure into one new object, do not apply operators
treeOps.stack = function stack()
{
	var i , iMax = arguments.length ,  stacked = {} ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		if ( ! arguments[ i ] || typeof arguments[ i ] !== 'object' || Array.isArray( arguments[ i ] ) ) { continue ; }
		stackInto( arguments[ i ] , stacked ) ;
	}
	
	return stacked ;
} ;



// Stack multiple object structure into the first object, do not apply operators
treeOps.autoStack = function autoStack( stacked )
{
	if ( ! stacked || typeof stacked !== 'object' || Array.isArray( stacked ) ) { return stacked ; }
	
	var i , iMax = arguments.length ;
	
	for ( i = 1 ; i < iMax ; i ++ )
	{
		if ( ! arguments[ i ] || typeof arguments[ i ] !== 'object' || Array.isArray( arguments[ i ] ) ) { continue ; }
		stackInto( arguments[ i ] , stacked ) ;
	}
	
	return stacked ;
} ;



// Stack the source into the target, do not apply operators
function stackInto( source , target )
{
	var i , iMax , parts , keys = Object.keys( source ) ;
	
	iMax = keys.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		parts = treeOps.splitOpKey( keys[ i ] ) ;
		treeOps.operators[ parts.operator ].stack( source , target , keys[ i ] , parts.baseKey ) ;
	}
}



// Reduce a previously stacked (or not) object by applying operators.
// In case of multiple arguments, they are first “autoStacked” into the first one before the first one is reduced.
// Applied operators are removed.
treeOps.reduce = function reduce( object )
{
	if ( ! object || typeof object !== 'object' || Array.isArray( object ) ) { return object ; }
	
	if ( arguments.length > 1 ) { treeOps.autoStack.apply( undefined , arguments ) ; }
	
	return reduceObject( object , [ object ] ) ;
} ;



// Reduce one object
function reduceObject( object , objectList )
{
	var i , iMax , parts , ops = [] , keys = Object.keys( object ) ;
	
	iMax = keys.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		parts = treeOps.splitOpKey( keys[ i ] ) ;
		parts.priority = treeOps.operators[ parts.operator ].priority ;
		ops.push( parts ) ;
	}
	
	
	// Sort all operations, so they will be applied in the correct order
	ops.sort( ( a , b ) => a.priority - b.priority ) ;
	
	iMax = ops.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		treeOps.operators[ ops[ i ].operator ].reduce( object , ops[ i ].key , ops[ i ].baseKey , objectList ) ;
	}
	
	return object ;
}



// Those operators do not need to be inside ()
treeOps.reservedOperators = {
//	'@': true ,	// needed?
	'+': true ,
	'-': true ,
	'*': true ,
	'/': true ,
	'*>': true ,
	'<*': true ,
	'+>': true ,
	'<+': true ,
	'*+>': true ,
//	'<+*': true ,
} ;



treeOps.reservedKeyStart = {
//	'@': true ,	// needed?
	'(': true ,
	'+': true ,
	'-': true ,
	'*': true ,
	'/': true ,
	'<' : true ,
	'?': true ,
	'!': true ,
	'^': true ,
} ;




// NOTE: it MUST be efficient, hence the strange switch-case hell

treeOps.splitOpKey = function splitOpKey( key )
{
	var i , iMax ;
	
	switch ( key[ 0 ] )
	{
		/*
		case '$' :
			return { operator: '$' , baseKey: key.slice( 1 ) , key: key } ;
		*/
		case '+' :
			switch ( key[ 1 ] )
			{
				case '>' :
					return { operator: '+>' , baseKey: key.slice( 2 ) , key: key } ;
				default :
					return { operator: '+' , baseKey: key.slice( 1 ) , key: key } ;
			}
			break ;	// just to please jshint
		case '-' :
			return { operator: '-' , baseKey: key.slice( 1 ) , key: key } ;
		case '*' :
			switch ( key[ 1 ] )
			{
				case '>' :
					return { operator: '*>' , baseKey: key.slice( 2 ) , key: key } ;
				case '+' :
					switch ( key[ 2 ] )
					{
						case '>' :
							return { operator: '*+>' , baseKey: key.slice( 3 ) , key: key } ;
						default :
							return { operator: '*' , baseKey: key.slice( 1 ) , key: key } ;
					}
					break ;	// just to please jshint
				default :
					return { operator: '*' , baseKey: key.slice( 1 ) , key: key } ;
			}
			break ;	// just to please jshint
		case '/' :
			return { operator: '/' , baseKey: key.slice( 1 ) , key: key } ;
		case '<' :
			switch ( key[ 1 ] )
			{
				case '*' :
					return { operator: '<*' , baseKey: key.slice( 2 ) , key: key } ;
				case '+' :
					return { operator: '<+' , baseKey: key.slice( 2 ) , key: key } ;
				case '^' :
					return { operator: '<^' , baseKey: key.slice( 2 ) , key: key } ;
				default :
					return { operator: '' , baseKey: key , key: key } ;
			}
			break ;	// just to please jshint
		case '^' :
			return { operator: '^' , baseKey: key.slice( 1 ) , key: key } ;
		case '(' :
			for ( i = 0 , iMax = key.length ; i < iMax && key[ i ] !== ')' ; i ++ ) {} // jshint ignore:line
			return { operator: key.slice( 1 , i ) , baseKey: key.slice( i + 1 ) , key: key } ;
		//case '@' :
		//	/!\ Typically, this should never been encountered here, but solved at file loading
		//	return { operator: '@' , baseKey: key.slice( 1 ) , key: key } ;
		default:
			return { operator: '' , baseKey: key , key: key } ;
	}
} ;



function assignObject( target , source )
{
	var k ;
	
	for ( k in target ) { delete target[ k ] ; }
	for ( k in source ) { target[ k ] = source[ k ] ; }
}



/*
ASCII: &~#{}()[]-|`\_^°+=$%><*?,;.:/!
ASCII 8bits: §«»

+ add
- substract
* multuply
/ divide
+> append (string, array)
<+ prepend (string, array)
*> merge after (object), i.e. overwrite
<* merge before (object), i.e. do not overwrite
*+> merge after (object), i.e. overwrite, use concat after when possible

Not implemented yet / not specified:
<+* merge before (object), i.e. do not overwrite, use concat before when possible
$ global reference/link
?: set if it does not exist (define)?
!: set if it exists (rewrite)?
! delete?
_ gettext?
^ pow
<^ exp (the arg is the base, the existing key is the exponent)
*/

treeOps.operators = {} ;

var priority = 0 ;

// The order matter: it is sorted from the highest to the lowest priority

// key: the full key, prepended by the operator
// baseKey: the key without the operator

// Combine (subtree) before
treeOps.operators['<*'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		target[ key ] = treeOps.stack( source[ key ] , target[ key ] ) ;
		
		/* old behaviour: stack apply deep tree operation
		if ( baseKey )
		{
			target[ baseKey ] = treeOps.stack( source[ key ] , target[ baseKey ] ) ;
		}
		else
		{
			assignObject( target , treeOps.stack( source[ key ] , target ) ) ;
		}
		//*/
	} ,
	reduce: function( target , key , baseKey , objectList ) {
		var subtree = target[ key ] ;
		delete target[ key ] ;
		
		if ( baseKey )
		{
			target[ baseKey ] = treeOps.reduce( subtree , target[ baseKey ] ) ;
		}
		else
		{
			subtree = treeOps.reduce( subtree , target ) ;
			assignObject( target , subtree ) ;
		}
	}
} ;

// Combine (subtree) after
treeOps.operators['*>'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		target[ key ] = treeOps.stack( target[ key ] , source[ key ] ) ;
		
		/* old behaviour: stack apply deep tree operation
		if ( baseKey ) { target[ baseKey ] = treeOps.stack( target[ baseKey ] , source[ key ] ) ; }
		else { treeOps.autoStack( target , source[ key ] ) ; }
		//*/
	} ,
	reduce: function( target , key , baseKey , objectList ) {
		var subtree = target[ key ] ;
		delete target[ key ] ;
		
		if ( baseKey ) { target[ baseKey ] = treeOps.reduce( target[ baseKey ] , subtree ) ; }
		else { treeOps.reduce( target , subtree ) ; }
	}
} ;

treeOps.operators[''] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		if ( source[ baseKey ] && typeof source[ baseKey ] === 'object' && ! Array.isArray( source[ baseKey ] ) )
		{
			if ( ! target[ baseKey ] || typeof target[ baseKey ] !== 'object' || Array.isArray( target[ baseKey ] ) )
			{
				//target[ baseKey ] = Array.isArray( source[ baseKey ] ) ? [] : {} ;
				target[ baseKey ] = {} ;
			}
			
			stackInto( source[ baseKey ] , target[ baseKey ] ) ;
		}
		else
		{
			target[ baseKey ] = source[ baseKey ] ;
		}
	} ,
	reduce: function( target , key , baseKey , objectList ) {
		if ( target[ baseKey ] && typeof target[ baseKey ] === 'object' && ! Array.isArray( target[ baseKey ] ) && objectList.indexOf( target[ baseKey ] ) === -1 )
		{
			objectList.push( target[ baseKey ] ) ;
			reduceObject( target[ baseKey ] , objectList ) ;
		}
	}
} ;

// Concat before / prepend
treeOps.operators['<+'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		if ( source[ key ] !== undefined )
		{
			if ( ! Array.isArray( source[ key ] ) ) { source[ key ] = [ source[ key ] ] ; }
			
			if ( ! Array.isArray( target[ key ] ) )
			{
				if ( target[ key ] === undefined ) { target[ key ] = [] ; }
				else { target[ key ] = [ target[ key ] ] ; }
			}
			
			target[ key ] = source[ key ].concat( target[ key ] ) ;
		}
	} ,
	reduce: function( target , key , baseKey , objectList ) {
		if ( baseKey && target[ key ] !== undefined )
		{
			if ( ! Array.isArray( target[ key ] ) ) { target[ key ] = [ target[ key ] ] ; }
			
			if ( ! Array.isArray( target[ baseKey ] ) )
			{
				if ( target[ baseKey ] === undefined ) { target[ baseKey ] = [] ; }
				else { target[ baseKey ] = [ target[ baseKey ] ] ; }
			}
			
			target[ baseKey ] = target[ key ].concat( target[ baseKey ] ) ;
		}
		
		delete target[ key ] ;
	}
} ;

// Concat after / append
treeOps.operators['+>'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		if ( source[ key ] !== undefined )
		{
			if ( ! Array.isArray( source[ key ] ) ) { source[ key ] = [ source[ key ] ] ; }
			
			if ( ! Array.isArray( target[ key ] ) )
			{
				if ( target[ key ] === undefined ) { target[ key ] = [] ; }
				else { target[ key ] = [ target[ key ] ] ; }
			}
			
			target[ key ] = target[ key ].concat( source[ key ] ) ;
		}
	} ,
	reduce: function( target , key , baseKey , objectList ) {
		if ( baseKey && target[ key ] !== undefined )
		{
			if ( ! Array.isArray( target[ key ] ) ) { target[ key ] = [ target[ key ] ] ; }
			
			if ( ! Array.isArray( target[ baseKey ] ) )
			{
				if ( target[ baseKey ] === undefined ) { target[ baseKey ] = [] ; }
				else { target[ baseKey ] = [ target[ baseKey ] ] ; }
			}
			
			target[ baseKey ] = target[ baseKey ].concat( target[ key ] ) ;
		}
		
		delete target[ key ] ;
	}
} ;

treeOps.operators['/'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		var aliasKey = '*' + baseKey ;
		
		if ( isNaN( source[ key ] ) ) { return ; }
		
		if ( isNaN( target[ aliasKey ] ) ) { target[ aliasKey ] = 1 / ( + source[ key ] ) ; }
		else { target[ aliasKey ] = ( + target[ aliasKey ] ) / ( + source[ key ] ) ; }
	} ,
	reduce: function( target , key , baseKey ) {
		if ( isNaN( target[ baseKey ] ) )
		{
			var aliasKey = '*' + baseKey ;
			
			if ( isNaN( target[ aliasKey ] ) ) { target[ aliasKey ] = 1 / ( + target[ key ] ) ; }
			else { target[ aliasKey ] = ( + target[ aliasKey ] ) / ( + target[ key ] ) ; }
			
			delete target[ key ] ;
			return ;
		}
		
		if ( isNaN( target[ baseKey ] ) || isNaN( target[ key ] ) ) { return ; }
		target[ baseKey ] = ( + target[ baseKey ] ) / ( + target[ key ] ) ;
		delete target[ key ] ;
	}
} ;

treeOps.operators['*'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		if ( isNaN( source[ key ] ) ) { return ; }
		
		if ( isNaN( target[ key ] ) ) { target[ key ] = ( + source[ key ] ) ; }
		else { target[ key ] = ( + target[ key ] ) * ( + source[ key ] ) ; }
	} ,
	reduce: function( target , key , baseKey ) {
		if ( isNaN( target[ baseKey ] ) || isNaN( target[ key ] ) ) { return ; }
		target[ baseKey ] = ( + target[ baseKey ] ) * ( + target[ key ] ) ;
		delete target[ key ] ;
	}
} ;

treeOps.operators['-'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		var aliasKey = '+' + baseKey ;
		target[ aliasKey ] = ( + target[ aliasKey ] || 0 ) - ( + source[ key ] || 0 ) ;
	} ,
	reduce: function( target , key , baseKey ) {
		if ( target[ baseKey ] === undefined )
		{
			var aliasKey = '+' + baseKey ;
			target[ aliasKey ] = ( + target[ aliasKey ] || 0 ) - ( + target[ key ] || 0 ) ;
			delete target[ key ] ;
			return ;
		}
		
		target[ baseKey ] = ( + target[ baseKey ] || 0 ) - ( + target[ key ] || 0 ) ;
		delete target[ key ] ;
	}
} ;

treeOps.operators['+'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		target[ key ] = ( + target[ key ] || 0 ) + ( + source[ key ] || 0 ) ;
	} ,
	reduce: function( target , key , baseKey ) {
		if ( target[ baseKey ] === undefined ) { return ; }
		target[ baseKey ] = ( + target[ baseKey ] || 0 ) + ( + target[ key ] || 0 ) ;
		delete target[ key ] ;
	}
} ;



/*
The link mechanism is more complicated: it needs multipass at whole-tree level

treeOps.operators['$'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		target[ key ] = source[ key ] ;
	} ,
	multipass: true ,
	reduce: function( target , key , baseKey , root ) {
		
		var parts , source = root ;
		
		if ( target[ key ] ) { source = tree.path.get( root , target[ key ] ) ; }
		
		target[ baseKey ] = source ;
		delete target[ key ] ;
		
		// Multipass
		parts = treeOps.splitOpKey( baseKey ) ;
		parts.priority = treeOps.operators[ parts.operator ].priority ;
		
		return parts ;
	}
} ;
*/
