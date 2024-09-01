const express = require("express");
const router = express.Router();
const rowController = require("../controllers/rowController");

router.post("/checkin", rowController.checkInWorker);
router.post("/checkout", rowController.checkOutWorker);
router.get("/row/:rowNumber", rowController.getRowByNumber);
router.get("/farm-data", rowController.getAllFarmData);

module.exports = router;
