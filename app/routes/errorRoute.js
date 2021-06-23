let dirPage = 'home/pages/';
let config = require('config');

module.exports = function (app) {

    const name = config.get('product.name');
    const endpoint = config.get('endpoint');
    const endpointAccount = config.get('endpoint').account;

    // app.use((req, res, next) => {
    //     res.json(
    //         { 'message': res }
    //     );
    // });
};
