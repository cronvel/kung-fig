# TOC
   - [Loading a config](#loading-a-config)
   - [Saving a config](#saving-a-config)
   - [JS modules](#js-modules)
   - [Operator behaviours](#operator-behaviours)
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

when loading a file with and unexistant dependency using the '@', it should throw.

```js
doormen.shouldThrow( function() { kungFig.load( __dirname + '/sample/withUnexistantInclude.json' ) ; } ) ;
```

when loading a file with and unexistant dependency using the '?@', it should not throw.

```js
doormen.equals(
	kungFig.load( __dirname + '/sample/withUnexistantOptionalInclude.json' ) ,
	{
		simple: "test",
		unexistant: {}
	}
) ;
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
doormen.equals( kungFig.save( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@circular": ";"\n  }\n}' ) ;


var conf = {
	a: "Haha!",
	b: "Bee!",
	sub: {
		c: "See!"
	}
} ;

conf.sub.circular = conf.sub ;

//console.log( kungFig.save( conf ) ) ;
doormen.equals( kungFig.save( conf ) , '{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "c": "See!",\n    "@circular": ";sub"\n  }\n}' ) ;


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
	'{\n  "a": "Haha!",\n  "b": "Bee!",\n  "sub": {\n    "sub": {\n      "c": "See!",\n      "@circular": ";sub.sub"\n    }\n  }\n}'
) ;
```

should load and save flawlessly a config with many circular includes.

```js
var str ;

str = kungFig.save( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) ) ;
//console.log( str ) ;
doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@toBe": ";circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@toA": ";circularOne"\n  }\n}' ) ;
```

should load and save flawlessly a config with many circular includes.

```js
var str ;

kungFig.save( kungFig.load( __dirname + '/sample/withCircularIncludes.json' ) , __dirname + '/output.json' ) ;
str = fs.readFileSync( __dirname + '/output.json' ).toString() ;
//console.log( str ) ;
doormen.equals( str , '{\n  "hello": "world!",\n  "circularOne": {\n    "some": "data",\n    "@toBe": ";circularTwo"\n  },\n  "circularTwo": {\n    "more": "data",\n    "@toA": ";circularOne"\n  }\n}' ) ;
fs.unlinkSync( __dirname + '/output.json' ) ;
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

the combining operator *>.

```js
var tree = {
	subtree: {
		a: 3,
		b: 5
	}
} ;

var mods = {
	"*>subtree": {
		"+a": 1,
		"+b": 3
	}
} ;

doormen.equals(
	kungFig.stack( tree , mods ) ,
	{
		subtree: {
			a: 3,
			b: 5,
			"+a": 1,
			"+b": 3
		}
	}
) ;

doormen.equals(
	kungFig.reduce( tree , mods ) ,
	{
		subtree: {
			a: 4,
			b: 8
		}
	}
) ;
```

the combining operator *> with no baseKey should combine in the root element.

```js
var tree = {
	a: 3,
	b: 5
} ;

var mods = {
	"*>": {
		"+a": 1,
		"+b": 3
	}
} ;

doormen.equals(
	kungFig.stack( tree , mods ) ,
	{
		a: 3,
		b: 5,
		"+a": 1,
		"+b": 3
	}
) ;

doormen.equals(
	kungFig.reduce( tree , mods ) ,
	{
		a: 4,
		b: 8
	}
) ;

var tree = {
	a: 3,
	b: 5,
	"*>": {
		"+a": 1,
		"+b": 3
	}
} ;

doormen.equals(
	kungFig.reduce( tree ) ,
	{
		a: 4,
		b: 8
	}
) ;
```

