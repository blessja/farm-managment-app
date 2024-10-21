const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const connectDB = require("./config/db");
const rowRoutes = require("./routes/rowRoutes");
const varietyRoutes = require("./routes/varietyRoutes");
const blockRoutes = require("./routes/blockRoutes");
const bunchRoutes = require("./routes/bunchRoutes");
const workerRoutes = require("./routes/workerRoutes");
const clockRoutes = require("./routes/clockRoutes");

const app = express();
const port = 5000;

// Connect to MongoDB
connectDB();

// Middleware
// app.use(cors());
app.use(express.json());

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:4000",
    "http://localhost:8100",
    "capacitor://localhost",
    "https://localhost",
    "ionic://localhost",
    "http://localhost:5173",
    "http://localhost:8101",
    "http://192.168.0.21:8135",
    "http://192.168.0.103:8101",
    "capacitor://localhost",
    "ionic://localhost",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));
// Routes
app.use("/api", rowRoutes);
app.use("/api", clockRoutes);
app.use("/api/variety", varietyRoutes);
app.use("/api/block", blockRoutes);
app.use("/api/stocks", bunchRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/clock", clockRoutes);
app.use("/api/monitor-clockins", clockRoutes);

module.exports = app;
