var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var expensesSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    amount: { type: String, required: true },
    description: String,
    available: { type: Boolean, default: true, required: true },
    author: { type: String, ref: 'user', required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    expensesSeq: Number,
});

//Can use
expensesSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'expenses',
    field: 'expensesSeq'
});

expensesSchema.pre('save', function (next) {
    this._id = config.model.id.expenses + this.expensesSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('expenses', expensesSchema);