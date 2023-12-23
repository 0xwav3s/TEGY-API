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
    getListMenu_GET: async function (req, res) {
        console.log("Get All Menu");
        let message = '';
        let filter = {};
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 20;
        db.Menu
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
                message = 'Successful get all Menu.';
                console.log(message)
                handler.buildResponse(req, res, data, message, true);
            })
    },
    getMenuById_GET: function (req, res) {
        let message = '';
        let id = req.params.id;
        db.Menu
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Success find Menu by id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, item, message, true);
            })
    },
    updateMenuById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        let modelName = 'Menu';
        db.updateItemById(modelName, id, body).then((result) => {
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' by ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    createMenu_POST: function (req, res) {
        var body = req.body;
        let modelName = 'Menu';
        db.createNewItem(modelName, body).then((result) => {
            db.MenuCategories.findById(result.category).exec((err, rs) => {
                rs.menu.push(result._id);
                rs.save((err) => {
                    if (err) throw err;
                    let message = 'Successful saved ' + modelName + ' ID: ' + result._id;
                    handler.buildResponse(req, res, result, message, true);
                })
            })
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    deleteMenu_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'Menu';
        db.removeItemById(modelName, id).then((message) => {
            console.log(message);
            handler.buildResponse(req, res, {}, message, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },

    getListMenuCategories_GET: function (req, res) {
        console.log("Get All Menu Categories");
        let message = '';
        let filter = {};
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 20;
        db.MenuCategories
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
                message = 'Successful get all Menu Categories.';
                console.log(message)
                handler.buildResponse(req, res, data, message, true);
            })
    },
    getMenuCategoriesById_GET: function (req, res) {
        let message = '';
        let id = req.params.id;
        db.MenuCategories
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Success find Menu Categories by id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, item, message, true);
            })
    },
    updateMenuCategoriesById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        let modelName = 'MenuCategories';
        db.updateItemById(modelName, id, body).then((result) => {
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' by ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    createMenuCategories_POST: function (req, res) {
        var body = req.body;
        let modelName = 'MenuCategories';
        db.createNewItem(modelName, body).then((result) => {
            console.log("Successful create new item: " + result);
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    deleteMenuCategories_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'MenuCategories';
        db.removeItemById(modelName, id).then((message) => {
            let object = {}
            object['category'] = id;
            db.Menu.deleteMany(object).exec((err) => {
                if (err) handler.buildResponse(req, res, {}, err, false);
                message += '. And delete many Menu from ' + modelName + ' by Id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, {}, message, true);
            })
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    }
};;
