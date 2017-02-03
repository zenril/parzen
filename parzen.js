

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

if(module && module.exports){
    module.exports = ParZen;
}


function ParZen(json) {
	var pub = this;
    var pvt = {};
	pvt.data = json;
	pvt.userData = {};
	pvt.variables = {};
	pub.formatters = {};
    pub.preformatters = {};
	pvt.pathMap = {};
	pvt.flags = {};

	pub.json = function(json) {
		pvt.data = json;
	}


	pub.getUserTemplateVariables = function() {
		return pvt.userData;
	}

	pvt.process = function() {
        pvt.userData["__finish__"] = [pvt.getNode("root").str];
		return pvt.getNode("__finish__").str;
	}

	pub.formatters.ucf = function(words, params) {
		return words.charAt(0).toUpperCase() + words.slice(1);
	}

	pub.formatters.uc = function(words, params) {
		return words.toUpperCase();
	}

	pub.formatters.ucr = function(words, params) {
		if (Math.random() > 0.7) {
			return words.toUpperCase();
		}
		return words;
	}

	pub.formatters.ucw = function(words, params) {
		return words.replace(/\w\S*/g, function(txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}

	pub.formatters.an = function(words, params) {
		return pvt.indefiniteArticle(words.split(" ")[0]) + " " + words;
	}
    
    pub.formatters.r = function(words, params) {
		return "asd"; 
	}

	pub.formatters.p = function(words, params) {

		var subpathMap = pvt.pathMap[params[1]][1].join(".");
		var tocheckwith = params[params.length - 1];

		if (subpathMap.indexOf(tocheckwith) != -1) {
			if (pvt.data["plurals"] && pvt.data["plurals"][words]) {
				words = pvt.data["plurals"][words];
			} else {
				words = pvt.plural(words);
			}
		}
		return words;
	}

	pub.formatters.m = function(words, params) {
		return pvt.plural(words);
	}

	/*

		Genterates a rounded random number between two numbers inclusive
		
		---
		#|rrand:5-100
		will generate a number between 5 and 100 
		then apply a rounding
		e.g.  74
		---
		#|rrand:100
		will generate a number between 0 and 100 as there is no start number
		then apply a rounding
		e.g.  30
		---

	*/
	pub.preformatters.rran = function(word, params){
		var range = params[1].split("-");
		var first = range[0] || range[1] || 100;
		var second = range[1] || 1;

		var min = Math.min(first,second);
		var max = Math.max(first,second);    

		return Math.round(Math.random()*(max-min+1)+min);
	}

	/*

		Genterates a random number between two numbers inclusive
		but does not round it

		---
		#|rand:5-100
		will generate a number between 5 and 100
		e.g.  74.1937563920
		---
		#|rand:100
		will generate a number between 0 and 100 as there is no start number
		e.g.  30.7836124262
		---

	*/
	pub.preformatters.ran = function(word, params){
		var range = params[1].split("-");
		var first = range[0] || range[1] || 100;
		var second = range[1] || 1;

		var min = Math.min(first,second);
		var max = Math.max(first,second);    

		return Math.random()*(max-min+1)+min;
	}


	/*

		will round a number DOWN to a decimal location

		---
		|rounddown:2
		will round a number DOWN to two decimal places
		e.g.  74.1937563920  -> 74.19 
		---
		|rounddown
		will just round a number down to zero decimals
		e.g.  30.7836124262  -> 30
		---

	*/
	pub.preformatters.rounddown = function(word, params){
		if(isNaN(word)) return word;
		if(params[1] && !isNaN(params[1])){
			var decimals  = + (1 + Array.apply(null, {length: (  + params[1] ) + 1}).join("0"));
			return Math.floor(((+word) + 0.00001) * decimals) / decimals;
		}
		return Math.floor(word);
	}


	/*

		will round a number UP to a decimal location

		---
		|roundup:2
		will round a number UP to two decimal places
		e.g.  74.1937563920  -> 74.2 
		---
		|roundup
		will just round a number down to zero decimals
		e.g.  30.7836124262  -> 31
		---

	*/
	pub.preformatters.roundup = function(word, params){
		if(isNaN(word)) return word;
		if(params[1] && !isNaN(params[1])){
			var decimals  = + (1 + Array.apply(null, {length: (  + params[1] ) + 1}).join("0"));
			return Math.ceil(((+word) + 0.00001) * decimals) / decimals;
		}
		return Math.ceil(word);
	}


	/*

		will round a number to a decimal location

		---
		|round:2
		will round a number to two decimal places
		e.g.  74.1937563920  -> 74.2 
		---
		|round
		will just round a number to zero decimals
		e.g.  30.7836124262  -> 31
		---

	*/
	pub.preformatters.round = function(word, params){
		if(isNaN(word)) return word;
		if(params[1] && !isNaN(params[1])){
			var decimals  = + (1 + Array.apply(null, {length: (  + params[1] ) + 1}).join("0"));
			return Math.round(((+word) + 0.00001) * decimals) / decimals;
		}
		return Math.round(word);
	}

	/*

		|op:*:6
		will run a boolean math operation
		times: *
		divide: /
		subtract: -
		power: ^
		add: +
		true/false: ==
		modular:%

		you can run the operation on manually entered number or on a number that has been randomly generated and stored
		lets say you have 

		{{n:#|rand:1-50}} and {{m:#|rand:1-4}}

		I'm am assigning random numbers to `n` and `m`. 
		lets say they are
		m = 4
		n = 4
		I could then go and call `|op:
		{{n|op:-:m}}
		which would number `m` from `n` resulting in 0

		I can also do
		{{n|op:-:3}}
		which would subtract 3 from n resuling in 1

	*/
	pub.preformatters.op = function(word, params, userData, data){
		
		if(isNaN(params[2])){
			var fromVar = data[params[2]];
			if (!fromVar) {
				fromVar = userData[params[2]];
			}
		}

		if(fromVar && fromVar.length) {
			params[2] = fromVar[0];
		}
		
		
		if(!isNaN(word) && params[2] && !isNaN(params[2]) && /[\+\*\-\%\^\=]/.test(params[1])){
			var equation = ( word + " " ) +  params[1] + " " + params[2];
			return eval(equation);
		}

		return word;
	}

	for (var formatFunction in ParZen.formatters) {
		pub.formatters[formatFunction] = ParZen.formatters[formatFunction];
	}

    for (var formatFunction in ParZen.preformatters) {
		pub.preformatters[formatFunction] = ParZen.preformatters[formatFunction];
	}

	pvt.indefiniteArticle = indefiniteArticle;
	pvt.plural = plural;

	pvt.getNode = function(name, pathMap) {

		var data = pvt.data[name];
		if (!data) {
			data = pvt.userData[name];
		}
		var key = null;

		if (!data) {
			return false;
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

        if( typeof node != "string" ){
			return false;
		}

		if ( key !== null ) {

		}

		//pull tags including brackets
		var variables = node.match(/\{\{([ a-zA-Z0-9:.\-_#\*\&\?|\#\+\*\-\%\^\=]*)\}\}/g);

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
					if (pvt.pathMap[modifierComponents[1]] && pvt.pathMap[modifierComponents[1]][1]) {
						pathMap = pvt.pathMap[modifierComponents[1]][1];
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

			var next = pvt.getNode(name.trim(), pathMap);

            if(next === false && name.trim() != "#" ){
                continue;
            }            

			var nextnode = next.str || "";

            for (var mods in modifiers) {
				if ( pub.preformatters[mods] ) {
					nextnode = pub.preformatters[mods](nextnode, modifiers[mods], pvt.userData, pvt.data);
				}
			}

			//get word modifiers atm it only supports turning on pluralization for defined lists 
			//store variable for later use
			if (parameters[1] && parameters[0]) {

				//check to see if the base key is already being used to store somthing else
				var list = pvt.userData[parameters[0]];
				//if (!list) {
                    
					if (pathArray != null && pathArray.length) {
                        
						//set base object for saving variable against its chosen path
						var make = pvt.userData[parameters[0]] = {};

						if (pathArray.length == 0) {
							make = pvt.userData[parameters[0]] = [];
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
                        

						list = pvt.userData[parameters[0]] = [];
					}
				//}

				list.push(nextnode + "");
				var pathMap = pvt.pathMap[parameters[0]] = [parameters[1], next.pathMap];
			}

            for (var mods in modifiers) {
				if ( pub.formatters[mods] ) {
					nextnode = pub.formatters[mods](nextnode, modifiers[mods], pvt.userData, pvt.data);
				}
			}

            
			//replace relevant tags
			node = node.replace(tag, nextnode);
		}

		//{[q1::multiple?'were':'was']}
		var conditional = node.match(/\{\[([a-zA-Z0-9:.\-_\*\&?|']*)\]\}/g);
		for (var k in conditional) {

			var statementTag = conditional[k];
			var statement = statementTag.substr(2, statementTag.length - 4).split("?");

			var sns = statement[0].split(":");
			var svs = statement[1].substr(1, statement[1].length - 2).split(/['"]\:['"]/);
			var replacement = svs[1];

			if (pvt.userData[sns[0]] && pvt.userData[sns[0]][0]) {
				var word = pvt.userData[sns[0]][0];
				if (pvt.variables[word] == sns[1]) {
					replacement = svs[0];
				}
			}

			node = node.replace(statementTag, replacement);
			node = pvt.getNode(node).str;
		}

		return {
			"str": node,
			"pathMap": pathArray
		};
	}


	pub.build = function() {
		pvt.variables = {};
		pvt.data = json;
		return pvt.process();
	}
}

ParZen.formatters = {};
ParZen.preformatters = {};





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
function indefiniteArticle(e){var n=/\w+/.exec(e);if(!n)return"an";var r=n[0],a=r.toLowerCase(),i=["honest","hour","hono"];for(var o in i)if(0==a.indexOf(i[o]))return"an";if(1==a.length)return"aedhilmnorsx".indexOf(a)>=0?"an":"a";if(r.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/))return"an";regexes=[/^e[uw]/,/^onc?e\b/,/^uni([^nmd]|mo)/,/^u[bcfhjkqrst][`aeiou]/];for(var o in regexes)if(a.match(regexes[o]))return"a";return r.match(/^U[NK][AIEO]/)?"a":r==r.toUpperCase()?"aedhilmnorsx".indexOf(a[0])>=0?"an":"a":"aeiou".indexOf(a[0])>=0?"an":a.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/)?"an":"a"};

//found here
//http://stackoverflow.com/questions/27194359/javascript-pluralize-a-string

function plural(e,s){
    var $={"(quiz)$":"$1zes","^(ox)$":"$1en","([m|l])ouse$":"$1ice","(matr|vert|ind)ix|ex$":"$1ices","(x|ch|ss|sh)$":"$1es","([^aeiouy]|qu)y$":"$1ies","(hive)$":"$1s","(?:([^f])fe|([lr])f)$":"$1$2ves","(shea|lea|loa|thie)f$":"$1ves",sis$:"ses","([ti])um$":"$1a","(tomat|potat|ech|her|vet)o$":"$1oes","(bu)s$":"$1ses","(alias)$":"$1es","(octop)us$":"$1i","(ax|test)is$":"$1es","(us)$":"$1es","([^s]+)$":"$1s"},i={"(quiz)zes$":"$1","(matr)ices$":"$1ix","(vert|ind)ices$":"$1ex","^(ox)en$":"$1","(alias)es$":"$1","(octop|vir)i$":"$1us","(cris|ax|test)es$":"$1is","(shoe)s$":"$1","(o)es$":"$1","(bus)es$":"$1","([m|l])ice$":"$1ouse","(x|ch|ss|sh)es$":"$1","(m)ovies$":"$1ovie","(s)eries$":"$1eries","([^aeiouy]|qu)ies$":"$1y","([lr])ves$":"$1f","(tive)s$":"$1","(hive)s$":"$1","(li|wi|kni)ves$":"$1fe","(shea|loa|lea|thie)ves$":"$1f","(^analy)ses$":"$1sis","((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$":"$1$2sis","([ti])a$":"$1um","(n)ews$":"$1ews","(h|bl)ouses$":"$1ouse","(corpse)s$":"$1","(us)es$":"$1",s$:""},o={move:"moves",foot:"feet",goose:"geese",sex:"sexes",child:"children",man:"men",tooth:"teeth",person:"people"},r=["sheep","fish","deer","series","species","money","rice","information","equipment"];if(r.indexOf(e.toLowerCase())>=0)return e;for(word in o){if(s)var a=new RegExp(o[word]+"$","i"),t=word;else var a=new RegExp(word+"$","i"),t=o[word];if(a.test(e))return e.replace(a,t)}if(s)var n=i;else var n=$;for(reg in n){var a=new RegExp(reg,"i");if(a.test(e))return e.replace(a,n[reg])}return e
}



//"The boy bought {{bottles:#|rran:2-10}} bottles of milk for ${{price:#|ran:4-6|rnd:2}} that costed a total of ${{total:bottles|op:*:price|rnd:2}}, however if had of bought {{bottles}} bottles of water for ${{wprice:#|ran:1-3|rnd:2}} each, he would have had spent ${{wtotal:bottles|op:*:wprice|rnd:2}} and saved ${{total|op:-:wtotal|rnd:2}} candy and tooth decay"
// var json = {
//     "root" : ["{{v:list|op:*:31}}"],
//     "list" : ["1","2","3","4","5"]
// };

// var pz = new ParZen( json );
// var sentence = pz.build();
// console.log(sentence);
