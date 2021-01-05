let config = require('config');

const role_controller = require('../controllers/roleController');

var express = require('express');

module.exports = function (app) {


    /**
     * Router Table
     */
    let roleSubEndpoint = '/role';
    /**
     * CRUD Bàn ăn
     */
    var routerRole = express.Router();
    routerRole.get('/list', role_controller.getListRole_GET);


    //Add subEndpoint cho routerPost
    app.use(roleSubEndpoint, routerRole);
}
