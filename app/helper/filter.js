const helper = require('./utils');
module.exports.getFilter = function (req, fieldFromTo) {
    let filter = {};
    if (req.query.from || req.query.to) {
        var from = helper.getEndDate(req.query.from);
        var to = helper.getStartDate(req.query.to);
        filter[fieldFromTo] = { "$gte": from, "$lt": to };
    }
    let merge = { ...req.query, ...filter };
    for (let i in merge) {
        if (merge[i].length > 2 && merge[i].includes(",")) {
            merge[i] = { $in: merge[i].split(",") };
        }
    }
    return merge;
}

module.exports.removeIsNotFilter = function (mergedFilter) {
    delete mergedFilter.from;
    delete mergedFilter.to;
    delete mergedFilter.page;
    delete mergedFilter.limit;
    return mergedFilter;
}