const config = require('config');
const upload = require('../helper/cloudinaryService');
const passport = require('passport');

const user_controller = require('../controllers/accountController');
const menu_controller = require('../controllers/menuController');
const role_controller = require('../controllers/roleController');

var express = require('express');

module.exports = function (app) {

    /**
     * Router Table
     */
    let menuSubEndpoint = '/menu';
    /**
     * CRUD Menu
     */
    var routerMenu = express.Router();
    routerMenu.get('/list', role_controller.authorization, menu_controller.getListMenu_GET)
    routerMenu.get('/:id', role_controller.authorization, menu_controller.getMenuById_GET)
    routerMenu.patch('/:id', role_controller.authorization, menu_controller.updateMenuById_PATCH)
    routerMenu.delete('/:id', role_controller.authorization, menu_controller.deleteMenu_DELETE)
    routerMenu.post('/create', role_controller.authorization, menu_controller.createMenu_POST)

    /**
    * CRUD Categories
    */
    let catSubEndpoint = '/categories';

    routerMenu.get(catSubEndpoint + '/list', role_controller.authorization, menu_controller.getListMenuCategories_GET);
    routerMenu.get(catSubEndpoint + '/:id', role_controller.authorization, menu_controller.getMenuCategoriesById_GET)
    routerMenu.patch(catSubEndpoint + '/:id', role_controller.authorization, menu_controller.updateMenuCategoriesById_PATCH)
    routerMenu.delete(catSubEndpoint + '/:id', role_controller.authorization, menu_controller.deleteMenuCategories_DELETE)
    routerMenu.post(catSubEndpoint + '/create', role_controller.authorization, menu_controller.createMenuCategories_POST)

    app.use(menuSubEndpoint, routerMenu);
}
