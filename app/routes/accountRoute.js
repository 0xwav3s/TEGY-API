var config = require('config');

//controllers
var user_controller = require('../controllers/accountController');
var role_controller = require('../controllers/roleController');
var passport = require('passport');
// require('../core/passport-backup')(passport);

let dirPage = 'admin/pages/account/';
let dirPageDashboard = 'admin/pages/dashboard/profile/';
let endpoint = config.get('endpoint').account;
let endpointAdmin = config.get('endpoint').dashboard;
var upload = require('../helper/cloudinaryService');
var express = require('express');

module.exports = function (app) {

    let routerAccount = express.Router();
    var accountSubEndpoint = '/account';

    // Đăng nhập
    app.post('/account/login', user_controller.signIn_POST);
    app.post('/account/register', user_controller.signUp_POST);

    //Set authen and author after get route account
    app.use(passport.authenticate('jwt', { session: false }), user_controller.authentication);

    // Profile
    routerAccount.get('/profile', user_controller.profile_GET);
    routerAccount.patch('/profile', user_controller.profile_PATCH);

    //Quản lý
    routerAccount.get('/list', role_controller.authorization, user_controller.getListUser_GET);
    routerAccount.get('/:id', role_controller.authorization, user_controller.getUserById_GET);
    routerAccount.patch('/:id', role_controller.authorization, user_controller.updateUserById_PATCH);
    routerAccount.delete('/:id', role_controller.authorization, user_controller.deleteUserById_DELETE);
    routerAccount.post('/change_password', role_controller.authorization, user_controller.changePasswordByProfile_POST);

    // Đăng xuất
    routerAccount.post('/logout', user_controller.logOut);

    app.use(accountSubEndpoint, routerAccount);

    //Quên mật khẩu
    app.get(endpoint.forget, user_controller.forget_GET);
    app.post(endpoint.forget, user_controller.fortget_POST);

    //Reset by token
    app.get(endpoint.resetToken, user_controller.resetToken_GET);
    app.post(endpoint.resetToken, user_controller.resetToken_POST);
};
