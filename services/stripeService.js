const stripe =require("stripe")(process.env.STRIPE_SECRET);

function createLineItems(orderItems) {
  // line items is in an array of object
  // each object is representing one item the user want to buy (aka one line item)
  // the keys of the line item object is predefined by Stripe
  const lineItems = [];
  for (let item of orderItems) {
    const lineItem = {
      "price_data" : {
        "currency" : "usd",
        "product_data" : {
          "name" : item.productName,
          "images" : [item.imageUrl],
          "metadata" : {
            product_id : item.product_id
          }
        },
        // In cents
        "unit_amount" : Math.round(item.price * 100)
      },
      "quantity" : item.quantity
    };
    lineItems.push(lineItem);
  };
  
  return lineItems;
}

// This function returns a checkout session with the line items added into that session
async function createCheckoutSession(userId, orderItems, orderId) {
  const lineItems = createLineItems(orderItems);

  const session = await stripe.checkout.session.create({
    "payment_method_types" : ["card"],
    "line_items" : lineItems,
    "mode" : "payment",
    // The URL to go to at the payment is result
    "success_url" : "https://www.google.com",
    "cancel_url" : "https://www.yahoo.com",
    "metadata" : {
      "userId" : userId,
      "orderId" : orderId
    }
  });

  return session;
}

module.exports = {
  createLineItems, createCheckoutSession
}