const express = require('express');
const { createUser, getUserById, loginWithUser, getMyUser, sendOtp, verifyOtp, logoutFromUser, updateUserProfile, deleteOwnAccount, changePassword } = require('../controllers/user_controller');
const {validateUser} = require('../services/jwt/jwt_service')

const router = express.Router();

router.post('/signup', createUser);
router.get('/user/:id', validateUser, getUserById);
router.get('/me', validateUser, getMyUser);
router.get('/logout', validateUser, logoutFromUser);
router.post('/login', loginWithUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.put('/update-user-profile', validateUser, updateUserProfile);
router.patch('/update-password', validateUser, changePassword);
router.delete('/delete-account', validateUser, deleteOwnAccount);

module.exports = router;
