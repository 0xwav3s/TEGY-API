var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;

var tax_promotionsSchema = mongoose.Schema({
    _id: String,
    name: { type: String},
    description: String,
    value: { type: Number, required: true },
    unit: { type: String, enum: config.model.enum.tax_promotions, required: true },
    increase: { type: Boolean, default: true, required: true },
    available: { type: Boolean, default: true, required: true },
    bill: { type: String, ref: 'bill'},
    author: { type: String, ref: 'user', required: true },
    applyFrom: { type: Date, required: true },
    applyTo: { type: Date, required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    tax_promotionsSeq: Number,
});

//Can use
tax_promotionsSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'tax_promotions',
    field: 'tax_promotionsSeq'
});

tax_promotionsSchema.pre('save', function (next) {
    if (this._id) this._id = config.model.id.tax_promotions + this.tax_promotionsSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('tax_promotions', tax_promotionsSchema);