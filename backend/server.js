// const express = require("express");
// const cors = require("cors");

// const app = express();
// const port = 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Sample JSON data
// const farmData = {
//   block_name: "Blok 1",
//   variety: "Sweet Celebration",
//   year_planted: 2022,
//   rootstock: "Ramsey",
//   total_stocks: 2341,
//   total_rows: 44,
//   size_ha: 1.35,
//   rows: [
//     { row_number: 16, worker_name: "", stock_count: 78 },
//     { row_number: 17, worker_name: "", stock_count: 73 },
//     // ... other rows
//   ],
// };

// // POST /api/checkin
// app.post("/api/checkin", (req, res) => {
//   const { workerName, rowNumber } = req.body;

//   // Find the row in the farm data
//   const row = farmData.rows.find((r) => r.row_number === rowNumber);

//   if (!row) {
//     return res.status(404).send({ message: "Row not found" });
//   }

//   // Log the check-in time and assign the worker
//   row.worker_name = workerName;
//   row.start_time = new Date().toISOString(); // Store the start time

//   res.send({ message: "Check-in successful", row });
// });

// // POST /api/checkout
// app.post("/api/checkout", (req, res) => {
//   const { workerName, rowNumber, stockCount } = req.body;

//   // Find the row in the farm data
//   const row = farmData.rows.find(
//     (r) => r.row_number === rowNumber && r.worker_name === workerName
//   );

//   if (!row) {
//     return res.status(404).send({ message: "Row or worker not found" });
//   }

//   // Calculate the time worked
//   const endTime = new Date().toISOString();
//   const startTime = new Date(row.start_time);
//   const timeSpent = (new Date(endTime) - startTime) / 1000 / 60; // Time in minutes

//   // Update the stock count and reset worker info
//   row.stock_count = stockCount;
//   row.worker_name = "";
//   row.start_time = "";

//   res.send({ message: "Check-out successful", timeSpent, row });
// });

// // GET /api/row/:rowNumber
// app.get("/api/row/:rowNumber", (req, res) => {
//   const { rowNumber } = req.params;

//   // Find the row in the farm data
//   const row = farmData.rows.find((r) => r.row_number === parseInt(rowNumber));

//   if (!row) {
//     return res.status(404).send({ message: "Row not found" });
//   }

//   res.send(row);
// });

// // API endpoint to get farm data
// app.get("/api/farm-data", (req, res) => {
//   res.json(farmData);
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
const app = require("./app");

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
