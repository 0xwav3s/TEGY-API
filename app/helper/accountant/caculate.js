module.exports.getPercent = function (percent1, percent2) {
    var result = ((percent1 / percent2) * 100).toFixed(2);
    return (isInfinite(result)) ? 100 : result;
}

module.exports.getPercentGrowth = function (a, b) {
    if (a === 0) {
        return 0;
    }
    var minus = (b - a) / a;
    // var div = (minus>0)
    // cal = (cal < 0) ? cal * 100 : cal;
    var result = (cal * 100).toFixed(2);
    return result;
}

module.exports.percIncrease = function(a, b) {
    let percent;
    if(b !== 0) {
        if(a !== 0) {
            percent = (b - a) / a * 100;
        } else {
            percent = 0;
        }
    } else {
        percent = 0;            
    }       
    return Math.floor(percent.toFixed(2));
}


module.exports.getOccurrence = function (array, value) {
    return array.filter((v) => (v === value)).length;
}

function isInfinite(n) {
    return (n + '' === 'Infinity') ? true : false;
}