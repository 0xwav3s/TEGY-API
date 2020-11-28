var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;

var counterSchema = mongoose.Schema({
    count: { type: Number, required: true },
    model: { type: String, required: true },
    field: { type: String, required: true },
});

module.exports = mongoose.model('identitycounters', counterSchema);