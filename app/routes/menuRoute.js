const config = require('config');
const upload = require('../helper/cloudinaryService');
const passport = require('passport');

const user_controller = require('../controllers/accountController');
const menu_controller = require('../controllers/menuController');

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
    routerMenu.get('/list', menu_controller.getListMenu_GET)
    routerMenu.get('/:id', menu_controller.getMenuById_GET)
    routerMenu.patch('/:id', menu_controller.updateMenuById_PATCH)
    routerMenu.delete('/:id', menu_controller.deleteMenu_DELETE)
    routerMenu.post('/create', menu_controller.createMenu_POST)

    /**
    * CRUD Categories
    */
    let catSubEndpoint = '/categories';

    routerMenu.get(catSubEndpoint + '/list', menu_controller.getListMenuCategories_GET);
    routerMenu.get(catSubEndpoint + '/:id', menu_controller.getMenuCategoriesById_GET)
    routerMenu.patch(catSubEndpoint + '/:id', menu_controller.updateMenuCategoriesById_PATCH)
    routerMenu.delete(catSubEndpoint + '/:id', menu_controller.deleteMenuCategories_DELETE)
    routerMenu.post(catSubEndpoint + '/create', menu_controller.createMenuCategories_POST)

    app.use(menuSubEndpoint, routerMenu);
}
