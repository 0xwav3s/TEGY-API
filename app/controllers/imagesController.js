//IMPORT THE MODEL WE CREATED EARLIER
//IMPORT CLOUDINARY CONFIG HERE
var cloud = require('../helper/cloudinaryService');
let dirPageDashboard = 'admin/pages/dashboard/';
var config = require('config');
exports.UploadImages_GET = (req, res) => {
    res.render(dirPageDashboard + 'images.ejs', {
    });
}

exports.UploadImages_POST = async (req, res) => {
    try {
        let files = req.files;
        cloud.UploadImageToCloud(files).then(rs => {
            res.json(rs);
        });
    } catch (execptions) {
        console.log(execptions)
    }
}

exports.ckEditorUpload_POST = async (req, res) => {
    try {
        let files = req.files;
        cloud.UploadImageToCloud(files).then(rs => {
            var url = '';
            if (rs.newImages) {
                url = rs.newImages[0].cloudImage;
            } else {
                url = rs.existsImages[0].cloudImage;
            }
            console.log(url);
            var message = "Uploaded file successfully";
            var html = "<script type='text/javascript'>window.parent.CKEDITOR.tools.callFunction(" + req.query.CKEditorFuncNum + ", \"" + url + "\", \"" + message + "\");</script>"

            res.send(html);
        });
    } catch (execptions) {
        console.log(execptions)
    }
}