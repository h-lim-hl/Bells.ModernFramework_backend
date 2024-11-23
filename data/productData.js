const pool = require('../database');

async function getAllProducts() {
  const [rows] = await pool.query('SELECT id, name,' +
                                  'CAST(price AS DOUBLE) AS price,' + 
                                  'image FROM products');
  return rows;
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