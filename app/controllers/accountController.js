const notify = require('../helper/notifyFunction');
const config = require('config');
const crypto = require('crypto');
const db = require('../helper/dbHelper');
const helper = require('../helper/utils');
const handler = require('../core/handler/tegyHandler');
const async = require('async');
const Duration = require("duration");

const jwt = require('jsonwebtoken');

const mailService = require('../helper/mailService');

const dirPage = 'admin/pages/account/';
const dirPageDashboard = 'admin/pages/dashboard/profile/';
const endpoint = config.get('endpoint').account;
const endpointAdmin = config.get('endpoint').dashboard;

const cloud = require('../helper/cloudinaryService');

const path = require('path');
var scriptName = path.basename(__filename).split(".");
const name = scriptName[0];
const log4js = require('../helper/logService');
const { resolve } = require('path');
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);
console.log("Start " + name);

module.exports = {
    logOut: function (req, res) {
        req.logout();
        handler.buildResponse(req, [], "Logout success", true)
            .then((rs) => {
                res.json(rs);
            }).catch((err) => {
                res.json(err);
            });
        // return res.json({ "message": "Logout success" });
    },
    // login_GET: function (req, res) {
    //     let message = (req.flash('loginMessage').length > 0) ? req.flash('loginMessage')[0] : '';
    //     let items = (req.user) ? [req.user] : [];
    //     handler.buildResponse(req, items, message)
    //         .then((rs) => {
    //             res.json(rs);
    //         }).catch((err) => {
    //             res.json(err);
    //         });
    // },
    // login_POST: function (req, res) {
    //     let message = (req.flash('loginMessage').length > 0) ? req.flash('loginMessage')[0] : '';
    //     let items = (req.user) ? [req.user] : [];
    //     handler.buildResponse(req, items, message)
    //         .then((rs) => {
    //             res.json(rs);
    //         }).catch((err) => {
    //             res.json(err);
    //         });
    // },
    signIn_POST: function (req, res) {
        let username = req.body.username;
        console.log('Start find user: ' + username);
        db.User.findOne({
            'local.username': username
        }, (err, user) => {
            try {
                let items = [];
                let message = '';
                if (err) throw err;
                else if (!user) {
                    message = 'Authentication failed. User not found.';
                    console.log(message);
                    throw message
                }
                else if (!user.validPassword(req.body.password)) {
                    message = 'Authentication failed. Wrong password.';
                    console.log(message);
                    throw message
                } else {
                    message = 'Authentication succuess !';
                    let token = jwt.sign(user.toJSON(), config.secret);
                    items = { token: 'jwt ' + token };
                    user.local.tokenExpires = new Date();
                    new Promise((resolve, rejects) => {
                        user.save((err, rsUser) => {
                            if (err) {
                                console.log(err);
                                rejects(err);
                            }
                            resolve(rsUser)
                        })
                    }).then((result)=>{
                        console.log('Success authentication and find user: ' + result);
                        return handler.buildResponse(req, res, items, message, true);
                    }).catch((err)=>{
                        throw err;
                    })
                }
            } catch (err) {
                return handler.buildErrorRespose(req, res, err);
            }
        })
    },
    signUp_POST: function (req, res) {

    },
    // isLoggedIn: function (req, res, next) {
    //     if (req.isAuthenticated())
    //         return next();
    //     res.redirect(endpoint.login);
    // },
    isLoggedIn: function (req, res, next) {
        let checkExpire = false;
        let user = req.user;
        if (user) {
            let dur = new Date(Date.now() - user.local.tokenExpires);
            checkExpire = (dur.getHours() > config.timeExpiredToken) ? true : false;
            if (checkExpire) return res.status(410).send({ success: false, msg: 'The requested resource is no longer available at the server and no forwarding address is known.' });
            if (handler.getToken(req.headers)) return next();
        }
        return res.status(403).send({ success: false, msg: 'Unauthorized.' });
    },
    authenticate: function (req, res, next) {
        let user = req.user;
        if (user && user.local.tokenExpires) {
            let duration = new Duration(new Date(user.local.tokenExpires), new Date());
            // let duration = new Duration(new Date(), user.local.tokenExpires);
            if (duration >= 8) console.log("Warning: Your expired token: " + duration.hours + "/" + config.timeExpiredToken);
            let isExpired = (duration.hours > config.timeExpiredToken) ? true : false;
            if (isExpired) return res.status(410).send({ success: false, msg: 'The requested resource is no longer available at the server and no forwarding address is known.' });
            if (handler.getToken(req.headers)) return next();
        }
        return res.status(403).send({ success: false, msg: 'Unauthorized.' });

    },
    profile_GET: function (req, res) {
        let user = req.user;
        handler.buildResponse(req, res, user, '', true);
    },
    profile_PATCH:
        function (req, res) {
            var userInit = req.user;
            let body = req.body;
            var files = req.files;
            new Promise((resolve, reject) => {
                db.User.findOne({ '_id': userInit._id }, async function (err, user) {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                        console.log(err);
                    }
                    else if (!user) {
                        notify.sendMessageByFlash(req, 'loginMessage', 'Something Wrong !');
                    } else {
                        if (files && files.length > 0) {
                            console.log(files);
                            var avatarImage = await cloud.UploadImageToCloud(files);
                            if (avatarImage.newImages.length > 0) {
                                user.local.avatar = avatarImage.newImages[0].cloudImage;
                            } else {
                                user.local.avatar = avatarImage.existsImages[0].cloudImage;
                            }
                        }
                        try {
                            for (let element in body) {
                                if (element === 'local') {
                                    let local = body[element];
                                    for (let varible in local) {
                                        if (varible === 'birthday')
                                            user.local[varible] = Date(local[varible]);
                                        else
                                            user.local[varible] = local[varible];
                                    }
                                } else {
                                    user[element] = body[element];
                                }
                            }
                            user.save(function (err, rs) {
                                if (err) {
                                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                                    reject(err.message);
                                } else {
                                    resolve(rs);
                                }
                            });
                        } catch (err) {
                            reject(err.message);
                        }
                    }
                })
            }).then((user) => {
                let msg = 'Update successful user ! ';
                handler.buildResponse(req, res, user, msg, true);
                console.log(msg + user);
            }).catch((err) => {
                console.log(err);
                handler.buildResponse(req, res, {}, err, false);
            })
        }
    ,
    forget_GET: function (req, res) {
        var body = req.flash('bodyInput')[0];
        res.render(dirPage + 'forget.ejs', {
            message: req.flash('forgetMessage'),
            endpoint: endpoint,
            data: body
        });
    },
    fortget_POST: function (req, res, next) {
        async.waterfall([
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {
                db.User.findOne({ 'local.email': req.body.email, 'local.username': req.body.username }, function (err, user) {
                    if (!user) {
                        req.flash('forgetMessage', 'No account with that email address and username exists.');
                        return res.redirect(endpoint.forget);
                    }

                    user.local.resetPasswordToken = token;
                    user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function (err) {
                        console.log(user)
                        done(err, token, user);
                    });
                });
            },
            function (token, user, done) {
                var imgLogo = 'https://www.upsieutoc.com/images/2020/09/07/logo.png';
                var content = '<div marginwidth="0" marginheight="0" style="width:100%;background-color:#ffffff;margin:0;padding:0;font-family:&#39;Open Sans&#39;,sans-serif"> <table width="100%" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse:collapse;width:100%;min-width:100%;height:auto"> <tbody><tr> <td width="100%" valign="top" bgcolor="#ffffff" style="padding-top:20px"> <table width="580" class="m_2831222326581102298deviceWidth" border="0" cellpadding="0" cellspacing="0" align="center" bgcolor="#ffffff" style="border-collapse:collapse;margin:0 auto"> <tbody><tr> <td valign="top" align="center" style="padding:0" bgcolor="#ffffff"> <a href="/" target="_blank"> <img src="' + imgLogo + '" alt="" border="0" width="125" style="display:block"> </a> </td> </tr> <tr> <td style="font-size:13px;color:#282828;font-weight:normal;text-align:left;font-family:&#39;Open Sans&#39;,sans-serif;line-height:24px;vertical-align:top;padding:15px 8px 10px 8px" bgcolor="#ffffff"> <h1 style="text-align:center;font-weight:600;margin:30px 0 50px 0">PASSWORD RESET REQUEST</h1> <p>Dear User,</p> <p>We have received your request to reset your password. Please click the link below to complete the reset:</p> </td> </tr> <tr> <td style="padding-bottom:30px"> <a href="#http://' + req.headers.host + '/reset/' + token + '" style="padding:10px;width:300px;display:block;text-decoration:none;border:1px solid #ff6c37;text-align:center;font-weight:bold;font-size:14px;font-family:&#39;Open Sans&#39;,sans-serif;color:#ffffff;background:#ff6c37;border-radius:5px;line-height:17px;margin:0 auto" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://identity.getpostman.com/reset-password?token%3Dc524f13e00093ccdbd5f88f2c2da6867e6d51d9fe8dcd932b92f7d8739ccb6af&amp;source=gmail&amp;ust=1599402236906000&amp;usg=AFQjCNHCMtS7ZZDxIW4139xfPVZXKnMsIA"> Reset My Password </a> </td> </tr> <tr> <td style="font-family:&#39;Open Sans&#39;,sans-serif;font-size:13px;padding:0px 10px 0px 10px;text-align:left"> <p>If you need additional assistance, or you did not make this change, please contact <a href="mailto:tegy.services@gmail.com" style="color:#ff6c37;text-decoration:underline;font-weight:bold" target="_blank">tegy.services@gmail.com</a>.</p> <p>Cheers,<br>The TEGY Team</p> </td> </tr> </tbody></table> </td> </tr> </tbody></table> <div style="height:15px;margin:0 auto"> </div> <table width="580" border="0" cellpadding="0" cellspacing="0" align="center" class="m_2831222326581102298deviceWidth" style="border-collapse:collapse;margin:0 auto"> <tbody><tr> <td bgcolor="#ffffff" style="font-family:&#39;Open Sans&#39;,sans-serif;line-height:150%;padding-top:10px;padding-left:10px;padding-right:18px;padding-bottom:30px;text-align:left;border-bottom:0;font-size:10px;border-top:0"> <table width="100%" cellpadding="0" cellspacing="0" border="0" align="left" class="m_2831222326581102298deviceWidth" style="border-collapse:collapse"> <tbody><tr> <td valign="top" style="text-align:center;font-size:11px;color:#282828;font-family:&#39;Open Sans&#39;,sans-serif;padding:20px 0;padding-left:0px"> © 2020 TEGY, All Rights Reserved <br> <br> Our mailing address is: <br> TEGY, Ho Chi Minh City <br> <br> </td> </tr> </tbody></table> </td> </tr> </tbody></table> <div style="display:none;white-space:nowrap;font:15px courier;color:#ffffff"> - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - </div> </div>';
                var reciever = user.local.email;
                var subject = 'TEGY Service Password Reset';
                mailService.sendMail(reciever, subject, content)
                    .then(() => {
                        notify.sendMessageByFlashType(req, 'forgetMessage', 'success', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.')
                        done(null, 'done');
                    }).catch(() => {
                        notify.sendMessageByFlash(req, 'forgetMessage', "Failed send mail to '" + reciever + "'");
                        done(null, 'done');
                    });
            }
        ], function (err) {
            if (err) return next(err);
            res.redirect(req.originalUrl);
        });
    },
    resetToken_GET: function (req, res) {
        db.User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function (err, user) {
            if (!user) {
                req.flash('forgetMessage', 'Password reset token is invalid or has expired.');
                return res.redirect(endpoint.forget);
            }
            res.render(dirPage + 'reset.ejs', {
                user: req.user,
                endpoint: endpoint,
                message: req.flash('resetMessage')
            });
        });
    },
    resetToken_POST: function (req, res) {
        async.waterfall([
            function (done) {
                db.User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function (err, user) {
                    if (!user) {
                        req.flash('resetMessage', 'Password reset token is invalid or has expired.');
                        return res.redirect('back');
                    }
                    user.local.password = user.generateHash(req.body.password);
                    user.local.resetPasswordToken = undefined;
                    user.local.resetPasswordExpires = undefined;
                    user.local.updateTime = Date.now();

                    user.save(function (err) {
                        console.log(user);
                        if (err) {
                            mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                            console.log(err)
                            return done(null, false, req.flash('resetMessage', 'Something Wrong !'));
                        }
                        notify.sendMessageByFlashType(req, 'loginMessage', 'success', 'Now you can use new password !')
                        return res.redirect(endpoint.login);
                    });
                });
            }
        ], function (err) {
            res.redirect(endpoint.forget);
        });
    }
};