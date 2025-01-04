const mongoose = require('mongoose');

const workScheduleSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barber',
    required: true
  },
  workDate: {
    type: Date,
    required: true
  },
  shifts: {
    morningShift: {
      startTime: {
        type: Date,
        required: false // Chuyển thành false để tránh lỗi khi không có dữ liệu
      },
      endTime: {
        type: Date,
        required: false // Chuyển thành false để tránh lỗi khi không có dữ liệu
      },
      bookingTime: {
        type: Date,
        required: false
      }
    },
    afternoonShift: {
      startTime: {
        type: Date,
        required: false // Chuyển thành false để tránh lỗi khi không có dữ liệu
      },
      endTime: {
        type: Date,
        required: false // Chuyển thành false để tránh lỗi khi không có dữ liệu
      },
      bookingTime: {
        type: Date,
        required: false
      }
    }
  }
}, { currentTime: () => new Date() });

const WorkSchedule = mongoose.model('WorkSchedule', workScheduleSchema);
module.exports = WorkSchedule;
