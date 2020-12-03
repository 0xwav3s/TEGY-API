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

    app.get(endpoint.home, user_controller.isLoggedIn, function (req, res) {
        res.render(dirPage + 'home.ejs', {
            endpoint: endpoint,
            endpointAccount: endpointAccount,
            user: req.user
        });
    })
    /**
     * Router Order
     */
    var routerBill = express.Router();
    var billSubEndponint = endpoint.bill.bill;
    /**
     * CRUD Bài Viết
     */
    //View All Bill
    app.get(billSubEndponint + endpoint.subPath, user_controller.isLoggedIn, bill_controller.viewAllBill_GET);

    //Edit
    routerBill.get('/' + endpoint.action.edit, user_controller.isLoggedIn, bill_controller.viewDetailBill_GET)
    // routerPost.post('/' + endpoint.action.edit, user_controller.isLoggedIn, post_controller.editArticle_POST)

    // //Create
    // routerPost.get('/' + endpoint.action.create, user_controller.isLoggedIn, post_controller.createArticle_GET)
    // routerPost.post('/' + endpoint.action.create, user_controller.isLoggedIn, post_controller.createArticle_POST)

    // //Delete
    // routerPost.post('/' + endpoint.action.delete, user_controller.isLoggedIn, post_controller.deleteArticle_POST)

    /**
     * Router Order
     */
    var routerOrder = express.Router();
    var orderSubEndponint = endpoint.bill.order;

    //Order
    routerOrder.get('/' + endpoint.action.order, user_controller.isLoggedIn, bill_controller.makeOrderHasTable_GET)
    routerOrder.post('/' + endpoint.action.order, user_controller.isLoggedIn, bill_controller.makeOrderHasTable_POST)
    routerOrder.post('/' + endpoint.action.cancel, user_controller.isLoggedIn, bill_controller.cancelBill_POST)
    routerOrder.post(endpoint.bill.order + '_' + endpoint.action.cancel, user_controller.isLoggedIn, bill_controller.cancelOrder_POST)
    routerOrder.post('/' + endpoint.action.submit, user_controller.isLoggedIn, bill_controller.submitBill_POST)

    /**
     * Router Menu
     */
    var routerMenu = express.Router();
    var menuSubEndponint = endpoint.menu.menu;

    /**
     * CRUD Menu
     */

    //View All Menu
    app.get(menuSubEndponint + endpoint.subPath, user_controller.isLoggedIn, menu_controller.viewAllMenu_GET)

    //Edit
    routerMenu.get('/' + endpoint.action.edit, user_controller.isLoggedIn, menu_controller.editMenu_GET)
    routerMenu.post('/' + endpoint.action.edit, upload.multer.any(), menu_controller.editMenu_POST)

    //Create
    routerMenu.get('/' + endpoint.action.create, user_controller.isLoggedIn, menu_controller.createMenu_GET)
    routerMenu.post('/' + endpoint.action.create, upload.multer.any(), menu_controller.createMenu_POST)

    //Delete
    routerMenu.post('/' + endpoint.action.delete, user_controller.isLoggedIn, menu_controller.deleteMenu_POST)

    /**
     * CRUD Danh mục Menu
     */
    routerMenu.get(endpoint.menu.categories + endpoint.subPath, user_controller.isLoggedIn, menu_controller.viewAllMenuCategories_GET)

    //Create
    routerMenu.get(endpoint.menu.categories + '/' + endpoint.action.create, user_controller.isLoggedIn, menu_controller.createMenuCategories_GET)
    routerMenu.post(endpoint.menu.categories + '/' + endpoint.action.create, user_controller.isLoggedIn, menu_controller.createMenuCategories_POST)

    //Edit
    routerMenu.get(endpoint.menu.categories + '/' + endpoint.action.edit, user_controller.isLoggedIn, menu_controller.editMenuCategories_GET)
    routerMenu.post(endpoint.menu.categories + '/' + endpoint.action.edit, user_controller.isLoggedIn, menu_controller.editMenuCategories_POST)

    //Delete
    routerMenu.post(endpoint.menu.categories + '/' + endpoint.action.delete, user_controller.isLoggedIn, menu_controller.deleteMenuCategories_POST)



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


    /**
     * Router Bài viết
     */

    var routerPost = express.Router();
    var artSubEndponint = endpoint.art.articles;
    /**
     * CRUD Danh mục bài viết
     */
    //View All Category
    routerPost.get(endpoint.art.categories + endpoint.subPath, user_controller.isLoggedIn, post_controller.viewAllCat_GET)

    //Edit
    routerPost.get(endpoint.art.categories + '/' + endpoint.action.edit, user_controller.isLoggedIn, post_controller.editCategory_GET)
    routerPost.post(endpoint.art.categories + '/' + endpoint.action.edit, user_controller.isLoggedIn, post_controller.editCategory_POST)

    //Create
    routerPost.get(endpoint.art.categories + '/' + endpoint.action.create, user_controller.isLoggedIn, post_controller.createCategory_GET)
    routerPost.post(endpoint.art.categories + '/' + endpoint.action.create, user_controller.isLoggedIn, post_controller.createCategory_POST)

    //Delete
    routerPost.post(endpoint.art.categories + '/' + endpoint.action.delete, user_controller.isLoggedIn, post_controller.deleteCategory_POST)

    /**
     * CRUD Bài Viết
     */
    //View All Articles
    app.get(artSubEndponint + endpoint.subPath, user_controller.isLoggedIn, post_controller.viewAllArticles_GET)

    //Edit
    routerPost.get('/' + endpoint.action.edit, user_controller.isLoggedIn, post_controller.editArticle_GET)
    routerPost.post('/' + endpoint.action.edit, user_controller.isLoggedIn, post_controller.editArticle_POST)

    //Create
    routerPost.get('/' + endpoint.action.create, user_controller.isLoggedIn, post_controller.createArticle_GET)
    routerPost.post('/' + endpoint.action.create, user_controller.isLoggedIn, post_controller.createArticle_POST)

    //Delete
    routerPost.post('/' + endpoint.action.delete, user_controller.isLoggedIn, post_controller.deleteArticle_POST)

    //Add subEndpoint cho routerPost
    app.use(artSubEndponint, routerPost);
    app.use(tabSubEndponint, routerTable);
    app.use(menuSubEndponint, routerMenu);
    app.use(orderSubEndponint, routerOrder);
    app.use(billSubEndponint, routerBill);
}
