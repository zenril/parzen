# ParZen

A library for generating random well formated sentences from defined lists.

 * Supports Indefinite Article
 * Most pluralization, I still have work to do on Plural Possessives. 
 * Create and store variables for re-use from Randomly chosen words 
 * There are a few over writeable formatting functions that are baked in like
	* Full upper case
	* Upper case start of words
	* Upper case only the very first character
	* Pluralization based on context
	* Always pluralize
	* conditional pluralization


## Getting started

To Initialize ParZen You will need some basic JSON lists of words and phrases. However only one list is required, the 'root' list as everything is recursively built from this definition. 

In this example im going to start out with my base sentence stucture in the root node
and have a couple of supporting nodes. I'm going to use this 

"You miss 100 percent of the shots you never take."

 base sentence structure and change it around


```
var json = {
	"root" : [
    	"you {{miss}} {{number}} percent of the {{things}} you {{end}}.
    ],
    "miss" 		: [ "miss", "hit", "take", "throw" ],
    "number" 	: [ "20", "40", "60", "80", "100" ],
    "things" 	: ["papers", "turnips", "shots", "chances"],
    "end" 		: ["never {{action}}", "won't {{action}}", "did {{action}}"],
    "action" 	: ["plant", "write", "taste", "touch", "open", "{{miss}}]   
};

var pz = new ParZen( json );
var pzSentence = pz.build();
```

This is not a good or even fun example however, With such a structure you might get sentences like these
* you throw 80 percent of the chances you never take
* you take 80 percent of the papers you didn't plant
* you hit 100 percent of the shots you didn't throw

## The basic tag makeup
### ``` {{variable:list_reference|formatters|or_modifiers}}  ```

only the list_reference is required in a tag. Here is an example of using all the parts.
```
var json = {
	"root" : [
    	"{{type:temperament|ucf}} {{person:people}} are the {{best}} type of {{person}}
    ]
}
...
```

I'm no good at writing sample / filler text, so go write something yourself.

Look, a list!

 * foo
 * bar
 * baz

And here's some code! :+1:

```javascript
$(function(){
  $('div').html('I am a div.');
});
```

This is [on GitHub](https://github.com/jbt/markdown-editor) so let me know if I've b0rked it somewhere.


Props to Mr. Doob and his [code editor](http://mrdoob.com/projects/code-editor/), from which
the inspiration to this, and some handy implementation hints, came.

### Stuff used to make this:

 * [markdown-it](https://github.com/markdown-it/markdown-it) for Markdown parsing
 * [CodeMirror](http://codemirror.net/) for the awesome syntax-highlighted editor
 * [highlight.js](http://softwaremaniacs.org/soft/highlight/en/) for syntax highlighting in output code blocks
 * [js-deflate](https://github.com/dankogai/js-deflate) for gzipping of data to make it fit in URLs
