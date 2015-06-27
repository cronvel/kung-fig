# TOC
   - [Loading a config](#loading-a-config)
   - [Saving a config](#saving-a-config)
<a name=""></a>
 
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

should load flawlessly a config which is an array with many circular includes.

```js
// Build the circular config here
var shouldBe = [ "world!" ] ;

var a = [ "data" ] ;
var b = [ "data" ] ;
a[ 1 ] = b ;
b[ 1 ] = a ;

shouldBe[ 1 ] = a ;
shouldBe[ 2 ] = b ;

doormen.equals( kungFig.load( __dirname + '/sample/withCircularIncludesArray.json' ) , shouldBe ) ;
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

should load flawlessly a config which is an array with a circular reference to itself.

```js
// Build the circular config here
var shouldBe = [ "A" , [ "value" ] ] ;
shouldBe[ 1 ][ 1 ] = shouldBe ;

doormen.equals( kungFig.load( __dirname + '/sample/selfCircularReferenceArray.json' ) , shouldBe ) ;
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

//console.log( kungFig.save( conf ) ) ;
doormen.equals( kungFig.save( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!"\n  }\n}' ) ;
```

should stringify a config of arrays.

```js
var str ;

str = kungFig.save( kungFig.load( __dirname + '/sample/withIncludesRefArray.json' ) ) ;
//console.log( str ) ;
doormen.equals( str , '[\n  "test",\n  [\n    3,\n    [\n      "hello",\n      "world!"\n    ],\n    {\n      "just": "a",\n      "simple": {\n        "test": "!"\n      }\n    }\n  ],\n  [\n    "world!",\n    "hello",\n    3\n  ]\n]' ) ;
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

//console.log( kungFig.save( conf ) ) ;
doormen.equals( kungFig.save( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "circular": "@:"\n  }\n}' ) ;


var conf = {
	a: "Haha!",
	b: "Bee!",
	sub: {
		c: "See!"
	}
} ;

conf.sub.circular = conf.sub ;

//console.log( kungFig.save( conf ) ) ;
doormen.equals( kungFig.save( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "circular": "@:sub"\n  }\n}' ) ;


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

//console.log( kungFig.save( conf ) ) ;
doormen.equals(
	kungFig.save( conf ) , 
	'{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "sub": {\n      "c": "See!",\n      "circular": "@:sub.sub"\n    }\n  }\n}'
) ;
```

should load and save flawlessly a config with many circular includes.

```js
var str ;

str = kungFig.save( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
//console.log( str ) ;
doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "toBe": "@:circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "toA": "@:circularOne"\n  }\n}' ) ;
```

should load and save flawlessly a config which is an array with many circular includes.

```js
var str ;

str = kungFig.save( kungFig.load( __dirname + '/sample/withCircularIncludesArray.json' ) ) ;
//console.log( str ) ;
doormen.equals( str , '[\n  "world!",\n  [\n    "data",\n    "@:#2"\n  ],\n  [\n    "data",\n    "@:#1"\n  ]\n]' ) ;
```

