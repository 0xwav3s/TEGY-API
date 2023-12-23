const config = require('config');
const upload = require('../helper/cloudinaryService');
const passport = require('passport');

// const user_controller = require('../controllers/accountController');
// const export_import_controller = require('../controllers/itemController');
const export_import_controller = require('../controllers/exportImprotController');
const role_controller = require('../controllers/roleController');

var express = require('express');

module.exports = function (app) {

    /**
     * Router Table
     */
    let exportImportSubEndpoint = '/export_import';
    /**
     * CRUD ExportImport
     */
    var routerExportImport = express.Router();
    routerExportImport.get('/list', role_controller.authorization, export_import_controller.getListExportImport_GET)
    routerExportImport.get('/:id', role_controller.authorization, export_import_controller.getExportImportById_GET)
    routerExportImport.patch('/:id', role_controller.authorization, export_import_controller.updateExportImportById_PATCH)
    routerExportImport.delete('/:id', role_controller.authorization, export_import_controller.deleteExportImport_DELETE)
    routerExportImport.post('/create', role_controller.authorization, export_import_controller.createExportImport_POST)

    /**
    * CRUD Supplier
    */
    let supSubEndpoint = '/supplier';
    var routerSupplier = express.Router();

    routerSupplier.get('/list', role_controller.authorization, export_import_controller.getListSupplier_GET);
    routerSupplier.get('/:id', role_controller.authorization, export_import_controller.getSupplierById_GET)
    routerSupplier.patch('/:id', role_controller.authorization, export_import_controller.updateSupplierById_PATCH)
    routerSupplier.delete('/:id', role_controller.authorization, export_import_controller.deleteSupplier_DELETE)
    routerSupplier.post('/create', role_controller.authorization, export_import_controller.createSupplier_POST)

    /**
    * CRUD Expenses
    */
     let expensesSubEndpoint = '/expenses';
     var routerExpenses = express.Router();
 
     routerExpenses.get('/list', role_controller.authorization, export_import_controller.getListExpenses_GET);
     routerExpenses.get('/:id', role_controller.authorization, export_import_controller.getExpensesById_GET)
     routerExpenses.patch('/:id', role_controller.authorization, export_import_controller.updateExpensesById_PATCH)
     routerExpenses.delete('/:id', role_controller.authorization, export_import_controller.deleteExpenses_DELETE)
     routerExpenses.post('/create', role_controller.authorization, export_import_controller.createExpenses_POST)

    app.use(exportImportSubEndpoint, routerExportImport);
    app.use(supSubEndpoint, routerSupplier);
    app.use(expensesSubEndpoint, routerExpenses);

}
