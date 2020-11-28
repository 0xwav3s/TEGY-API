var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var zoneSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    description: String,
    available: { type: Boolean, default: true, required: true },
    author: { type: String, ref: 'user', required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    zoneSeq: Number,
});

//Can use
zoneSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'zone',
    field: 'zoneSeq'
});

zoneSchema.pre('save', function (next) {
    this._id = config.model.id.zone + this.zoneSeq;
    next();
});

module.exports = mongoose.model('zone', zoneSchema);