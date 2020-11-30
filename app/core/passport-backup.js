const LocalStrategy = require('passport-local').Strategy;
const notify = require('../helper/notifyFunction')
const db = require('../helper/dbHelper');
const config = require('config');
const mailService = require('../helper/mailService');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const path = require('path');
var scriptName = path.basename(__filename).split(".");
var name = scriptName[0];
const log4js = require('../helper/logService');
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);

module.exports = function (passport) {

    console.log("Use 'passport' for authentication account");

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        db.User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-change', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'newPassword',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, username, password, done) {

            if (username == password)
                return done(null, false, notify.sendMessageByFlash(req, 'changeMessage', 'Mật khẩu cũ không được trùng với mật khẩu mới'));

            db.User.findOne({ '_id': req.user._id }, function (err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);

                if (!user.validPassword(password))
                    return done(null, false, notify.sendMessageByFlash(req, 'changeMessage', 'Mật khẩu hiện tại không đúng'));

                user.local.password = user.generateHash(username);
                user.local.updateTime = Date.now();

                user.save(function (err) {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                        console.err(err)
                        return done(null, false, notify.sendMessageByFlash(req, 'changeMessage', 'Đổi mật khẩu thất bại !'))
                    }
                });
                return done(null, false, notify.sendMessageByFlashType(req, 'changeMessage', 'success', 'Thay đổi mật khẩu mới thành công!'))
            });

        }));

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, username, password, done) { // callback with email and password from our form
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            console.log("Start find username: " + username)
            db.User.findOne({ 'local.username': username }, function (err, user) {
                // if there are any errors, return the error before anything else
                if (err) {
                    console.error(err)
                    return done(err);
                }

                // if no user is found, return the message
                if (!user) {
                    let msg = 'No user found.';
                    console.log(msg);
                    return done(null, false, notify.sendMessageByFlash(req, 'loginMessage', msg));
                }


                // if the user is found but the password is wrong
                if (!user.validPassword(password)) {
                    let msg = 'Oops! Wrong password.';
                    console.log(msg)
                    // notify.sendMessageByFlash(req, 'loginMessage', msg);
                    return done(null, false, notify.sendMessageByFlash(req, 'loginMessage', msg));
                }

                // all is well, return successful user
                console.log('Successful find user: ', user)
                return done(null, user);
            });

        }));

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, username, password, done) => {
        try {
            var email = req.body.email;
            var fullname = req.body.fullname;
            var phone = req.body.phone;
            var user = await db.User.findOne({ $or: [{ 'local.username': username }, { 'local.email': email }] });
            if (user) {
                return (user.local.username == username) ? done(null, false, notify.sendMessageByFlash(req, 'signupMessage', 'Username is exists.', req.body)) : done(null, false, notify.sendMessageByFlash(req, 'signupMessage', 'Email is exists.', req.body));
            } else {
                var newUser = new db.User();
                newUser.local.username = username;
                newUser.local.fullname = fullname;
                newUser.local.email = email;
                newUser.local.phone = phone;
                newUser.local.password = newUser.generateHash(password);
                newUser.save(function (err) {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                        console.err(err)
                        return done(null, false, notify.sendMessageByFlash(req, 'signupMessage', 'Something Wrong ! Please contact admin for help'))
                        // throw err;
                    }
                    return done(null, newUser);
                });
            }

        } catch (error) {
            console.err(error)
            return done(null, false, notify.sendMessageByFlash(req, 'signupMessage', 'Something Wrong ! Please contact admin for help.'))
        }
    }));
}