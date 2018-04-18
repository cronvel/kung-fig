
# The Wonderful KFG Format

The **KFG** format is the **Kung-Fig** file format, and it does wonders for all your config and data files.
It's like .cfg on steroid!
Once you start using it, you won't use anything else anymore!

**KFG** is primarily a **human-friendly format for describing data**
(i.e. a [data serialization language](https://en.wikipedia.org/wiki/Serialization))
but with an impressive list of features:

* Human friendly data structure representation (similar to YAML)
* Comments support
* Multi-line strings support
* Classes/Constructors (date, binary data, regular expression, and custom constructors!)
* Including files (.kfg, .json, .js, .txt, etc), featuring globs and recursive parent search
* Relational data representation support
* Meta-tags (headers)
* Tags (to build scripting language on top of KFG)
* References
* Template strings and internationalization/localization
* Expressions (arithmetic, logic, maths, etc)
* Tree operations syntax (merge, combine, etc)
* *... and many more!*

Stop using JSON for configuration files, use KFG now!

**This documentation is still a work in progress.**



# Language References

### Table of Contents

* [A Bit of History](#history)
* [Getting Started](#getting-started)
* [Comments](#ref.comments)
* [Constants](#ref.constants)
* [Numbers](#ref.numbers)
* [Strings](#ref.strings)
	* [Implicit strings](#ref.strings.implicit)
	* [Quoted strings](#ref.strings.quoted)
	* [Introduced strings](#ref.strings.introduced)
	* [Multi-line strings](#ref.strings.multiline)
	* [Multi-line folded strings](#ref.strings.multiline-folded)
* [Hierarchical Data Representation - Containers](#ref.hierarchical)
* [Arrays](#ref.arrays)
* [Objects](#ref.objects)
* [Classes/Constructors](#ref.constructors)
	* [Built-in constructors](#ref.builtin-constructors)
* [Tags](#ref.tags)
* [Meta Tags](#ref.meta-tags)
* [Includes](#ref.includes)
	* [Recursive Parent Search](#ref.includes.recursive-parent-search)
	* [Glob: including multiple files at once](#ref.includes.glob)
	* [Local reference: including a sub-tree of a document](#ref.includes.local-reference)
	* [Relational Data Representation](#ref.includes.relational)
* [Refs](#ref.refs)
* [Template Sentences](#ref.template-sentences)
* [Expressions](#ref.expressions)
	* [Built-in Expressions Operators](#ref.expressions.builtin-operators)
* [Tree Operations](#ref.treeops)
	* [Operator list](#ref.treeops.operators)



<a name="history"></a>
## A Bit of History

It all started back in 2009, when Cédric Ronvel was bored by the fact that JSON would be a great format to write config file
if it had comments support and would be less nitpicking with commas.

It ends up being like JSON without braces, brackets and commas, optional double-quotes, relying on indentation for hierarchical
data representation, very close to YAML (also it's worth noting that it was done *before* being aware of the existence of YAML),
and a simple syntax to perform operation.

* The addition of **custom classes/constructors** appears in 2015.
* The addition of **tags** appears in 2016 to support creation of simple scripting language.
* The addition of **refs**, **templates** and **expressions** appears in 2016 to support creation of simple scripting language.



<a name="getting-started"></a>
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
A *node* is an array if it contains array element introduced by a hyphen `-`.

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

All KFG's strings are encoded in **UTF-8**.

There are many string declaration syntax in KFG, one should use the most appropriate syntax for its usage.



<a name="ref.strings.implicit"></a>
### Implicit Strings

The most straight-forward syntax is *implicit strings*.

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
- at sign `@`
- dollar `$`

Trailing spaces and tabs are trimmed out too.

Lastly, if your string is at top-level, it should not be confused with an object's property or an array's element,
thus it should not contain any colon `:` or start with a hyphen `-`.

Multi-line strings are not supported by the implicit syntax.

If you are in one of those cases, declare your string using one of the following syntax.



<a name="ref.strings.quoted"></a>
### Quoted Strings

*Quoted strings* are string inside double-quote.

This KFG file will produce `{ "name": "Joe Doe" }`:

```
name: "Joe Doe"
```

Inside a quoted string, all characters are available except three types that have special meanings:
- the double-quote `"` itself should be *escaped* with a backslash: `\"`, otherwise it would mean the end of the string
- the backslash `\` should be *escaped* with another backslash: `\\`, because it is used to start escape sequence
- all controle characters are illegals, they should be represented by a backslash escape sequence, see below

Backslash escape sequence:
- `\b` for the *bell* controle char
- `\f` for the *form feed* controle char
- `\n` for the *new line* controle char
- `\r` for the *carriage return* controle char
- `\t` for the *tab* controle char
- `\\` for a single *backslash* `\` char
- `\/` for a single *slash* `\` char (escaping slashes is **optional** and **not recommended**)
- `\"` for the *double-quote* `"` char
- `\uXXXX` for writing a char using its unicode code point, where *XXXX* is the hexedecimal unicode code point,
  this is **optional**, KFG support UTF-8 out of the box, so it should be used only if one want to avoid
  some strange chararacters in its source code

Quoted strings does not support multi-line: they should start and end at the same line, however the **content**
of the string can be multi-line: just insert as many `\n` as you need.



<a name="ref.strings.introduced"></a>
### Introduced Strings

*Introduced strings* are strings introduced by the *greater than* sign `>` followed by a space ` `.

This KFG file will produce `{ "name": "Joe Doe" }`:

```
name: > Joe Doe
```

Everything after the `> ` mark **until the end of the line** will be in the string, without being trimmed.
That means that trailing spaces will be part of the string, as well as extra spaces after the `> ` mark.

Introduced strings are great because they do not need escaping, any chars except the new line can be used.
They are left untouched.

Reciprocally, since chars aren't interpreted, it could be hard to spot bad chars, especially controle chars.
If you need to declare a string with controle chars, it's best to use [quoted string](#ref.strings.quoted)
and backslash escape sequences. For anything else, they are generally greater than *quoted strings*.

If you need multi-line, use the [multi-line string syntax](#ref.strings.multiline), which is a variant of this syntax.



<a name="ref.strings.multiline"></a>
### Multi-line Strings

*Multi-line strings* is a variant of [introduced string](#ref.strings.introduced).

Just look at this example:

```
description:
	> The KFG format is the Kung-Fig file format.
	> It does wonders for all your config files.
	> It's like .cfg on steroid!
	> Once you start using it, you won't use anything else!
```

As you would expect, it produces an object with a single *description* property containing the whole paragraph,
of course without the initial indentation and the `> ` mark at the start of each lines.

Note that the multi-line string does not start at the same line than the property key *description*,
but at the next line, one level of indentation deeper than its *container*.

All the other rules of [introduced string](#ref.strings.introduced) applies.

*Multi-line strings* are really great. Copy-paste any raw text paragraph in your KFG, then prefix
each line with `> ` and indent it: *and it just works!*
Your text editor may even do that for you with a few keystrokes.
This works mostly like the quotes in email format.



<a name="ref.strings.multiline-folded"></a>
### Multi-line Folded Strings

*Multi-line folded strings* is a variant of [multi-line string](#ref.strings.multiline).

It works with a double `>>` sign instead of a single `>`.
Just look at this example:

```
description:
	>> The KFG format is the Kung-Fig file format.
	>> It does wonders for all your config files.
	>> It's like .cfg on steroid!
	>> Once you start using it, you won't use anything else!
```

The description property will not contain a 4-lines string like it would for a regular multi-line,
instead, the lines are folded: only one big line will be created.
Before merging all lines in one, each lines is *trimmed*: all consecutive white spaces are removed from the left
and the right of the line.

If a true line break is needed, an *empty text line* is needed, i.e. a line with a `>>` mark with nothing left after it
except white spaces.

Example:

```
description:
	>> The KFG format is the Kung-Fig file format.
	>> It does wonders for all your config files.
	>> It's like .cfg on steroid!
	>> 
	>> Once you start using it, you won't use anything else!
```
The first 3 lines are merged, but not the last one.

So... if an empty line is needed, two consecutive *empty text lines* should be written.



<a name="ref.hierarchical"></a>
## Hierarchical Data Representation - Containers

Non-scalar value are called *containers*.
There are three *container* type in KFG:

* [Arrays](#ref.arrays): an ordered list of elements
* [Objects](#ref.objects): a map of key/value pairs
* [Tag Containers](#ref.tags): an ordered list of tags

The indentation is used to denote structure, to express the nested/embedded relationship: any part that is
indented belongs to the element on the closest line above having a smaller indentation level.

Here is a commented document that explains for each element its parent relationship:

```
# The following tag belong to the root document, which is implicitly a Tag Container
[character Joe]
	# The following key/value pairs belong to the [character] tag above
	name: Joe Doe
	stats:
		# The following key/value pairs belong to the stats object above
		strength: 11
		dexterity: 14
		intelligence: 17
	# The following key/value pair belongs to the [character] tag
	status:
		# The following key/value pair belongs to the status object
		hp: 18
	# The following key/value pair belongs to the [character] tag
	friends:
		# The following elements belong to the friends array above
		- Rebecca
		- Anna
		- Siegfried
```

It is important to understand that **siblings should be of the same type**.
This is incorrect and would cause a parse error:

```
[mytag]
name: Joe Doe
- one
- two
- three
```

Is this document a tag container? An object? An array? This doesn't make any sense.



<a name="ref.arrays"></a>
## Arrays

The array presentation in KFG is simply a list where each item/element is introduced by a hyphen `-` followed by a space ` `.
One item/element per line.

For example, this would produce `[ "banana" , "apple" , "pear" ]`:

```
- banana
- apple
- pear
```

This is really a simple and easy to read syntax.

**Arrays are implicit**: a *node* is an array as soon as it contains an array's element.

Thus an empty array cannot be declared implicitly -- it has no element!
So it should be declared explicitly with the [constructor syntax](#ref.contructors).

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
For that purpose, **a tab should be inserted right after the hyphen** `-`.

If you have insisted on using spaces instead of tabs for indentation (something that is **not** recommended),
you should insert exactly 3 spaces (not 4, for alignment reasons) right after the hyphen `-`.

The same syntax with objects inside the array:

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

The syntax is similar to the array syntax, the hyphen `-` being replaced by the property's key and the colon:
one property per line.

For example, this would produce `{ "first-name": "Joe" , "last-name": "Doe" , "job": "developer" }`:

```
first-name: Joe
last-name: Doe
job: developer
```

Like arrays, **objects are implicit**: a *node* is an object as soon as it contains one object's property.

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
- at sign `@`
- dollar `$`
- hyphen `-`

Trailing spaces and tabs are trimmed out too.

A key should not contain:

- colon `:`
- controle chars

**If the key should contain any of this, it should be quoted** using the [quoted strings rules](#ref.strings.quoted).

E.g.:

```
"#strange:key\n": value
```

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
## Classes/Constructors

The constructor syntax consists of a constructor/class name put inside angle brackets (`<` and `>`).

The constructor should be inserted before the regular KFG value, if any.
That KFG value will be passed to the constructor function.

Here a class/constructor that use a number as its init value, and another that needs an object:

```
date: <Date> 1476785828944
item: <Item>
	name: pencil
	count: 4
```

Unknown class/constructor will **throw** an error: for any non-built-in class you use, there **MUST** be a userland constructor.

<a name="ref.builtin-constructors"></a>
### Built-in Classes/Constructors

* `<Object>`, `<object>`: Object constructor. Object are implicit in KFG, there is only one case where this constructor is needed:
  when we want to create an empty object.

* `<Array>`, `<array>`: Array constructor. Array are implicit in KFG, there is only one case where this constructor is needed:
  when we want to create an empty array.

* `<TagContainer>`, `<tagContainer>`: TagContainer constructor. TagContainer are implicit, there is only one case where this
  constructor is needed: when we want to create an empty TagContainer.

* `<JSON>`, `<Json>`, `<json>`: a constructor that accept a string and parse it as JSON, the result can be
  any native JSON type (null, boolean, number, string, array, object).
  E.g.: `<JSON> > {"a":1,"b":2,"array":[1,2,"three"]}`

* `<Bin16>`, `<bin16>`: represent binary data stored in an hexadecimal string, converted to the most appropriate
  type for binary data depending on the platform (Node.js: `Buffer`).
  E.g.: `<Bin16> fd104b19`

* `<Date>`, `<date>`: construct a Date from a string or a number (timestamp)
  Anything accepted by the Javascript `Date()` constructor is possible.
  E.g.: `<Date> Fri Apr 29 2016 12:08:14 GMT+0200 (CEST)`
  Or: `<Date> 1476785828944`
  Or: `<Date> 2016-10-18`
  ...

* `<Regex>`, `<regex>`, `<RegExp>`, `<Regexp>`, `<regexp>`: construct a RegExp object from a string of the form `/<regexp>/<flag>`
  E.g.: `<RegExp> /hello/i`

* `<Sentence>`, `<sentence>`, `<TemplateSentence>`, `<templateSentence>`: construct a [TemplateSentence](#ref.TemplateSentence)
  object from a string.
  E.g.: `<Sentence> I like ${something}!

* `<Atom>`, `<atom>`, `<TemplateAtom>`, `<templateAtom>`: construct a [TemplateAtom](lib.md#ref.TemplateAtom) object from
  a string or an object.
  E.g.: `<Atom> horse[n?horse|horses]



<a name="ref.tags"></a>
## Tags and Tag Containers

Tags are special objects that belongs to a tag container.
A tag container can contains any number of tags.
Tags are ordered inside their container, just like elements of an array are.
If we would compare to arrays, **tag containers are to arrays what tags are to array's elements**.

Like arrays and objects, **tag containers are implicit**: a *node* is a tag container as soon as it contains one tag.

Tags can be use for anything, but they are usually describing actions, and are well-suited for building
scripting language on top of KFG.

This is an example of tag:

```
[user first-name="Joe" last-name="Doe"]
	job: developer
	town: Chicago
	state: Ilinois
```

**The tag syntax:**

* a tag starts with an opening bracket `[`, followed by a tag name, optionally followed by some attributes and
  it ends with a closing bracket `]`
* the inside of the tag (i.e. the tag name + the attributes) is trimmed, so extra spaces after the opening bracket
  and before the closing bracket are ignored
* if there are some attributes, one or more spaces should separate them from the tag name
* the tag name can contains any chars except spaces, tabs and double-quote `"`, brackets are not recommended here
* the attributes part can contains any chars, but there are special rules for double-quotes `"` and brackets `[]`,
  except for thoses rules, that's the userland code role to parse attributes if needed.
  By default the whole attribute string is fetched into the `attributes` property of the `Tag` instance.
* **the double-quotes rule:** double-quote should always be paired inside a tag, anything inside a pair of double quote
  is ignored, even brackets (but except the newline controle char), it allows tags to contains strings as parameters.
* **the brackets rule:** if brackets are used inside of the tag syntax, unless they are inside a pair of
  double-quote, **they have to be balanced**:
	* there **MUST** be as many opening and closing brackets
	* reading from left to right, there shouldn't be any moment where more closing brackets have been encountered
	  than opening one

Those are all valid tags:
* `[mytag]` this create a tag named *mytag*
* `[mytag my attributes]` create a tag named *mytag* having the `attributes` property set to `my attributes`
* `[mytag "my id"]` create a tag named *mytag* having the `attributes` property set to `'"my id"'`, note that
  the `attributes`'s value still contains the double-quote: nothing is parsed (except if there is a custom tag
  named *mytag* defined by userland, that parse it)
* `[mytag first-name="Joe" last-name="Doe"]` create a tag named *mytag* having the `attributes` property
  set to `'first-name="Joe" last-name="Doe"'` (string).
  If userland defined a custom tag named *mytag* that use the [Kung-Fig built-in `ClassicTag` constructor](lib.md#ref.ClassicTag),
  attributes would be an object: `{ "first-name": "Joe" , "last-name": "Doe" }`.
* `[inc $array[1][2].value]` create a tag named *inc* having the `attributes` property set to `$array[1][2].value`.
  See how the brackets inside the tag follow the brackets rule correctly.
  In [Spellcast scripting](https://github.com/cronvel/spellcast), this tag is used to increment the variable `$array[1][2].value`.
* `[mytag some "garbage]]]][] inside ]] a quote"]` this is still correct: all those misleading brackets are inside
  a double-quote string. Syntax hilighters may help a bit there!

Beware:
* `[mytag bad][attributes]` this create a tag named *mytag* with `attributes` set to `bad`, having the content `"[attributes]"`,
  the tag end after the first closing bracket (after *bad*), the content starts immediately.
* `[mytag bad[attributes]` this will throw a parse error, because the end of line will be reached before closing all brackets
* `[mytag "bad"attributes"]` this will throw a parse error, because the number of double-quote is not even

A tag can contains any content.
Some example of tags with content here:

```
[mytag] 1234
[mytag] "some string"
[item]
	type: pencil
	count: 3
[items]
	-	type: pencil
		count: 3
	-	type: paper
		count: 123
[mytag]
	[yetanothertag] 12
	[yetanothertag] 42
```

As usual, if a tag contains an object, an array or is a tag container, **its content should be indented one level deeper**.

Tags are mostly useful if you are going to build a scripting language on top of KFG.
For pure descriptive, config or data files, that does not make much sense, except if you would like to create rather
complex documents similar to *HTML*.
On the other hand, most of time tags will be used for actions, hence scripting.
So it is not particularly useful if you don't create your own userland tag constructors.
See the [`kungFig.load()` options](lib.md#ref.load).

For the record, here is a bit of [Spellcast scripting](https://github.com/cronvel/spellcast) to see tags in action:

```
[chapter intro]
	[scene intro]
		[image] background.png
		[sound] effect1.mp3
		[music] theme.ogg
		
		[on-global blast]
			[message]
				$> ${this.data} was blasted!
		
		[message]
			$> Choose your path:
		
		[next left-road]
			[label] Take the left road
		[next right-road]
			[label] Take the right road
```

It defines a scene named *intro* inside a chapter. When played, that scene will set a background image, a background music
and play a sound.
Then the scene would define a global event handler for the *blast* event that would display a message telling which character
was blasted.
After that, it displays the message *“Choose your path”* and allow the user to choose either the left or the right road.
After the user choice, it will jump either to the scene named *left-road* or *right-road* (those scenes does not appear
in this snippet)



<a name="ref.meta-tags"></a>
## Meta Tags

The meta tag syntax consists in a tag name and some attributes, between a two opening and two closing square brackets
(`[[` and `]]`).
See the [tag syntax](#ref.tags) for more details: tags and meta-tags share the same syntax except that meta-tags
use double opening and closing brackets where tags use a single opening and closing bracket.

One of the most common meta-tag is the built-in *doctype* tag. Here an example of doctype: `[[doctype spellcast/book]]`
(this is the doctype used by [Spellcast in story mode](https://github.com/cronvel/spellcast)).

There are few built-in, reserved or standardized meta-tags, but everyone is free to create their own custom meta-tags.

A meta-tags can have any type of content. Few example of meta-tags with content:

```
[[my-meta]] 1234
[[another-meta]] some meta data
[[yet-another-meta]]
	id: meta4357
	description: a meta description
```

Meta-tags will be instanciated with the `Tag` constructor.

The userland code may pass its own constructor to the parser, but it should have `Tag` as its superclass.

**All meta-tags MUST be placed at the begining of the file, before any other document content.**
Think of them as **headers**.

Userland code may pass a *meta-hook* to the parser, that hook will be triggered before the actual document content,
with all the meta-tags.
The hook may throw an error to interrupt the parser if there is something wrong with those meta-tags.

Meta-tags are not part of the document, the parser will not return them.
Since they are not part of the document, the *siblings should be of the same type* rule does not apply.

This is correct:

```
[[my-tag]]
name: Joe Doe
job: developer
```

But if it was a tag, it would be incorrect:

```
[my-tag]

# Parse error: a tag was expected, but got key/value pairs!
name: Joe Doe
job: developer
```



### Special Meta Tags

Here is a list of built-in/reserved/standardized meta-tags and their roles:

* [[doctype *name*]]: the doctype meta-tag is a **built-in** meta-tag, its role is to describe the document.
  Since KFG can describe a wide range of things, and can be extended/customized (tags, operators, etc),
  it is a very important meta-tag. The `doctype` option of [`kungFig.load()`](lib.md#ref.load) can enforce some doctype,
  rejecting KFG files that does not match. It prevents us from loading random/unrelated documents in our app
  by end-user mistake.

* [[locales *path*]]: this meta-tag is not built-in, but **standardized**. It means that KungFig has
  no special treatment for this tag, and that is the job of the userland code to process it the appropriate way
  (e.g.: should all the locales be loaded? or just the one found in a command line argument? Actually this is
  highly application dependent).
  However the `locales` meta-tag syntax is **standardized**: it should contain a path relative to the current file,
  and should support globs.
  Example of a valid `locales` tag: `[[locales path/to/locales/*]]`.

* [[include]]: **RESERVED**
* [[require]]: **RESERVED**
* [[module]]: **RESERVED**
* [[export]]: **RESERVED**
* [[kfg]]: **RESERVED**
* [[version]]: **RESERVED**



<a name="ref.includes"></a>
## Includes

**Includes is one of the key feature of KFG!**
It makes your work easier at managing complex configs or dataset.

Includes can import the whole document of a file, a sub-tree of the document of that file,
and even the current document or a sub-tree of it.

There are two type of include:

* optional includes start with a single *at sign* `@` immediately followed by the *reference*: if the reference is not found,
  it will be replaced by an empty object if the reference would point to a whole document, or undefined if it would point
  to a sub-tree. If the reference point to an existing file that contains parse error, it will throw anyway!
  Debugging would be hard if it doesn't.
* mandatory includes start with a double *at sign* `@@` immediately followed by the *reference*: if the reference is not found
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
  of [`kungFig.load()`](lib.md#ref.load) to load the file *mykfgfile.ext* or any file with the extension *.myext* as KFG.
* .json: this will load the file as JSON
* .js: this will load the file as a Node.js module: anything exported by the module will be returned.
  This is actually the sole way to include JS functions.
* .txt: this will load the file as a raw string

Any file format unknown to Kung-Fig will be assumed as raw string.

**Mixing includes and the “combining after” operator can be great:** [see it here](#ref.treeops.including-overriding).



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



<a name="ref.includes.relational"></a>
### Relational Data Representation

**It is also possible to reference parts of the current document itself.**
Just remove the file reference part.
It is usually called *relational data representation*.

Consider this:

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
This is an efficient data representation, it avoids redundancies, it avoids human errors and avoids
wasting memory.
Moreover, this is possible to stringify complex data structure that would usually fail (e.g. `JSON.stringify()`
would throw an error when attempting to serialize data with circular references).

It is also possible to reference the root of the document with a hash sign `#` and an empty local reference:

```
key: value
circular: @@#
```



<a name="ref.refs"></a>
## Refs

*Refs* are useful for building scripting language on top of KFG: they represent variables, or paths to variable.

When successfully parsed, it creates a [Kung-Fig Ref instance](lib.md#ref.Ref).

A *ref* always start with a `$`, followed by the whole dot-separated path.
E.g. `$path.to.my.var`.

Arrays are supported, with the bracket notation: `$myarray[1][2][3]`.
Or even `$[1][2][3]`, if the context supposed to be used to solve the *ref* is assumed to be an array.

Dots and brackets can be mixed together: `$path.to.array[1][2].key[3]`.

*Refs* can contain any depth-level of nested *refs*:
* `$path.to[$key1][$key2]`
* `$path.to[$path.to.keys[$key]]`

This basically works just like in Javascript or similar language, except that the dollar sign `$` is mandatory
for any variable.

**Beware: some characters are not supported!**
There is no escape mecanism ATM, so a *ref* cannot have keys containing those chars:
* dollar sign `$`
* brackets `[` and `]`
* dot `.`
* space ` `

**Spaces are forbidden everywhere.**

Those are incorrect:
* `$myarray[ 1 ]`
* `$path .to. my . var`



<a name="ref.template-sentences"></a>
## Template Sentences

*Template sentences* are useful for building scripting language on top of KFG: they are internationalizable templates,
containing references, and a lot of tools to ease human language.

When successfully parsed, it creates a [Kung-Fig TemplateSentence instance](lib.md#ref.TemplateSentence).

The syntax for declaring a *template sentence* is similar to the syntax for declaring strings:

* for the quoted template syntax, start with `$"` and end with `"`, and follow the [quoted string rules](#ref.strings.quoted)
* for the introduced template syntax, start with `$> ` and follow the [introduced string rules](#ref.strings.introduced)
* for the multi-line template syntax, start each line with the proper indentation, the `$> ` mark, and follow
  the [multi-line string rules](#ref.strings.multiline)
* for the multi-line folded template syntax, start each line with the proper indentation, the `$>> ` mark, and follow
  the [multi-line folded string rules](#ref.strings.multiline-folded)

Example of valid *template* declaration:

```
template1: $"Hello ${name}!"
template2: $> Hello ${name}!
template3:
	$> Hello ${name}!
	$> How are you?
```

As for the template syntax itself (i.e. the inside), it uses the
[Babel Tower sentence syntax](https://github.com/cronvel/babel-tower).

Basically, any `${}` mark (with a path inside the curly brace) are substituted by a value taken from the context.
The path syntax is closed to the one of the [Ref](#ref.refs), except that there is no support for nested references.
Hence, `$> Hello ${user.bob.name}!` is supported, but not `$> Hello ${user[$id].name}!`.

All [Babel Tower commands](https://github.com/cronvel/babel-tower) are supported.
E.g. `$> Hello ${who}[altng:(guy|girl)|(guys|girls)//uc]!` will be *solved* to `Hello GUYS!` if the context is equal
to `{ who: { g: "m" , n: "many" } }`, or it will be *solved* to `Hello GIRLS!` if the context is equal
to `{ who: { g: "f" , n: "many" } }`, or `Hello GUY!` if `{ who: { g: "f" , n: 1 } }`, etc...



<a name="ref.expressions"></a>
## Expressions

*Expressions* are useful for building scripting language on top of KFG: they provide arithmetical expression,
logic expression, various math functions, and more...

When successfully parsed, it creates a [Kung-Fig Expression instance](lib.md#ref.Expression).

The syntax for declaring an *expression* is similar to the syntax for declaring strings:
An expression is declared with `$=` followed by the expression itself until the end of the line.

The syntax for the *expression* itself is the following those rules:
* an *expression* should contain one or more parts, each parts is separated by at least one space
* ... so a part cannot contain any spaces
* a part can be an operand or an operator
* there can be only one operator, and it should be either the first or the second part, the place
  doesn't matter, being only for presentation
* ... but optionally, for presentation purpose, one may insert extra-operators if there are of the same kind,
  they will simply be ignored
* an operand can be:
	* a [constant](#ref.constants)
	* a [number](#ref.numbers)
	* a [quoted string](#ref.strings.quoted)
	* a [ref](#ref.refs)
	* another expression enclosed in a pair of parenthesis, each parenthesis should be preceded and followed
	  by at least one space
* if an expression has no operator:
	* if it has one operand, the expression will return that operand
	* if it has multiple operand, the expression will return an array of those operand
* for the multi-line expression syntax, start each line with the proper indentation, the `$= ` mark, and follow
  the [multi-line folded string rules](#ref.strings.multiline-folded)

An expression does not care if the operator come first or second, so `1 + 2` is the same than `+ 1 2`.
By the way, one may use the more natural variant, the former being recommended over the later.

Also `1 + 2 + 3 + 4` is the same than `+ 1 2 3 4`, since extra operators of the same kind are removed.

On the other hand, this is not correct and would throw an error: `3 + 4 - 2`.
There is no operator precedence in KFG, the user have to use parenthesis to denote orders.
So the incorrect `2 + 3 * 4` should be rewritten `2 + ( 3 * 4 )`

Since an operand cannot be a non-scalar adhoc value (there is no syntax for that ATM), objects and array
can still be used with the following tricks:
* use a [ref](#ref.refs) pointing to that array or object
* arrays of two or more elements can be produced with an implicit array sub-expression, e.g.: `( 1 2 3 )`
* arrays can be produced with the array operator in a sub-expression, e.g.: `( array 1 2 3 )`



<a name="ref.expressions.builtin-operators"></a>
### Built-in Expression Operators

Here a the full list of operators with their alias.
The number in parenthesis indicate how many operands is needed.

**Arithmetic operators:**

* `+`, `add` (1+): add all operands together
* `-`, `sub` (1+): depending on the number of operands:
	* 1: it is the unary operator, it negates the operand
	* more: all operands starting from the second one are subtracted from the first
* `*`, `mul` (1+): multiply all operands together
* `/`, `div` (1+): the first operand is divided by the second operand, the result is eventually divided
  by a third operand, and so on...
* `\`, `intdiv` (1+): this is the integer division operator: the first operand is divided by the second operand,
  the result is eventually divided by a third operand, and so on... each division produces an integer by truncating
  the result (i.e. rounding toward 0)
* `%`, `modulo` (1+): this is the **modulo** or **remainder operator**: the first operand is divided by the second operand
  and the remainder is returned, this remainder is eventually divided by a third operand and this produce
  another remainder that is returned, and so on... the modulo can be negative, e.g.: `-7 % 4` produces -3.
  This modulo variant works in pair with the `\` operator
* `\\` (1+): this is the floored integer division operator: it works like the integer division operator, but each result
  is floored instead of truncated (produces different values for negative numbers)
* `%+` (1+): this is the positive modulo operator: it works like the modulo operator, but it always produces positive,
  so it produces different result for negative numbers, e.g.: `-7 %+ 4` produces 1.
  This modulo variant works in pair with the `\\` operator.

**Comparison operators:**

* `>` (2): returns true if the first operand is greater than the second, otherwise returns false
* `>=` (2): returns true if the first operand is greater than or equal to the second, otherwise returns false
* `<` (2): returns true if the first operand is lesser than the second, otherwise returns false
* `<=` (2): returns true if the first operand is lesser than or equal to the second, otherwise returns false
* `=`, `==`, `===` (2): returns true if the first operand is **strictly** equal to the second, otherwise returns false
* `!=`, `!==` (2): returns true if the first operand is **strictly** equal to the second, otherwise returns false

**Logical operators:**

* `!`, `not` (1): returns true if the first operand is *falsy*, otherwise returns false
* `and` (1+): returns the logical *AND* value of all operands
* `or` (1+): returns the logical *OR* value of all operands
* `xor` (1+): returns the logical *XOR* value of all operands, if there are more than 2 operands,
  the logical *XOR* **is not iterative but exclusive**, therefore `true xor true xor true` returns *false*:
  there should be one and only one *truthy* value. If it was meant to be iterative, it would returns *true*
  (*true xor true* -> *false*, then *false xor true* -> *true*). If you want to force an iterative *XOR*,
  just add parenthesis: `( true xor true ) xor true` will returns *true*.
* `&&` (1+): this is the **guard operator**: it returns the first *falsy* operand, otherwise it returns the last,
  it can be used as the **and operator** if it doesn't matter if the result is not a boolean
* `||` (1+): this is the **default operator**: it returns the first *truthy* operand, otherwise it returns the last,
  it can be used as the **or operator** if it doesn't matter if the result is not a boolean
* `?` (3): this is the **ternary operator**, if the first operand is *truthy*, then it returns the second operand,
  else it returns the third.
* `???` (4): this is the **three way operator**, if the first operand is negative, then it returns the second operand,
  if it is positive then it returns the fourth operand, else it returns the third operand (if 0, null or
  various edge cases like NaN).

**Rounding:**

* `round` (1,2): rounds the first operand to the nearest integer, if a second operand is given, this is the step increment
  (default to 1): the first operand is rounded to the nearest step. E.g. `round 0.8 2` returns 0 while `round 1.2 2` returns 2.
* `floor` (1,2): returns the smallest integer lesser than or equal to a given number, if a second operand is given,
  this is the step increment (default to 1): the first operand is rounded down to the nearest step.
  E.g. `floor 1.2 2` returns 0.
* `ceil` (1,2): returns the smallest integer greater than or equal to a given number, if a second operand is given,
  this is the step increment (default to 1): the first operand is rounded up to the nearest step.
  E.g. `ceil 0.8 2` returns 2.
* `trunc` (1,2): returns the integral part of a number by removing any fractional digits. If a second operand is given,
  it is used in the same way than for *round*, *floor* and *ceil*.

**Various math functions:**

* `sign` (1): returns the sign of the first operand: -1, 0 or 1, or even -0, if relevant
  (see [the MDN Math.sign() page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign).
* `abs` (1): returns the absolute value of the first operand.
* `max` (1+): returns the greatest operand.
* `min` (1+): returns the smallest operand.
* `^`, `pow` (2): returns the base (first operand) to the exponent (second operand) power
* `exp` (1): returns e (the Euler's number) to the first operand power
* `log` (1): returns the natural logarithm (base e, the Euler's number) of the first operand
* `log2` (1): returns the base 2 logarithm of the first operand
* `log10` (1): returns the base 10 logarithm of the first operand
* `sqrt` (1): returns the square root of the first operand
* `cos` (1): returns the cosine of the first operand
* `sin` (1): returns the sine of the first operand
* `tan` (1): returns the tangent of the first operand
* `acos` (1): returns the arc cosine (in radians) of the first operand
* `asin` (1): returns the arc sine (in radians) of the first operand
* `atan` (1): returns the arc tangent (in radians) of the first operand
* `atan2` (2): returns the arc tangent of the quotient of the first and second operand
  See [the MDN Math.atan2() page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2).
* `hypot` (2+): returns the hypothenuse of a right triangle, where the first and the second operands are its side,
  or more generally: the square root of the sum of squares of its operands.
* `avg` (1+): returns the average value of its operands, **or** if there is only one operand that is an array,
  returns the average value of all the elements of that array

**Array operators:**

* `array` (0+): creates an array from all its operand and returns it
* `concat` (0+): merges all its operands array and returns it, if an operand is not an array, it is assumed to be
  an array of itself

**Type checker operators:**

* `is-set?` (1): returns true if the first operand is defined (i.e. not `undefined`), otherwise returns false
* `is-boolean?` (1): returns true if the first operand is a boolean, otherwise returns false
* `is-number?` (1): returns true if the first operand is a number, otherwise returns false
* `is-real?` (1): returns true if the first operand is a real number (not NaN, not +/- Infinity), otherwise returns false
* `is-string?` (1): returns true if the first operand is a string, otherwise returns false
* `is-array?` (1): returns true if the first operand is an array, otherwise returns false
* `is-object?` (1): returns true if the first operand is an object (but **not an array**), otherwise returns false
* `is-empty?` (1): returns true if the first operand is either an empty array or not an array and falsy
* `is-not-empty?` (1): returns true if the first operand is either a non-empty array or not an array and truthy

**Misc operators:**

* `has` (2): returns true if the first operand has the second operand, i.e. if the the first operand is an array
  has the second operand, or if the first operand is an object that has a `.has()` method that returns true when
  called with the second operand. Otherwise it returns false.
  an array of itself
* `->`: RESERVED



<a name="ref.treeops"></a>
## Tree Operations

KFG has a special *tree operations* syntax.

*Tree operations* merge multiple trees (i.e. deep nested object structure) according to some rules.
It works mostly like a regular *deep object extensions* most Javascript coders are used to,
except that some specials operators can affect how the merge works for some properties.

*Tree operations* are great for many things.
One of the greatest use-case is for games, especially RPG-like game, where some items/spells/power-up can
boost the character base stats.

Let's see *tree operations* in action with two KFG files:

```
# This is the KFG of the character
name: Jörgl, the Barbarian
hp: 8
attack: 5
defense: 4
```

```
# This is the KFG of an item: the Amulet of Protection
defense: (+) 1
hp: (+) 2
```

If both KFG are loaded and combined (e.g. using Kung Fig's [`kungFig.reduce( character , amulet )`](lib.md#ref.treeops.reduce)),
it would produce the document: `{ "name": "Jörgl, the Barbarian", "hp": 10 , "attack": 5 , "defense": 5 }`.

The *tree operator* syntax rules are:
* the operator should be placed **after** the property key and its colon `:`, except for the parent node operator case
* the operator should be placed **before** an eventual class/constructor
* the operator should be placed **before** an eventual inline scalar value
* the operator is enclosed inside parenthesis `()`, therefore it should not contain parenthesis
* operators are only working on objects
* parent node operator: if an operator is not preceded by a property key (i.e. it is the first thing on the line after
  eventually the indentation), it will be applied on the parent *node*

When multiple property-operators target the same property, they are applied in a predefined order.
For example the `*` operator is always applied before the `+` operator, regardless of which one come first in the file.

So those two items would produce the same result:

```
# First item
defense: (*) 2
defense: (+) 3
```

```
# Second item
defense: (+) 3
defense: (*) 2
```

If it was merged with the character of the first example, both would produce:
`{ "name": "Jörgl, the Barbarian", "hp": 8 , "attack": 5 , "defense": 11 }`.

<a name="ref.treeops.including-overriding"></a>
**Now let's talk about a great usage for config files: including and overriding.**

Consider this application config as it would be packaged in the source code:

```
base-url: www.example.com
port: 1234
log-level: warning

(*>) @config.local.kfg
```

The last line contains all the magic.
As you can see, there is that `@` that performs an [optional include](#ref.includes) of the file
named `config.local.kfg` (if the file is not found, it returns an empty object).
Before the include command, there is the *combine after operator*, not preceded by a key,
that means that the operator will target the *parent node*: the root document itself.

So it will simply merge the the current file and the `config.local.kfg` file together, the later overriding the former.

If the `config.local.kfg` file contains this:

```
app-name: my supa app
log-level: debug
```

... loading the previous master file would produce: 
`{ "app-name": "my supa app" , "base-url": "www.example.com" , "port": 1234 , "log-level": "debug" }`.



<a name="ref.treeops.operators"></a>
### Operator list

All those operators are listed from the highest to lowest priority.

* the *empty operator* (nothing in the parenthesis: `()`): it just replace the target property
* `<*` the *combine before operator*: it [merges](lib.md#ref.treeops.autoReduce) the target property and the operand,
  but it acts as if the operand was coming first: the operand properties can never override existing target properties,
  but instead can provide defaults
* `*>` the *combine after operator*: it [merges](lib.md#ref.treeops.autoReduce) the target property and the operand,
  so the operand properties may override the target properties
* `<<*` the *combine before operator, lower priority*: just like the *combine before operator*
* `*>>` the *combine after operator, lower priority*: just like the *combine after operator*
* `<+` the *prepend operator*: it prepends the operand array to the target property array
* `+>` the *append operator*: it appends the operand array to the target property array
* `/` the *divide operator*: it divides the target property by the operand
* `*` the *multiply operator*: it multiplies the target property by the operand
* `-` the *subtract operator*: it subtracts operand to the target property
* `+` the *add operator*: it adds the operands and the target property

