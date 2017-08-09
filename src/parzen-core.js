

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
					func = pub.formatters[mod];
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

