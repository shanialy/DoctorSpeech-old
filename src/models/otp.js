const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Removes whitespace
        lowercase: true, // Converts to lowercase
        match: [/.+\@.+\..+/, 'Please enter a valid email address'], // Basic email validation
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

otpSchema.methods.isExpired = function () {
    const inMicroSec = 60 * 1000;
    const expirationTime = this.createdAt.getTime() + 30 * inMicroSec; // 30 minutes in milliseconds
    return Date.now() > expirationTime; // returns true if expired
};

const OtpModel = mongoose.model('otp', otpSchema);

module.exports = OtpModel;
