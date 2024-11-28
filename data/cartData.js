const pool = require("../database");

const { Mutex } = require(`async-mutex`);
const mutex = new Mutex();

async function getCartContents(userId) {
  const release = await mutex.acquire();
  try {
    const [rows] = await pool.query(
      `
      SELECT c.id, c.product_id, p.image AS imageUrl, p.name AS productName,
      price, c.quantity
      FROM cart_items c JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]
    );
    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    release();
  }
}

async function updateCart(userId, cartItems) {
  const release = await mutex.acquire();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    console.log("userId=", userId)
    console.log("delete query");
    await connection.query(
      `
        DELETE FROM cart_items WHERE user_id = ?
      `, [userId]
    );
    console.log("Emptied the user's shopping cart")
    console.log("cartItems: ", cartItems);
    console.log("start for");
    for (const item of cartItems) {
      console.log("insert query: ", item);
      await connection.query(
        `
          INSERT INTO cart_items (user_id, product_id, quantity)
          VALUES (?, ?, ?)
        `, [userId, item.product_id, item.quantity]
      );
    }
    console.log("end for");

    await connection.commit();
  } catch (error) {
    console.error(error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    release();
  }
}

module.exports = {
  getCartContents,
  updateCart
}