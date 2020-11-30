

let config = require('config');
let db = require('../helper/dbHelper');
let helper = require('../helper/utils');
let notify = require('../helper/notifyFunction');

const handler = require('../core/handler/tegyHandler');
const mailService = require('../helper/mailService');

let endpointAccount = config.get('endpoint').account;
let dirPage = 'admin/pages/dashboard/table/';
let endpoint = config.get('endpoint').dashboard;

let limitPage = 7;
let limitPagination = 5;

module.exports = {
    viewTable_GET: function (req, res) {
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
    viewTableById_GET: function (req, res) {
        let id = req.params.id;
        db.Table
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    handler.buildResponse(req, res, {}, err.message, false);
                }
                handler.buildResponse(req, res, item, 'Success find table by id: ' + id, true);
            })
    },
    viewAllTable_GET: function (req, res) {
        var filter = {};
        var page = (req.query.page) ? req.query.page - 1 : 0;
        db.Table
            .find(filter)
            .sort({ updateTime: "desc" })
            .limit(limitPage)
            .skip(limitPage * page)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    return res.redirect(endpointAccount.logout);
                }
                db.Table.countDocuments(filter).exec(function (errCount, count) {
                    // var count = item.count;
                    if (errCount) {
                        console.log(errCount)
                        return res.redirect(endpointAccount.logout);
                    }
                    var pageSize = Math.ceil(count / limitPage);    //Làm tròn số lớn
                    var pageCur = page + 1;
                    var firstPage = (pageCur > limitPagination) ? pageCur - limitPagination : 1;
                    var widthPage = pageSize - pageCur;
                    var lastPage = (widthPage > limitPagination) ? pageCur + limitPagination : pageCur + widthPage;
                    return res.render(dirPage + 'viewAllTable.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        user: req.user,
                        data: items,
                        message: req.flash('tableMessage'),
                        page: pageCur,
                        firstPage: firstPage,
                        lastPage: lastPage
                    });
                })
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
    editTable_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        db.patchItemById('Table', id, body).then((result) => {
            handler.buildResponse(req, res, result, 'Successful saved table ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    createTable_GET: async function (req, res) {
        var zone = await db.Zone.find();
        return res.render(dirPage + 'detailTable.ejs', {
            helper: helper,
            endpoint: endpoint,
            endpointAccount: endpointAccount,
            message: req.flash('tableMessage'),
            zone: zone,
            active: config.model.enum.active,
            user: req.user,
            action: endpoint.action.create,
            item: false
        });
    },
    createTable_POST: function (req, res) {
        var body = req.body;
        new Promise((resolve) => {
            var item = new db.Table();
            item.available = (body.available) ? true : false;
            item.name = body.name;
            item.description = body.description;
            item.active = body.active;
            item.zone = body.zone;
            item.author = req.user._id;
            item.save((err) => {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    notify.sendMessageByFlash(req, 'tableMessage', 'Không thể lưu thông tin mới !');
                } else {
                    notify.sendMessageByFlashType(req, 'tableMessage', 'success', 'Lưu thông tin mới thành công!');
                }
                resolve();
            })
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    deleteTable_POST: function (req, res) {
        new Promise((resolve) => {
            var id = req.query.id;
            db.Table.remove({ _id: id }, function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    notify.sendMessageByFlash(req, 'tableMessage', 'Không thể lưu thông tin mới !');
                } else {
                    notify.sendMessageByFlashType(req, 'tableMessage', 'success', 'Xóa mục ' + id + ' mới thành công!');
                }
                resolve();
            });
        }).then(() => {
            return res.redirect('..' + endpoint.table.table + endpoint.subPath);
        })
    },

    viewAllZone_GET: function (req, res) {
        var filter = {};
        var page = (req.query.page) ? req.query.page - 1 : 0;
        db.Zone
            .find(filter)
            .sort({ updateTime: "desc" })
            .limit(limitPage)
            .skip(limitPage * page)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    return res.redirect(endpointAccount.logout);
                }
                db.Zone.countDocuments(filter).exec(function (errCount, count) {
                    // var count = item.count;
                    if (errCount) {
                        console.log(errCount)
                        return res.redirect(endpointAccount.logout);
                    }
                    var pageSize = Math.ceil(count / limitPage);    //Làm tròn số lớn
                    var pageCur = page + 1;
                    var firstPage = (pageCur > limitPagination) ? pageCur - limitPagination : 1;
                    var widthPage = pageSize - pageCur;
                    var lastPage = (widthPage > limitPagination) ? pageCur + limitPagination : pageCur + widthPage;
                    return res.render(dirPage + 'viewZone.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        user: req.user,
                        data: items,
                        message: req.flash('zoneMessage'),
                        page: pageCur,
                        firstPage: firstPage,
                        lastPage: lastPage
                    });
                })
            })
    },
    editZone_GET: function (req, res) {
        var query = req.query;
        if (query.id) {
            db.Zone.findById(query.id, function (err, item) {
                if (item) {
                    return res.render(dirPage + 'detailZone.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        message: req.flash('zoneMessage'),
                        user: req.user,
                        item: item,
                        action: endpoint.action.edit
                    });
                } else {
                    notify.sendMessageByFlash(req, 'zoneMessage', 'Something Wrong ! Please contact admin for help.')
                    return res.redirect('.' + endpoint.table.zone);
                }
            });
        } else {
            notify.sendMessageByFlash(req, 'loginMessage', 'Something Wrong ! Please contact admin for help.')
            return res.redirect(endpointAccount.logout);
        }
    },
    editZone_POST: function (req, res) {
        var body = req.body;
        new Promise((resolve) => {
            db.Zone.findById(body.idZone, function (err, item) {
                item.available = (body.available) ? true : false;
                item.name = body.nameZone;
                item.description = body.description;
                item.author = req.user._id;
                item.updateTime = Date.now();
                item.save((err) => {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                        console.log(err)
                        notify.sendMessageByFlash(req, 'zoneMessage', 'Không thể lưu thông tin mới !');
                    } else {
                        notify.sendMessageByFlashType(req, 'zoneMessage', 'success', 'Lưu thông tin mới thành công!');
                    }
                    resolve();
                })
            });
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    createZone_GET: function (req, res) {
        return res.render(dirPage + 'detailZone.ejs', {
            helper: helper,
            endpoint: endpoint,
            endpointAccount: endpointAccount,
            message: req.flash('zoneMessage'),
            user: req.user,
            action: endpoint.action.create,
            item: false
        });
    },
    createZone_POST: function (req, res) {
        var body = req.body;
        new Promise((resolve) => {
            var item = new db.Zone();
            item.available = (body.available) ? true : false;
            item.name = body.nameZone;
            item.description = body.description;
            item.author = req.user._id;
            item.save((err) => {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    notify.sendMessageByFlash(req, 'zoneMessage', 'Không thể lưu thông tin mới !');
                } else {
                    notify.sendMessageByFlashType(req, 'zoneMessage', 'success', 'Lưu thông tin mới thành công!');
                }
                resolve();
            })
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    deleteZone_POST: function (req, res) {
        new Promise((resolve) => {
            var id = req.query.id;
            db.Zone.remove({ _id: id }, function (err) {
                if (!err) {
                    db.Table.remove({ 'zone': id }, function (err, items) {
                        if (err) {
                            mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                            console.log(err)
                            notify.sendMessageByFlash(req, 'zoneMessage', 'Không thể lưu thông tin mới !');
                        } else {
                            notify.sendMessageByFlashType(req, 'zoneMessage', 'success', 'Xóa mục ' + id + ' và ' + JSON.stringify(items) + ' mới thành công!');
                        }
                        resolve();
                    })
                }
                else {
                    notify.sendMessageByFlash(req, 'zoneMessage', 'Không thể lưu thông tin mới !');
                    resolve();
                }
            })
        }).then(() => {
            return res.redirect('..' + endpoint.table.zone);
        })
    }
};;
