const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv')
const AddressSchema = new mongoose.Schema({
  houseNumber: {
    type: String,
    required: true  // số nhà, ví dụ "123"
  },
  street: {
    type: String,
    required: true  // tên đường, ví dụ "Đường Lê Lợi"
  },
  ward: {
    type: String,
    required: true  // phường/xã, ví dụ "Phường Bến Thành"
  },
  district: {
    type: String,
    required: true  // quận/huyện, ví dụ "Quận 1"
  },
  city: {
    type: String,
    required: true  // tỉnh/thành phố, ví dụ "TP. Hồ Chí Minh"
  }
  });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullname: {type:String, required:false}, 
    birth: {type:Date, required: false},
    email: {type:String, required:true, unique:true},
    gender: {type:String, required:false},
    CCCD: {type:String, required:false},
    role:{type:String,default:'patient'},
    phone: {type:String, required:false, unique:false}, 
    address: { type: AddressSchema, required: false },
    isBanned: {type: String, default: false}
});

// Hash mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, parseInt(process.env.SALT_ROUNDS));
    next();
});

// Hàm kiểm tra mật khẩu
userSchema.methods.matchPasswords = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;