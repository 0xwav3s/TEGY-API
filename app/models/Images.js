var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;

var imageUpload = mongoose.Schema({
    imageName: {
        type: String,
        required: true
    },
    cloudImage: {
        type: String,
        required: true
    },
    imageId: {
        type: String,
        required: true
    },
    post_date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('images', imageUpload)