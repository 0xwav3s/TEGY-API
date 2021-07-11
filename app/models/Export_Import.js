var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var exportImportSchema = mongoose.Schema({
    _id: String,
    name: { type: String },
    note: String,
    export_import: { type: String, enum: config.model.enum.import_export, required: true },
    amount: { type: Number, required: true },
    price: { type: Number, required: true },
    // total_price: { type: Number, required: true },
    expiry_date: { type: Date },
    unit: { type: String, enum: config.model.enum.unit_item_resource, required: true },
    available: { type: Boolean, default: true, required: true },
    author: { type: String, ref: 'user', required: true },
    item: { type: String, ref: 'item', required: true },
    supplier: { type: String, ref: 'supplier', required: true },
    dateTime: { type: Date, default: Date.now(), required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    exportImportSeq: Number,
});

//Can use
exportImportSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'exportImport',
    field: 'exportImportSeq'
});

exportImportSchema.pre('save', function (next) {
    this._id = config.model.id.exportImport + this.exportImportSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('exportImport', exportImportSchema);