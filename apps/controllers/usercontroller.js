const express = require('express');
const router = express.Router();
const User = require('../model/user');
const bcrypt = require('bcrypt');

// Middleware kiểm tra người dùng đã đăng nhập
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// Hiển thị trang cá nhân của người dùng
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('Không tìm thấy người dùng!');
        }

        res.render('profile', { user });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error');
    }
});

// Hàm xử lý cập nhật thông tin người dùng và kiểm tra trùng số điện thoại
router.post('/update-profile', isAuthenticated, async (req, res) => {
    try {
        const { fullname, phonenumber } = req.body;
        const userId = req.session.user._id;

        // Kiểm tra xem số điện thoại đã tồn tại chưa
        const existingUser = await User.findOne({ phonenumber });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.json({ success: false, message: 'Số điện thoại đã được sử dụng.' });
        }

        // Cập nhật thông tin người dùng trong cơ sở dữ liệu
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullname, phonenumber },
            { new: true }
        );

        if (updatedUser) {
            return res.json({ success: true, message: 'Cập nhật thành công!' });
        } else {
            return res.json({ success: false, message: 'Không tìm thấy người dùng!' });
        }
    } catch (error) {
        console.error('Lỗi cập nhật:', error);
        return res.json({ success: false, message: 'Có lỗi xảy ra khi cập nhật!' });
    }
});

// Route để thay đổi mật khẩu
router.post('/change-password', isAuthenticated, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
        }
        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Mật khẩu cũ không đúng. Vui lòng thử lại.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: 'Thay đổi mật khẩu thành công.' });
    } catch (error) {
        console.error('Lỗi khi thay đổi mật khẩu:', error);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống.' });
    }
});

module.exports = router;
