/*
	Copyright (c) 2015 Cédric Ronvel 
	
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



// Create and export the module
var treeOps = {} ;
module.exports = treeOps ;





treeOps.stack = function stack()
{
	var i , iMax = arguments.length ,  stacked = {} ;
	
	for ( i = 0 ; i < iMax ; i ++ ) { stackInto( arguments[ i ] , stacked ) ; }
	
	return stacked ;
} ;



function stackInto( source , target )
{
	var i , iMax , parts , keys = Object.keys( source ) ;
	
	iMax = keys.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		parts = splitKey( keys[ i ] ) ;
		treeOps.operators[ parts.operator ].stack( source , target , keys[ i ] , parts.baseKey ) ;
	}
}



treeOps.reduce = function reduce( object )
{
	if ( arguments.length > 1 ) { object = treeOps.stack.apply( undefined , arguments ) ; }
	
	return reduceObject( object ) ;
} ;



function reduceObject( object )
{
	var i , iMax , parts , ops = [] , keys = Object.keys( object ) ;
	
	iMax = keys.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		parts = splitKey( keys[ i ] ) ;
		
		if ( parts.operator )
		{
			parts.priority = treeOps.operators[ parts.operator ].priority ;
			ops.push( parts ) ;
		}
	}
	
	
	// Sort all operations, so they will be applied in the correct order
	ops.sort( compareOps ) ;
	
	
	iMax = ops.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		treeOps.operators[ ops[ i ].operator ].reduce( object , ops[ i ].key , ops[ i ].baseKey ) ;
	}
	
	return object ;
}



// NOTE: it MUST be efficient, hence the strange switch-case hell

function splitKey( key )
{
	switch ( key[ 0 ] )
	{
		case '+' :
			return { operator: '+' , baseKey: key.slice( 1 ) , key: key } ;
		case '-' :
			return { operator: '-' , baseKey: key.slice( 1 ) , key: key } ;
		case '*' :
			return { operator: '*' , baseKey: key.slice( 1 ) , key: key } ;
		case '/' :
			return { operator: '/' , baseKey: key.slice( 1 ) , key: key } ;
		case ':' :
			return { operator: ':' , baseKey: key.slice( 1 ) , key: key } ;
		default:
			return { operator: '' , baseKey: key , key: key } ;
	}
}



function compareOps( a , b ) { return a.priority - b.priority ; } 



treeOps.operators = {} ;

var priority = 0 ;

// The order matter: it is sorted from the highest to the lowest priority

treeOps.operators[''] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		target[ baseKey ] = source[ baseKey ] ;
	} ,
	reduce: function() {}
} ;

treeOps.operators[':'] = {
	priority: priority ++ ,
	stack: function( source , target , key , baseKey ) {
		target[ baseKey ] = source[ baseKey ] ;
	} ,
	reduce: function( target , key , baseKey ) {
		target[ baseKey ] = target[ key ] ;
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



