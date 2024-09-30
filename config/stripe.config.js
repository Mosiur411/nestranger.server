require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SK)
const bookingPaymentClientSecret = async (amount) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
        });
        return { clientSecret: paymentIntent.client_secret, id: paymentIntent?.id, amount: paymentIntent?.amount };
    } catch (err) {
        throw new Error(err.message)
    }
};
const paymentreceipt = async (paymentIntentId) => {
    try {
        const paymentIntent = stripe.paymentIntents.retrieve(paymentIntentId)
        return paymentIntent;
    } catch (err) {
        throw new Error(err.message)
    }
};
module.exports = {
    bookingPaymentClientSecret,
    paymentreceipt
}

