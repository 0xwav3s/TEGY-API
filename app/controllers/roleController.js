var notify = require('../helper/notifyFunction');
var config = require('config');
var crypto = require('crypto');
var db = require('../helper/dbHelper');
var helper = require('../helper/utils');
var async = require('async');

var mailService = require('../helper/mailService');

var utils = require('../helper/utils');
let dirPage = 'admin/pages/account/';
let dirPageDashboard = 'admin/pages/dashboard/profile/';
let endpoint = config.get('endpoint').account;
let endpointAdmin = config.get('endpoint').dashboard;

let cloud = require('../helper/cloudinaryService');

module.exports = {
    isAdmin: function (req, res, next) {
        if (checkAdmin(req.user.local.username)){
            return next();
        }else{
            notify.sendMessageByFlash(req,'tableMessage','Bạn không có quyền truy cập !')
            res.redirect(endpointAdmin.table.table + '/' + endpointAdmin.action.list);
        }
    }
};

function checkAdmin(user) {
    for (var uIn of config.role.admin) {
        if (user === uIn){
            return true;
        }
    }
    return false;
}