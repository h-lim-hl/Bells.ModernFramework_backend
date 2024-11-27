const pool = require('../database');

async function getAllProducts() {
  try {
    const query = 'SELECT id, name, price, image FROM products';
    let response = await pool.query(query);
    return response[0];
  } catch (err) {
    console.error("ProductData.getAllProducts(): ", err);
  }
  return [];
}
// We have to use CAST (price AS DOUBLE) because mysql2/promise automatically
//  converts the DECIMAL data type to string, which would cause issues later on

async function getProductById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
}

module.exports = {
  getAllProducts,getProductById
};