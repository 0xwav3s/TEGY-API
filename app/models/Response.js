var config = require('config');
var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var Schema = mongoose.Schema;

var responseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    seftHref: {
        href: {
            type: String,
            required: true
        },
        method: {
            type: String,
            enum:[
                'GET',
                'POST',
                'PATCH',
                'DELETE'
            ],
            required: true
        },
        status: {
            type: String,
            enum:[
                'SUCCESS',
                'FAILED'
            ],
            required: true
        },
        message: {
            type: String,
        },
        collection: {
            type: Boolean,
        },
        data: {
            type: Object,
            required: true
        }
    },
    _links: {
        type: Object,
        required: true
    },
    _options: {
        type: Object,
        required: true
    },
});


module.exports = mongoose.model('response', responseSchema);