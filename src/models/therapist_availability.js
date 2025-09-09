const mongoose = require('mongoose');
const moment = require('moment');
const { Messages } = require('../constants/messages');


const therapistAvailabilitySchema = new mongoose.Schema(
    {
        therapist_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: [true, "Therapist Id is required"], // Custom message for 'required'
        },
        month: {
            type: Number,
            required: [true, "Month is required"],
            min: [1, 'Month must be at least 1'],
            max: [12, 'Month cannot be more than 12'],
        },
        year: {
            type: Number,
            required: [true, "Year is required"],
        },
        message: {
            type: String,
            trim: true,
            default: '',
            maxlength: [1000, "Availability note must be less than 1000 characters"], // Custom message for 'maxlength'
        },
        available_dates: [
            {
                type: Date,
                required: [true, 'Available dates are required'],
                validate: {
                    validator: function (value) {
                        // Example validation: Ensure the date is not in the past
                        return moment(value, 'DD-MM-YYYY', true).isValid();
                    },
                    message: 'Available dates cannot be in the past',
                },
            }
        ],
        time_slots: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'time_slot',
            },
        ],

    },
    {
        timestamps: true,
    },
);

const TherapistAvailability = mongoose.model('therapist_availability', therapistAvailabilitySchema);

module.exports = TherapistAvailability;


