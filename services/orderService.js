const orderData = require('../data/orderData');

async function getOrdersByUserId(userId) {
    return await orderData.getOrdersByUserId(userId);
}

async function createOrder(userId, orderItems) {
    // 1. Store the user's purchase history
    // 2. Add a new data point to storage for machine learning (Mongo or Redis)
    return await orderData.createOrder(userId, orderItems);
}

async function updateOrderSessionId(orderId, sessionId) {
    return await orderData.updateOrderSessionId(orderId, sessionId);
}

async function getOrderDetails(orderId) {
    return await orderData.getOrderDetails(orderId);
}

async function updateOrderStatus(orderId, status) {
    // if the order is marked as processing -- maybe:
    // 1. email receipt to user
    // 2. create a delivery order
    // 3. update inventory
    // 4. make a note in your finanical software
    return await orderData.updateOrderStatus(orderId, status);
}

async function getOrderTotal(orderId) {
    const total = await orderData.getOrderTotal(orderId);
    return total;
}
module.exports = {
    getOrdersByUserId,
    createOrder,
    getOrderDetails,
    updateOrderStatus,
    updateOrderSessionId,
    getOrderTotal
};