# TOC
   - [kfg stringify](#kfg-stringify)
   - [kfg parse](#kfg-parse)
   - [Loading a config](#loading-a-config)
   - [Saving a config](#saving-a-config)
   - [JS modules](#js-modules)
   - [Array references](#array-references)
   - [Operator behaviours](#operator-behaviours)
<a name=""></a>
 
<a name="kfg-stringify"></a>
# kfg stringify
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
	'#hey': 5,
	'@*>': '/path/to/something/',
	'@': '/path/to/something/',
	'@@': '/path/to/something/',
} ;

var s = stringify( o ) ;
//console.log( s ) ;
//console.log( parse( s ) ) ;

var expected = 'attack: (+) 2\ndefense: (-) 1\ntime: (*) 0.9\ndamages: (u-ops) 1.2\n+strange key: 3\n"(another strange key)": 5\n"-hey": 5\n"#hey": 5\n(*>) @/path/to/something/\n() @/path/to/something/\n() @@/path/to/something/\n' ;
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

expect( o2.bin ).to.be.an( Buffer ) ;
expect( o2.bin.toString( 'hex' ) ).to.be( o.bin.toString( 'hex' ) ) ;

delete o.bin ;
delete o2.bin ;

doormen.equals( o , o2 ) ;
```

<a name="kfg-parse"></a>
# kfg parse
parse a basic file.

```js
var o ;

o = parse( fs.readFileSync( __dirname + '/sample/kfg/simple.kfg' , 'utf8' ) ) ;

//console.log( require( 'util' ).inspect( o , { depth: 10 } ) ) ;

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
	sub: 
		{ sub: { 'another key': 'another value' },
		k: 1,
		l: 2,
		sub2: { subway: 'no!' } },
	sub2: { no: 'way' },
	sub3: { nooo: 'wai!' },
	text: "A cool story:\n\nIt all started a Friday..." ,
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

parse a file with operators.

```js
var o ;

o = parse( fs.readFileSync( __dirname + '/sample/kfg/ops.kfg' , 'utf8' ) ) ;

//console.log( require( 'util' ).inspect( o , { depth: 10 } ) ) ;

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
	'@*>': 'path/to/something',
} ) ;
```

parse a file with special instances (bin, date, regex).

```js
var o ;

o = parse( fs.readFileSync( __dirname + '/sample/kfg/instances.kfg' , 'utf8' ) ) ;

//console.log( require( 'util' ).inspect( o , { depth: 10 } ) ) ;
//console.log( JSON.stringify( o ) ) ;

doormen.equals(
	JSON.stringify( o ) ,
	'{"a":1234,"bin":{"type":"Buffer","data":[253,16,75,25]},"date1":"2016-04-29T10:08:14.000Z","date2":"2016-04-29T10:08:08.645Z","b":"toto","regex1":{},"sub":{"sub":{"date3":"1970-01-01T00:00:01.000Z","regex2":{}}},"d":2}'
) ;

doormen.equals( o.regex1 instanceof RegExp , true ) ;
doormen.equals( o.regex1.toString() , "/abc/" ) ;

doormen.equals( o.sub.sub.regex2 instanceof RegExp , true ) ;
doormen.equals( o.sub.sub.regex2.toString() , "/abc/m" ) ;

doormen.equals( o.bin.toString( 'hex' ) , "fd104b19" ) ;
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

when loading a file with and unexistant dependency using the '@@', it should throw.

```js
doormen.shouldThrow( function() { kungFig.load( __dirname + '/sample/withUnexistantInclude.json' ) ; } ) ;
```

when loading a file with and unexistant dependency using the '@', it should not throw.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withUnexistantOptionalInclude.json' ) ,
	{
		simple: "test",
		unexistant: {}
	}
) ;
```

when loading a file with and bad JSON content dependency using the '@', it should throw.

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

//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
doormen.equals( kungFig.saveJson( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": ";"\n  }\n}' ) ;
doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@;\n' ) ;


var conf = {
	a: "Haha!",
	b: "Bee!",
	sub: {
		c: "See!"
	}
} ;

conf.sub.circular = conf.sub ;

//console.log( kungFig.saveKfg( conf ).replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
doormen.equals( kungFig.saveJson( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@@circular": ";sub"\n  }\n}' ) ;
doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tc: See!\n\tcircular: @@;sub\n' ) ;


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
	'{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "sub": {\n      "c": "See!",\n      "@@circular": ";sub.sub"\n    }\n  }\n}'
) ;
doormen.equals( kungFig.saveKfg( conf ) , 'a: Haha!\nb: Bee!\nsub:\n\tsub:\n\t\tc: See!\n\t\tcircular: @@;sub.sub\n' ) ;
```

should load and save flawlessly a config with many circular includes.

```js
var str ;

str = kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
//console.log( str ) ;
doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": ";circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": ";circularOne"\n  }\n}' ) ;

str = kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
//console.log( str ) ;
//console.log( str.replace( /\n/g , () => '\\n' ).replace( /\t/g , () => '\\t' ) ) ;
doormen.equals( str , "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@;circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@;circularOne\n" ) ;
```

should load and save to disk flawlessly a config with many circular includes.

```js
var str ;

kungFig.saveJson( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.json' ) ;
str = fs.readFileSync( __dirname + '/output.json' ).toString() ;
//console.log( str ) ;
doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@@toBe": ";circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@@toA": ";circularOne"\n  }\n}' ) ;
fs.unlinkSync( __dirname + '/output.json' ) ;

kungFig.saveKfg( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.kfg' ) ;
str = fs.readFileSync( __dirname + '/output.kfg' ).toString() ;
//console.log( str ) ;
doormen.equals( str , "hello: world!\ncircularOne:\n\tsome: data\n\ttoBe: @@;circularTwo\ncircularTwo:\n\tmore: data\n\ttoA: @@;circularOne\n" ) ;
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
doormen.equals( str , '[\n  "world!",\n  [\n    "data",\n    {\n      "@@": ";[2]"\n    }\n  ],\n  [\n    "data",\n    {\n      "@@": ";[1]"\n    }\n  ]\n]' ) ;
```

<a name="operator-behaviours"></a>
# Operator behaviours
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

doormen.equals(
	kungFig.stack( creature , shield , enchantedArmor ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 3 ,
		move: 1 ,
		"+defense": 4 ,
		"*defense": 2 ,
		"+magic": 1
	}
) ;

doormen.equals(
	kungFig.reduce( creature , shield , enchantedArmor ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 10 ,
		move: 1 ,
		"+magic": 1
	}
) ;
```

- and / should be converted to + and *.

```js
var creature = {
	hp: 8 ,
	attack: 5 ,
	defense: 8 ,
	move: 1
} ;

var cursedAmulet = {
	"-defense": 2 ,
} ;

var cursedRing = {
	"/defense": 2 ,
} ;

doormen.equals(
	kungFig.stack( cursedAmulet ) ,
	{ "+defense": -2 }
) ;

doormen.equals(
	kungFig.stack( cursedRing ) ,
	{ "*defense": 0.5 }
) ;

doormen.equals(
	kungFig.stack( cursedAmulet , cursedRing ) ,
	{
		"+defense": -2 ,
		"*defense": 0.5
	}
) ;

doormen.equals(
	kungFig.stack( creature , cursedAmulet , cursedRing ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 8 ,
		"+defense": -2 ,
		"*defense": 0.5 ,
		move: 1
	}
) ;

doormen.equals(
	kungFig.reduce( creature , cursedAmulet , cursedRing ) ,
	{
		hp: 8 ,
		attack: 5 ,
		defense: 2 ,
		move: 1
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

var tree = {
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

var tree = {
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

arrays should not be combined recursively.

```js
var o = { a: [ { b: 2, c: 3 }, { d: 5 } ] } ;
var o2 = { a: [ { b: 52 } ] } ;

doormen.equals(
	kungFig.reduce( {} , o , o2 ) ,
	{ a: [ { b: 52 } ] }
) ;
```

