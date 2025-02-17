const express = require("express");
const cartService = require("../services/cartService");
const authenicateToken = require("../middlewares/userAuth");

const router = express.Router();
router.use(authenicateToken);

// GET cart contents
router.get('/', async (req, res) => {
  try {
    const cartContents = await cartService.getCartContents(req.user.userId);
    res.json(cartContents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT bulk update cart
router.put('/', async (req, res) => {
  //console.log("hello", req);
  try {
    //console.log("cart- router.put: ", req.body.cartItems);
    const cartItems = req.body.cartItems;
    await cartService.updateCart(req.user.userId, cartItems);
    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("api/cart.put: ", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;