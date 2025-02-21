const express = require('express');
const router = express.Router();
const userService = require('../services/userService.js');
const jwt = require('jsonwebtoken');

const JWT_EXPIRE_TIME = `30d`;

router.get('/', async (req, res) => {
  res.status(200).json({message:"reached users route"});
});

// POST register a new user
router.post('/register', async (req, res) => {
  console.log("users.post('/register')");
  try {
    let {
      name,
      email,
      password,
      salutation,
      marketingPerferences,
      country
    } = req.body;
    name ??= req.body.fullname
    marketingPerferences ??= [];

    const userId = await userService.registerUser({
      name,
      email,
      password,
      salutation,
      marketingPerferences,
      country
    });
    res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
});

// POST login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, ', ', password);

    const user = await userService.loginUser(email, password);
    const role = await userService.getUserRole(user.id);
    const token = jwt.sign({ userId: user.id, userName: user.name, "role" : role},
      process.env.JWT_SECRET, { expiresIn: JWT_EXPIRE_TIME });

    res.json({ message: "Login successful", token });
    
  } catch (error) {
    res.status(401).json({message:error.message});
  }
});

module.exports = router;