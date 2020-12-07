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
    let menuSubEndponint = '/menu';
    /**
     * CRUD Menu
     */
    var routerMenu = express.Router();
    routerMenu.get('/list', menu_controller.getAllMenu_GET)
    routerMenu.get('/:id', menu_controller.getMenuById_GET)
    routerMenu.patch('/:id', menu_controller.updateMenuById_PATCH)
    routerMenu.delete('/:id', menu_controller.deleteMenu_DELETE)
    routerMenu.post('/create', menu_controller.createMenu_POST)

    /**
    * CRUD Categories
    */
    let catSubEndponint = '/categories';

    routerMenu.get(catSubEndponint + '/list', menu_controller.getAllMenuCategories_GET);
    routerMenu.get(catSubEndponint + '/:id', menu_controller.getMenuCategoriesById_GET)
    routerMenu.patch(catSubEndponint + '/:id', menu_controller.updateMenuCategoriesById_PATCH)
    routerMenu.delete(catSubEndponint + '/:id', menu_controller.deleteMenuCategories_DELETE)
    routerMenu.post(catSubEndponint + '/create', menu_controller.createMenuCategories_POST)

    app.use(menuSubEndponint, routerMenu);
}
