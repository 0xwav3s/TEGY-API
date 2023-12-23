var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var supplierSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    personName: { type: String, required: true },
    description: String,
    available: { type: Boolean, default: true, required: true },
    author: { type: String, ref: 'user', required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    supplierSeq: Number,
});

//Can use
supplierSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'supplier',
    field: 'supplierSeq'
});

supplierSchema.pre('save', function (next) {
    this._id = config.model.id.supplier + this.supplierSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('supplier', supplierSchema);