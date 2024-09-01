const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const connectDB = require("./config/db");
const rowRoutes = require("./routes/rowRoutes");

const app = express();
const port = 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", rowRoutes);

module.exports = app;
