

let config = require('config');
let db = require('../helper/loadModels');
let caculate = require('../helper/accountant/caculate');
let helper = require('../helper/utils');
let print = require('../helper/printServices/printServices');
let notify = require('../helper/notifyFunction');
var mailService = require('../helper/mailService');
const { util } = require('config');

let endpointAccount = config.get('endpoint').account;
let dirPage = 'admin/pages/dashboard/report/';
let endpoint = config.get('endpoint').dashboard;
// let cloud = require('../helper/cloudinaryService');

let limitPage = 20;
let limitPagination = 5;



module.exports = {

    viewOverReport_GET: async function (req, res) {
        var startDate = helper.getStartDate(req.query.startDate);
        var endDate = helper.getEndDate(req.query.endDate);
        var betWDay = startDate.getDate() - endDate.getDate();
        betWDay = (betWDay === 0) ? 1 : betWDay;
        var day = req.query.day;
        day = (day) ? day : betWDay;
        var urlOrg = req.originalUrl;
        var url = helper.removePathUrl('day', urlOrg);
        getDataOverView(startDate, endDate, day).then(dataOver => {
            console.log(dataOver)
            res.render(dirPage + 'home.ejs', {
                endpoint: endpoint,
                endpointAccount: endpointAccount,
                dataOver: dataOver,
                helper: helper,
                statusBill: config.model.enum.bill,
                time: {
                    "startDate": helper.createDate(startDate),
                    "endDate": helper.createDate(endDate)
                },
                day: day,
                url: url,
                user: req.user
            });
        })
    }
}

function getDataOverView(startDate, endDate, day) {
    var data = {
        'inMonth': {},
        'lastMonth': {},
        'cal': {},
        'pieChart': []
    };
    return new Promise(async (resolve) => {
        var lastStartDate = new Date(endDate);
        var lastEndDate = new Date(endDate);
        lastEndDate.setDate(lastEndDate.getDate() - day);
        lastEndDate.setHours(00, 00, 00, 00);
        console.log("startDate:" + startDate)
        console.log("endDate:" + endDate)
        console.log("lastStartDate:" + lastStartDate)
        console.log("lastEndDate:" + lastEndDate)
        var billsInMonth = await db.Bill.find({ 'createTime': { "$gte": endDate, "$lt": startDate } }).populate('order');
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
                topProduct = await getTopProduct( elem.order, topProduct);
            } else {
                // console.log(elem.status)
            }
            for (var i in config.model.enum.bill) {
                data.inMonth[config.model.enum.bill[i]] += (elem.status === config.model.enum.bill[i]) ? 1 : 0;
            }
        }));
        data.inMonth.topProduct = sortTopProduct(await fitExist(topProduct));
        var billsLastMonth = await db.Bill.find({ 'createTime': { "$gte": lastEndDate, "$lt": lastStartDate } });
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
            for (var i in config.model.enum.bill) {
                data.pieChart.push(data.inMonth[config.model.enum.bill[i]]);
            }
            for (var i in data.inMonth) {
                data.cal[i] = caculate.percIncrease(data.lastMonth[i], data.inMonth[i])
            }
            resolve(data);
        })
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
    var menu = await db.Menu.find().select("name");
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
