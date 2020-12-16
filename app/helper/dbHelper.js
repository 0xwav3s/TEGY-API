let User = require('../models/User');
let ArtCategories = require('../models/ArtCategories');
let Counter = require('../models/Counter');
let Article = require('../models/Article');
let Menu = require('../models/Menu');
let MenuCategories = require('../models/MenuCategories');
let Images = require('../models/Images');
let Bill = require('../models/Bill');
let Order = require('../models/Order');
let Table = require('../models/Table');
let TaxPromotions = require('../models/TaxPromotions');
let Zone = require('../models/Zone');
let Response = require('../models/Response');

const config = require('config');
const helper = require('./utils');
const mailService = require('./mailService');
module.exports = {
    Response,
    User,
    ArtCategories,
    Article,
    Menu,
    MenuCategories,
    Images,
    Bill,
    Order,
    Table,
    TaxPromotions,
    Zone,
    Counter,
    setPropertyForModel,
    hasPropertyFromModel,
    createNewItem,
    updateItemById,
    removeItemById
};


function setPropertyForModel(item, body) {
    for (let i in body) {
        if (hasPropertyFromModel(item, i)) {
            item[i] = body[i]
        } else {
            return 'Property "' + i + '" is missing.';
        }
    }
    return item;
}

function hasPropertyFromModel(item, property) {
    if (!item || !property)
        return false
    return item.schema.paths.hasOwnProperty(property)
}

function createNewItem(model, body) {
    console.log('Create new item ' + model);
    console.log('Request body: ' + body);
    return new Promise((resolve, rejects) => {
        let item = new this[model];
        item = setPropertyForModel(item, body);
        if (item.constructor.modelName) {
            item.updateTime = Date.now();
            item.save((err, rs) => {
                if (err) {
                    mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                    console.log(err)
                    rejects(err);
                } else {
                    resolve(rs);
                }
            })
        } else {
            rejects(item);
        }
    })
}

function updateItemById(model, id, body) {
    console.log('Update ' + model + ' by ID: ' + id);
    console.log('Request body: ' + body);
    return new Promise((resolve, rejects) => {
        this[model].findById(id, function (err, item) {
            if (err) rejects(err);
            if (!item) rejects('Can not find ' + model + ' by Id: ' + id);
            item = setPropertyForModel(item, body);
            if (item.constructor.modelName) {
                item.save((err, rs) => {
                    if (err) {
                        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                        console.log(err)
                        rejects(err);
                    } else {
                        resolve(rs);
                    }
                })
            } else {
                rejects(item);
            }
        });
    })
}

function removeItemById(modelName, id, refList = []) {
    console.log('Remove ' + modelName + ' by ID: ' + id);
    let message = '';
    return new Promise((resolve, rejects) => {
        let model = this[modelName];
        model.findByIdAndRemove({ _id: id }, async function (err, rs) {
            if (err) rejects(err);
            if (!rs) rejects(modelName + ' by ID: ' + id + ' not exists.')
            message += 'Succsessful remove ' + modelName + ' by ID: ' + id;
            console.log(message)
            // if (refList.length > 0) {
            //     await Promise.all(refList.map((ref) => {
            //         let ob1 = { "zone": id}
            //         let refModel = Table;
            //         refModel.updateMany(
            //             ob1,
            //             { $unset: { zone: 1 } },
            //             function (err, res){
            //                 if (err) throw err;
            //                 resolve(res);
            //             }
            //         );
            //     }))
            // }
            resolve(message);
        });
    })
}

function getRefListForRemove(model) {
    let refList = [];
    let paths = model.schema.paths;
    let ob = {};
    const allowed = [
        'options'
    ];
    for (let k in paths) {
        let raw = paths[k];
        const filtered = Object.keys(raw)
            .filter(key => allowed.includes(key))
            .reduce((obj, key) => {
                obj[key] = raw[key];
                return obj;
            }, {});
        ob[k] = filtered;
    }
    delete ob.__v
    return ob;
}

if (config.dev) {
    autoCreateForTest();
}

function autoCreateForTest() {
    let viet = 'vle34';
    User.findOne({ 'local.username': viet }, function (err, user) {
        if (err) {
            console.log(err);
            return;
        }
        if (!user) {
            var newUser = new User();
            newUser.local.username = viet;
            newUser.local.fullname = 'Viet Le';
            newUser.local.email = 'vietle169@gmail.com';
            newUser.local.phone = '0383260263';
            newUser.local.password = newUser.generateHash('123123');
            newUser.save(function (err) {
                if (err) {
                    console.log(err)
                    return;
                }
                console.log("Create new account " + viet);
            });
            var newUser2 = new User();
            newUser2.local.username = 'hau';
            newUser2.local.fullname = 'Hậu';
            newUser2.local.email = 'hau@gmail.com';
            newUser2.local.phone = '0374785005';
            newUser2.local.password = newUser.generateHash('123');
            newUser2.save(function (err) {
                if (err) {
                    console.log(err)
                    return;
                }
                console.log("Create new account hau");
            });
            var newUser2 = new User();
            newUser2.local.username = 'quyen';
            newUser2.local.fullname = 'Quyền';
            newUser2.local.email = 'quyen@gmail.com';
            newUser2.local.phone = '0374785005';
            newUser2.local.password = newUser.generateHash('123');
            newUser2.save(function (err) {
                if (err) {
                    console.log(err)
                    return;
                }
                console.log("Create new account quyen");
            });
            for (var u = 1; u <= 10; u++) {
                var newUser3 = new User();
                newUser3.local.username = 'nv' + u;
                newUser3.local.fullname = 'nv' + u;
                newUser3.local.email = 'nv' + u + '@gmail.com';
                newUser3.local.phone = '0374785005';
                newUser3.local.password = newUser.generateHash('123');
                newUser3.save(function (err) {
                    if (err) {
                        console.log(err)
                        return;
                    }
                    console.log("Create new account nv" + u);
                });
            }
            return;
        }
        console.log("User exists !")
    });

    ArtCategories.countDocuments({}, function (err, count) {
        if (err) {
            console.log(err);
            return;
        }
        if (count > 0)
            console.log("Art cateories exists");
        else {
            for (var i = 1; i <= 20; i++) {
                var cat = new ArtCategories({
                    author: 'US01',
                    name: "Cat " + i,
                    description: "Description " + i,
                });
                cat.save(function (err, rs) {
                    if (err) {
                        console.log(err)
                        return;
                    }
                })
                console.log("Complete create => Cat " + i);
            }
        }
    }).then(() => {
        Article.countDocuments({}, function (err, count) {
            if (err) {
                console.log(err);
                return;
            }
            if (count > 0)
                console.log("Article exists");
            else {
                for (var i = 1; i <= 20; i++) {
                    var art = new Article({
                        author: 'US01',
                        category: 'AC0' + i,
                        title: "Title " + i,
                        content: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. " + i,
                    });
                    art.save(function (err, rs) {
                        if (err) {
                            console.log(err)
                            return;
                        }
                    })
                    console.log("Complete create => Art " + i);
                }
            }
        })
    });
    Zone.countDocuments({}, function (err, count) {
        if (err) {
            console.log(err);
            return;
        }
        if (count > 0)
            console.log("Zone exists");
        else {
            for (var i = 1; i <= 1; i++) {
                var cat = new Zone({
                    author: 'US01',
                    name: "Khu vực " + i,
                    description: "Description " + i,
                });
                cat.save(function (err, zone) {
                    if (err) {
                        console.log(err)
                        return;
                    }
                    console.log("Complete create => Zone " + i);
                    Table.countDocuments({}, async function (err, count) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        if (count > 0)
                            console.log("Table exists");
                        else {
                            for (var i = 1; i <= 20; i++) {
                                var art = new Table({
                                    author: 'US01',
                                    zone: 'ZO0' + 1,
                                    name: i,
                                    active: config.model.enum.active[1]
                                });
                                await art.save(function (err, rs) {
                                    if (err) {
                                        console.log(err)
                                        return;
                                    }
                                    zone.table.push(rs._id)
                                    console.log("Complete create => Table " + i);
                                })

                            }
                            setTimeout(async function () {
                                if (zone) zone.save((err) => {
                                    if (err) {
                                        console.log(err)
                                        return;
                                    }
                                    console.log('Complete save zone');
                                })
                            }, 1500)
                        }
                    })
                })
                setTimeout(function () {
                    //do what you need here
                }, 2000);
            }
        }
    });

    MenuCategories.countDocuments({}, function (err, count) {
        if (err) {
            console.log(err);
            return;
        }
        if (count > 0)
            console.log("Menu Categories exists");
        else {
            for (var i = 1; i <= 4; i++) {
                var cat = new MenuCategories({
                    author: 'US01',
                    name: "Loại thức ăn thứ " + i,
                    description: "Description " + i,
                });
                cat.save(function (err, rs) {
                    if (err) {
                        console.log(err)
                        return;
                    }
                })
                console.log("Complete create => MenuCategories " + i);
            }
        }
    }).then(() => {
        Menu.countDocuments({}, function (err, count) {
            if (err) {
                console.log(err);
                return;
            }
            if (count > 0)
                console.log("Menu exists");
            else {
                for (var i = 1; i <= 20; i++) {
                    var art = new Menu({
                        author: 'US01',
                        category: 'MC0' + helper.getRandomInt(1, 5),
                        name: "Bánh Canh Cua Type " + i,
                        price: i * 10000,
                        unit: config.model.enum.menu[helper.getRandomInt(0, 3)],
                        price_unit: config.model.enum.price[helper.getRandomInt(0, 3)],
                    });
                    art.save(function (err, rs) {
                        if (err) {
                            console.log(err)
                            return;
                        }
                    })
                    console.log("Complete create => Menu " + i);
                }
            }
        }).then(() => {
            // Bill.countDocuments({}, function (err, count) {
            //     if (err) {
            //         console.log(err);
            //         return;
            //     }
            //     if (count > 0)
            //         console.log("Bill exists");
            //     else {
            //         var order = new Order({
            //             price:1,
            //             total:1,
            //             amount:1,
            //             menu:"ME0"+helper.getRandomInt(1, 20),
            //             author: 'US01',
            //         })
            //         order.save(function (err, orderSave) {
            //             if (err) {
            //                 console.log(err)
            //                 return;
            //             }
            //             for (var i = 1; i <= 1000; i++) {
            //                 var bill = new Bill({
            //                     author: 'US01',
            //                     total_price_order: orderSave.total,
            //                     table: "TA01",
            //                     status: config.model.enum.bill[helper.getRandomInt(0, 3)],
            //                     order: orderSave._id
            //                 });
            //                 bill.save(function (err, rs) {
            //                     if (err) {
            //                         console.log(err)
            //                         return;
            //                     }
            //                 })
            //                 console.log("Complete create => Bill " + i);
            //             }
            //         })
            //     }
            // });
        })
    });


}