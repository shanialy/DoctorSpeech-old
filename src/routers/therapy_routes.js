const express = require('express');
const { validateUser, validateAdmin } = require('../services/jwt/jwt_service')
const { createTherapy, udpateTherapy, deleteTherapy, getAllTherapies, getTherapyById, } = require('../controllers/therapy_controller');

const router = express.Router();

router.get('/therapies', validateUser, getAllTherapies);
router.get('/therapy/:id', validateUser, getTherapyById);
router.post('/therapy', validateUser, validateAdmin, createTherapy);
router.put('/therapy/:id', validateUser, validateAdmin, udpateTherapy);
router.delete('/therapy/:id', validateUser, validateAdmin, deleteTherapy);

module.exports = router;