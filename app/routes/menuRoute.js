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
    routerMenu.get('/list', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.getAllMenu_GET)
    routerMenu.get('/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.getMenuById_GET)
    routerMenu.patch('/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.updateMenuById_PATCH)
    routerMenu.delete('/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.deleteMenu_DELETE)
    routerMenu.post('/create', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.createMenu_POST)

    /**
    * CRUD Categories
    */
    let catSubEndponint = '/categories';

    routerMenu.get(catSubEndponint + '/list', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.getAllMenuCategories_GET);
    routerMenu.get(catSubEndponint + '/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.getMenuCategoriesById_GET)
    routerMenu.patch(catSubEndponint + '/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.updateMenuCategoriesById_PATCH)
    routerMenu.delete(catSubEndponint + '/:id', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.deleteMenuCategories_DELETE)
    routerMenu.post(catSubEndponint + '/create', passport.authenticate('jwt', { session: false }), user_controller.authorized, menu_controller.createMenuCategories_POST)

    app.use(menuSubEndponint, routerMenu);
}
