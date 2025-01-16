Sure! Below is an example of how you can integrate **Coinbase Commerce** into your backend to handle cryptocurrency payments, including setting up a webhook to receive payment notifications.

This example assumes you're using **Node.js** and **Express.js** for the backend, and that you've already signed up for Coinbase Commerce and obtained your API keys.

### Prerequisites:
1. **Sign up for Coinbase Commerce** at [Coinbase Commerce](https://commerce.coinbase.com/).
2. **Generate API keys** for Coinbase Commerce in your Coinbase Commerce account.
3. Install the required npm packages:
   ```bash
   npm install express body-parser axios crypto
   ```

### Backend Example with Node.js and Coinbase Commerce Integration

#### 1. **Set Up Coinbase Commerce API Client**:
   You'll need to create the payment session (invoice) and listen for webhooks to confirm the payment.

**`server.js`** (Main server file):
```javascript
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

// Replace with your Coinbase Commerce API Key
const COINBASE_COMMERCE_API_KEY = 'your_coinbase_commerce_api_key';
const WEBHOOK_SECRET = 'your_coinbase_commerce_webhook_secret'; // The shared secret for verifying webhooks

// Body parser middleware to handle JSON payloads
app.use(bodyParser.json());

// Route to create a new payment session (invoice)
app.post('/create-payment', async (req, res) => {
  const { amount, currency } = req.body; // Get amount and currency from request body

  // Define the request body for creating a payment session
  const paymentData = {
    name: "Test Product",
    description: "A test product for payment",
    local_price: {
      amount: amount.toString(),
      currency: currency || 'USD', // Default to USD if no currency is provided
    },
    pricing_type: 'fixed_price',
  };

  try {
    // Make a POST request to Coinbase Commerce API to create the payment session
    const response = await axios.post(
      'https://api.commerce.coinbase.com/charges',
      paymentData,
      {
        headers: {
          'X-CC-Api-Key': COINBASE_COMMERCE_API_KEY,
          'Content-Type': 'application/json',
        }
      }
    );

    // Extract the URL for the payment session
    const chargeUrl = response.data.data.hosted_url;

    // Send the payment URL back to the client
    res.status(200).json({ success: true, charge_url: chargeUrl });
  } catch (error) {
    console.error('Error creating payment session:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to create payment session.' });
  }
});

// Webhook endpoint to receive notifications from Coinbase Commerce about payment status
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-cc-webhook-signature'];
  
  // Verify the signature to ensure it's from Coinbase
  const computedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (computedSignature !== signature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.type === 'charge:confirmed') {
    console.log(`Payment confirmed for charge ID: ${event.data.id}`);
    // You can now mark the order as paid in your database or send a confirmation email to the user
    // Add your payment processing logic here (e.g., update order status)
  }

  // Respond with a 200 status code to acknowledge receipt of the event
  res.status(200).send('Event received');
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Key Components of the Code:

1. **Create Payment Session**:
   - In the `/create-payment` endpoint, you define the `amount` and `currency` that the user wants to pay.
   - The request is sent to the Coinbase Commerce API to create a payment session (invoice).
   - The **`charge_url`** provided by Coinbase Commerce will allow the user to view and complete the payment.

2. **Webhook Handling**:
   - The `/webhook` endpoint listens for incoming notifications from Coinbase Commerce.
   - Webhook notifications are sent when the payment status changes (e.g., confirmed, failed).
   - The signature of the webhook is verified using a shared secret (`WEBHOOK_SECRET`) to ensure the request is genuine.
   - If the payment is confirmed (`charge:confirmed` event), you can implement logic to mark the order as paid and complete any post-payment tasks (e.g., send an order confirmation email, update inventory, etc.).

### How It Works:

1. **Frontend Initiates Payment**:
   - When a customer initiates a payment, the frontend calls the `/create-payment` API endpoint, providing the amount and currency.
   - This backend API then calls the **Coinbase Commerce API** to create a payment session and returns a `charge_url` to the frontend.
   - The frontend redirects the user to this URL, where they can pay using cryptocurrency.

2. **Coinbase Commerce Notifies Backend**:
   - After the user completes the payment, Coinbase Commerce sends a **webhook notification** to the `/webhook` endpoint.
   - The backend verifies the webhook signature and processes the payment status accordingly.
   - If the payment is confirmed, the backend can update the order status in the database.

### Frontend Example (Client-Side):

Here’s an example of what the frontend code might look like to trigger the payment:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Crypto Payment Example</title>
</head>
<body>
  <h1>Pay with Cryptocurrency</h1>
  <button id="pay-button">Pay Now</button>

  <script>
    document.getElementById('pay-button').addEventListener('click', async () => {
      try {
        const response = await fetch('/create-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 10.00,  // Example amount in USD
            currency: 'USD',
          }),
        });
        
        const data = await response.json();
        if (data.success) {
          // Redirect the user to the Coinbase Commerce hosted payment page
          window.location.href = data.charge_url;
        } else {
          alert('Payment creation failed');
        }
      } catch (error) {
        console.error('Error during payment creation:', error);
      }
    });
  </script>
</body>
</html>
```

### Summary:

- The backend creates a payment session with **Coinbase Commerce** via its API, which generates a **payment URL** for the user.
- The user is redirected to this URL to complete their crypto payment.
- After the payment is processed, **Coinbase Commerce** sends a webhook notification to the backend, which verifies the payment and updates the order status.

This example integrates **Coinbase Commerce** for **Bitcoin payments** (and other supported cryptocurrencies) and provides a simple framework for handling cryptocurrency transactions in your e-commerce site.

Let me know if you need any further clarification or assistance!


---
# Using Express
Certainly! Since **Express 4.16.0** and later versions have **built-in middleware** for parsing JSON and URL-encoded data, you no longer need to use the `body-parser` module. Instead, you can use **`express.json()`** and **`express.urlencoded()`**, which serve the same purpose as the `body-parser` methods.

Here's the updated version of the previous example using **`express.json()`** and **`express.urlencoded()`**:

### Updated Example with `express.json()`:

#### `server.js` (Backend code with Express):
```javascript
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

// Replace with your Coinbase Commerce API Key
const COINBASE_COMMERCE_API_KEY = 'your_coinbase_commerce_api_key';
const WEBHOOK_SECRET = 'your_coinbase_commerce_webhook_secret'; // The shared secret for verifying webhooks

// Middleware to parse incoming request bodies as JSON
app.use(express.json());  // for parsing application/json

// Middleware to parse URL-encoded data (usually from HTML forms)
app.use(express.urlencoded({ extended: true }));  // for parsing application/x-www-form-urlencoded

// Route to create a new payment session (invoice)
app.post('/create-payment', async (req, res) => {
  const { amount, currency } = req.body; // Get amount and currency from request body

  // Define the request body for creating a payment session
  const paymentData = {
    name: "Test Product",
    description: "A test product for payment",
    local_price: {
      amount: amount.toString(),
      currency: currency || 'USD', // Default to USD if no currency is provided
    },
    pricing_type: 'fixed_price',
  };

  try {
    // Make a POST request to Coinbase Commerce API to create the payment session
    const response = await axios.post(
      'https://api.commerce.coinbase.com/charges',
      paymentData,
      {
        headers: {
          'X-CC-Api-Key': COINBASE_COMMERCE_API_KEY,
          'Content-Type': 'application/json',
        }
      }
    );

    // Extract the URL for the payment session
    const chargeUrl = response.data.data.hosted_url;

    // Send the payment URL back to the client
    res.status(200).json({ success: true, charge_url: chargeUrl });
  } catch (error) {
    console.error('Error creating payment session:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: 'Failed to create payment session.' });
  }
});

// Webhook endpoint to receive notifications from Coinbase Commerce about payment status
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-cc-webhook-signature'];
  
  // Verify the signature to ensure it's from Coinbase
  const computedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (computedSignature !== signature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.type === 'charge:confirmed') {
    console.log(`Payment confirmed for charge ID: ${event.data.id}`);
    // You can now mark the order as paid in your database or send a confirmation email to the user
    // Add your payment processing logic here (e.g., update order status)
  }

  // Respond with a 200 status code to acknowledge receipt of the event
  res.status(200).send('Event received');
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Key Changes:

1. **Using Express's Built-in Middleware**:
   - **`express.json()`** is used to parse incoming **JSON** request bodies. This was previously handled by `body-parser.json()`.
   - **`express.urlencoded()`** is used to parse **URL-encoded** form data, just like `body-parser.urlencoded()`. The `extended: true` option is used to support complex objects.

2. **No `body-parser` module**: Since `express.json()` and `express.urlencoded()` are built into Express, you don't need to install or use `body-parser` anymore.

### Example of POST Request to `/create-payment`:

- **With JSON Data**:
  ```bash
  POST http://localhost:3000/create-payment
  Content-Type: application/json

  {
    "amount": 10.00,  // Amount in USD
    "currency": "USD"
  }
  ```

- **With URL-encoded Form Data**:
  ```bash
  POST http://localhost:3000/create-payment
  Content-Type: application/x-www-form-urlencoded

  amount=10.00&currency=USD
  ```

### Conclusion:

Now that you're using **`express.json()`** and **`express.urlencoded()`** directly from Express, your app will no longer rely on the deprecated `body-parser` package. This reduces the need for extra dependencies and ensures you're using the most up-to-date, built-in functionality in Express.

Let me know if you need further clarification or additional help!