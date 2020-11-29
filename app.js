console.log('Startup TEGY API Services');
var startTime = new Date();
const express = require("express");
var cors = require('cors')
const config = require('config');
const app = express();
var i18n = require("i18n");
const db = require('./app/helper/database');
var passport = require('passport');
const fs = require('fs');
var Duration = require("duration");

var flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
var session = require('express-session');

const log4js = require('log4js');
log4js.configure('./config/log4js.json');

var log = log4js.getLogger("startup");

var log4jsCustom = require('./app/helper/logService');
log4jsCustom.setConsoleToLogger(log);
// config express, ejs
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(cors())
app.use(cookieParser());
i18n.configure({
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    directory: __dirname + '/app/models/locales',
    cookie: 'lang',
});

const ip = require("ip");
const ipPrivate = ip.address();
app.use(i18n.init);

app.use(express.static(__dirname + "/public"));
var engine = require('ejs-locals');
app.engine('ejs', engine);
// create server
let server = require("http").createServer(app);
server.listen(process.env.PORT || config.get('port'), function () {
    console.log("Created Server: port " + server.address().port);
    console.log("IP: http://" + ipPrivate + ":" + config.get('port'));

});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(morgan('dev')); // sử dụng để log mọi request ra console
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Routes

db.init().then(() => {
    require('./app/core/passport')(passport);
    var handler = require('./app/core/handler/tegyHandler');
    handler.init().then(async () => {

        const routeArr = [
            'systemRoute',
            'homeRoute',
            'accountRoute',
            'billRoute',
            'reportRoute',
            'imagesRoute',
            'errorRoute'
        ]

        await Promise.all(routeArr.map((route) => {
            require('./app/routes/' + route)(app)
        })).then(() => {
            fs.readFile('./config/logo.txt', 'utf8', function (err, data) {
                if (err) throw err;
                console.log("Complete startup TEGY API Services")
                console.log(data);
                let duration = new Duration(startTime, new Date());
                console.log("Total time: " + duration.milliseconds + " ms");
            });
        })
    });
})