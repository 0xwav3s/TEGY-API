var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var revExpSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    rev_exp: { type: String, enum: config.model.enum.rev_exp, required: true },
    revExpItem: { type: String, ref: 'rev_exp_item', required: true },
    price: { type: Number, required: true },
    payment_method: { type: String, enum: config.model.enum.payment_method, required: true },
    dateTime: { type: Date, default: Date.now(), required: true },
    note: String,
    available: { type: Boolean, default: true, required: true },
    author: { type: String, ref: 'user', required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    revExpSeq: Number,
});

//Can use
revExpSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'revExp',
    field: 'revExpSeq'
});

revExpSchema.pre('save', function (next) {
    this._id = config.model.id.revExp + this.revExpSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('revExp', revExpSchema);