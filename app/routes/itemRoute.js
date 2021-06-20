const config = require('config');
const upload = require('../helper/cloudinaryService');
const passport = require('passport');

const user_controller = require('../controllers/accountController');
// const item_controller = require('../controllers/menuController');
const item_controller = require('../controllers/itemController');
const role_controller = require('../controllers/roleController');

var express = require('express');

module.exports = function (app) {

    /**
     * Router Table
     */
    let menuSubEndpoint = '/item';
    /**
     * CRUD Item
     */
    var routerItem = express.Router();
    routerItem.get('/list', role_controller.authorization, item_controller.getListItem_GET)
    routerItem.get('/:id', role_controller.authorization, item_controller.getItemById_GET)
    routerItem.patch('/:id', role_controller.authorization, item_controller.updateItemById_PATCH)
    routerItem.delete('/:id', role_controller.authorization, item_controller.deleteItem_DELETE)
    routerItem.post('/create', role_controller.authorization, item_controller.createItem_POST)

    /**
    * CRUD Categories
    */
    let catSubEndpoint = '/categories';

    routerItem.get(catSubEndpoint + '/list', role_controller.authorization, item_controller.getListItemCategories_GET);
    routerItem.get(catSubEndpoint + '/:id', role_controller.authorization, item_controller.getItemCategoriesById_GET)
    routerItem.patch(catSubEndpoint + '/:id', role_controller.authorization, item_controller.updateItemCategoriesById_PATCH)
    routerItem.delete(catSubEndpoint + '/:id', role_controller.authorization, item_controller.deleteItemCategories_DELETE)
    routerItem.post(catSubEndpoint + '/create', role_controller.authorization, item_controller.createItemCategories_POST)

    app.use(menuSubEndpoint, routerItem);
}
