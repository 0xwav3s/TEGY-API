

let config = require('config');
let db = require('../helper/dbHelper');
let caculate = require('../helper/accountant/caculate');
let helper = require('../helper/utils');
const handler = require('../core/handler/tegyHandler');

module.exports = {

    viewOverReport_GET: async function (req, res) {
        var to = helper.getStartDate(req.query.to);
        var from = helper.getEndDate(req.query.from);
        var betWDay = to.getDate() - from.getDate();
        betWDay = (betWDay === 0) ? 1 : betWDay;
        var day = req.query.day;
        day = (day) ? day : betWDay;
        getDataOverView(to, from, day).then(dataOver => {
            console.log(dataOver)
            return handler.buildResponse(req, res, dataOver, "Success get report over view !", true);
        }).catch(err => {
            return handler.buildErrorResponse(req, res, err);
        })
    }
}

function getDataOverView(to, from, day) {
    var data = {
        'inMonth': {},
        'lastMonth': {},
        'cal': {},
        'pieChart': []
    };
    return new Promise(async (resolve, rejects) => {
        try {
            var lastStartDate = new Date(from);
            var lastEndDate = new Date(from);
            lastEndDate.setDate(lastEndDate.getDate() - day);
            lastEndDate.setHours(00, 00, 00, 00);
            console.log("to:" + to)
            console.log("from:" + from)
            console.log("lastStartDate:" + lastStartDate)
            console.log("lastEndDate:" + lastEndDate)
            var billsInMonth = await db.Bill.find({ 'timeIn': { "$gte": from, "$lt": to } }).populate('order');
            data.inMonth.total = billsInMonth.length;
            data.inMonth.revenue = 0;
            for (var i in config.model.enum.bill) {
                data.inMonth[config.model.enum.bill[i]] = 0;
                data.lastMonth[config.model.enum.bill[i]] = 0;
            }
            // var ill = 1;
            var topProduct = [];
            await Promise.all(billsInMonth.map(async (elem) => {
                // console.log(ill+": "+elem._id)
                // ill++;
                if (elem.status === config.model.enum.bill[1]) {
                    data.inMonth.revenue += elem.total_price_order;
                    topProduct = await getTopProduct(elem.order, topProduct);
                } else {
                    // console.log(elem.status)
                }
                for (var i in config.model.enum.bill) {
                    data.inMonth[config.model.enum.bill[i]] += (elem.status === config.model.enum.bill[i]) ? 1 : 0;
                }
            }));
            data.inMonth.topProduct = sortTopProduct(await fitExist(topProduct));
            var billsLastMonth = await db.Bill.find({ 'timeIn': { "$gte": lastEndDate, "$lt": lastStartDate } });
            data.lastMonth.total = billsLastMonth.length;
            data.lastMonth.revenue = 0;
            await Promise.all(billsLastMonth.map(async (elem) => {
                data.lastMonth.revenue += (elem.status === config.model.enum.bill[1]) ? elem.total_price_order : 0;
                for (var i in config.model.enum.bill) {
                    data.lastMonth[config.model.enum.bill[i]] += (elem.status === config.model.enum.bill[i]) ? 1 : 0;
                }
            })).then(() => {
                var total = 0;
                for (var i in config.model.enum.bill) {
                    total += data.inMonth[config.model.enum.bill[i]];
                }
                // for (var i in config.model.enum.bill) {
                //     data.pieChart.push(data.inMonth[config.model.enum.bill[i]]);
                // }
                for (var i in data.inMonth) {
                    data.cal[i] = caculate.percIncrease(data.lastMonth[i], data.inMonth[i])
                }
                resolve(data);
            })
        } catch (err) {
            rejects(err);
        }
    })
}

function sortTopProduct(products) {
    for (var i = 0; i < products.length - 1; i++) {
        for (var j = i + 1; j < products.length; j++) {
            if (products[i].count < products[j].count) {
                var ob = products[i];
                products[i] = products[j];
                products[j] = ob;
            }
        }
    }
    return products;
}

async function getTopProduct(orders, topProduct) {
    await orders.map(async (order) => {
        addNewItemTotopProduct(order, topProduct).then((rs => {
            topProduct = rs;
        }));
    })
    return topProduct
}

async function fitExist(topProduct) {
    var menu = await db.Menu.find().select("name category");
    var newArr = [];
    await Promise.all(topProduct.map((item) => {
        var exist = false;
        for (var i = 0; i < newArr.length; i++) {
            if (newArr[i].id === item.id) {
                exist = true;
                newArr[i].count += item.count;
                newArr[i].total += item.total;
                break;
            }
        }
        if (!exist) {
            for (let menuItem of menu) {
                if (menuItem._id === item.id) {
                    item.nameMenu = menuItem.name;
                    item.category = menuItem.category;
                    break;
                }
            }
            newArr.push(item);
        }
    }))
    return newArr;
}

function addNewItemTotopProduct(order, topProduct) {
    return new Promise(async resolve => {
        if (order.status != config.model.enum.order[3]) {
            var nameMenu = "";
            topProduct.push({
                "id": order.menu,
                "nameMenu": nameMenu,
                "count": order.amount,
                "total": order.total
            })
            resolve(topProduct)
        } else {
            resolve(topProduct)
        }
    })

}
