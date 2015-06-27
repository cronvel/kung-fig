{
  "hello": "world!",
  "circularOne": {
    "some": "data",
    "toBe": "@:circularTwo"
  },
  "circularTwo": {
    "more": "data",
    "toA": "@:circularOne"
  }
}
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
zzz should stringify a simple config.

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

should load flawlessly a config with many circular includes.

```js
var str ;

str = kungFig.save( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
console.log( str ) ;
doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "toBe": "@:circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "toA": "@:circularOne"\n  }\n}' ) ;
```

