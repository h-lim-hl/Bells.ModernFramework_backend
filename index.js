const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res)=>{
  res.json({
    message: "Welcome to the API!"
  });
});

const PORT = process.env.PORT || 3000;
app.listion(PORT, ()=>{
  console.log(`Server is running on port: ${PORT}`);
});