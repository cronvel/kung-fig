
# The Wonderful KFG format

The **KFG** format is the **Kung-Fig** file format, and it does wonders for all your config and data files.
It's like .cfg on steroid!
Once you start using it, you won't use anything else anymore!

**KFG** is primarily a **human-friendly format for describing data**
(i.e. a [data serialization language](https://en.wikipedia.org/wiki/Serialization))
but with an impressive list of features:

* Human friendly data structure representation (similar to YAML)
* Comments support
* Multi-line strings support
* Constructors (date, binary data, regular expression, and custom constructors!)
* Including files (.kfg, .json, .js, .txt, etc), featuring globs and recursive parent search
* Inner and circular references support
* Tags (to build scripting language on top of KFG)
* References
* Template strings and internationalization/localization
* Expressions (arithmetic, logic, maths, etc)
* Tree operations syntax (merge, combine, etc)
* *... and many more!*

Stop using JSON for configuration files, use KFG now!

**This documentation is still a work in progress.**



## Getting started

If you have already used YAML before, KFG will look familiar to you.
For example:

```
first-name: Joe
last-name: Doe
```

... will produce `{ "first-name": "Joe" , "last-name": "Doe" }`.


```
fruits:
	- banana
	- apple
	- pear
```

... will produce `{ "fruits": [ "banana" , "apple" , "pear" ] }`.

Since there are no braces to delimit blocks in KFG, that's the indentation that produce the hierarchy.
Here the array is the child of the *fruits* property of the top-level object.

Note that **tabs SHOULD be used** to indent in KFG. This is the **recommended** way. One tab per depth-level.

If you really insist with spaces, KFG only supports the 4-spaces indentation. But this is not recommended.

Note how objects and arrays are implicit in KFG.

A *node* is an object if it contains a key followed by a `:` colon.
A *node* is an array if it contains array element introduced by a `-` minus sign.

But KFG can do a lot more! **Using few built-in constructors, we can store date or binary:**

```
date: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)
bin: <bin16> af461e0a
```

... will produce an object, with 2 properties, the *date* property will contain a Javascript `Date` object,
and the *bin* property will contain a `Buffer` instance created from the hexadecimal string.
By the way the *date* constructor accepts a lot of input format, like timestamp, ISO, ...

**What is wonderful about KFG is that it supports file inclusions:**

```
user: Joe Doe
items: @@items.kfg
```

... this would load the file `items.kfg` and put its content inside the `items` property.
The path is relative to the current file, so assuming `items.kfg` is in the same directory and contains this:

```
- pear
- pencil
- paper
```

... the previous document would be `{ "user": "Joe Doe" , "items": [ "pear" , "pencil" , "paper" ] }`.

**Also KFG supports tags:**

```
[message]
	text: Hello world!
	color: blue
```

Parsing that will produce an instance of `TagContainer` that contains a single `Tag` instance, whose name is `message`,
and whose content is `{ "text": "Hello world!" , "color": "blue" }`.

Tags are useful to create scripting language on top of KFG.
For example, [Spellcast](https://github.com/cronvel/spellcast) is a full-blown scripting language built on top of KFG.
Tags support attributes:

```
[message some:attribute]
	text: Hello world!
	color: blue
```

... but in order to works properly, a constructor should be provided for each tag. By default, attributes are
a single unparsed and trimmed string starting after the tag's name and finished before the closing bracket.



## A Bit of History

It all started back in 2009, when Cédric Ronvel was bored by the fact that JSON would be a great format to write config file
if it had comments support and would be less nitpicking with commas.

It ends up being like JSON without braces, brackets and commas, optional double-quotes, relying on indentation for hierarchical
data representation, very close to YAML (also it worth noting that it was done *before* knowing the existence of YAML),
and a simple syntax to perform operation.

The addition of **custom classes/constructors** appears in 2015.
The addition of **tags** appears in 2016 to support creation of simple scripting language.
The addition of **refs**, **templates** and **expressions** appears in 2016 to support creation of simple scripting language.



# Language References

### Table of Contents

* [Constants](#ref.constants)
* [Numbers](#ref.numbers)
* [Strings](#ref.strings)
	* [Implicit strings](#ref.strings.implicit)
	* [Quoted strings](#ref.strings.quoted)
	* [Introduced strings](#ref.strings.introduced)
	* [Multi-line strings](#ref.strings.multiline)
* [Arrays](#ref.arrays)
* [Objects](#ref.objects)
* [Constructors](#ref.constructors)
	* [Built-in constructors](#ref.builtin-constructors)
* [Comments](#ref.comments)
* [Includes](#ref.includes)
	* [Recursive Parent Search](#ref.includes.recursive-parent-search)
	* [Glob: including multiple files at once](#ref.includes.glob)
	* [Local reference: including a sub-tree of a document](#ref.includes.local-reference)
	* [Circular References](#ref.includes.circular)

*Documentation TODO:*
* [Tags](#ref.tags)
* [References](#ref.references)
* [Templates](#ref.templates)
* [Expressions](#ref.expressions)



<a name="ref.constants"></a>
## Constants

Constants represent special values.

They are few of them in KFG:
* `null`: represent the `null` value.
* `true`, `yes`, `on`: they are all representing the boolean `true` value.
* `false`, `no`, `off`: they are all representing the boolean `false` value.
* `NaN`: a number type whose value is *Not A Number* (e.g.: what we get when we divide by zero)
* `Infinity`: a number type whose value is `Infinity`
* `-Infinity`: a number type whose value is `-Infinity`

E.g.:

```
debug: on
```

... would produce `{ "debug": true }`.


<a name="ref.numbers"></a>
## Numbers

Numbers are written down directly. As anyone would expect, this KFG file will produce `{ "age": 42 }`:

```
age: 42
```

The scientific notation is also supported, like this: `value: 1.23e45`



<a name="ref.strings"></a>
## Strings

There are many way to declare strings in KFG.



<a name="ref.strings.implicit"></a>
### Implicit Strings

The most straight-forward way is implicit strings.

For example, this KFG file will produce `{ "name": "Joe Doe" }`:

```
name: Joe Doe
```

Implicit strings are fine, however they should not collide with an existing [constants](#ref.constants),
should not be a valid number and should not start with a symbole used by the Spellcast syntax, like:

- spaces and tabs (they are trimmed out)
- double-quote `"`
- lesser than `<` or greater than `>`
- opening parenthesis `(`
- arobas `@`
- dollar `$`

Trailing spaces and tabs are trimmed out too.

Lastly, if your string is at top-level, it should not be confused with an object's property or an array's element,
thus it should not contain any colon `:` or start with a minus sign `-`.

Multi-line strings are not supported by the implicit syntax.

If you are in one of those cases, declare your string using one of the following syntax.



<a name="ref.strings.quoted"></a>
### Quoted Strings

Quoted strings are string inside double-quote.

This KFG file will produce `{ "name": "Joe Doe" }`:

```
name: "Joe Doe"
```

Inside a quoted string, all character are available except three types that have special meanings:
- the double-quote `"` itself should be *escaped* with a backslash `\`, otherwise it would mean the end of the string
- the backslash `\` should be *escaped* with another backslash `\`, because it is used for escape sequence
- all controle characters are illegals, they should be represented by a backslash escape sequence

Special chars backslash escape sequence:
- `\b` for the *bell* controle char
- `\f` for the *form feed* controle char
- `\n` for the *new line* controle char
- `\r` for the *carriage return* controle char
- `\t` for the *tab* controle char
- `\\` for a single *backslash* `\` char
- `\/` for a single *slash* `\` char (escaping slashes is optional and not recommended)
- `\"` for the *double-quote* `"` char
- `\uXXXX` for writing a char using its unicode code point, where *XXXX* is the hexedecimal unicode code point

Quoted strings does not support multi-line: they should start and end at the same line, however the **content**
of the string can be multi-line: just use the `\n` special sequence to represent each new line.



<a name="ref.strings.introduced"></a>
### Introduced Strings

Introduced strings are strings introduced by the *greater than* sign `>` followed by a space ` `.

This KFG file will produce `{ "name": "Joe Doe" }`:

```
name: > Joe Doe
```

Everything after the `> ` mark until the end of the line will be in the string, without being trimmed.
That means that trailing spaces before the end of the line will be part of the string.

Introduced strings are great because they do not need escaping, any chars except the new line can be used.
They are left untouched.

Reciprocally, since chars aren't interpreted, it could be hard to spot bad chars, especially controle chars.
If you need to declare a string with controle chars, it's best to use [quoted string](#ref.strings.quoted)
and backslash escape sequences.

If you need multi-line, use the [multi-line string syntax](#ref.strings.multiline).



<a name="ref.strings.multiline"></a>
### Multi-line Strings

Multi-line strings is a variant of [introduced string](#ref.strings.introduced).

Just look at this example:

```
description:
	> The KFG format is the Kung-Fig file format.
	> It does wonders for all your config files.
	> It's like .cfg on steroid!
	> Once you start using it, you won't use anything else!
```

As you would expect, it produces an object with a single *description* property containing the whole paragraph,
of course without the initial indentation and `> ` mark at the start of each lines.

Note that the multi-line string does not start at the same line than the property key *description*,
but at the next line, one level of indentation deeper than its container.

All the other rules of [introduced string](#ref.strings.introduced) applies.



<a name="ref.arrays"></a>
## Arrays

The array presentation in KFG is simply a list where each item/element is introduced by a minus sign `-` followed by a space ` `.
One item/element per line.

For example, this would produce `[ "banana" , "apple" , "pear" ]`:

```
- banana
- apple
- pear
```

This is really a simple and easy to read syntax.

Arrays are implicit, a *node* is an array as soon as it contains an array's element.

Thus an empty array cannot be declared implicitly -- it has no element!
So they should be declared explicitly with the [constructor syntax](#ref.contructors).

E.g.:

```
empty: <Array>
```
... would produce `{ "empty": [] }`.

Defining array of arrays would look like this:

```
-
	- one
	- two
	- three
-
	- four
	- five
	- six
-
	- seven
	- eight
	- nine
```

Indeed, each top-level element is a container, so the nested array should be one-level deeper.

However, the KFG supports this neat *compact syntax* inspired by YAML:

```
-	- one
	- two
	- three
-	- four
	- five
	- six
-	- seven
	- eight
	- nine
```

That's it: if an element/item of an array is a container (array or object), its first child can be put on the same line.
For that purpose, a tab should be inserted right after the minus sign `-`.

If you have insisted on using spaces instead of tabs for indentation (something that is not recommended),
you should put exactly 3 spaces (not 4, for alignment reasons) right after the minus sign `-`.

The same with object inside arrays:

```
-	first-name: Joe
	last-name: Doe
-	first-name: Bill
	last-name: Baroud
-	first-name: Jane
	last-name: Doe
```



<a name="ref.objects"></a>
## Objects

The object presentation in KFG is simply a list of key, followed by a colon `:` followed by the value.
There can be any number of spaces before and after the colon.

The syntax is similar to the array syntax, the minus sign `-` being replaced by the property's key and the colon:
one property per line.

For example, this would produce `{ "first-name": "Joe" , "last-name": "Doe" , "job": "developer" }`:

```
first-name: Joe
last-name: Doe
job: developer
```

Like arrays, objects are implicit, a *node* is an object as soon as it contains one object's property.

Thus an empty object cannot be declared implicitly -- it has no property!
So they should be declared explicitly with the [constructor syntax](#ref.contructors).

E.g.:

```
<Object>
```
... would produce `{}`.

Defining object of objects would look like this:

```
name:
	first: Joe
	last: Doe
address:
	town: Chicago
	state: Illinois
```

... and would produce `{ "name": { "first": "Joe" , "last": "Doe" } , "address": { "town": "Chicago" , "state": "Illinois" } }`.

Note that unlike arrays, there is **no** *compact syntax* for object of objects.

Keys should not start with:

- spaces and tabs (they are trimmed out)
- double-quote `"`
- lesser than `<` or greater than `>`
- opening parenthesis `(`
- arobas `@`
- dollar `$`
- minus sign `-`

Trailing spaces and tabs are trimmed out too.

They should not contain:

- colon `:`
- controle chars

If the key should contain any of this, it should be quoted using the [quoted strings rules](#ref.strings.quoted).

Unquoted key can contain spaces between words, so this is perfectly legit:

```
first name: Joe
last name: Doe
```

... and would produce `{ "first name": "Joe" , "last name": "Doe" }`.

**So be careful:**

```
I just want to say: hello!
```

**This will not produce** the string `I just want to say: hello!`, but an object: `{ "I just want to say": "hello!" }`,
because of the presence of the colon. See the [implicit strings rules](#ref.strings.implicit).

On the other hand:

```
text: I just want to say: hello!
```

... does not cause any trouble, the implicit string is not top-level thus it would produce
`{ "text": "I just want to say: hello!" }` as expected.



<a name="ref.constructors"></a>
## Constructors

The constructor syntax consists of a constructor put inside angle brackets (`<` and `>`).

The constructor should be put before the regular KFG value, if any.
That KFG value will be passed to the constructor function.



<a name="ref.builtin-constructors"></a>
### Built-in constructors

* `<Object>`, `<object>`: Object constructor. Object are implicit in KFG, there is only one case where this constructor is needed:
  when we want to create an empty object.

* `<Array>`, `<array>`: Array constructor. Array are implicit in KFG, there is only one case where this constructor is needed:
  when we want to create an empty array.

* `<TagContainer>`, `<tagContainer>`: TagContainer constructor. TagContainer are implicit, there is only one case where this
  constructor is needed: when we want to create an empty TagContainer.

* `<JSON>`, `<Json>`, `<json>`: a pseudo-constructor that accept a string and parse it as JSON, the result can be
  any native JSON type (null, boolean, number, string, array, object).
  E.g.: `<JSON> > {"a":1,"b":2,"array":[1,2,"three"]}`

* `<Bin16>`, `<bin16>`: represent binary data stored in an hexadecimal string, converted to the most appropriate
  type for binary data of the platform (Node.js: Buffer).
  E.g.: `<Bin16> fd104b19`

* `<Date>`, `<date>`: construct a Date from a string or a number (timestamp)
  E.g.: `<Date> Fri Apr 29 2016 12:08:14 GMT+0200 (CEST)`
  Or: `<Date> 1476785828944`
  Or: `<Date> 2016-10-18`
  ...

* `<Regex>`, `<regex>`, `<RegExp>`, `<Regexp>`, `<regexp>`: construct a RegExp object from a string of the form `/<regexp>/<flag>`
  E.g.: `<RegExp> /hello/i`



<a name="ref.comments"></a>
## Comments

KFG supports single line comments, introduced by the hash sign `#`.

A comment **MUST** be on its own line: it cannot be placed after any content, or it would be parsed as part of that content.

A comment can be indented, and can even lie at a nonsensical depth.

So a comment is basically some indentations, followed by a hash sign `#`,
followed by anything until the end of the line.

The whole line will be ignored, so any chars are accepted, even non-printable/controle chars (except, of course, the newline char).

Examples of valid and invalid comments:

```
# This is a valid comment
		# This is a valid comment

# If you need multiple lines,
# you should put a # at the
# beginning of each line.

users:
	-	first-name: Joe
		# This is a valid comment
		last-name: Doe
	# This is a valid comment, it does not 'close' the current object
		job: developer # This is NOT comment! It will be included in the string!
```

It will produce:

```
{
	users: [
		{
			"first-name": "Joe" ,
			"last-name": "Doe" ,
			"job": "developer # This is NOT comment! It will be included in the string!"
		}
	]
}
```

As you can see, the *job* property contains the hash and anything beyond it.



<a name="ref.includes"></a>
## Includes

**Includes is one of the key feature of KFG!**
It makes your work easier at managing complex configs or dataset.

Includes can import the whole document of a file, a sub-tree of the document of that file,
and even the current document or a sub-tree of it.

There are two type of include:

* optional includes start with a single arobas `@` immediately followed by the *reference*: if the reference is not found,
  it will be replaced by an empty object if the reference would point to a whole document, or undefined if it would point
  to a sub-tree. If the reference point to an existing file that contains parse error, it will throw anyway!
  Debugging would be hard if it doesn't.
* mandatory includes start with a double arobas `@@` immediately followed by the *reference*: if the reference is not found
  or cannot be loaded, parsed or whatever, it will throw.

Here, a *reference* is an optional file path **relative to the current file directory** (or absolute if it starts with a `/`),
and/or an optional *local reference*: a hash sign `#` followed by a path to a sub-tree of the document.
(Not to be confused with the [Reference](#ref.reference) class)

Example with file path only:

```
user: Joe Doe
items: @@items.kfg
```

... this would load the file `items.kfg` and put its content inside the `items` property.
If the file `items.kfg` cannot be found, the parser will throw an error.
Otherwise, assuming `items.kfg` contains this:

```
- pear
- pencil
- paper
```

... the previous document would be `{ "user": "Joe Doe" , "items": [ "pear" , "pencil" , "paper" ] }`.

If we use the optional include and if `items.kfg` does not exist, then:

```
user: Joe Doe
items: @items.kfg
```

... would produce `{ "user": "Joe Doe" , "items": {} }`



**Every file format supported by Kung-Fig can be included!** Supported extensions:

* .kfg: this will load the file as a KFG file. It is possible to load other files as KFG: e.g. one should
  pass `{ kfgFiles: { extname: [ "myext" ] , basename: [ "mykfgfile.ext" ] } }` as the second argument
  of `kungFig.load()` to load the file *mykfgfile.ext* or any file with the extension *.myext* as KFG.
* .json: this will load the file as JSON
* .js: this will load the file as a Node.js module: anything exported by the module will be returned.
  This is actually the sole way to include JS functions.
* .txt: this will load the file as a raw string

Any file format unknown to Kung-Fig will be assumed as raw string.



<a name="ref.includes.recursive-parent-search"></a>
### Recursive Parent Search

KFG also supports a particular sort of relative path: path starting with `.../`.
We call that **recursive parent search**. The file is first searched on the current folder, if not found, it is searched
on the parent folder, and so on.

So, imagine there is a file `/home/bob/coding/my-project/data/users/joe-doe.kfg` containing:

```
user: Joe Doe
items: @@.../items.kfg
```

The file `items.kfg` will be searched in that order at those paths:
- `/home/bob/coding/my-project/data/users/items.kfg`
- `/home/bob/coding/my-project/data/items.kfg`
- `/home/bob/coding/my-project/items.kfg`
- `/home/bob/coding/items.kfg`
- `/home/bob/items.kfg`
- `/home/items.kfg`
- `/items.kfg`

Another example:

```
user: Joe Doe
items: @@.../items/tools.kfg
```

The file `tools.kfg` will be searched in that order at those paths:
- `/home/bob/coding/my-project/data/users/items/tools.kfg`
- `/home/bob/coding/my-project/data/items/tools.kfg`
- `/home/bob/coding/my-project/items/tools.kfg`
- `/home/bob/coding/items/tools.kfg`
- `/home/bob/items/tools.kfg`
- `/home/items/tools.kfg`
- `/items/tools.kfg`



<a name="ref.includes.glob"></a>
### Glob: including multiple files at once

If the path contains any wild-card or glob-pattern, the include command will return an array containing the parsed content
of all those files.

Example:

```
user: Joe Doe
items: @@items/*.kfg
```

Assuming there is an `items/` folder with those 2 files:

* items/paper.kfg:
```
name: paper
count: 123
```

* items/pencil.kfg:
```
name: pencil
count: 3
```

... then the whole document would be:
```
{
	"user": "Joe Doe" ,
	"items": [
		{
			"name": "paper"
			"count": 123
		} ,
		{
			"name": "pencil"
			"count": 3
		}
	]
}
```



<a name="ref.includes.local-reference"></a>
### Local reference: including a sub-tree of a document

Thanks to local reference, it is possible to include only a sub-tree of a document.
Local reference is the part after the hash sign `#`.

Consider this:

```
user: Joe Doe
item: @@items.kfg#tools.pencil
```

Assuming the `items.kfg` file contains this:

```
fruits:
	banana:
		name: banana
		count: 3
	apple:
		name: apple
		count: 7
tools:
	paper:
		name: paper
		count: 123
	pencil:
		name: pencil
		count: 3
```

... then it would produce:

```
{
	"user": "Joe Doe" ,
	"item": {
		"name": "pencil"
		"count": 3
	}
}
```

The local reference supports a dot-separated property path syntax.
It is possible to navigate through array too, using the `[X]` syntax where *X* is a positive integer or *0*.
This is valid: `@@file.kfg#path.to[12][5].path[0].to.object`.

Do not add extra spaces in a local reference: all spaces should be meaningful.



<a name="ref.includes.circular"></a>
### Circular references

**It is also possible to reference parts of the current document itself.** Just remove the file reference part.

```
users:
	joedoe:
		name: Joe Doe
		friend: @@#users.bbaroud
	bbaroud:
		name: Bill Baroud
		friend: @@#users.joedoe
	jane:
		name: Jane
		friend:	@@#users.joedoe
```

This will produce **actual references, not clones**. Hence it is not possible to write down the result,
because of circular references.

This is an interesting feature since it permits to load or save complex data structure using KFG.

It is also possible to reference the root of the document with a hash sign `#` and an empty local reference:

```
key: value
circular: @@#
```


