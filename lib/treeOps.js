/*
	Kung Fig
	
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
//var tree = require( 'tree-kit' ) ;



// Create and export the module
var treeOps = {} ;
module.exports = treeOps ;



// Reduce then transform to object
treeOps.reduceToObject = function reduceToObject( object )
{
	return treeOps.toObject( treeOps.reduce.apply( this , arguments ) ) ;
} ;



// Remove all treeOps mark and operators, transform to a regular object with values
treeOps.toObject = function toObject( object )
{
	if ( ! isPlainObject( object ) ) { return object ; }
	
	var i , iMax , parts , value ,
		output = {} ,
		keys = Object.keys( object ) ;
	
	for ( i = 0 , iMax = keys.length ; i < iMax ; i ++ )
	{
		parts = this.splitOpKey( keys[ i ] ) ;
		
		// Skip operators
		if ( parts.operator ) { continue ; }
		
		value = object[ keys[ i ] ] ;
		
		if ( isPlainObject( value ) ) { value = treeOps.toObject( value ) ; }
		
		output[ parts.baseKey ] = value ;
	}
	
	return output ;
} ;



// Stack multiple object structure into one new object, do not apply operators
treeOps.stack = function stack()
{
	var i , iMax = arguments.length ,  stacked = {} ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		//if ( ! arguments[ i ] || typeof arguments[ i ] !== 'object' || Array.isArray( arguments[ i ] ) ) { continue ; }
		if ( ! isPlainObject( arguments[ i ] ) ) { continue ; }
		this.stackInto( arguments[ i ] , stacked ) ;
	}
	
	return stacked ;
} ;



// Stack multiple object structure into the first object, do not apply operators
treeOps.autoStack = function autoStack( stacked )
{
	//if ( ! stacked || typeof stacked !== 'object' || Array.isArray( stacked ) ) { return stacked ; }
	if ( ! isPlainObject( stacked ) ) { return stacked ; }
	
	var i , iMax = arguments.length ;
	
	for ( i = 1 ; i < iMax ; i ++ )
	{
		//if ( ! arguments[ i ] || typeof arguments[ i ] !== 'object' || Array.isArray( arguments[ i ] ) ) { continue ; }
		if ( ! isPlainObject( arguments[ i ] ) ) { continue ; }
		this.stackInto( arguments[ i ] , stacked ) ;
	}
	
	return stacked ;
} ;



// Stack the source into the target, do not apply operators
treeOps.stackInto = function stackInto( source , target )
{
	var i , iMax , parts , foreachKey , nonForeachKey , key , keys = Object.keys( source ) ;
	
	iMax = keys.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		key = keys[ i ] ;
		
		// Skip empty keys, avoid infinite recursions, also the empty operator is not allowed on the root object
		if ( ! key ) { continue ; }
		
		parts = this.splitOpKey( key ) ;
		
		if ( parts.foreach )
		{
			if ( Array.isArray( source[ key ] ) )
			{
				nonForeachKey = key[ 0 ] === '(' ?
					'(' + key.slice( 2 ) :
					key.slice( 1 ) ;
				
				//console.log( "source is array, operator:" , parts.operator , nonForeachKey , target[ nonForeachKey ] ) ;
				if ( target[ nonForeachKey ] !== undefined )
				{
					//console.log( "target non-foreach operator exist" ) ;
					if ( Array.isArray( target[ key ] ) ) { target[ key ].push( target[ nonForeachKey ] ) ; }
					else { target[ key ] = [ target[ nonForeachKey ] ] ; }
					delete target[ nonForeachKey ] ;
				}
				
				if ( Array.isArray( target[ key ] ) ) { target[ key ] = target[ key ].concat( source[ key ] ) ; }
				else { target[ key ] = source[ key ] ; }
			}
			
			continue ;
		}
		
		foreachKey = key[ 0 ] === '(' ?
			'(#' + key.slice( 1 ) :
			'#' + key ;
		
		if ( Array.isArray( target[ foreachKey ] ) )
		{
			if ( target[ key ] === undefined )
			{
				target[ foreachKey ].push( source[ key ] ) ;
			}
			else
			{
				target[ foreachKey ] = target[ foreachKey ].concat( [ target[ key ] , source[ key ] ] ) ;
			}
			
			delete target[ key ] ;
		}
		else if ( target[ key ] === undefined )
		{
			target[ key ] = source[ key ] ;
		}
		else
		{
			target[ foreachKey ] = [ target[ key ] , source[ key ] ] ;
			delete target[ key ] ;
		}
	}
} ;



// Reduce a previously stacked (or not) object by applying operators.
// Do not modify the original object, create a brand new one.
// In case of multiple arguments, they are first “stacked” into a recipient object.
// Applied operators are removed.
treeOps.reduce = function reduce( object )
{
	//if ( ! object || typeof object !== 'object' || Array.isArray( object ) ) { return object ; }
	if ( ! isPlainObject( object ) ) { return object ; }
	
	object = this.stack.apply( this , arguments ) ;
	
	//console.log( "reduce after autoStack():" , require('string-kit').inspect( {style:'color',depth:10},object ) ) ;
	return this.reduceObject( object , [ object ] ) ;
} ;



// Reduce a previously stacked (or not) object by applying operators.
// In case of multiple arguments, they are first “autoStacked” into the first one before the first one is reduced.
// Applied operators are removed.
treeOps.autoReduce = function autoReduce( object )
{
	//if ( ! object || typeof object !== 'object' || Array.isArray( object ) ) { return object ; }
	if ( ! isPlainObject( object ) ) { return object ; }
	
	if ( arguments.length > 1 ) { this.autoStack.apply( this , arguments ) ; }
	
	//console.log( "autoReduce after autoStack():" , require('string-kit').inspect( {style:'color',depth:10},object ) ) ;
	return this.reduceObject( object , [ object ] ) ;
} ;



// Reduce one object
treeOps.reduceObject = function reduceObject( object , antiCircularObjectList )
{
	var i , iMax , parts , ops = [] , operands , baseKey , key , keys = Object.keys( object ) ;
	
	iMax = keys.length ;
	
	// First, list all operations
	for ( i = 0 ; i < iMax ; i ++ )
	{
		// Skip empty keys, avoid infinite recursions, also the empty operator is not allowed on the root object.
		// Also skip property with undefined value, undefined is the same as no property in the treeOps world.
		if ( ! keys[ i ] || object[ keys[ i ] ] === undefined ) { delete object[ keys[ i ] ] ; continue ; }
		
		parts = this.splitOpKey( keys[ i ] ) ;
		//console.log( "'" + parts.operator + "'" ) ;
		parts.rank = this.operators[ parts.operator ].rank ;
		ops.push( parts ) ;
	}
	
	// Sort all operations, so they will be applied in the correct order
	ops.sort( sortOperations ) ;
	
	// Apply anything
	for ( i = 0 , iMax = ops.length ; i < iMax ; i ++ )
	{
		baseKey = ops[ i ].baseKey ;
		key = ops[ i ].key ;
		
		if ( ! baseKey )
		{
			// We want to combine with the root object, create a temporary clone
			
			//console.log( ">>> no basekey!" ) ;
			object[''] = {} ;
			this.assignObject( object[''] , object ) ;
			
			// Delete the operator about to be applied to from the clone, delete self-reference
			delete object[''][ key ] ;
			delete object[''][''] ;
		}
		
		if ( ops[ i ].foreach )
		{
			if ( ! Array.isArray( object[ key ] ) )
			{
				// This is a bad foreach key, due to a userland bad entry: remove that key and move forward.
				delete object[ key ] ;
				continue ;
			}
			
			object[ baseKey ] = this.operators[ ops[ i ].operator ].reduce.call(
				this ,
				object[ baseKey ] ,
				object[ key ]
			) ;
			
			if ( object[ baseKey ] === undefined ) { delete object[ baseKey ] ; }
			
			if ( object[ key ].length === 0 ) { delete object[ key ] ; }
			else if ( object[ key ].length === 1 ) { object[ key.slice( 1 ) ] = object[ key ][ 0 ] ; delete object[ key ] ; }
		}
		else if ( ops[ i ].operator )
		{
			operands = [ object[ key ] ] ;
			
			//console.log( ">>> before" ) ;
			//console.log( ">>> " , ops[ i ].operator ) ;
			object[ baseKey ] = this.operators[ ops[ i ].operator ].reduce.call(
				this ,
				object[ baseKey ] ,
				operands
			) ;
			//console.log( ">>> after" ) ;

			if ( object[ baseKey ] === undefined ) { delete object[ baseKey ] ; }
			
			if ( operands.length === 0 ) { delete object[ key ] ; }
		}
		
		if (
			//object[ baseKey ] && typeof object[ baseKey ] === 'object' && ! Array.isArray( object[ baseKey ] ) &&
			isPlainObject( object[ baseKey ] ) &&
			antiCircularObjectList.indexOf( object[ baseKey ] ) === -1
		)
		{
			antiCircularObjectList.push( object[ baseKey ] ) ;
			this.reduceObject( object[ baseKey ] , antiCircularObjectList ) ;
		}
		
		if ( ! baseKey )
		{
			// We have combined with the root object, assign the clone to the root
			
			//if ( object[''] && typeof object[''] === 'object' && ! Array.isArray( object[''] ) )
			if ( isPlainObject( object[''] ) )
			{
				// The object ref has changed, but we cannot blindly assign object=object['']
				// because the parent object will still refer to the old one
				this.assignObject( object , object[''] ) ;
			}
			
			delete object[''] ;
			
			// Operations on the root object are typically unsafe: some remaining operations may had gone
			// and some new one should be created.
			// We have to run again reduceObject() for the whole newly assigned object.
			
			return this.reduceObject( object , antiCircularObjectList ) ;
		}
	}
	
	return object ;
} ;



function sortOperations( a , b )
{
	// First, the operator rank is checked,
	// then root object operations come last,
	// and finally 'foreach' operations come first
	return ( a.rank - b.rank ) ||
		( ( a.baseKey ? 0 : 1 ) - ( b.baseKey ? 0 : 1 ) ) ||
		( ( a.foreach ? 0 : 1 ) - ( b.foreach ? 0 : 1 ) ) ;
}



function isPlainObject( value )
{
	var proto ;
	
	return value &&
		typeof value === 'object' &&
		( ( proto = Object.getPrototypeOf( value ) ) === Object.prototype || proto === null ) ;
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
	'*>>': true ,
	'<<*': true ,
	'+>': true ,
	'<+': true
} ;

// Expand them all with the 'foreach' prefix (#)
Object.keys( treeOps.reservedOperators ).forEach( function( k ) {
	treeOps.reservedOperators[ '#' + k ] = true ;
} ) ;



treeOps.reservedKeyStart = {
//	'@': true ,	// needed?
	'#': true ,
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
	var i , iMax , opkey = key , splitted , foreach = false ;
	
	if ( opkey[ 0 ] === '(' )
	{
		opkey = key.slice( 1 ) ;
		
		if ( opkey[ 0 ] === '#' )
		{
			foreach = true ;
			opkey = opkey.slice( 1 ) ;
		}
		
		for ( i = 0 , iMax = opkey.length ; i < iMax && opkey[ i ] !== ')' ; i ++ ) {} // jshint ignore:line
		
		splitted = { operator: opkey.slice( 0 , i ) , baseKey: opkey.slice( i + 1 ) , key: key } ;
	}
	else
	{
		if ( opkey[ 0 ] === '#' )
		{
			foreach = true ;
			opkey = opkey.slice( 1 ) ;
		}
		
		switch ( opkey[ 0 ] )
		{
			/*
			case '$' :
				splitted = { operator: '$' , baseKey: opkey.slice( 1 ) , key: key } ;
				break ;
			*/
			case '+' :
				switch ( opkey[ 1 ] )
				{
					case '>' :
						splitted = { operator: '+>' , baseKey: opkey.slice( 2 ) , key: key } ;
						break ;
					default :
						splitted = { operator: '+' , baseKey: opkey.slice( 1 ) , key: key } ;
				}
				break ;
			case '-' :
				splitted = { operator: '-' , baseKey: opkey.slice( 1 ) , key: key } ;
				break ;
			case '*' :
				switch ( opkey[ 1 ] )
				{
					case '>' :
						switch ( opkey[ 2 ] )
						{
							case '>' :
								splitted = { operator: '*>>' , baseKey: opkey.slice( 3 ) , key: key } ;
								break ;
							default :
								splitted = { operator: '*>' , baseKey: opkey.slice( 2 ) , key: key } ;
						}
						break ;
					default :
						splitted = { operator: '*' , baseKey: opkey.slice( 1 ) , key: key } ;
				}
				break ;
			case '/' :
				splitted = { operator: '/' , baseKey: opkey.slice( 1 ) , key: key } ;
				break ;
			case '<' :
				switch ( opkey[ 1 ] )
				{
					case '<' :
						switch ( opkey[ 2 ] )
						{
							case '*' :
								splitted = { operator: '<<*' , baseKey: opkey.slice( 3 ) , key: key } ;
								break ;
							default :
								splitted = { operator: '' , baseKey: opkey , key: key } ;
						}
						break ;
					case '*' :
						splitted = { operator: '<*' , baseKey: opkey.slice( 2 ) , key: key } ;
						break ;
					case '+' :
						splitted = { operator: '<+' , baseKey: opkey.slice( 2 ) , key: key } ;
						break ;
					case '^' :
						splitted = { operator: '<^' , baseKey: opkey.slice( 2 ) , key: key } ;
						break ;
					default :
						splitted = { operator: '' , baseKey: opkey , key: key } ;
				}
				break ;
			case '^' :
				splitted = { operator: '^' , baseKey: opkey.slice( 1 ) , key: key } ;
				break ;
			//case '@' :
			//	/!\ Typically, this should never been encountered here, but solved at file loading
			//	splitted = { operator: '@' , baseKey: opkey.slice( 1 ) , key: key } ;
			default:
				splitted = { operator: '' , baseKey: opkey , key: key } ;
		}
	}
	
	splitted.foreach = foreach ;
	splitted.fullOperator = foreach ? '#' + splitted.operator : splitted.operator ;
	
	return splitted ;
} ;



treeOps.assignObject = function assignObject( target , source )
{
	var k ;
	
	for ( k in target ) { delete target[ k ] ; }
	for ( k in source ) { target[ k ] = source[ k ] ; }
} ;



/*
ASCII: &~#{}()[]-|`\_^°+=$%><*?,;.:/!
ASCII 8bits: §«»

# foreach prefix: the operand is an array, the operator should be applied to each element

+ add
- substract
* multiply
/ divide
+> append (string, array)
<+ prepend (string, array)
*> merge after (object), i.e. overwrite
<* merge before (object), i.e. do not overwrite
*>> merge after, lesser priority
<<* merge before, lesser priority

Not implemented yet / not specified:
*+> merge after (object), i.e. overwrite, use concat after when possible
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

var rank = 0 ;

// The order matter: it is sorted from the highest to the lowest priority

// key: the full key, prepended by the operator
// baseKey: the key without the operator

// Assign operator (aka empty operator)
treeOps.operators[''] = {
	rank: rank ++ ,
	reduce: function( existing , operands ) {
		var i , iMax = operands.length ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if (
				//existing && typeof existing === 'object' && ! Array.isArray( existing ) &&
				//operands[ i ] && typeof operands[ i ] === 'object' && ! Array.isArray( operands[ i ] )
				isPlainObject( existing ) && isPlainObject( operands[ i ] )
			)
			{
				// Both are object: autoReduce
				this.autoReduce( existing , operands[ i ] ) ;
			}
			else
			{
				// One of them is not an object: assign
				existing = operands[ i ] ;
			}
		}
		
		operands.length = 0 ;
		return existing ;
	}
} ;

// Combine (subtree) before
treeOps.operators['<*'] = {
	rank: rank ++ ,
	reduce: function( existing , operands ) {
		//if ( ! existing || typeof existing !== 'object' || Array.isArray( existing ) )
		if ( ! isPlainObject( existing ) )
		{
			// Do nothing...
			return existing ;
		}
		
		// We have to reverse things before calling autoReduce()
		var rcpt = {} ;
		var args = [ existing ].concat( operands ).concat( rcpt ).reverse() ;
		
		this.autoReduce.apply( this , args ) ;
		operands.length = 0 ;
		
		return rcpt ;
		
		// Or:
		// this.assignObject( existing , rcpt ) ;
		// return existing ;
	}
} ;

// Combine (subtree) after
treeOps.operators['*>'] = {
	rank: rank ++ ,
	reduce: function( existing , operands ) {
		//if ( ! existing || typeof existing !== 'object' || Array.isArray( existing ) )
		if ( ! isPlainObject( existing ) )
		{
			// Do nothing...
			return existing ;
		}
		
		//console.log( "calling autoReduce with:" , require('string-kit').inspect( {style:'color',depth:10},[ existing ].concat( operands ) ) ) ;
		this.autoReduce.apply( this , [ existing ].concat( operands ) ) ;
		operands.length = 0 ;
		return existing ;
	}
} ;

// Combine (subtree) before, lower priority
treeOps.operators['<<*'] = {
	rank: rank ++ ,
	reduce: treeOps.operators['<*'].reduce
} ;

// Combine (subtree) after, lower priority
treeOps.operators['*>>'] = {
	rank: rank ++ ,
	reduce: treeOps.operators['*>'].reduce
} ;

// Concat before / prepend
treeOps.operators['<+'] = {
	rank: rank ++ ,
	reduce: function( existing , operands ) {
		var i , iMax = operands.length , operand = [] ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( Array.isArray( operands[ i ] ) )
			{
				operand = operands[ i ].concat( operand ) ;
			}
		}
		
		if ( Array.isArray( existing ) )
		{
			existing = operand.concat( existing ) ;
			operands.length = 0 ;
			return existing ;
		}
		else
		{
			operands[ 0 ] = operand ;
			operands.length = 1 ;
			return existing ;
		}
	}
} ;

// Concat after / append
treeOps.operators['+>'] = {
	rank: rank ++ ,
	reduce: function( existing , operands ) {
		var i , iMax = operands.length , operand = [] ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( Array.isArray( operands[ i ] ) )
			{
				operand = operand.concat( operands[ i ] ) ;
			}
		}
		
		if ( Array.isArray( existing ) )
		{
			existing = existing.concat( operand ) ;
			operands.length = 0 ;
			return existing ;
		}
		else
		{
			operands[ 0 ] = operand ;
			operands.length = 1 ;
			return existing ;
		}
	}
} ;

treeOps.operators['/'] = {
	rank: rank ++ ,
	reduce: function( existing , operands ) {
		var i , iMax = operands.length , operand = 1 ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( ! isNaN( operands[ i ] ) )
			{
				operand *= + operands[ i ] ;
			}
		}
		
		if ( ! isNaN( existing ) )
		{
			existing = + existing / operand ;
			operands.length = 0 ;
			return existing ;
		}
		else
		{
			operands[ 0 ] = operand ;
			operands.length = 1 ;
			return existing ;
		}
	}
} ;

treeOps.operators['*'] = {
	rank: rank ++ ,
	reduce: function( existing , operands ) {
		var i , iMax = operands.length , operand = 1 ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( ! isNaN( operands[ i ] ) )
			{
				operand *= + operands[ i ] ;
			}
		}
		
		if ( ! isNaN( existing ) )
		{
			existing = + existing * operand ;
			operands.length = 0 ;
			return existing ;
		}
		else
		{
			operands[ 0 ] = operand ;
			operands.length = 1 ;
			return existing ;
		}
	}
} ;

treeOps.operators['-'] = {
	rank: rank ++ ,
	reduce: function( existing , operands ) {
		var i , iMax = operands.length , operand = 0 ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( ! isNaN( operands[ i ] ) )
			{
				operand += + operands[ i ] ;
			}
		}
		
		if ( ! isNaN( existing ) )
		{
			existing = + existing - operand ;
			operands.length = 0 ;
			return existing ;
		}
		else
		{
			operands[ 0 ] = operand ;
			operands.length = 1 ;
			return existing ;
		}
	}
} ;

treeOps.operators['+'] = {
	rank: rank ++ ,
	reduce: function( existing , operands ) {
		var i , iMax = operands.length , operand = 0 ;
		
		for ( i = 0 ; i < iMax ; i ++ )
		{
			if ( ! isNaN( operands[ i ] ) )
			{
				operand += + operands[ i ] ;
			}
		}
		
		if ( ! isNaN( existing ) )
		{
			existing = + existing + operand ;
			operands.length = 0 ;
			return existing ;
		}
		else
		{
			operands[ 0 ] = operand ;
			operands.length = 1 ;
			return existing ;
		}
	}
} ;



/*
The link mechanism is more complicated: it needs multipass at whole-tree level

treeOps.operators['$'] = {
	rank: rank ++ ,
	multipass: true ,
	reduce: function( target , key , baseKey , root ) {
		
		var parts , source = root ;
		
		if ( target[ key ] ) { source = tree.path.get( root , target[ key ] ) ; }
		
		target[ baseKey ] = source ;
		delete target[ key ] ;
		
		// Multipass
		parts = this.splitOpKey( baseKey ) ;
		parts.rank = this.operators[ parts.operator ].rank ;
		
		return parts ;
	}
} ;
*/
