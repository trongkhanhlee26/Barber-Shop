const express = require('express');
const router = express.Router();
const WorkSchedule = require('../../model/workschedule');
const Barber = require('../../model/barber');
const User = require('../../model/user');

// API để lấy danh sách barber với tên người dùng
router.get('/barbers', async (req, res) => {
    try {
        const barbers = await Barber.find().populate('userId', 'fullname');
        res.json(barbers);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
        res.status(500).send('Đã xảy ra lỗi khi lấy danh sách nhân viên');
    }
});

// Lấy lịch làm việc theo nhân viên và tuần hiện tại
router.get('/work-schedule/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { start, end } = req.query;

        const startDate = new Date(start);
        const endDate = new Date(end);

        const workSchedules = await WorkSchedule.find({
            employeeId,
            workDate: { $gte: startDate, $lte: endDate }
        });
        res.json(workSchedules);
    } catch (error) {
        console.error('Lỗi khi lấy lịch làm việc:', error);
        res.status(500).send('Đã xảy ra lỗi khi lấy lịch làm việc');
    }
});

// API để lưu lịch làm việc của nhân viên
router.post('/work-schedule', async (req, res) => {
    try {
        const { employeeId, workDate, shiftType } = req.body;
        
        const localDate = new Date(workDate);
        localDate.setDate(localDate.getDate() - 1);
        localDate.setUTCHours(0, 0, 0, 0);

        let startTime, endTime;
        if (shiftType === 'morning') {
            startTime = new Date(localDate);
            startTime.setUTCHours(9, 0, 0, 0);
            endTime = new Date(localDate);
            endTime.setUTCHours(14, 0, 0, 0);
        } else if (shiftType === 'afternoon') {
            startTime = new Date(localDate);
            startTime.setUTCHours(14, 0, 0, 0);
            endTime = new Date(localDate);
            endTime.setUTCHours(19, 0, 0, 0);
        }

        let workSchedule = await WorkSchedule.findOne({ employeeId, workDate: localDate });

        if (workSchedule) {
            if (shiftType === 'morning') {
                workSchedule.shifts.morningShift = { startTime, endTime, bookingTime: startTime };
            } else if (shiftType === 'afternoon') {
                workSchedule.shifts.afternoonShift = { startTime, endTime, bookingTime: startTime };
            }
        } else {
            workSchedule = new WorkSchedule({
                employeeId,
                workDate: localDate,
                shifts: {
                    morningShift: shiftType === 'morning' ? { startTime, endTime, bookingTime: startTime } : null,
                    afternoonShift: shiftType === 'afternoon' ? { startTime, endTime, bookingTime: startTime } : null
                }
            });
        }

        await workSchedule.save();
        res.json({ message: 'Lưu lịch làm việc thành công' });
    } catch (error) {
        console.error('Lỗi khi lưu lịch làm việc:', error);
        res.status(500).send('Đã xảy ra lỗi khi lưu lịch làm việc');
    }
});

module.exports = router;
