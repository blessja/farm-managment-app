const Farm = require("../models/Farm");

// Check-in a worker
exports.checkInWorker = async (req, res) => {
  const { workerName, rowNumber } = req.body;
  try {
    const farm = await Farm.findOne({ block_name: "Blok 1" });
    const row = farm.rows.find((row) => row.row_number === rowNumber);

    if (!row) {
      return res.status(404).json({ message: "Row not found" });
    }

    row.worker_name = workerName;
    row.start_time = new Date();
    await farm.save();
    res.json({ message: "Check-in successful", row });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check-out a worker
exports.checkOutWorker = async (req, res) => {
  try {
    const { workerName, rowNumber, stockCount } = req.body;
    const farm = await Farm.findOne({ block_name: "Blok 1" });
    const row = farm.rows.find(
      (row) => row.row_number === rowNumber && row.worker_name === workerName
    );

    if (!row) {
      return res.status(404).json({ message: "Row or worker not found" });
    }

    const endTime = new Date();
    const timeSpent = (endTime - row.start_time) / 1000 / 60; // Time in minutes

    row.stock_count = stockCount;
    row.worker_name = "";
    row.start_time = null;

    await farm.save();
    res.json({ message: "Check-out successful", timeSpent, row });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get row data by row number
exports.getRowByNumber = async (req, res) => {
  try {
    const { rowNumber } = req.params;
    const farm = await Farm.findOne({ block_name: "Blok 1" });
    const row = farm.rows.find((row) => row.row_number === rowNumber);

    if (!row) {
      return res.status(404).json({ message: "Row not found" });
    }

    res.json(row);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all farm data
exports.getAllFarmData = async (req, res) => {
  try {
    const farm = await Farm.findOne({ block_name: "Blok 1" });

    if (!farm) {
      return res.status(404).json({ message: "Farm data not found" });
    }

    res.json(farm);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
