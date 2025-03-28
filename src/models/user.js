const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: {type:String, required:true, unique:true},
    birth: {type:Date, required: true},
    gender: {type:String, required:true},
    CCCD: {type:String, required:true, unique:true},
});

// Hash mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Hàm kiểm tra mật khẩu
userSchema.methods.matchPasswords = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;