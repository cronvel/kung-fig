
# The Wonderful KFG format

The **KFG** format is the **Kung-Fig** file format, and it does wonders for all your config files. It's like .cfg on steroid!
Once you start using it, you won't use anything else!

**KFG** is primarily a **human-friendly format for describing data**
(i.e. a [data serialization language](https://en.wikipedia.org/wiki/Serialization)).

But it also features **custom classes/constructors**, **operations** and **tree operations** (like sub-tree merge),
**file inclusion**, and even **tag** to serve as the basis of a scripting language.

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

Note that **tabs SHOULD be used** to indent the KFG. This is the **recommended** way. One tab per level.

If you insist with spaces, KFG only supports the 4-spaces indentation.

Note how objects and arrays are implicit in KFG.

A *node* is an object if it contains a key followed by a colon `:`.
A *node* is an array if it contains array element introduced by the minus sign `-`.

But KFG can do a lot more! Using few built-in constructors, we can store date or binary:

```
date: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)
bin: <bin16> af461e0a
```

... will produce an object, with 2 properties, the *date* property will contain a Javascript `Date` object,
and the *bin* property will contain a `Buffer` instance.
By the way the *date* constructor accepts a lot of input format, like timestamp, ISO, ...

KFG supports tags:

```
[message]
	text: Hello world!
	color: blue
```

Parsing that will produce an instance of `TagContainer` that contains a single `Tag` instance, whose name is `message`,
and whose content is `{ "text": "Hello world!" , "color": "blue" }`.

Tags are useful to create scripting language. They supports attributes:



## History

It all started back in 2009, when Cédric Ronvel was bored by the fact that JSON would be a great language to write config file
if it had comments support and be less nitpicking with comma.

It ends up being like JSON without braces, bracket and comma, optional double-quote, relying on indentation for hierarchical
data representation, very close to YAML (also it was done *before* knowing the existence of YAML), and a simple syntax
to perform operation.

The addition of **custom classes/constructors** appears in 2015.
The addition of **tags** appears in 2016 to support creation of simple scripting language.



## Language References

**This section is still a work in progress.**



### Constants

* `null`: represent the `null` value.
* `true`, `yes`, `on`: they are all representing the boolean `true` value.
* `false`, `no`, `off`: they are all representing the boolean `false` value.
* `NaN`: a number type whose value is *Not A Number* (e.g.: what we get when we divide by zero)
* `Infinity`: a number type whose value is `Infinity`
* `-Infinity`: a number type whose value is `-Infinity`



### Built-in class/constructor

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



