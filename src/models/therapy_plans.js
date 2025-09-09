const mongoose = require('mongoose');
const { Messages } = require('../constants/messages');


const therapyPlanSchema = new mongoose.Schema(
    {
        therapist_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: [true, Messages.TherapyNameRequired], // Custom message for 'required'
        },
        title: {
            type: String,
            trim: true,
            required: [true, Messages.TherapyTitleRequired],
            maxlength: [200, Messages.TherapyTitleMaxLength], // Custom message for 'maxlength'
        },
        expertise: {
            type: String,
            trim: true,
            required: [true, Messages.ExpertiseRequired],
            maxlength: [500, Messages.ExpertiseMaxLength], // Custom message for 'maxlength'
        },
        description: {
            type: String,
            trim: true,
            default: '',
            maxlength: [1000, Messages.TherapyPlanDescriptionMaxLength], // Custom message for 'maxlength'
        },
        location: {
            type: String,
            default: null,
        },
        price: {
            type: Number,
            required: [true, Messages.TherapyPlanPriceIsRequired],
        },
        is_active: {
            type: Boolean,
            required: true,
            default: true, // Default to not premium
        },
        rating: [
            {
                user_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: [true, Messages.UserRequiredForRating],
                },
                rating: {
                    type: Number,
                    required: [true, Messages.RatingIsRequired],
                    min: [1, Messages.RatingLowerBound], // Minimum value is 1
                    max: [5, Messages.RatingUpperBound], // Maximum value is 5
                },
                remarks: {
                    type: String,
                    default: '',
                },
            },
        ],

    },
    {
        timestamps: true,
    },
);

const TherapyPlan = mongoose.model('therapy_plan', therapyPlanSchema);

module.exports = TherapyPlan;


