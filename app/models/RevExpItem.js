var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var RevExpItemSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    description: String,
    available: { type: Boolean, default: true, required: true },
    author: { type: String, ref: 'user', required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    rev_exp_itemSeq: Number,
});

//Can use
RevExpItemSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'rev_exp_item',
    field: 'rev_exp_itemSeq'
});

RevExpItemSchema.pre('save', function (next) {
    this._id = config.model.id.rev_exp_item + this.rev_exp_itemSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('rev_exp_item', RevExpItemSchema);