const cloudinary = require('cloudinary');
const config = require('config');
const multer = require('multer');
var imageModel = require('./dbHelper').Images;
let utils = require('./utils');
var mailService = require('./mailService');

cloudinary.config({
    cloud_name: config.get('images').cloud_name,
    api_key: config.get('images').api_key,
    api_secret: config.get('images').api_secret
});

//multer.diskStorage() creates a storage space for storing files. 
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, './public/temp/');
        } else {
            cb({ message: 'this file is neither a video or image file' }, false)
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
var multerStorage = multer({ storage: storage });


function UploadImageToCloud(files) {
    return new Promise(async (resolveU, rejectU) => {
        if (!files) return;
        let queryOr = [];
        let arrOnlyName = [];
        let objectRS
        for (let i = 0; i < files.length; i++) {
            let covertName = utils.getOnlyFileName(files[i].filename) + utils.getDate();
            let imageDetails = {
                'imageName': covertName,
            }
            arrOnlyName.push(covertName);
            queryOr.push(imageDetails);
        }
        await imageModel.find({ $or: queryOr }, async (err, callback) => {
            if (err) {
                mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', err)
                objectRS = {
                    err: err,
                    message: 'there was a problem uploading image'
                };
            }
            var fileExist = []
            if (callback.length > 0) {
                await Promise.all(callback.map(async (element) => {
                    var checkExists = arrOnlyName.includes(element.imageName);
                    if (checkExists) {
                        if (!config.get('images').local) {
                            await utils.removeFile(files[arrOnlyName.indexOf(element.imageName)].path);
                        }
                        await files.splice(arrOnlyName.indexOf(element.imageName), 1);
                        console.log(element.imageName + ' file already exist');
                        fileExist.push(element);
                    }
                    objectRS = { 'existsImages': fileExist };
                }));
            }
        }).then(async () => {
            console.log('Files process: ' + files.length);
            if (files.length === 0) {
                resolveU(objectRS);
            } else {
                var arrDetails = [];
                var i = 0;
                await Promise.all(files.map(async (element) => {
                    let iNameProcess = utils.getOnlyFileName(element.filename) + utils.getDate();
                    var imageDetails = {
                        imageName: iNameProcess,
                        cloudImage: element.path,
                        imageId: ''
                    }
                    if (config.get('images').local) {
                        imageDetails.imageId = utils.getDateForLocal();
                        var newPath = element.path;
                        newPath = newPath.replace('public','');
                        newPath = newPath.replace('"\"','/');
                        imageDetails.cloudImage = newPath;
                        var imageDetailsLocal = new imageModel(imageDetails);
                        let created = await imageDetailsLocal.save();
                        arrDetails.push(created);
                        i++;
                        if (i === files.length) {
                            objectRS = { 'newImages': arrDetails };
                            resolveU(objectRS);
                        }
                    } else {
                        await cloudUpload(imageDetails.cloudImage).then(async (result) => {
                            await utils.removeFile(element.path)
                            try {
                                var imageDetails = new imageModel({
                                    imageName: iNameProcess,
                                    cloudImage: result.url,
                                    imageId: result.id
                                })
                                let created = await imageDetails.save();
                                arrDetails.push(created);
                                i++;
                                if (i === files.length) {
                                    objectRS = { 'newImages': arrDetails };
                                    resolveU(objectRS);
                                }
                            } catch (err) {
                                console.log('err' + err);
                                mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', err)
                                // res.status(500).send(err);
                            }
                        });
                    }
                }));
            }

        })

    })

}
function cloudUpload(file) {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, (result) => {
            resolve({ url: result.url, id: result.public_id })
        }, { resource_type: "auto" })
    })
}

exports.multer = multerStorage;
exports.upload = cloudUpload;
exports.UploadImageToCloud = UploadImageToCloud;