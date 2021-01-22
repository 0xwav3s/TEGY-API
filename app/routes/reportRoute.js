let config = require('config');
const report_controller = require('../controllers/reportController');

var express = require('express');

module.exports = function (app) {

    var routerReport = express.Router();
    var reportSubEndpoint = '/report';

    routerReport.get('/over', report_controller.viewOverReport_GET);

    //Apply router to app
    app.use(reportSubEndpoint, routerReport);
}
