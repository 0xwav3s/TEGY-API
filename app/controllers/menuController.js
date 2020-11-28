

let config = require('config');
let db = require('../helper/loadModels');
let helper = require('../helper/utils');
let notify = require('../helper/notifyFunction');

let endpointAccount = config.get('endpoint').account;
let dirPage = 'admin/pages/dashboard/menu/';
let endpoint = config.get('endpoint').dashboard;
let cloud = require('../helper/cloudinaryService');

let limitPage = 20;
let limitPagination = 5;

module.exports = {
    viewAllMenu_GET: async function (req, res) {
        var filter = {};
        var cate = req.query.category;
        if (cate&&cate!='all') filter.category = cate;
        var page = (req.query.page) ? req.query.page - 1 : 0;
        var category = await db.MenuCategories.find().select("name");
        db.Menu
            .find(filter)
            .sort({ menuSeq: "asc" })
            .populate('category')
            .limit(limitPage)
            .skip(limitPage * page)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    return res.redirect(endpointAccount.logout);
                }
                console.log(items)
                db.Menu.countDocuments(filter).exec(function (errCount, count) {
                    // var count = item.count;
                    if (errCount) {
                        console.log(errCount)
                        return res.redirect(endpointAccount.logout);
                    }
                    var pageSize = Math.ceil(count / limitPage);    //Làm tròn số lớn
                    var pageCur = page + 1;
                    var firstPage = (pageCur > limitPagination) ? pageCur - limitPagination : 1;
                    var widthPage = pageSize - pageCur;
                    var lastPage = (widthPage > limitPagination) ? pageCur + limitPagination : pageCur + widthPage;
                    return res.render(dirPage + 'viewAllMenu.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        user: req.user,
                        data: items,
                        category: category,
                        cate: cate,
                        message: req.flash('menuMessage'),
                        page: pageCur,
                        firstPage: firstPage,
                        lastPage: lastPage
                    });
                })
            })
    },
    editMenu_GET: function (req, res) {
        var query = req.query;
        if (query.id) {
            db.Menu.findById(query.id, async function (err, item) {
                var menuCategories = await db.MenuCategories.find();
                if (item) {
                    return res.render(dirPage + 'detailMenu.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        message: req.flash('menuMessage'),
                        user: req.user,
                        item: item,
                        menuCategories: menuCategories,
                        price_unit: config.model.enum.price,
                        unit: config.model.enum.menu,
                        action: endpoint.action.edit
                    });
                } else {
                    notify.sendMessageByFlash(req, 'menuMessage', 'Something Wrong ! Please contact admin for help.')
                    return res.redirect('./' + endpoint.action.view);
                }
            });
        } else {
            notify.sendMessageByFlash(req, 'loginMessage', 'Something Wrong ! Please contact admin for help.')
            return res.redirect(endpointAccount.logout);
        }
    },
    editMenu_POST: function (req, res) {
        var files = req.files;
        var body = req.body;
        new Promise((resolve) => {
            db.Menu.findById(body.idMenu, async function (err, item) {
                item.available = (body.available) ? true : false;
                item.name = body.name;
                item.price = (body.currency_field) ? body.currency_field.replace(",", "") : "0";
                item.description = body.description;
                item.unit = body.unit;
                item.price_unit = body.price_unit;
                item.category = body.category;
                if (files && files.length > 0) {
                    console.log(files);
                    var menuImage = await cloud.UploadImageToCloud(files);
                    if (menuImage.newImages) {
                        item.image = menuImage.newImages[0].cloudImage;
                    } else {
                        item.image = menuImage.existsImages[0].cloudImage;
                    }
                }
                item.author = req.user._id;
                item.updateTime = Date.now();
                item.save((err) => {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                        console.log(err)
                        notify.sendMessageByFlash(req, 'menuMessage', 'Không thể lưu thông tin mới !');
                    } else {
                        notify.sendMessageByFlashType(req, 'menuMessage', 'success', 'Lưu thông tin mới thành công!');
                    }
                    resolve();
                })
            });
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    createMenu_GET: async function (req, res) {
        var menuCategories = await db.MenuCategories.find();
        return res.render(dirPage + 'detailMenu.ejs', {
            helper: helper,
            endpoint: endpoint,
            endpointAccount: endpointAccount,
            message: req.flash('menuMessage'),
            menuCategories: menuCategories,
            price_unit: config.model.enum.price,
            unit: config.model.enum.menu,
            user: req.user,
            action: endpoint.action.create,
            item: false
        });
    },
    createMenu_POST: function (req, res) {
        var body = req.body;
        var files = req.files;
        new Promise(async (resolve) => {
            var item = new db.Menu();
            item.available = (body.available) ? true : false;
            item.name = body.name;
            item.price = (body.currency_field) ? body.currency_field.replace(",", "") : "0";
            item.description = body.description;
            item.unit = body.unit;
            item.price_unit = body.price_unit;
            item.category = body.category;
            if (files && files.length > 0) {
                console.log(files);
                var menuImage = await cloud.UploadImageToCloud(files);
                if (menuImage.newImages) {
                    item.image = menuImage.newImages[0].cloudImage;
                } else {
                    item.image = menuImage.existsImages[0].cloudImage;
                }
            }
            item.author = req.user._id;
            item.save((err) => {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    notify.sendMessageByFlash(req, 'menuMessage', 'Không thể lưu thông tin mới !');
                } else {
                    notify.sendMessageByFlashType(req, 'menuMessage', 'success', 'Lưu thông tin mới thành công!');
                }
                resolve();
            })
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    deleteMenu_POST: function (req, res) {
        new Promise((resolve) => {
            var id = req.query.id;
            db.Menu.remove({ _id: id }, function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    notify.sendMessageByFlash(req, 'menuMessage', 'Không thể lưu thông tin mới !');
                } else {
                    notify.sendMessageByFlashType(req, 'menuMessage', 'success', 'Xóa mục ' + id + ' mới thành công!');
                }
                resolve();
            });
        }).then(() => {
            return res.redirect('..' + endpoint.menu.menu + endpoint.subPath);
        })
    },

    viewAllMenuCategories_GET: function (req, res) {
        var filter = {};
        var page = (req.query.page) ? req.query.page - 1 : 0;
        db.MenuCategories
            .find(filter)
            .sort({ updateTime: "desc" })
            .limit(limitPage)
            .skip(limitPage * page)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    return res.redirect(endpointAccount.logout);
                }
                db.MenuCategories.countDocuments(filter).exec(function (errCount, count) {
                    // var count = item.count;
                    if (errCount) {
                        console.log(errCount)
                        return res.redirect(endpointAccount.logout);
                    }
                    var pageSize = Math.ceil(count / limitPage);    //Làm tròn số lớn
                    var pageCur = page + 1;
                    var firstPage = (pageCur > limitPagination) ? pageCur - limitPagination : 1;
                    var widthPage = pageSize - pageCur;
                    var lastPage = (widthPage > limitPagination) ? pageCur + limitPagination : pageCur + widthPage;
                    return res.render(dirPage + 'viewMenuCategories.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        user: req.user,
                        data: items,
                        message: req.flash('menuCategoriesMessage'),
                        page: pageCur,
                        firstPage: firstPage,
                        lastPage: lastPage
                    });
                })
            })
    },
    editMenuCategories_GET: function (req, res) {
        var query = req.query;
        if (query.id) {
            db.MenuCategories.findById(query.id, function (err, item) {
                if (item) {
                    return res.render(dirPage + 'detailMenuCategories.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        message: req.flash('menuCategoriesMessage'),
                        user: req.user,
                        item: item,
                        action: endpoint.action.edit
                    });
                } else {
                    notify.sendMessageByFlash(req, 'menuCategoriesMessage', 'Something Wrong ! Please contact admin for help.')
                    return res.redirect('.' + endpoint.menu.menuCategories);
                }
            });
        } else {
            notify.sendMessageByFlash(req, 'loginMessage', 'Something Wrong ! Please contact admin for help.')
            return res.redirect(endpointAccount.logout);
        }
    },
    editMenuCategories_POST: function (req, res) {
        var body = req.body;
        new Promise((resolve) => {
            db.MenuCategories.findById(body.idMenuCategories, function (err, item) {
                item.available = (body.available) ? true : false;
                item.name = body.nameMenuCategories;
                item.description = body.description;
                item.author = req.user._id;
                item.updateTime = Date.now();
                item.save((err) => {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                        console.log(err)
                        notify.sendMessageByFlash(req, 'menuCategoriesMessage', 'Không thể lưu thông tin mới !');
                    } else {
                        notify.sendMessageByFlashType(req, 'menuCategoriesMessage', 'success', 'Lưu thông tin mới thành công!');
                    }
                    resolve();
                })
            });
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    createMenuCategories_GET: function (req, res) {
        return res.render(dirPage + 'detailMenuCategories.ejs', {
            helper: helper,
            endpoint: endpoint,
            endpointAccount: endpointAccount,
            message: req.flash('menuCategoriesMessage'),
            user: req.user,
            action: endpoint.action.create,
            item: false
        });
    },
    createMenuCategories_POST: function (req, res) {
        var body = req.body;
        new Promise((resolve) => {
            var item = new db.MenuCategories();
            item.available = (body.available) ? true : false;
            item.name = body.nameMenuCategories;
            item.description = body.description;
            item.author = req.user._id;
            item.save((err) => {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                    console.log(err)
                    notify.sendMessageByFlash(req, 'menuCategoriesMessage', 'Không thể lưu thông tin mới !');
                } else {
                    notify.sendMessageByFlashType(req, 'menuCategoriesMessage', 'success', 'Lưu thông tin mới thành công!');
                }
                resolve();
            })
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    deleteMenuCategories_POST: function (req, res) {
        new Promise((resolve) => {
            var id = req.query.id;
            db.MenuCategories.remove({ _id: id }, function (err) {
                if (!err) {
                    db.Menu.remove({ 'menuCategories': id }, function (err, items) {
                        if (err) {
                            mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')

                            console.log(err)
                            notify.sendMessageByFlash(req, 'menuCategoriesMessage', 'Không thể lưu thông tin mới !');
                        } else {
                            notify.sendMessageByFlashType(req, 'menuCategoriesMessage', 'success', 'Xóa mục ' + id + ' và ' + JSON.stringify(items) + ' mới thành công!');
                        }
                        resolve();
                    })
                }
                else {
                    notify.sendMessageByFlash(req, 'menuCategoriesMessage', 'Không thể lưu thông tin mới !');
                    resolve();
                }
            })
        }).then(() => {
            return res.redirect('..' + endpoint.menu.categories + endpoint.subPath);
        })
    }
};;
