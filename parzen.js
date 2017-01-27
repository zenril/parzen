
/*
* indefinite-article.js v1.0.0, 12-18-2011
* 
* @author: Rodrigo Neri (@rigoneri)
* 
* (The MIT License)
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE. 
*/ 
indefiniteArticle = function(e){var n=/\w+/.exec(e);if(!n)return"an";var r=n[0],a=r.toLowerCase(),i=["honest","hour","hono"];for(var o in i)if(0==a.indexOf(i[o]))return"an";if(1==a.length)return"aedhilmnorsx".indexOf(a)>=0?"an":"a";if(r.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/))return"an";regexes=[/^e[uw]/,/^onc?e\b/,/^uni([^nmd]|mo)/,/^u[bcfhjkqrst][`aeiou]/];for(var o in regexes)if(a.match(regexes[o]))return"a";return r.match(/^U[NK][AIEO]/)?"a":r==r.toUpperCase()?"aedhilmnorsx".indexOf(a[0])>=0?"an":"a":"aeiou".indexOf(a[0])>=0?"an":a.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/)?"an":"a"};

//found here
//http://stackoverflow.com/questions/27194359/javascript-pluralize-a-string

plural = function(e,s){
    var $={"(quiz)$":"$1zes","^(ox)$":"$1en","([m|l])ouse$":"$1ice","(matr|vert|ind)ix|ex$":"$1ices","(x|ch|ss|sh)$":"$1es","([^aeiouy]|qu)y$":"$1ies","(hive)$":"$1s","(?:([^f])fe|([lr])f)$":"$1$2ves","(shea|lea|loa|thie)f$":"$1ves",sis$:"ses","([ti])um$":"$1a","(tomat|potat|ech|her|vet)o$":"$1oes","(bu)s$":"$1ses","(alias)$":"$1es","(octop)us$":"$1i","(ax|test)is$":"$1es","(us)$":"$1es","([^s]+)$":"$1s"},i={"(quiz)zes$":"$1","(matr)ices$":"$1ix","(vert|ind)ices$":"$1ex","^(ox)en$":"$1","(alias)es$":"$1","(octop|vir)i$":"$1us","(cris|ax|test)es$":"$1is","(shoe)s$":"$1","(o)es$":"$1","(bus)es$":"$1","([m|l])ice$":"$1ouse","(x|ch|ss|sh)es$":"$1","(m)ovies$":"$1ovie","(s)eries$":"$1eries","([^aeiouy]|qu)ies$":"$1y","([lr])ves$":"$1f","(tive)s$":"$1","(hive)s$":"$1","(li|wi|kni)ves$":"$1fe","(shea|loa|lea|thie)ves$":"$1f","(^analy)ses$":"$1sis","((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$":"$1$2sis","([ti])a$":"$1um","(n)ews$":"$1ews","(h|bl)ouses$":"$1ouse","(corpse)s$":"$1","(us)es$":"$1",s$:""},o={move:"moves",foot:"feet",goose:"geese",sex:"sexes",child:"children",man:"men",tooth:"teeth",person:"people"},r=["sheep","fish","deer","series","species","money","rice","information","equipment"];if(r.indexOf(e.toLowerCase())>=0)return e;for(word in o){if(s)var a=new RegExp(o[word]+"$","i"),t=word;else var a=new RegExp(word+"$","i"),t=o[word];if(a.test(e))return e.replace(a,t)}if(s)var n=i;else var n=$;for(reg in n){var a=new RegExp(reg,"i");if(a.test(e))return e.replace(a,n[reg])}return e
}

/*
* ZenBot.js v1.0.0
* 
* @author: Aaron Meredith (@zenril)
* 
* (The MIT License)
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE. 
*/ 

var ParZen = function(json) {
	var public = this;
    var private = {};
	private.data = json;
	private.userData = {};
	private.variables = {};
	public.formatters = {};
	private.pathMap = {};
	private.flags = {};

	public.json = function(json) {
		private.data = json;
	}


	public.getUserTemplateVariables = function() {
		return private.userData;
	}

	private.process = function() {
		return private.getNode("root").str;
	}

	public.formatters.ucf = function(words, params) {
		return words.charAt(0).toUpperCase() + words.slice(1);
	}

	public.formatters.uc = function(words, params) {
		return words.toUpperCase();
	}

	public.formatters.ucr = function(words, params) {
		if (Math.random() > 0.7) {
			return words.toUpperCase();
		}
		return words;
	}

	public.formatters.ucw = function(words, params) {
		return words.replace(/\w\S*/g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	public.formatters.an = function(words, params) {
		return private.indefiniteArticle(words.split(" ")[0]) + " " + words;
	}

	public.formatters.p = function(words, params) {

		var subpathMap = private.pathMap[params[1]][1].join(".");
		var tocheckwith = params[params.length - 1];

		if (subpathMap.indexOf(tocheckwith) != -1) {
			if (private.data["plurals"] && private.data["plurals"][words]) {
				words = private.data["plurals"][words];
			} else {
				words = private.plural(words);
			}
		}
		return words;
	}

	public.formatters.m = function(words, params) {
		return private.plural(words);
	}

	for (var formatFunction in ParZen.formatters) {
		public.formatters[formatFunction] = ParZen.formatters[formatFunction];
	}

	private.indefiniteArticle = indefiniteArticle;
	private.plural = plural;

	private.getNode = function(name, pathMap) {

		var data = private.data[name];
		if (!data) {
			data = private.userData[name];
		}
		var key = null;

		if (!data) {
			throw "Cannot find `" + name + "` in defined JSON lists.";
		}

		var parse = data;
		var pathArray = [];

		var t = typeof pathMap != 'undefined' && pathMap != null ? pathMap : [];
		var i = 0;

		do {
			var key = t[i];
			i++;

			if (!isNaN(key)) {
				key = (+key) - 1;
			} else if (!key || !parse[key]) {
				var keys = Object.keys(parse);
				key = keys[Math.floor(Math.random() * keys.length)]
			}

			if (parse[key]) {
				parse = parse[key];

				if (isNaN(key)) {
					pathArray.push(key);
				}

			} else {
				break;
			}

			if (typeof parse == 'string') {
				break;
			}
		} while (true);

		var node = parse;

		if (key !== null) {

		}

		//pull tags including brackets
		var variables = node.match(/\{\{([ a-zA-Z0-9:.-_\*\&\?|]*)\}\}/g);

		for (var i in variables) {
			//pull current tag
			var tag = variables[i];

			//remove brackets
			var variable = tag.substr(2, tag.length - 4).trim();

			//get modifiers 
			//sperate modifiers
			var split = variable.split("|");
			var modifierArray = split.splice(1);
			var modifiers = {};

			//save tag modifers in a map to use later under modifers
			//save the tags pathMap so we can later try and 
			var pathMap = null;
			for (var mod in modifierArray) {
				var modifierComponents = modifierArray[mod].split(":");
				modifiers[modifierComponents[0]] = modifierComponents || false;
				if (modifierComponents[0] == "like") {
					if (private.pathMap[modifierComponents[1]] && private.pathMap[modifierComponents[1]][1]) {
						pathMap = private.pathMap[modifierComponents[1]][1];
					}
				}
			}

			variable = split[0].trim();
			//if we are storing the variable for later use
			//get storage varible name
			//sperate from replacement variable name 
			var parameters = variable.split(":");
			var name = parameters[1] || parameters[0];


			if (name && name.indexOf(".") != -1) {
				pathMap = name.split(".");
				name = pathMap.shift();
			}

			var next = private.getNode(name.trim(), pathMap);

			var nextnode = next.str;

			//get word modifiers atm it only supports turning on pluralization for defined lists 
			//store variable for later use
			if (parameters[1] && parameters[0]) {

				//check to see if the base key is already being used to store somthing else
				var list = private.userData[parameters[0]];
				if (!list) {
					if (pathArray != null) {
						//set base object for saving variable against its chosen path
						var make = private.userData[parameters[0]] = {};

						if (pathArray.length == 0) {
							make = private.userData[parameters[0]] = [];
						}

						for (var j = 0; j < pathArray.length; j++) {

							if (!make[pathArray[j]]) {
								if (j == pathArray.length - 1) {
									make[pathArray[j]] = [];
								} else {
									make[pathArray[j]] = {};
								}
							}

							make = make[pathArray[j]];
						}

						list = make;
					} else {
						list = private.userData[parameters[0]] = [];
					}
				}

				list.push(nextnode);
				var pathMap = private.pathMap[parameters[0]] = [parameters[1], next.pathMap];
			}

			for (var mods in modifiers) {
				if (public.formatters[mods]) {
					nextnode = public.formatters[mods](nextnode, modifiers[mods]);
				}
			}
			//replace relevant tags
			node = node.replace(tag, nextnode);
		}

		//{[q1::multiple?'were':'was']}
		var conditional = node.match(/\{\[([a-zA-Z0-9:.-_\*\&?|']*)\]\}/g);
		for (var k in conditional) {

			var statementTag = conditional[k];
			var statement = statementTag.substr(2, statementTag.length - 4).split("?");

			var sns = statement[0].split(":");
			var svs = statement[1].substr(1, statement[1].length - 2).split(/['"]\:['"]/);
			var replacement = svs[1];

			if (private.userData[sns[0]] && private.userData[sns[0]][0]) {
				var word = private.userData[sns[0]][0];
				if (private.variables[word] == sns[1]) {
					replacement = svs[0];
				}
			}

			node = node.replace(statementTag, replacement);
			node = private.getNode(node).str;


		}

		return {
			"str": node,
			"pathMap": pathArray
		};
	}


	public.build = function() {
		private.variables = {};
		private.data = json;
		return private.process();
	}
}

ParZen.formatters = {};

// ParZen.formatters.drunk = function(word, params){
//     return word.replace(/h\b/, "hed");
// }

// var json = {
//     "root" : [
//         "a {{v:miss}} {{things|p:v:dark}}"
//     ],
//     "miss" : { 
//         "dark" : [ "1dark1", "1dark2" ],
//         "light" : [ "1light1","1light2" ]
        
//     },
//     "number"    : [ "20", "40", "60", "80", "100" ],
//     "things"    : { "dark" :   ["2dark2", "aaa"],  "light": ["2light1","2light2"]},
//     "end"       : ["never {{action}}", "won't {{action}}", "did {{action}}"],
//     "action"    : ["plant", "write", "taste", "touch", "open", "{{miss}}"]   
// };

// var pz = new ParZen( json );
// var sentence = pz.build();
// console.log(sentence);
