const express = require('express');
const router = express.Router();
const Service = require('../model/service');
const Barber = require('../model/barber');
const WorkSchedule = require('../model/workschedule');
const Booking = require('../model/booking');

// Middleware kiểm tra người dùng đã đăng nhập
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
};

// Route chính cho trang /booking
router.get('/', isAuthenticated, async (req, res) => {
    try {
        res.render('booking', { user: req.session.user });
    } catch (error) {
        console.error('Lỗi khi load trang booking:', error);
        res.status(500).json({ message: error.message });
    }
});

// API để lấy danh sách tất cả dịch vụ
router.get('/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách dịch vụ:', error);
        res.status(500).json({ message: error.message });
    }
});

// API để lấy danh sách barber theo serviceId
router.get('/barbers-by-service/:serviceId', async (req, res) => {
    try {
        const { serviceId } = req.params;
        const barbers = await Barber.find({ service: serviceId }).populate('userId', 'fullname');
        res.json(barbers);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách barber:', error);
        res.status(500).json({ message: error.message });
    }
});

// Hàm tạo khung giờ khả dụng dựa trên `bookingTime`
function generateAvailableTimeSlots(startTime, endTime, bookingTime, interval = 30) {
    const slots = [];
    let currentTime = bookingTime || startTime;

    while (currentTime < endTime) {
        slots.push(currentTime.toISOString().substring(11, 16)); // Định dạng HH:MM
        currentTime.setMinutes(currentTime.getMinutes() + interval);
    }

    return slots;
}

router.get('/available-times/:barberId/:date', async (req, res) => {
    const { barberId, date } = req.params;

    try {
        const workSchedule = await WorkSchedule.findOne({
            employeeId: barberId,
            workDate: new Date(date),
        });

        if (!workSchedule) {
            return res.status(404).json({ message: "Work schedule not found." });
        }

        // Lấy danh sách các khung giờ đã được đặt cho barber trong ngày đó
        const bookedTimes = await Booking.find({ barber: barberId, date: date }).select('time');
        const bookedSlots = bookedTimes.map(booking => {
            // Kiểm tra nếu booking.time là chuỗi HH:MM và chỉ dùng chuỗi này
            return booking.time.padStart(5, '0'); // Đảm bảo có định dạng HH:MM
        });

        // Hàm để tạo các khung giờ khả dụng
        function generateAvailableTimeSlots(startTime, endTime, interval = 30) {
            const slots = [];
            let currentTime = new Date(startTime);

            while (currentTime < endTime) {
                const timeString = currentTime.toISOString().substring(11, 16); // Định dạng thành HH:MM

                // Chỉ thêm vào các khung giờ chưa được đặt
                if (!bookedSlots.includes(timeString)) {
                    slots.push(timeString);
                }

                currentTime.setMinutes(currentTime.getMinutes() + interval);
            }

            return slots;
        }

        const morningSlots = workSchedule.shifts.morningShift.startTime && workSchedule.shifts.morningShift.endTime
            ? generateAvailableTimeSlots(workSchedule.shifts.morningShift.startTime, workSchedule.shifts.morningShift.endTime)
            : [];

        const afternoonSlots = workSchedule.shifts.afternoonShift.startTime && workSchedule.shifts.afternoonShift.endTime
            ? generateAvailableTimeSlots(workSchedule.shifts.afternoonShift.startTime, workSchedule.shifts.afternoonShift.endTime)
            : [];

        res.json({
            morningShift: morningSlots,
            afternoonShift: afternoonSlots
        });
    } catch (error) {
        console.error('Error fetching available times:', error);
        res.status(500).json({ message: 'Error fetching available times', error });
    }
});



router.post('/create', async (req, res) => {
    try {
        const { user, barber, service, datetime, note } = req.body;

        if (!datetime || isNaN(new Date(datetime).getTime())) {
            return res.status(400).json({ message: 'Invalid date and time' });
        }

        const date = new Date(datetime).toISOString().split('T')[0];
        const time = new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Kiểm tra xem đã có đặt lịch nào trùng thời gian chưa
        const existingBooking = await Booking.findOne({
            barber: barber,
            date: date,
            time: time
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Khoảng thời gian đã được đặt. Vui lòng chọn thời gian khác.' });
        }

        // Lấy thông tin dịch vụ và nhân viên
        const serviceData = await Service.findById(service);
        const barberData = await Barber.findById(barber).populate('userId', 'fullname');

        const newBooking = new Booking({
            user,
            barber,
            barberFullname: barberData.userId.fullname,
            service,
            date,
            time,
            note,
            status: 'Chờ xác nhận',
        });
        await newBooking.save();

        // Cập nhật `bookingTime` mới cho lịch làm việc của nhân viên
        const workSchedule = await WorkSchedule.findOne({
            employeeId: barber,
            workDate: new Date(date),
        });

        if (workSchedule) {
            const updatedBookingTime = new Date(datetime).getTime() + serviceData.duration * 60000;
            if (time < workSchedule.shifts.morningShift.endTime) {
                workSchedule.shifts.morningShift.bookingTime = updatedBookingTime;
            } else {
                workSchedule.shifts.afternoonShift.bookingTime = updatedBookingTime;
            }
            await workSchedule.save();
        }

        res.status(201).json({ message: 'Booking created successfully' });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Error creating booking', error });
    }
});



// router.post('/create', async (req, res) => {
//     console.log(req.body); // In ra dữ liệu để kiểm tra
//     try {
//         const { user, barber, service, datetime, note } = req.body;

//         // Kiểm tra các trường bắt buộc
//         if (!user || !barber || !service || !datetime) {
//             return res.status(400).json({ message: 'User, barber, service and datetime are required' });
//         }

//         // Tạo booking mới
//         const newBooking = new Booking({
//             user,
//             barber,
//             service,
//             datetime,   // Lưu datetime
//             note,
//             status: 'pending'
//         });

//         await newBooking.save();
//         res.status(201).json({ message: 'Booking created successfully' });
//     } catch (error) {
//         console.error('Error creating booking:', error);
//         res.status(500).json({ message: 'Error creating booking', error });
//     }
// });



module.exports = router;
