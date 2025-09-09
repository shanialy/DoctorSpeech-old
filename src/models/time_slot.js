const mongoose = require('mongoose');
const { Messages } = require('../constants/messages');

const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

const timeSlot = new mongoose.Schema({
    start_time: {
        type: String,
        required: [true, 'Start time is required'],
        validate: {
            validator: function (value) {
                // Ensure it's a valid Date object
                return timeRegex.test(value);
            },
            message: 'Invalid time format',
        },
    },
    end_time: {
        type: String,
        required: [true, 'End time is required'],
        validate: {
            validator: function (value) {
                // Ensure it's a valid Date object
                return timeRegex.test(value);
            },
            message: 'Invalid time format',
        },

    },
    is_available: {
        type: Boolean,
        default: true,
    },


}, { timestamps: true, });


// timeSlot.pre('save', function (next) {

//     if (!timeRegex.test(this.start_time)) {
//         return next(new Error('Invalid start time format. Please use HH:mm format.'));
//     }
//     if (!timeRegex.test(this.end_time)) {
//         return next(new Error('Invalid end time format. Please use HH:mm format.'));
//     }

//     if (this.end_time <= this.start_time) {
//         return next(new Error('End time must be after start time'));
//     }
//     next();
// });

const TimeSlot = mongoose.model('time_slot', timeSlot);

module.exports = TimeSlot;
