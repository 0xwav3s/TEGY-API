var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;
var Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

var artCatSchema = mongoose.Schema({
    _id: String,
    name: { type: String, required: true },
    description: String,
    available: { type: Boolean, default: true, required: true },
    author: { type: String, ref: 'user', required: true },
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    artcategoriesSeq: Number,
});

//Can use
artCatSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'artcategories',
    field: 'artcategoriesSeq'
});

artCatSchema.pre('save', function (next) {
    this._id = config.model.id.artcategories + this.artcategoriesSeq;
    next();
});

module.exports = mongoose.model('artcategories', artCatSchema);