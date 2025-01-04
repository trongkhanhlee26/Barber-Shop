const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    barber: { type: String, required: true }, // Tên barber
    barberFullname: { type: String, required: true }, // Thêm trường này để lưu fullname
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    note: { type: String },
    status: { type: String, default: 'Chờ xác nhận' }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
