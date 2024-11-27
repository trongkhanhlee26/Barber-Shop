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
        const userId = req.session.user.id; // Lấy userId từ session
        const bookings = await Booking.find({ userId }).populate('barber').populate('service');
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route để hủy cuộc hẹn
router.delete('/my-appointments/cancel-appointment/:bookingId', isAuthenticated, async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc hẹn!' });
        }

        // Xóa cuộc hẹn từ cơ sở dữ liệu
        await Booking.findByIdAndDelete(bookingId);
        res.status(200).json({ message: 'Cuộc hẹn đã được hủy thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ });
    }
});





module.exports = router;
