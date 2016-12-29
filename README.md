
# Kung-Fig

![Kung Fig!](https://raw.githubusercontent.com/cronvel/kung-fig/master/kung-fig.png)

*The Kung Fu of configuration files!*

**Kung-Fig** is a **wonderful** file format named **KFG**, its parser, its stringifier, and a set of great tools.

It is **great** for:

* Configuration files
* Hierarchical configuration files
* Global/local and vanilla/plugins override and extension management
* Application data
* Saving user prefs in a human-friendly format
* Building scripting language on top of it
* Game characters, weapons, armors, spells, etc, stats and bonuses
* Internationalization/localization
* *... and many more*

Now, look at this **impressive** list of features:

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
* Tree operations (merge, combine, etc)

Official support of the [Atom editor](https://atom.io):
* [KFG and Spellcast! language package](https://atom.io/packages/language-kfg)
* [Syntax theme dedicated to KFG and Spellcast!](https://atom.io/packages/kfg-dark-syntax) (more suitable colors, and it colorizes
  specific KFG *scopes*)



### A KFG Primer

Example of document:

```
# This is a comment!

# Set few properties:
first-name: Joe
last-name: Doe
age: 47

# This property contains an array:
interest:
	- science
	- literature
	- computer

# Use the special 'date' constructor:
birth-date: <date> Fri Jan 02 1970 11:17:36 GMT+0100 (CET)

# This include a file
items: @@path/to/file/items.kfg
```

Example featuring tags, suitable for for scripting (here [Spellcast Scripting](https://github.com/cronvel/spellcast)):

```
# Meta-tags (like headers)
[[doctype adventurer]]
[[locales locales/*]]

# Tags
[chapter story]
	
	[scene intro]
		[image] village.png
		[music] intro-theme.ogg
		
		[message]
			$> Once upon a time, there was a ${character.class}...
		
		[next end]
	
	[scene end]
		[image] castle.png
		[music] ending-theme.ogg
		
		[message]
			$> You found the master and learn everything he taught to you.
			$> You became famous in the entire country.
		
		[win]
```



## Table of Contents

* [The Wonderful KFG Format](doc/KFG.md)
* [Basic Module Methods](doc/lib.md#ref.basic)
	* [.load()](doc/lib.md#ref.load)
	* [.loadMeta()](doc/lib.md#ref.loadMeta)
	* [.saveJson()](doc/lib.md#ref.saveJson)
	* [.saveKfg()](doc/lib.md#ref.saveKfg)
* [The Dynamic Interface](doc/lib.md#ref.Dynamic)
	* [.get(), .getValue()](doc/lib.md#ref.Dynamic.get)
	* [.getFinalValue()](doc/lib.md#ref.Dynamic.getFinalValue)
	* [.getRecursiveFinalValue()](doc/lib.md#ref.Dynamic.getRecursiveFinalValue)
	* [.toString()](doc/lib.md#ref.Dynamic.toString)
	* [.apply()](doc/lib.md#ref.Dynamic.apply)
	* [.set()](doc/lib.md#ref.Dynamic.set)
* [The Ref Class](doc/lib.md#ref.Ref)
	* [Ref.create()](doc/lib.md#ref.Ref.create)
	* [Ref.parse()](doc/lib.md#ref.Ref.parse)
	* [.setRef()](doc/lib.md#ref.Ref.setRef)
	* [.get(), .getValue()](doc/lib.md#ref.Ref.get)
	* [.set()](doc/lib.md#ref.Ref.set)
* [The Template Class](doc/lib.md#ref.Template)
	* [Template.create()](doc/lib.md#ref.Template.create)
* [The TemplateElement Class](doc/lib.md#ref.TemplateElement)
	* [TemplateElement.parse()](doc/lib.md#ref.TemplateElement.parse)
	* [TemplateElement.create()](doc/lib.md#ref.TemplateElement.create)
* [The Expression Class](doc/lib.md#ref.Expression)
	* [Expression.parse()](doc/lib.md#ref.Expression.parse)
	* [Expression.create()](doc/lib.md#ref.Expression.create)
* [The Tag Class](doc/lib.md#ref.Tag)
	* [new Tag()](doc/lib.md#ref.Tag.new)
	* [.parseAttributes()](doc/lib.md#ref.Tag.parseAttributes)
	* [.stringifyAttributes()](doc/lib.md#ref.Tag.stringifyAttributes)
	* [.getParentTag()](doc/lib.md#ref.Tag.getParentTag)
	* [.getFinalContent()](doc/lib.md#ref.Tag.getFinalContent)
	* [.getRecursiveFinalContent()](doc/lib.md#ref.Tag.getRecursiveFinalContent)
* [Built-in Tag Derived Class](doc/lib.md#ref.Tag.derived)
	* [LabelTag Class](doc/lib.md#ref.Tag.LabelTag)
	* [VarTag Class](doc/lib.md#ref.Tag.VarTag)
	* [ClassicTag Class](doc/lib.md#ref.Tag.ClassicTag)
	* [ExpressionTag Class](doc/lib.md#ref.Tag.ExpressionTag)
* [The TagContainer Class](doc/lib.md#ref.TagContainer)
	* [new TagContainer()](doc/lib.md#ref.TagContainer.new)
	* [.get()](doc/lib.md#ref.TagContainer.get)
	* [.getTags()](doc/lib.md#ref.TagContainer.getTags)
	* [.getFirstTag()](doc/lib.md#ref.TagContainer.getFirstTag)
	* [.getUniqueTag()](doc/lib.md#ref.TagContainer.getUniqueTag)
* [Tree Operations](doc/lib.md#ref.treeops)
	* [.reduce()](doc/lib.md#ref.treeops.reduce)
	* [.autoReduce()](doc/lib.md#ref.treeops.autoReduce)
	* [.toObject()](doc/lib.md#ref.treeops.toObject)
	* [.reduceToObject()](doc/lib.md#ref.treeops.reduceToObject)

