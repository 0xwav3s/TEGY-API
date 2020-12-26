

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
const log4js = require('../helper/logService');
const { resolve } = require('path');
const { rejects } = require('assert');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
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
                if (err) return handler.buildErrorRespose(req, res, err)
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
        let query = req.query;
        let id = req.params.id.split(',');
        let queryDbBill;
        try {
            if (!query.mode) {
                queryDbBill = await db.Bill.findById(id).populate('order');
                if (queryDbBill === null) throw ''
            } else {
                if (query.mode = 'multiple') {
                    queryDbBill = await db.Bill.find({ '_id': { $in: id } }).populate('order');
                    if (queryDbBill.length === 0) throw ''
                }
            }
            message = 'Success find Menu by id: ' + id;
            console.log(message)
            handler.buildResponse(req, res, queryDbBill, message, true);
        } catch (err) {
            return handler.buildErrorRespose(req, res, err);
        }
    },
    updateBillById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        let modelName = 'Bill';
        db.updateItemById(modelName, id, body).then((result) => {
            return handler.buildResponse(req, res, result, 'Successful saved ' + modelName + ' by ID: ' + result._id, true);
        }).catch((err) => {
            return handler.buildErrorRespose(req, res, err)
        });
    },
    deleteBillById_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'Bill';
        db.removeItemById(modelName, id).then((message) => {
            let object = {}
            object['order'] = id;
            db.Order.deleteMany(object).exec((err) => {
                if (err) return handler.buildErrorRespose(req, res, err);
                message += '. And delete many Order from ' + modelName + ' by Id: ' + id;
                console.log(message);
                return handler.buildResponse(req, res, {}, message, true);
            })
        }).catch((err) => {
            console.log(err);
            return handler.buildErrorRespose(req, res, err);
        });
    },
    insertNewBillToTable_POST: function (req, res) {
        let body = req.body;
        let tableId = body.table;
        let user = req.user;
        db.Table.findById(tableId).exec(async (err, table) => {
            if (err) return handler.buildErrorRespose(req, res, err);
            if (table.active === "Bảo trì") handler.buildResponse(req, res, {}, "Table " + table._id + " is maintain, you cannot insert for this table", false);
            insertOrderForBill(body, user).then((ordersList) => {
                let newBill = new db.Bill();
                let orders = ordersList.map((obj) => { return obj._id; }); //Get Id Array from Object Array
                // let orders = ordersList.filter((obj) => { return obj }).map((obj) => { return obj._id; });
                newBill.order = orders;
                newBill.author = user._id;
                newBill.total_price_order = body.total_price_order;
                newBill.table = tableId;
                newBill.save((err, rsNewBill) => {
                    if (err) return handler.buildErrorRespose(req, res, err);
                    table.currentBill.push(rsNewBill._id);
                    table.active = "Có khách";
                    table.updateTime = Date.now();
                    table.save((err, rsTable) => {
                        if (err) return handler.buildErrorRespose(req, res, err);
                        let result = {
                            table: rsTable,
                            newBill: rsNewBill
                        }
                        return handler.buildResponse(req, res, result, 'Successful saved Table with Id: ' + table._id + ' and Bill with Id: ' + rsNewBill._id, true);
                    })
                })

            }).catch((msg) => {
                return handler.buildResponse(req, res, {}, msg, false);
            })
        })
    },
    insertNewOrderForBill_POST: function (req, res) {
        let body = req.body;
        let billId = req.params.id;
        let user = req.user;
        db.Bill.findById(billId).populate('table').exec(async (err, bill) => {
            let table = bill.table;
            if (err) return handler.buildErrorRespose(req, res, err);
            if (table.active === "Bảo trì") handler.buildResponse(req, res, {}, "Table " + table._id + " is maintain, you cannot insert for this table", false);
            insertOrderForBill(body, user).then((ordersList) => {
                let totalNewOrder = 0;
                let orders = ordersList.map((obj) => {
                    totalNewOrder += obj.total;
                    return obj._id;
                });
                bill.order = [...bill.order, ...orders];
                bill.author = user._id;
                bill.total_price_order += totalNewOrder;
                bill.save((err, rsBill) => {
                    if (err) return handler.buildErrorRespose(req, res, err);
                    table.updateTime = Date.now();
                    table.save((err) => {
                        if (err) throw err;
                    })
                    let result = {
                        bill: rsBill,
                        newOrder: ordersList
                    }
                    return handler.buildResponse(req, res, result, 'Successful add new orders for Bill with Id: ' + rsBill._id, true);
                })

            }).catch((msg) => {
                return handler.buildResponse(req, res, {}, msg, false);
            })
        })
    },
    submitBill_POST: function (req, res, mode) {
        /**
         * mode is check is pay or cancel
         */
        let id = req.params.id;
        id = id.split(',');
        db.Bill.find({ '_id': { $in: id } }).populate('table').exec(async (err, bills) => {
            setAndValidateBills(bills, mode, req.body, err).then((result) => {
                let lastTable;
                let bills = result.bills;
                let i = 0;
                bills.map((bill) => {
                    bill.totalBills.total_price_bills = result.total_price_bills;
                    if ((result.money_give_by_cus || result.money_pay_for_cus) && mode === 'pay') {
                        bill.totalBills.money_give_by_cus = result.money_give_by_cus;
                        bill.totalBills.money_pay_for_cus = result.money_pay_for_cus;
                    }
                    let table = bill.table;
                    if (lastTable != table._id) {
                        lastTable = table._id;
                        table.active = "Trống";
                        table.currentBill = [];
                        table.updateTime = Date.now();
                        table.save((err) => {
                            if (err) return handler.buildErrorRespose(req, res, err)
                        })
                    }
                    bill.save((err) => {
                        if (err) return handler.buildErrorRespose(req, res, err)
                    })
                    if (++i === bills.length) {
                        return handler.buildResponse(req, res, result, 'Successful submit Bill with Id: ' + id, true);
                    }
                })
            }).catch((err) => {
                return handler.buildErrorRespose(req, res, err);
            })
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

function InvalidCompareTotalBetweenUIandAPI(totalUI, totalAPI, arg) {
    if (totalUI !== totalAPI) {
        let msg = 'Error: Total from UI [' + totalUI + '] != [' + totalAPI + '] Total from API'
        mailService.sendMail(config.mail.recieverError, 'Invalid caculation total From Ngoc Hai' + (arg) ? arg : "", msg);
        console.log(msg);
        return msg;
    }
    return false;
}

function setAndValidateBills(bills, mode, body, err) {
    return new Promise((resolve, rejects) => {
        let total_price_bills = 0;
        if (err || bills.length === 0) rejects(err);
        let i = 0;
        let arrObjBills = [];
        let arrIdBills = bills.map((x) => x._id); //Get array id bills
        for (var bill of bills) {
            if (bill.status !== 'Chưa thanh toán') rejects('Bill ' + bill._id + ' has been ' + ((mode === 'pay') ? 'submitted' : 'cancelled')); //If it is proccessed, not do it again.
            bill.timeOut = Date.now();
            bill.updateTime = Date.now();
            if (body.note) bill.note = body.note;
            total_price_bills += bill.total_price_order; //set total from api
            if (mode !== "pay") {
                bill.status = "Hủy";
            } else {
                bill.totalBills.isMultiple = (bills.length > 1) ? true : false;
                bill.status = "Đã thanh toán";
                bill.totalBills.ref_otherBills = (bills.length > 1) ? arrIdBills.filter((x) => x !== bill._id) : [];
            }
            arrObjBills.push(bill);
            if (++i === bills.length) {
                let result = {};
                if (mode === "pay") {
                    //Valid total price bills
                    let validTotal = InvalidCompareTotalBetweenUIandAPI(body.total_price_bills, total_price_bills)
                    if (validTotal) rejects(validTotal)
                    result.total_price_bills = total_price_bills;
                    if (body.money_give_by_cus || body.money_pay_for_cus) {
                        let calToCus = body.money_give_by_cus - total_price_bills;
                        //Valid total price money
                        let validTotal = InvalidCompareTotalBetweenUIandAPI(body.money_pay_for_cus, calToCus)
                        if (validTotal) rejects(validTotal)
                        result.money_give_by_cus = body.money_give_by_cus;
                        result.money_pay_for_cus = calToCus;
                    }
                    // if (body.tax_promotions) {

                    // }
                } else {
                    result.total_price_bills = 0;
                }
                result.bills = arrObjBills;
                resolve(result);
            }

        }
    })
}

function insertOrderForBill(body, user) {
    let orders = body.order;
    return new Promise(async (resolve, rejects) => {
        let menu = await db.Menu.find().select("_id");
        let orderList = [];
        let totalBill = 0;
        let i = 0;
        orders.map((order) => {
            if (menu.filter(e => e._id === order.menu).length > 0) {
                let newOrder = new db.Order(order);
                newOrder.author = user._id;
                let totalOrder = order.price * order.amount;
                totalBill += totalOrder;
                let validTotal = InvalidCompareTotalBetweenUIandAPI(order.total, totalOrder)
                if (validTotal)
                    rejects(validTotal);
                newOrder.save((err, rsNewOrder) => {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '');
                        rejects(err.stack);
                    }
                    orderList.push(rsNewOrder);
                    if (++i === orders.length) {
                        let validTotal = InvalidCompareTotalBetweenUIandAPI(body.total_price_order, totalBill, 'Bill has order Id: ' + rsNewOrder._id);
                        if (validTotal)
                            rejects(validTotal);
                        resolve(orderList);
                    }
                })
            } else {
                msgInvalid += order.menu + ' invalid ( not exist in menu)';
                rejects(msgInvalid);
            }
        })
    })
}