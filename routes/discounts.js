const express = require("express");
const UserAuth = require("../middlewares/userAuth");
const StaffAuth = require("../middlewares/staffAuth");
const discountService = require("../services/discountsService");

const router = express.Router();

router.get("/all", UserAuth, StaffAuth, async (req, res) => {
  try {
    discounts = await discountService.getDiscountListings();
    res.status(200).json({
      "discounts": discounts
    });
  } catch (err) {
    res.status(500).json({
      "message": err.message
    });
  }
});

router.get("/details", UserAuth, StaffAuth, async (req, res) => {
  const discount_id = req.query.discount_id;
  if (discount_id) {
    try {
      details = await discountService.getDiscountDetails(discount_id);
      res.status(200).json({
        "codes": codes
      });
    } catch (err) {
      res.status(500).json({
        "message": err.message
      });
    }
  }
  res.sendStatus(400);
});

router.get("/user", UserAuth, async (req, res) => {
  try {
    codes = await discountService.getRedeemableCodes(req.user.userId);
    res.status(200).json({
      "codes": codes
    });
  } catch (err) {
    res.status(500).json({
      "message": err.message
    });
  }
});

module.exports = router;