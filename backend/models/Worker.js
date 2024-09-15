const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  workerID: { type: String, required: true }, // Ensure this field is included and required
  name: { type: String, required: true },
  total_stock_count: { type: Number, default: 0 },
  blocks: [
    {
      block_name: { type: String },
      rows: [
        {
          row_number: { type: String },
          stock_count: { type: Number },
          time_spent: { type: Number },
        },
      ],
    },
  ],
});

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;
