var bill_controller = require('../controllers/billController');
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
    routerBill.get('/list', bill_controller.getListBill_GET);
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

    var routerOrder = express.Router();
    var orderSubEndpoint = '/order';

    routerOrder.get('/:id', bill_controller.getOrderById_GET);
    routerOrder.patch('/:id', bill_controller.updateBillById_PATCH);
    routerOrder.post('/:id/cancel', bill_controller.cancelOrderById_POST);

    //Apply router to app
    app.use(billSubEndpoint, routerBill);
    app.use(orderSubEndpoint, routerOrder);
}
