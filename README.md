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
	* conditional pluralizations


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
#### ``` {{things|uc}}  ```
#### basic formatters
#### upper case ```|uc*```
* `|uc` will upper case the whole text
* `|ucw` will upper case the start of each word in the selected text
* `|ucf` will upper case the first letter in the selected text
* `|ucr` will randomly upper case the selected text... i dont know why

### Indefinite Article
#### an vs a

To get `an` or `a` prepended to the start of the selected text based on a vowel or things that sound like they start with a vowel like "honor" we use the formatter `|an`

#### ``` {{things|an}}  ```

this will add the `an` or `a` to the start of the selected text, however it will not remove predifined `an's` or `a's`.


#### ``` {{things|reverse}}  ```

this will add the `an` or `a` to the start of the selected text, however it will not remove predifined `an's` or `a's`.

##Nested or grouping Tags
For.. reasons we can group words in sub lists say if we have big animals and small animals we can do the following, this will be useful for various reasons
```
var json = {
    ...
    "animal": {
        "small": [
            "fox",
            "dog",
            "cat",
            "snake",
            "ant"
        ],
        "big": [
            "baboon",
            "hippo",
            "elephant",
            "zebra",
            "giraffe"
        ]
    }
    ...  
}
```
now we can do the following

#### ``` {{animal}} ```
Will select any animal small or big
	
#### ``` {{animal.small}} ```
Will only select small

#### ``` {{animal.big}} ```
Will only select big animals

# Tags that reference other tags
As we have covered you can store variables and you can nest lists when you store a variable it will remember what group list it came from.

##Select from Like selected
We can store a vairable like ```{{a1:animal}}```... `a1` then when we select from another same grouped list or the same animal list, we can tell it to select from the group `a1` came from with the `|like` modifier. In this example we can do `{{animal|like:a1}}`.

```
var json = {
	"root" : [
    	"Jimbo the {{a1:animal}} lives with a {{animal|like:a1}}"
    ],
    animal : {"big" : [...], "small" : [...]}
};
```

##Pluralize
This is under "Tags that reference other tags" as we can do conditional pluralization based on stored variables. 

But  first the basic example
###basic
we can force a plural by just using `|m`
#### ```{{animal|m}}```

###Advanced
lets say we have a list with numbers in it.
```
$json = {
    animal : {"big" : [...], "small" : [...]}
    "number" : {
        "single": ["1"],
        "multiple":["2","three","four thousand", "three small"]
    }
}
```

we can store the number `{{how_many:number}}` then we can pluralize based on the evalualted number `{{animal|p:howmany}}`

We have grouped our numerical values as we can also do a conditional based on the group that a variable came from. Now we can get **were** vs **was**  The syntax is quite different. `{(how_many::multiple?'were':'was')}`

To string it all together we can do 
```
$json = {
    "root" : ["There {[how_many::multiple?'were':'was']} {{how_many:number}} {{animal|p:how_many}}"]
}
```






### Pluruls
Arg this get s little more complicated ill finish it in the morning


---
---

You got this far so i supose you can try out my test editor. version Alpha 000000000000000.1, saying that it mostly works :D
[Test playground](http://tools.aaron-m.co.nz/replacer/editor/editor.html)
