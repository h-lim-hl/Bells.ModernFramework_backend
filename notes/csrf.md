Absolutely! Here’s a complete **CSRF attack example** and how to **protect against it** in an application using **Express**, **React-Vite**, and **Axios**.

### 1. **CSRF Attack Example (with Vulnerable Express Server)**

#### **Backend (Express) – Vulnerable to CSRF**

This is a simplified Express server that **doesn’t implement CSRF protection**. The attacker can forge requests to this server.

```javascript
// server.js (Express server, vulnerable to CSRF)
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Middleware to parse cookies and form data
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Simulating an authenticated session (e.g., user login)
let users = [{ id: 1, name: 'John Doe', session: '12345' }]; // Simple in-memory user

// Home route: Simulating login (user session stored in cookie)
app.get('/', (req, res) => {
  res.send('<h1>Welcome! You are logged in.</h1>');
});

// Vulnerable route: Simulating a money transfer (without CSRF protection)
app.post('/transfer', (req, res) => {
  const { session } = req.cookies; // Get the session from the cookie
  const { amount, toAccount } = req.body;

  // Simulate the action (transferring money)
  if (session === '12345') {  // Assume the session matches a logged-in user
    res.send(`Transferred ${amount} to ${toAccount}`);
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Start the Express server
app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
```

#### **Attacker’s Website (Malicious) – Forge the Request**

On the attacker’s site, the attacker can create a hidden form or an image tag that **automatically sends a POST request** to the `/transfer` endpoint on the vulnerable server (`http://localhost:3001`).

```html
<!-- attacker.com (Malicious site) -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CSRF Attack</title>
</head>
<body>
    <h1>Welcome to my malicious site</h1>
    <form action="http://localhost:3001/transfer" method="POST" style="display: none;">
        <input type="hidden" name="amount" value="1000">
        <input type="hidden" name="toAccount" value="attackerAccount123">
    </form>
    <script>
        // Submit the form automatically without user interaction
        document.forms[0].submit();
    </script>
</body>
</html>
```

In this scenario, when the user visits `attacker.com` (and is logged into `bank.com` with an active session), the attacker’s page will automatically send a **POST request** to `/transfer` with the session cookie, causing a **money transfer** to the attacker’s account.

### 2. **Secure the Express Server with CSRF Token**

To **protect** the server, we’ll implement **CSRF token generation and validation**.

#### **Backend (Express) – CSRF Protection**

We’ll use the `csurf` library to protect against CSRF attacks.

1. **Install the CSRF Protection Middleware**:
   ```bash
   npm install csurf
   ```

2. **Modify the Express server** to include CSRF protection.

```javascript
// server.js (Express with CSRF protection)
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const app = express();

// Set up CSRF protection middleware
const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });

// Middleware to parse cookies and form data
app.use(cookieParser());
app.use(bodyParser.json());

// Simulate user authentication (simplified)
let users = [{ id: 1, name: 'John Doe', session: '12345' }];

// Home route: Simulating login (user session stored in cookie)
app.get('/', csrfProtection, (req, res) => {
  res.send(`
    <h1>Welcome, John Doe!</h1>
    <form action="/transfer" method="POST">
      <input type="hidden" name="csrfToken" value="${req.csrfToken()}">
      <input type="number" name="amount" placeholder="Amount" required>
      <input type="text" name="toAccount" placeholder="To Account" required>
      <button type="submit">Transfer</button>
    </form>
  `);
});

// Secure route: CSRF-protected money transfer
app.post('/transfer', csrfProtection, (req, res) => {
  const { amount, toAccount } = req.body;

  // Validate the CSRF token
  if (!req.body.csrfToken) {
    return res.status(400).send('Missing CSRF token');
  }

  // Simulate the action (transferring money)
  res.send(`Transferred ${amount} to ${toAccount}`);
});

// Start the Express server
app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
```

### 3. **Frontend (React-Vite + Axios) – Sending the CSRF Token**

Now, on the **client side** (React with Vite and Axios), we need to include the CSRF token in the request to prevent CSRF attacks.

#### **React App (Using Axios)**

First, install **Axios** in your React project:
```bash
npm install axios
```

Then, update the **React component** to send the CSRF token with the POST request using Axios.

```jsx
// App.jsx (React component with CSRF protection)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [csrfToken, setCsrfToken] = useState('');

  // Fetch CSRF token from the server when the page loads
  useEffect(() => {
    axios.get('http://localhost:3001/').then((response) => {
      // The CSRF token is embedded in the HTML form
      setCsrfToken(response.data.match(/csrfToken" value="([^"]+)"/)[1]);
    });
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    const amount = e.target.amount.value;
    const toAccount = e.target.toAccount.value;

    try {
      // Send the CSRF token along with the transfer request
      await axios.post('http://localhost:3001/transfer', {
        amount,
        toAccount,
        csrfToken,
      });
      alert('Transfer successful!');
    } catch (error) {
      console.error(error);
      alert('Transfer failed.');
    }
  };

  return (
    <div>
      <h1>Welcome to Your Bank</h1>
      <form onSubmit={handleTransfer}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="number" name="amount" placeholder="Amount" required />
        <input type="text" name="toAccount" placeholder="To Account" required />
        <button type="submit">Transfer</button>
      </form>
    </div>
  );
};

export default App;
```

### 4. **How the Protection Works**

1. **Server-Side CSRF Protection**: 
   - The `csurf` middleware in the Express app generates a **unique CSRF token** for each session.
   - This token is sent to the React app in the form or as part of the page response.
   
2. **Frontend (React)**:
   - The React app makes an **initial GET request** to get the CSRF token embedded in the HTML.
   - When submitting a form, the **CSRF token** is included in the POST request (either in the body or as a header).

3. **Server Validation**:
   - The server validates the **CSRF token** for each state-changing request.
   - If the token is **missing or invalid**, the server rejects the request with a 403 error.

---

### **Conclusion**

- The **attacker’s site** would not be able to send a valid CSRF token along with the forged request. Without the correct CSRF token, the request would be rejected by the server.
- The **Express server** is protected against CSRF attacks by verifying the CSRF token with each state-changing request (like money transfers or form submissions).
- The **React app** sends the CSRF token in the request body (or header) to ensure that the request is **genuine** and not forged.

---

Feel free to copy this example into your notes for later study! If you need any further clarification or adjustments, let me know. 😊