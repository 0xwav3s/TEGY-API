var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;

var bcrypt = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({
    _id: String,
    userSeq: Number,
    local: {
        username: { type: String, unique: true, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        fullname: { type: String, required: true },
        phone: { type: String, required: true },
        gender: {
            type: String, enum: [
                "Nam",
                "Nữ"
            ]
        },
        bio: String,
        birthday: { type: Date },
        role: { type: String, ref: 'roles' },
        avatar: { type: String, ref: 'images' },
        createTime: { type: Date, default: Date.now() },
        updateTime: { type: Date, default: Date.now() },
        tokenExpires: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
    },
    // facebook: {
    //     id: String,
    //     token: String,
    //     email: String,
    //     name: String
    // },
    // twitter: {
    //     id: String,
    //     token: String,
    //     displayName: String,
    //     username: String
    // },
    // google: {
    //     id: String,
    //     token: String,
    //     email: String,
    //     name: String
    // }

});

// Các phương thức ======================
// Tạo mã hóa mật khẩu
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// kiểm tra mật khẩu có trùng khớp
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.validRePassword = function (password, rePassword) {
    return (password === rePassword) ? true : false;
};

//Can use
userSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'user',
    field: 'userSeq'
});
userSchema.pre('save', function (next) {
    if (this._id) this._id = "US0" + this.userSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('user', userSchema);