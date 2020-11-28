var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;

var menuSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    description: { type: String},
    price: { type: Number, required: true },
    unit: { type: String, enum: config.model.enum.menu, required: true },
    price_unit: { type: String, enum: config.model.enum.price, required: true },
    category: { type: String, ref: 'menucategories', required: true },
    author: { type: String, ref: 'user', required: true },
    image: { type: String, ref: 'images' },
    available: { type: Boolean, default: true, required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    menuSeq: Number,
});

//Can use
menuSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'menu',
    field: 'menuSeq'
});

menuSchema.pre('save', function (next) {
    this._id = config.model.id.menu + this.menuSeq;
    next();
});

module.exports = mongoose.model('menu', menuSchema);