var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;

var articleSchema = mongoose.Schema({
    _id: String,
    title: { type: String, required: true },
    content: { type: String, required: true },
    available: { type: Boolean, default: true, required: true },
    keywords: String,
    category: { type: String, ref: 'artcategories', required: true },
    author: { type: String, ref: 'user', required: true },
    image: [{ type: String, ref: 'images'}],
    createTime: { type: Date, default: Date.now(), required: true },
    updateTime: { type: Date, default: Date.now(), required: true },
    articleSeq: Number,
});

//Can use
articleSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'articles',
    field: 'articleSeq'
});

articleSchema.pre('save', function (next) {
    this._id = config.model.id.articles + this.articleSeq;
    next();
});

module.exports = mongoose.model('articles', articleSchema);