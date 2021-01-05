var notify = require('../helper/notifyFunction');
var config = require('config');
const handler = require('../core/handler/tegyHandler');


const path = require('path');
var scriptName = path.basename(__filename).split(".");
const name = scriptName[0];
const log4js = require('../helper/logService');
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);
console.log("Start " + name);

module.exports = {
    isAdmin: function (req, res, next) {
        if (checkAdmin(req.user.local.username)) {
            return next();
        } else {
            notify.sendMessageByFlash(req, 'tableMessage', 'Bạn không có quyền truy cập !')
            res.redirect(endpointAdmin.table.table + '/' + endpointAdmin.action.list);
        }
    },
    getListRole_GET: function (req, res) {
        let data = handler.csv.links;
        handler.buildResponse(req, res, data, "Success get list Roles", true);
    }
};

function checkAdmin(user) {
    for (var uIn of config.role.admin) {
        if (user === uIn) {
            return true;
        }
    }
    return false;
}