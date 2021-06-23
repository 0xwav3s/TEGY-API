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
    getListExportImport_GET: async function (req, res) {
        console.log("Get All Export Import");
        let message = '';
        let filter = {};
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 20;
        db.Export_Import
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
                message = 'Successful get all Export Import.';
                console.log(message)
                handler.buildResponse(req, res, data, message, true);
            })
    },
    getExportImportById_GET: function (req, res) {
        let message = '';
        let id = req.params.id;
        db.Export_Import
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Success find Export_Import by id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, item, message, true);
            })
    },
    updateExportImportById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        let modelName = 'Export_Import';
        db.updateItemById(modelName, id, body).then((result) => {
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' by ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    createExportImport_POST: function (req, res) {
        var body = req.body;
        let modelName = 'Export_Import';
        db.createNewItem(modelName, body).then((result) => {
            console.log("Successful create new item: " + result);
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' ID: ' + result._id, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    deleteExportImport_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'Export_Import';
        db.removeItemById(modelName, id).then((message) => {
            console.log(message);
            handler.buildResponse(req, res, {}, message, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },

    getListSupplier_GET: function (req, res) {
        console.log("Get All Supplier");
        let message = '';
        let filter = {};
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 20;
        db.Supplier
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
                message = 'Successful get all Supplier.';
                console.log(message)
                handler.buildResponse(req, res, data, message, true);
            })
    },
    getSupplierById_GET: function (req, res) {
        let message = '';
        let id = req.params.id;
        db.Supplier
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Success find Supplier by id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, item, message, true);
            })
    },
    updateSupplierById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        let modelName = 'Supplier';
        db.updateItemById(modelName, id, body).then((result) => {
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' by ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    createSupplier_POST: function (req, res) {
        var body = req.body;
        let modelName = 'Supplier';
        db.createNewItem(modelName, body).then((result) => {
            console.log("Successful create new item: " + result);
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    deleteSupplier_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'Supplier';
        db.removeItemById(modelName, id).then((message) => {
            let object = {}
            object['category'] = id;
            db.Export_Import.deleteMany(object).exec((err) => {
                if (err) handler.buildResponse(req, res, {}, err, false);
                message += '. And delete many Export_Import from ' + modelName + ' by Id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, {}, message, true);
            })
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    }
};;
