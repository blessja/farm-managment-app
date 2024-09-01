const mongoose = require("mongoose");

const rowSchema = new mongoose.Schema({
  row_number: Number,
  worker_name: String,
  stock_count: Number,
  start_time: Date,
});

const farmSchema = new mongoose.Schema({
  block_name: String,
  variety: String,
  year_planted: Number,
  rootstock: String,
  total_stocks: Number,
  total_rows: Number,
  size_ha: Number,
  rows: [rowSchema],
});

const Farm = mongoose.model("Farm", farmSchema);

module.exports = Farm;
