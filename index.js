require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const pool = require("./database"); // needs .env info

const app = express();

app.use(cors());
app.use(express.json());

const productsRouter = require("./routes/products");
const usersRouter = require("./routes/users");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");

app.get("/", (req, res)=>{
  res.json({
    message: "Welcome to the API!"
  });
});

app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout/process", checkoutRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log(`Server is running on port: ${PORT}`);
});