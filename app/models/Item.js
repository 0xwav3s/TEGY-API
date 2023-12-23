var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;

var itemSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    description: { type: String },
    // realtime_price: { type: Number, required: true },
    // current_price: { type: Number, required: true },
    amount: { type: Number, default: 0, required: true },
    // amount_future: { type: Number, required: true },
    unit: { type: String, enum: config.model.enum.unit_item_resource, required: true },
    limit_alert: { type: Number, default: 0, required: true },
    category: { type: String, ref: 'itemcategories', required: true },
    author: { type: String, ref: 'user', required: true },
    image: { type: String, ref: 'images' },
    available: { type: Boolean, default: true, required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    itemSeq: Number,
});

//Can use
itemSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'item',
    field: 'itemSeq'
});

itemSchema.pre('save', function (next) {
    this._id = config.model.id.item + this.itemSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('item', itemSchema);