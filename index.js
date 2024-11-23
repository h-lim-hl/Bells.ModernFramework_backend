require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const pool = require("./database"); // needs .env info

const productsRouter = require("./routes/products");
const usersRouter = require("./routes/users");
const cartRoutes = require("./routes/cart");

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get("/", (req, res)=>{
  res.json({
    message: "Welcome to the API!"
  });
});

app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 3000;
app.listion(PORT, ()=>{
  console.log(`Server is running on port: ${PORT}`);
});