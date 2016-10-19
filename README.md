

# Kung-Fig

![Kung Fig!](https://raw.githubusercontent.com/cronvel/kung-fig/master/kung-fig.png)

The Kung Fu of configuration files!

Support includes and circular includes.

Beta version.



## Special command

Special command can be added at the beginning of the key of a property.

If the `object` object has the current key/value pair...

* `"@@key" : "path/to/another.json"` : ... then it will load the Kung-Fig file `path/to/another.json` and put it into `object.key`,
	if it can't open the file, it throw an error

* `"@@key" : "#tree.path"` : ... then it will set `object.key` to `object.tree.path`

* `"@@key" : "path/to/another.json#tree.path"` : ... then it will mix the previous two: it will load `path/to/another.json` and
	extract only `.tree.path` sub-object, and put it into `object.key`

* `"@@key" : "#"` : ... then it will set `object.key` to `object`: this allows circular references to be stored

* `"@key" : "path/to/another.json"` : ... then it will load the Kung-Fig file `path/to/another.json` and put it into `object.key`,
	if it can't open the file, `object.key` will be set to `{}` (empty object)

