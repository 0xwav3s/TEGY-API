var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var menuCatSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    description: String,
    available: { type: Boolean, default: true, required: true },
    menu: [{ type: String, ref: 'menu'}],
    author: { type: String, ref: 'user', required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    menucategoriesSeq: Number,
});

//Can use
menuCatSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'menucategories',
    field: 'menucategoriesSeq'
});

menuCatSchema.pre('save', function (next) {
    if (this._id) this._id = config.model.id.menucategories + this.menucategoriesSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('menucategories', menuCatSchema);