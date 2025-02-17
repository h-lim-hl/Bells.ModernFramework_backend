const pool = require("../database");

const DISCOUNT_TABLE = "discounts";
const DISCOUNT_TYPE_TABLE = "discount_types";
const REDEMPTION_TABLE = "discount_redemptions";
const DISCOUNT_DESCRIPTIONS = "discount_descriptions";
const USER_DISCOUNTS = "personal_discounts";

async function getDiscountDetails(discount_id) {
  // NEED TO REFERENCE DML FOR VALUES
  try {
    const [rows] = await pool.query(
      `
        SELECT d.name, code, dt.name,
               start_datetime, end_datetime,
               amount, description, assigned_to,
        FROM ${DISCOUNT_TABLE} d
        JOIN ${DISCOUNT_TYPE_TABLE} dt
          ON d.id = dt.discount_id
        LEFT JOIN ${DISCOUNT_DESCRIPTIONS} dd
          ON dd.discount_id
        LEFT JOIN ${USER_DISCOUNTS} ud
          ON d.id = ud.discount_id
        WHERE d.id = ?
      `, [discount_id]
    );
  } catch (err) {

  }
}

async function getDiscountListings() {
  try {
    const [rows] = await pool.query(
      `
        SELECT d.name, code, dt.name,
               start_datetime, end_datetime,
               amount, description
        FROM ${DISCOUNT_TABLE} d
        JOIN ${DISCOUNT_TYPE_TABLE} dt
          ON ${DISCOUNT_TABLE}.id = ${DISCOUNT_TYPE_TABLE}.discount_id
        LEFT JOIN ${DISCOUNT_DESCRIPTIONS}
          ON ${DISCOUNT_DESCRIPTIONS}.discount_id;
      `
    );
    return rows;
  } catch (err) {
    console.error(err);
  }
}

async function getValidDiscountCodes() {
  try {
    const [rows] = await pool.query(
      `
        SELECT code
        FROM ${DISCOUNT_TABLE}
        WHERE start_datetime <= CURRENT_TIMESTAMP 
          AND CURRENT_TIMESTAMP <= end_datetime;
      `
    );
    return rows;
  } catch (err) {
    console.error(err);
    return;
  }
}

async function getValidPeriodCodes () {
  const [periodCodes] = await pool.query (
    ` SELECT code
      FROM ${DISCOUNT_TABLE}
      JOIN ${DISCOUNT_TYPE_TABLE} ON ${DISCOUNT_TABLE}.${DISCOUNT_TYPE_TABLE} = ${DISCOUNT_TYPE_TABLE}.id
      WHERE ${DISCOUNT_TYPE_TABLE}.name = "period_code" AND
        (${DISCOUNT_TABLE}.start_datetime IS NULL OR 
          (${DISCOUNT_TABLE}.start_datetime <= CURRENT_TIMESTAMP AND
              CURRENT_TIMESTAMP <= ${DISCOUNT_TABLE}.end_datetime
          )
        );
    `
  );

  return periodCodes;
}

async function getRedeemableSingleCodes(user_id) {
  const [singleCodes] = await pool.query(
    ` SELECT code
      FROM ${DISCOUNT_TABLE} d
      JOIN ${DISCOUNT_TYPE_TABLE} dt ON d.${DISCOUNT_TYPE_TABLE} = dt.id
      LEFT JOIN ${REDEMPTION_TABLE} dr ON d.id = dr.discount_id AND dr.user_id = ?
      WHERE dt.name = "single_code" AND
              (d.start_datetime IS NULL OR
                (d.start_datetime <= CURRENT_TIMESTAMP AND
                  CURRENT_TIMESTAMP <= d.end_datetime)) AND
            dr.discount_id IS NULL;
    `, [user_id]
  );
  return singleCodes;
}

async function getRedeemablePersonalCodes(user_id) {
  const [personalCode] = await pool.query(
    ` SELECT code FROM ${DISCOUNT_TABLE} d
      JOIN ${DISCOUNT_TYPE_TABLE} dt ON d.${DISCOUNT_TYPE_TABLE} = dt.id
      LEFT JOIN ${REDEMPTION_TABLE} dr ON d.id = dr.discount_id AND dr.user_id ?
      WHERE dt.name = "user_code" AND
        (d.start_datetime IS NULL OR
          (d.start_datetime <= CURRENT_TIMESTAMP AND
             CURRENT_TIMESTAMP <= d.end_datetime
          )
        ) AND dr.discount_id IS NULL;
    `, [user_id]
  );
  return personalCode;
}

async function getRedeemableCodes(user_id) {
  const periodCodes = getValidPeriodCodes();
  const singleCodes = getRedeemableSingleCodes(user_id);
  const personalCode = getRedeemablePersonalCodes(user_id);

  return periodCodes.concat(singleCodes).concat(personalCode);
}

module.exports = {
  getValidDiscountCodes,
  getValidPeriodCodes,
  getRedeemableSingleCodes,
  getRedeemablePersonalCodes,
  getRedeemableCodes,
  getDiscountDetails,
  getDiscountListings
}