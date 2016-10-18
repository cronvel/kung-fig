
# The Wonderful KFG format

The **KFG** format is the **Kung-Fig** file format, and it does wonders for all your config files. It's like .cfg on steroid!
Once you start using it, you won't use anything else!

**KFG** is primarily a **human-friendly format for describing data**
(i.e. a [data serialization language](https://en.wikipedia.org/wiki/Serialization)).

But it also features **custom classes/constructors**, **operations** and **tree operations** (like sub-tree merge),
**file inclusion**, and even **tags** to serve as the basis of a scripting language.

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

But KFG can do a lot more! Using few built-in constructors, we can store date or binary:

```
date: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)
bin: <bin16> af461e0a
```

... will produce an object, with 2 properties, the *date* property will contain a Javascript `Date` object,
and the *bin* property will contain a `Buffer` instance created from the hexadecimal string.
By the way the *date* constructor accepts a lot of input format, like timestamp, ISO, ...

Also KFG supports tags:

```
[message]
	text: Hello world!
	color: blue
```

Parsing that will produce an instance of `TagContainer` that contains a single `Tag` instance, whose name is `message`,
and whose content is `{ "text": "Hello world!" , "color": "blue" }`.

Tags are useful to create scripting language. They supports attributes:

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



## Language References

**This section is still a work in progress.**



### Table of Content

* [Constants](#ref.constants)
* [Strings](#ref.strings)
* [Built-in constructors](#ref.builtin-constructors)



<a name="ref.constants"></a>
### Constants

* `null`: represent the `null` value.
* `true`, `yes`, `on`: they are all representing the boolean `true` value.
* `false`, `no`, `off`: they are all representing the boolean `false` value.
* `NaN`: a number type whose value is *Not A Number* (e.g.: what we get when we divide by zero)
* `Infinity`: a number type whose value is `Infinity`
* `-Infinity`: a number type whose value is `-Infinity`



<a name="ref.strings"></a>
### Strings

There are many way to declare strings in KFG.



<a name="ref.strings.implicit"></a>
#### Implicit Strings

The most straight-forward way is implicit strings.

For example, this KFG file will produce `{ "name": "Joe Doe" }`:

```
name: Joe Doe
```

Implicit strings are fine, however they should not collide with an existing [constants](#ref.constants),
should not be a number and should not start by a symbole used by the Spellcast syntax, like:

- spaces and tabs (they are trimmed out)
- double-quote `"`
- lesser than `<` or greater than `>`
- opening parenthesis `(`
- arobas `@`
- dollar `$`

Trailing spaces and tabs are trimmed out too.

Multi-line strings are not supported by the implicit syntax.

If you are in one of those cases, declare your string using one of the following syntax.



<a name="ref.strings.quoted"></a>
#### Quoted Strings

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
#### Introduced Strings

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
#### Multi-line Strings

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



