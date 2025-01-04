const express = require('express');
const router = express.Router();
const User = require('../model/user');
const Barber = require('../model/barber');
const Service = require('../model/service');

// Route để lấy danh sách tất cả các barber
router.get('/', async (req, res) => {
    try {
        // Tìm tất cả các barber và populate thông tin từ User và Service
        const barbers = await Barber.find()
            .populate('userId', 'fullname email') // Lấy thông tin từ User liên kết
            .populate('service', 'name'); // Lấy tên của Service

        if (!barbers || barbers.length === 0) {
            return res.status(404).json({ message: 'No barbers found' });
        }

        // Hiển thị dữ liệu barber trên trang 'team.ejs'
        res.render('team', { barbers });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách barber:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
