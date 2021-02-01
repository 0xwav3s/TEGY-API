let config = require('config');

const role_controller = require('../controllers/roleController');

var express = require('express');

module.exports = function (app) {

    let permissionSubEndpoint = '/permission';
    let routerPermission = express.Router();
    routerPermission.get('/list', role_controller.authorization, role_controller.getListPermission_GET);
    routerPermission.get('/:id', role_controller.getPermissionById_GET);

    let roleSubEndpoint = '/role';
    let routerRole = express.Router();
    routerRole.get('/list', role_controller.authorization, role_controller.getListRole_GET);
    routerRole.get('/:id', role_controller.authorization, role_controller.getRoleById_GET)
    routerRole.patch('/:id', role_controller.authorization, role_controller.updateRoleById_PATCH)
    routerRole.delete('/:id', role_controller.authorization, role_controller.deleteRole_DELETE)
    routerRole.post('/create', role_controller.authorization, role_controller.createRole_POST)


    //Add subEndpoint cho routerPost
    app.use(permissionSubEndpoint, routerPermission);
    app.use(roleSubEndpoint, routerRole);
}
