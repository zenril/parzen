

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
    var pvt = pub;
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

	function run() {
        pvt.userData["__finish__"] = [pvt.getNode("root").str];
		return pvt.getNode("__finish__").str;
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

        if( typeof node != "string" ) {
			return false;
		}

		if ( key !== null ) {

		}

		//pull tags including brackets
		var variables = node.match(/\{\{([ a-zA-Z0-9:.\-_#\*\&\?|\#\+\*\-\%\^\=\/]*)\}\}/g);

		for (var i in variables) {
			//pull current tag
			var tag = variables[i];

			//remove brackets
			var variable = tag.substr(2, tag.length - 4).trim();

			//get modifiers 
			//sperate modifiers
			var split = variable.split("|");
			var modifierArray = split.splice(1);
			var modifiers = [];

			//save tag modifers in a map to use later under modifers
			//save the tags pathMap so we can later try and 
			var pathMap = null;
			for (var mod in modifierArray) {
				
				var modifierComponents = modifierArray[mod].split(":");
				
				modifiers.push(modifierComponents || false);

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


            for (var f = 0; f < modifiers.length; f++) {
				var mod = modifiers[f][0];
				if ( pub.preformatters[mod] ) {
					func = pub.preformatters[mod];
					nextnode = func.apply(pub, [nextnode, modifiers[f]]);
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

            for (var f = 0; f < modifiers.length; f++) {
				var mod = modifiers[f][0];
				if ( pub.formatters[mod] ) {
					func = pub.formatters[pub.formatters[mod][0]];
					nextnode = func.apply(pub, [nextnode, modifiers[f]]);
				}
			}
            
			//replace relevant tags
			node = node.replace(tag, nextnode);
		}

		//{[q1::multiple?'were':'was']}
		var conditional = node.match(/\{\[([a-zA-Z0-9:.\-_\*\&?|'\/\{\}]*)\]\}/g);
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
		
		return run();
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

 function indefiniteArticle(phrase) {
        
    // Getting the first word 
    var match = /\w+/.exec(phrase);
    if (match)
        var word = match[0];
    else
        return "an";
    
    var l_word = word.toLowerCase();
    // Specific start of words that should be preceeded by 'an'
    var alt_cases = ["honest", "hour", "hono"];
    for (var i in alt_cases) {
        if (l_word.indexOf(alt_cases[i]) == 0)
            return "an";
    }
    
    // Single letter word which should be preceeded by 'an'
    if (l_word.length == 1) {
        if ("aedhilmnorsx".indexOf(l_word) >= 0)
            return "an";
        else
            return "a";
    }
    
    // Capital words which should likely be preceeded by 'an'
    if (word.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/)) {
        return "an";
    }
    
    // Special cases where a word that begins with a vowel should be preceeded by 'a'
    regexes = [/^e[uw]/, /^onc?e\b/, /^uni([^nmd]|mo)/, /^u[bcfhjkqrst][aeiou]/]
    for (var i in regexes) {
        if (l_word.match(regexes[i]))
            return "a"
    }
    
    // Special capital words (UK, UN)
    if (word.match(/^U[NK][AIEO]/)) {
        return "a";
    }
    else if (word == word.toUpperCase()) {
        if ("aedhilmnorsx".indexOf(l_word[0]) >= 0)
            return "an";
        else 
            return "a";
    }
    
    // Basic method of words that begin with a vowel being preceeded by 'an'
    if ("aeiou".indexOf(l_word[0]) >= 0)
        return "an";
    
    // Instances where y follwed by specific letters is preceeded by 'an'
    if (l_word.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/))
        return "an";
    
    return "a";
}
function plural(toModify,revert){

    var plural = {
        '(quiz)$'               : "$1zes",
        '^(ox)$'                : "$1en",
        '([m|l])ouse$'          : "$1ice",
        '(matr|vert|ind)ix|ex$' : "$1ices",
        '(x|ch|ss|sh)$'         : "$1es",
        '([^aeiouy]|qu)y$'      : "$1ies",
        '(hive)$'               : "$1s",
        '(?:([^f])fe|([lr])f)$' : "$1$2ves",
        '(shea|lea|loa|thie)f$' : "$1ves",
        'sis$'                  : "ses",
        '([ti])um$'             : "$1a",
        '(tomat|potat|ech|her|vet)o$': "$1oes",
        '(bu)s$'                : "$1ses",
        '(alias)$'              : "$1es",
        '(octop)us$'            : "$1i",
        '(ax|test)is$'          : "$1es",
        '(us)$'                 : "$1es",
        '([^s]+)$'              : "$1s"
    };

    var singular = {
        '(quiz)zes$'             : "$1",
        '(matr)ices$'            : "$1ix",
        '(vert|ind)ices$'        : "$1ex",
        '^(ox)en$'               : "$1",
        '(alias)es$'             : "$1",
        '(octop|vir)i$'          : "$1us",
        '(cris|ax|test)es$'      : "$1is",
        '(shoe)s$'               : "$1",
        '(o)es$'                 : "$1",
        '(bus)es$'               : "$1",
        '([m|l])ice$'            : "$1ouse",
        '(x|ch|ss|sh)es$'        : "$1",
        '(m)ovies$'              : "$1ovie",
        '(s)eries$'              : "$1eries",
        '([^aeiouy]|qu)ies$'     : "$1y",
        '([lr])ves$'             : "$1f",
        '(tive)s$'               : "$1",
        '(hive)s$'               : "$1",
        '(li|wi|kni)ves$'        : "$1fe",
        '(shea|loa|lea|thie)ves$': "$1f",
        '(^analy)ses$'           : "$1sis",
        '((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$': "$1$2sis",        
        '([ti])a$'               : "$1um",
        '(n)ews$'                : "$1ews",
        '(h|bl)ouses$'           : "$1ouse",
        '(corpse)s$'             : "$1",
        '(us)es$'                : "$1",
        's$'                     : ""
    };

    var irregular = {
        'move'   : 'moves',
        'foot'   : 'feet',
        'goose'  : 'geese',
        'sex'    : 'sexes',
        'child'  : 'children',
        'man'    : 'men',
        'tooth'  : 'teeth',
        'person' : 'people'
    };

    var uncountable = [
        'sheep', 
        'fish',
        'deer',
        'moose',
        'series',
        'species',
        'money',
        'rice',
        'information',
        'equipment'
    ];

    // save some time in the case that singular and plural are the same
    if(uncountable.indexOf(toModify.toLowerCase()) >= 0)
      return toModify;

    // check for irregular forms
    for(word in irregular){

      if(revert){
              var pattern = new RegExp(irregular[word]+'$', 'i');
              var replace = word;
      } else{ var pattern = new RegExp(word+'$', 'i');
              var replace = irregular[word];
      }
      if(pattern.test(toModify))
        return toModify.replace(pattern, replace);
    }

    if(revert) var array = singular;
         else  var array = plural;

    // check for matches using regular expressions
    for(reg in array){

      var pattern = new RegExp(reg, 'i');

      if(pattern.test(toModify))
        return toModify.replace(pattern, array[reg]);
    }

    return toModify;
}
/*!
 * Number-To-Words util
 * @version v1.2.3
 * @link https://github.com/marlun78/number-to-words
 * @author Martin Eneqvist (https://github.com/marlun78)
 * @contributors Aleksey Pilyugin (https://github.com/pilyugin),Jeremiah Hall (https://github.com/jeremiahrhall)
 * @license MIT
 */
var NtoW = (function () {

    var root = typeof self == 'object' && self.self === self && self ||
        typeof global == 'object' && global.global === global && global ||
        this;

    // ========== file: /src/isFinite.js ==========

// Simplified https://gist.github.com/marlun78/885eb0021e980c6ce0fb
function isFinite(value) {
    return !(typeof value !== 'number' || value !== value || value === Infinity || value === -Infinity);
}


// ========== file: /src/makeOrdinal.js ==========

var ENDS_WITH_DOUBLE_ZERO_PATTERN = /(hundred|thousand|(m|b|tr|quadr)illion)$/;
var ENDS_WITH_TEEN_PATTERN = /teen$/;
var ENDS_WITH_Y_PATTERN = /y$/;
var ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN = /(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)$/;
var ordinalLessThanThirteen = {
    zero: 'zeroth',
    one: 'first',
    two: 'second',
    three: 'third',
    four: 'fourth',
    five: 'fifth',
    six: 'sixth',
    seven: 'seventh',
    eight: 'eighth',
    nine: 'ninth',
    ten: 'tenth',
    eleven: 'eleventh',
    twelve: 'twelfth'
};

/**
 * Converts a number-word into an ordinal number-word.
 * @example makeOrdinal('one') => 'first'
 * @param {string} words
 * @returns {string}
 */
function makeOrdinal(words) {
    // Ends with *00 (100, 1000, etc.) or *teen (13, 14, 15, 16, 17, 18, 19)
    if (ENDS_WITH_DOUBLE_ZERO_PATTERN.test(words) || ENDS_WITH_TEEN_PATTERN.test(words)) {
        return words + 'th';
    }
    // Ends with *y (20, 30, 40, 50, 60, 70, 80, 90)
    else if (ENDS_WITH_Y_PATTERN.test(words)) {
        return words.replace(ENDS_WITH_Y_PATTERN, 'ieth');
    }
    // Ends with one through twelve
    else if (ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN.test(words)) {
        return words.replace(ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN, replaceWithOrdinalVariant);
    }
    return words;
}

function replaceWithOrdinalVariant(match, numberWord) {
    return ordinalLessThanThirteen[numberWord];
}


// ========== file: /src/toOrdinal.js ==========


/**
 * Converts an integer into a string with an ordinal postfix.
 * If number is decimal, the decimals will be removed.
 * @example toOrdinal(12) => '12th'
 * @param {number|string} number
 * @returns {string}
 */
function toOrdinal(number) {
    var num = parseInt(number, 10);
    if (!isFinite(num)) throw new TypeError('Not a finite number: ' + number + ' (' + typeof number + ')');
    var str = String(num);
    var lastTwoDigits = num % 100;
    var betweenElevenAndThirteen = lastTwoDigits >= 11 && lastTwoDigits <= 13;
    var lastChar = str.charAt(str.length - 1);
    return str + (betweenElevenAndThirteen ? 'th'
            : lastChar === '1' ? 'st'
            : lastChar === '2' ? 'nd'
            : lastChar === '3' ? 'rd'
            : 'th');
}


// ========== file: /src/toWords.js ==========


var TEN = 10;
var ONE_HUNDRED = 100;
var ONE_THOUSAND = 1000;
var ONE_MILLION = 1000000;
var ONE_BILLION = 1000000000;           //         1.000.000.000 (9)
var ONE_TRILLION = 1000000000000;       //     1.000.000.000.000 (12)
var ONE_QUADRILLION = 1000000000000000; // 1.000.000.000.000.000 (15)
var MAX = 9007199254740992;             // 9.007.199.254.740.992 (15)

var LESS_THAN_TWENTY = [
    'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
];

var TENTHS_LESS_THAN_HUNDRED = [
    'zero', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
];

/**
 * Converts an integer into words.
 * If number is decimal, the decimals will be removed.
 * @example toWords(12) => 'twelve'
 * @param {number|string} number
 * @param {boolean} [asOrdinal] - Deprecated, use toWordsOrdinal() instead!
 * @returns {string}
 */
function toWords(number, asOrdinal) {
    var words;
    var num = parseInt(number, 10);
    if (!isFinite(num)) throw new TypeError('Not a finite number: ' + number + ' (' + typeof number + ')');
    words = generateWords(num);
    return asOrdinal ? makeOrdinal(words) : words;
}

function generateWords(number) {
    var remainder, word,
        words = arguments[1];

    // We’re done
    if (number === 0) {
        return !words ? 'zero' : words.join(' ').replace(/,$/, '');
    }
    // First run
    if (!words) {
        words = [];
    }
    // If negative, prepend “minus”
    if (number < 0) {
        words.push('minus');
        number = Math.abs(number);
    }

    if (number < 20) {
        remainder = 0;
        word = LESS_THAN_TWENTY[number];

    } else if (number < ONE_HUNDRED) {
        remainder = number % TEN;
        word = TENTHS_LESS_THAN_HUNDRED[Math.floor(number / TEN)];
        // In case of remainder, we need to handle it here to be able to add the “-”
        if (remainder) {
            word += '-' + LESS_THAN_TWENTY[remainder];
            remainder = 0;
        }

    } else if (number < ONE_THOUSAND) {
        remainder = number % ONE_HUNDRED;
        word = generateWords(Math.floor(number / ONE_HUNDRED)) + ' hundred';

    } else if (number < ONE_MILLION) {
        remainder = number % ONE_THOUSAND;
        word = generateWords(Math.floor(number / ONE_THOUSAND)) + ' thousand,';

    } else if (number < ONE_BILLION) {
        remainder = number % ONE_MILLION;
        word = generateWords(Math.floor(number / ONE_MILLION)) + ' million,';

    } else if (number < ONE_TRILLION) {
        remainder = number % ONE_BILLION;
        word = generateWords(Math.floor(number / ONE_BILLION)) + ' billion,';

    } else if (number < ONE_QUADRILLION) {
        remainder = number % ONE_TRILLION;
        word = generateWords(Math.floor(number / ONE_TRILLION)) + ' trillion,';

    } else if (number <= MAX) {
        remainder = number % ONE_QUADRILLION;
        word = generateWords(Math.floor(number / ONE_QUADRILLION)) +
        ' quadrillion,';
    }

    words.push(word);
    return generateWords(remainder, words);
}


// ========== file: /src/toWordsOrdinal.js ==========


/**
 * Converts a number into ordinal words.
 * @example toWordsOrdinal(12) => 'twelfth'
 * @param {number|string} number
 * @returns {string}
 */
function toWordsOrdinal(number) {
    var words = toWords(number);
    return makeOrdinal(words);
}



    return {
        toOrdinal: toOrdinal,
        toWords: toWords,
        toWordsOrdinal: toWordsOrdinal
    };

}());
var WtoN = {
    units: {
        'zero': 0,
        'one': 1,
        'two': 2,
        'three': 3,
        'four': 4,
        'five': 5,
        'six': 6,
        'seven': 7,
        'eight': 8,
        'nine': 9,
        'ten': 10,
        'eleven': 11,
        'twelve': 12,
        'thirteen': 13,
        'fourteen': 14,
        'fifteen': 15,
        'sixteen': 16,
        'seventeen': 17,
        'eighteen': 18,
        'nineteen': 19,
        'twenty': 20,
        'thirty': 30,
        'forty': 40,
        'fifty': 50,
        'sixty': 60,
        'seventy': 70,
        'eighty': 80,
        'ninety': 90,
    },

    magnitudes: {
        'hundred' : 100,
        'thousand': 1000,
        'million': 1000000,
        'billion': 1000000000,
        'trillion': 1000000000000
    },

    convert: function (words) {
        return this.compute(this.tokenize(words));
    },

    prepare : function(words){
        var unitskeys = Object.keys(this.units);
        var magnitudeskeys = Object.keys(this.magnitudes);
        var regexstr = "[0-9]+|" + unitskeys.join("|") + "|" + magnitudeskeys.join("|") + "|and|[ ]+";

        words = words.replace(new RegExp("(" + regexstr + ")", "g"), " $1");
        words = words.replace(new RegExp("(" + regexstr + "|ty|teen)" + "|[^]", "g"), "$1");
        return words;
    },

    tokenize: function (words) {
        words = this.prepare(words); 
        var array = words.split(' ');
        var result = [];
        array.forEach(function (string) {
            if ( ! isNaN(+string)) {
                result.push(+string);
            } else if (string == 'and') {

            } else {
                result.push(string);
            }
        });
        return result;
    },

    compute: function (tokens) {
        var result;
        var ins = this;
        var temp = 0;
        var sum = 0;
        result = tokens.forEach(function (token) {
            if (ins.units[token] != null) {
                sum += ins.units[token];
            } else if (token == 'hundred') {
                sum *= 100;
            } else if (! isNaN(token)) {
                sum += token;
            } else {
                mag = ins.magnitudes[token];
                temp += sum * mag;
                sum = 0;
            }
        });
        return temp + sum;
    }
};
if(ParZen){


    //preformatters will format the words before any assignment to variables. so the random function or boolean operations probably want to be saveved for later.
    //formatters will transform the words after the  assignment to variables. so capital letters or infinote articles (a vs an) we dont want the saved they will be a case by case modifer;


    ParZen.formatters.ucf = function(words, params) {
        return words.charAt(0).toUpperCase() + words.slice(1);
    }

    ParZen.formatters.uc = function(words, params) {
        return words.toUpperCase();
    }

    ParZen.formatters.ucr = function(words, params) {
        if (Math.random() > 0.7) {
            return words.toUpperCase();
        }
        return words;
    }

    ParZen.formatters.ucw = function(words, params) {
        return words.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    if(indefiniteArticle){
        ParZen.formatters.an = function(words, params) {
            return indefiniteArticle(words.split(" ")[0]) + " " + words;
        }
    }

    if(plural){
        ParZen.formatters.p = function(words, params) {

            var subpathMap = this.pathMap[params[1]][1].join(".");
            var tocheckwith = params[params.length - 1];

            if (subpathMap.indexOf(tocheckwith) != -1) {
                if (this.data["plurals"] && this.data["plurals"][words]) {
                    words = this.data["plurals"][words];
                } else {
                    words = plural(words);
                }
            }
            return words;
        }
    

        ParZen.formatters.m = function(words, params) {
                return plural(words);
        }
    }

    ParZen.formatters.hide = function(words, params) {
        return "";
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
    ParZen.preformatters.random = function(word, params){

        
        var range = params[1].split("-");
        var first = range[0] || range[1] || 100;
        var second = range[1] || 1;

        var min = Math.min(first,second);
        var max = Math.max(first,second);

        var number = Math.random()*(max-min+1)+min;

        if(params[2] && !isNaN(params[2])){
            var decimals  = + (1 + Array.apply(null, {length: (  + params[2] ) + 1}).join("0"));
            var scaler = + ("0." + Array.apply(null, Array(+params[2])).map(function(a,i){ return (i == (+params[2]) - 1) ? "1" : "0";}).join(''));
            return Math.round(((+number) + scaler) * decimals) / decimals;
        }

        return  number;
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
    ParZen.preformatters.randomfill = function(word, params){
        function randomReplace(a,b,c){
            var min = 0;
            var max = 9;
            return Math.floor(Math.random()*(max-min+1)+min);
        }

        if( word == "" && params[1] && params[1].length ){
        
            word = params[1].replace(/%d/g, randomReplace);
        
        } else if(word && word != "#" && word.length > 1 ){

            word = word.replace(/%d/g, randomReplace);
        
        }

        return word;
    }

    // /*

    // 	Genterates a random number between two numbers inclusive
    // 	but does not round it

    // 	---
    // 	#|rand:5-100
    // 	will generate a number between 5 and 100
    // 	e.g.  74.1937563920
    // 	---
    // 	#|rand:100
    // 	will generate a number between 0 and 100 as there is no start number
    // 	e.g.  30.7836124262
    // 	---

    // */
    // ParZen.preformatters.random = function(word, params){
    // 	var range = params[1].split("-");
    // 	var first = range[0] || range[1] || 100;
    // 	var second = range[1] || 1;

    // 	var min = Math.min(first,second);
    // 	var max = Math.max(first,second);    

    // 	return Math.random()*(max-min+1)+min;
    // }


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
    ParZen.preformatters.rounddown = function(word, params){
        if(isNaN(word)) return word;
        if(params[1] && !isNaN(params[1])){
            var decimals  = + (1 + Array.apply(null, {length: (  + params[1] ) + 1}).join("0"));
            var scaler = + ("0." + Array.apply(null, Array(+params[1])).map(function(a,i){ return (i == (+params[1]) - 1) ? "1" : "0";}).join(''));
            return Math.floor(((+word) + scaler) * decimals) / decimals;
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
    ParZen.preformatters.roundup = function(word, params){
        if(isNaN(word)) return word;
        if(params[1] && !isNaN(params[1])){
            var decimals  = + (1 + Array.apply(null, {length: (  + params[1] ) + 1}).join("0"));
            var scaler = + ("0." + Array.apply(null, Array(+params[1])).map(function(a,i){ return (i == (+params[1]) - 1) ? "1" : "0";}).join(''));
            return Math.ceil(((+word) + scaler) * decimals) / decimals;
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
    ParZen.preformatters.round = function(word, params){
        if(isNaN(word)) return word;
        if(params[1] && !isNaN(params[1])){
            var decimals  = + (1 + Array.apply(null, {length: (  + params[1] ) + 1}).join("0"));
            var scaler = + ("0." + Array.apply(null, Array(+params[1])).map(function(a,i){ return (i == (+params[1]) - 1) ? "1" : "0";}).join(''));
            return Math.round(((+word) + scaler) * decimals) / decimals;
        }
        return Math.round(word);
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
    if(NtoW){
        ParZen.preformatters.asWords = function(word, params){
            if(isNaN(word)) return word;
            return NtoW.toWords(word);
        }

        ParZen.preformatters.asOrdinal = function(word, params){
            if(isNaN(word)) return word;
            return NtoW.toOrdinal(word);
        }
    }


    if(WtoN){
        ParZen.preformatters.asNumber = function(word, params){
            var converted = WtoN.convert(word);
            if(!isNaN(converted)){
                words = converted;
            }
            return words;
        }
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
    ParZen.preformatters.op = function(word, params){
        
        if(isNaN(params[2])){
            var fromVar = this.data[params[2]];
            if (!fromVar) {
                fromVar = this.userData[params[2]];
            }
        }

        if(fromVar && fromVar.length) {
            params[2] = fromVar[0];
        }
        
        if(!isNaN(word) && params[2] && !isNaN(params[2]) && /[\+\*\-\%\^\=\/]/.test( params[1] )){
            var equation = ( word + " " ) +  params[1] + " " + params[2];
            return eval(equation);
        }

        return word;
    }


    ParZen.preformatters.gen = function(word, params){

        var words = "aah aahed aahs aargh aas abaci aback abamp abase abash abate abbey abbot abet abets abhor abide able abler ablur ably abmho abode abohm abort about above abs abuse abut abuts abuzz abysm abyss ace aced acers aces ache ached acher aches achoo acid acids acing acme acne acned acnes acorn acre acres acrid act acted acter actin actor acts acute acyls adage adapt add added adder addle adds adept adfix adhoc adieu adios adlib adman admit admix ado adobe adopt adore adorn ads adult adz adze adzes aeons aerie afar affix afire aflow afoot afoul afro afros aft after again agape agar agars agast agate agaty agave age aged agent ages agile aging aglow ago agog agony agora agree agrin ague agues aha ahas ahead ahem ahoy aid aide aided aider aides aids ail ailed ails aim aimed aimer aims air aired airer airs airy ais aisle aitch ajar akin alarm alas alb albs album alder ale alef aleph alert ales alga algae algal alias alibi alien align alike alive alkyl all allay alley allot allow alloy ally allyl alms aloe aloes aloft aloha alone along aloof aloud alpha alps also altar alter alto altos alum alums amass amaze amber ambit amble ambo ambos ambry ameba ameer amen amend amens ament amid amide amigo amine amino amiss amity amok among amour amp ample amply amps amuck amuse anal and ands anew angel anger angle angry angst anime anion anise ankle annal annex annoy annul anode anon ant ante antic antra ants antsy anus anvil any aorta apart ape aped aper apes apex aphid aping apish apnea app appel apple apply apps april apron apt apter aptly aqua aquas arbor arc arced arch arcs ardor are area areal areas arena ares argon argue aria arias arid aril arils arise ark arks arm armed armer armet armor arms army aroma arose array arrow ars arson art arts artsy arty ascus ash ashed ashen asher ashes ashs ashy aside ask asked askew asks asp aspen asper aspic asps ass assay asses asset aster astir async ate atlas atoll atom atoms atone atony atop atopy atria attic audio audit auger aught augur aulos aunt aunts aunty aura aural auras auric auto autos auxin avail aver avert avian avid avium avoid avow avows await awake award aware awash away aways awe awed awes awful awing awl awls awn awned awns awny awoke awol awols awry axe axed axel axels axes axial axing axiom axion axis axite axle axled axles axman axmen axon axons aye ayes ayin ays azide azure baa baaed baas babe babes baby back backs bacon bad bade badge badly bag bagel baggy bags baht bahts bail bails bairn bait baits bake baked baker bakes bald balds bale baled baler bales balk balks balky ball balls balm balms balmy balsa bam ban banal band bands bandy bane baned banes bang bangs banjo bank banks bans bar barb barbs bard bards bare bared barer bares barf barfs barge bark barks barm barms barmy barn barns barny baron bars basal base based baser bases bash basic basil basin basis bask basks bass baste bat batch bated bates bath bathe baths batik baton bats batty baud bauds baulk bawd bawds bawdy bawl bawls bay bayed bayou bays beach bead beads beady beak beaks beam beams bean beans bear beard bears beast beat beats beau beaus bebop becks bed bedew bedim beds bee beech beef beefs beefy been beep beeps beer beers beery bees beet beets befit beg began beget begin begot begs begun beige beigy being belay belch belie bell belle bells belly below belt belts bench bend bends bendy bent beret berk berks berm berms berry berth beryl beset besot best bests bet beta betas betel beth bets bevel bevy bewig bias bib bible bibs bid biddy bide bided bides bidet bids big bigot bike biker bikes bile bilge bilgy bilk bilks bill bills bin bind binds binge bingo bins biogs biome bios biota biped bipod birch bird birds birr birrs birth bison bit bite biter bites bits bitsy bitt bitts bitty blab blabs black blade blah blahs blame bland blank blare blast blat blats blaze bleak blear bleat bleb blebs bled bleed bleep blend bless blest blew blimp blind bling blink blip blips bliss blitz bloat blob blobs block blocs blog blogs bloke blond blood bloom blot blots blow blown blows blowy blue blued bluer blues bluet bluff blunt blur blurb blurs blurt blush boa boar board boars boas boast boat boats bob bobby bobs bocal bode boded bodes body bodys boffo bog bogey boggy bogie bogs bogus boil boils bold boll bolls bolt bolts bolus bomb bombs bond bonds bone boned bones boney bongo bongs bonk bonks bonny bonus bony boo booby booed book books boom booms boomy boon boons boor boors boos boose boost boot booth boots booze boozy bop bops borax bore bored borer bores boric born borne boron bosom boson boss bossy botch both bots bough bound bouse bousy bout bouts bow bowed bowel bower bowl bowls bows box boxed boxen boxer boxes boxy boy boys bra brace brad brads brady brag brags braid brain brake bran brand bras brash brass brat brats brave bravo brawl brawn bray brays braze bread break bream bred breed breve brew brews briar bribe brick bride brie brief brier brill brim brims brine bring brink briny bris brisk brith broad broil broke bronc bronx brood brook broom broth brow brown brows bruit brunt brush brute bubo buck bucks bud buddy budge buds buff buffs bug buggy bugle bugs buhl buhls buhr buhrs build built bulb bulbs bulge bulgy bulk bulks bulky bull bulla bulls bully bum bump bumps bumpy bums bun bunch bungs bunk bunks bunny buns bunt bunts buoy buoys burgh burka burl burls burly burn burns burnt burp burps burqa burr burro burrs burs bursa burst bury bus bused buses bush bushy busk busks bust busts busy but buts butt butte butts butty butyl buxom buy buyer buys buzz bye byes bylaw byte bytes byway cab cabal cabby cabin cable cabs cacao cache cacti cad caddy cadet cadge cadre cads caeca cafe cafes cage caged cages cairn cake caked cakes cakey calf calfs call calla calls calm calms calve calx calyx cam came camel cameo camp camps cams can canal candy cane caned caner canes canna canny canoe canon cans canst cant canto cants cap cape caped caper capes caps car carat carbs card cards care cared carer cares caret cargo carny carob carol carp carpi carps carry cars cart carts carve case cased cases cash cask casks cast caste casts cat catch cater cats catty caulk cause cave caved caver caves caw cawed caws cay cease ceca cecal cecum cedar cede ceded ceder cedes cedi cedis cee cees cell cello cells celt cent cents certs chad chafe chaff chain chair chalk champ chant chaos chap chaps chapt char chara chard charm chars chart chary chase chasm chat chats cheap cheat check cheek cheep cheer chef chefs chert chess chest chevy chew chews chewy chi chic chick chide chief child chili chill chime chimp chin china chins chip chips chirp chis chiv chive chivs chock choir choke chomp chop chops chord chore chose choux chow chows chub chubs chuck chuff chug chugs chum chump chums chunk churl churn chute chyle chyme cider cigar cilia cinch circa cirri cis cite cited cites city civet civic civil clack clad clade claim clamp clams clan clang clank clans clap claps clash clasp class clast clave claw claws clay clays clean clear cleat clef clefs cleft clerk click cliff climb clime cling clink clip clips cloak clock clod clods clog clogs clomp clone clonk clop clops close clot cloth clots cloud clout clove clown club clubs cluck clue clued clues clump clung clunk cluse cnida coach coaid coal coals coaly coast coat coati coats coax cob cobra cobs cocci cock cocks cocky cocoa cocos cod coda code codec coded coder codes codex codon cods coed coeds cog cogs coho coif coifs coil coils coin coins coked cokes cola colas cold colds cole colic colon color colt colts coma comae comas comb combo combs come comer comes comet comfy comic comma con conch condo cone coned cones conic conk conks cons coo cooba cooed cook cooks cool cools coop coops coos coot coots coown cop copay cope coped coper copes copra cops copse copy coral cord cords core cored corer cores corgi cork corks corm corms corn corns cornu corny corps cost costs cosy cot cots couch cough could count coup coupe coups court cove coved coven cover coves covet cow cower cowl cowls cows coy coyer coyly coys cozy crab crabs crack craft crag crags crake cram cramp crams crane crank crap crape craps crash crass crate crave crawl crays craze crazy creak cream credo creed creek creep crepe crept cress crest crew crews crib cribs crick cried crier cries crime crimp crisp croak crock croft crone crony crook croon crop crops cross croup crow crowd crown crows crud crude cruds cruel cruet crumb crura crush crust crux crwth cry crypt cub cubby cube cubed cuber cubes cubic cubit cubs cud cuddy cuds cue cued cues cuff cuffs cuing cull culls cult cults cumin cup cupid cups cur curb curbs curby curd curds curdy cure cured curer cures curio curl curls curly curry curs curse curst curt curve curvy cushy cusp cusps cuss cut cute cuter cutey cutie cutin cutis cuts cutty cutup cwm cwms cwtch cyan cyans cyber cycle cynic cyst cysts czar czars dab dabs dad daddy dado dados dads daffy daft daily dairy daisy dalet dally dam dame damed dames damn damns damp damps dams dance dandy dank dare dared darer dares dark darks darn darns dart darts dash data date dated dater dates datum daub daube daubs daunt davit daw dawn dawns day days daze dazed dazes dead deads deaf deal deals dealt dean deans dear dears deary deash death deave debar debit debt debts debud debug debut decaf decal decay deck decks decor decoy decry dee deed deeds deem deems deep deeps deer deers dees defat defer defog deft defy degas degum degut deice deify deign deil deils deink deism deist deity delay dele deled deles delf delfs delft deli dell dells delta delve deme demes demit demo demob demon demos demur demy den denar dene denes denim dens dense dent dents denty deny deoxy depot depth deray derby dere derm derma derms derry desex desk desks deter detox deuce deva devas devel devil devon dew dewan dewax dewey dews dewy dey deys dhole dhoti dhow dhows dial dials diary dibs dice diced dicer dices dicey dicot did diddy didst die died dies diet diets dig digit digs diked dikes dill dills dilly dim dime dimer dimes dimly dims din dinar dine dined diner dines ding dingo dings dingy dinky dins diode dione dip dippy dips dire direr dirge dirt dirts dirty disc disco discs dish disk disks ditch ditsy ditto ditty ditz ditzy diva divas dive dived diver dives divot divvy dizzy dobra dock docks dodge dodgy dodo dodos doe doer doers does doest doff dog doge doges doggy dogma dogs doily doing dole doled doles doll dolls dolly dolt dolts dome domed domes don done dongs donor dons donut doom dooms door doors dope doped doper dopes dopey dork dorks dorky dorm dorms dos dose dosed doses dot dote doted doter dotes doth dots dotty doty doubt dough douse dove doves dovey dowds dowdy dowed dowel dower dowly down downs downy dowry dowse doze dozed dozen dozer dozes dozy drab drabs draft drag drags drain drake dram drama drams drank drape draw drawl drawn draws dread dream drear dreg dregs dress drew dried drier dries drift drill drink drip drips drive droid droit droll drone drool droop drop drops dross drove drown drug drugs druid drum drums drunk drury dry dryad dryer dryly dual duals dub dubs duck ducks ducky duct ducts dud dude dudes duds due duel duels dues duet duets duff dug duke dukes dull dulls dully duly dumb dumbs dummy dump dumps dumpy dunce dune dunes dung dungs dungy dunk dunks duo duos dupe duped duper dupes dural dusk dusky dust dusts dusty duty duvet dwarf dweeb dwell dwelt dye dyed dyer dyers dyes dying dyked dyne dynes each eager eagle ear eared earl earls early earn earns ears earth ease eased easel easer eases east easy eat eaten eater eats eave eaves ebb ebbed ebbs ebola ebony echo echos ecru ecrus eddy edema edge edged edger edges edgy edict edify edit edits eek eeks eel eeler eels eely eerie eery eff effs efs egg eggar egged egger eggs eggy ego egos egret eider eight eject eke eked eker ekes eking eland elate elbow elder elect elegy elf elfin elide elite elk elks ell ellis ells elm elms elope els else elude elute elven elves email embed ember emcee emery emir emirs emit emits emmys emoji emote empty ems emu emus enact end ended endow ends enema enemy enjoy enol enrol ens ensue enter entry envoy envy eon eons eosin epic epics epoch epoxy equal equip era eras erase erect erg ergo ergs erode eros err erred error erupt esker ess essay ester eta etas etch ether ethic ethos ethyl euro euros evade eve even evens event ever evert every eves evict evil evils evite evoke ewe ewer ewers ewes exact exalt exam exams excel execs exert exes exile exist exit exits exon exons expat expel expo expos extol extra exude exult eye eyed eyes eying fable face faced faces facet facie fact facts fad faddy fade faded fades fads fail fails fain fains faint fair fairs fairy faith fake faked faker fakes fall falls false fame famed fan fancy fang fangs fans far farad farce fare fared fares farm farms fast fasts fat fatal fate fated fates fatly fats fatty fatwa fault faun fauna fauns faux fave favor fawn fawns fax faxed faxes faze fazed fazes fear fears feast feat feats fecal feces fed feds fedup fee feed feeds feel feels fees feet feign feint fell fella fells felon felt felts felty femme femur fen fence fend fends fens feral fern ferns ferny ferry feta fetal fetch fetid fetus feud feuds fever few fewer fib fiber fibre fibs fiche fiefs field fiend fiery fifth fifty fig fight figs filch file filed filer files filet fill fills filly film films filmy filth fin final finch find finds fine fined finer fines finis fink finny fins fir fire fired firer fires firm firms firs first fish fishy fist fists fit fitly fits five fiver fives fix fixed fixer fixes fizz fizzy fjord flab flabs flack flag flags flail flair flake flaky flame flan flank flans flap flaps flare flash flask flat flats flaw flaws flax flaxs flaxy flay flays flea fleas fleck fled flee flees fleet flesh flew flex flick flier flies fling flint flip flips flirt flit flits float flock floe floes flog flogs flood floor flop flops flora flory floss flour flout flow flown flows flox flu flub flubs flue flues fluff fluid fluke fluky flume flump flung flunk flush flute flux fly flyby flyer foal foals foam foams foamy fobs focal foci focus foe foes fog fogas fogey foggy fogs fogy foil foils fold folds folic folio folk folks folly fond fonds font fonts food foods fool fools foot footy fop foppy fops for fora foray force fore forge forgo fork forks form forms fort forte forth forts forty forum fossa foul fouls found four fours fovea fowl fox foxed foxer foxes foxy foyer frail frame franc frank fraud fray frays freak free freed freer frees freon fresh fret frets friar fried frier fries frill frisk friz frizz fro frock frog frogs from frond front frore frorn frory frosh frost froth frown froze fruit frump fry fryer fudge fudgy fuel fuels fugue full fully fume fumed fumer fumes fumy fun fund funds fungi funk funks funky funny fur furor furry furs fury fuse fused fuses fuss fussy futon fuzz fuzzy gab gabby gable gabs gad gaff gaffe gaffs gag gaga gage gaged gager gages gags gaily gain gains gait gaits gal gala gale gales gall galls gals gam game gamed gamer games gamey gamma gamut ganef ganev gang gangs ganof gap gape gaped gapes gappy gaps garb garbs gas gases gash gasp gasps gassy gate gated gates gator gauds gaudy gauge gaunt gauss gauze gauzy gave gavel gawk gawks gawky gay gayer gayly gaze gazed gazer gazes gear gears gecko gee geek geeks geeky gees geese gel geld gell gels gem gems gene genes genie genoa genre gent gents genus geode geoid germ germs germy get gets getup ghost ghoul giant giddy gift gifts gig gigas gigs gild gilds gill gills gilt gimel gimp gimps gin gins gird girds girl girly girn girns girth gist give given giver gives glad glade gland glare glass glaze gleam glean glee gleek glees gleet glen glia glial glib glide glint glitz gloam gloat glob globe globs gloom glory gloss glove glow glows gloze glue glued gluer glues gluey glug glugs glum gluon glut gluts glyph gnar gnarl gnarr gnars gnash gnat gnats gnaw gnaws gnome gnu gnus goad goads goal goals goat goats gob gobby gobs god godly gods goer goers goes gofer going goji gojis gold golds golf golfs golgi golly gonad gone goner gong gongs gonif gonna gonof goo good goods goody gooey goof goofs goofy goon goons goop goops goopy goos goose goosy gore gored gores gorge gory gos gosh got goth goths gotta gouda gouge gourd gout gouts gouty gown gowns grab grabs grace grade grads graff graft grail grain gram grams grand grant grape graph grasp grass grate grave gravy gray grays graze great greed greek green greet grew grey greys grid grids grief grill grim grime grimy grin grind grins griot grip gripe grips grist grit grits groan groin groom grope gross group grout grove grow growl grown grows grub grubs gruel gruff grump grunt guano guard guava guck gucks gucky guess guest guff guide guild guile guilt guise gulag gulch gulf gulfs gull gulls gully gulp gulps gum gumbo gummy gums gunk gunks gunky gunny guns guppy gurns guru gurus gush gushy gussy gust gusto gusts gusty gut guts gutsy gutty guy guyed guys gym gyms gyps gypsy gyre gyres gyro gyros gyrus habit hack hacks had hades hadst hag hags haiku hail hails hair hairs hairy half hall halls halo halos halt halts halva halve ham hams hand hands handy hang hangs hap happy haps hard hards hardy hare hared harem hares hark harks harm harms harp harps harsh has hash hasp hasps haste hasty hat hatch hate hated hater hates hath hats haul hauls haunt have haven haves havoc haw hawed hawk hawks haws hawse hay hayed hayer hays haze hazed hazel hazer hazes hazy head heads heady heal heals heap heaps hear heard hears heart heat heath heats heave heavy heck hedge heed heeds heel heels hefts hefty heir heirs heist held helix hell hello hells helm helms help helps hem heme hems hen hence henna henry hens her herb herbs herd herds here heres hero heron heros hers hertz hes het hetch heth hew hewed hewer hewn hews hex hexed hexes hey hick hicks hid hide hider hides high highs hijab hike hiked hiker hikes hilar hill hills hilly hilt hilts hilum him hind hinds hinge hinny hint hints hip hippo hippy hips hire hired hirer hires his hiss hissy hit hitch hits hive hived hiver hives hoar hoard hoary hoax hobby hobo hobos hocks hoe hoed hoer hoes hog hogs hoist hold holds hole holed holes holey holly holy home homed homer homes hone honed honer hones honey honk honks honor hood hoods hooey hoof hoofs hook hooks hooky hoop hoops hoot hoots hoove hop hope hoped hopes hops horde horn horns horny horse hose hosed hoser hoses host hosta hosts hot hotel hotly hots hound hour hours house hovel hoven hover how howdy howl howls hows howto hub hubby hubs hue hued hues huff huffs huffy hug huge huger huggy hugs huh huhs hula hulas hulk hulks hulky hull hulls hum human humic humid humor hump humps humpy hums humus hunch hung hunk hunks hunky hunt hunts hurl hurls hurry hurt hurts hush husk husks husky hut hutch huts hydra hydro hyena hymen hymn hymns hype hyped hyper hypes hypha hypo hypos hyrax ibex ibis ice iced icer icers ices icier icily icing ick icky icon icons icy ide idea ideal ideas ides idiom idiot idle idled idler idles idly idol idols ids idyll iffy ifs igloo ilea ileac ileal ileum ileus iliac ilium ilk ilka ilks ill ills image imago imam imams imbed imp imped impel imply imps inane inbox inch incur index inept inert infer infix ingot ink inked inks inky inlaw inlay inlet inn inner inns input ins inset inter into ion ionic ions iota iotas irate ire ired ires iring iris irk irked irks iron irons irony isle isles islet ism isms issue itch itchy item items its ivied ivies ivory ivy jab jabs jack jacks jade jaded jades jag jags jail jails jali jalis jam jamb jambs james jammy jams jar jars jaunt java jaw jawed jaws jay jays jazz jazzy jean jeans jeep jeeps jeer jeers jeli jelis jell jello jells jelly jerk jerks jerky jest jests jet jets jetty jewel jib jibe jiffy jig jigs jihad jilt jilts jimmy jingo jink jinks jinx jive jived jiver jives jivey job jobs jock jocks jog jogs johns join joins joint joist joke joked joker jokes jolly jolt jolts josh jot jots joule joust jowl jowls jowly joy joyed joys judge judo jug jugs juice juicy juke juked jukes julep july julys jumbo jump jumps jumpy june junes junk junks junta juror jury just jut jute jutes juts kabab kabal kabob kaf kale kales kaph kappa karat karma karst katal kay kayak kays kazoo kea kebab keek keeks keel keels keen keens keep keeps keg kegs kelp kept kern kerns key keyed keys khaki kick kicks kicky kiddo kids kill kills kiln kilns kilos kilt kilts kin kina kinas kind kinds kine king kings kink kinks kinky kiosk kip kips kiss kissy kit kite kited kites kits kitty kiwi kiwis klutz knack knar knarl knars knaur knave knead knee kneed kneel knees knell knelt knew knick knife knish knit knits knob knobs knock knoll knot knots know known knows knur knurl knurs koala kook kooks kooky krill krona krone kroon kudos kudu kudus kudzu kuna kunas kvell kyak kyaks kyat kyats label labor labs lace laced lacer laces lacey lack lacks lacy lade laded laden lades ladle lads lady lager lags lahar laid lain lair lairs lake laker lakes lamb lambs lame lamed lamer lames lamp lamps lance land lands lane lanes lank lanky lapel laps lapse larch lard lards lardy large lari laris lark larks larva lased laser lash lass lasso last lasts latch late later latex lathe laths latke latte laud lauds laugh lava lavas lave laved laves lawn lawns laws laxer laxly layed layer lays layup laze lazed lazes lazy lazys leach lead leads leaf leafs leafy leak leaks leaky lean leans leant leap leaps leapt lear learn leary leas lease leash least leave ledge ledgy leech leek leeks leer leers leery lees left lefts lefty legal leggy legit legs leks lemma lemon lemur lend lends lens lense lent leone leper less lest lets letup leus levee level lever levs levy lewd liar liars libel liber libre lice licit lick licks lids lied lien liens lier lies lieu life lifer lifes lift lifts light like liked liken liker likes lilac lily limb limbo limbs lime limed limes limit limn limns limo limos limp limps limy line lined linen liner lines lingo link links lint linty lion lions lipid lippy lips lira liras lire lisp lisps list lists litas lite liter lithe litre live lived liven liver lives livid llama load loads loaf loafs loam loams loamy loan loans loath lobar lobby lobe lobed lobes lobs local loch lochs loci lock locks loco locos locum locus lode lodes lodge loess loft lofts lofty logic login logo logon logos logs loin loins loll lone loner long longs look looks loom looms loon loons loony loop loops loopy loos loose loot loots lope loped lopes lops lord lords lore lores loris lorry lose loser loses loss lossy lost loti lotis lots lotto lotus loud louse lousy lout louts love loved lover loves lovey lower lowly lows loxes loyal luau lube lubed lubes lucid luck lucks lucky ludes luff luffa luffs luge luges lugs lull lulls lumen lump lumps lumpy lunar lunch lung lunge lungs lupin lupus lurch lure lured lurer lures lurid lurk lurks lush lust lusts lusty lute lutes luxes lyase lying lymph lynx lyre lyres lyric lysis lytic macau macaw mace maced maces mach macho machs macro madam made madly mafia mafic mage magi magic magma maid maids mail mails maim maims main mains maize major make maker makes male males mall malls malt malts malty mama mamas mamba mambo manat mane maned manes manga mange mango mangy mania manic manly manna manor mans many maple maps mara march mare mares mark marka marks marl marls marry mars marsh mart marts mash mask masks mason mass mast masts match mate mated mater mates matey math maths mats matt matte matts maul mauls mauve maws maxim maybe mayo mayor mays maze mazed mazer mazes mbila mbira mead meal meals mealy mean means meant meany meat meats meaty medal media medic meek meet meets meld melds melee melon melt melts meme memes memo memos mend mends mens menu menus meow meows mercy mere merge merit merry mesa mesas mesh meson mess messy metal meted meter metes metre metro mewed mews mica micas mice micro midas midi midst miff might mild mile miler miles milk milks milky mill mills mils mime mimed mimes mimic mince mind minds mine mined miner mines mini minim minis mink minks minor mint mints minty minus minx mire mired mires mirth miser mises miss missy mist mists misty mite miter mites mitre mitt mitts mixed mixer mixes mixup moan moans moat moats mobs mocha mock mocks modal mode model modem modes mods modus mogul mohar mohel moho moist molar mold molds moldy mole moles molly molt molts momma mommy moms money monk monks month mooch mood moods moody mooed moon moons moor moors moory moos moose moot moots mope moped moper mopes mopey mops moral moray more morel mores moron morph morse morts mosey moss mossy most motel moth moths mothy motif motor motte motto mould moult mound mount mourn mouse mousy mouth move moved mover moves movie mowed mower mown mows much mucin muck mucks mucky mucus muddy muff muffs muggy mugs mujik mulch mule mules mull mulls mummy mumps mums munch muon muons mural murk murks murky muse mused muser muses mush mushy music musk musks musky mussy must musts musty mute muted muter mutes mutt mutts muzzy mycin myna mynah mynas myoma myrrh myth myths nabal nabob nabs nacho nadir nags naiad nail nails naira naive naked nakfa name named names nanny nape napes naps nares nasal nasty natal natty naut nauts naval nave navel naves navy nays nazi nazis neap neaps near nears neat neck necks need needs needy negro neigh neon neons neper nerd nerds nerdy nerve nervy nest nests nets never nevi nevus newel newer newly news newsy newt newts next nexus nibs nice nicer niche nicht nick nicks niece nifty nigh night nils nine nines ninja ninny ninth nippy nips nitro nits nixed nixes noble nobly nobs nodal node nodes nods noel noels nohow noise noisy nomad none nooks noon noons noose nope norm norms norse north nose nosed noses nosey nosy notch note noted notes noun nouns nova novae novas novel noway nude nuder nudes nudge nudie nuke nuked nukes null nulls numb numbs nuns nurse nuts nutty nyele nylon nymph oafs oaken oaks oared oars oases oasis oath oaths oats obese obey obeys oboe oboes occur ocean ocher ochre octal octet odder oddly odds odes odor odors odour offer offs often ogle ogled ogler ogles ogre ogres ohmic ohms oiled oiler oils oily oink oinks okay okays okra okras olden older oldie oleo olive omega omen omens omit omits omni once ones onion only onset ontic onto onus onyx oohed oohs ooid oops ootid ooze oozed oozer oozes oozey oozy opal opals open opens opera opine opium opted optic opts oral orals orate orbit orbs orca order ores organ ortho oryx oscar other otter ouch ought ouija ounce ours oust ousts outdo outed outer outgo outs ouzo ouzos oval ovals ovary ovate oven ovens over overs overt ovoid ovula ovule ovum owed ower owers owes owing owled owler owlet owls owly owned owner owns oxane oxbow oxen oxens oxes oxeye oxide oxlip oxter ozone pace paced pacer paces pack packs pact pacts paddy pads paean pagan page paged pager pages paid pail pails pain pains paint pair pairs pale paled paler pales pall palls palm palms palmy pals palsy panda pane paned panel panes pang pangs panic pans pansy pant pants panty papa papal papas paper paps parch pare pared parer pares park parka parks parry pars parse part parti parts party parvo pass past pasta paste pasts pasty patch pate pater path paths patio pats patty pause pave paved paves pawed pawn pawns paws payed payee payer pays peace peach peak peaks peal peals pear pearl pears peas peat peats peaty pecan peck pecks pedal peek peeks peel peels peep peeps peer peers peeve pegs pelf pelfs pelt pelts penal pence pend pends penis penny pens pent pents peon peons peony peppy peps perch peril perk perks perky perm perms pert perts pesky peso pesos pest pesto pests pesty petal peter petit pets petty pewee pewit pews phage phase phis phish phiz phlox phone phony photo phyla piano pick picks picky piece pied pier piers pies pieta piety piggy pigs pike piked pikes pilaf pile piled piler piles pili pill pills pilot pimp pimps pinch pine pined pines ping pingo pings pink pinks pinky pins pint pinto pints pinup pious pipe piped piper pipes pipet pipit pips pique pita pitas pitch pith piths pithy piton pits pity pius pivot pixel pizza place plaid plain plait plan plane plank plans plant plate platy play plays plaza plea plead pleas pleat pled plied plier plies plod plods plonk plop plops plot plots plow plows ploy ploys pluck plug plugs plum plumb plume plump plums plumy plunk plus plush poach pock pocks pods poem poems poesy poet poets pogo point poise poke poked poker pokes poky polar pole poled poles polio polka poll polls polo polyp pomp pond ponds pony pooch pooh poohs pool pools poop poops poor pope popes poppa poppy pops popup porch pore pored porer pores pork porks porky porn porns porny port porte ports pose posed poser poses posh posit posse post posts posy pots potty pouch pouf poufs poult pound pour pours pout pouts pouty power poxed poxes poxy pram prams prank prate prawn pray prays preen preop prep preps press prey preys price prick pricy pride pried prier pries prim prime primo primp print prion prior prism privy prize probe prod prods prom proms prone prong proof prop props pros prose proud prove prow prowl prows proxy prude prune psalm psis psych pubic pubs puce puces puck pucks pudgy puff puffs puffy pugs puke puked pukes pulas pull pulls pulp pulps pulpy pulse puma pumas pump pumps punch punk punks punny puns punt punts puny pupa pupae pupal pupil puppy pups pure pured puree purer pures purge purr purrs purse push pushy pussy puts putt putti putto putts putty pygmy pylon pyre pzazz qabal qoph quack quad quads quaff quail quake quaky qualm quant quark quart quash quay quays qubit queen queer quell query quest queue quich quick quid quids quiet quiff quill quilt quint quip quips quire quirk quit quite quits quiz quota quote rabid race raced racer races rack racks racy radar radii radio radix radon raft rafts rage raged rager rages rags raid raids rail rails rain rains rainy raise rajah rake raked raker rakes rally ramen rami rammy ramp ramps rams ramus ranch rand rands randy rang range rangy rank ranks rant rants rape raped raper rapes rapid raps rapt rare rarer rares rash rashy rasp rasps raspy rate rated rater rates ratio rats ratty rave raved ravel raven raver raves rawer raws rayed rayon rays raze razed razes razor razz reach react read readd reads ready reak reaks real realm reals ream reams reap reaps rear rearm rears reask rebar rebel rebid rebit rebus rebut rebuy recap recon recur recut redid redip redo redon redox redry reds redub redux redye reed reeds reedy reef reefs reefy reek reeks reeky reel reels reeve refer refit refix refry refs regal rehab rehem reice reign rein reink reins rejig rekey relax relay relic relit relog rely remap remex remit remix renal rend rends renew renin rent rents reoil repay repeg repel repin reply repo repot reran rerun resat resaw resay reset resew resh resin resit resod resow rest rests retag retap retie retro retry reuse revel revs revue rewax rewed rewet rewon rheum rhino rhomb rhos rhyme rial rials ribs rice riced ricer rices rich ricin rick ricks ride rider rides ridge ridgy rids riel riels rife rifer riff riffs rifle rift rifts right rigid rigor rigs rile riled riles rill rille rills rilly rily rime rimed rimes rims rind rinds ring rings rink rinks rinse riot riots ripe riped ripen riper ripes rips rise risen riser rises risk risks risky rite rited rites ritzy rival rive rived riven river rives rivet riyal roach road roads roam roams roan roans roar roars roary roast robe robed robes robin robot robs rock rocks rocky rode rodeo rodes rods roes roger rogue roil roils roily roist role roles roll rolls roman romp romps rood roods roof roofs rook rooks room rooms roomy roost root roots rope roped roper ropes ropey ropy rose roses rosey rosin rosy rote rotor rots roue roues rouge rough round rouse rout route routs rove roved rover roves rowdy rowed rower rows royal ruble rubs ruby ruddy rude ruder rued rues ruff ruffs rugby rugs ruin ruing ruins rule ruled ruler rules rumba rummy rumor rumps rums rune runes rung rungs runic runny runs runt runts runty rupee rural ruse ruses rush rushy rust rusts rusty ruts rutty saber sable sabre sack sacks sacra sacs sadhe sadly safe safer safes saga sagas sage sager sages saggy sags sagy said sail sails saint saith sake sakes saki salad sale sales salon salsa salt salts salty salve samba same sand sands sandy sane saner sanes sang sank sansu sanza sappy saps sari sarin saris sash sass sassy satan satay sate sated sates satin satyr sauce saucy sauna saute save saved saver saves savor savvy sawed sawer sawn saws saxes sayee sayer says scab scabs scald scale scalp scaly scam scamp scams scan scans scant scape scar scare scarf scarp scars scary scat scats scene scent scion scoff scold scone scoop scoot scope score scorn scot scots scour scout scowl scrag scram scrap scree screw scrip scrub scrum scuba scud scuds scuff sculk scum scums scuzz seal seals seam seams seamy sear sears seas seat seats sebum secco sect sects sedan sedge sedgy sedum seed seeds seedy seek seeks seem seems seen seep seeps seepy seer seers sees segue seine seize self sell sella sells semen semis send sends senna senor sense sent sepal sepia septa sera seral sere sered serer seres serf serfs serif serum serve seta setae setal sets setup seven sever sewed sewer sewn sews sexed sexes sext sexts sexy shack shade shady shaft shags shah shahs shake shaky shale shall shalt shaly sham shame shams shank shape shard share shark sharp shave shawl sheaf shear shed sheds sheen sheep sheer sheet sheik shelf shell shew shewn shews shier shies shift shill shim shims shin shine shins shiny ship ships shire shirk shirt shish shiv shivs shmo shoal shock shoe shoed shoer shoes shone shoo shook shoot shop shops shore shorn short shot shots shout shove show shown shows showy shred shrew shrub shrug shuck shun shuns shunt shush shut shuts shwa shwas shyer shyly sibyl sick sicko sicks side sided sides sidle siege sieve sift sifts sigh sighs sight sigma sign signs sikh sikhs silk silks silky sill sills silly silo silos silt silts silty since sine sines sinew sing singe sings sink sinks sins sinus sippy sips sire sired siren sires sirs sitar site sited sites sitin sits situp sitz sixer sixes sixmo sixth sixty size sized sizer sizes skate skew skews skid skids skied skier skies skiff skill skim skimp skims skin skink skins skip skips skirl skirt skis skit skits skulk skull skunk slab slabs slack slags slain slake slam slams slang slant slap slaps slash slat slate slats slaty slave slaw slaws slay slays sled sleds sleek sleep sleet slept slew slews slice slick slid slide slier slily slim slime slims slimy sling slink slip slips slit slits slob slobs slock sloe sloes slog slogs sloop slop slope slops slosh slot sloth slots slow slows slug slugs slum slump slums slung slur slurp slurs slush slyer slyly smack small smarm smart smash smear smell smelt smile smily smirk smit smite smith smock smog smogs smoke smoky smote smug smut smuts snack snafu snag snags snail snake snaky snap snaps snare snarf snark snarl sneak sneer snick snide sniff snip snipe snips snit snits snob snobs snog snogs snood snoop snoot snore snort snot snots snout snow snows snowy snub snubs snuff snug snugs soak soaks soap soaps soapy soar soars sober sobor sobs sock socks soda sodas soddy sods sofa sofas soft softa softy soggy soil soils solar sold sole soled soles solid solo solos solve some soms sonar sonde song songs sonic sonny sons soon soot soots sooty sopor soppy sops sore sorer sores sorgo sorry sort sorts sots soul souls sound soup soups soupy sour sours south sowed sower sown sows soya soyas soys space spade spam spams span spank spans spar spare spark spars spas spasm spat spate spats spawn spay spays speak spear speck specs sped speed spell spelt spend spent sperm spews spice spicy spied spier spies spiff spike spiky spill spilt spin spine spins spiny spire spiro spiry spit spite spits spitz splat splay split spoil spoke spoof spook spool spoon spoor spore sport spot spots spout sprat spray spree sprig sprit sprue spry spud spuds spume spumy spun spur spurn spurs spurt squab squad squat squid stab stabs stack staff stag stage stags stagy staid stain stair stake stale stalk stall stamp stand staph star stare stark stars start stash stat state stats stave stay stays stead steak steal steam steed steel steep steer stein stem stems steno stent step steps stern stew stews stick sties stiff still stilt stimy sting stink stint stir stirs stock stogy stoic stoke stole stoma stomp stomy stone stony stood stool stoop stop stops stopt store stork storm story stoup stout stove stow stows strap straw stray strep strew strip strop strow strum strut stub stubs stuck stud studs study stuff stump stun stung stunk stuns stunt stupa stye styed styes style styli stymy styx suave subs such suck sucks sucky suds sudsy sued suede suer suers sues suet suets suety sugar suing suit suite suits sulk sulks sulky sully sumac sumo sumos sump sumps sums sung sunk sunny suns sunup super supra sure surer surf surfs surge surgy surly sushi swab swabs swag swags swam swami swamp swamy swan swang swank swans swap swaps swarm swash swat swath swats sway sways swear sweat sweep sweet swell swept swift swig swigs swill swim swims swine swing swipe swirl swish swoon swoop sword swore sworn swum swung sync synch synod syrup tabby tabid table taboo tabs tacit tack tacks tacky taco tacos tact taffy taggy tags taiga tail tails taint taka takas take taken taker takes tala talas talc talcs tale tales talk talks tall talls tally talon talus tame tamed tamer tames tamp tamps tams tango tangy tank tanks tans tansy tapas tape taped taper tapes tapir taps tardy tare tares tarn tarns taro taros tarot tarp tarps tarry tars tarsi tart tarts taser task tasks taste tasty tatar tatoo taunt taupe taus taut tawny taxa taxed taxer taxes taxi taxis taxon teach teak teaks teal teals team teams tear tears teary teas tease teats teaux tech techs techy teddy teed teem teems teen teens teeny tees teeth telex tell tells tempo temps tempt tend tends tenet tenge tenon tenor tens tense tent tenth tents tenty tepee tepid term terms tern terns terry terse tesla test tests testy teth tetra text texts than thank that thats thaw thaws thee theft their them theme then thens there therm these theta they thick thief thigh thin thine thing think thins third this thong thorn those thou thous three threw throb throe throw thru thrum thud thuds thug thugs thumb thump thunk thus thyme thymy tiara tibia tick ticks tics tidal tide tides tidy tied tier tiers ties tiff tiger tight tike tikes tilde tile tiled tiler tiles till tills tilt tilts tilty time timed timer times timid tine tinea tined tines ting tinge tings tinny tins tint tints tiny tipi tipis tippy tips tipsy tire tired tires titan titer tithe title titre toad toads toady toast today toddy toed toes toff toffs tofu tofus toga togas toil toile toils toked token tokes told toll tolls tomb tombs tome tomes tonal tondo tone toned toner tones tong tongs tonic tonne tons took tool tools toot tooth toots topaz topic tops toque torah torch tore torn toro torso tort torte torts torus toss total tote toted totem toter totes tots touch tough tour tours tout touts towed towel tower town towns tows toxic toxin toyed toys trace track tract trade trail train trait tram tramp trams trap traps trash trawl tray trays tread treat tree treed trees trek treks trend trent tress triad trial tribe trick tried trier tries trike trill trim trims trio trios trip tripe trips trite trod troll troop trope trot trots trout trove troy truce truck true truer trues truly trump trunk truss trust truth tryst tsadi tsar tsars tuba tubal tubas tubby tube tubed tuber tubes tubs tuck tucks tufa tufas tuff tuffs tuft tufts tufty tugs tulip tummy tumor tums tuna tunas tune tuned tuner tunes tunic tuple turbo turf turfs turfy turks turn turns tusk tusks tutor tutu tutus tuxes twang tweak tweed tweet twerp twice twig twigs twill twin twine twins twirl twirp twist twit twits twixt twos tying tyke tykes type typed typer types typo typos tyres tyro tzar tzars udder ughs ugly ukes ulcer ulna ulnae ulnar ulnas ultra umbel umber umbo umbos umped umps unarm unary unbar unbid unbox uncap uncle uncut under undid undo undue unfed unfit unfix unhip unify union unit unite units unity unix unjam unled unlit unlog unman unmet unpeg unpen unpin unrig unsay unset unsex unshy untie until unto unwed unzip updip upend upon upped upper upset urate urban urea urge urged urger urges uric urine urns usage used user users uses usher using usual usurp usury utter uvea uvula vagal vague vagus vain vale vales valet valga valid valor value valve vamp vamps vane vanes vang vans vapid vapor vara varas varix varna varum varus vary vase vases vast vats vatu vatus vault veal veals vear vears veer veers vees vegan veil veils veily vein veins vela velum venal vend vends venin venom vent vents venue venus verb verbs verge verse very vest vests vetch veto vets vexed vexer vexes vial vials vibe vibes vicar vice vices video vied vies view views vigil vigor vile viler villa villi vinca vine vined vines vinyl viola viper viral virus visa visas vise vised vises visit visor vista vital vivid vixen vocal vodka voes vogue voice void voids voila vole voles volt volts vomit vote voted voter votes vouch vowed vowel vower vows vroom vuggy vugs vulva vying wack wacko wacks wacky waddy wade waded wader wades wads wafer waft wafts wage waged wager wages wagon wags waif waifs wail wails waist wait waits waive wake waked waken waker wakes walk walks wall walls wally waltz wand wands wane waned wanes wanna want wants ward wards ware wared wares warm warms warn warns warp warps wars wart warts warty wary wash washy wasp wasps waspy waste watch water watt watts waul wauls wave waved waver waves wavey wavy wawl wawls waxed waxen waxer waxes waxy ways wazza weak wean weans wear wears weary weave webby weber webs wedge wedgy weds weed weeds weedy week weeks ween weens weeny weep weeps weepy weigh weir weird weirs welch weld welds well wells welsh welt welts wench wend wends went wept were west wetly wets whack whale wham whams wharf what whats wheal wheat wheel whelk whelp when where whet whets whew whey which whiff while whim whims whine whiny whip whips whir whirl whirr whirs whisk whisp white whits whiz whizz whoa whole whom whoop whop whops whorl whose whoso whup whups wick wicks wide widen wider wides widow width wield wife wifi wight wigs wild wilds wile wiled wiles will wills wilt wilts wily wimp wimps wimpy wince winch wind winds windy wine wined wines wing wings wink winks wins wipe wiped wiper wipes wire wired wirer wires wiry wise wised wiser wises wish wishy wisp wisps wispy wist witch with wits witty wive wived wives wizen woad woads woes woke woken woks wolf wolfs woman womb wombs women wonky wons wont wonts wood woods woody wooed wooer woof woofs wool wools wooly woos woozy word words wordy wore work works world worm worms wormy worn worry worse worst wort worth worts would wound wove woven wowed wows wrack wrap wraps wrapt wrath wreak wreck wren wrens wrest wrier wring wrist writ write writs wrong wrote wrung wryer wryly wurst wussy wyes xebec xenia xenic xenon xeric xerox xerus xray xrays xylan xylem xylol xylyl xyst xysti xysts yacht yack yacks yaff yaffs yager yagi yagis yahoo yaird yaks yald yamen yams yamun yang yangs yank yanks yapok yapon yaps yard yards yare yarer yarn yarns yaud yauds yauld yaup yaups yawed yawl yawls yawn yawns yawp yawps yaws yeah yeahs yealm yean yeans year yearn years yeas yeast yegg yeggs yeld yelk yelks yell yells yelm yelms yelp yelps yens yerba yerk yeses yeti yetis yett yeuk yeuks yeuky yews yield yill yills yince yins yipe yipes yips yird yirds yirr yirrs yirth yodel yodh yodhs yodle yods yoga yogas yogee yogh yoghs yogi yogic yogin yogis yoke yoked yokel yokes yolk yolks yolky yomim yond yoni yonis yore yores young your yourn yours youse youth yowe yowed yowes yowie yowl yowls yows yoyo yuan yuans yucca yuck yucks yucky yuga yugas yukky yuks yulan yule yules yummy yupon yurt yurta yurts yutz ywis zags zamia zany zanza zanzu zappy zaps zarf zarfs zati zatis zaxes zayin zeal zeals zebec zebra zebu zebub zebus zeds zees zein zeins zens zerk zerks zero zeros zest zests zesty zeta zetas zibet zigs zilch zinc zincs zincy zine zines zing zings zingy zinky zippy zips ziram ziti zitis zits zloty zoaea zoea zoeae zoeal zoeas zoic zombi zonal zonda zone zoned zoner zones zonk zonks zooid zooks zoom zooms zoon zoons zoos zori zoril zorse zowie zulu zulus zyme zymes";

        var wmap = {};
        for(var j = 0; j < words.length; j++){
            var wp = words[j - 1];
            var wc = words[j];
            var wn = words[j + 1];

            if(wc && wc != " "){
                if(!wmap[wc]){
                    wmap[wc] = [{ "pick": []},{ "pick": []}];
                } 
            } else {
                continue;   
            }

            if(wp && wp != " "){
                if(!wmap[wc][0][wp]){
                    wmap[wc][0][wp] = 0;
                }
                wmap[wc][0][wp]++;
                wmap[wc][0]["pick"].push(wp)
            } else {
                continue;
            }

            if(wn && wn != " "){
                if(!wmap[wc][1][wn]){
                    wmap[wc][1][wn] = 0;
                }
                wmap[wc][1][wn]++;
                wmap[wc][1]["pick"].push(wn)
            } else {
                continue;
            }

        }
        //console.log(map["m"]["e"]["a"], map["v"]);



        //"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", , "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        //"aeiou"
        var all = "abcdefghijklmnopqrstuvwxyz";
        var map = {
            "a":{"letters" : all},
            "e":{"letters" : all},
            "i":{"letters" : all},
            "o":{"letters" : all},
            "u":{"letters" : all},

            "b":{"letters" : "aeioulr"},
            "c":{"letters" : "aeioulrs"},
            "d":{"letters" : "aeiour"},
            "f":{"letters" : "aeioulr"},
            "g":{"letters" : "aeioulrn"},
            "h":{"letters" : "aeiou"},
            "j":{"letters" : "aeiou"},
            "k":{"letters" : "aeiounr"},
            "l":{"letters" : "aeiou"},
            "m":{"letters" : "aeiou"},
            "n":{"letters" : "aeiou"},
            
            "p":{"letters" : "aeiouhlr"},
            "q":{"letters" : "aeiou"},
            "r":{"letters" : "aeioumt"},
            "s":{"letters" : "aeiouchklmnpqtw"},
            "t":{"letters" : "aeiouhrwz"},
            
            "v":{"letters" : "aeiou"},
            "w":{"letters" : "aeiouhr"},
            "x":{"letters" : "aeiou"},
            "y":{"letters" : "aeiou"},
            "z":{"letters" : "aeiou"}
        }

        var number = Math.floor ( 4 + (Math.random() * 3 ));
        var letter = all[Math.floor(Math.random() * all.length)];
        var word = "";
        

        var k = 0;
        do {
            var select = wmap[letter][1].pick;
            var newletter = select[Math.floor(Math.random() * select.length)];
            
            if(wmap[newletter][0][letter] < 80 ){
                continue;
            }


            if(wmap[newletter][0][letter]){
                word += letter;
                letter = newletter;
            } else {
                continue;
            }
            
            if(k == number) break;

            k++;
        } while (true);

        return word;
    } 
}




//found here
//http://stackoverflow.com/questions/27194359/javascript-pluralize-a-string

var json = {
    "root" : ["{{hello:list|randomfill}}  asdasd {{#|gen}}"],
    "list" : ["a%d%d","b%d%d","c%d%d"]
};


var pz = new ParZen( json ); 
var sentence = pz.build();
console.log(sentence);