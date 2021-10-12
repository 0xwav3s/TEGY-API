var notify = require('../helper/notifyFunction');
var config = require('config');
const handler = require('../core/handler/tegyHandler');
const mailService = require('../helper/mailService');
const db = require('../helper/dbHelper');
const helper = require('../helper/utils');

const path = require('path');
var scriptName = path.basename(__filename).split(".");
const name = scriptName[0];
const log4js = require('../helper/logService');
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);
console.log("Start " + name);

const links = handler.csv.links;

module.exports = {
    isAdmin: function (req, res, next) {
        if (checkAdmin(req.user.local.username)) {
            return next();
        } else {
            notify.sendMessageByFlash(req, 'tableMessage', 'Bạn không có quyền truy cập !')
            res.redirect(endpointAdmin.table.table + '/' + endpointAdmin.action.list);
        }
    },
    authorization: function (req, res, next) {
        let user = req.user;
        // TODO: fix me later
        console.log(user.local.role)
        return next();
        if (user.local.role) {
            let permission = user.local.role.permissions;
            if (permission === "*") return next();
            let detachPermission = permission.split('/');
            let filterLink = handler.csv.links.filter(e => (e.href === req.baseUrl + req.route.path) && e.method === req.method);
            if (filterLink.length > 0) {
                let charSpecial = '_'
                let resource = filterLink[0];
                let splitId = resource.id.split(charSpecial);
                let id = splitId[0].concat(charSpecial);
                let isAuthorize = false;
                detachPermission.map(pms => {
                    if (pms === id.concat('*') || pms === resource.id) {
                        isAuthorize = true;
                        return;
                    }
                })
                return (isAuthorize) ? next() : res.status(403).send({ success: false, msg: 'You do not have permission to access / on this server.' });
            }
        } else {
            return res.status(403).send({ success: false, msg: 'You do not have permission to access / on this server.' });
        }
    },
    getListRole_GET: function (req, res) {
        console.log("Get List Role");
        let message = '';
        let filter = {};
        db.Role
            .find(filter)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Successful get all roles.';
                console.log(message)
                handler.buildResponse(req, res, items, message, true);
            })
    },
    getRoleById_GET: function (req, res) {
        let message = '';
        let id = req.params.id;
        db.Role
            .findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    message = err.message;
                    handler.buildResponse(req, res, {}, message, false);
                }
                message = 'Success find role by id: ' + id;
                console.log(message)
                handler.buildResponse(req, res, item, message, true);
            })
    },
    updateRoleById_PATCH: function (req, res) {
        let body = req.body;
        let id = req.params.id;
        db.updateItemById('Role', id, body).then((result) => {
            let message = 'Successful saved role ID: ' + result._id;
            handler.buildResponse(req, res, result, message, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    createRole_POST: function (req, res) {
        var body = req.body;
        let modelName = 'Role';
        db.createNewItem(modelName, body).then((result) => {
            handler.buildResponse(req, res, result, "Successful create new role name is: " + body.name, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    deleteRole_DELETE: function (req, res) {
        let id = req.params.id;
        let modelName = 'Role';
        db.removeItemById(modelName, id).then((message) => {
            console.log(message);
            handler.buildResponse(req, res, {}, message, true);
        }).catch((err) => {
            console.log(err);
            handler.buildResponse(req, res, {}, err, false);
        });
    },
    getListPermission_GET: function (req, res) {
        handler.buildResponse(req, res, links, "Success get list permission", true);
    },
    getPermissionById_GET: function (req, res) {
        let id = req.params.id;
        let items = links.filter(x => x.id === id);
        handler.buildResponse(req, res, items, (items.length > 0) ? "Success get permission id: " + id : "", true);
    },
};

function checkAdmin(user) {
    for (var uIn of config.role.admin) {
        if (user === uIn) {
            return true;
        }
    }
    return false;
}