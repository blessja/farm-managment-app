const express = require("express");
const router = express.Router();
const workerClock = require("../controllers/workerClock");

router.post("/clockin", workerClock.addClockIn);
router.post("/clockout", workerClock.addClockOut);

// router.post("/checkin", rowController.checkInWorker);
// router.post("/checkout", rowController.checkOutWorker);

module.exports = router;
