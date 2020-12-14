

const config = require('config');
const db = require('../helper/dbHelper');
const helper = require('../helper/utils');
const print = require('../helper/printServices/printServices');
const notify = require('../helper/notifyFunction');
const mailService = require('../helper/mailService');
const handler = require('../core/handler/tegyHandler');

// const log4js = require("log4js");
// var fileLog = "log-" + helper.formatDateNotHours(new Date()).replace(new RegExp('/', 'g'), "-") + ".log";
// log4js.configure({
//     appenders: {
//         newBill: { type: "file", filename: "logs/newBill/" + fileLog }
//     },
//     categories: { default: { appenders: ["newBill"], level: "ALL" } }
// });

const endpointAccount = config.get('endpoint').account;
const dirPage = 'admin/pages/dashboard/bill/';
const endpoint = config.get('endpoint').dashboard;
// let cloud = require('../helper/cloudinaryService');

const path = require('path');
var scriptName = path.basename(__filename).split(".");
const name = scriptName[0];
const log4js = require('../helper/logService')
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);
console.log("Start " + name);

let limitPage = 20;
let limitPagination = 5;
module.exports = {
    getAllBill_GET: function (req, res) {
        console.log("Get All Menu");
        var from = helper.getEndDate(req.query.from);
        var to = helper.getStartDate(req.query.to);
        var filter = {};
        filter.createTime = { "$gte": from, "$lt": to };
        var statusBill = req.query.statusBill;
        switch (statusBill) {
            case config.model.enum.bill[1]:
                filter.status = config.model.enum.bill[1];
                break;
            case config.model.enum.bill[2]:
                filter.status = config.model.enum.bill[2];
                break;
            case config.model.enum.bill[0]:
                filter.status = config.model.enum.bill[0];
                break;
            default:
        }
        let page = (req.query.page) ? parseInt(req.query.page) : 0;
        let limit = (req.query.limit) ? parseInt(req.query.limit) : 20;
        db.Bill
            .find(filter)
            .sort({ updateTime: "desc" })
            .populate('table')
            .populate('order')
            .populate('user')
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
                    page: page,
                    from: from,
                    to: to,
                    items: items
                }
                message = 'Successful get all Menu.';
                console.log(message)
                handler.buildResponse(req, res, data, message, true);
            })
    },
    getBillById_GET: async function (req, res) {
        let message = '';
        let id = req.params.id;
        db.Bill
            .findOne({ _id: id })
            .populate('order')
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
    updateBillById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        let modelName = 'Bill';
        db.updateItemById(modelName, id, body).then((result) => {
            handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' by ID: ' + result._id, true);
        }).catch((err) => {
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    submitBill_POST: function (req, res) {
        new Promise(async (resolve) => {
            console.log(req.body)
            var id = req.query.id;
            id = id.split(',');
            db.Bill.find({ '_id': { $in: id } }).populate('table').exec(async (err, bills) => {
                for (var bill of bills) {
                    bill.status = config.model.enum.bill[1];
                    bill.timeOut = Date.now();
                    await bill.save((err) => {
                        if (err) {
                            mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                            console.log(err);
                        }
                    })
                }
                var table = bills[0].table;
                table.active = config.model.enum.active[1];
                table.currentBill = '';
                table.save((err) => {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                        console.log(err);
                    }
                    notify.sendMessageByFlashType(req, 'tableMessage', 'success', 'Bàn ăn ' + table.name + ' lưu thông tin mới thành công!');
                    resolve();
                })
            })
        }).then(() => {
            return res.redirect('..' + endpoint.table.table + '/' + endpoint.action.list);
        })
    },
    cancelBill_POST: function (req, res) {
        new Promise((resolve) => {
            var id = req.query.id;
            id = id.split(',');
            var note = req.body.noteCancel;
            db.Bill.find({ '_id': { $in: id } }).populate('table').populate('order').exec(async (err, bills) => {
                for (var bill of bills) {
                    for (var order of bill.order) {
                        if (order.status != config.model.enum.order[3]) {
                            order.status = config.model.enum.order[3];
                            await order.save(err => {
                                if (err) {
                                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                                    console.log(err);
                                }
                                resolve();
                            })
                        }
                    }
                    bill.status = config.model.enum.bill[2];
                    bill.note = note;
                    bill.total_price_order = 0;
                    bill.timeOut = Date.now();
                    await bill.save((err) => {
                        if (err) {
                            mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                            console.log(err);
                        }
                        // loggerNewBill.info("Cancel Bill: " + bill)
                    })
                }
                var table = bills[0].table;
                notify.sendMessageByFlashType(req, 'tableMessage', 'success', 'Hóa đơn ở bàn ' + table.name + ' đã được hủy !');
                table.active = config.model.enum.active[1];
                table.currentBill = '';
                await table.save((err) => {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                        console.log(err);
                    }
                    resolve();
                })
            })
        }).then(() => {
            return res.redirect('..' + endpoint.table.table + '/' + endpoint.action.list);
        })
    },
    cancelOrder_POST: function (req, res) {
        var idOrder = req.body.idOrder;
        var idBill = req.body.idBill;
        var noteCancel = req.body.noteCancel;
        new Promise(async (resolve) => {
            await db.Order.findById(idOrder).exec(async (err, order) => {
                await db.Bill.findById(idBill).exec((err, bill) => {
                    var minus = bill.total_price_order - order.total;
                    bill.total_price_order = (minus <= 0) ? 0 : minus;
                    bill.save(errB => {
                        if (errB) console.log(errB);
                        order.status = config.model.enum.order[3];
                        order.note = (order.note) ? order.note + ' Cancel: ' + noteCancel : ' Cancel: ' + noteCancel;
                        order.save(err => {
                            if (err) {
                                mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                                console.log(err);
                            }
                            // loggerNewBill.info("Cancel order: " + order + " in Bill: " + bill)
                            resolve();
                        })
                    })
                })
            })
        }).then(() => {
            notify.sendMessageByFlashType(req, 'orderMessage', 'success', 'Order đã được hủy !');
            return res.redirect(req.body.urlBack);
        })
    },
    makeOrderHasTable_GET: async function (req, res) {
        var action = (req.query.action) ? req.query.action : false;
        var table = await db.Table.findById(req.query.id).populate('zone');
        var menu = await db.Menu.find();
        var category = await db.MenuCategories.find();
        var bill = (table.currentBill) ? await db.Bill.find({ '_id': { $in: table.currentBill } }).populate('order') : false;
        return res.render(dirPage + 'detailMakeOrder2.ejs', {
            helper: helper,
            endpoint: endpoint,
            endpointAccount: endpointAccount,
            user: req.user,
            menu: menu,
            category: category,
            table: table,
            bill: bill,
            price_unit: config.model.enum.price,
            unit: config.model.enum.menu,
            active: config.model.enum.active,
            action: action,
            url: req.originalUrl,
            message: req.flash('orderMessage')
        });
    },
    makeOrderHasTable_POST: function (req, res) {
        var body = req.body;
        var id = req.query.id;
        new Promise((resolve) => {
            db.Table.findOne({ name: body.tableOrder, _id: id }).exec(async function (err, table) {
                var author = req.user.local.fullname
                createMakeOrders(body, author).then((orders) => {
                    if (orders.length === 0) {
                        notify.sendMessageByFlashType(req, 'tableMessage', 'danger', 'Chưa có món nào được chọn !');
                        resolve();
                    } else {
                        createNewBill(orders, author, table).then((newBill) => {
                            print.printText({
                                'table': table.name,
                                'id': newBill._id,
                                'author': author,
                                'orders': orders
                            }).then((rs) => {
                                if (rs) {
                                    notify.sendMessageByFlashType(req, 'tableMessage', 'success', 'Món ăn bàn ' + table.name + ' đã được in vào trong bếp !');
                                } else {
                                    notify.sendMessageByFlashType(req, 'tableMessage', 'danger', 'Cảnh báo: Món ăn bàn ' + table.name + ' in lỗi !');
                                }
                            })
                            if ((table.active === config.model.enum.active[0]) && (table.currentBill != newBill._id)) {
                                table.currentBill.push(newBill._id);
                            } else {
                                table.currentBill = newBill._id;
                            }
                            table.active = config.model.enum.active[0];
                            table.updateTime = Date.now();
                            table.save((err, result) => {
                                if (err) {
                                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                                    console.log(err)
                                } else {
                                    console.log(result)
                                    resolve(result);
                                }
                            });
                        });
                    }
                })
            });
        }).then(() => {
            return res.redirect('..' + endpoint.table.table + '/' + endpoint.action.list);
        })
    }
}

function createNewBill(orders, author, table) {
    return new Promise(async (resolve) => {
        if (table.currentBill[0]) {
            var existBill = await db.Bill.findById(table.currentBill);
            for (var i in orders) {
                await existBill.order.push(orders[i]._id);
                existBill.total_price_order += orders[i].total;
            }
            existBill.save((err, rs) => {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err);
                }
                // loggerNewBill.info('Save exist Bill: ' + rs)
                resolve(rs);
            })
        } else {
            var newBill = new db.Bill();
            newBill.author = author;
            newBill.table = table._id;
            newBill.total_price_order = 0;
            newBill.timeIn = Date.now();
            for (var order of orders) {
                newBill.order.push(order._id)
                newBill.total_price_order += order.total;
            }
            await newBill.save((err) => {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err);
                }
                // loggerNewBill.info('Save new Bill: ' + newBill)
                resolve(newBill);
            })
        }
    })
}

async function createMakeOrders(body, author) {
    var amountArray = [];
    var modelOrder = []
    return new Promise(async (resolve) => {
        for (var element in body) {
            if (element.includes('amount_')) {
                var res = element.split("amount_")[1].split("_");
                var ob = new db.Order();
                ob.amount = body[element];
                ob.menu = res[0];
                amountArray.push(ob);
            }
        }
        var i = 0;
        var count = amountArray.length;
        if (count === 0) resolve(modelOrder);
        for (var ob of amountArray) {
            for (var element in body) {
                if (element.includes(ob.menu + '_value')) {
                    if (element.includes('price_')) {
                        ob.price = body[element];
                        ob.total = ob.amount * body[element];
                    } else if (element.includes('note') && (body[element])) {
                        ob.note = body[element];
                    }
                }
            }
            ob.author = author;
            await ob.save(function (err, result) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err);
                }
                else {
                    modelOrder.push(result);
                    if (++i === count) {
                        resolve(modelOrder);
                    }
                }
            })
        }
    })
}
