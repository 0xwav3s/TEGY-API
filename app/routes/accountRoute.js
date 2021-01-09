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

    // Đăng nhập
    app.post('/account/login', user_controller.signIn_POST);

    //Set authen and author after get route account
    app.use(passport.authenticate('jwt', { session: false }), user_controller.authentication, role_controller.authorization);

    // Profile
    routerAccount.get('/profile', user_controller.profile_GET);
    routerAccount.patch('/profile', user_controller.profile_PATCH);


    // Đăng xuất 
    routerAccount.post('/logout', user_controller.logOut);

    app.use('/account', routerAccount);

    app.get(endpoint.change, user_controller.isLoggedIn, function (req, res) {
        res.render(dirPageDashboard + 'changePassword.ejs', {
            endpoint: endpointAdmin,
            endpointAccount: endpoint,
            user: req.user,
            message: req.flash('changeMessage'),
        });
    });

    app.post(endpoint.change, user_controller.isLoggedIn, passport.authenticate('local-change', {
        successRedirect: endpoint.change,
        failureRedirect: endpoint.change,
        failureFlash: true
    }));

    // hiển thị form đăng ký
    app.get(endpoint.signup, function (req, res) {
        var body = req.flash('bodyInput')[0];
        res.render(dirPage + 'signup.ejs', {
            message: req.flash('signupMessage'),
            endpoint: endpoint,
            data: body
        });
    });

    // Xử lý form đăng ký ở đây
    app.post(endpoint.signup, passport.authenticate('local-signup', {
        successRedirect: endpoint.profile, // Điều hướng tới trang hiển thị profile
        failureRedirect: endpoint.signup, // Trở lại trang đăng ký nếu lỗi
        failureFlash: true
    }));

    //Profile
    // app.get(endpoint.profile, user_controller.isLoggedIn, user_controller.profile_GET);
    // app.post(endpoint.profile, user_controller.isLoggedIn, upload.multer.any(), user_controller.profile_POST);

    //Quên mật khẩu
    app.get(endpoint.forget, user_controller.forget_GET);
    app.post(endpoint.forget, user_controller.fortget_POST);

    //Reset by token
    app.get(endpoint.resetToken, user_controller.resetToken_GET);
    app.post(endpoint.resetToken, user_controller.resetToken_POST);
};
