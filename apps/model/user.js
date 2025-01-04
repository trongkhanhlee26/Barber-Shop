const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: [true, "Vui lòng nhập tên đầy đủ!"] },
        email: { type: String, required: [true, "Vui lòng nhập email!"], unique: true },
        password: { type: String, required: [true, "Vui lòng nhập mật khẩu!"] },
        phonenumber: { type: String, required: [true, "Vui lòng nhập số điện thoại!"], unique: true },
        role: { type: String, enum: ['user', 'barber', 'admin'], default: 'user' }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
