const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Load from env for security
const { STATUS_CODES } = require("../constants/status_codes");
const { successJson, errorJson, Messages } = require('../constants/messages');

/**
 * Validate payment intent sent from frontend
 * POST /api/stripe/validate-payment
 * Body: { payment_intent_id: String }
 */
exports.validatePaymentIntent = async (req, res) => {
    try {
        console.log("req.body", req.body);
        const { payment_intent_id } = req.body;

        // if (!payment_intent_id) {
        //     return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("payment_intent_id is required"));
        // }

        // Retrieve PaymentIntent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        if (paymentIntent.status === 'succeeded') {
            // ✅ Payment successful

            // Optional: Validate amount, currency, metadata, etc.
            console.log('Validated payment:', {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                metadata: paymentIntent.metadata,
            });

            // Your business logic here (mark order as paid, update DB, etc.)

            return res.status(STATUS_CODES.SUCCESS).json(successJson(paymentIntent, "Payment validated successfully"));
        } else {
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Payment not successful yet"));
        }

    } catch (e) {
        console.error('Stripe validation error:', e);
        return res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(e.toString()));
    }
};

/**
 * Create PaymentIntent
 * POST /api/stripe/create-payment-intent
 * Body: { amount: Number, currency: String, metadata: Object }
 */
exports.createPaymentIntent = async (amount, currency) => {


    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        metadata: {},
    });

    return paymentIntent;
};


exports.verifyPayment = async (id) => {

    // Retrieve PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    return paymentIntent.status === 'succeeded';

};
