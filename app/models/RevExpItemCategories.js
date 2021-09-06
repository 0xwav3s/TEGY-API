var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var RevExpItemCatSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    description: String,
    available: { type: Boolean, default: true, required: true },
    author: { type: String, ref: 'user', required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    rev_exp_item_categoriesSeq: Number,
});

//Can use
RevExpItemCatSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'rev_exp_item_categories',
    field: 'rev_exp_item_categoriesSeq'
});

RevExpItemCatSchema.pre('save', function (next) {
    this._id = config.model.id.rev_exp_item_categories + this.rev_exp_item_categoriesSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('rev_exp_item_categories', RevExpItemCatSchema);