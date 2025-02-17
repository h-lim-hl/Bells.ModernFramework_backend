const discountData = require("../data/discountsData");

async function getDiscountListings() {
  return await discountData.getDiscountListings();
}

async function getValidDiscountCodes() {
  return await discountData.getValidDiscountCodes();
}

async function getRedeemableCodes(user_id) {
  return await discountData.getRedeemableCodes(user_id);
}

async function getDiscountDetails(discount_id) {
  return await discountData.getDiscountDetails(discount_id);
}

module.exports = {
  getValidDiscountCodes,
  getRedeemableCodes,
  getDiscountDetails,
  getDiscountListings
};