const config = require('config');
const db = require('../helper/dbHelper');

const handler = require('../core/handler/tegyHandler');
const mailService = require('../helper/mailService');


const path = require('path');
var scriptName = path.basename(__filename).split(".");
const name = scriptName[0];
const log4js = require('../helper/logService');
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);
console.log("Start " + name);

module.exports = {
    getTable_GET: function (req, res) {
        var filter = {};
        var active = config.model.enum.active;
        db.Table
            .find(filter)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    handler.buildResponse(req, res, {}, err.message, false);
                }
                handler.buildResponse(req, res, items, req.flash('tableMessage')[1], true);
            })
    },
    getTableById_GET: function (req, res) {
        let message = '';
        let id = req.params.id;
        db.Table
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Success find table by id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, item, message, true);
            })
    },
    getAllTable_GET: function (req, res) {
        console.log("Get All Table");
        let message = '';
        let filter = {};
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 20;
        db.Table
            .find(filter)
            .sort({ updateTime: "desc" })
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
                message = 'Successful get all zone.';
                console.log(message)
                handler.buildResponse(req, res, data, message, true);
            })
    },
    // editTable_GET: function (req, res) {
    //     var query = req.query;
    //     if (query.id) {
    //         db.Table.findById(query.id, async function (err, item) {
    //             var zone = await db.Zone.find();
    //             if (item) {
    //                 return res.render(dirPage + 'detailTable.ejs', {
    //                     helper: helper,
    //                     endpoint: endpoint,
    //                     endpointAccount: endpointAccount,
    //                     message: req.flash('tableMessage'),
    //                     user: req.user,
    //                     item: item,
    //                     zone: zone,
    //                     active: config.model.enum.active,
    //                     action: endpoint.action.edit
    //                 });
    //             } else {
    //                 notify.sendMessageByFlash(req, 'tableMessage', 'Something Wrong ! Please contact admin for help.')
    //                 return res.redirect('./' + endpoint.action.view);
    //             }
    //         });
    //     } else {
    //         notify.sendMessageByFlash(req, 'loginMessage', 'Something Wrong ! Please contact admin for help.')
    //         return res.redirect(endpointAccount.logout);
    //     }
    // },
    updateTableById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        db.updateItemById('Table', id, body).then((result) => {
            let message = 'Successful saved table ID: ' + result._id;
            handler.buildResponse(req, res, result, message, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    // createTable_GET: async function (req, res) {
    //     var zone = await db.Zone.find();
    //     return res.render(dirPage + 'detailTable.ejs', {
    //         helper: helper,
    //         endpoint: endpoint,
    //         endpointAccount: endpointAccount,
    //         message: req.flash('tableMessage'),
    //         zone: zone,
    //         active: config.model.enum.active,
    //         user: req.user,
    //         action: endpoint.action.create,
    //         item: false
    //     });
    // },
    createTable_POST: function (req, res) {
        var body = req.body;
        let modelName = 'Table';
        db.createNewItem(modelName, body).then((result) => {
            db.Zone.findById(result.zone).exec((err, rs) => {
                rs.table.push(result._id);
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
    deleteTable_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'Table';
        db.removeItemById(modelName, id).then((message) => {
            console.log(message);
            handler.buildResponse(req, res, {}, message, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    getAllZone_GET: function (req, res) {
        console.log("Get All Zone");
        let message = '';
        let filter = {};
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 20;
        db.Zone
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
                message = 'Successful get all zone.';
                console.log(message)
                handler.buildResponse(req, res, data, message, true);
            })
    },
    getZoneById_GET: function (req, res) {
        let message = '';
        let id = req.params.id;
        db.Zone
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Success find table by id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, item, message, true);
            })
    },
    updateZoneById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        let modelName = 'Zone';
        db.updateItemById(modelName, id, body).then((result) => {
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' by ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    // createZone_GET: function (req, res) {
    //     return res.render(dirPage + 'detailZone.ejs', {
    //         helper: helper,
    //         endpoint: endpoint,
    //         endpointAccount: endpointAccount,
    //         message: req.flash('zoneMessage'),
    //         user: req.user,
    //         action: endpoint.action.create,
    //         item: false
    //     });
    // },
    createZone_POST: function (req, res) {
        var body = req.body;
        let modelName = 'Zone';
        db.createNewItem(modelName, body).then((result) => {
            console.log("Successful create new item: " + result);
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    deleteZoneById_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'Zone';
        db.removeItemById(modelName, id).then((message) => {
            let object = {}
            object[modelName.toLowerCase()] = id;
            db.Table.deleteMany(object).exec((err) => {
                if (err) handler.buildResponse(req, res, {}, err, false);
                message += '. And delete many Table from ' + modelName + ' by Id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, {}, message, true);
            })
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    }
};;
