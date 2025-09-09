const User = require('../models/user');
const { STATUS_CODES } = require("../constants/status_codes");
const { successJson, errorJson, Messages } = require('../constants/messages');
const TherapistAvailability = require('../models/therapist_availability');
const TimeSlot = require('../models/time_slot');
const Appointment = require('../models/appointment');
const TherapyPlan = require('../models/therapy_plans');
const moment = require('moment');
const { createPaymentIntent, verifyPayment } = require('./stripe_controller');

const ADMIN_PERCENTAGE = 0.2;

exports.bookAppointment = async (req, res) => {
    try {

        const {
            therapist_id,
            slot_id,
            availability_id,
            service_id,
            appointment_date,
            payment_id,
        } = req.body;
        console.log("+++++++++++++ APPOINTMENT BOOKING +++++++++++++");
        // console.log("therapist_id", therapist_id);
        // console.log("slot_id", slot_id);
        // console.log("availability_id", availability_id);
        // console.log("appointment_date", appointment_date);

        if (!therapist_id || !slot_id || !availability_id || !service_id || !appointment_date || !payment_id) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.RequiredFieldsAreEmpty));
        }

        console.log("payment_id", payment_id);

        if (!moment(appointment_date, 'DD-MM-YYYY', true).isValid()) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Invalid date(s) in availability_dates. Enter date in format (DD-MM-YYYY)'));
        }

        const therapist = await User.findById(therapist_id);
        if (!therapist || therapist.is_deleted || !therapist.is_therapist) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapistNotFound));
        }

        if (!(await verifyPayment(payment_id))) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Payment unsuccessful"));
        }

        const appointment = await Appointment.findOne({
            payment_id: payment_id,
            patient_id: req.user.user_id,
        });

        if (!appointment) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson("Appointment not found"));
        }

        const service = await TherapyPlan.findById(service_id);
        if (!service) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapyPlansNotFound));
        }

        const availability = await TherapistAvailability.findById(availability_id);
        if (!availability) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.AvailabilitesNotFound));
        }

        const slot = await TimeSlot.findById(slot_id);
        console.log("slot", slot);
        if (!slot) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.SlotNotFound));
        }

        if (slot.is_available === false) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.SlotAlreadyBooked));
        }

        if (!(await verifyPayment(payment_id))) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Payment unsuccessful"));
        }

        const patient_id = req.user.user_id;
        const start_time = slot.start_time;
        const end_time = slot.end_time;

        console.log("Data for booking appointment, therapist_id", therapist_id, " service_id ", service_id, " patient_id ", patient_id, " slot_id ", slot_id, " start_time ", start_time, " end_time ", end_time, " appointment_date ", appointment_date, " availability_id ", availability_id);

        appointment.therapist_id = therapist_id;
        appointment.service_id = service_id;
        appointment.slot_id = slot_id;
        appointment.start_time = start_time;
        appointment.end_time = end_time;
        appointment.appointment_date = appointment_date;
        appointment.availability_id = availability_id;

        await appointment.save();

        slot.is_available = false;
        await slot.save();

        console.log("appointment", appointment);

        console.log("+++++++++++++ APPOINTMENT BOOKING END +++++++++++++");
        return res.status(STATUS_CODES.CREATED).json(successJson(appointment, Messages.AppointmentCreatedSuccessfully))
    }
    catch (e) {
        console.log("+++++++++++++ APPOINTMENT BOOKING END +++++++++++++");
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.validateBooking = async (req, res) => {
    try {

        const {
            therapist_id,
            slot_id,
            availability_id,
            service_id,
            appointment_date,
        } = req.body;
        console.log("+++++++++++++ APPOINTMENT BOOKING Validation +++++++++++++");

        if (!therapist_id || !slot_id || !availability_id || !service_id || !appointment_date) {
            console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.RequiredFieldsAreEmpty));
        }

        if (!moment(appointment_date, 'DD-MM-YYYY', true).isValid()) {
            console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Invalid date(s) in availability_dates. Enter date in format (DD-MM-YYYY)'));
        }

        const therapist = await User.findById(therapist_id);
        if (!therapist || therapist.is_deleted || !therapist.is_therapist) {
            console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapistNotFound));
        }

        const appointmentExists = await Appointment.findOne({
            therapist_id: therapist_id,
            patient_id: req.user.user_id,
            appointment_date: appointment_date,
        });

        if (appointmentExists) {
            console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("You already have an appointment with this therapist on that date"));
        }

        const service = await TherapyPlan.findById(service_id);
        if (!service) {
            console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapyPlansNotFound));
        }

        const availability = await TherapistAvailability.findById(availability_id);
        if (!availability) {
            console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.AvailabilitesNotFound));
        }

        const slot = await TimeSlot.findById(slot_id);
        console.log("slot", slot);
        if (!slot) {
            console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.SlotNotFound));
        }

        if (slot.is_available === false) {
            console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.SlotAlreadyBooked));
        }

        const intend = await createPaymentIntent(service.price * 100, 'USD');

        console.log("intend", intend);

        const appointment = new Appointment({
            therapist_id: therapist_id,
            service_id: service_id,
            patient_id: req.user.user_id,
            payment_id: intend.id,
            price_payed: service.price,
        });

        await appointment.save();

        console.log("service", service, "intend", intend, "appointment", appointment);

        console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
        return res.status(STATUS_CODES.CREATED).json(successJson(intend, Messages.AppointmentCreatedSuccessfully))
    }
    catch (e) {
        console.log("+++++++++++++ APPOINTMENT BOOKING Validation END +++++++++++++");
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.getMyEarnings = async (req, res) => {
    try {
        console.log("+++++++++++++ Get My Earnings +++++++++++++");
        const token = req.user;

        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();

        const appointments = await Appointment.find({
            therapist_id: token.user_id,
            createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        });

        const appointmentSold = appointments.reduce((acc, appointment) => acc + (appointment.price_payed || 0), 0);
        const platformDeduction = (appointmentSold * ADMIN_PERCENTAGE);
        const totalEarnings = appointmentSold - platformDeduction;



        console.log(" appointmentSold, ", appointmentSold, " totalEarnings ", totalEarnings);

        console.log("+++++++++++++ Get My Patients END +++++++++++++");
        const data = { appointmentSold, totalEarnings, platformDeduction, startOfMonth, endOfMonth };
        return res.status(STATUS_CODES.CREATED).json(successJson(data, "Earnings fetched successsfully"))
    }
    catch (e) {
        console.log("+++++++++++++ Get My Patients END +++++++++++++");
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}


exports.approveAppointment = async (req, res) => {
    try {

        const { id } = req.params;
        const token = req.user;

        const user = await User.findById(token.user_id);
        const appointment = await Appointment.findById(id);


        if (!appointment) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.AppointmentNotFound));
        }

        if (appointment.status === 'approved') {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.AppointmentAlreadyApproved));
        }

        if (appointment.status === 'cancelled') {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.AppointmentAlreadyRejected));
        }

        const updated_by = req.user.user_id;

        appointment.status = 'approved'
        appointment.updated_by = updated_by
        user.wallet_amount = user.wallet_amount + appointment.price_payed;
        await appointment.save();
        await user.save();

        return res.status(STATUS_CODES.SUCCESS).json(successJson(appointment, Messages.AppointmentApprovedSuccessfully));

    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.cancelAppointment = async (req, res) => {
    try {

        const { id } = req.params;

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.AppointmentNotFound));
        }

        if (appointment.status === 'cancelled') {

            let byMsg = '';
            if (appointment.updated_by.toString() === appointment.therapist_id.toString()) {
                byMsg = " by Therapist";
            } else {
                byMsg = " by Patient";
            }
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.AppointmentAlreadyRejected + byMsg));
        }

        const updated_by = req.user.user_id;
        appointment.status = 'cancelled'
        appointment.updated_by = updated_by;
        await appointment.save();

        return res.status(STATUS_CODES.SUCCESS).json(successJson(appointment, Messages.AppointmentCancelledSuccessfully));

    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}


exports.getAllAppointmentsPatientAndTherapist = async (req, res) => {
    try {

        const { therapist_id } = req.params;
        const patient_id = req.user.user_id;


        const appointments = await Appointment.find({
            therapist_id: therapist_id,
            patient_id: patient_id,
        }).populate('therapist_id').populate('service_id');

        if (appointments.length === 0) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson([], Messages.AppointmentNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(appointments, Messages.AppointmentFetchedSuccessfully))
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.getAllAppointmentsPatient = async (req, res) => {
    try {

        const patient_id = req.user.user_id;


        const appointments = await Appointment.find({
            patient_id: patient_id,
        }).populate('therapist_id').populate('service_id');

        if (appointments.length === 0) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson([], Messages.AppointmentNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(appointments, Messages.AppointmentFetchedSuccessfully))
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.getAppointmentById = async (req, res) => {
    try {

        console.log("++++++++++ getAppointmentById ++++++++++")
        const id = req.params.id;


        const appointment = await Appointment.findById(id)
            .populate('therapist_id')
            .populate("patient_id")
            .populate('service_id')
            .populate('slot_id');

        console.log("appointment", appointment);


        const slot = await TimeSlot.findById(appointment.slot_id);

        console.log("SLOT", slot);

        if (appointment.length === 0) {
            console.log("++++++++++ getAppointmentById end ++++++++++")
            return res.status(STATUS_CODES.SUCCESS).json(successJson({}, Messages.AppointmentNotFound));
        }
        console.log("++++++++++ getAppointmentById end ++++++++++")
        return res.status(STATUS_CODES.SUCCESS).json(successJson(appointment, Messages.AppointmentFetchedSuccessfully))
    }
    catch (e) {
        console.log("++++++++++ getAppointmentById end ++++++++++")
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.getAllAppointmentsTherapist = async (req, res) => {
    try {

        const therapist_id = req.user.user_id;


        const appointments = await Appointment.find({
            therapist_id: therapist_id,
        }).populate('patient_id').populate('service_id');

        if (appointments.length === 0) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson([], Messages.AppointmentNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(appointments, Messages.AppointmentFetchedSuccessfully))
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.getAllTherapistPatients = async (req, res) => {
    try {

        const therapist_id = req.user.user_id;


        const appointments = await Appointment.find({
            therapist_id: therapist_id,
        }).populate('patient_id').populate('service_id');

        if (appointments.length === 0) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson([], Messages.AppointmentNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(appointments, Messages.AppointmentFetchedSuccessfully))
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}


exports.rescheduleAppointment = async (req, res) => {
    try {
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.rebookAppointment = async (req, res) => {
    try {
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}


