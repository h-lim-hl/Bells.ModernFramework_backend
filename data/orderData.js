const pool = require("../database");

const ORDER_TABLE = "orders";
const ORDERITEMS_TABLE = "order_items";
const PRODUCT_TABLE = "products";

async function getOrdersByUserId(userId) {
  const [rows] = await pool.query(`SELECT * FROM ${ORDER_TABLE} WHERE user_id = ?`, [userId]);
  return rows;
}

async function createOrder(userId, orderItems) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Calculate total order amount
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const [orderResult] = await connection.query(
      `INSERT INTO ${ORDER_TABLE} (user_id, total) VALUES (?, ?)`,
      [userId, total]
    );
    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO ${ORDERITEMS_TABLE} (order_id, product_id, quantity) VALUES (?, ?, ?)`,
        [orderId, item.product_id, item.quantity]
      )
    }

    await connection.commit();

    return { orderId, total };

  } catch (e) {
    await connection.rollback();
    throw e;

  } finally {
    connection.release();
  }
}

async function getOrderDetails(orderId) {
  const [rows] = await pool.query(`
    SELECT oi.product, p.name, p.price, io.quantity
    FROM ${ORDERITEMS_TABLE} oi
    JOIN ${PRODUCT_TABLE} p ON oi.product = p.id
    WHERE oi.order_id = ?`,
    [orderId]
  );

  return rows;
}

async function updateOrderStatus(orderId, status) {
  // validate status before updating
  if(![`created`, `processing`, `completed`, `cancelled`].includes(status)) {
    throw new Error(`Invalic status`);
  }

  await pool.query(`UPDATE ${ORDER_TABLE} SET status = ? WHERE id = ?`,
    [status, orderId]);
}

async function updateOrderSessionId(orderId, sessionId) {
  await pool.query(`UPDATE ${ORDER_TABLE} SET checkout_session_id = ? WHERE id = ?`,
    [sessionId, orderId]);
}

module.exports = {
  getOrdersByUserId,
  createOrder,
  getOrderDetails,
  updateOrderStatus,
  updateOrderSessionId,
};