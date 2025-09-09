const express = require('express');
const { validateUser, validateTherapist } = require('../services/jwt/jwt_service')
const { createAvailability, getAllAvailabilities, getAllAvailabilitiesMe, getAvailableTimeSlotsForDate, updateAvailability } = require('../controllers/availability_controller');
const router = express.Router();

router.post('/availability', validateUser, validateTherapist, createAvailability);
router.put('/availability/update', validateUser, validateTherapist, updateAvailability);
// router.delete('/availability/:id', validateUser, validateTherapist, deleteAvailability);
router.get('/availabilities/:therapistId', validateUser, getAllAvailabilities);
router.get('/my-availabilities', validateUser, validateTherapist, getAllAvailabilitiesMe);
router.get('/timeslots', validateUser, getAvailableTimeSlotsForDate);

module.exports = router;