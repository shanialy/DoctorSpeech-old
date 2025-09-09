const express = require('express');
const { validateUser, validateTherapist } = require('../services/jwt/jwt_service')
const { createPaymentIntent, validatePaymentIntent } = require("../controllers/stripe_controller");
const router = express.Router();

// router.post('/create-intend', createPaymentIntent);
router.post('/validate_intent', validatePaymentIntent);

module.exports = router;