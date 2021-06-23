const LocalStrategy = require('passport-local').Strategy;
const notify = require('../../helper/notifyFunction')
const User = require('../../helper/dbHelper').User;
const config = require('config');
const mailService = require('../../helper/mailService');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
const path = require('path');
var scriptName = path.basename(__filename).split(".");
var name = scriptName[0];
const log4js = require('../../helper/logService');
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);

module.exports = function (passport) {
    console.log("Use 'passport-jwt' for authentication account");
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt")
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        // User.findOne({ _id: jwt_payload._id }, function (err, user) {
        //     if (err) {
        //         return done(err, false);
        //     }
        //     if (user) {
        //         done(null, user);
        //     } else {
        //         done(null, false);
        //     }
        // });
        let UserValidate = new User(jwt_payload);
        UserValidate.validate((err) => {
            if (err) {
                done(err, false);
            } else {
                done(null, jwt_payload);
            }
        })
    }));

}