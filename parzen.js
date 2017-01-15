
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

ParZen = function(json){
    var public = this;
    var private = {};
    private.data = json;
    private.userData = {};
    private.variables = {};
    public.formatters = {};
    private.flags = {};

    public.json = function(json){
        private.data = json;
    }


    public.getUserTemplateVariables = function(){
        return private.userData;
    }

    private.process = function(){
        return private.getNode("root");
    }    

    public.formatters.ucf = function(words, params){
        return words.charAt(0).toUpperCase() + words.slice(1);
    }

    public.formatters.uc = function(words, params){
        return words.toUpperCase();
    }

    public.formatters.ucr = function(words, params){
        if(Math.random() > 0.7){
            return words.toUpperCase();
        }
        return words;
    }

    public.formatters.ucw = function(words, params){
       return words.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }

    public.formatters.an = function(words, params) {
        return private.indefiniteArticle(words.split(" ")[0]) + " " + words ;
    }

    public.formatters.p = function(words, params){
        if(params === false){
            return private.plural(words);
        }
        var word = private.data[params.trim()] || private.userData[params.trim()];
        
        if(word){
            if( private.variables[word] == 'multiple' ){
                if( private.data["plurals"] && private.data["plurals"][words]){
                    words = private.data["plurals"][words];
                } else {
                    words = private.plural(words);// + (words[words.length-1] == "s"?"e":"") + "s"
                }
            }
        }
        return words;
    }

    public.formatters.m = function(words, params){
        return private.plural(words);
    }

    for(var formatFunction in ParZen.formatters){
        public.formatters[formatFunction] = ParZen.formatters[formatFunction];
    }

    private.indefiniteArticle = indefiniteArticle;
    private.plural = plural;

    private.getNode = function(name){

        var item = name.split(".");
        name = item[0].trim();        
        
        var data = private.data[name];
        if(!data){
            data = private.userData[name];
        }
        var key = null;
        
        if(!data){
            throw "Cannot find `" + name + "` in defined JSON lists.";
        }

        if(/object/i.test((data).constructor)){
            var keys = Object.keys(data);
            key = keys[Math.floor(Math.random() * keys.length)];
            data = data[key];           
        }

        var rand = Math.floor(Math.random() * data.length);
        
        if(item[1] != 'undefined'){
            var notSoRandomAfterAll = parseInt(item[1]);
            if(notSoRandomAfterAll < data.length){
                rand = notSoRandomAfterAll;
            }
        }

        var node = data[rand];

        if(key !== null){
            private.variables[node] = key;
        }

        //pull tags including brackets
        var variables = node.match(/\{\{([ a-zA-Z0-9:.-_\*\&\?|]*)\}\}/g);
        
        for(var i in variables){
            //pull current tag
            var tag = variables[i];
            
            //remove brackets
            var variable = tag.substr(2,tag.length - 4).trim();

            //get modifiers 
            //sperate modifiers
            var split = variable.split("|");
            var modifierArray = split.splice(1); 
            var modifiers = {};
            for(var mod in modifierArray){
                var modifierComponents = modifierArray[mod].split(":");
                
                modifiers[modifierComponents[0]] = modifierComponents[1] || false;
            }

            variable = split[0].trim();      
            //if we are storing the variable for later use
            //get storage varible name
            //sperate from replacement variable name 
            var parameters = variable.split(":");
            var name = parameters[1] || parameters[0];
            var nextnode = private.getNode(name);

            //get word modifiers atm it only supports turning on pluralization for defined lists
            // "root" : [
            //     "I picked up {{quantities}} round {{things|p}}"
            // ],
            // "quantities" : [
            //     "ten thousand",      <--------\
            //     "one",                                  | this is the modifier `|p:things`
            //     "bucket loads of"    <--------/ 
            // ],
            // "things" : [
            //     "ladder",
            //     "nail",
            //     ["person","people"],
            // ]
            var nextnode = nextnode.split("|");
            flags = nextnode.splice(1);
            nextnode = nextnode[0];
            
            //load text flags
            //for turning on pluralization
            // for(var j in flags){
            //     var f = flags[j].split(":");
            //     if(f.length > 1){
            //         if(!private.flags[f[1]]){
            //             private.flags[f[1]] = {};
            //         }
            //         private.flags[f[1]][f[0]] = true;
            //     }
            // }            

            //store variable for later use
            if(parameters[1] && parameters[0]){
                if(!private.userData[parameters[0]]){
                    private.userData[parameters[0]] = [];
                }
                private.userData[parameters[0]].push(nextnode);
            }

            for(var mods in modifiers){
                if(public.formatters[mods]){
                    nextnode = public.formatters[mods](nextnode, modifiers[mods]);
                }
            }
            //replace relevant tags
            node = node.replace(tag, nextnode);
        }

        //{[q1::multiple?'were':'was']}
        var conditional = node.match(/\{\[([a-zA-Z0-9:.-_\*\&?|']*)\]\}/g);
        for(var k in conditional){
            
            var statementTag = conditional[k];           
            var statement = statementTag.substr(2,statementTag.length - 4).split("?");

            var sns = statement[0].split(":");
            var svs = statement[1].substr(1,statement[1].length - 2).split(/['"]\:['"]/);
            var replacement = svs[1];

            if(private.userData[sns[0]] && private.userData[sns[0]][0]){
                var word = private.userData[sns[0]][0];
                if(private.variables[word] == sns[1]){
                    replacement = svs[0];
                }
            }

            node = node.replace(statementTag, replacement);
        }
        return node;
    }

 
    public.build = function(){
        private.variables = {};
        private.data = json;
        return private.process();
    }
}

ParZen.formatters = {};


