var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;

var reportSchema = mongoose.Schema({
    _id: String,
    author: { type: String, ref: 'user', required: true },
    available: { type: Boolean, default: true, required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    reportSeq: Number,
});

//Can use
reportSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'report',
    field: 'reportSeq'
});

reportSchema.pre('save', function (next) {
    this._id = config.model.id.report + this.reportSeq;
    next();
});

module.exports = mongoose.model('report', reportSchema);