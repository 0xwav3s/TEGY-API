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
     * Router Table
     */
    //View All Categories
    var tabSubEndponint = endpoint.table.table;

    //Gọi món
    app.get(tabSubEndponint + '/' + endpoint.action.list, user_controller.isLoggedIn, table_controller.viewTable_GET)

    /**
     * CRUD Bàn ăn
     */
    var routerTable = express.Router();

    //View All Bàn ăn
    app.get(tabSubEndponint + endpoint.subPath, user_controller.isLoggedIn, table_controller.viewAllTable_GET)

    //Edit
    routerTable.get('/' + endpoint.action.edit, user_controller.isLoggedIn, table_controller.editTable_GET)
    routerTable.post('/' + endpoint.action.edit, user_controller.isLoggedIn, table_controller.editTable_POST)

    //Create
    routerTable.get('/' + endpoint.action.create, user_controller.isLoggedIn, table_controller.createTable_GET)
    routerTable.post('/' + endpoint.action.create, user_controller.isLoggedIn, table_controller.createTable_POST)

    //Delete
    routerTable.post('/' + endpoint.action.delete, user_controller.isLoggedIn, table_controller.deleteTable_POST)

    /**
     * CRUD Khu vực
     */

    routerTable.get(endpoint.table.zone + endpoint.subPath, user_controller.isLoggedIn, table_controller.viewAllZone_GET)

    //Create
    routerTable.get(endpoint.table.zone + '/' + endpoint.action.create, user_controller.isLoggedIn, table_controller.createZone_GET)
    routerTable.post(endpoint.table.zone + '/' + endpoint.action.create, user_controller.isLoggedIn, table_controller.createZone_POST)

    //Edit
    routerTable.get(endpoint.table.zone + '/' + endpoint.action.edit, user_controller.isLoggedIn, table_controller.editZone_GET)
    routerTable.post(endpoint.table.zone + '/' + endpoint.action.edit, user_controller.isLoggedIn, table_controller.editZone_POST)

    //Delete
    routerTable.post(endpoint.table.zone + '/' + endpoint.action.delete, user_controller.isLoggedIn, table_controller.deleteZone_POST)


    //Add subEndpoint cho routerPost
    app.use(tabSubEndponint, routerTable);
}
