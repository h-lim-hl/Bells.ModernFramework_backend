const express = require('express');
const router = express.Router();
// line for requiring service
// const authenicateToken = require("../middlewares/userAuth");

// router.use(authenicateToken);


router.post('/', async (res, req) => {
  res.status(200).json({message:'Post placeholder endpoint for checkout reached.'})
});

module.exports = router;