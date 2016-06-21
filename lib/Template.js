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

function Template( template , proxy ) { return Template.create( template , proxy ) ; }
module.exports = Template ;



Template.prototype = Object.create( Babel.Sentence.prototype ) ;
Template.prototype.constructor = Template ;
Template.prototype.__prototypeUID__ = 'kung-fig/Template' ;
Template.prototype.__prototypeVersion__ = require( '../package.json' ).version ;



Template.create = function create( template , proxy )
{
	var self = Object.create( Template.prototype ) ;
	
	if ( typeof template !== 'string' ) { template = '' ; }
	
	if ( proxy )
	{
		if ( ! proxy.babel ) { proxy.babel = Babel.default ; }
		Babel.Sentence.createWithIndirection( template , proxy , self ) ;
	}
	else
	{
		Babel.Sentence.create( template , Babel.default , self ) ;
	}
	
	return self ;
} ;

