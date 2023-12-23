let dirPage = 'home/pages/';
let config = require('config');

module.exports = function (app) {

    const name = config.get('product.name');
    const endpoint = config.get('endpoint');
    const endpointAccount = config.get('endpoint').account;

    app.get(endpoint.home, function (req, res) {
        res.redirect(endpointAccount.login);
    })

    app.use('/change-lang/:lang', (req, res) => {
        res.cookie('lang', req.params.lang, { maxAge: 900000 });
        res.redirect('back');
    });
};
