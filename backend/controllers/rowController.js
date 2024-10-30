const Worker = require("../models/Worker");
const Block = require("../models/Block");

// Check-in a worker
// Check-in a worker
exports.checkInWorker = async (req, res) => {
  const { workerID, workerName, rowNumber, blockName, jobType } = req.body;

  try {
    console.log("Check-in request body:", req.body);

    // Check for jobType in the request
    if (!jobType) {
      return res.status(400).json({ message: "Job type is required" });
    }

    // Check if the block exists
    const block = await Block.findOne({ block_name: blockName });
    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    // Find the row in the block by row number
    const row = block.rows.find((row) => row.row_number === rowNumber);
    if (!row) {
      return res.status(404).json({ message: "Row not found" });
    }

    // Check if the row is already assigned to another worker
    if (row.worker_name) {
      return res.status(409).json({
        message: `Row ${rowNumber} is currently being worked on by ${row.worker_name}.`,
        remainingStocks: row.remaining_stock_count,
      });
    }

    // Initialize remaining stock count based on the previous session
    let remainingStocks = row.remaining_stock_count || row.stock_count;

    // Assign values to the row fields
    row.worker_name = workerName;
    row.worker_id = workerID;
    row.start_time = new Date(); // Record the current UTC time
    row.job_type = jobType; // Assign job type to the row

    console.log("Assigned job_type:", row.job_type); // Log to confirm assignment

    // Save the updated block with the new worker assignment
    await block.save();

    // Check if the worker exists in the Worker collection
    const workerExists = await Worker.findOne({ workerID: workerID });
    if (!workerExists) {
      // Create a new worker if not found in the collection
      const newWorker = new Worker({
        workerID: workerID,
        name: workerName,
        blocks: [
          {
            block_name: blockName,
            rows: [
              {
                row_number: rowNumber,
                job_type: jobType, // Save job_type on check-in for the worker's record
              },
            ],
          },
        ],
      });
      await newWorker.save();
    } else {
      // If worker exists, update their record with the new row data
      const block = workerExists.blocks.find((b) => b.block_name === blockName);
      if (!block) {
        workerExists.blocks.push({
          block_name: blockName,
          rows: [
            {
              row_number: rowNumber,
              job_type: jobType, // Save job_type on check-in for the worker's record
            },
          ],
        });
      } else {
        const row = block.rows.find((r) => r.row_number === rowNumber);
        if (!row) {
          block.rows.push({
            row_number: rowNumber,
            job_type: jobType, // Save job_type on check-in for the worker's record
          });
        } else {
          row.job_type = jobType; // Update job_type if row exists
        }
      }
      await workerExists.save();
    }

    return res.json({
      message: "Check-in successful",
      rowNumber: row.row_number,
      remainingStocks,
      jobType: row.job_type,
    });
  } catch (error) {
    console.error("Error during check-in:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Check-out a worker
// Check-out a worker
exports.checkOutWorker = async (req, res) => {
  const { workerID, workerName, rowNumber, blockName, stockCount } = req.body;

  try {
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
    const timeSpentInMinutes = (endTime - row.start_time) / 1000 / 60; // time in minutes

    let calculatedStockCount;

    // If stockCount is not provided, assume the worker has worked on all remaining stocks
    if (typeof stockCount === "undefined" || stockCount === null) {
      calculatedStockCount = row.remaining_stock_count || row.stock_count;
    } else {
      // If stockCount is provided, validate it
      calculatedStockCount = stockCount;

      // Ensure stockCount does not exceed the available remaining stocks
      if (
        calculatedStockCount > (row.remaining_stock_count || row.stock_count)
      ) {
        return res
          .status(400)
          .send({ message: "Invalid stock count: exceeds available stocks" });
      }
    }

    // Update the remaining stock count
    row.remaining_stock_count =
      (row.remaining_stock_count || row.stock_count) - calculatedStockCount;

    // Clear worker from the row in the Block collection
    row.worker_name = "";
    row.worker_id = "";
    row.start_time = null;
    row.time_spent = null;

    await block.save();

    // Update or create the worker's record
    let worker = await Worker.findOne({ workerID: workerID });
    if (!worker) {
      // Create new worker if it does not exist
      worker = new Worker({
        workerID: workerID,
        name: workerName,
        blocks: [],
      });
    }

    // Find or add the block for the worker
    const blockIndex = worker.blocks.findIndex(
      (b) => b.block_name === blockName
    );

    const currentDate = new Date(); // Capture the current date

    if (blockIndex === -1) {
      // Add block if it does not exist
      worker.blocks.push({
        block_name: blockName,
        rows: [
          {
            row_number: rowNumber,
            stock_count: calculatedStockCount,
            time_spent: timeSpentInMinutes,
            date: currentDate, // Add the current date to the row
            day_of_week: new Date().toLocaleDateString("en-US", {
              weekday: "long",
            }), // Add the day of the week
          },
        ],
      });
    } else {
      // Update existing block
      const rowIndex = worker.blocks[blockIndex].rows.findIndex(
        (r) => r.row_number === rowNumber
      );
      if (rowIndex === -1) {
        // Add new row if it does not exist
        worker.blocks[blockIndex].rows.push({
          row_number: rowNumber,
          stock_count: calculatedStockCount,
          time_spent: timeSpentInMinutes,
          date: currentDate, // Add the current date to the row
          day_of_week: new Date().toLocaleDateString("en-US", {
            weekday: "long",
          }), // Add the day of the week
        });
      } else {
        // Update existing row
        worker.blocks[blockIndex].rows[rowIndex].stock_count +=
          calculatedStockCount;
        worker.blocks[blockIndex].rows[rowIndex].time_spent +=
          timeSpentInMinutes;
        worker.blocks[blockIndex].rows[rowIndex].date = currentDate; // Update the date
        worker.blocks[blockIndex].rows[rowIndex].day_of_week =
          new Date().toLocaleDateString("en-US", {
            weekday: "long",
          });
      }
    }

    // Increment total stock count
    worker.total_stock_count += calculatedStockCount;
    await worker.save();

    res.send({
      message: "Check-out successful",
      timeSpent: `${Math.floor(timeSpentInMinutes / 60)}hr ${Math.round(
        timeSpentInMinutes % 60
      )}min`,
      rowNumber: row.row_number,
      remainingStocks: row.remaining_stock_count,
    });
  } catch (error) {
    console.error("Error during worker check-out:", error);
    res.status(500).send({ message: "Server error", error });
  }
};

// Get the worker's current check-in
exports.getCurrentCheckins = async (req, res) => {
  try {
    // Find all blocks that contain rows
    const blocks = await Block.find();

    let activeCheckins = [];

    blocks.forEach((block) => {
      block.rows.forEach((row) => {
        // Check if the row is checked in by any worker and not yet checked out
        if (row.worker_id && row.start_time && !row.time_spent) {
          activeCheckins.push({
            blockName: block.block_name,
            rowNumber: row.row_number,
            workerID: row.worker_id,
            workerName: row.worker_name,
            stockCount: row.stock_count,
            startTime: row.start_time,
            remainingStocks: row.remaining_stock_count || row.stock_count,
          });
        }
      });
    });

    if (activeCheckins.length === 0) {
      return res.status(404).json({ message: "No active check-ins found." });
    }

    return res.json(activeCheckins);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// get worker current checkin
exports.getCurrentCheckin = async (req, res) => {
  const { workerID } = req.params;

  try {
    // Find all blocks that contain rows
    const blocks = await Block.find();

    let activeCheckins = [];

    blocks.forEach((block) => {
      block.rows.forEach((row) => {
        // Check if the row is checked in by the worker and not yet checked out
        if (row.worker_id === workerID && row.start_time && !row.time_spent) {
          activeCheckins.push({
            blockName: block.block_name,
            rowNumber: row.row_number,
            workerID: row.worker_id,
            workerName: row.worker_name,
            stockCount: row.stock_count,
            startTime: row.start_time,
            remainingStocks: row.remaining_stock_count || row.stock_count,
          });
        }
      });
    });

    if (activeCheckins.length === 0) {
      return res
        .status(404)
        .json({ message: "No active check-in found for this worker." });
    }

    return res.json(activeCheckins);
  } catch (error) {
    return res.status(500).json({ message: error.message });
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

// get workers
exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({});
    res.send(workers);
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};
