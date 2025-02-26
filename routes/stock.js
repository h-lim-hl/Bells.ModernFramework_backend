const express = require("express");
const UserAuth = require("../middlewares/userAuth");
const StaffAuth = require("../middlewares/staffAuth");

const router = express.Router();

router.post("/stock", UserAuth, StaffAuth, async (req, res) => {
  res.status(418).json({ "message": "route incomplete." });
});

router.patch("/stock", UserAuth, StaffAuth, async (req, res) => {
  res.status(418).json({ "message": "route incomplete" });
});

module.exports = router;