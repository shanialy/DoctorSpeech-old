const express = require('express');
const { validateUser, validateTherapist } = require('../services/jwt/jwt_service');
const { createTherapyPlan, updateTherapyPlan, deleteTherapyPlans, getAllTherapyPlans, getMyTherapyPlans } = require('../controllers/therapy_plan_controller');

const router = express.Router();

router.post('/therapy_plan', validateUser, validateTherapist, createTherapyPlan);
router.get('/therapy_plans', validateUser, getAllTherapyPlans);
router.get('/my_therapy_plans', validateUser, getMyTherapyPlans);
router.put('/therapy_plan/:id', validateUser, validateTherapist, updateTherapyPlan);
router.delete('/therapy_plan/:id', validateUser, validateTherapist, deleteTherapyPlans);


module.exports = router;
