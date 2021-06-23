var bill_controller = require('../controllers/billController');
var role_controller = require('../controllers/roleController');
var express = require('express');

module.exports = function (app) {


    /**
     * Router Order
     */
    var routerBill = express.Router();
    var billSubEndpoint = '/bill';
    //Create new bill
    app.post(billSubEndpoint, bill_controller.insertNewBillToTable_POST)

    //Handle bill
    routerBill.get('/list', role_controller.authorization, bill_controller.getListBill_GET);
    routerBill.get('/:id', role_controller.authorization, bill_controller.getBillById_GET);
    routerBill.patch('/:id', role_controller.authorization, bill_controller.updateBillById_PATCH);
    routerBill.delete('/:id', role_controller.authorization, bill_controller.deleteBillById_DELETE);
    routerBill.post('/:id/pay', role_controller.authorization, function (req, res) {
        bill_controller.submitBill_POST(req, res, 'pay')
    });
    routerBill.post('/:id/cancel', role_controller.authorization, function (req, res) {
        bill_controller.submitBill_POST(req, res, 'cancel')
    });
    routerBill.post('/:id/switch', role_controller.authorization, bill_controller.switchBillToAnotherTableById_POST);
    routerBill.post('/:id/orders', role_controller.authorization, bill_controller.insertNewOrderForBill_POST);

    var routerOrder = express.Router();
    var orderSubEndpoint = '/order';

    routerOrder.get('/:id', role_controller.authorization, bill_controller.getOrderById_GET);
    routerOrder.patch('/:id', role_controller.authorization, bill_controller.updateBillById_PATCH);
    routerOrder.post('/:id/cancel', role_controller.authorization, bill_controller.cancelOrderById_POST);

    //Apply router to app
    app.use(billSubEndpoint, routerBill);
    app.use(orderSubEndpoint, routerOrder);
}
