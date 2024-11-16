const express = require('express');
const router = express.Router();
const User = require('../model/user');
const bcrypt = require('bcrypt');

// Route hiển thị trang đăng nhập
router.get('/login', (req, res) => res.render('login'));

// Route hiển thị trang đăng ký
router.get('/register', (req, res) => res.render('register'));

// Xử lý đăng ký người dùng
router.post('/register', async (req, res) => {
    const { fullname, email, phonenumber, password } = req.body;

    if (!fullname || !email || !phonenumber || !password) {
        return res.render('register', { errorMessage: "Tất cả các trường là bắt buộc!" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { errorMessage: "Email đã được sử dụng!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullname,
            email,
            phonenumber,
            password: hashedPassword,
            role: 'user'
        });

        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('register', { errorMessage: "Đã xảy ra lỗi khi đăng ký tài khoản!" });
    }
});

// Xử lý đăng nhập người dùng
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('login', { errorMessage: "Tất cả các trường là bắt buộc!" });
    }

    try {
        // Tìm người dùng dựa trên email hoặc số điện thoại
        const user = await User.findOne({
            $or: [{ email: username }, { phonenumber: username }]
        });

        if (!user) {
            return res.render('login', { errorMessage: "Tài khoản không tồn tại!" });
        }

        // So sánh mật khẩu đã nhập với mật khẩu đã hash
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.render('login', { errorMessage: "Mật khẩu không đúng!" });
        }

        // Thiết lập session cho người dùng
        req.session.user = user;
        req.session.successMessage = "Đăng nhập thành công!";
        
        // Chuyển hướng dựa trên vai trò của người dùng
        if (user.role === 'admin') {
            return res.redirect('/admin');
        } else if (user.role === 'barber') {
            return res.redirect('/staff');
        } else {
            return res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.render('login', { errorMessage: "Đã xảy ra lỗi khi đăng nhập!" });
    }
});

module.exports = router;
