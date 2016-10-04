# TOC
   - [Expression](#expression)
   - [KFG stringify](#kfg-stringify)
   - [KFG parse](#kfg-parse)
   - [Meta-Tag](#meta-tag)
   - [LabelTag](#labeltag)
   - [VarTag](#vartag)
   - [ClassicTag](#classictag)
   - [ExpressionTag](#expressiontag)
   - [Loading a config](#loading-a-config)
   - [Saving a config](#saving-a-config)
   - [Load meta](#load-meta)
   - [JS modules](#js-modules)
   - [Array references](#array-references)
   - [Template](#template)
   - [Dynamic.getRecursiveFinalValue()](#dynamicgetrecursivefinalvalue)
   - [Ref](#ref)
     - [Get](#ref-get)
     - [Set](#ref-set)
     - [Calling a function](#ref-calling-a-function)
     - [Misc](#ref-misc)
     - [Parser edge cases](#ref-parser-edge-cases)
   - [Operator behaviours](#operator-behaviours)
   - [Complex, deeper test](#complex-deeper-test)
   - [To regular object](#to-regular-object)
   - [Operator extensions](#operator-extensions)
<a name=""></a>
 
<a name="expression"></a>
# Expression
parse/exec a simple expression.

```js
var parsed ;
parsed = Expression.parse( '1 + 2' ) ;
doormen.equals( parsed.getFinalValue() , 3 ) ;
```

parse/exec a simple expression of expression.

```js
var parsed ;

parsed = Expression.parse( '1 + ( 2 + 3 )' ) ;
doormen.equals( parsed.getFinalValue() , 6 ) ;

parsed = Expression.parse( '( 2 + 3 ) + 1' ) ;
doormen.equals( parsed.getFinalValue() , 6 ) ;

parsed = Expression.parse( '( ( 5 + 1 ) + 6 ) + ( 2 + ( 3 + 4 ) )' ) ;
doormen.equals( parsed.getFinalValue() , 21 ) ;
```

parse/exec an expression with operator repetition.

```js
var parsed ;

parsed = Expression.parse( '1 + 2 + 3' ) ;
doormen.equals( parsed.args , [ 1 , 2 , 3 ] ) ;
doormen.equals( parsed.getFinalValue() , 6 ) ;

parsed = Expression.parse( '1 + 2 + 3 + -4' ) ;
doormen.equals( parsed.args , [ 1 , 2 , 3 , -4 ] ) ;
doormen.equals( parsed.getFinalValue() , 2 ) ;
```

parse/exec hypot operator.

```js
var parsed ;

parsed = Expression.parse( 'hypot 3 4' ) ;
doormen.equals( parsed.getFinalValue() , 5 ) ;

parsed = Expression.parse( 'hypot 3 4 5' ) ;
doormen.equals( parsed.getFinalValue() , 7.0710678118654755 ) ;
```

parse/exec avg.

```js
var parsed ;

var ctx = {
	array: [ 2 , 3 , 7 ]
} ;

parsed = Expression.parse( 'avg 3 5 7' ) ;
doormen.equals( parsed.getFinalValue() , 5 ) ;

parsed = Expression.parse( 'avg -4  10 27 3' ) ;
doormen.equals( parsed.getFinalValue() , 9 ) ;

parsed = Expression.parse( 'avg $array' ) ;
doormen.equals( parsed.getFinalValue( ctx ) , 4 ) ;
```

parse/exec three-way.

```js
var parsed ;

parsed = Expression.parse( '1 ??? 4 5 6' ) ;
doormen.equals( parsed.getFinalValue() , 6 ) ;

parsed = Expression.parse( '-1 ??? 4 5 6' ) ;
doormen.equals( parsed.getFinalValue() , 4 ) ;

parsed = Expression.parse( '0 ??? 4 5 6' ) ;
doormen.equals( parsed.getFinalValue() , 5 ) ;
```

parse/exec round/floor/ceil operator.

```js
var parsed ;

parsed = Expression.parse( 'round 4.3' ) ;
doormen.equals( parsed.getFinalValue() , 4 ) ;

parsed = Expression.parse( 'floor 4.3' ) ;
doormen.equals( parsed.getFinalValue() , 4 ) ;

parsed = Expression.parse( 'ceil 4.3' ) ;
doormen.equals( parsed.getFinalValue() , 5 ) ;

parsed = Expression.parse( 'round 4.7' ) ;
doormen.equals( parsed.getFinalValue() , 5 ) ;

parsed = Expression.parse( 'floor 4.7' ) ;
doormen.equals( parsed.getFinalValue() , 4 ) ;

parsed = Expression.parse( 'ceil 4.7' ) ;
doormen.equals( parsed.getFinalValue() , 5 ) ;
```

parse/exec is-set? operators.

```js
var parsed ;

parsed = Expression.parse( '$unknown is-set?' ) ;
doormen.equals( parsed.getFinalValue() , false ) ;

parsed = Expression.parse( '0 is-set?' ) ;
doormen.equals( parsed.getFinalValue() , true ) ;

parsed = Expression.parse( '1 is-set?' ) ;
doormen.equals( parsed.getFinalValue() , true ) ;
```

parse/exec is-real? operators.

```js
var parsed ;

parsed = Expression.parse( '0 is-real?' ) ;
doormen.equals( parsed.getFinalValue() , true ) ;

parsed = Expression.parse( '1 is-real?' ) ;
doormen.equals( parsed.getFinalValue() , true ) ;

parsed = Expression.parse( '1.5 is-real?' ) ;
doormen.equals( parsed.getFinalValue() , true ) ;

parsed = Expression.parse( '-1.5 is-real?' ) ;
doormen.equals( parsed.getFinalValue() , true ) ;

parsed = Expression.parse( '-1.5 is-real?' ) ;
doormen.equals( parsed.getFinalValue() , true ) ;

parsed = Expression.parse( '( 1 / 0 ) is-real?' ) ;
doormen.equals( parsed.getFinalValue() , false ) ;

parsed = Expression.parse( 'Infinity is-real?' ) ;
doormen.equals( parsed.getFinalValue() , false ) ;
```

parse/exec apply operator.

```js
var parsed , ctx , object ;

object = { a: 3 , b: 5 } ;
object.fn = function( v ) { return this.a * v + this.b ; }

ctx = {
	fn: function( v ) { return v * 2 + 1 ; } ,
	object: object
} ;

parsed = Expression.parse( '$fn -> 3' ) ;
doormen.equals( parsed.getFinalValue( ctx ) , 7 ) ;

parsed = Expression.parse( '$object.fn -> 3' ) ;
//deb( parsed ) ;
doormen.equals( parsed.getFinalValue( ctx ) , 14 ) ;
```

parse/exec custom operator.

```js
var parsed , ctx , operators , object , v ;

object = { a: 3 , b: 5 } ;
object.fn = function( v ) { return this.a * v + this.b ; }

ctx = {
	fn: function( v ) { return v * 2 + 1 ; } ,
	object: object
} ;

operators = {
	D: function( args ) {
		var sum = 0 , n = args[ 0 ] , faces = args[ 1 ] ;
		for ( ; n > 0 ; n -- ) { sum += 1 + Math.floor( Math.random() * faces ) ; }
		return sum ;
	}
} ;

parsed = Expression.parse( '3 D 6' , operators ) ;
//deb( parsed ) ;
v = parsed.getFinalValue( ctx ) ;
//deb( v ) ;
doormen.equals( v >= 1 && v <= 18 , true ) ;
```

parse/exec apply operator and substitution regexp.

```js
var parsed , ctx , regexp ;

regexp = /hello/ ;
kungFig.parse.builtin.regex.toExtended( regexp ) ;

ctx = {
	str: 'hello world!' ,
	regexp: regexp ,
	array: [
		'hi' ,
		'hello' ,
		'hi there!' ,
		'hello world!'
	]
} ;

parsed = Expression.parse( '$regexp.filter -> $array' ) ;
//deb( parsed ) ;
doormen.equals( parsed.getFinalValue( ctx ) , [ 'hello' , 'hello world!' ] ) ;

kungFig.parse.builtin.regex.toSubstitution( regexp , 'hi' ) ;

parsed = Expression.parse( '$regexp.substitute -> $str' ) ;
//deb( parsed ) ;
doormen.equals( parsed.getFinalValue( ctx ) , 'hi world!' ) ;
```

<a name="kfg-stringify"></a>
# KFG stringify
stringify string.

```js
doormen.equals( stringify( "Hello World!" ) , 'Hello World!\n' ) ;
doormen.equals( stringify( "a:1" ) , '> a:1\n' ) ;
doormen.equals( stringify( "123" ) , '> 123\n' ) ;
doormen.equals( stringify( "123.45" ) , '> 123.45\n' ) ;
doormen.equals( stringify( "Hello: World!" ) , '> Hello: World!\n' ) ;
doormen.equals( stringify( "[Hello World!]" ) , '> [Hello World!]\n' ) ;
doormen.equals( stringify( "<hello>" ) , '> <hello>\n' ) ;
doormen.equals( stringify( "(hello)" ) , '> (hello)\n' ) ;
doormen.equals( stringify( "   Hello World!" ) , '>    Hello World!\n' ) ;
doormen.equals( stringify( "Hello World!   " ) , '> Hello World!   \n' ) ;

doormen.equals( stringify( "Hello\nWorld!" ) , '> Hello\n> World!\n' ) ;
doormen.equals( stringify( "One...\nTwo...\n\nThree!" ) , '> One...\n> Two...\n> \n> Three!\n' ) ;
doormen.equals( stringify( "One...\n\tTwo...\n\nThree!" ) , '> One...\n> \tTwo...\n> \n> Three!\n' ) ;
```

stringify string with option 'preferQuotes'.

```js
doormen.equals( stringify( "Hello World!" , { preferQuotes: true } ) , 'Hello World!\n' ) ;
doormen.equals( stringify( "a:1" , { preferQuotes: true } ) , '"a:1"\n' ) ;
doormen.equals( stringify( "123" , { preferQuotes: true } ) , '"123"\n' ) ;
doormen.equals( stringify( "123.45" , { preferQuotes: true } ) , '"123.45"\n' ) ;
doormen.equals( stringify( "Hello: World!" , { preferQuotes: true } ) , '"Hello: World!"\n' ) ;
doormen.equals( stringify( "[Hello World!]" , { preferQuotes: true } ) , '"[Hello World!]"\n' ) ;
doormen.equals( stringify( "<hello>" , { preferQuotes: true } ) , '"<hello>"\n' ) ;
doormen.equals( stringify( "(hello)" , { preferQuotes: true } ) , '"(hello)"\n' ) ;
doormen.equals( stringify( "   Hello World!" , { preferQuotes: true } ) , '"   Hello World!"\n' ) ;
doormen.equals( stringify( "Hello World!   " , { preferQuotes: true } ) , '"Hello World!   "\n' ) ;

doormen.equals( stringify( "Hello\nWorld!" , { preferQuotes: true } ) , '"Hello\\nWorld!"\n' ) ;
doormen.equals( stringify( "One...\nTwo...\n\nThree!" , { preferQuotes: true } ) , '"One...\\nTwo...\\n\\nThree!"\n' ) ;
doormen.equals( stringify( "One...\n\tTwo...\n\nThree!" , { preferQuotes: true } ) , '"One...\\n\\tTwo...\\n\\nThree!"\n' ) ;
```

stringify non-string scalar.

```js
doormen.equals( stringify( undefined ) , "null\n" ) ;
doormen.equals( stringify( null ) , "null\n" ) ;
doormen.equals( stringify( true ) , "true\n" ) ;
doormen.equals( stringify( false ) , "false\n" ) ;
doormen.equals( stringify( 123 ) , "123\n" ) ;
doormen.equals( stringify( 123.456 ) , "123.456\n" ) ;
```

stringify empty object/array.

```js
doormen.equals( stringify( [] ) , '<Array>\n' ) ;
doormen.equals( stringify( {} ) , '<Object>\n' ) ;
doormen.equals( stringify( new TagContainer() ) , '<TagContainer>\n' ) ;
```

undefined value.

```js
doormen.equals( stringify( {a:{},b:undefined,c:{d:undefined}} ) , 'a: <Object>\nc: <Object>\n' ) ;
doormen.equals( stringify( [{},undefined,{d:undefined}] ) , '- <Object>\n- null\n- <Object>\n' ) ;
```

stringify a basic object.

```js
var o = {
	a: 1 ,
	b: "bob" ,
	c: null ,
	d: true ,
	e: false ,
	f: NaN ,
	g: Infinity ,
	h: - Infinity ,
	j1: {} ,
	j2: [] ,
	needQuote: {
		a: "1" ,
		c: "null" ,
		d: "true" ,
		e: "false" ,
		f: "NaN" ,
		g: "Infinity" ,
		h: "-Infinity" ,
		sp1: " bob" ,
		sp2: "bob " ,
		sp3: "bob\nbob" ,
		sp4: '"bob\nbob"' ,
	} ,
	"some key": "some value" ,
	"some-key": "some value" ,
	"some_key": "some value" ,
	"1key": "1value" ,
	obj: {
		i: 'ay',
		j: 'djay',
	} ,
	obj2: {
		k: 'K',
		l: 'L',
	} ,
	arr: [ 1,2,3 ] ,
	arr2: [ 4,5,6, [ 7,8,9 ] , { m: 'm' , n: 'n' } ] ,
} ;

var s = stringify( o ) ;
//console.log( s ) ;

// Check that the original object and the stringified/parsed object are equals:
doormen.equals( o , parse( s ) ) ;
//require( 'expect.js' )( o ).to.eql( parse( s ) ) ;
```

stringify templates.

```js
doormen.equals( stringify( { tpl: Template.create( 'Hello ${name}!' ) } ) , 'tpl: $> Hello ${name}!\n' ) ;
doormen.equals( stringify( { tpl: new Template( 'Hey!\nHello ${name}!' ) } ) , 'tpl: $> Hey!\n\t$> Hello ${name}!\n' ) ;
doormen.equals( stringify( { tpl: Template.create( 'Hello ${name}!' ) } , { preferQuotes: true } ) , 'tpl: $"Hello ${name}!"\n' ) ;
doormen.equals( stringify( { tpl: Template.create( 'Hey!\nHello ${name}!' ) } , { preferQuotes: true } ) , 'tpl: $"Hey!\\nHello ${name}!"\n' ) ;

doormen.equals( stringify( Template.create( 'Hello ${name}!' ) ) , '$> Hello ${name}!\n' ) ;
doormen.equals( stringify( Template.create( 'Hey!\nHello ${name}!' ) ) , '$> Hey!\n$> Hello ${name}!\n' ) ;
doormen.equals( stringify( Template.create( 'Hello ${name}!' ) , { preferQuotes: true } ) , '$"Hello ${name}!"\n' ) ;
doormen.equals( stringify( Template.create( 'Hey!\nHello ${name}!' ) , { preferQuotes: true } ) , '$"Hey!\\nHello ${name}!"\n' ) ;

doormen.equals( stringify( { tpl: Template.create( '' ) } ) , 'tpl: <Template>\n' ) ;
doormen.equals( stringify( Template.create( '' ) ) , '<Template>\n' ) ;
```

stringify an object with operators.

```js
var o = {
	'+attack': 2,
	'-defense': 1,
	'*time': 0.9,
	'(u-ops)damages': 1.2,
	'()+strange key': 3,
	'()(another strange key)': 5,
	'()-hey': 5,
	'~hey': 5,
	'@@#*>': '/path/to/*/something/',
	'@*>': '/path/to/something/',
	'@': '/path/to/something/',
	'@@': '/path/to/something/',
	list: [ 'one' , 'two' , { "@@": '/path/to/something/' } ] ,
} ;

var s = stringify( o ) ;
//console.log( s ) ;
//console.log( string.escape.control( s ) ) ;
//console.log( parse( s ) ) ;

var expected = 'attack: (+) 2\ndefense: (-) 1\ntime: (*) 0.9\ndamages: (u-ops) 1.2\n+strange key: 3\n"(another strange key)": 5\n"-hey": 5\n~hey: 5\n(#*>) @@/path/to/*/something/\n(*>) @/path/to/something/\n() @/path/to/something/\n() @@/path/to/something/\nlist:\n\t- one\n\t- two\n\t- @@/path/to/something/\n' ;
doormen.equals( s , expected ) ;

// Check that the original object and the stringified/parsed object are equals:
//require( 'expect.js' )( o ).to.eql( parse( s ) ) ;
doormen.equals( o , parse( s ) ) ;
```

stringify an object with special instances (bin, date, regex).

```js
var o = {
	bin: new Buffer( 'af461e0a' , 'hex' ) ,
	date1: new Date( 123456789 ) ,
	regex1: /abc/ ,
	array: [
		[
			new Date( 123456789 ) ,
			/abc/ig ,
		] ,
		[
			new Date( 123456789 ) ,
			/abc/ig ,
		] ,
	] ,
	object: {
		date2: new Date( 123456789 ) ,
		regex2: /abc/ig ,
	}
} ;

var s = stringify( o ) ;
//console.log( s ) ;
//console.log( string.escape.control( s ) ) ;
//console.log( parse( s ) ) ;

var expected = 'bin: <bin16> af461e0a\ndate1: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\nregex1: <regex> /abc/\narray:\n\t-\t- <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\n\t\t- <regex> /abc/gi\n\t-\t- <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\n\t\t- <regex> /abc/gi\nobject:\n\tdate2: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)\n\tregex2: <regex> /abc/gi\n' ;
doormen.equals( s , expected ) ;

var o2 = parse( s ) ;

// Check that the original object and the stringified/parsed object are equals:
//expect( o ).to.eql( o2 ) ;

expect( o2.bin ).to.be.a( Buffer ) ;
expect( o2.bin.toString( 'hex' ) ).to.be( o.bin.toString( 'hex' ) ) ;

delete o.bin ;
delete o2.bin ;

doormen.equals( o2 , o ) ;
```

stringify an object with special custom instances.

```js
function Simple( value )
{
	var self = Object.create( Simple.prototype ) ;
	self.str = value ;
	return self ;
}

function Complex( value )
{
	var self = Object.create( Complex.prototype ) ;
	self.str = value.str ;
	self.int = value.int ;
	return self ;
}

var stringifier = new Map() ;

stringifier.set( Simple.prototype , function Simple( v ) {
	return v.str ;
} ) ;

stringifier.set( Complex.prototype , function Complex( v ) {
	return { str: v.str , int: v.int } ;
} ) ;

var o = {
	simple: Simple( "abc" ) ,	// jshint ignore:line
	complex: Complex( { str: "hello", int: 6 } )	// jshint ignore:line
} ;

//console.log( stringify( o , { classes: stringifier } ) ) ;
doormen.equals(
	stringify( o , { classes: stringifier } ) ,
	"simple: <Simple> abc\ncomplex: <Complex>\n\tstr: hello\n\tint: 6\n"
) ;
```

stringify an object with tags.

```js
var o = new TagContainer( [
	new Tag( 'if' , 'something > constant' , new TagContainer( [
		new Tag( 'do' , null , 'some tasks' ) ,
		new Tag( 'do' , null , 'some other tasks' )
	] ) ) ,
	new Tag( 'else' , null , new TagContainer( [
		new Tag( 'do' , null , new TagContainer( [
			new Tag( 'do' , null , [ 'one' , 'two' , 'three' ] ) ,
			new Tag( 'do' , null , { a: 1 , b: 2 } )
		] ) )
	] ) )
] ) ;

var s = stringify( o ) ;

//console.log( s ) ;
//console.log( string.escape.control( s ) ) ;
//console.log( parse( s ) ) ;

var expected = '[if something > constant]\n\t[do] some tasks\n\t[do] some other tasks\n[else]\n\t[do]\n\t\t[do]\n\t\t\t- one\n\t\t\t- two\n\t\t\t- three\n\t\t[do]\n\t\t\ta: 1\n\t\t\tb: 2\n' ;
doormen.equals( s , expected ) ;

var o2 = parse( s ) ;

// Check that the original object and the stringified/parsed object are equals:
//expect( o ).to.eql( o2 ) ;

expect( o2 ).to.be.a( TagContainer ) ;
expect( o2.children[ 0 ] ).to.be.a( Tag ) ;

doormen.equals( o2 , o ) ;
```

stringify an object with tags, featuring custom tags prototype.

```js
function IfTag() {}
IfTag.prototype = Object.create( Tag.prototype ) ;
IfTag.prototype.constructor = IfTag ;

IfTag.create = function createIfTag( tag , attributes , content , shouldParse ) {
	var self = Object.create( IfTag.prototype ) ;
	Tag.call( self , 'if' , attributes , content , shouldParse ) ;
	return self ;
} ;

IfTag.prototype.parseAttributes = function parseAttributes( attributes )
{
	var splitted = attributes.split( / +/ ) ;
	return {
		left: splitted[ 0 ] ,
		operator: splitted[ 1 ] ,
		right: splitted[ 2 ]
	} ;
} ;

IfTag.prototype.stringifyAttributes = function stringifyAttributes() {
	return this.attributes.left + ' ' + this.attributes.operator + ' ' + this.attributes.right ;
} ;

var o = new TagContainer( [
	IfTag.create( 'if' , 'something > constant' , new TagContainer( [
		new Tag( 'do' , null , 'some tasks' ) ,
		new Tag( 'do' , null , 'some other tasks' )
	] ) , true ) ,
	new Tag( 'else' , null , new TagContainer( [
		new Tag( 'do' , null , new TagContainer( [
			new Tag( 'do' , null , [ 'one' , 'two' , 'three' ] ) ,
			new Tag( 'do' , null , { a: 1 , b: 2 } )
		] ) )
	] ) )
] ) ;

//console.log( o ) ;
var s = stringify( o ) ;

//console.log( s ) ;
//console.log( string.escape.control( s ) ) ;
//console.log( parse( s ) ) ;

var expected = '[if something > constant]\n\t[do] some tasks\n\t[do] some other tasks\n[else]\n\t[do]\n\t\t[do]\n\t\t\t- one\n\t\t\t- two\n\t\t\t- three\n\t\t[do]\n\t\t\ta: 1\n\t\t\tb: 2\n' ;
doormen.equals( s , expected ) ;

var o2 = parse( s , { tags: { if: IfTag.create } } ) ;
//console.log( o2 ) ;

// Check that the original object and the stringified/parsed object are equals:
//expect( o ).to.eql( o2 ) ;

expect( o2 ).to.be.a( TagContainer ) ;
expect( o2.children[ 0 ] ).to.be.a( Tag ) ;

doormen.equals( o2 , o ) ;
```

<a name="kfg-parse"></a>
# KFG parse
parse string at top-level.

```js
doormen.equals( parse( '"Hello World!"' ) , "Hello World!" ) ;
doormen.equals( parse( '> Hello World!' ) , "Hello World!" ) ;
doormen.equals( parse( '>   Hello World!' ) , "  Hello World!" ) ;
doormen.equals( parse( '>   Hello World!  ' ) , "  Hello World!  " ) ;
doormen.equals( parse( '> \tHello World!' ) , "\tHello World!" ) ;
doormen.equals( parse( '> \t\t\tHello\t\tWorld!' ) , "\t\t\tHello\t\tWorld!" ) ;
doormen.equals( parse( 'Hello World!' ) , "Hello World!" ) ;
doormen.equals( parse( '  Hello World!  ' ) , "Hello World!" ) ;
doormen.equals( parse( '"123"' ) , "123" ) ;
doormen.equals( parse( '"123.45"' ) , "123.45" ) ;
doormen.equals( parse( '> 123' ) , "123" ) ;
doormen.equals( parse( '> 123.45' ) , "123.45" ) ;
```

parse multi-line string at top-level.

```js
doormen.equals( parse( '> Hello\n> World!' ) , "Hello\nWorld!" ) ;
//doormen.equals( parse( 'Hello\nWorld!' ) , "Hello\nWorld!" ) ;
```

parse non-string scalar at top-level.

```js
doormen.equals( parse( 'null' ) , null ) ;
doormen.equals( parse( 'true' ) , true ) ;
doormen.equals( parse( 'false' ) , false ) ;
doormen.equals( parse( '123' ) , 123 ) ;
doormen.equals( parse( '123.456' ) , 123.456 ) ;
```

parse instance at top-level.

```js
doormen.equals( JSON.stringify( parse( "<Bin16> 22" ) ) , '{"type":"Buffer","data":[34]}' ) ;
doormen.equals( JSON.stringify( parse( "<Object>" ) ) , '{}' ) ;
doormen.equals( JSON.stringify( parse( "<Object>\na: 1" ) ) , '{"a":1}' ) ;
doormen.equals( parse( "<Template> :string" ).toString() , ':string' ) ;
```

numbers and string ambiguity.

```js
doormen.equals( parse( "v:1" ) , {v:1} ) ;
doormen.equals( parse( "v:1l" ) , {v:"1l"} ) ;
doormen.equals( parse( "v:10e2" ) , {v:1000} ) ;
doormen.equals( parse( "v:123.5" ) , {v:123.5} ) ;
doormen.equals( parse( "v:123.e5" ) , {v:"123.e5"} ) ;
```

constant and string ambiguity.

```js
doormen.equals( parse( "v:true" ) , {v:true} ) ;
doormen.equals( parse( "v:true or false" ) , {v:"true or false"} ) ;
```

key ambiguity.

```js
doormen.equals( parse( "first-name:Joe" ) , {"first-name":"Joe"} ) ;
```

unquoted tabs should not be parsed as string but as undefined.

```js
var o ;

o = parse( "object:\t\t\t\n\ta: 1" ) ;
//console.log( o ) ;
doormen.equals( o , { object: { a: 1 } } ) ;

o = parse( "[tag]\t\t\t\n\ta: 1" ) ;
//console.log( o ) ; console.log( JSON.stringify( o ) ) ;
doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","content":{"a":1},"attributes":null}]}' ) ;
```

parse a basic file.

```js
var o = parse( fs.readFileSync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ) ;

doormen.equals( o , {
	a: 1,
	b: 2,
	c: 3,
	'some key': 'some value',
	d: null,
	e1: true,
	e2: true,
	e3: true,
	f1: false,
	f2: false,
	f3: false,
	g: NaN,
	h: Infinity,
	i: -Infinity,
	j1: {},
	j2: [],
	sub: 
		{ sub: { 'another key': 'another value' },
		k: 1,
		l: 2,
		sub2: { subway: 'no!' } },
	sub2: { no: 'way' },
	sub3: { nooo: 'wai!' },
	text: "A cool story:\n\nIt all started a Friday..." ,
	"inline-string": "This is an inline string!" ,
	list: [ 'one', 'two', 'three' ],
	'list embedded': 
		[ { 'first name': 'Bill', 'last name': 'Baroud' },
		{ 'first name': 'Joe', 'last name': 'Doe' },
		[ [ 'one', 'two', 'three' ],
		[ 'four', 'five' ],
		[ 'six', 'seven' ] ],
		{ 'first name': 'Bill', 'last name': 'Baroud' },
		{ 'first name': 'Joe', 'last name': 'Doe' },
		[ [ 'one', 'two', 'three' ],
		[ 'four', 'five' ],
		[ 'six', 'seven' ] ] ]
} ) ;

//console.log( kungFig.getMeta( o ).getFirstTag( 'meta' ).content ) ;
doormen.equals( kungFig.getMeta( o ).getFirstTag( 'meta' ).content , { content: "test" } ) ;
```

parse ref.

```js
var o ;
var ctx = { name: "Bob" , bob: { age: 43 } } ;

o = parse( "ref: <Ref>" ) ;
doormen.equals( o.ref.get() , undefined ) ;

o = parse( "ref: $name" ) ;
doormen.equals( o.ref.get() , undefined ) ;

o = parse( "ref: $name\nref2: $bob.age" ) ;
doormen.equals( o.ref.get( ctx ) , "Bob" ) ;
doormen.equals( o.ref.toString( ctx ) , "Bob" ) ;
doormen.equals( o.ref2.get( ctx ) , 43 ) ;
doormen.equals( o.ref2.toString( ctx ) , "43" ) ;
```

parse applicable ref.

```js
var o ;
var ctx = { name: "Bob" , bob: { age: 43 } } ;

o = parse( "ref: $$name\nref2: $$bob.age" ) ;
doormen.equals( o.ref.get( ctx ) , o.ref ) ;
doormen.equals( o.ref2.get( ctx ) , o.ref2 ) ;

doormen.equals( o.ref.apply( ctx ) , "Bob" ) ;
doormen.equals( o.ref2.apply( ctx ) , 43 ) ;
```

parse expression.

```js
var o ;
var ctx = { name: "Bob" , bob: { age: 43 } , bill: { age: 37 } } ;

//o = parse( "exp: <Expression>" ) ;
//doormen.equals( o.exp , undefined ) ;

o = parse( "exp: $= $name" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , "Bob" ) ;

o = parse( "exp: $= $bob.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , 43 ) ;

o = parse( "exp: $= $bob.age + 2" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , 45 ) ;

o = parse( "exp: $= 5 + $bob.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , 48 ) ;

o = parse( "exp: $=5 + $bob.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , 48 ) ;

o = parse( "exp: $= $bob.age - $bill.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , 6 ) ;

o = parse( "exp: $= - $bill.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , -37 ) ;

o = parse( "exp: $= ( $bill.age + 3 ) / 10" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , 4 ) ;

o = parse( "exp: $= $bill.age < $bob.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , true ) ;

o = parse( "exp: $= $bill.age > $bob.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , false ) ;

o = parse( "exp: $= $bill.age == $bob.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , false ) ;

o = parse( "exp: $= ( $bill.age + 6 ) == $bob.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , true ) ;

o = parse( "exp: $= $bill.age != $bob.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , true ) ;

o = parse( "exp: $= ( $bill.age + 6 ) != $bob.age" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , false ) ;

o = parse( "exp: $= ! ( $bill.age == $bob.age )" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , true ) ;

o = parse( "exp: $= ! ( ( $bill.age + 6 ) == $bob.age )" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , false ) ;
```

parse expression.

```js
var o ;
var ctx = { name: "Bob" , bob: { age: 43 } , bill: { age: 37 } } ;

o = parse( "exp: $$= $bob.age + 2" ) ;
doormen.equals( o.exp.getFinalValue( ctx ) , o.exp ) ;
doormen.equals( o.exp.apply( ctx ) , 45 ) ;
```

parse templates.

```js
var o ;

// console.log( o.tpl ) ;
// console.log( o.tpl.toString() ) ;
// console.log( o.tpl.toString( { name: "Bob" } ) ) ;

o = parse( "tpl: <Template>" ) ;
doormen.equals( o.tpl.toString() , '' ) ;

o = parse( "tpl: $> Hello ${name}!" ) ;
doormen.equals( o.tpl.toString() , 'Hello (undefined)!' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;

o = parse( "tpl:\n\t$> Hello ${name}!" ) ;
doormen.equals( o.tpl.toString() , 'Hello (undefined)!' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;

o = parse( "tpl:\n\t$> Hello ${name}!\n\t$> How are you ${name}?" ) ;
doormen.equals( o.tpl.toString() , 'Hello (undefined)!\nHow are you (undefined)?' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!\nHow are you Bob?' ) ;

o = parse( 'tpl: $"Hello ${name}!"' ) ;
doormen.equals( o.tpl.toString() , 'Hello (undefined)!' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;

// Top-level templates
o = parse( "<Template>" ) ;
doormen.equals( o.toString() , '' ) ;

o = parse( '$"Hello ${name}!"' ) ;
doormen.equals( o.toString() , 'Hello (undefined)!' ) ;
doormen.equals( o.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;

o = parse( '$> Hello ${name}!' ) ;
doormen.equals( o.toString() , 'Hello (undefined)!' ) ;
doormen.equals( o.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;

o = parse( '$> Hey!\n$> Hello ${name}!' ) ;
doormen.equals( o.toString() , 'Hey!\nHello (undefined)!' ) ;
doormen.equals( o.toString( { name: "Bob" } ) , 'Hey!\nHello Bob!' ) ;
```

parse applicable templates.

```js
var o ;

o = parse( "tpl: $$> Hello ${name}!" ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello ${name}!' ) ;
doormen.equals( o.tpl.apply( { name: "Bob" } ) , 'Hello Bob!' ) ;

o = parse( "tpl:\n\t$$> Hello ${name}!" ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello ${name}!' ) ;
doormen.equals( o.tpl.apply( { name: "Bob" } ) , 'Hello Bob!' ) ;

o = parse( 'tpl: $$"Hello ${name}!"' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello ${name}!' ) ;
doormen.equals( o.tpl.apply( { name: "Bob" } ) , 'Hello Bob!' ) ;
```

parse a file with operators.

```js
var o = parse( fs.readFileSync( __dirname + '/sample/kfg/ops.kfg' , 'utf8' ) ) ;

doormen.equals( o , {
	'+attack': 2,
	'+defense': -1,
	'*time': 0.9,
	'(u-ops)damages': 1.2,
	'()+strange key': 3,
	'()(another strange key)': 5,
	'@include': "path/to/include.kfg",
	'@@mandatory include': "path/to/mandatory-include.kfg",
	'@+include2': 'path/to/include.kfg',
	'@(u-ops)include3': 'path/to/include.kfg',
	'@@(u-ops)include4': 'path/to/mandatory-include.kfg',
	'*>merge': { something: 1, 'something else': 12 },
	'#+foreach': [1,2,3],
	list: [ 'one' , 'two' , { '@@': 'path/to/include.kfg' } ] ,
	'@*>': 'path/to/something',
} ) ;
```

parse a file with special instances (json, bin, date, regex).

```js
var o = parse( fs.readFileSync( __dirname + '/sample/kfg/instances.kfg' , 'utf8' ) ) ;

//console.log( JSON.stringify( o ) ) ;

doormen.equals(
	JSON.stringify( o ) ,
	'{"a":1234,"bin":{"type":"Buffer","data":[253,16,75,25]},"date1":"2016-04-29T10:08:14.000Z","date2":"2016-04-29T10:08:08.645Z","b":"toto","regex1":{},"sub":{"sub":{"date3":"1970-01-01T00:00:01.000Z","regex2":{}}},"d":2,"json":{"a":1,"b":2,"array":[1,2,"three"]}}'
) ;

doormen.equals( o.regex1 instanceof RegExp , true ) ;
doormen.equals( o.regex1.toString() , "/abc/" ) ;

doormen.equals( o.sub.sub.regex2 instanceof RegExp , true ) ;
doormen.equals( o.sub.sub.regex2.toString() , "/abc/m" ) ;

doormen.equals( o.bin.toString( 'hex' ) , "fd104b19" ) ;
```

parse a file with special custom instances.

```js
function Simple( value )
{
	var self = Object.create( Simple.prototype ) ;
	self.str = value ;
	return self ;
}

function Complex( value )
{
	var self = Object.create( Complex.prototype ) ;
	self.str = value.str ;
	self.int = value.int ;
	return self ;
}

var options = {
	classes: {
		simple: Simple ,
		complex: Complex
	}
} ;

var o = parse( fs.readFileSync( __dirname + '/sample/kfg/custom-instances.kfg' , 'utf8' ) , options ) ;

//console.log( o ) ;
doormen.equals( JSON.stringify( o ) , '{"simple":{"str":"abc"},"complex":{"str":"hello","int":6}}' ) ;
```

parse tags.

```js
doormen.equals( JSON.stringify( parse( '[tag]' ) ) , '{"children":[{"name":"tag","attributes":null}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] text' ) ) , '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] "text"' ) ) , '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] > text' ) ) , '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag]\n\t> text' ) ) , '{"children":[{"name":"tag","content":"text","attributes":null}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] true' ) ) , '{"children":[{"name":"tag","content":true,"attributes":null}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] 123' ) ) , '{"children":[{"name":"tag","content":123,"attributes":null}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] <Object>' ) ) , '{"children":[{"name":"tag","content":{},"attributes":null}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] <Object>\n\ta: 1\n\tb: 2' ) ) , '{"children":[{"name":"tag","content":{"a":1,"b":2},"attributes":null}]}' ) ;
```

parse a file containing tags.

```js
var o = parse( fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) ) ;

//console.log( o ) ;
//console.log( string.inspect( { style: 'color' , depth: 15 } , o ) ) ;
//console.log( string.escape.control( JSON.stringify( o ) ) ) ;
//console.log( JSON.stringify( o ) ) ;

doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","content":{"some":"value","another":"one"},"attributes":"id1"},{"name":"tag","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","content":{"children":[{"name":"do","content":"some work","attributes":null}]},"attributes":"something > constant"},{"name":"else","content":{"children":[{"name":"do","content":"something else","attributes":null}]},"attributes":null}]}}},"attributes":"id2"},{"name":"container","content":{"children":[{"name":"tag","attributes":null},{"name":"anothertag","attributes":null},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]},"attributes":null}]}' ) ;

//console.log( o.children[ 2 ].content.children[ 0 ].parent ) ;
//console.log( o.children[ 2 ].content.children[ 0 ].getParentTag() ) ;
doormen.equals( o.children[ 2 ].getParentTag() , null ) ;
doormen.equals( o.children[ 2 ] === o.children[ 2 ].content.children[ 0 ].getParentTag() , true ) ;
```

parse a file containing tags, with custom tags prototypes.

```js
function IfTag() {}
IfTag.prototype = Object.create( Tag.prototype ) ;
IfTag.prototype.constructor = IfTag ;

IfTag.create = function createIfTag( tag , attributes , content , shouldParse ) {
	var self = Object.create( IfTag.prototype ) ;
	Tag.call( self , 'if' , attributes , content , shouldParse ) ;
	return self ;
} ;

IfTag.prototype.parseAttributes = function parseAttributes( attributes )
{
	var splitted = attributes.split( / +/ ) ;
	return {
		left: splitted[ 0 ] ,
		operator: splitted[ 1 ] ,
		right: splitted[ 2 ]
	} ;
} ;

IfTag.prototype.stringifyAttributes = function stringifyAttributes() {
	return this.attributes.left + ' ' + this.attributes.operator + ' ' + this.attributes.right ;
} ;


var o = parse( fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) , { tags: { if: IfTag.create } } ) ;

//console.log( o ) ;
//console.log( string.inspect( { style: 'color' , depth: 15 } , o ) ) ;
//console.log( string.escape.control( JSON.stringify( o ) ) ) ;

doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","content":{"some":"value","another":"one"},"attributes":"id1"},{"name":"tag","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","content":{"children":[{"name":"do","content":"some work","attributes":null}]},"attributes":{"left":"something","operator":">","right":"constant"}},{"name":"else","content":{"children":[{"name":"do","content":"something else","attributes":null}]},"attributes":null}]}}},"attributes":"id2"},{"name":"container","content":{"children":[{"name":"tag","attributes":null},{"name":"anothertag","attributes":null},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]},"attributes":null}]}' ) ;
```

<a name="meta-tag"></a>
# Meta-Tag
parse meta-tag.

```js
var o ;
o = parse( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\nsome: data' ) ;
/*
console.log( o ) ;
console.log( kungFig.getMeta( o ) ) ;
console.log( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ] ) ;
*/
doormen.equals( o , { some: "data" } ) ;
doormen.equals( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ].content , { author: "Joe Doe" , copyright: 2016 } ) ;

//console.log( stringify( o ) ) ;
doormen.equals( stringify( o ) , '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\n\nsome: data\n' ) ;
```

stringify meta-tag.

```js
var o ;
o = { some: "data" } ;
kungFig.setMeta( o , [ new Tag( 'meta' , undefined , { author: "Joe Doe" , copyright: 2016 } ) ] ) ;

//console.log( stringify( o ) ) ;
doormen.equals( stringify( o ) , '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\n\nsome: data\n' ) ;
```

parse meta-tag, with meta hook.

```js
var o , hookTriggered = 0 ;

var options = {
	metaHook: function( meta ) {
		//console.log( "Received meta: " , meta.getTags( 'meta' )[ 0 ].content ) ;
		doormen.equals( meta.getTags( 'meta' )[ 0 ].content , { author: "Joe Doe" , copyright: 2016 } ) ;
		hookTriggered ++ ;
	}
} ;

o = parse( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\nsome: data' , options ) ;

/*
console.log( o ) ;
console.log( kungFig.getMeta( o ) ) ;
console.log( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ] ) ;
*/

doormen.equals( hookTriggered , 1 ) ;
doormen.equals( o , { some: "data" } ) ;
doormen.equals( kungFig.getMeta( o ).getTags( 'meta' )[ 0 ].content , { author: "Joe Doe" , copyright: 2016 } ) ;

//console.log( stringify( o ) ) ;
doormen.equals( stringify( o ) , '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\n\nsome: data\n' ) ;
```

meta tag after body started should throw.

```js
doormen.shouldThrow( function() {
	parse( '[[meta]]\n\tauthor: Joe Doe\n\tcopyright: 2016\nsome: data\n[[meta]]' ) ;
} ) ;
```

meta hook & loading (include, ...).

```js
var o , hookTriggered = 0 ;

var options = {
	metaHook: function( meta ) {
		//if ( meta ) { console.log( "Received meta: " , meta , "\n>>>" , meta.getFirstTag( 'meta' ).content ) ; }
		//else { console.log( "No meta" ) ; }
		
		//doormen.equals( meta.getTags( 'meta' )[ 0 ].content , { author: "Joe Doe" , copyright: 2016 } ) ;
		hookTriggered ++ ;
	}
} ;

o = kungFig.load( __dirname + '/sample/kfg/meta-hook.kfg' , options ) ;

//console.log( "data:" , o ) ;
//console.log( "meta:" , kungFig.getMeta( o ) , "\n###" , kungFig.getMeta( o ).getFirstTag( 'meta' ).content ) ;

doormen.equals( hookTriggered , 1 ) ;
doormen.equals( o , { include: { some: { more: "content"  } } , some: "content" } ) ;
doormen.equals( kungFig.getMeta( o ).getFirstTag( 'meta' ).content , "master" ) ;
```

<a name="labeltag"></a>
# LabelTag
label attributes parse.

```js
doormen.equals(
	LabelTag.parseAttributes( 'label' ) ,
	'label'
) ;

doormen.equals(
	LabelTag.parseAttributes( '' ) ,
	''
) ;
```

label attributes stringify.

```js
doormen.equals(
	LabelTag.stringifyAttributes( 'label' ) ,
	'label'
) ;

doormen.equals(
	LabelTag.stringifyAttributes( 'label[]' ) ,
	'"label[]"'
) ;
```

LabelTag parse.

```js
var o = parse( '[LabelTag my-label]' , { tags: { LabelTag: LabelTag } } ) ;

//console.log( "parsed:" , o ) ;

// Doormen fails with constructors ATM
doormen.equals( JSON.parse( JSON.stringify( o ) ) , {
	children: [
		{
			name: 'LabelTag' ,
			attributes: 'my-label' ,
			content: undefined
		}
	] 
} ) ;
```

<a name="vartag"></a>
# VarTag
<a name="classictag"></a>
# ClassicTag
classic attributes parse.

```js
doormen.equals(
	ClassicTag.parseAttributes( 'width=1280 height=1024 src="/css/main.css" active' ) ,
	{ width: 1280, height: 1024, src: '/css/main.css', active: true }
) ;

doormen.equals(
	ClassicTag.parseAttributes( 'active width=1280 height=1024 src="/css/main.css"' ) ,
	{ width: 1280, height: 1024, src: '/css/main.css', active: true }
) ;

doormen.equals(
	ClassicTag.parseAttributes( '  width=1280  height = 1024  src="/css/main.css" active ' ) ,
	{ width: 1280, height: 1024, src: '/css/main.css', active: true }
) ;

doormen.equals(
	ClassicTag.parseAttributes( 'width=1280 height=1024 src="/css/main.css" active empty=""' ) ,
	{ width: 1280, height: 1024, src: '/css/main.css', active: true , empty: '' }
) ;

doormen.equals(
	ClassicTag.parseAttributes( 'width:1280 height:1024 src:"/css/main.css" active' , ':' ) ,
	{ width: 1280, height: 1024, src: '/css/main.css', active: true }
) ;
```

classic attributes stringify.

```js
//console.log( ClassicTag.stringifyAttributes( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ) ;

doormen.equals(
	ClassicTag.stringifyAttributes( { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ,
	'width=1280 height=1024 src="/css/main.css" active' 
) ;
```

ClassicTag parse.

```js
var o = parse( '[ClassicTag width=1280 height=1024 src="/css/main.css" active]' , { tags: { ClassicTag: ClassicTag } } ) ;

//console.log( "parsed:" , o ) ;

// Doormen fails with constructors ATM
doormen.equals( JSON.parse( JSON.stringify( o ) ) , {
	children: [
		{
			name: 'ClassicTag' ,
			attributes: { width: 1280, height: 1024, src: '/css/main.css', active: true } ,
			content: undefined
		}
	] 
} ) ;

/*
doormen.equals( o , {
	children: [
		{
			name: 'ClassicTag' ,
			attributes: { width: 1280, height: 1024, src: '/css/main.css', active: true } ,
			content: undefined
		}
	] 
} ) ;
*/
```

ClassicTag stringify.

```js
var o = new TagContainer( [
	new ClassicTag( 'ClassicTag' , { width: 1280, height: 1024, src: '/css/main.css', active: true } ) 
] ) ;

//console.log( o ) ;

doormen.equals( stringify( o ) , '[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' ) ;

o = new TagContainer( [
	new ClassicTag( 'ClassicTag' , { width: 1280, height: 1024, src: '/css/main.css', active: true } ) ,
	new ClassicTag( 'ClassicTag' , { fullscreen: true } ) 
] ) ;

//console.log( o ) ;

doormen.equals(
	stringify( o ) ,
	'[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' +
	'[ClassicTag fullscreen]\n'
) ;

//console.log( parse( stringify( o ) ) ) ;

o = new TagContainer( [
	new ClassicTag( 'ClassicTag' , { width: 1280, height: 1024, src: '/css/main.css', active: true } , { hello: "world!" } ) ,
	new ClassicTag( 'ClassicTag' , { fullscreen: true } ) 
] ) ;

//console.log( o ) ;

doormen.equals(
	stringify( o ) ,
	'[ClassicTag width=1280 height=1024 src="/css/main.css" active]\n' +
	'\thello: world!\n' +
	'[ClassicTag fullscreen]\n'
) ;
```

<a name="expressiontag"></a>
# ExpressionTag
ExpressionTag parse.

```js
var ctx = { a: 4 , b: 1 } ;
var o = parse( '[ExpressionTag $a > 3]' , { tags: { ExpressionTag: ExpressionTag } } ) ;

//console.log( "parsed:" , o ) ;

// Doormen fails with constructors ATM
doormen.equals( JSON.parse( JSON.stringify( o ) ) , {
	children: [
		{
			name: 'ExpressionTag' ,
			attributes: {
				args: [
					{ refParts: [ 'a' ] } ,
					3
				]
			} ,
			content: undefined
		}
	] 
} ) ;

doormen.equals( typeof o.children[ 0 ].attributes.fnOperator === 'function' , true ) ;
doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , true ) ;
ctx.a = 2 ;
doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , false ) ;


o = parse( '[ExpressionTag 3 <= ( round 3.3 )]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , true ) ;

o = parse( '[ExpressionTag 4 < ( round 3.3 )]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , false ) ;

o = parse( '[ExpressionTag ( round 3.3 ) >= 3]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , true ) ;

o = parse( '[ExpressionTag ( round 3.3 ) >= 4]' , { tags: { ExpressionTag: ExpressionTag } } ) ;
doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , false ) ;
```

ExpressionTag parse with custom operators.

```js
var ctx = { a: 4 , b: 1 } ;

var operators = {
	triple: function( args ) { return args[ 0 ] * 3 ; }
} ;

var o = parse( '[ExpressionTag triple $a]' , { tags: { ExpressionTag: ExpressionTag } , operators: operators } ) ;

doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , 12 ) ;
ctx.a = 2 ;
doormen.equals( o.children[0].attributes.getFinalValue( ctx ) , 6 ) ;
```

<a name="loading-a-config"></a>
# Loading a config
when trying to load an unexistant file, it should throw.

```js
doormen.shouldThrow( function() { kungFig.load( __dirname + '/sample/unexistant.json' ) ; } ) ;
```

should load a simple JSON file without dependency.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/simple.json' ) ,
	{ just: 'a', simple: { test: '!' } }
) ;
```

should load a simple KFG file without dependency.

```js
//console.log( require( 'util' ).inspect( kungFig.parse( fs.readFileSync( __dirname + '/sample/kfg/katana.kfg' , 'utf8' ) ) , { depth: 10 } ) ) ;
//console.log( require( 'util' ).inspect( kungFig.load( __dirname + '/sample/kfg/katana.kfg' ) , { depth: 10 } ) ) ;

doormen.equals(
	kungFig.load( __dirname + '/sample/kfg/katana.kfg' ) , {
		class: 'katana',
		generic: 'saber',
		hands: 2,
		name: 'katana',
		description: 'This is a wonderful katana with a blueish blade!\nThis is a two-handed weapon.',
		durability: 24,
		melee: {
			'+toHit': -2,
			'+attack': 6,
			'*AT': 12,
			'+reach': 7,
			size: 4,
			'+power': 3,
			damages: [
				{ type: 'cutting', '+damage': 14 },
				{ type: 'fire', damage: 10 }
			]
		}
	}
) ;
```

should load a simple txt file.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/txt/lorem.txt' ) ,
	"Lorem ipsum dolor."
) ;
```

should load a simple JSON file without dependency, containing an array.

```js
//console.log( kungFig.load( __dirname + '/sample/simpleWithArrays.json' ) ) ;
doormen.equals(
	kungFig.load( __dirname + '/sample/simpleWithArrays.json' ) ,
	{ just: [ 'a' , 'simple' , [ 'test' , '!' ] ] }
) ;
```

should load a simple JSON file without dependency, which is an array.

```js
//console.log( kungFig.load( __dirname + '/sample/simpleArray.json' ) ) ;
doormen.equals(
	kungFig.load( __dirname + '/sample/simpleArray.json' ) ,
	[ 'a' , 'simple' , [ 'test' , '!' ] ]
) ;
```

when loading a file with an unexistant dependency using the '@@', it should throw.

```js
doormen.shouldThrow( function() { kungFig.load( __dirname + '/sample/withUnexistantInclude.json' ) ; } ) ;
```

when loading a file with an unexistant dependency using the '@', it should not throw.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withUnexistantOptionalInclude.json' ) ,
	{
		simple: "test",
		unexistant: {}
	}
) ;
```

when loading a file with a bad JSON content dependency using the '@', it should throw.

```js
doormen.shouldThrow( function() { kungFig.load( __dirname + '/sample/withBadOptionalInclude.json' ) ; } ) ;
//kungFig.load( __dirname + '/sample/withBadOptionalInclude.json' ) ;
```

when loading a file, all Tree-Ops should be reduced.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withTreeOps.json' ) ,
	{
		simple: "test",
		int: 7
	}
) ;
```

when loading a file and explicitly turning the 'reduce' option off, Tree Operations should not be reduced.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withTreeOps.json' , { reduce: false } ) ,
	{
		simple: "test",
		int: 5,
		"+int": 2
	}
) ;
```

should load a JSON file with a txt dependency.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withTxtInclude.json' ) ,
	{
		"simple": "test",
		"firstInclude": "Lorem ipsum dolor.",
		"nested": {
			"secondInclude": "Lorem ipsum dolor."
		}
	}
) ;
```

should load a JSON file with many relative dependencies.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withIncludes.json' ) ,
	{
		simple: 'test',
		firstInclude: {
			one: 1,
			two: {
				three: 3,
				four: {
					hello: 'world!'
				},
				five: {
					just: 'a',
					simple: {
						test: '!'
					}
				}
			}
		},
		nested: {
			secondInclude: {
				hello: 'world!'
			}
		}
	}
) ;
```

should load a JSON file with a glob dependency.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withGlobIncludes.json' ) ,
	{
		simple: 'test',
		globInclude: [
			{
				one: 1 ,
				two: {
					five: {
						just: "a" ,
						simple: {
							test: "!" 
						}
					} ,
					four: {
						hello: "world!"
					} ,
					three: 3
				}
			} ,
			{
				hello: "world!" 
			}
		]
	}
) ;
```

should load a JSON file with a glob+merge dependency.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withGlobMerge.json' ) ,
	{
		a: "A" ,
		a2: 12 ,
		sub: {
			b: "two" ,
			b2: "two-two" ,
			subsub: {
				c: 3 ,
				c2: "C2" ,
				c3: "C3"
			}
		}
	}
) ;
```

should load a JSON file with a glob dependency that resolve to no files.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withUnexistantGlobInclude.json' ) ,
	{
		simple: 'test',
		globInclude: []
	}
) ;
```

should load flawlessly a config with a circular include to itself.

```js
// Build the circular config here
var shouldBe = { "a": "A" } ;
shouldBe.b = shouldBe ;

doormen.equals( kungFig.load( __dirname + '/sample/circular.json' ) , shouldBe ) ;
```

should RE-load flawlessly a config with a circular include to itself.

```js
// Build the circular config here
var shouldBe = { "a": "A" } ;
shouldBe.b = shouldBe ;

doormen.equals( kungFig.load( __dirname + '/sample/circular.json' ) , shouldBe ) ;
```

should load flawlessly a config with many circular includes.

```js
// Build the circular config here
var shouldBe = { "hello": "world!" } ;

var a = { "some": "data" } ;
var b = { "more": "data" } ;
a.toBe = b ;
b.toA = a ;

shouldBe.circularOne = a ;
shouldBe.circularTwo = b ;

doormen.equals( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , shouldBe ) ;
```

should RE-load flawlessly a config with many circular includes.

```js
// Build the circular config here
var shouldBe = { "hello": "world!" } ;

var a = { "some": "data" } ;
var b = { "more": "data" } ;
a.toBe = b ;
b.toA = a ;

shouldBe.circularOne = a ;
shouldBe.circularTwo = b ;

doormen.equals( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , shouldBe ) ;
```

should load flawlessly a config with a reference to itself.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/selfReference.json' ) ,
	{
		"a": "A",
		"sub": {
			"key": "value",
			"refA": "A"
		},
		"refB": {
			"key": "value",
			"refA": "A"
		},
		"refC": "value"
	}
) ;
```

should load a JSON file with many relative dependencies and sub-references.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withIncludesRef.json' ) ,
	{
		simple: 'test',
		firstInclude: {
			three: 3,
			four: {
				hello: 'world!'
			},
			five: {
				just: 'a',
				simple: {
					test: '!'
				}
			}
		},
		nested: {
			secondInclude: 'world!',
			thirdInclude: 3
		}
	}
) ;
```

should load flawlessly a config with a circular reference to itself.

```js
// Build the circular config here
var shouldBe = {
	"a": "A",
	"sub": {
		"key": "value"
	}
} ;

shouldBe.sub.ref = shouldBe ;

doormen.equals( kungFig.load( __dirname + '/sample/selfCircularReference.json' ) , shouldBe ) ;
```

<a name="saving-a-config"></a>
# Saving a config
should stringify a simple config.

```js
var conf = {
	a: "Haha!",
	b: "Bee!",
	sub: {
		c: "See!"
	}
} ;

//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
doormen.equals( kungFig.saveJson( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!"\n  }\n}' ) ;
doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n' ) ;
```

should stringify a config that have circular references.

```js
var conf = {
	a: "Haha!",
	b: "Bee!",
	sub: {
		c: "See!"
	}
} ;

conf.sub.circular = conf ;

//console.log( kungFig.saveJson( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
doormen.equals( kungFig.saveJson( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": "#"\n  }\n}' ) ;
doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@#\n' ) ;


var conf = {
	a: "Haha!",
	b: "Bee!",
	sub: {
		c: "See!"
	}
} ;

conf.sub.circular = conf.sub ;

//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
doormen.equals( kungFig.saveJson( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": "#sub"\n  }\n}' ) ;
doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@#sub\n' ) ;


var conf = {
	a: "Haha!",
	b: "Bee!",
	sub: {
		sub: {
			c: "See!"
		}
	}
} ;

conf.sub.sub.circular = conf.sub.sub ;

//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
doormen.equals(
	kungFig.saveJson( conf ) , 
	'{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "sub": {\n      "c": "See!",\n      "@@circular": "#sub.sub"\n    }\n  }\n}'
) ;
doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tsub:\n\t\tc: See!\n\t\tcircular: @@#sub.sub\n' ) ;
```

should load and save flawlessly a config with many circular includes.

```js
var str ;

str = kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
//console.log( str ) ;
doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": "#circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": "#circularOne"\n  }\n}' ) ;

str = kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
//console.log( str ) ;
//console.log( str.replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
doormen.equals( str , "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@#circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@#circularOne\n" ) ;
```

should load and save to disk flawlessly a config with many circular includes.

```js
var str ;

kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.json' ) ;
str = fs.readFileSync( __dirname + '/output.json' ).toString() ;
//console.log( str ) ;
doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": "#circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": "#circularOne"\n  }\n}' ) ;
fs.unlinkSync( __dirname + '/output.json' ) ;

kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.kfg' ) ;
str = fs.readFileSync( __dirname + '/output.kfg' ).toString() ;
//console.log( str ) ;
doormen.equals( str , "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@#circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@#circularOne\n" ) ;
fs.unlinkSync( __dirname + '/output.kfg' ) ;
```

<a name="load-meta"></a>
# Load meta
should only load meta.

```js
var meta ;

meta = kungFig.loadMeta( __dirname + '/sample/kfg/meta-hook.kfg' ) ;
doormen.equals( meta.getFirstTag( 'meta' ).content , "master" ) ;

meta = kungFig.loadMeta( __dirname + '/sample/kfg/katana.kfg' ) ;
doormen.equals( meta , null ) ;
```

<a name="js-modules"></a>
# JS modules
should load a JS module.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/js/one.js' ) ,
	require(  __dirname + '/sample/js/one.js' )
) ;
```

should load a JS module exporting a function.

```js
doormen.equals(
	typeof kungFig.load( __dirname + '/sample/function.js' ) ,
	'function'
) ;

doormen.equals(
	kungFig.load( __dirname + '/sample/function.js' )() ,
	'world'
) ;
```

should load a JSON file with many relative dependencies and sub-references to a JS module.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withJsIncludesRef.json' ) ,
	{
		simple: 'test',
		firstInclude: require(  __dirname + '/sample/js/one.js' ) ,
		nested: {
			secondInclude: require(  __dirname + '/sample/js/one.js' ).helloFunc ,
			thirdInclude: require(  __dirname + '/sample/js/one.js' ).awesomeFunc
		}
	}
) ;
```

<a name="array-references"></a>
# Array references
should load flawlessly a config which is an array with simple includes.

```js
var o = kungFig.load( __dirname + '/sample/simpleArrayRef.json' ) ;
//console.log( JSON.stringify( o , null , '  ' ) ) ;
doormen.equals( o , {
	array: [
		{ just: "a", simple: { test: "!" } },
		[ 1,2,3 ]
	],
	refArray: [ 1,2,3 ]
} ) ;
doormen.equals( o.array[ 1 ] === o.refArray , true ) ;
```

should load flawlessly a config which is an array with many circular includes.

```js
var o = kungFig.load( __dirname + '/sample/withCircularIncludesArray.json' ) ;

// Build the circular config here
var shouldBe = [ "world!" ] ;

var a = [ "data" ] ;
var b = [ "data" ] ;
a[ 1 ] = b ;
b[ 1 ] = a ;

shouldBe[ 1 ] = a ;
shouldBe[ 2 ] = b ;

doormen.equals( o , shouldBe ) ;
```

should load flawlessly a config which is an array with a reference to itself.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/selfReferenceArray.json' ) ,
	[
		"A",
		[
			"value",
			"A"
		],
		[
			"value",
			"A"
		],
		"value"
	]
) ;
```

should load a JSON file which is an array with many relative dependencies and sub-references.

```js
//console.log( kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ) ;
doormen.equals(
	kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ,
	[
		'test',
		[
			3,
			[ 'hello', 'world!' ],
			{
				just: 'a',
				simple: {
					test: '!'
				}
			}
		],
		[
			'world!',
			'hello',
			3
		]
	]
) ;
```

should load flawlessly a config which is an array with a circular reference to itself.

```js
//console.log( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.json' ) ) ;

// Build the circular config here
var shouldBe = [ "A" , [ "value" ] ] ;
shouldBe[ 1 ][ 1 ] = shouldBe ;

doormen.equals( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.json' ) , shouldBe ) ;
```

should stringify a config of arrays.

```js
var str ;

str = kungFig.saveJson( kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ) ;
//console.log( str ) ;
doormen.equals( str , '[\n  "test",\n  [\n    3,\n    [\n      "hello",\n      "world!"\n    ],\n    {\n      "just": "a",\n      "simple": {\n        "test": "!"\n      }\n    }\n  ],\n  [\n    "world!",\n    "hello",\n    3\n  ]\n]' ) ;
```

should load and save flawlessly a config which is an array with many circular includes.

```js
var o , str ;

o = kungFig.load( __dirname + '/sample/withCircularIncludesArray.json' ) ;
//console.log( o ) ;
str = kungFig.saveJson( o ) ;
//console.log( str ) ;
//console.log( str.replace( /\n/g , () => '\\n' ) ) ;
doormen.equals( str , '[\n  "world!",\n  [\n    "data",\n    {\n      "@@": "#[2]"\n    }\n  ],\n  [\n    "data",\n    {\n      "@@": "#[1]"\n    }\n  ]\n]' ) ;
```

<a name="template"></a>
# Template
Template#getFinalValue().

```js
var ctx = { a: 42 } ;
ctx.b = Ref.create( '$a' ) ;
ctx.c = Template.create( "Hello, I'm ${a}." ) ;
ctx.d = Template.create( "Hello, I'm ${b}." ) ;
doormen.equals( ctx.c.getFinalValue( ctx ) , "Hello, I'm 42." ) ;
doormen.equals( ctx.d.getFinalValue( ctx ) , "Hello, I'm 42." ) ;
```

<a name="dynamicgetrecursivefinalvalue"></a>
# Dynamic.getRecursiveFinalValue()
Historical non-cloning bug.

```js
var ref1 , tpl1 , tpl2 ;

var ctx = { a: 42 } ;

ctx.b = ref1 = Ref.create( '$a' ) ;
ctx.c = tpl1 = Template.create( "Hello, I'm ${a}." ) ;
ctx.d = tpl2 = Template.create( "Hello, I'm ${b}." ) ;

doormen.equals( Dynamic.getRecursiveFinalValue( ctx , ctx ) , {
	a: 42 ,
	b: 42 ,
	c: "Hello, I'm 42." ,
	d: "Hello, I'm 42."
} ) ;

doormen.equals( ctx.b === ref1 , true ) ;
doormen.equals( ctx.c === tpl1 , true ) ;
doormen.equals( ctx.d === tpl2 , true ) ;
```

<a name="ref"></a>
# Ref
<a name="ref-get"></a>
## Get
parse and get a simple ref.

```js
var ref_ ;

var ctx = {
	a: 1 ,
	b: 2 ,
	sub: {
		c: 3 ,
		sub: {
			d: 4
		}
	}
} ;

ref_ = Ref.parse( '$x' ) ;
doormen.equals( ref_.get( ctx ) , undefined ) ;

ref_ = Ref.parse( '$x.y.z' ) ;
doormen.equals( ref_.get( ctx ) , undefined ) ;

ref_ = Ref.parse( '$a' ) ;
doormen.equals( ref_.get( ctx ) , 1 ) ;

ref_ = Ref.parse( '$b' ) ;
doormen.equals( ref_.get( ctx ) , 2 ) ;

ref_ = Ref.parse( '$sub' ) ;
doormen.equals( ref_.get( ctx ) , ctx.sub ) ;

ref_ = Ref.parse( '$sub.c' ) ;
doormen.equals( ref_.get( ctx ) , 3 ) ;

ref_ = Ref.parse( '$sub.sub' ) ;
doormen.equals( ref_.get( ctx ) , ctx.sub.sub ) ;

ref_ = Ref.parse( '$sub.sub.d' ) ;
doormen.equals( ref_.get( ctx ) , 4 ) ;

ref_ = Ref.parse( '$e' ) ;
doormen.equals( ref_.get( ctx ) , undefined ) ;

ref_ = Ref.parse( '$e.f.g' ) ;
doormen.equals( ref_.get( ctx ) , undefined ) ;
```

parse and get a ref on a context having arrays.

```js
var ref_ ;

var ctx = {
	a: 1 ,
	array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] , { array: [ 'seven' , 'eight' ] } ]
} ;

ref_ = Ref.parse( '$array' ) ;
doormen.equals( ref_.get( ctx ) , ctx.array ) ;

ref_ = Ref.parse( '$array[0]' ) ;
doormen.equals( ref_.get( ctx ) , 'one' ) ;

ref_ = Ref.parse( '$array[10]' ) ;
doormen.equals( ref_.get( ctx ) , undefined ) ;

ref_ = Ref.parse( '$array[10][10]' ) ;
doormen.equals( ref_.get( ctx ) , undefined ) ;

ref_ = Ref.parse( '$array[2][1]' ) ;
doormen.equals( ref_.get( ctx ) , 'four' ) ;

ref_ = Ref.parse( '$array[3]' ) ;
doormen.equals( ref_.get( ctx ) , ctx.array[3] ) ;

ref_ = Ref.parse( '$array[3].array' ) ;
doormen.equals( ref_.get( ctx ) , ctx.array[3].array ) ;

ref_ = Ref.parse( '$array[3].array[1]' ) ;
doormen.equals( ref_.get( ctx ) , 'eight' ) ;

ref_ = Ref.parse( '$[1]' ) ;
doormen.equals( ref_.get( ctx.array ) , 'two' ) ;

ref_ = Ref.parse( '$[2][1]' ) ;
doormen.equals( ref_.get( ctx.array ) , 'four' ) ;

ref_ = Ref.parse( '$[3].array[1]' ) ;
doormen.equals( ref_.get( ctx.array ) , 'eight' ) ;
```

parse and get a ref with quoted keys.

```js
var ref_ ;

var ctx = {
	key: 'value' ,
	"a key with spaces": {
		"another one": 'sure'
	}
} ;

ref_ = Ref.parse( '$key' ) ;
doormen.equals( ref_.get( ctx ) , 'value' ) ;

ref_ = Ref.parse( '$["key"]' ) ;
doormen.equals( ref_.get( ctx ) , 'value' ) ;

ref_ = Ref.parse( '$["a key with spaces"]' ) ;
doormen.equals( ref_.get( ctx ) , ctx["a key with spaces"] ) ;

ref_ = Ref.parse( '$["a key with spaces"]["another one"]' ) ;
doormen.equals( ref_.get( ctx ) , 'sure' ) ;
```

parse and get a complex ref (ref having refs).

```js
var ref_ ;

var ctx = {
	a: 1 ,
	b: 3 ,
	c: 0 ,
	k1: 'someKey' ,
	k2: 'anotherKey' ,
	array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] ] ,
	object: {
		someKey: 'value' ,
		anotherKey: 'another value'
	}
} ;

ref_ = Ref.parse( '$array[$a]' ) ;
doormen.equals( ref_.get( ctx ) , 'two' ) ;

ref_ = Ref.parse( '$array[$b]' ) ;
doormen.equals( ref_.get( ctx ) , ctx.array[3] ) ;

ref_ = Ref.parse( '$array[$c]' ) ;
doormen.equals( ref_.get( ctx ) , 'one' ) ;

ref_ = Ref.parse( '$object[$k1]' ) ;
doormen.equals( ref_.get( ctx ) , 'value' ) ;

ref_ = Ref.parse( '$object[$k2]' ) ;
doormen.equals( ref_.get( ctx ) , 'another value' ) ;
```

function in context.

```js
var ref_ ;

var ctx = {
	fn: function myFunc() {}
} ;

ctx.fn.prop = 'val' ;

ref_ = Ref.parse( '$fn' ) ;
doormen.equals( ref_.get( ctx ) , ctx.fn ) ;

ref_ = Ref.parse( '$fn.name' ) ;
doormen.equals( ref_.get( ctx ) , 'myFunc' ) ;

ref_ = Ref.parse( '$fn.prop' ) ;
doormen.equals( ref_.get( ctx ) , 'val' ) ;
```

<a name="ref-set"></a>
## Set
set a simple ref.

```js
var ref_ ;

var ctx = {
	a: 1 ,
	b: 2 ,
	sub: {
		c: 3 ,
		sub: {
			d: 4
		}
	}
} ;

ref_ = Ref.parse( '$a' ) ;
ref_.set( ctx , 7 ) ;
doormen.equals( ctx.a , 7 ) ;

ref_ = Ref.parse( '$sub.c' ) ;
ref_.set( ctx , 22 ) ;
doormen.equals( ctx.sub.c , 22 ) ;

ref_ = Ref.parse( '$sub.sub' ) ;
ref_.set( ctx , 'hello' ) ;
doormen.equals( ctx.sub.sub , 'hello' ) ;

doormen.equals( ctx , {
	a: 7 ,
	b: 2 ,
	sub: {
		c: 22 ,
		sub: 'hello'
	}
} ) ;
```

set a ref on a context having arrays.

```js
var ref_ ;

var ctx = {
	a: 1 ,
	array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] , { array: [ 'seven' , 'eight' ] } ]
} ;

ref_ = Ref.parse( '$array[0]' ) ;
ref_.set( ctx , 'ONE' ) ;
doormen.equals( ctx.array[0] , 'ONE' ) ;

ref_ = Ref.parse( '$array[3][1]' ) ;
ref_.set( ctx , 4 ) ;
doormen.equals( ctx.array[3][1] , 4 ) ;
```

set a complex ref (ref having refs).

```js
var ref_ ;

var ctx = {
	a: 1 ,
	b: 3 ,
	c: 0 ,
	k1: 'someKey' ,
	k2: 'anotherKey' ,
	array: [ 'one' , 'two' , [ 'three' , 'four' , [ 'five' , 'six' ] ] ] ,
	object: {
		someKey: 'value' ,
		anotherKey: 'another value'
	}
} ;

ref_ = Ref.parse( '$array[$a]' ) ;
ref_.set( ctx , 2 ) ;
doormen.equals( ctx.array[1] , 2 ) ;

ref_ = Ref.parse( '$object[$k1]' ) ;
ref_.set( ctx , 'my value' ) ;
doormen.equals( ctx.object.someKey , 'my value' ) ;

ref_ = Ref.parse( '$object[$k2]' ) ;
ref_.set( ctx , 'my other value' ) ;
doormen.equals( ctx.object.anotherKey , 'my other value' ) ;
```

set and the auto-creation feature.

```js
var ref_ ;

var ctx = {} ;

ref_ = Ref.parse( '$a.b' ) ;
ref_.set( ctx , 7 ) ;

doormen.equals( ctx , {
	a: { b: 7 }
} ) ;

ref_ = Ref.parse( '$c.d.e.f' ) ;
ref_.set( ctx , 'Gee!' ) ;

doormen.equals( ctx , {
	a: { b: 7 } ,
	c: { d: { e: { f: 'Gee!' } } }
} ) ;

ref_ = Ref.parse( '$arr[1]' ) ;
ref_.set( ctx , 'one' ) ;

doormen.equals( ctx , {
	a: { b: 7 } ,
	c: { d: { e: { f: 'Gee!' } } } ,
	arr: [ undefined , 'one' ]
} ) ;

ref_ = Ref.parse( '$arr2[3][2][1]' ) ;
ref_.set( ctx , 'nested' ) ;

doormen.equals( ctx , {
	a: { b: 7 } ,
	c: { d: { e: { f: 'Gee!' } } } ,
	arr: [ undefined , 'one' ] ,
	arr2: [ undefined , undefined , undefined , [ undefined , undefined , [ undefined , 'nested' ] ] ]
} ) ;
```

function in context.

```js
var ref_ ;

var ctx = {
	fn: function myFunc() {}
} ;

ctx.fn.prop = 'val' ;

ref_ = Ref.parse( '$fn.prop' ) ;
ref_.set( ctx , true ) ;
doormen.equals( ctx.fn.prop , true ) ;

ref_ = Ref.parse( '$fn.prop2' ) ;
ref_.set( ctx , 'plop' ) ;
doormen.equals( ctx.fn.prop2 , 'plop' ) ;
```

<a name="ref-calling-a-function"></a>
## Calling a function
parse and call a function pointed by a ref.

```js
var ref_ ;

var ctx = {
	a: 1 ,
	b: 2 ,
	fn: function( a , b , c ) {
		return a + b + c + this.a + this.b + this.sub.c ;
	} ,
	sub: {
		c: 3 ,
		fn: function( a ) {
			return a + this.c + this.sub.d ;
		} ,
		sub: {
			d: 4 ,
			fn: function( a ) {
				return a + this.d ;
			}
		}
	}
} ;

ref_ = Ref.parse( '$fn' ) ;
doormen.equals( ref_.callFn( ctx , 4 , 5 , 6 ) , 21 ) ;

ref_ = Ref.parse( '$sub.fn' ) ;
doormen.equals( ref_.callFn( ctx , 10 ) , 17 ) ;

ref_ = Ref.parse( '$sub.sub.fn' ) ;
doormen.equals( ref_.callFn( ctx , -5 ) , -1 ) ;
```

<a name="ref-misc"></a>
## Misc
Ref#getFinalValue().

```js
var ctx = { a: 42 } ;
ctx.b = Ref.create( '$a' ) ;
ctx.c = Ref.create( '$b' ) ;
ctx.d = Ref.create( '$c' ) ;
doormen.equals( ctx.b.getFinalValue( ctx ) , 42 ) ;
doormen.equals( ctx.c.getFinalValue( ctx ) , 42 ) ;
doormen.equals( ctx.d.getFinalValue( ctx ) , 42 ) ;
```

Ref#getRecursiveFinalValue().

```js
var ctx = { a: 42 , container: {} } ;
ctx.container.b = Ref.create( '$a' ) ;
ctx.container.c = Ref.create( '$container.b' ) ;
ctx.container.d = Ref.create( '$container.c' ) ;
ctx.refContainer = Ref.create( '$container' ) ;
doormen.equals( ctx.refContainer.getRecursiveFinalValue( ctx ) , { b:42 , c:42 , d:42 } ) ;
```

Ref#toString().

```js
var ctx = { a: 42 } ;
ctx.b = Ref.create( '$a' ) ;
ctx.c = Ref.create( '$b' ) ;
ctx.d = Ref.create( '$c' ) ;
doormen.equals( ctx.b.toString( ctx ) , "42" ) ;
doormen.equals( ctx.c.toString( ctx ) , "42" ) ;
doormen.equals( ctx.d.toString( ctx ) , "42" ) ;
```

<a name="ref-parser-edge-cases"></a>
## Parser edge cases
Should stop parsing at first non-enclosed space.

```js
var ref_ = Ref.parse( '$x y z' ) ;
doormen.equals( ref_.refParts , [ 'x' ] ) ;
```

<a name="operator-behaviours"></a>
# Operator behaviours
simple stack and reduce on a single object.

```js
var creature = {
	hp: 8 ,
	attack: 5 ,
	defense: 3 ,
	move: 1 ,
	"+defense": 3
} ;

doormen.equals(
	kungFig.stack( creature ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 3 ,
		move: 1 ,
		"+defense": 3
	}
) ;

doormen.equals(
	kungFig.reduce( creature ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 6 ,
		move: 1
	}
) ;
```

simple stack and reduce on two and three objects.

```js
var creature = {
	hp: 8 ,
	attack: 5 ,
	defense: 3 ,
	move: 1 ,
	"+defense": 3
} ;

var amulet = {
	"+defense": 1 ,
	"+hp": 1
} ;

var ring = {
	"+defense": 1 ,
	"#+hp": [1,1]
} ;

doormen.equals(
	kungFig.stack( creature , amulet ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 3 ,
		move: 1 ,
		"#+defense": [3,1] ,
		"+hp": 1
	}
) ;

doormen.equals(
	kungFig.stack( creature , amulet , ring ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 3 ,
		move: 1 ,
		"#+defense": [3,1,1] ,
		"#+hp": [1,1,1]
	}
) ;

doormen.equals(
	kungFig.reduce( {} , creature , amulet ) ,
	{
		hp: 9 ,
		attack: 5 ,
		defense: 7 ,
		move: 1
	}
) ;

doormen.equals(
	kungFig.reduce( {} , creature , amulet , ring ) ,
	{
		hp: 11 ,
		attack: 5 ,
		defense: 8 ,
		move: 1
	}
) ;
```

check stack behaviour bug, when a 'foreach' and 'non-foreach' key are mixed.

```js
var creature = {
	hp: 8 ,
	attack: 5 ,
	defense: 3 ,
	move: 1 ,
	"+defense": 3
} ;

var warrior = {
	hp: 10 ,
	"#+defense": [2] ,
	evasion: 7
} ;

doormen.equals(
	kungFig.stack( creature , warrior ) ,
	{
		attack: 5,
		defense: 3,
		move: 1,
		'#hp': [ 8, 10 ],
		'#+defense': [ 3, 2 ],
		evasion: 7
	}
) ;

doormen.equals(
	kungFig.stack( warrior , creature ) ,
	{
		attack: 5,
		defense: 3,
		move: 1,
		'#hp': [ 10 , 8 ],
		'#+defense': [ 2, 3 ],
		evasion: 7
	}
) ;
```

mixing + and * for the same base key should preserve operation order (first *, then +).

```js
var creature = {
	hp: 8 ,
	attack: 5 ,
	defense: 3 ,
	move: 1
} ;

var shield = {
	"+defense": 3 ,
} ;

var enchantedArmor = {
	"*defense": 2 ,
	"+defense": 1 ,
	"+magic": 1
} ;

var helmet = {
	"+defense": 1 ,
} ;

doormen.equals(
	kungFig.stack( creature , shield , enchantedArmor ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 3 ,
		move: 1 ,
		"#+defense": [3,1] ,
		"*defense": 2 ,
		"+magic": 1
	}
) ;

doormen.equals(
	kungFig.stack( creature , shield , enchantedArmor , helmet ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 3 ,
		move: 1 ,
		"#+defense": [3,1,1] ,
		"*defense": 2 ,
		"+magic": 1
	}
) ;

doormen.equals(
	kungFig.reduce( creature , shield , enchantedArmor , helmet ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 11 ,
		move: 1 ,
		"+magic": 1
	}
) ;
```

the combining after operator *>.

```js
var tree = {
	subtree: {
		a: 3,
		b: 5,
		c: 11
	}
} ;

var mods = {
	"*>subtree": {
		"+a": 1,
		"+b": 3,
		c: 12
	}
} ;

//console.log( kungFig.stack( tree , mods ) ) ;
doormen.equals(
	kungFig.stack( tree , mods ) ,
	{
		//*
		subtree: {
			a: 3,
			b: 5,
			c: 11
		},
		"*>subtree": {
			"+a": 1,
			"+b": 3,
			c: 12
		}
		//*/
		
		/*
		subtree: {
			a: 3,
			b: 5,
			c: 12,
			"+a": 1,
			"+b": 3
		},
		//*/
	}
) ;

doormen.equals(
	kungFig.reduce( tree , mods ) ,
	{
		subtree: {
			a: 4,
			b: 8,
			c: 12
		}
	}
) ;
```

*> and *>> priorities.

```js
var tree = {
	subtree: {
		a: 3,
		b: 5
	}
} ;

var mods1 = {
	"*>>subtree": {
		a: 1
	}
} ;

var mods2 = {
	"*>subtree": {
		a: 2
	}
} ;

doormen.equals(
	kungFig.reduce( tree , mods1 , mods2 ) ,
	{ subtree: { a: 1, b: 5 } }
) ;

doormen.equals(
	kungFig.reduce( tree , mods2 , mods1 ) ,
	{ subtree: { a: 1, b: 5 } }
) ;

tree = {
	subtree: {
		a: 3,
		b: 5
	} ,
	"*>>subtree": {
		a: 1
	} ,
	"*>subtree": {
		a: 2
	}
} ;

doormen.equals(
	kungFig.reduce( tree ) ,
	{ subtree: { a: 1, b: 5 } }
) ;

tree = {
	subtree: {
		a: 3,
		b: 5
	} ,
	"*>subtree": {
		a: 2
	} ,
	"*>>subtree": {
		a: 1
	}
} ;

doormen.equals(
	kungFig.reduce( tree ) ,
	{ subtree: { a: 1, b: 5 } }
) ;
```

<* and <<* priorities.

```js
var tree = {
	subtree: {
		b: 5
	}
} ;

var mods1 = {
	"<<*subtree": {
		a: 1
	}
} ;

var mods2 = {
	"<*subtree": {
		a: 2
	}
} ;

doormen.equals(
	kungFig.reduce( tree , mods1 , mods2 ) ,
	{ subtree: { a: 2, b: 5 } }
) ;

doormen.equals(
	kungFig.reduce( tree , mods2 , mods1 ) ,
	{ subtree: { a: 2, b: 5 } }
) ;

tree = {
	subtree: {
		b: 5
	} ,
	"<<*subtree": {
		a: 1
	} ,
	"<*subtree": {
		a: 2
	}
} ;

doormen.equals(
	kungFig.reduce( tree ) ,
	{ subtree: { a: 2, b: 5 } }
) ;

tree = {
	subtree: {
		b: 5
	} ,
	"<*subtree": {
		a: 2
	} ,
	"<<*subtree": {
		a: 1
	}
} ;

doormen.equals(
	kungFig.reduce( tree ) ,
	{ subtree: { a: 2, b: 5 } }
) ;
```

the combining before operator <*.

```js
var tree = {
	subtree: {
		a: 3,
		b: 5,
		c: 11
	}
} ;

var mods = {
	"<*subtree": {
		"+a": 1,
		"+b": 3,
		c: 12,
		d: 7
	}
} ;

//console.log( kungFig.stack( tree , mods ) ) ;
doormen.equals(
	kungFig.stack( tree , mods ) ,
	{
		//*
		subtree: {
			a: 3,
			b: 5,
			c: 11
		},
		"<*subtree": {
			"+a": 1,
			"+b": 3,
			c: 12,
			d: 7
		}
		//*/
		
		/*
		subtree: {
			a: 3,
			b: 5,
			c: 11,
			d: 7,
			"+a": 1,
			"+b": 3
		}
		//*/
	}
) ;

doormen.equals(
	kungFig.reduce( tree , mods ) ,
	{
		subtree: {
			a: 4,
			b: 8,
			c: 11,
			d: 7
		}
	}
) ;
```

the combining after operator *> with no baseKey should combine in the root element.

```js
var tree = {
	a: 3,
	b: 5,
	c: 11
} ;

var mods = {
	"*>": {
		"+a": 1,
		"+b": 3,
		c: 12
	}
} ;

//console.log( kungFig.stack( tree , mods ) ) ;
doormen.equals(
	kungFig.stack( tree , mods ) ,
	//*
	{
		a: 3,
		b: 5,
		c: 11,
		"*>": {
			"+a": 1,
			"+b": 3,
			c: 12
		}
	}
	//*/
	
	/*
	{
		a: 3,
		b: 5,
		c: 12,
		"+a": 1,
		"+b": 3
	}
	//*/
) ;

doormen.equals(
	kungFig.reduce( tree , mods ) ,
	{
		a: 4,
		b: 8,
		c: 12
	}
) ;

//console.log( "\n---------\n" ) ;

tree = {
	a: 3,
	b: 5,
	c: 11,
	"*>": {
		"+a": 1,
		"+b": 3,
		c: 12
	}
} ;

doormen.equals(
	kungFig.reduce( tree ) ,
	{
		a: 4,
		b: 8,
		c: 12
	}
) ;
```

the combining before operator <* with no baseKey should combine in the root element.

```js
var tree = {
	a: 3,
	b: 5,
	c: 11
} ;

var mods = {
	"<*": {
		"+a": 1,
		"+b": 3,
		c: 12,
		d: 7
	}
} ;

//console.log( kungFig.stack( tree , mods ) ) ;
doormen.equals(
	kungFig.stack( tree , mods ) ,
	//*
	{
		a: 3,
		b: 5,
		c: 11,
		"<*": {
			"+a": 1,
			"+b": 3,
			c: 12,
			d: 7
		}
	}
	//*/
	
	/*
	{
		a: 3,
		b: 5,
		c: 11,
		d: 7,
		"+a": 1,
		"+b": 3
	}
	//*/
) ;

doormen.equals(
	kungFig.reduce( tree , mods ) ,
	{
		a: 4,
		b: 8,
		c: 11,
		d: 7
	}
) ;

tree = {
	a: 3,
	b: 5,
	c: 11,
	"<*": {
		"+a": 1,
		"+b": 3,
		c: 12,
		d: 7
	}
} ;

doormen.equals(
	kungFig.reduce( tree ) ,
	{
		a: 4,
		b: 8,
		c: 11,
		d: 7
	}
) ;
```

root and non-root operator priorities.

```js
var tree = {
	subtree: {
		a: 3,
		b: 5
	}
} ;

var mods1 = {
	"*>subtree": {
		a: 1
	}
} ;

var mods2 = {
	"*>": {
		subtree: {
			a: 2
		}
	}
} ;

doormen.equals(
	kungFig.reduce( tree , mods1 , mods2 ) ,
	{ subtree: { a: 2, b: 5 } }
) ;

doormen.equals(
	kungFig.reduce( tree , mods2 , mods1 ) ,
	{ subtree: { a: 2, b: 5 } }
) ;

tree = {
	subtree: {
		a: 3,
		b: 5
	} ,
	"*>subtree": {
		a: 1
	} ,
	"*>": {
		subtree: {
			a: 2
		}
	}
} ;

doormen.equals(
	kungFig.reduce( tree ) ,
	{ subtree: { a: 2, b: 5 } }
) ;

tree = {
	subtree: {
		a: 3,
		b: 5
	} ,
	"*>": {
		subtree: {
			a: 2
		}
	} ,
	"*>subtree": {
		a: 1
	}
} ;

doormen.equals(
	kungFig.reduce( tree ) ,
	{ subtree: { a: 2, b: 5 } }
) ;
```

the concat after (append) operator +>.

```js
var tree = {
	array: [ 3,5,11 ]
} ;

var mods = {
	"+>array": [ 2,7 ]
} ;

//console.log( kungFig.stack( tree , mods ) ) ;
doormen.equals(
	kungFig.stack( tree , mods ) ,
	{
		array: [ 3,5,11 ],
		"+>array": [ 2,7 ]
	}
) ;

doormen.equals(
	kungFig.reduce( tree , mods ) ,
	{
		array: [ 3,5,11,2,7 ]
	}
) ;
```

the concat before (prepend) operator <+.

```js
var tree = {
	array: [ 3,5,11 ]
} ;

var mods = {
	"<+array": [ 2,7 ]
} ;

//console.log( kungFig.stack( tree , mods ) ) ;
doormen.equals(
	kungFig.stack( tree , mods ) ,
	{
		array: [ 3,5,11 ],
		"<+array": [ 2,7 ]
	}
) ;

doormen.equals(
	kungFig.reduce( tree , mods ) ,
	{
		array: [ 2,7,3,5,11 ]
	}
) ;
```

arrays should not be combined recursively.

```js
var o = { a: [ { b: 2, c: 3 }, { d: 5 } ] } ;
var o2 = { a: [ { b: 52 } ] } ;

doormen.equals(
	kungFig.reduce( {} , o , o2 ) ,
	{ a: [ { b: 52 } ] }
) ;
```

<a name="complex-deeper-test"></a>
# Complex, deeper test
simple foreach.

```js
var creature = {
	hp: 8 ,
	attack: 5 ,
	defense: 3 ,
	move: 1 ,
	"#+defense": [3,4,5]
} ;

doormen.equals(
	kungFig.reduce( creature ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 15 ,
		move: 1
	}
) ;
```

combining foreach on nested objects.

```js
var creature = {
	hp: 8 ,
	attack: 5 ,
	defense: 3 ,
	move: 1 ,
	attacks: {
		kick: {
			toHit: 10,
			damage: 15,
			elements: {
				impact: true
			}
		}
	} ,
	"#*>": [
		{
			hp: 10,
			evasion: 5,
			attacks: {
				kick: {
					toHit: 8,
					elements: {
						lightning: true,
						wind: true
					}
				}
			}
		} ,
		{
			hp: 9,
			attacks: {
				kick: {
					elements: {
						fire: true,
						wind: false
					}
				}
			}
		}
	]
} ;

doormen.equals(
	kungFig.reduce( creature ) ,
	{
		hp: 9 ,
		attack: 5 ,
		defense: 3 ,
		move: 1 ,
		evasion: 5 ,
		attacks: {
			kick: {
				toHit: 8,
				damage: 15,
				elements: {
					impact: true,
					lightning: true,
					fire: true,
					wind: false
				}
			}
		} ,
	}
) ;
```

<a name="to-regular-object"></a>
# To regular object
simple tree-ops object.

```js
var creature = {
	hp: 8 ,
	attack: 5 ,
	"*attack": 1.2 ,
	defense: 3 ,
	move: 1 ,
	"+defense": 3
} ;

doormen.equals(
	kungFig.toObject( creature ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 3 ,
		move: 1 ,
	}
) ;

doormen.equals(
	kungFig.reduceToObject( creature ) ,
	{
		hp: 8 ,
		attack: 6 ,
		defense: 6 ,
		move: 1
	}
) ;
```

edge cases.

```js
var o = {
	"()*.kfg": "*.gz" ,
	"()*/*.jpeg": "*/*.jpg"
} ;

doormen.equals(
	kungFig.toObject( o ) ,
	{
		"*.kfg": "*.gz" ,
		"*/*.jpeg": "*/*.jpg"
	}
) ;

doormen.equals(
	kungFig.reduceToObject( o ) ,
	{
		"*.kfg": "*.gz" ,
		"*/*.jpeg": "*/*.jpg"
	}
) ;
```

<a name="operator-extensions"></a>
# Operator extensions
simple operator extension.

```js
var ext = kungFig.extendOperators( {
	pow: {
		priority: 100 ,
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
				existing = Math.pow( + existing , operand ) ;
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
	}
} ) ;

var tree = {
	a: 3,
	b: 5,
	"+b": 2,
	"(pow)a": 2
} ;

//console.log( ext ) ;

doormen.equals(
	ext.reduce( tree ) ,
	{ a: 9, b: 7 }
) ;

tree = {
	a: 3,
	b: 5,
	"(pow)a": 2
} ;

var mods = {
	"(pow)a": 3
} ;

//console.log( ext.stack( tree , mods ) ) ;

doormen.equals(
	ext.stack( tree , mods ) ,
	{ a: 3, b: 5, "(#pow)a": [2,3] }
) ;

//console.log( ext.reduce( tree , mods ) ) ;

doormen.equals(
	ext.reduce( tree , mods ) ,
	{ a: 729, b: 5 }
) ;
```

