let config = require('config');
var upload = require('../helper/cloudinaryService');

var user_controller = require('../controllers/accountController');
var role_controller = require('../controllers/roleController');
var report_controller = require('../controllers/reportController');
var table_controller = require('../controllers/tableController');
var menu_controller = require('../controllers/menuController');
var bill_controller = require('../controllers/billController');
// let dirPageAccount = 'admin/pages/account/';
let endpointAccount = config.get('endpoint').account;

let dirPage = 'admin/pages/dashboard/';
let endpoint = config.get('endpoint').dashboard;
var express = require('express');

module.exports = function (app) {

    app.get('/' + endpoint.action.report + endpoint.subPath, user_controller.isLoggedIn, role_controller.isAdmin, report_controller.viewOverReport_GET)
}
