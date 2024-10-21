const express = require("express");
const router = express.Router();
const { monitorClockIns } = require("../controllers/clockController");
const workerClock = require("../controllers/workerClock");

router.post("/clockin", workerClock.addClockIn);
router.post("/clockout", workerClock.addClockOut);
router.get("/monitor-clockins", monitorClockIns);

// router.post("/checkin", rowController.checkInWorker);
// router.post("/checkout", rowController.checkOutWorker);

module.exports = router;
