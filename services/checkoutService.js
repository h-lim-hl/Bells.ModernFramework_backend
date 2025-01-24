const cartService = require('./cartService'); // get the items in the user's shopping cart
const orderService  = require('./orderService');
const stripeService = require('./stripeService');

async function checkout(userId) {
    // get the content of the user's shopping cart
    const cartItems = await cartService.getCartContents(userId);
    // create the order first
    const orderId = await orderService.createOrder(userId, cartItems);
    // create the session
    const session = await stripeService.createCheckoutSession(userId, cartItems, orderId);
    // save the session id into the order
    await orderService.updateOrderSessionId(orderId, session.id);
    return session;
}

module.exports = {
    checkout
}