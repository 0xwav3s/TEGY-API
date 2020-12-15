// const helper = require("../helper/utils");
const config = require('config');
// const folderLog = helper.formatDateNotHours(new Date()).replace(new RegExp('/', 'g'), "-") + "/"
// //format dd-mm-yyyy
// var log4js = require("log4js");

// var configLogger = {
//     appenders: {},
//     categories: { default: { appenders: [], level: "all" } }
// }
// var fileLog = "log-" + helper.formatDateNotHours(new Date()).replace(new RegExp('/', 'g'), "-") + ".log";


// module.exports.addCategoryLogger = (name) => {
//     // var fileLog = name + ".log";
//     configLogger.appenders[name] = { type: "file", filename: "logs/" + fileLog }
//     configLogger.categories.default.appenders.push(name);
//     log4js.configure(configLogger);
//     return log4js;
// }

module.exports.getLog = function (name) {
    return require('log4js').getLogger(name);
}

module.exports.appendChild = function (nameChild, msg) {
    return nameChild + " - " + msg;
}

module.exports.setConsoleToLogger = (log, err = false) => {
    if (!config.dev) {
        console.log = (msg) => {
            if (msg.toLowerCase().includes('error') || err === true)
                log.warning(msg);
            else
                log.info(msg);
        }
    }
}