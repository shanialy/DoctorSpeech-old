const TherapyPlan = require('../models/therapy_plans');
const { STATUS_CODES } = require("../constants/status_codes");
const { successJson, errorJson, Messages } = require('../constants/messages');


exports.getAllTherapyPlans = async (req, res) => {
    try {
        const therapyPlans = await TherapyPlan.find(
            { is_active: true },
        ).populate({ path: 'therapist_id' });
        console.log("therapy plans", therapyPlans);

        if (!therapyPlans || therapyPlans.length === 0) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson([], Messages.TherapyPlansEmpty));
        }

        const transformedTherapyPlans = therapyPlans.map(plan => {
            const planObj = plan.toObject();
            const therapist = planObj.therapist_id;
            planObj.therapist_info = {
                id: therapist._id,
                name: therapist.username,
                email: therapist.email,
                profilePicture: therapist.profilePicture,
            };
            delete planObj.therapist_id;
            delete planObj.rating;

            if (planObj.rating && planObj.rating.length > 0) {
                const totalRating = planObj.rating.reduce((sum, { rating }) => sum + rating, 0);
                planObj.average_rating = totalRating / planObj.rating.length;
            } else {
                planObj.average_rating = 0; // No ratings available
            }

            return planObj;
        });

        return res
            .status(STATUS_CODES.SUCCESS)
            .json(successJson(
                transformedTherapyPlans,
                Messages.TherapyPlansFetchedSuccessfully,
            ));
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.getMyTherapyPlans = async (req, res) => {
    try {
        const therapyPlans = await TherapyPlan.find(
            {therapist_id: req.user.user_id},
        ).populate({ path: 'therapist_id' });

        if (!therapyPlans || therapyPlans.length === 0) {
            return res.status(STATUS_CODES.SUCCESS).json(successJson([], Messages.TherapyPlansEmpty));
        }

        const transformedTherapyPlans = therapyPlans.map(plan => {
            const planObj = plan.toObject();
            const therapist = planObj.therapist_id;
            planObj.therapist_info = {
                id: therapist._id,
                name: therapist.username,
                email: therapist.email,
                profilePicture: therapist.profilePicture,
            };
            delete planObj.therapist_id;
            delete planObj.rating;

            if (planObj.rating && planObj.rating.length > 0) {
                const totalRating = planObj.rating.reduce((sum, { rating }) => sum + rating, 0);
                planObj.average_rating = totalRating / planObj.rating.length;
            } else {
                planObj.average_rating = 0; // No ratings available
            }

            return planObj;
        });

        return res
            .status(STATUS_CODES.SUCCESS)
            .json(successJson(
                transformedTherapyPlans,
                Messages.TherapyPlansFetchedSuccessfully,
            ));
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.createTherapyPlan = async (req, res) => {
    try {
        const {title, expertise, description, location, price, is_active } = req.body;

        const therapist_id = req.user.user_id;

        const therapyPlan = new TherapyPlan({
            title: title,
            therapist_id: therapist_id,
            expertise: expertise,
            description: description,
            location: location,
            price: price,
            is_active: is_active,
            rating: [],
        })

        const savedTherapyPlan = await therapyPlan.save();

        const therapyPlanObject = savedTherapyPlan.toObject();

        // Remove the `rating` key
        delete therapyPlanObject.rating;
        delete therapyPlanObject.therapist_id;

        return res.status(STATUS_CODES.CREATED).json(successJson(therapyPlanObject, Messages.TherapyPlansCreatedSuccessfully));
    }
    catch (e) {
        if (e.name === 'ValidationError') {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(e.message));
        }
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.updateTherapyPlan = async (req, res) => {
    try {
        const {title, is_active, expertise, description, location, price } = req.body;

        const { id } = req.params;

        const plan = await TherapyPlan.findByIdAndUpdate(
            id,
            {
                title: title,
                is_active: is_active,
                expertise: expertise,
                description: description,
                location: location,
                price: price,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true },
        );

        if (!plan) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TherapyPlansNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(plan, Messages.TherapyPlansUpdatedSuccessfully));
    }
    catch (e) {

        if (e.name === 'ValidationError') {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(e.message));
        }

        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}

exports.deleteTherapyPlans = async (req, res) => {
    try {

        const { id } = req.params;

        const plan = await TherapyPlan.findByIdAndDelete(id);

        if (!plan) {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TherapyPlansNotFound));
        }

        return res.status(STATUS_CODES.SUCCESS).json(successJson(plan, Messages.TherapyPlansDeletedSuccessfully));
    }
    catch (e) {
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
}