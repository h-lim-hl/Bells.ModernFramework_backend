const express = require('express');
const router = express.Router();

const stripeService = require('../services/stripeService');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const orderService= require("../services/orderService");

router.post("/paymentIntent", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount
  });
  res.sendStatus(200);
});

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let paymentIntent;
  try {
    paymentIntent = stripe.webhooks.constructEvent(
      req.body, sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err}`);
    return res.status(400).send(`Webhook error: ${err.message}`);
  };

  switch (paymentIntent.type) {
    case "payment_intent.canceled":
      console.log(`Received event payment_intent.canceled`);
      break;
    case "payment_intent.created":
      console.log(`Received event payment_intent.created`);
      break;
    case "payment_intent.partially_funded":
      console.log(`Received event payment_intent.partially_funded`);
      break;
    case "payment_intent.payment_failed":
      console.log(`Received event payment_intent.payment_failed`);
      break;
    case "payment_intent.processing":
      console.log(`Received event payment_intent.processing`);
      break;
    case "payment_intent.requires_action":
      console.log(`Received event payment_intent.requires_action`);
      break;
    case "payment_intent.succeeded":
      console.log(`Received event payment_intent.succeeded`);
      break;
    default:
      console.log(`Unknown event type : ${paymentIntent.type}`);
  }
  res.json({ "received": true });
});

module.exports = router;