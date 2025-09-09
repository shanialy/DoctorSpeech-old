const express = require('express');
const { validateUser, validateTherapist } = require('../services/jwt/jwt_service')
const { bookAppointment, approveAppointment, rebookAppointment, rescheduleAppointment, cancelAppointment, getAllAppointmentsPatient, getAllAppointmentsPatientAndTherapist, getAllAppointmentsTherapist, getAppointmentById, validateBooking, getMyEarnings } = require('../controllers/appointment_controller');
const router = express.Router();

router.post('/appointment/book', validateUser, bookAppointment);
router.post('/appointment/validate-booking', validateUser, validateBooking);
router.get('/patient-appointments', validateUser, getAllAppointmentsPatient);
router.get('/appointment/:id', validateUser, getAppointmentById);
router.get('/therapist_appointments', validateUser, getAllAppointmentsTherapist);
router.get('/appointments/:therapist_id', validateUser, getAllAppointmentsPatientAndTherapist);
router.put('/appointment/:id/approve', validateUser, validateTherapist, approveAppointment);
router.post('/appointment/rebook', validateUser, rebookAppointment);
router.put('/appointment/:id/reschedule', validateUser, rescheduleAppointment);
router.put('/appointment/:id/cancel', validateUser, cancelAppointment);
router.get('/get_my_earnings', validateUser, validateTherapist, getMyEarnings);
// router.get('/therapist_patients', validateUser, validateTherapist, getAllTherapistPatients);

module.exports = router;