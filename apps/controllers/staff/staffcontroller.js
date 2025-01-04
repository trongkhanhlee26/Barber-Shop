const express = require("express");
const router = express.Router();
const User = require('../../model/user');
const Barber = require('../../model/barber'); // Model Barber
const WorkSchedule = require('../../model/workschedule'); // Model WorkSchedule

// Middleware kiểm tra quyền truy cập
const isStaff = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'barber') {
        return next();
    } else {
        return res.status(403).send('Bạn không có quyền truy cập!');
    }
};

router.use(isStaff);

// Middleware lấy thông tin barber đang đăng nhập dựa trên userId
router.use(async (req, res, next) => {
    try {
        const userId = req.session.user._id;

        // Tìm barber dựa trên userId trong bảng Barber
        const barber = await Barber.findOne({ userId }).populate('userId', 'fullname email phonenumber');

        if (!barber) {
            return res.status(404).send('Không tìm thấy thông tin nhân viên.');
        }

        // Lưu barber vào res.locals để sử dụng ở các bước tiếp theo
        res.locals.barber = barber.userId;
        req.session.barberId = barber._id; 
        next();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin nhân viên:', error);
        res.status(500).send('Đã xảy ra lỗi server khi lấy thông tin nhân viên.');
    }
});     

// API để lấy lịch làm việc của barber đã đăng nhập
router.get('/work-schedule', async (req, res) => {
    try {
        const barberId = req.session.barberId;  // Lấy barberId từ session
        const { start, end } = req.query;

        // Chuyển đổi thời gian từ local date để lấy đúng dữ liệu trong khoảng thời gian
        const startDate = new Date(start);
        const endDate = new Date(end);

        // Lấy lịch làm việc theo khoảng thời gian đã chọn
        const workSchedules = await WorkSchedule.find({
            employeeId: barberId,
            workDate: {
                $gte: startDate,
                $lte: endDate
            }
        });

        res.json(workSchedules);
    } catch (error) {
        console.error('Lỗi khi lấy lịch làm việc:', error);
        res.status(500).send('Đã xảy ra lỗi khi lấy lịch làm việc');
    }
});

// Trang chính của Staff
router.get('/', (req, res) => {
    res.render("staff/index");
});

module.exports = router;
