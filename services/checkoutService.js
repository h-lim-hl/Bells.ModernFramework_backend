const cartService = require('./cartService'); // get the items in the user's shopping cart
const orderService = require('./orderService');
const stripeService = require('./stripeService');

const CURRENCY = "sgd"

async function getOrderDetails(userId) {
    // get the content of the user's shopping cart
    const cartItems = await cartService.getCartContents(userId);

    // create the order
    const { orderId, total } = await orderService.createOrder(userId, cartItems);
    const amount = Math.round(total * 100);
    return { cartItems, orderId, amount }
}

async function getCheckoutSession(userId) {
    const { cartItems, orderId } = await getOrderDetails(userId);
    // create the session
    const session = await stripeService.createCheckoutSession(userId, cartItems, orderId);
    // save the session id into the order
    await orderService.updateOrderSessionId(orderId, session.id);
    return session;
}

async function getPaymentIntent(userId) {
    const { orderId, amount} = await getOrderDetails(userId);
    const paymentIntent =
        await stripeService.createPaymentIntent(userId, orderId, amount, CURRENCY);
    await orderService.updateOrderSessionId(orderId, paymentIntent.id);
    return paymentIntent;
}

async function checkout(userId, type) {
    switch (type) {
        case "CheckoutSession":
            return getCheckoutSession(userId);
            break;
        case "PaymentIntent":
            return getPaymentIntent(userId);
            break;
        default:
            throw { "message": "Unhandled checkout type" };
    }
}



module.exports = {
    checkout
}