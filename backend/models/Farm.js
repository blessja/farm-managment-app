const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema({
  block_name: String,
  variety: String,
  year_planted: Number,
  rootstock: String,
  total_stocks: Number,
  total_rows: Number,
  size_ha: Number,
  rows: [
    {
      row_number: Number,
      worker_name: String,
      stock_count: Number,
    },
  ],
});

const Farm = mongoose.model("Farm", farmSchema);
module.exports = Farm;
