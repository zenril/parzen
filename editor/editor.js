function fromEditor(cards){
    ret = {};
    for(i in cards){
        var card = cards[i];
        if(card.quantitive && card.name.trim() != ""){
            ret[card.name.trim()] = {
                "singular" : card.words.normal.map(function(a){ return a.value.trim() ? a.value:false; }).filter(function(a){ return a; }),
                "multiple" : card.words.multiple.map(function(a){ return a.value.trim() ? a.value:false; }).filter(function(a){ return a; })
            }
        } else if(card.name.trim() != ""){
            ret[card.name.trim()] =  card.words.normal.map(function(a){ return a.value.trim() ? a.value:false; }).filter(function(a){ return a; });            
        }
    }
    return ret;
}

