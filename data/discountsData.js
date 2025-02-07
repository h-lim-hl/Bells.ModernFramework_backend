const pool = require("../database");

const DISCOUNT_TABLE = "discounts";
const DISCOUNT_TYPE_TABLE = "discount_types";
const REDEMPTION_TABLE = "discount_redemptions";

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
  getRedeemableCodes
}