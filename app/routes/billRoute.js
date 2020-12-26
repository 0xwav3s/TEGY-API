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
    var billSubEndpoint = '/bill';
    var routerOrder = express.Router();
    var orderSubEndpoint = '/order';

    //Create new bill
    app.post(billSubEndpoint, bill_controller.insertNewBillToTable_POST)

    //Handle bill
    routerBill.get('/list', bill_controller.getAllBill_GET);
    routerBill.get('/:id', bill_controller.getBillById_GET);
    routerBill.patch('/:id', bill_controller.updateBillById_PATCH);
    routerBill.delete('/:id', bill_controller.deleteBillById_DELETE);
    routerBill.post('/:id/pay', function (req, res) {
        bill_controller.submitBill_POST(req, res, 'pay')
    });
    routerBill.post('/:id/cancel', function (req, res) {
        bill_controller.submitBill_POST(req, res, 'cancel')
    });
    routerBill.post('/:id/orders', bill_controller.insertNewOrderForBill_POST);


    // routerBill.get('/:id', bill_controller.getOrderById_GET);

    app.use(billSubEndpoint, routerBill);
}
