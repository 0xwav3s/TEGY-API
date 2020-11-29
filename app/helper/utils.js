const fs = require('fs')

module.exports.formatDate = function (date_ob) {
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return date + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
};

module.exports.formatDateNotHours = function (date_ob) {
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    return date + "/" + month + "/" + year
};

module.exports.createDate = function (time) {
    return new Date(time).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false })
}

module.exports.getFullUrl = function (req, endpoint) {
    // return req.protocol + '://' + req.get('host') + req.originalUrl;
    return req.protocol + '://' + req.get('host') + endpoint;
}

// This should work both there and elsewhere.
module.exports.isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

module.exports.getStartDate = function (date) {
    if (date) {
        date = new Date(date);
        date.setSeconds(00, 00);
        return date;
    } else {
        date = new Date();
        date.setHours(00, 00, 00, 00);
        date.setDate(date.getDate() + 1);
        return date;
    }
}

module.exports.getEndDate = function (date) {
    if (date) {
        date = new Date(date);
        date.setSeconds(00, 00);
        return date;
    } else {
        date = new Date();
        date.setHours(00, 00, 00, 00);
        return date;
    }
}

module.exports.formatOnlyHours = function (date_ob) {
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return hours + ":" + minutes + ":" + seconds;
};

module.exports.totalTime = function (timeIn) {
    var date1 = new Date(timeIn);
    var date2 = new Date();
    let distance = Math.abs(date1 - date2);
    const hours = Math.floor(distance / 3600000);
    distance -= hours * 3600000;
    const minutes = Math.floor(distance / 60000);
    distance -= minutes * 60000;
    const seconds = Math.floor(distance / 1000);
    return `${hours}:${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`;
}

module.exports.timeLeft = function (endDate) {
    var now = new Date();
    var diff = now - endDate;

    var hours = Math.floor(diff / 3.6e6);
    var minutes = Math.floor((diff % 3.6e6) / 6e4);
    var seconds = Math.floor((diff % 6e4) / 1000);
    var date = Math.floor(hours / 24);
    if (date > 0)
        return date + ' ngày ';
    if (hours > 0)
        return hours + ' tiếng ';
    if (minutes > 0)
        return minutes + ' phút ';
    if (seconds > 0)
        return seconds + ' giây ';
}

module.exports.formatTitle = function (str) {
    var limit = 20;
    if (str.length > limit) {
        var newStr = str.slice(0, limit);
        return newStr + "...";
    } else {
        return str;
    }
};

module.exports.getDate = function () {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    // return month + year;
    return "";
};

module.exports.getDateForLocal = function () {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return date + month + year + hours + minutes + seconds;
};

module.exports.removeFile = async function (filePath) {
    try {
        fs.unlinkSync(filePath);
        console.log("Complete remove file with path: " + filePath);
    } catch (err) {
        console.log(err);
    }
}

module.exports.getOnlyFileName = function (name) {
    var arr = name.split('.');
    return arr[0];
}

module.exports.isArray = function (object) {
    return object.constructor === Array;
}

module.exports.getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

module.exports.diff = function (a, b) {
    return (a === b) ? true : false;
}

module.exports.formatMoney = function (amount, decimalCount = 0, decimal = "", thousands = ",") {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        console.log(e)
    }
};

module.exports.removeVietnameseTones = function (str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g, " ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    return str;
}

module.exports.removePathUrl = function (path, url) {
    path = '&' + path + '=';
    var urlNoPath = url.split(path);
    var newPath = urlNoPath[0];
    if (urlNoPath.length > 1) {
        var endPath = urlNoPath[1];
        for (var i = 0; i <= endPath.length; i++) {
            if (endPath[i] === '&') {
                endPath = endPath.slice(i);
                newPath = newPath.concat(endPath);
                break;
            }
        }
    }
    return newPath
}