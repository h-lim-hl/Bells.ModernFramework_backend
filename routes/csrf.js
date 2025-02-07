const express = require("express");
const csrf = require('csurf');
const router = express.Router();
const authenicateToken = require("../middlewares/userAuth");

router.use(authenicateToken);
const csrfProtection = csrf({ cookie: true });

router.get('/', csrfProtection, csrfProtection, async (req, res) => {
  res.cookie("csrfToken", req.csrfToken(), {
    httpOnly: true,
    secure: process.env.MODE === "production",
    sameSite: "Strict"
  });
  res.json({ csrfToken: req.csrfToken() });
});