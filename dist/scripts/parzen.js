

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

function moduleinit(){
	if( typeof module  != "undefined" && module.exports ){
		module.exports = ParZen;	
	}
}

moduleinit();


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

    ParZen.preformatters.reverse = function(words, params) {
        return words.split('').reverse().join('');
    }

    ParZen.preformatters.wordreverse = function(words, params) {
        return words.split('').reverse().join('').split(' ').reverse().join(' ');
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
