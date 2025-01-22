const productData = require('../data/productData');

async function getAllProducts() {
    // idea for future business logic:
    // 1. may have to pass parameter to getAllProducts to filter by country
    // 2. may have to pass parameter to getAllProducts to get stuff the user will likely 
    // to buy
  return await productData.getAllProducts();
}

async function getProductById(id) {
  const product = await productData.getProductById(id);
  if (!product) {
    throw new Error('Product not found');
  }
  // todo: check for promotion, special business logic (region blocking) etc.
  return product;
}

module.exports = {
  getAllProducts,
  getProductById
};