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



var Babel = require( 'babel-tower' ) ;
//var Dynamic = require( './Dynamic.js' ) ;

function TemplateUnit( template ) { return TemplateUnit.create( template ) ; }
TemplateUnit.prototype = Object.create( Babel.Sentence.prototype ) ;
TemplateUnit.prototype.constructor = TemplateUnit ;

module.exports = TemplateUnit ;

TemplateUnit.prototype.__prototypeUID__ = 'kung-fig/TemplateUnit' ;
TemplateUnit.prototype.__prototypeVersion__ = require( '../package.json' ).version ;
TemplateUnit.prototype.__isDynamic__ = true ;
TemplateUnit.prototype.__isApplicable__ = false ;



TemplateUnit.prototype.toString = function toString()
{
	if ( ! this.__isDynamic__ ) { return this.template ; }
	return this.toStringKFG.apply( this , arguments ) ;
} ;



TemplateUnit.prototype.getRecursiveFinalValue =
TemplateUnit.prototype.getFinalValue =
TemplateUnit.prototype.getValue = function getValue( ctx )
{
	return this.__isDynamic__ ? this.toStringKFG( ctx ) : this ;
} ;



TemplateUnit.prototype.apply = function apply( ctx )
{
	return this.__isApplicable__ ? this.toStringKFG( ctx ) : this ;
} ;



TemplateUnit.create = function create( template )
{
	var self = Object.create( TemplateUnit.prototype ) ;
	
	if ( typeof template !== 'string' ) { template = '' ; }
	
	Babel.Sentence.create( template , Babel.default , self ) ;
	
	return self ;
} ;


