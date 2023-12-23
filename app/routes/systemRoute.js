let dirPage = 'home/pages/';
let config = require('config');

var printServices = require('../helper/printServices/printServices');
var system_controller = require('../controllers/systemController');
var notify = require('../helper/notifyFunction')
module.exports = function (app) {

    const name = config.get('product.name');
    const endpoint = config.get('endpoint').dashboard;
    const endpointAccount = config.get('endpoint').account;

    // app.use(endpoint.system.name + endpoint.system.restart, (req, res) => {
    //     pm2.connect(function(err) {
    //         // pm2.restart('server', (err, proc) => {
    //         // })
    //         res.render(dirPage + 'system',{
    //             message: req.flash('billMessage'),
    //         });
    //     })
    // });
    // app.use(function (req, res, next) {
    //     res.header("Access-Control-Allow-Origin", "*");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });

    app.get(endpoint.system.printTest, system_controller.checkPrint_GET);

};