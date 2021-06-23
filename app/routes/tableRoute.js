let config = require('config');
var upload = require('../helper/cloudinaryService');
const passport = require('passport');
const table_controller = require('../controllers/tableController');
const role_controller = require('../controllers/roleController');
var express = require('express');

module.exports = function (app) {


    /**
     * Router Table
     */
    let tabSubEndpoint = '/table';
    /**
     * CRUD Bàn ăn
     */
    var routerTable = express.Router();
    routerTable.get('/list', role_controller.authorization, table_controller.getListTable_GET)
    routerTable.get('/:id', role_controller.authorization, table_controller.getTableById_GET)
    routerTable.patch('/:id', role_controller.authorization, table_controller.updateTableById_PATCH)
    routerTable.delete('/:id', role_controller.authorization, table_controller.deleteTable_DELETE)
    routerTable.post('/create', role_controller.authorization, table_controller.createTable_POST)

    /**
    * CRUD Khu vực
    */
    let zoneSubEndpoint = '/zone';
    var routerZone = express.Router();

    routerZone.get('/list', role_controller.authorization, table_controller.getListZone_GET);
    routerZone.get('/:id', role_controller.authorization, table_controller.getZoneById_GET)
    routerZone.patch('/:id', role_controller.authorization, table_controller.updateZoneById_PATCH)
    routerZone.delete('/:id', role_controller.authorization, table_controller.deleteZoneById_DELETE)
    routerZone.post('/create', role_controller.authorization, table_controller.createZone_POST)

    //Add subEndpoint cho routerPost
    app.use(tabSubEndpoint, routerTable);
    app.use(zoneSubEndpoint, routerZone);
}
