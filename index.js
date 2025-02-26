require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const pool = require("./database"); // needs .env info
const cookieParser = require("cookie-parser");

const app = express();

const productsRouter = require("./routes/products");
const usersRouter = require("./routes/users");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require("./routes/checkout");
const stripeRoutes = require("./routes/stripe");
//const csrfRoutes = require("./routes/csrf");
const imageUploadRoutes = require("./routes/imageUpload");
const stockManagementRoutes = require("./routes/stock");

app.use(cors({
  origin: process.env.CORS_ORIGIN_LIST,
  credentials: true
}));

app.use(cookieParser());
// const csrfProtection = csrf({ cookie: true });

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API!"
  });
});

app.use("/api/products", express.json(), productsRouter);
app.use("/api/users", express.json(), usersRouter);
app.use("/api/cart", express.json(), cartRoutes);
app.use("/api/checkout", express.json(), checkoutRoutes);
// app.use("/api/csrf", express.json(), csrfRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("api/imageUpload", express.json(), imageUploadRoutes);
app.use("api/stock", express.json(), stockManagementRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});