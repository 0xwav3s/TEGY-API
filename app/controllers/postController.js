

let config = require('config');
let db = require('../helper/loadModels');
let helper = require('../helper/utils');
let notify = require('../helper/notifyFunction');

let endpointAccount = config.get('endpoint').account;
let dirPage = 'admin/pages/dashboard/articles/';
let endpoint = config.get('endpoint').dashboard;

let limitPage = 7;
let limitPagination = 5;

module.exports = {

    // view_GET: function (req, res) {
    //     var view = req.query.view;
    //     console.log(view);
    //     switch (view) {
    //         case 'news':
    //             postController.viewAllArticles_GET(req, res);
    //             break;
    //         case 'cateories':
    //             postController.viewAllCat_GET(req, res);
    //             break;
    //         default:
    //             postController.viewAllArticles_GET(req, res);
    //     }
    // },

    viewAllArticles_GET: function (req, res) {
        var filter = {};
        var page = (req.query.page) ? req.query.page - 1 : 0;
        db.Article
            .find(filter)
            .sort({ updateTime: "desc" })
            .populate('category')
            .populate('author')
            .limit(limitPage)
            .skip(limitPage * page)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' +err.stack +'')

                    console.log(err)
                    return res.redirect(endpointAccount.logout);
                }
                db.Article.countDocuments(filter).exec(function (errCount, count) {
                    // var count = items.length;
                    if (errCount) {
                        console.log(errCount)
                        return res.redirect(endpointAccount.logout);
                    }
                    var pageSize = Math.ceil(count / limitPage);    //Làm tròn số lớn
                    var pageCur = page + 1;
                    var firstPage = (pageCur > limitPagination) ? pageCur - limitPagination : 1;
                    var widthPage = pageSize - pageCur;
                    var lastPage = (widthPage > limitPagination) ? pageCur + limitPagination : pageCur + widthPage;
                    return res.render(dirPage + 'viewArticles.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        message: req.flash('articleMessage'),
                        user: req.user,
                        data: items,
                        page: pageCur,
                        firstPage: firstPage,
                        lastPage: lastPage
                    });
                })
            })
    },
    editArticle_GET: function (req, res) {
        var query = req.query;
        if (query.id) {
            db.Article.findById(query.id, async function (err, item) {
                var categories = await db.ArtCategories.find();
                if (item) {
                    return res.render(dirPage + 'detailArticle.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        message: req.flash('articleMessage'),
                        user: req.user,
                        item: item,
                        categories: categories,
                        action: endpoint.action.edit
                    });
                } else {
                    notify.sendMessageByFlash(req, 'articleMessage', 'Something Wrong ! Please contact admin for help.')
                    return res.redirect('./' + endpoint.action.view);
                }
            });
        } else {
            notify.sendMessageByFlash(req, 'loginMessage', 'Something Wrong ! Please contact admin for help.')
            return res.redirect(endpointAccount.logout);
        }
    },
    editArticle_POST: function (req, res) {
        var body = req.body;
        new Promise((resolve) => {
            db.Article.findById(body.idArticle, function (err, item) {
                item.available = (body.available) ? true : false;
                item.title = body.nameArticle;
                item.category = body.category;
                item.content = body.ckeditor;
                item.keywords = body.keywords;
                item.author = req.user._id;
                item.updateTime = Date.now();
                item.save((err) => {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' +err.stack +'')

                        console.log(err)
                        notify.sendMessageByFlash(req, 'articleMessage', 'Không thể lưu thông tin mới !');
                    } else {
                        notify.sendMessageByFlashType(req, 'articleMessage', 'success', 'Lưu thông tin mới thành công!');
                    }
                    resolve();
                })
            });
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    createArticle_GET: async function (req, res) {
        var categories = await db.ArtCategories.find();
        return res.render(dirPage + 'detailArticle.ejs', {
            helper: helper,
            endpoint: endpoint,
            endpointAccount: endpointAccount,
            message: req.flash('articleMessage'),
            categories: categories,
            user: req.user,
            action: endpoint.action.create,
            item: false
        });
    },
    createArticle_POST: function (req, res) {
        var body = req.body;
        new Promise((resolve) => {
            var item = new db.Article();
            item.available = (body.available) ? true : false;
            item.title = body.nameArticle;
            item.category = body.category;
            item.content = body.ckeditor;
            item.keywords = body.keywords;
            item.author = req.user._id;
            item.updateTime = Date.now();
            item.save((err) => {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' +err.stack +'')

                    console.log(err)
                    notify.sendMessageByFlash(req, 'articleMessage', 'Không thể lưu thông tin mới !');
                } else {
                    notify.sendMessageByFlashType(req, 'articleMessage', 'success', 'Lưu thông tin mới thành công!');
                }
                resolve();
            })
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    deleteArticle_POST: function (req, res) {
        new Promise((resolve) => {
            var id = req.query.id;
            db.Article.remove({ _id: id }, function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' +err.stack +'')

                    console.log(err)
                    notify.sendMessageByFlash(req, 'articleMessage', 'Không thể lưu thông tin mới !');
                } else {
                    notify.sendMessageByFlashType(req, 'articleMessage', 'success', 'Xóa mục ' + id + ' mới thành công!');
                }
                resolve();
            });
        }).then(() => {
            return res.redirect('..' + endpoint.art.articles);
        })
    },

    viewAllCat_GET: function (req, res) {
        var filter = {};
        var page = (req.query.page) ? req.query.page - 1 : 0;
        db.ArtCategories
            .find(filter)
            .sort({ updateTime: "desc" })
            .limit(limitPage)
            .skip(limitPage * page)
            .exec(function (err, items) {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' +err.stack +'')

                    console.log(err)
                    return res.redirect(endpointAccount.logout);
                }
                db.ArtCategories.countDocuments(filter).exec(function (errCount, count) {
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
                    return res.render(dirPage + 'viewCatArt.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        user: req.user,
                        data: items,
                        message: req.flash('categoryMessage'),
                        page: pageCur,
                        firstPage: firstPage,
                        lastPage: lastPage
                    });
                })
            })
    },
    editCategory_GET: function (req, res) {
        var query = req.query;
        if (query.id) {
            db.ArtCategories.findById(query.id, function (err, item) {
                if (item) {
                    return res.render(dirPage + 'detailCategory.ejs', {
                        helper: helper,
                        endpoint: endpoint,
                        endpointAccount: endpointAccount,
                        message: req.flash('categoryMessage'),
                        user: req.user,
                        item: item,
                        action: endpoint.action.edit
                    });
                } else {
                    notify.sendMessageByFlash(req, 'categoryMessage', 'Something Wrong ! Please contact admin for help.')
                    return res.redirect('.' + endpoint.art.categories);
                }
            });
        } else {
            notify.sendMessageByFlash(req, 'loginMessage', 'Something Wrong ! Please contact admin for help.')
            return res.redirect(endpointAccount.logout);
        }
    },
    editCategory_POST: function (req, res) {
        var body = req.body;
        new Promise((resolve) => {
            db.ArtCategories.findById(body.idCategory, function (err, item) {
                item.available = (body.available) ? true : false;
                item.name = body.nameCategory;
                item.description = body.description;
                item.author = req.user._id;
                item.updateTime = Date.now();
                item.save((err) => {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' +err.stack +'')

                        console.log(err)
                        notify.sendMessageByFlash(req, 'categoryMessage', 'Không thể lưu thông tin mới !');
                    } else {
                        notify.sendMessageByFlashType(req, 'categoryMessage', 'success', 'Lưu thông tin mới thành công!');
                    }
                    resolve();
                })
            });
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    createCategory_GET: function (req, res) {
        return res.render(dirPage + 'detailCategory.ejs', {
            helper: helper,
            endpoint: endpoint,
            endpointAccount: endpointAccount,
            message: req.flash('categoryMessage'),
            user: req.user,
            action: endpoint.action.create,
            item: false
        });
    },
    createCategory_POST: function (req, res) {
        var body = req.body;
        new Promise((resolve) => {
            var item = new db.ArtCategories();
            item.available = (body.available) ? true : false;
            item.name = body.nameCategory;
            item.description = body.description;
            item.author = req.user._id;
            item.save((err) => {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' +err.stack +'')

                    console.log(err)
                    notify.sendMessageByFlash(req, 'categoryMessage', 'Không thể lưu thông tin mới !');
                } else {
                    notify.sendMessageByFlashType(req, 'categoryMessage', 'success', 'Lưu thông tin mới thành công!');
                }
                resolve();
            })
        }).then(() => {
            return res.redirect(req.originalUrl);
        });
    },
    deleteCategory_POST: function (req, res) {
        new Promise((resolve) => {
            var id = req.query.id;
            db.ArtCategories.remove({ _id: id }, function (err) {
                if (!err) {
                    db.Article.remove({ 'category': id }, function (err, items) {
                        if (err) {
                            mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' +err.stack +'')

                            console.log(err)
                            notify.sendMessageByFlash(req, 'categoryMessage', 'Không thể lưu thông tin mới !');
                        } else {
                            notify.sendMessageByFlashType(req, 'categoryMessage', 'success', 'Xóa mục ' + id + ' và ' + JSON.stringify(items) + ' mới thành công!');
                        }
                        resolve();
                    })
                }
                else {
                    notify.sendMessageByFlash(req, 'categoryMessage', 'Không thể lưu thông tin mới !');
                    resolve();
                }
            })
        }).then(() => {
            return res.redirect('..' + endpoint.art.categories);
        })
    }
};;
