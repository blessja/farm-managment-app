const Worker = require("../models/Worker");
const Block = require("../models/Block");

// Check-in a worker
exports.checkInWorker = async (req, res) => {
  const { workerName, rowNumber, blockName } = req.body;
  try {
    // Find the block with the given block name
    const block = await Block.findOne({ block_name: blockName });
    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    // Find the specific row in the block
    const row = block.rows.find((row) => row.row_number === rowNumber);
    if (!row) {
      return res.status(404).json({ message: "Row not found" });
    }

    // Check if the row is already assigned to a worker
    if (row.worker_name) {
      return res.status(400).json({
        message: `Row ${rowNumber} is already being worked on by ${row.worker_name}. The row must be checked out before another worker can check in.`,
      });
    }

    // Assign the worker and set the start time
    row.worker_name = workerName;
    row.start_time = new Date();
    await block.save();

    // Send a response after the block is saved
    return res.json({ message: "Check-in successful", row });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Check-out a worker
exports.checkOutWorker = async (req, res) => {
  try {
    const { workerName, rowNumber, blockName, stockCount } = req.body;

    const block = await Block.findOne({ block_name: blockName });
    if (!block) {
      return res.status(404).send({ message: "Block not found" });
    }

    const row = block.rows.find(
      (row) => row.row_number === rowNumber && row.worker_name === workerName
    );

    if (!row) {
      return res.status(404).send({ message: "Row or worker not found" });
    }

    const endTime = new Date();
    const timeSpent = (endTime - row.start_time) / 1000 / 60; // time in minutes

    let calculatedStockCount = stockCount;
    if (typeof stockCount !== "number" || isNaN(stockCount)) {
      calculatedStockCount = row.stock_count;
    } else if (stockCount > row.stock_count) {
      return res
        .status(400)
        .send({ message: "Invalid stock count: exceeds available stocks" });
    }

    // Ensure the block exists in the worker's document
    const worker = await Worker.findOneAndUpdate(
      { name: workerName, "blocks.block_name": blockName },
      {
        $setOnInsert: {
          name: workerName,
          blocks: [{ block_name: blockName, rows: [] }],
        },
      },
      { new: true, upsert: true }
    );

    // Now update the specific row in the Worker document
    const updatedWorker = await Worker.findOneAndUpdate(
      {
        name: workerName,
        "blocks.block_name": blockName,
      },
      {
        $inc: { total_stock_count: calculatedStockCount },
        $push: {
          "blocks.$.rows": {
            row_number: rowNumber,
            stock_count: calculatedStockCount,
            time_spent: timeSpent, // Save time spent to worker document
          },
        },
      },
      { new: true }
    );

    // Save the time spent and clear worker from the row in the Block collection
    row.worker_name = "";
    row.start_time = null;
    row.time_spent = timeSpent; // Save time spent in the Block document

    await block.save();

    res.send({
      message: "Check-out successful",
      timeSpent, // Return time spent in response
      rowNumber: row.row_number,
      stockCount: calculatedStockCount,
    });
  } catch (error) {
    console.error("Error during worker check-out:", error);
    res.status(500).send({ message: "Server error", error });
  }
};

// Get row data by row number
exports.getRowByNumber = async (req, res) => {
  try {
    const { rowNumber } = req.params;
    const block = await Block.findOne({ block_name: blockName });

    if (!block) {
      return res.status(404).send({ message: "Block not found" });
    }

    const row = block.rows.find(
      (row) => row.row_number === parseInt(rowNumber)
    );

    if (!row) {
      return res.status(404).send({ message: "Row not found" });
    }

    res.send(row);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};

// Get all block data
exports.getAllBlockData = async (req, res) => {
  try {
    const block = await Block.findOne({ block_name: blockName });

    if (!block) {
      return res.status(404).json({ message: "Block data not found" });
    }

    res.json(block);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a block by name
exports.getBlockByName = async (req, res) => {
  try {
    const block = await Block.findOne({ block_name: blockName });

    if (!block) {
      return res.status(404).send({ message: "Block not found" });
    }

    res.send(block);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};

exports.getRemainingStocks = async (req, res) => {
  try {
    const block = await Block.findOne({ block_name: blockName });
    if (!block) {
      return res.status(404).send({ message: "Block not found" });
    }

    // Calculate total used stocks
    const totalUsedStocks = block.rows.reduce(
      (acc, row) => acc + row.stock_count,
      0
    );

    // Calculate remaining stocks
    const remainingStocks = block.total_stocks - totalUsedStocks;

    res.send({ remainingStocks });
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};

exports.getRemainingStocksForRow = async (req, res) => {
  try {
    const { rowNumber } = req.params;

    // Find the block document that contains the specific row
    const block = await Block.findOne({
      "rows.row_number": parseInt(rowNumber),
    });

    if (!block) {
      return res.status(404).send({ message: "Block or Row not found" });
    }

    // Find the specific row within the block document
    const row = block.rows.find(
      (row) => row.row_number === parseInt(rowNumber)
    );

    if (!row) {
      return res.status(404).send({ message: "Row not found" });
    }

    // Calculate the total stocks accounted for by summing up all stock counts in rows
    const totalCountedStocks = block.rows.reduce(
      (total, row) => total + row.stock_count,
      0
    );

    // Calculate the remaining stocks for the specific row
    const remainingStocks =
      block.total_stocks - totalCountedStocks + row.stock_count;

    res.send({ rowNumber: row.row_number, remainingStocks });
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};
