const express = require('express');
const router = express.Router();
const Booking = require('../model/booking');
const Barber = require('../model/barber');
const User = require('../model/user'); // Import model User nếu cần

// Middleware xác thực
function isAuthenticated(req, res, next) {
    console.log("Session user:", req.session.user); // Kiểm tra thông tin phiên người dùng
    if (req.session.user) {
        return next();
    }
    res.status(401).send('Unauthorized'); // Trả về 401 nếu không xác thực
}

// Route để lấy danh sách đặt lịch của người dùng
router.get('/my-appointments', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user._id; // Lấy userId từ session

        // Tìm tất cả các cuộc hẹn của người dùng hiện tại
        const bookings = await Booking.find({ user: userId })
            .populate({
                path: 'barber',
                select: 'name' // Chỉ lấy tên barber
            })
            .populate({
                path: 'service',
                select: 'name price' // Chỉ lấy tên và giá service
            });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'Không có lịch đặt nào.' });
        }

        res.status(200).json(bookings); // Trả về danh sách cuộc hẹn
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route để hủy cuộc hẹn của người dùng hiện tại
router.delete('/my-appointments/cancel-appointment/:bookingId', isAuthenticated, async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const userId = req.session.user._id; // Lấy userId từ session

        // Tìm cuộc hẹn theo ID và đảm bảo nó thuộc về người dùng hiện tại
        const booking = await Booking.findOne({ _id: bookingId, user: userId });

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn hoặc không có quyền hủy!' });
        }

        // Xóa cuộc hẹn từ cơ sở dữ liệu
        await Booking.findByIdAndDelete(bookingId);
        res.status(200).json({ message: 'Cuộc hẹn đã được hủy thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi máy chủ, không thể hủy cuộc hẹn!' });
    }
});

module.exports = router;
