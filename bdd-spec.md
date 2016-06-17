# TOC
   - [KFG stringify](#kfg-stringify)
   - [KFG parse](#kfg-parse)
   - [Tag proxy](#tag-proxy)
   - [LabelTag](#labeltag)
   - [ClassicTag](#classictag)
   - [Loading a config](#loading-a-config)
   - [Saving a config](#saving-a-config)
   - [JS modules](#js-modules)
   - [Array references](#array-references)
   - [Operator behaviours](#operator-behaviours)
   - [Complex, deeper test](#complex-deeper-test)
   - [Operator extensions](#operator-extensions)
<a name=""></a>
 
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
doormen.equals( stringify( { tpl: Template.create( 'Hey!\nHello ${name}!' ) } ) , 'tpl: $> Hey!\n\t$> Hello ${name}!\n' ) ;
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

o = parse( "tpl: $> Hello ${name}!" , { proxy: { data: { name: "Bill" } } } ) ;
doormen.equals( o.tpl.toString() , 'Hello Bill!' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;

o = parse( "tpl:\n\t$> Hello ${name}!" ) ;
doormen.equals( o.tpl.toString() , 'Hello (undefined)!' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;

o = parse( "tpl:\n\t$> Hello ${name}!\n\t$> How are you ${name}?" ) ;
doormen.equals( o.tpl.toString() , 'Hello (undefined)!\nHow are you (undefined)?' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!\nHow are you Bob?' ) ;

o = parse( "tpl:\n\t$> Hello ${name}!\n\t$> How are you ${name}?" , { proxy: { data: { name: "Bill" } } } ) ;
doormen.equals( o.tpl.toString() , 'Hello Bill!\nHow are you Bill?' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!\nHow are you Bob?' ) ;

o = parse( 'tpl: $"Hello ${name}!"' ) ;
doormen.equals( o.tpl.toString() , 'Hello (undefined)!' ) ;
doormen.equals( o.tpl.toString( { name: "Bob" } ) , 'Hello Bob!' ) ;

o = parse( 'tpl: $"Hello ${name}!"' , { proxy: { data: { name: "Bill" } } } ) ;
doormen.equals( o.tpl.toString() , 'Hello Bill!' ) ;
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
doormen.equals( JSON.stringify( parse( '[tag] text' ) ) , '{"children":[{"name":"tag","attributes":null,"content":"text"}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] "text"' ) ) , '{"children":[{"name":"tag","attributes":null,"content":"text"}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] > text' ) ) , '{"children":[{"name":"tag","attributes":null,"content":"text"}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag]\n\t> text' ) ) , '{"children":[{"name":"tag","attributes":null,"content":"text"}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] true' ) ) , '{"children":[{"name":"tag","attributes":null,"content":true}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] 123' ) ) , '{"children":[{"name":"tag","attributes":null,"content":123}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] <Object>' ) ) , '{"children":[{"name":"tag","attributes":null,"content":{}}]}' ) ;
doormen.equals( JSON.stringify( parse( '[tag] <Object>\n\ta: 1\n\tb: 2' ) ) , '{"children":[{"name":"tag","attributes":null,"content":{"a":1,"b":2}}]}' ) ;
```

parse a file containing tags.

```js
var o = parse( fs.readFileSync( __dirname + '/sample/kfg/tag.kfg' , 'utf8' ) ) ;

//console.log( o ) ;
//console.log( string.inspect( { style: 'color' , depth: 15 } , o ) ) ;
//console.log( string.escape.control( JSON.stringify( o ) ) ) ;

doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","attributes":"id1","content":{"some":"value","another":"one"}},{"name":"tag","attributes":"id2","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","attributes":"something > constant","content":{"children":[{"name":"do","attributes":null,"content":"some work"}]}},{"name":"else","attributes":null,"content":{"children":[{"name":"do","attributes":null,"content":"something else"}]}}]}}}},{"name":"container","attributes":null,"content":{"children":[{"name":"tag","attributes":null},{"name":"anothertag","attributes":null},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]}}]}' ) ;
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

doormen.equals( JSON.stringify( o ) , '{"children":[{"name":"tag","attributes":"id1","content":{"some":"value","another":"one"}},{"name":"tag","attributes":"id2","content":{"some":"other value","nested":{"a":1,"b":2,"c":{"children":[{"name":"if","attributes":{"left":"something","operator":">","right":"constant"},"content":{"children":[{"name":"do","attributes":null,"content":"some work"}]}},{"name":"else","attributes":null,"content":{"children":[{"name":"do","attributes":null,"content":"something else"}]}}]}}}},{"name":"container","attributes":null,"content":{"children":[{"name":"tag","attributes":null},{"name":"anothertag","attributes":null},{"name":"complex","attributes":"tag hello=\\"<world]]]\\\\\\"!\\" some[3].path[6]"}]}}]}' ) ;
```

<a name="tag-proxy"></a>
# Tag proxy
tag proxy basic test.

```js
var o , proxy ;

function CustomTag() {}
CustomTag.prototype = Object.create( Tag.prototype ) ;
CustomTag.prototype.constructor = CustomTag ;

CustomTag.create = function( tag , attributes , content , shouldParse ) {
	var self = Object.create( CustomTag.prototype ) ;
	Tag.call( self , tag , attributes , content , shouldParse ) ;
	return self ;
} ;
CustomTag.create.proxyMode = 'local' ;

proxy = { data: { name: "Bill" } } ;
o = parse( '[tag] $"Hello ${name}!"' , { proxy: proxy , tags: { custom: CustomTag.create } } ) ;
doormen.equals( o.children[0].content.toString() , 'Hello Bill!' ) ;
proxy.data.name = "Jack" ;
doormen.equals( o.children[0].content.toString() , 'Hello Jack!' ) ;

proxy = { data: { name: "Bill" } } ;
o = parse( '[custom] $"Hello ${name}!"' , { proxy: proxy , tags: { custom: CustomTag.create } } ) ;
doormen.equals( o.children[0].proxy !== proxy , true ) ;
doormen.equals( Object.getPrototypeOf( o.children[0].proxy ) !== proxy , true ) ;
//console.log( o.children[0].proxy ) ;
doormen.equals( o.children[0].content.toString() , 'Hello (undefined)!' ) ;
proxy.data.name = "Jack" ;
doormen.equals( o.children[0].content.toString() , 'Hello (undefined)!' ) ;
o.children[0].proxy.data.name = "Jenny" ;
doormen.equals( o.children[0].content.toString() , 'Hello Jenny!' ) ;

CustomTag.create.proxyMode = 'inherit' ;
proxy = { data: { name: "Bill" } } ;
o = parse( '[custom] $"Hello ${name}!"' , { proxy: proxy , tags: { custom: CustomTag.create } } ) ;
doormen.equals( o.children[0].proxy !== proxy , true ) ;
doormen.equals( Object.getPrototypeOf( o.children[0].proxy ) === proxy , true ) ;
doormen.equals( o.children[0].proxy.data !== proxy.data , true ) ;
doormen.equals( Object.getPrototypeOf( o.children[0].proxy.data ) === proxy.data , true ) ;
//console.log( o.children[0].proxy ) ;
doormen.equals( o.children[0].content.toString() , 'Hello Bill!' ) ;
proxy.data.name = "Jack" ;
doormen.equals( o.children[0].content.toString() , 'Hello Jack!' ) ;
o.children[0].proxy.data.name = "Jenny" ;
doormen.equals( o.children[0].content.toString() , 'Hello Jenny!' ) ;
proxy.data.name = "Jack" ;
doormen.equals( o.children[0].content.toString() , 'Hello Jenny!' ) ;

CustomTag.create.proxyMode = 'links' ;
proxy = { data: { name: "Bill" } } ;
o = parse( '[custom] $"Hello ${name} and ${.name}!"' , { proxy: proxy , tags: { custom: CustomTag.create } } ) ;
doormen.equals( o.children[0].proxy !== proxy , true ) ;
doormen.equals( Object.getPrototypeOf( o.children[0].proxy ) !== proxy , true ) ;
doormen.equals( o.children[0].proxy.__parent === proxy , true ) ;
doormen.equals( o.children[0].proxy.data[''] === proxy.data , true ) ;
//console.log( o.children[0].proxy ) ;
doormen.equals( o.children[0].content.toString() , 'Hello (undefined) and Bill!' ) ;
proxy.data.name = "Jack" ;
doormen.equals( o.children[0].content.toString() , 'Hello (undefined) and Jack!' ) ;
o.children[0].proxy.data.name = "Jenny" ;
doormen.equals( o.children[0].content.toString() , 'Hello Jenny and Jack!' ) ;
proxy.data.name = "Jim" ;
doormen.equals( o.children[0].content.toString() , 'Hello Jenny and Jim!' ) ;

CustomTag.create.proxyMode = 'links' ;
proxy = { data: { name: "Bill" } } ;
o = parse( '[custom] $"Hello ${name} and ${%.name}!"' , { proxy: proxy , tags: { custom: CustomTag.create } } ) ;
doormen.equals( o.children[0].content.toString() , 'Hello (undefined) and Bill!' ) ;
proxy.data.name = "Jack" ;
doormen.equals( o.children[0].content.toString() , 'Hello (undefined) and Jack!' ) ;
o.children[0].proxy.data.name = "Jenny" ;
doormen.equals( o.children[0].content.toString() , 'Hello Jenny and Jack!' ) ;
proxy.data.name = "Jim" ;
doormen.equals( o.children[0].content.toString() , 'Hello Jenny and Jim!' ) ;
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

