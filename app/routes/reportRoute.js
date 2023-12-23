let config = require('config');
const report_controller = require('../controllers/reportController');
const role_controller = require('../controllers/roleController');

var express = require('express');

module.exports = function (app) {

    var routerReport = express.Router();
    var reportSubEndpoint = '/report';

    routerReport.get('/over', role_controller.authorization, report_controller.viewOverReport_GET);

    //Apply router to app
    app.use(reportSubEndpoint, routerReport);
}
