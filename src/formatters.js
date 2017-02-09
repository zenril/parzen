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

 
}





//found here
//http://stackoverflow.com/questions/27194359/javascript-pluralize-a-string

var json = {
    "root" : ["{{hello:list|randomfill}}  asdasd {{#|gen}}  {{#|gen}}  "],
    "list" : ["a%d%d","b%d%d","c%d%d"]
};


var pz = new ParZen( json ); 
var sentence = pz.build();
console.log(sentence);