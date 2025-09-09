const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        therapist_id: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: [true, "Therapist Id is required"],
        },
        patient_id: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: [true, "Patient Id is required"],
        },
        updated_by: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            default: null,
        },
        slot_id: {
            type: mongoose.Types.ObjectId,
            ref: 'time_slot',
            // required: [true, "Slot Id is required"],
        },
        availability_id: {
            type: mongoose.Types.ObjectId,
            ref: 'therapist_availability',
            // required: [true, "Therapist Availability Id is required"],
        },
        service_id: {
            type: mongoose.Types.ObjectId,
            ref: 'therapy_plan',
            // required: [true, "Service Id is required"],
        },
        start_time: {
            type: String,
            // required: [true, "Therapist Availability Id is required"],
        },
        end_time: {
            type: String,
            // required: [true, "Therapist Availability Id is required"],
        },
        appointment_date: {
            type: String,
            // required: [true, "Appointment Date is required"],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'cancelled'],
            default: 'pending', // Default status is 'pending'
            required: [true, "Appointment Status is required"], // Ensure status is always set
        },
        session_type: {
            type: String,
            enum: ['online', 'onsite'],
            default: 'online', // Default status is 'pending'
        },
        session_link: {
            type: String,
            default: null,
        },
        payment_id: {
            type: String,
            default: null,
        },
        price_payed: {
            type: Number,
            default: 0.0,
        }
    },
    { timestamps: true },
);


const Appointment = mongoose.model('apoointment', appointmentSchema);

module.exports = Appointment;