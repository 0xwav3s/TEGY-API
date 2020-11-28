let dirPage = 'home/pages/';
let config = require('config');
var printServices = require('../helper/printServices/printServices')

module.exports = {
    checkPrint_GET: async function (req, res) {
        var message = await printServices.testPrinter();
        res.render(dirPage + 'system',{
            time : 7,
            message: message,
        });
    },
}