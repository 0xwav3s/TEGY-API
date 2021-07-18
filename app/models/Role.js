var dbHelper = require('../helper/database');
var mongoose = dbHelper.mongoose;
var autoIncrement = dbHelper.autoIncrement;

var roleSchema = mongoose.Schema({
    _id: String,
    roleSeq: Number,
    roleName: { type: String, unique: true, required: true },
    permissions:{
        type: String,
        required: true
    },
    available: { type: Boolean, default: true, required: true },
    createTime: { type: Date, default: Date.now() },
    updateTime: { type: Date, default: Date.now() }
});

//Can use
roleSchema.plugin(autoIncrement.plugin, {
    startAt: 1,
    model: 'role',
    field: 'roleSeq'
});

roleSchema.pre('save', function (next) {
    this._id = "RO0" + this.roleSeq;
    this.updateTime = Date.now();
    next();
});

module.exports = mongoose.model('role', roleSchema);