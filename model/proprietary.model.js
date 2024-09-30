const mongoose = require("mongoose");

const ProprietarySchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    sub_title: {
        type: String,
        trim: true
    },
    photo: [
        {
            path: {
                type: String,
                required: true
            },
            title: {
                type: String,
                trim: true
            },
            details: {
                type: String,
                trim: true
            }
        }
    ],
    rating: {
        type: Number, // Changed from String to Number for easier calculations
        default: 4.2
    },
    about: {
        type: String,
        trim: true,
        required: true,
    },
    accommodation_overview: {
        type: String,
        trim: true,
        required: true,
    },
    room_details: {
        size: {
            type: String,
            trim: true
        },
        bed_type: {
            type: String,
            trim: true
        },
        total_bed: {
            type: Number, // Changed to Number
            required: true,
            default: 1
        },
        bathroom: {
            type: String,
            trim: true
        },
        max_guests: {
            type: Number, // Changed to Number
            trim: true,
        }
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    timeframe: {
        prices: {
            type: Number,
            required: true
        },
        period: {
            type: String,
            required: true,
            default: "night"
        }
    },
    location: {
        city: {
            type: String,
            unique: true,
            lowercase:true,
            trim: true,
            required: true,
        },
        address: {
            type: String,
            trim: true,
        }
    },
    total_booking: {
        type: Number,
        default: 0
    },


}, {
    timestamps: true
});

module.exports = {
    ProprietaryModel: mongoose.model('Proprietary', ProprietarySchema)
};
