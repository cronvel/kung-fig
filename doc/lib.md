<a name="ref"></a>
# Kung-Fig Lib References

### Table of Contents

* [The Wonderful KFG Format](KFG.md)
* [Basic Module Methods](#ref.basic)
	* [.load()](#ref.load)
	* [.loadMeta()](#ref.loadMeta)
	* [.saveJson()](#ref.saveJson)
	* [.saveKfg()](#ref.saveKfg)
* [The Dynamic Interface](#ref.Dynamic)
	* [.get(), .getValue()](#ref.Dynamic.get)
	* [.getFinalValue()](#ref.Dynamic.getFinalValue)
	* [.getRecursiveFinalValue()](#ref.Dynamic.getRecursiveFinalValue)
	* [.toString()](#ref.Dynamic.toString)
	* [.apply()](#ref.Dynamic.apply)
	* [.set()](#ref.Dynamic.set)
* [The Ref Class](#ref.Ref)
	* [Ref.create()](#ref.Ref.create)
	* [Ref.parse()](#ref.Ref.parse)
	* [.setRef()](#ref.Ref.setRef)
	* [.get(), .getValue()](#ref.Ref.get)
	* [.set()](#ref.Ref.set)
* [The Template Class](#ref.Template)
	* [Template.create()](#ref.Template.create)
* [The TemplateElement Class](#ref.TemplateElement)
	* [TemplateElement.parse()](#ref.TemplateElement.parse)
	* [TemplateElement.create()](#ref.TemplateElement.create)
* [The Expression Class](#ref.Expression)
	* [Expression.parse()](#ref.Expression.parse)
	* [Expression.create()](#ref.Expression.create)

*Documentation TODO:*
* [.reduce()](#ref.reduce)
* [.autoReduce()](#ref.autoReduce)
* [The Expression Class](#ref.Expression)
* [The Tag Class](#ref.Tag)
* [The TagContainer Class](#ref.TagContainer)



<a name="ref.basic"></a>
## Basic Module Methods

Those are top-level module methods.

In all the following examples, it is assumed that `var kungFig = require( 'kung-fig' )`, and all the following
are methods of the `kungFig` object.



<a name="ref.load"></a>
### .load( filePath , [options] )

* filePath `string` the path of the file to load
* options `object` (optional) an object of options, where:
	* cwd `string` override the Current Working Directory
	* reduce `boolean` (default: true) if true, the config is reduced (see [.autoReduce()](#ref.autoReduce))
	* doctype `string` or `array` of `string` (KFG only) if set, the KFG file to load **MUST** have a meta tag *doctype*
	  and it should match the doctype string or be listed in the doctype array
	* kfgFiles `object` where:
		* extname `array` of `string` the extension list (without the initial dot) that should be treated as KFG files
		* basename `array` of `string` the filename list (including the extension part) that should be treated as KFG files
	* metaHook `function( metaContainer , options )` (KFG only) a callback triggered once the header part of the file
	  is parsed, where:
		* metaContainer `TagContainer` the meta-tag container, see [TagContainer](#ref.TagContainer)
		* options `object` mostly reserved, where:
			* isInclude `boolean` true if the hook is not called for the top-level document's file
			  but for an included document
			* file `string` the path of the file of the current document, if any
	* classes `object` (KFG only) each key is a class name and each value is the constructor to build the instance.
	  Constructors are of type `function( data )` where `data` is the parsed value used to instanciate the object.
	* tags `object` (KFG only) each key is a tag name and each value is the constructor to build the tag. Constructor are of
	  type `function( tagName , attributes , content , shouldParseAttributes , runtime )` where:
		* tagName `string` the name of the tag to instanciate
		* attributes `mixed` the attributes of the tag, if `shouldParseAttributes` is *true*, this is a `string` and
		  it should be parsed
		* content `mixed` this is the parsed content of the tag
		* shouldParseAttributes `boolean` it true, the `attributes` argument is a raw string and should be parsed,
		  if false the `attributes` argument contains the parsed argument, in whatever type the tag use (usually `object`)
		* runtime `object` reserved
	  The prototype of the tag constructor **MUST** be an instance of `Tag.prototype`, see [Tag](#ref.Tag).
	* metaTags `object` (KFG only) works just like the `tags` option but for meta-tags
	* operators `object` (KFG only) custom operators for Expression, the key is the operator string that should be
	  in the Expression, the value is a `function( args )` that should compute the operation, where `args` is an array
	  of argument. See [Expression](#ref.Expression).
	* fileObjectMap `object` reserved

This synchronously load the file using the *filePath* argument, parse it and return it.

If the document contains includes, there are all resolved synchronously before returning.

Available file types are:

* [KFG](KFG.md) (*.kfg)
* JSON (*.json)
* Node.js Javascript module (*.js)
* Raw text files (*.txt, or any unknown extension)

The path can be absolute, relative (to the Current Working Directory), or relative using the
[recursive parent search feature](KFG.md#ref.includes.recursive-parent-search).

If the document contains tags that don't exist in the `options.tags` argument, there are instanciated using the 
built-in [Tag](#ref.Tag) constructor.

Simple document loading example:

```js
var kungFig = require( 'kung-fig' ) ;
var document = kungFig.load( 'path/to/my/document.kfg' ) ;
```



<a name="ref.loadMeta"></a>
### .loadMeta( filePath , [options] )

* filePath `string` the path of the file
* options `object` (optional) an object of options, see [.load()](#ref.load)

This synchronously load the header/meta-tags of the file using the *filePath* argument, and parse it and return it, if any.
It returns a [TagContainer](#ref.TagContainer).

The body of the file is not parsed.



<a name="ref.saveJson"></a>
### .saveJson( data , filePath , [options] )

* data `mixed` the data to serialize
* filePath `string` the path of the file
* options `object` (optional) an object of options, where:
	* indent `number` or `string` (default: 2) how to indent the JSON, if its a number it's the number of spaces per indentation.
	  This is the value passed as the third argument of
	  [JSON.stringify()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
	Any other options are passed to
	[fs.writeFileSync()](https://nodejs.org/dist/latest-v4.x/docs/api/fs.html#fs_fs_writefilesync_file_data_options)
	as its third argument.

This serialize the data in the JSON format into the file, using the *filePath* argument.

This supports serialization of data structure containing circular references, because extra markup are hidden into property keys.



<a name="ref.saveKfg"></a>
### .saveKfg( data , filePath , [options] )

* data `mixed` the data to serialize
* filePath `string` the path of the file
* options `object` (optional) an object of options passed to
	[fs.writeFileSync()](https://nodejs.org/dist/latest-v4.x/docs/api/fs.html#fs_fs_writefilesync_file_data_options)
	as its third argument.

This serialize the data in the KFG format into the file, using the *filePath* argument.

Some advanced features of the KFG format are not serializable at the moment, but will be available soon.

Circular references are supported.



<a name="ref.Dynamic"></a>
## The Dynamic Interface

The Dynamic interface/class is used to define dynamic objects suitable for scripting language.
Bascially, a Dynamic object represents a thing that is not fully known at the time the object is created,
and needs a context to be *defined* at runtime.

Different context produces different output values.

One example of a Dynamic object is a variable name, or a reference, inside a scripting language.



<a name="ref.Dynamic.get"></a>
### .get( ctx , [bound] ) or .getValue( ctx , [bound] )

* ctx `mixed` the context, it can be of any type, but it is usually an object
* bound `boolean` (optional) if true and the value to be returned is a function, the function is bounded
  to the relevant value, depending on the type of the Dynamic object (e.g. given a [Ref instance](#ref.Ref) *"$obj.myfunc"*,
  the returned value would be bound to `ctx.obj`, like a regular Javascript method call would).
  This argument has no effect on some Dynamic objects where the *bound* concept is not relevant
  (e.g. [Template instances](#ref.Template))

This get the value of a `Dynamic` instance (i.e. it *solves* it), using the provided *ctx* context.
This should be idempotent as long as the values holded in the context do not change.



### Dynamic.get( value , ctx , [bound] ) or Dynamic.getValue( value , ctx , [bound] )

This is the static method variant of [.get()](#ref.Dynamic.get).

The first argument *value* can be anything, if it is a Dynamic object, it will return `value.get()`,
else it would return *value*.



<a name="ref.Dynamic.getFinalValue"></a>
### .getFinalValue( ctx , [bound] )

* ctx `mixed` the context, it can be of any type, but it is usually an object
* bound `boolean` (optional) if true and the value to be returned is a function, the function is bounded
  to the relevant value, depending on the type of the Dynamic object (e.g. given a [Ref instance](#ref.Ref) *"$obj.myfunc"*,
  the returned value would be bound to `ctx.obj`, like a regular Javascript method call would).
  This argument has no effect on some Dynamic objects where the *bound* concept is not relevant
  (e.g. [Template instances](#ref.Template))

Like [.get()](#ref.Dynamic.get), it *solves* a Dynamic instance using the *ctx* context
However, as long as the result itself is a Dynamic instance, it is *solved* again.

E.g. a [Ref instance](#ref.Ref) can reference another *ref*, that itself reference another *ref*, and so on...
This will solve the whole reference chain until a non-Dynamic value is found.



### Dynamic.getFinalValue( value , ctx , [bound] )

This is the static method variant of [.getFinalValue()](#ref.Dynamic.getFinalValue).

The first argument *value* can be anything, if it is a Dynamic object, it will return `value.getFinalValue()`,
else it would return *value*.



<a name="ref.Dynamic.getRecursiveFinalValue"></a>
### .getRecursiveFinalValue( ctx , [bound] )

* ctx `mixed` the context, it can be of any type, but it is usually an object
* bound `boolean` (optional) if true and the value to be returned is a function, the function is bounded
  to the relevant value, depending on the type of the Dynamic object (e.g. given a [Ref instance](#ref.Ref) *"$obj.myfunc"*,
  the returned value would be bound to `ctx.obj`, like a regular Javascript method call would).
  This argument has no effect on some Dynamic objects where the *bound* concept is not relevant
  (e.g. [Template instances](#ref.Template))

Like [.getFinalValue()](#ref.Dynamic.getFinalValue), a Dynamic chain is *solved* until a non-Dynamic value is found.

Then, if the final value is an object or an array, it will search recursively for Dynamic object inside it,
and if any, it would apply [.getFinalValue()](#ref.Dynamic.getFinalValue) on them.



### Dynamic.getRecursiveFinalValue( value , ctx , [bound] )

This is the static method variant of [.getRecursiveFinalValue()](#ref.Dynamic.getRecursiveFinalValue).

The first argument *value* can be anything, if it is a Dynamic object, it would return `value.getRecursiveFinalValue()`,
else it would return *value*.



<a name="ref.Dynamic.toString"></a>
### .toString( ctx )

* ctx `mixed` the context, it can be of any type, but it is usually an object

This [get the final value](#ref.Dynamic.getFinalValue) of the Dynamic and cast it to a string, if possible.



<a name="ref.Dynamic.apply"></a>
### .apply( ctx , [bound] )

* ctx `mixed` the context, it can be of any type, but it is usually an object
* bound `boolean` (optional) if true and the value to be returned is a function, the function is bounded
  to the relevant value, depending on the type of the Dynamic object (e.g. given a [Ref instance](#ref.Ref) *"$obj.myfunc"*,
  the returned value would be bound to `ctx.obj`, like a regular Javascript method call would).
  This argument has no effect on some Dynamic objects where the *bound* concept is not relevant
  (e.g. [Template instances](#ref.Template))

Some Dynamic instance don't have the *dynamic* flag on but instead the *applicable* flag.

There is not much difference between *dynamic* and *applicable*, but all `.get*()` methods will do nothing on an *applicable*,
(i.e. those method would return the Dynamic instance untouched), instead, `.apply()` should be used.

`.apply()` produce exactly the same output than [.get()](#ref.Dynamic.get) does, except that it works on *applicable* only,
where `.get()` works on *dynamic* only.

Think of *applicable* as a sort of **locked** Dynamic object.

*Applicable* are an important concept in [KFG](KFG.md).

Here is a fragment of [Spellcast scripting](https://github.com/cronvel/spellcast) (a scripting language built on top of KFG)
to explain why *applicable* Dynamic object are useful:

```
# Set the var named $you to "Bob"
[set $you] Bob

# Set the var named $message to "Hello Bob!",
# solving the template "Hello ${you}!" immediately
[set $message] $> Hello ${you}!

# Set the var named $template to the template "Hello ${you}!",
# $template will be an applicable object and will never been solved
# unless the [apply-to] tag is called on it explicitly
[set $template] $$> Hello ${you}!

# Output "Hello Bob!"
[message] $message

# Apply the template now and put the value inside the $applied var
[apply-to $applied] $template

# Output "Hello Bob!"
[message] $applied

# Now we set $you to a different value: "Jack"
[set $you] Jack

# It still output "Hello Bob!", $message is indeed a string
[message] $message

# This apply the template but now the variable $you used
# to solve the template is not "Bob" anymore but "Jack"
[apply-to $applied] $template

# So this output "Hello Jack!"
[message] $applied
```



### Dynamic.apply( value , ctx , [bound] )

This is the static method variant of [.apply()](#ref.Dynamic.apply).

The first argument *value* can be anything, if it is a Dynamic object, it would return `value.apply()`,
else it would return *value*.



<a name="ref.Dynamic.set"></a>
### .set( ctx , value )

* ctx `mixed` the context, it can be of any type, but it is usually an object
* value `mixed` the value to set on the `Dynamic` instance

This set the value of a `Dynamic` instance, using the provided *ctx* context.
Not all `Dynamic` instance supports `.set()`, it does not always make sense.



<a name="ref.Ref"></a>
## The Ref Class

*Refs* are useful for building scripting language on top of KFG: they represent variables, or paths to variable.
To solve a *ref*, a *context* is needed.
The *ref* is simply a path to walk in that context, it point to a data in the context.

**It implements [the `Dynamic` interface](#ref.Dynamic).**

Let's see a *ref* in action:

```js
var kungFig = require( 'kung-fig' ) ;

// First define a context
var ctx = {
	a: 1 ,
	nested: {
		b: 2
	}
} ;

// Parse and create a ref
var myref = kungFig.Ref.parse( '$nested.b' ) ;

// Output '2', the value of ctx.nested.b
console.log( myref.get( ctx ) ) ;
```

*Refs* always start with a `$`.
See the [KFG Ref syntax](KFG.md#ref.ref).

*Refs* may contain *refs* in their paths, e.g. `kungFig.Ref.parse( "$path.to[$key1][$key2]" )`.
Or even any depth-level of nested *refs*: `kungFig.Ref.parse( "$path.to[$path.to.keys[$key]]" )`.



<a name="ref.Ref.create"></a>
### Ref.create( arg )

* arg `mixed`

Create a `Ref` instance, call [.setRef()](#ref.Ref.setRef) with *arg* and return the instance.



<a name="ref.Ref.parse"></a>
### Ref.parse( str )

* str `string` a KFG Ref string to parse

This parses a *ref* and returns a `Ref` instance.
See the [KFG Ref syntax](KFG.md#ref.ref).



<a name="ref.Ref.setRef"></a>
### .setRef( arg )

* arg `mixed`, the type is either:
	* `string` this set the ref to this KFG Ref string, see the [KFG Ref syntax](KFG.md#ref.ref)
	* `array` this set the ref to this parsed ref (internal use)
	* `null` or `undefined` nullify the ref

Set the internal reference value.



<a name="ref.Ref.get"></a>
### .get( ctx , [bound] , [getArray] ) or .getValue( ctx , [bound] , [getArray] )

* ctx `object` or `array` the context
* bound `boolean` (optional) if true and the value to be returned is a function, the function is bounded
  e.g. given a [Ref instance](#ref.Ref) *"$obj.myfunc"*, assuming `ctx.obj.myfunc` is a function, the returned value
  would be the function `ctx.obj.myfunc` bounded to `ctx.obj`, like a regular Javascript method call would.
* getArray `boolean` if true, instead of returning the *solved* value, it returns an array containing
  the *solved* value, the *solved* value without the last part of the path, and the last part of the path,
  e.g. *"$path.to.value"* would return this array: `[ ctx.path.to.value , ctx.path.to , "value" ]`

This get a value out of the *ctx* context, by using the path of the *ref*.
If the path cannot be solved, `undefined` is returned (or `[]` if the *getArray* option was set).

Example:

```js
var kungFig = require( 'kung-fig' ) ;

// First define a context
var ctx = {
	a: 1 ,
	nested: {
		b: 2
	}
} ;

// Parse and create a ref
var myref = kungFig.Ref.parse( '$nested.b' ) ;

// Output '2', the value of ctx.nested.b
console.log( myref.get( ctx ) ) ;
```


<a name="ref.Ref.set"></a>
### .set( ctx , value )

* ctx `object` or `array` the context
* value `mixed` the value to set where the ref point to in the context

Following the path of the *ref*, this set a value inside the *ctx* context.

If the path does not exist inside the context, it creates as many objects and/or arrays needed along the way.

Example:

```js
var kungFig = require( 'kung-fig' ) ;

// First define a context
var ctx = {
	nested: {
		b: "old value"
	}
} ;

// Parse and create a ref
var myref = kungFig.Ref.parse( '$nested.b' ) ;

// Output "old value", the value of ctx.nested.b
console.log( myref.get( ctx ) ) ;

// Set ctx.nested.b to "new value"
myref.set( ctx , "new value" ) ;

// Output "new value", the new value of ctx.nested.b
console.log( myref.get( ctx ) ) ;

// Create a new ref with a path that does not exist in ctx ATM
myref = kungFig.Ref.parse( '$an.unexistant.path' ) ;

// Set ctx.an.unexistant.path to "bouh!", creating all objects along the way
myref.set( ctx , "bouh!" ) ;

/*
So ctx is now equal to:
{
	nested: {
		b: "new value"
	} ,
	an: {
		unexistant: {
			path: "bouh!"
		}
	}
} ;
*/
```



<a name="ref.Template"></a>
## The Template Class

*Templates* are useful for building scripting language on top of KFG: they are internationalizable templates,
containing references, and a lot of tools to ease human language.

The `Template` class uses [Babel Tower](https://github.com/cronvel/babel-tower) behind the scene, and encapsulate
a `Babel.Sentence` instance **behind a [Dynamic interface](#ref.Dynamic)**.

Like all Dynamic object, to solve a *template*, a *context* is needed.

Let's see a *template* in action:

```js
var kungFig = require( 'kung-fig' ) ;

// First define a context
var ctx = {
	name: "Bob"
} ;

// Create the template
var template = kungFig.Template.create( "Hello ${name}!" ) ;

// Output "Hello Bob!", using the string in ctx.name
console.log( template.get( ctx ) ) ;
```

This is a really simple example, and *templates* can do a lot more.
See the [KFG Template syntax](KFG.md#ref.template) and the [Babel Tower documentation](https://github.com/cronvel/babel-tower)
for more.

The `Babel` object used for internationalization/localization is the `__babel` property of the context,
if it's not defined, or it will fallback to the global `Babel.default` instance.

Example featuring i18n/l10n:

```js
var kungFig = require( 'kung-fig' ) ;
var babel = require( 'babel-tower' ).create() ;

babel.extend( {
	fr: {
		sentences: {
			"Give me ${count} apple${count}[n?|s]!" : "Donne-moi ${count} pomme${count}[n?|s]!"
		}
	}
} ) ;

// Define the context
var ctx = {
	__babel: babel ,
	count: 2
} ;

// Create the template
var template = kungFig.Template.create( "Give me ${count} apple${count}[n?|s]!" ) ;

// Output "Give me 2 apples!"
console.log( template.get( ctx ) ) ;

// Switch to the 'fr' (french) locale
ctx.__babel.setLocale( 'fr' ) ;

// Output "Donne-moi 2 pommes!"
console.log( template.get( ctx ) ) ;
```



<a name="ref.Template.create"></a>
### Template.create( template )

* template `string` the string used as template

This creates a `Template` instance from a string and return it.



<a name="ref.TemplateElement"></a>
## The TemplateElement Class

A *template element* is a used as a part of *template*.

The `TemplateElement` class uses [Babel Tower](https://github.com/cronvel/babel-tower) behind the scene, and encapsulate
a `Babel.Element` instance **behind a [Dynamic interface](#ref.Dynamic)**.

Like all Dynamic object, to solve a *templateElement*, a *context* is needed.

Think of *template element* as a part of a sentence, it can be a noun, a noun group.

A *template element* can have alternative strings according to its gender and number, it can have a translatable key,
it can be just a number...

Example featuring i18n/l10n and *template elements*:

```js
var kungFig = require( 'kung-fig' ) ;
var babel = require( 'babel-tower' ).create() ;

babel.extend( {
	fr: {
		sentences: {
			"Hello ${who}[g:m]!" : "Bonjour ${who}[g:m]!" ,
			"Hello ${who}[g:f]!" : "Bonjour ${who}[g:f]!"
		} ,
		elements: {
			master: { altg: [ 'maitre' , 'maitresse' ] }
		}
	}
} ) ;

// Define the context
var ctx = {
	__babel: babel ,
	
	/*
		Create an element having:
		* a translatable key: master
		* a male gender alternative: master
		* a female gender alternative: mistress
	*/
	who: kungFig.TemplateElement.parse( "master[altg:master|mistress]" )
} ;

// Create two templates using the element, the first one use the male version ([g:m])
// the last one use the female version ([g:f])
var template1 = kungFig.Template.create( "Hello ${who}[g:m]!" ) ;
var template2 = kungFig.Template.create( "Hello ${who}[g:f]!" ) ;

// Output "Hello master!"
console.log( template1.get( ctx ) ) ;

// Output "Hello mistress!"
console.log( template2.get( ctx ) ) ;

// Switch to the 'fr' (french) locale
ctx.__babel.setLocale( 'fr' ) ;

// Output "Bonjour maitre!"
console.log( template1.get( ctx ) ) ;

// Output "Bonjour maitress!"
console.log( template2.get( ctx ) ) ;
```



<a name="ref.TemplateElement.parse"></a>
### TemplateElement.parse( str )

* str `string` represent a Babel Element using the Babel Element syntax

This creates a `TemplateElement` instance from a string in the Babel Element syntax.
It calls `Babel.Element.parse()`.



<a name="ref.TemplateElement.create"></a>
### TemplateElement.create( arg )

* arg `mixed`

This creates a `TemplateElement` instance, the *arg* argument is passed as the first argument of `Babel.Element.create()`.
See [Babel Tower documentation](https://github.com/cronvel/babel-tower).



<a name="ref.Expression"></a>
## The Expression Class

*Expressions* are useful for building scripting language on top of KFG: they provide arithmetical expression,
logic expression, various math functions, and more...

**It implements behind the [Dynamic interface](#ref.Dynamic)**.

Like all Dynamic object, to solve an *expression*, a *context* is needed.

Let's see an *expression* in action:

```js
var kungFig = require( 'kung-fig' ) ;

// First define a context
var ctx = {
	a: 7 ,
	b: 5
} ;

// Parse and create 2 expressions
var exp1 = kungFig.Expression.parse( '1 + 1' ) ;
var exp2 = kungFig.Expression.parse( '$a + $b' ) ;

// Output '2', the value of 1 + 1
console.log( exp1.get( ctx ) ) ;

// Output '12', the value of ctx.a + ctx.b
console.log( exp2.get( ctx ) ) ;
```

An *expression* is basically an operator (i.e. a function) and an array of operands.
An operand can be anything, even a *Dynamic object*, such like *refs*, or another *expression*...

First, all *Dynamic objects* operands are *solved* using the provided *context*.
Once done, the operator function is called with the *solved* array of operands.

See the [KFG expression documentation](KFG.md#ref.expressions) for the expression syntax and the built-in operators.



<a name="ref.Expression.parse"></a>
### Expression.parse( str , [customOperators] )

* str `string` the expression string
* customOperators `object` (optional) where keys are operator identifiers and value a `function( operands )`, where:
	* operands `array` the array of operands

This parses and returns an Expression.
Custom operators cannot override built-in operators.

Example using a custom operator:

```js
var kungFig = require( 'kung-fig' ) ;

// First define a context
var ctx = {
	a: 7 ,
	b: 5
} ;

// Parse and create 2 expressions
var exp = kungFig.Expression.parse( 'my-operator $a $b' , {
	"my-operator": function( operands ) {
		return ( operands[ 0 ] + 1 ) / ( operands[ 1 ] + 1 ) ;
	}
} ) ;

// Output 1.333333, the value of ( ctx.a + 1 ) / ( ctx.b + 1 )
console.log( exp.get( ctx ) ) ;
```



<a name="ref.Expression.create"></a>
### Expression.create( fnOperator , operands )

* fnOperator `function( operands )` the operator's function, where:
	* operands `array` the array of operands
* operands `array` the array of operands

This creates an `Expression` instance and returns it.






