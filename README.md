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
var sentence = pz.build();
```

This is not a good or even fun example however, With such a structure you might get sentences like these
* you throw 80 percent of the chances you never take
* you take 80 percent of the papers you didn't plant
* you hit 100 percent of the shots you didn't throw

# The basic tag makeup
### ``` {{variable:list_reference|formatters|or_modifiers}}  ```
---
## basic
The simplest form of the tag only uses `list_reference`. 

This will pull random text from the list of `things`

### ``` {{things}}  ```

---

## storing a value for later
We can store the text that gets pulled from the list of `things` in a varible called `item` or whatever we want by prepending `item` to `things` seperated by a `:`
### ``` {{item:things}}  ```
We can use `item` again by using  it just like a list defined in the json we can reference it with ```{{item}}```
Infact because `item` is a list we can assign one `things` or many `things` or even text from other lists like `action`

---

## modifiers and formatters

To use modifiers and formatters you would prepend `|` followed by the formatting function `|uc`. `|uc` will upper case the whole selected text. So the whole tag might look like  
### ``` {{things|uc}}  ```
### basic formatters
#### upper case
* `|uc` will upper case the whole text
* `|ucw` will upper case the start of each word in the selected text
* `|ucf` will upper case the first letter in the selected text
* `|ucr` will randomly upper case the selected text... i dont know why

### Indefinite Article
#### an vs a

To get `an` or `a` prepended to the start of the selected text based on a vowel or things that sound like they start with a vowel like "honor" we use the formatter `|an`

### ``` {{things|an}}  ```

this will add the `an` or `a` to the start of the selected text, however it will not remove predifined `an's` or `a's`.

### Pluruls
Arg this get s little more complicated ill finish it in the morning



only the list_reference is required in a tag. Here is an example of using all the parts.


You got this far so i supose you can try out my test editor. version Alpha 000000000000000.1, saying that it mostly works :D
[Test playground](http://tools.aaron-m.co.nz/replacer/editor/editor.html)
