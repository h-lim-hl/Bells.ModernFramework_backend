const express = require('express');
const router = express.Router();
const UserAuth = require(`../middlewares/userAuth`);
const checkoutService = require(`../services/checkoutService`);
const stripe = require(`stripe`)(process.env.STRIPE_SECRET);
const orderService = require(`../services/orderService`);

//create checkout session
router.post("/session", UserAuth, async function (req, res) {
  try {
    const session = await checkoutService.checkout(req.user.userId, "CheckoutSession");
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      "message" : e.message
    });
  }
});

//create payment intent
router.post("/paymentIntent", UserAuth, async function (req, res) {
  try {
    const paymentIntent =
      await checkoutService.checkout(req.user.userId, "PaymentIntent");
    res.status(201).json({
      client_secret : paymentIntent.client_secret
    });
  } catch (err) {
    console.error(err);
    // res.status(500).json({
    //   "message" : err.message
    // });
  }
});

router.post("/webhook",
  express.raw({ "type" : "application/json" }),
  async function (req, res) {
    let event = null;
    
    try {
      // Verify call is from Stripe
      // when Stripe sends you a webhook request, there's always a signature
      // from the WEBHOOK_SECRET, we can see if the signature is really from Stripe
      const sig = req.headers["stripe-signature"];

      //construct event to verify
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        await orderService.updateOrderStatus(orderId, "processing");
      }
      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      return res.status(500).send(`Webhook Error: ${err.message}`);
    }
  }
);

module.exports = router;