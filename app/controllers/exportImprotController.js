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
    updateExportImportById_PATCH: async function (req, res) {
        // let body = req.body;
        // let id = req.params.id;
        // let model = 'Export_Import';
        // let eiItem = await db.Export_Import.findById(id);
        // let item = await db.Item.findById(eiItem.item);

        // let calAmount = (body.amount) ? body.amount - eiItem.amount : 0;
        // item.amount += calAmount;
        // let currentEIItemAmount = eiItem.amount;
        // handler.buildResponse(req, res, {}, item.amount, true);
        handler.buildResponse(req, res, {}, "We are not support this method", true);
        // return new Promise((resolve, rejects) => {
        //     db.Item.findById(eiItem.item, function (err, item) {
        //         if (err) rejects(err);
        //         if (!item) rejects('Can not find Item by Id: ' + eiItem.item);
        //         eiItem = db.setPropertyForModel(eiItem, body);
        //         if (eiItem.constructor.modelName) {
        //             eiItem.save((err, rs) => {
        //                 if (err) {
        //                     mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
        //                     console.log(err)
        //                     rejects(err);
        //                 } else {
        //                     resolve(rs);
        //                 }
        //             })
        //         } else {
        //             rejects(item);
        //         }
        //     });
        // }).then((result) => {
        //     console.log(result);
        //     handler.buildResponse(req, res, result, 'Successful saved ' + model + ' by ID: ' + result._id, true);
        // }).catch((err) => {
        //     handler.buildResponse(req, res, {}, err, false);
        // });
    },
    createExportImport_POST: function (req, res) {
        var body = req.body;
        let modelName = 'Export_Import';
        db.createNewItem(modelName, body).then((result) => {
            console.log("Successful create new item: " + result);
            updateAmount(body).then(() => {
                handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' ID: ' + result._id, true);
            }).catch((err) => {
                handler.buildResponse(req, res, {}, err, false);
            })
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    deleteExportImport_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'Export_Import';
        return new Promise((resolve, rejects) => {
            let message = '';
            db.Export_Import.findByIdAndRemove({ _id: id }, async function (err, rs) {
                if (err) rejects(err);
                else if (!rs) rejects(modelName + ' by ID: ' + id + ' not exists.')
                else {
                    message += 'Succsessful remove ' + modelName + ' by ID: ' + id;
                    console.log(message);
                    let reverse = (rs.export_import === "IMPORT") ? "EXPORT" : "IMPORT";
                    updateAmount({ "export_import": reverse, "amount": rs.amount, "item": rs.item }).then(() => {
                        resolve(message);
                    }).catch((err) => {
                        resolve(message);
                    })
                }
            });
        }).then((message) => {
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


function updateAmount(body) {
    let itemId = body.item;
    return new Promise((resolve, reject) => {
        db.Item.findById(itemId).exec(function (err, item) {
            if (err) {
                mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                console.log(err)
                message = err.message;
                reject(err);
            } else {
                switch (body.export_import) {
                    case "IMPORT":
                        item.amount += body.amount;
                        break;
                    case "EXPORT":
                        item.amount -= body.amount;
                        break;
                    default:
                }
                item.amount = (item.amount <= 0) ? 0 : item.amount;
                item.save(function (err) {
                    if (err) {
                        console.log(err)
                        reject(err);
                    }
                    console.log("Updated item " + itemId);
                    resolve();
                });
            }
        })
    })
}