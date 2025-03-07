const userData = require('../data/userData');
const bcrypt = require('bcrypt');

async function registerUser({ name, email, password, salutation, marketingPreferences, country }) {
  console.log("registerUser()");
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  const existingUser = await userData.getUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return await userData.createUser({
    name,
    email,
    password: hashedPassword,
    salutation,
    marketingPreferences,
    country
  });
}

async function loginUser(email, password) {
  const user = await userData.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  return user;
}

async function getUserRole(user_id) {
  const role = await userDate.getUserRole(user_id);
  return role; // undefined or null is non-staff
}

module.exports = {
  registerUser,
  loginUser,
  getUserRole
};
