var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;

var orderSchema = mongoose.Schema({
    _id: String,
    // name: { type: String, required: true },
    note: { type: String },
    log: { type: String },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: [
            "Đã chọn",
            "Đang xử lý",
            "Hoàn tất",
            "Hủy"
        ],
        default: "Đã chọn",
        required: true
    },
    menu: { type: String, ref: 'menu', required: true },
    author: { type: String, ref: 'user', required: true },
    available: { type: Boolean, default: true, required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    orderSeq: Number,
});

//Can use
orderSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'order',
    field: 'orderSeq'
});

orderSchema.pre('save', function (next) {
    if (this._id) this._id = config.model.id.order + this.orderSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('order', orderSchema);