const Farm = require("../models/Farm");
const Row = require("../models/Row");

// Check-in a worker
exports.checkInWorker = async (req, res) => {
  const { workerName, rowNumber } = req.body;
  try {
    const farm = await Farm.findOne({ block_name: "Blok 1" });
    const row = farm.rows.find((row) => row.row_number === rowNumber);

    if (!row) {
      return res.status(404).json({ message: "Row not found" });
    }

    // Set the time with the offset
    const startTime = new Date(new Date().getTime() + 120 * 60 * 1000);

    row.worker_name = workerName;
    row.start_time = startTime;
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

    const farm = await Farm.findOne({ "rows.row_number": rowNumber });

    if (!farm) {
      return res.status(404).send({ message: "Row not found" });
    }

    const row = farm.rows.find(
      (row) => row.row_number === rowNumber && row.worker_name === workerName
    );

    if (!row) {
      return res.status(404).send({ message: "Row or worker not found" });
    }

    // Apply the offset for the end time
    const endTime = new Date(new Date().getTime() + 120 * 60 * 1000);
    const timeSpent = (endTime - row.start_time) / 1000 / 60; // Time in minutes

    // Calculate remaining stocks dynamically without modifying the database
    let remainingStocks;
    if (stockCount !== undefined) {
      remainingStocks = row.stock_count - stockCount; // Calculate based on the worker's input
    } else {
      remainingStocks = 0; // If the worker finished the row, all stocks are used
    }

    // Reset worker details without modifying the original stock count
    row.worker_name = "";
    row.start_time = null;

    await farm.save();

    res.send({
      message: "Check-out successful",
      timeSpent,
      rowNumber: row.row_number,
      remainingStocks,
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};

// Get row data by row number
exports.getRowByNumber = async (req, res) => {
  try {
    const { rowNumber } = req.params;
    const farm = await Farm.findOne({ block_name: "Blok 1" });

    if (!farm) {
      return res.status(404).send({ message: "Farm not found" });
    }

    const row = farm.rows.find((row) => row.row_number === parseInt(rowNumber));

    if (!row) {
      return res.status(404).send({ message: "Row not found" });
    }

    res.send(row);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
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

exports.getRemainingStocks = async (req, res) => {
  try {
    const farm = await Farm.findOne({ block_name: "Blok 1" });
    if (!farm) {
      return res.status(404).send({ message: "Farm not found" });
    }

    // Calculate total used stocks
    const totalUsedStocks = farm.rows.reduce(
      (acc, row) => acc + row.stock_count,
      0
    );

    // Calculate remaining stocks
    const remainingStocks = farm.total_stocks - totalUsedStocks;

    res.send({ remainingStocks });
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};

exports.getRemainingStocksForRow = async (req, res) => {
  try {
    const { rowNumber } = req.params;

    // Find the farm document that contains the specific row
    const farm = await Farm.findOne({ "rows.row_number": parseInt(rowNumber) });

    if (!farm) {
      return res.status(404).send({ message: "Farm or Row not found" });
    }

    // Find the specific row within the farm document
    const row = farm.rows.find((row) => row.row_number === parseInt(rowNumber));

    if (!row) {
      return res.status(404).send({ message: "Row not found" });
    }

    // Calculate the total stocks accounted for by summing up all stock counts in rows
    const totalCountedStocks = farm.rows.reduce(
      (total, row) => total + row.stock_count,
      0
    );

    // Calculate the remaining stocks for the specific row
    const remainingStocks =
      farm.total_stocks - totalCountedStocks + row.stock_count;

    res.send({ rowNumber: row.row_number, remainingStocks });
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};
