const pool = require("../database");

async function getProductsStock() {
  try {
    const [rows] = await pool.query(
      `SELECT product_id, stock, reserved
        FROM product_stock;
      `
    );
    return rows;
  } catch (err) {
    console.error(err);
    throw (err);
  }
}

async function getDetailedProductsStock() {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.image, ps.store, ps.reserved
       FROM products p, product_stock ps
       WHERE p.id = ps.product_id;
      `
    );
    return rows;

  } catch (err) {
    console.error(err);
    throw (err);
  }
}

async function setProductStock(product_id, numStock) {
  try {
    const [rows] = await pool.query(
      `UPDATE product_stock
       SET store
       VALUES ?
       WHERE product_id = ?;
      `, [numStock, product_id]
    );
  } catch (err) {
    console.error(err);
    throw (err);
  }
}

module.exports = {
  getProductsStock,
  getDetailedProductsStock,
  setProductStock
};