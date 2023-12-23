const config = require('config');
const db = require('../helper/dbHelper');
const handler = require('../core/handler/tegyHandler');

const path = require('path');
var scriptName = path.basename(__filename).split(".");
const name = scriptName[0];
const log4js = require('../helper/logService');
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);
console.log("Start " + name);

module.exports = {
    getListItem_GET: async function (req, res) {
        console.log("Get All Item");
        let message = '';
        let filter = {};
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 20;
        db.Item
            .find(filter)
            // .sort({ menuSeq: "asc" })
            // .populate('category')
            .limit(limit)
            .skip(limit * page)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                let data = {
                    limit: limit,
                    page: page,
                    items: items
                }
                message = 'Successful get all Item.';
                console.log(message)
                handler.buildResponse(req, res, data, message, true);
            })
    },
    getItemById_GET: function (req, res) {
        let message = '';
        let id = req.params.id;
        db.Item
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Success find Item by id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, item, message, true);
            })
    },
    updateItemById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        let modelName = 'Item';
        db.updateItemById(modelName, id, body).then((result) => {
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' by ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    createItem_POST: function (req, res) {
        var body = req.body;
        let modelName = 'Item';
        db.createNewItem(modelName, body).then((result) => {
            console.log("Successful create new item: " + result);
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' ID: ' + result._id, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    deleteItem_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'Item';
        db.removeItemById(modelName, id).then((message) => {
            console.log(message);
            handler.buildResponse(req, res, {}, message, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },

    getListItemCategories_GET: function (req, res) {
        console.log("Get All Item Categories");
        let message = '';
        let filter = {};
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 20;
        db.ItemCategories
            .find(filter)
            .sort({ updateTime: "desc" })
            .limit(limit)
            .skip(limit * page)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message
                    handler.buildResponse(req, res, {}, message, false);
                }
                let data = {
                    limit: limit,
                    page: page,
                    items: items
                }
                message = 'Successful get all Item Categories.';
                console.log(message)
                handler.buildResponse(req, res, data, message, true);
            })
    },
    getItemCategoriesById_GET: function (req, res) {
        let message = '';
        let id = req.params.id;
        db.ItemCategories
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Success find Item Categories by id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, item, message, true);
            })
    },
    updateItemCategoriesById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        let modelName = 'ItemCategories';
        db.updateItemById(modelName, id, body).then((result) => {
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' by ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    createItemCategories_POST: function (req, res) {
        var body = req.body;
        let modelName = 'ItemCategories';
        db.createNewItem(modelName, body).then((result) => {
            console.log("Successful create new item: " + result);
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    deleteItemCategories_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'ItemCategories';
        db.removeItemById(modelName, id).then((message) => {
            let object = {}
            object['category'] = id;
            db.Item.deleteMany(object).exec((err) => {
                if (err) handler.buildResponse(req, res, {}, err, false);
                message += '. And delete many Item from ' + modelName + ' by Id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, {}, message, true);
            })
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    }
};;
