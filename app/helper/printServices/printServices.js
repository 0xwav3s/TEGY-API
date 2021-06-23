const escpos = require('escpos');
escpos.USB = require('escpos-usb');
const nodeHtmlToImage = require('node-html-to-image');
const config = require('config');
const helper = require('../utils');
const fs = require('fs')
const portInvoice = 2;
const portKitchen = 3;
var db = require('../dbHelper');
var mailService = require('../mailService');
var notifyString = "[Warning]: Chưa tìm máy in !";
var strArr = [];
//Define Máy in
var printer;
var device;
var printer2;
var device2;

module.exports.findAndSetPrinter = () => {
    try {
        notifyString = "";
        var devices = escpos.USB.findPrinter();
        if (!devices.length) {
            notifyString += "[Error]: Không tìm thấy máy in";
            notifyString += "\nVui lòng mở máy in tắt mở lại ứng dụng !";
            console.log(notifyString);
            strArr.push('danger');
            strArr.push(notifyString);
        } else {
            devices.forEach(function (el) {
                var nPort = el.portNumbers.length - 1;
                var portNumber = el.portNumbers[nPort];
                if (portNumber === portInvoice) {
                    device = new escpos.USB(el);
                    printer = new escpos.Printer(device);
                    notifyString += 'Cổng USB0' + portNumber + " kết nối máy in thành công !";
                    console.log(notifyString);
                } else if (portNumber === portKitchen) {
                    const options = { encoding: "1258" /* default */ }
                    device2 = new escpos.USB(el);
                    printer2 = new escpos.Printer(device2, options);
                    notifyString += '\nCổng USB0' + portNumber + " kết nối máy in thành công !";
                    console.log(notifyString);
                }
            })
            if (device && device2 && printer && printer2) {
                strArr.push('success');
                strArr.push(notifyString);
            } else {
                strArr.push('warning');
                if (!printer) {
                    notifyString += '\nLỗi kết nối ở máy in Hóa Đơn !';
                }
                if (!printer2) {
                    notifyString += '\nLỗi kết nối ở máy in trong Bếp !';
                }
                if (!device) {
                    notifyString += '\nKhông tìm thấy máy in Hóa Đơn !';
                }
                if (!device2) {
                    notifyString += '\nKhông tìm thấy máy in trong Bếp !';
                }
                strArr.push(notifyString);
            }
        }
    } catch (err) {
        notifyString += "[Error]: Lỗi không xác định";
        console.log(notifyString);
        mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
    }
}
module.exports.printImage = (req, res) => {
    var user = req.user.local.fullname;
    var billId = req.body.billId;
    var table = req.body.table;
    var total = req.body.total;
    var dateTimeIn = new Date(req.body.timeIn);
    var date = helper.formatDateNotHours(dateTimeIn);
    var dateIn = helper.createDate(dateTimeIn).split(', ');
    var dateOut = helper.createDate(new Date()).split(', ');
    var timeIn = dateIn[1].trim();
    var timeOut = dateOut[1].trim();
    var totalTime = helper.totalTime(req.body.timeIn);
    var items = req.body.menu;
    var data = "";
    for (var item of items) {
        data += `<tr>
        <td class="text-left">`+ item.name + `</td>
        <td class="text-center">`+ item.count + `</td>
        <td class="text-right">`+ helper.formatMoney(item.price) + `</td>
        <td class="text-right">`+ helper.formatMoney(item.pay) + `</td>
    </tr>`
    }
    var imagePrint = './images.png';
    nodeHtmlToImage({
        output: imagePrint,
        html: `<!doctype html>
        <html lang="en">
        
        <head>
            <title>HÓA ĐƠN</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
            <!-- <link rel="stylesheet" href="bootstrap.min.css"> -->
            <link rel="stylesheet" href="http://localhost:` + config.port + `/css/bootstrap.min.css"> 
        
        </head>
        <style>
            body {
                width: 385.8px;
                height: auto;
                font-size: 30px;
            }
        
            table {
                border-collapse: collapse;
                width: 100%;
            }
        
            table,
            th,
            td {
                border: 1px solid black;
            }
        </style>
        
        <body>
            <div class="card">
                <div class="p-0 bg-light text-center">
                    <h1 class="font-weight-bold m-0">NGỌC HẢI</h1>
                    <p style="font-size: 20px;line-height: 1;" class="font-weight-bold m-0">HỦ TÍU NAM VANG - BÁNH CANH CUA</p>
                    <p style="font-size: 18px;line-height: 1.1;" class="p-0 mb-0" style="line-height: 1;">467 Hùng Vương, Châu Đức, BR-VT</p>
                    <p style="font-size: 18px;line-height: 1.1;" class="p-0 mb-0" style="line-height: 1;">SĐT: <span class="font-weight-bold">037.47.85.005</span></p>
                    <div class="row text-left p-0" style="font-size: 20px;line-height: 1;">
                        <div class="col-6">
                            <span class="font-weight-bold">Mã HĐ: </span>`+ billId + `
                        </div>
                        <div class="col-6">
                            <span class="font-weight-bold">Thu ngân: </span>`+ user + `
                        </div>
                    </div>
                    <div class="row text-left p-0" style="font-size: 20px;line-height: 1;">
                        <div class="col-6">
                            <span class="font-weight-bold">Ngày: </span>`+ date + `
                        </div>
                        <div class="col-6">
                            <span class="text-right font-weight-bold">Bàn: </span>
                            <span>`+ table + `</span>
                        </div>
                        <div class="col-6">
                            <span class="font-weight-bold">Giờ vào: </span>`+ timeIn + `
                        </div>
                        <div class="col-6">
                            <span class="text-right font-weight-bold">Giờ ra: </span>`+ timeOut + `
                        </div>
                        <div class="col-12">
                            <span class="text-right font-weight-bold">Tổng thời gian: </span>`+ totalTime + `
                        </div>
                    </div>
                    <h4 class="font-weight-bold m-3">HÓA ĐƠN TÍNH TIỀN</h4>
                </div>
                <hr class="bg-dark m-0">
                <div class="card-body m-0 p-0">
                    <div class="">
                        <table class="">
                            <thead>
                                <tr>
                                    <th class="text-center">Món ăn</th>
                                    <th class="text-center">SL</th>
                                    <th class="text-center">Giá</th>
                                    <th class="text-center">Tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                `+ data + `
                                
                            </tbody>
                        </table>
                    </div>
                    <hr class="bg-dark m-0">
                    <table class="table table-borderless">
                        <tbody>
                            <tr>
                                <td class="justify-content-start m-0 p-0">
                                    <strong>Tổng cộng</strong>
                                </td>
                                <td class="text-right m-0 p-0">
                                    <strong>`+ helper.formatMoney(total) + `</strong>
                                </td>
                            </tr>
        
                        </tbody>
                    </table>
                    <div class="text-center" style="line-height: 0.5;font-size: 20px;">
                        <p class="font-weight-bold">Cảm Ơn Quý Khách</p>
                        <p class="font-weight-bold">Hẹn Gặp Lại!</p>
                        <p class="font-weight-bold" style="font-size: 18px;font-style:italic;">Giải pháp phần mềm quản lý TEGY.VN</p>
                    </div>
                </div>
            </div>`
    }).then(() => {
        // console.log(req.body);
        // return res.json({
        //     "result": "ok"
        // })
        escpos.Image.load(imagePrint, 'image/png', function (image) {
            try {
                device.open(function () {
                    printer
                        .align('LT')
                        .image(image, 'D24')
                        .then(() => {
                            printer.cut().close();
                            return res.json({
                                "result": "ok"
                            })
                        });
                })
            } catch (err) {
                mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
                console.log(strArr);
                return res.json({
                    "result": strArr
                })
            }
        })
    })
}


module.exports.printText = (data) => {
    return new Promise(async (resolve) => {
        var date = helper.formatDate(new Date());
        var menuAll = await db.Menu.find();
        try {
            device2.open(function () {
                printer2
                    .align('ct')
                    .style('normal')
                    .size(0.01, 0.01)
                    // .text('------------ ' + data.id + ' ------------')
                    .text('************ ' + data.id + ' ************')
                    .size(0.1, 0.1)
                    .style('bu')
                    .text('Ban an ' + data.table)
                    .style('normal')
                    .align('LT')
                    .size(0.01, 0.01)
                    // .text('Thoi gian: ' + date)
                    // .text('NV Phuc Vu: ' + data.author)
                    .text('                              ');
                for (var ord of data.orders) {
                    var menu = getNameMenu(menuAll, ord.menu);
                    printer2
                        .align('LT')
                        .style('normal')
                        .size(0.08, 0.08)
                        .text(helper.removeVietnameseTones(ord.amount + ' ' + menu.name))
                        //.text(ord.amount + ' ' + menu.name)
                        .size(0.05, 0.05)
                    if (ord.note)
                        printer2.text(helper.removeVietnameseTones('GHI CHÚ: ' + ord.note))
                }
                printer2
                    .align('LT')
                    .style('normal')
                    .size(1, 1);
                //.text('________________');
                printer2.cut().close()
                resolve(true);
            });
        } catch (err) {
            console.log(err);
            mailService.sendMail(config.mail.recieverError, 'Error Delivery From Ngoc Hai', 'Error: ' + err.stack + '')
            resolve(false);
        }
    })
}

module.exports.testPrinter = () => {
    var result = ["success"]
    var str = "";
    return new Promise(async (resolve) => {
        try {
            var text1 = 'May in Hoa Don hoat dong'
            await device.open(function () {
                printer
                    .align('ct')
                    .style('normal')
                    .size(0.1, 0.1)
                    .text(text1)
                printer.cut().close()
                str += text1;
            });
        } catch (err) {
            result[0] = "warning";
            console.log(err);
            str += "Lỗi máy in Hóa đơn";
        }
        try {
            var text2 = 'May in trong Bep hoat dong'
            await device2.open(function () {
                printer2
                    .align('ct')
                    .style('normal')
                    .size(0.1, 0.1)
                    .text(text2)
                printer2.cut().close()
                str += text2;
            });
        } catch (err) {
            console.log(err);
            result[0] = "danger";
            str += " Lỗi máy in trong Bếp";
        }
        result.push(str);
        resolve(result);
        fs.writeFile('text.json', 'Hello World!', function (err) {
            if (err) return console.log(err);
            console.log('Hello World > helloworld.txt');
        });
    })
}

function getNameMenu(menuAll, id) {
    for (var me of menuAll) {
        if (me._id === id) {
            return me;
        }
    }
}

module.exports.statusPrinter = function () {
    return strArr;
}