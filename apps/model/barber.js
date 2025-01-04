const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        experience: { type: Number },
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
        imageUrl: { type: String }
    },
    { timestamps: true }
);

const Barber = mongoose.model("Barber", barberSchema);

module.exports = Barber;
