var config = require('config');
var nodemailer = require('nodemailer');

const mailConfig = config.get('mail');
const smtpTransport = nodemailer.createTransport({
    service: mailConfig.service,
    auth: {
        user: mailConfig.user,
        pass: mailConfig.pass
    }
});

module.exports.sendMail = function (reciever, subject, content) {
    var mailOptions = {
        from: 'TEGY Services <' + mailConfig.user + '>', // sender address
        to: reciever, // list of receivers
        subject: subject,
        html: content
    };
    if (config.dev) {
        return;
    } else {
        return new Promise((resolve, reject) => {
            smtpTransport.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err)
                    reject();
                }
                else {
                    console.log("Success send mail to '" + reciever + "'");
                    console.log(info);
                    resolve();
                }
            });
        })
    }
}