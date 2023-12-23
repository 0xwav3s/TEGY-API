module.exports.sendMessageByFlash = function(req, msgType, msg){
    req.flash(msgType, msg)
    req.flash('bodyInput',req.body);
}

module.exports.sendMessageByFlashType = function(req, msgType, msg, msg2){
    req.flash(msgType, msg)
    req.flash(msgType, msg2)
    req.flash('bodyInput',req.body);
}