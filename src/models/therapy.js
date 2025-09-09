const mongoose = require('mongoose');
const {Messages}  = require('../constants/messages');


const therapySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, Messages.TherapyNameRequired], // Custom message for 'required'
        maxlength: [50,  Messages.TherapyNameMaxlenError], // Custom message for 'maxlength'
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: "",
        maxlength: [300,  Messages.TherapyDescriptionMaxlenError], // Custom message for 'maxlength'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

});

// therapySchema.methods.isExpired = function () {
//     const inMicroSec = 60 * 1000;
//     const expirationTime = this.createdAt.getTime() + 30 * inMicroSec; // 30 minutes in milliseconds
//     return Date.now() > expirationTime; // returns true if expired
// };

const Therapy = mongoose.model('therapy', therapySchema);

module.exports = Therapy;
