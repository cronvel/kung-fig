<a name="ref"></a>
# Kung-Fig Lib References

### Table of Contents

* [The Wonderful KFG Format](https://github.com/cronvel/kung-fig/blob/master/doc/KFG.md)
* [Basic Module Methods](#ref.basic)
	* [.load()](#ref.load)
	* [.loadMeta()](#ref.loadMeta)
	* [.saveJson()](#ref.saveJson)
	* [.saveKfg()](#ref.saveKfg)
* [The Ref Class](#ref.Ref)

*Documentation TODO:*
* [.reduce()](#ref.reduce)
* [.autoReduce()](#ref.autoReduce)
* [The Expression Class](#ref.Expression)
* [The Tag Class](#ref.Tag)
* [The TagContainer Class](#ref.TagContainer)



<a name="ref.basic"></a>
## Basic Module Methods

Those are top-level module methods.

In all the following examples, it is assumed that `var kungFig = require( 'kung-fig' ) `, and all the following
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

* [KFG](https://github.com/cronvel/kung-fig/blob/master/doc/KFG.md) (*.kfg)
* JSON (*.json)
* Node.js Javascript module (*.js)
* Raw text files (*.txt, or any unknown extension)

The path can be absolute, relative (to the Current Working Directory), or relative using the
[recursive parent search feature](https://github.com/cronvel/kung-fig/blob/master/doc/KFG.md#ref.includes.recursive-parent-search).

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



<a name="ref.Ref"></a>
## The Ref Class

*Refs* are useful for building scripting language on top of KFG: they represent variable.
To solve a *ref*, a *context* is needed. The *ref* is simply a path in that context, it point to a data.

Let's see *ref* in action:

```js
var kungFig = require( 'kung-fig' ) ;

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

var myref = kungFig.Ref.parse( '$sub.c' ) ;

// Output '3', the value of ctx.sub.c
console.log( myref.get( ctx ) ) ;
```

