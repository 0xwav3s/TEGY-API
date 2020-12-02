var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var tableSchema = mongoose.Schema({
    _id: String,
    name: { 
        type: String, 
        required: true,
        unique: true
    },
    description: String,
    available: { type: Boolean, default: true, required: true },
    active: { type: String, enum: config.model.enum.active, required: true },
    zone: { type: String, ref: 'zone', required: true },
    currentBill: [{ type: String, ref: 'bill' }],
    author: { type: String, ref: 'user', required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    tableSeq: Number,
});

//Can use
tableSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'table',
    field: 'tableSeq'
});

tableSchema.pre('save', function (next) {
    this._id = config.model.id.table + this.tableSeq;
    if (!this.name) this.name = this.tableSeq;
    next();
});


module.exports = mongoose.model('table', tableSchema);