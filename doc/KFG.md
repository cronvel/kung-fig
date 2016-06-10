
# The Wonderful KFG format

The **KFG** format is the **Kung-Fig** file format, and it does wonders for all your config files. It's like .cfg on steroid!
Once you start using it, you won't use anything else!

**KFG** is primarily a **human-friendly format for describing data**
(i.e. a [data serialization language](https://en.wikipedia.org/wiki/Serialization)).

But it also features **custom classes/constructors**, **operations** and **tree operations** (like sub-tree merge),
**file inclusion**, and even **tag** to serve as the basis of a scripting language.

**This documentation is still a Work In Progress.**



## Getting started


```
first-name: Joe
last-name: Doe
```

... is parsed into `{ "first-name": "Joe" , "last-name": "Doe" }`.


```
fruits:
	- banana
	- apple
	- pear
```

... is parsed into `{ "fruits": [ "banana" , "apple" , "pear" ] }`.



## History

It all started back in 2009, when Cédric Ronvel was bored by the fact that JSON would be a great language to write config file
if it had comments support and be less nitpicking with comma.

It ends up being like JSON without braces, bracket and comma, optional double-quote, relying on indentation for hierarchical
data representation, very close to YAML (also it was done *before* knowing the existence of YAML), and a simple syntax
to perform operation.

The addition of **custom classes/constructors** and **tags** appears in 2016 to support creation of simple scripting language.



## Constants:

* `null`: represent the `null` value.
* `true`, `yes`, `on`: they are all representing the boolean `true` value.
* `false`, `no`, `off`: they are all representing the boolean `false` value.
* `NaN`: a number type whose value is *Not A Number* (e.g.: what we get when we divide by zero)
* `Infinity`: a number type whose value is `Infinity`
* `-Infinity`: a number type whose value is `-Infinity`



## Built-in class/constructor:

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

* `<Regex>`, `<regex>`, `<RegExp>`, `<Regexp>`, `<regexp>`: construct a RegExp object from a string of the form `/<regexp>/<flag>`
  E.g.: `<RegExp> /hello/i`

