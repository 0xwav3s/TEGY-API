var mongoose = require('mongoose');
var config = require('config');
var autoIncrement = require('mongoose-auto-increment');
var mailService = require('./mailService');

var path = require('path');
var scriptName = path.basename(__filename).split(".");
const name = 'helper-' + scriptName[0];
var log4js = require('./logService');
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);
console.log("Start " + name);

module.exports.init = function () {
    return new Promise((resolve, reject) => {
        createConnection().then(() => {
            var connection = mongoose.connection;
            console.log(status(connection.readyState) + ' to database !!');
            autoIncrement.initialize(mongoose.connection);

            //set passport

            module.exports.mongoose = mongoose;
            module.exports.autoIncrement = autoIncrement;
            // module.exports.Models = require('./loadModels');

            resolve();
        }).catch(err => {
            console.log(err);
            mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
        }
        );
    })
}

function createConnection() {
    var option = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
        // serverSelectionTimeoutMS: 5000
    }
    var uri = 'mongodb://' + config.get('mongo.username') + ':' + config.get('mongo.password') + '@' + config.get('mongo.host') + ':' + config.get('mongo.port') + '/' + config.get('mongo.database');
    console.log('Connect database with uri:',uri)
    return mongoose.connect(uri, option)
}

function status(expression) {
    switch (expression) {
        case 0:
            return "Disconnected"
        case 1:
            return "Connected"
        case 2:
            return "Connecting"
        default:
            return "Disconnecting"
    }
}