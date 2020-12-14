let config = require('config');
var upload = require('../helper/cloudinaryService');
const passport = require('passport');

var user_controller = require('../controllers/accountController');
var post_controller = require('../controllers/postController');
var table_controller = require('../controllers/tableController');
var menu_controller = require('../controllers/menuController');
var bill_controller = require('../controllers/billController');
// let dirPageAccount = 'admin/pages/account/';
let endpointAccount = config.get('endpoint').account;

let dirPage = 'admin/pages/dashboard/';
let endpoint = config.get('endpoint').dashboard;
var express = require('express');

module.exports = function (app) {


    /**
     * Router Order
     */
    var routerBill = express.Router();
    var billSubEndponint = '/bill';
    routerBill.post(bill_controller.makeOrderHasTable_POST)

    //View All Bill
    routerBill.get('/list', bill_controller.getAllBill_GET);
    routerBill.get('/:id', bill_controller.getBillById_GET)
    routerBill.patch('/:id', bill_controller.getBillById_GET)

    // //Edit
    // routerBill.get('/:id', bill_controller.viewDetailBill_GET)
    // routerBill.get('/' + endpoint.action.order, bill_controller.makeOrderHasTable_GET)
    // /**
    //  * Router Order
    //  */
    // var routerOrder = express.Router();
    // var orderSubEndponint = endpoint.bill.order;

    // //Order
    // routerOrder.post('/' + endpoint.action.cancel, bill_controller.cancelBill_POST)
    // routerOrder.post(endpoint.bill.order + '_' + endpoint.action.cancel, user_controller.isLoggedIn, bill_controller.cancelOrder_POST)
    // routerOrder.post('/' + endpoint.action.submit, user_controller.isLoggedIn, bill_controller.submitBill_POST)

    //Add subEndpoint cho routerPost
    // app.use(orderSubEndponint, routerOrder);
    app.use(billSubEndponint, routerBill);
}
