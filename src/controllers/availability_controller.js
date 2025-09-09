const User = require('../models/user');
const { STATUS_CODES } = require("../constants/status_codes");
const { successJson, errorJson, Messages } = require('../constants/messages');
const TherapistAvailability = require('../models/therapist_availability');
const TimeSlot = require('../models/time_slot');
const Appointment = require('../models/appointment');
const moment = require('moment');

exports.getAllAvailabilities = async (req, res) => {
    try {
        const { therapistId } = req.params;
        const { month, year } = req.query;


        const therapist = await User.findById(therapistId);
        if (!therapist || therapist.is_deleted || !therapist.is_therapist) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapistNotFound));
        }

        const queryMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
        const queryYear = year ? parseInt(year, 10) : new Date().getFullYear();

        if (queryMonth < 1 || queryMonth > 12) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(errorJson(Messages.InvalidMonth));
        }

        const availabilities = await TherapistAvailability.findOne({
            therapist_id: therapistId,
            month: queryMonth,
            year: queryYear,
        });

        if (!availabilities) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.AvailabilitesNotFound));
        }

        const transformedAvailabilities = availabilities.toObject();
        delete transformedAvailabilities.time_slots;
        return res.status(STATUS_CODES.SUCCESS).json(successJson(transformedAvailabilities, Messages.AvailabilitesFetchedSuccessfully))
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.getAllAvailabilitiesMe = async (req, res) => {
    try {
        const therapistId = req.user.user_id;
        const { month, year } = req.query;
        const queryMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
        const queryYear = year ? parseInt(year, 10) : new Date().getFullYear();

        if (queryMonth < 1 || queryMonth > 12) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(errorJson(Messages.InvalidMonth));
        }

        const availabilities = await TherapistAvailability.findOne({
            therapist_id: therapistId,
            month: queryMonth,
            year: queryYear,
        }).populate('time_slots');

        if (!availabilities) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.AvailabilitesNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(availabilities, Messages.AvailabilitesFetchedSuccessfully));
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}


exports.getAvailableTimeSlotsForDate = async (req, res) => {
    try {

        const { date, therapist_id } = req.query;

        if (!date) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("date not found"));
        } else if (!therapist_id) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("therapist_id not found"));
        } else if (!moment(date, 'DD-MM-YYYY', true).isValid()) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Enter date in format (DD-MM-YYYY)"))
        }
        const therapist = await User.findById(therapist_id);
        if (!therapist || therapist.is_deleted || !therapist.is_therapist) {
            return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.TherapistNotFound));
        }

        const monthNumber = moment(date, 'DD-MM-YYYY').month() + 1;
        const year = moment(date, 'DD-MM-YYYY').year();

        // console.log("monthNumber", monthNumber);
        // console.log("year", year);

        const availability = await TherapistAvailability.findOne({
            therapist_id: therapist_id,
            month: monthNumber,
            year: year,
        });

        // console.log("availability", availability);

        const appointments = await Appointment.find({
            therapist_id: therapist_id,
            availability_id: availability._id.toString(),

        });

        // console.log("appointments", appointments);

        const appointmentNotCancelled = appointments.filter(app => {

            return app.appointment_date.toString() === date.toString() && app.status !== 'cancelled';
        });

        // console.log("appointmentNotCancelled", appointmentNotCancelled);

        const timeSlots = availability.time_slots;
        // console.log("timeSlots", timeSlots);
        const bookedSlots = appointmentNotCancelled.map(app => app.slot_id.toString());
        // console.log("bookedSlots", bookedSlots);

        const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot.toString()))
        // console.log("availableSlots", availableSlots);

        const availableSlotsData = await TimeSlot.find({ "_id": { $in: availableSlots } });

        return res.status(STATUS_CODES.SUCCESS).json(successJson(availableSlotsData, Messages.AvailableSlotsFetchedSuccessfully));

    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.createAvailability = async (req, res) => {
    try {
        const { availability_dates, time_slots, message, month, year } = req.body;

        const theapistId = req.user.user_id;

        if (month < 1 || month > 12) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(errorJson(Messages.InvalidMonth));
        }

        const availabilities = await TherapistAvailability.findOne({
            therapist_id: theapistId,
            month: month,
            year: year,
        });

        if (availabilities) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.AvailabilitesAlreadyExists));
        }

        if (!validateAvailabilityDatesAndTimeSlots(availability_dates, time_slots, req, res)) return;
        const timeSlotIds = await createTimeSlots(time_slots);

        const formattedDates = availability_dates.map(date => moment(date, 'DD-MM-YYYY').toDate());

        const newAvailability = new TherapistAvailability({
            therapist_id: theapistId,
            available_dates: formattedDates,
            time_slots: timeSlotIds,
            message: message,
            month: month,
            year: year,
        });

        await newAvailability.save();

        const id = newAvailability._id.toJSON();

        const populatedAvailability = await TherapistAvailability.findById(id).populate('time_slots');

        return res.status(STATUS_CODES.SUCCESS).json(successJson(populatedAvailability, Messages.AvailabilityCreatedSuccessfully))

    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.updateAvailability = async (req, res) => {
    try {
        const { id, availability_dates, time_slots, message, month, year } = req.body;

        const theapistId = req.user.user_id;

        console.log(req.body);

        if (!id) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TherapyNotFound));
        }

        // console.log("availability_dates", availability_dates, "time_slots", time_slots);

        if (month < 1 || month > 12) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json(errorJson(Messages.InvalidMonth));
        }

        const availabilities = await TherapistAvailability.findOne(
            {
                therapist_id: theapistId,
                month: month,
                year: year,
            },
        );

        if (!availabilities) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.AvailabilitesNotFound));
        }

        if (!validateAvailabilityDatesAndTimeSlots(availability_dates, time_slots, req, res)) return;
        const timeSlotIds = await createTimeSlots(time_slots);
        // console.log(timeSlotIds);

        const formattedDates = availability_dates.map(date => moment(date, 'DD-MM-YYYY').toDate());
        // console.log(formattedDates);
        await TherapistAvailability.findByIdAndUpdate(
            id,
            {
                therapist_id: theapistId,
                available_dates: formattedDates,
                // time_slots: timeSlotIds,
                message: message,
                month: month,
                year: year,
            },
        );

        const populatedAvailability = await TherapistAvailability.findById(id).populate('time_slots');

        return res.status(STATUS_CODES.SUCCESS).json(successJson(populatedAvailability, Messages.AvailabilityUpdatedSuccessfully))

    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

// exports.updateAvailability = async (req, res) => {
// try {

// }
// catch (e) {
//     return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
// }


// }

// exports.deleteAvailability = async (req, res) => {
//     try {

//     }
//     catch (e) {
//         return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
//     }
// }


const createTimeSlots = async (timeSlotsData) => {
    try {
        const timeSlotIds = [];

        for (let slot of timeSlotsData) {
            const { start_time, end_time } = slot;

            const newTimeSlot = new TimeSlot({
                start_time: start_time,
                end_time: end_time,
            });

            // Save the time slot and push its ID to the list
            const savedSlot = await newTimeSlot.save();
            timeSlotIds.push(savedSlot._id);
        }

        return timeSlotIds; // Return the list of saved time slot IDs
    } catch (error) {
        throw new Error('Error while creating time slots: ' + error.message);
    }
};


const validateAvailabilityDatesAndTimeSlots = (availability_dates, time_slots, req, res) => {

    if (!Array.isArray(availability_dates) || availability_dates.length === 0) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.AvailabilityDatesCannotBeEmpty));
        return false;
    }

    const invalidDates = availability_dates.filter(date => !moment(date, 'DD-MM-YYYY', true).isValid());
    if (invalidDates.length > 0) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(`Invalid date(s) in availability_dates: ${invalidDates.join(', ')}. Enter date in format (DD-MM-YYYY)`));
        return false;
    }
    // Validate time_slots: Each slot should have valid start and end times
    if (!Array.isArray(time_slots) || time_slots.length === 0) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('time_slots must be a non-empty array of time slots.'));
        return false;
    }

    const invalidTimeSlots = time_slots.filter(slot => {
        // Parse start and end times to Date objects, ensuring we compare only the times, not the date
        const startTime = moment(slot.start_time, 'HH:mm', true);
        const endTime = moment(slot.end_time, 'HH:mm', true);

        // Ensure both start and end times are valid
        if (!startTime.isValid() || !endTime.isValid()) {
            return true; // Invalid time format
        }

        // Check if start time is before end time
        return startTime.isSameOrAfter(endTime);
    });

    if (invalidTimeSlots.length > 0) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Invalid time slot(s): Start time should be before end time.'));
        return false;
    }

    return true;
}