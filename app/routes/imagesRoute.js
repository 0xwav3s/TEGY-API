var express = require('express');
//IMPORT CONTROLLER
var imageController = require('../controllers/imagesController');
var upload = require('../helper/cloudinaryService');
var printService = require('../helper/printServices/printServices');
var router = express.Router();
module.exports = function (app) {

    let routerName = '/uploads';
    router.post('/addImage', upload.multer.any(), imageController.UploadImages_POST);
    router.post('/ckAddImage', upload.multer.any(), imageController.ckEditorUpload_POST);
    router.post('/printInvoice', printService.printImage);
    router.post('/printOrder', printService.printText);
    app.use(routerName, router);
}