const pool = require("../database");

async function getCartContents(userId) {
  const [rows] = await pool.query (
    `
      SELECT c.id, c.product, p.image AS imageUrl, p.name AS productName,
      CAST(price AS DOUBLE) AS price, c.quantity
      FROM cast_items c JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]
  );
  return rows;
}

async function updateCart(userId, cartItem) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
        DELETE FROM cart_item WHERE user_id = ?
      `, [userId]
    );

    for (const item of cartItems) {
      await connection.query(
        `
          INSERT INTO cart_items (user_id, product_id, quantity)
          VALUES (?, ?, ?)
        `, [userId, item.product_id, item.quantity]
      );
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  module.exports = {
    getCartContents,
    updateCart
  }
}