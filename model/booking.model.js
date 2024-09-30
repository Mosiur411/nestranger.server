const mongoose = require('mongoose');

const BookingSchema = mongoose.Schema({
    user: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proprietary',
        required: true
    },
    city: {
        type: String,
        trim: true,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    payment_info: {
        type: {
            type: String,
            trim: true,
        },
        transactionId: {
            type: String,
            trim: true,
        },
        paid: {
            type: Boolean,
            trim: true,
        },
    }
}, {
    timestamps: true
});

module.exports = {
    BookingModel: mongoose.model('Booking', BookingSchema)
};
