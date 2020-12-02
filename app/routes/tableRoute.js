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
    let tabSubEndponint = '/table';
    /**
     * CRUD Bàn ăn
     */
    var routerTable = express.Router();
    routerTable.get('/list', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.getAllTable_GET)
    routerTable.get('/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.getTableById_GET)
    routerTable.patch('/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.updateTableById_PATCH)
    routerTable.delete('/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.deleteTable_DELETE)
    routerTable.post('/create', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.createTable_POST)

    /**
    * CRUD Khu vực
    */
    let zoneSubEndponint = '/zone';
    var routerZone = express.Router();

    routerZone.get('/list', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.getAllZone_GET);
    routerZone.get('/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.getZoneById_GET)
    routerZone.patch('/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.updateZoneById_PATCH)
    routerZone.delete('/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.deleteZoneById_DELETE)
    routerZone.post('/create', passport.authenticate('jwt', { session: false }), user_controller.authorized, table_controller.createZone_POST)

    //Add subEndpoint cho routerPost
    app.use(tabSubEndponint, routerTable);
    app.use(zoneSubEndponint, routerZone);
}
