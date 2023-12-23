var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;

var billSchema = mongoose.Schema({
    _id: String,
    note: { type: String },
    log: { type: String },
    total_price_order: { type: Number, required: true },
    totalBills: {
        isMultiple: { type: Boolean, default: false },
        ref_otherBills: [{ type: String, ref: 'bill' }],
        total_price_bills: { type: Number },
        money_pay_for_cus: { type: Number },
        money_give_by_cus: { type: Number },
        tax_promotions: [{ type: String, ref: 'tax_promotions' }],
        af_price_tax_promotions: { type: Number },
    },
    status: {
        type: String,
        enum: config.model.enum.bill,
        default: "Chưa thanh toán",
        required: true
    },
    type_bill: {
        type: String,
        enum: config.model.enum.types_bill,
        default: "Tại bàn",
        required: true
    },
    // menu: [{ type: String, ref: 'menu', required: true }],
    table: { type: String, ref: 'table' },
    order: [{ type: String, ref: 'order', required: true }],
    author: { type: String, ref: 'user', required: true },
    timeIn: { type: Date, default: Date.now(), required: true },
    timeOut: { type: Date },
    available: { type: Boolean, default: true, required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    billSeq: Number,
});

//Can use
billSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'bill',
    field: 'billSeq'
});

billSchema.pre('save', function (next) {
    this._id = config.model.id.bill + this.billSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('bill', billSchema);