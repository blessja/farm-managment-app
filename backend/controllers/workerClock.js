const WorkerClock = require("../models/WorkerClock");

// Add a new clock-in entry for a worker
exports.addClockIn = async (req, res) => {
  const { workerID, workerName } = req.body;

  try {
    let worker = await WorkerClock.findOne({ workerID });

    // If worker does not exist, create a new record
    if (!worker) {
      worker = new WorkerClock({
        workerID,
        workerName,
        clockIns: [],
        workedHoursPerDay: {
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
          Monday: 0,
          Tuesday: 0,
        },
        totalWorkedHours: 0,
      });
    }

    // Check if the worker has an active clock-in session
    const activeSession = worker.clockIns.find(
      (session) => !session.clockOutTime
    );

    if (activeSession) {
      return res.status(400).json({
        message: `Worker ${workerName} is already clocked in. Please clock out first.`,
      });
    }

    // Add the new clock-in session
    worker.clockIns.push({
      clockInTime: new Date(),
      day: new Date().toLocaleString("en-US", { weekday: "long" }), // Get the current day
    });

    await worker.save();

    res.status(201).json({ message: "Clock-in entry added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Clock-out a worker
exports.addClockOut = async (req, res) => {
  const { workerID, workerName } = req.body;

  try {
    const worker = await WorkerClock.findOne({ workerID, workerName });

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const currentSession = worker.clockIns.find(
      (session) => !session.clockOutTime
    );

    if (!currentSession) {
      return res
        .status(400)
        .json({ message: `Worker ${workerName} is not clocked in.` });
    }

    // Set clock-out time and calculate duration
    currentSession.clockOutTime = new Date();
    const duration =
      (new Date(currentSession.clockOutTime) -
        new Date(currentSession.clockInTime)) /
      1000 /
      60 /
      60; // Convert milliseconds to hours
    currentSession.duration = duration;

    // Get the day of the week
    const clockInDay = currentSession.day;

    // Update the hours worked on that specific day
    worker.workedHoursPerDay[clockInDay] += duration;

    // Add to total worked hours
    worker.totalWorkedHours += duration;

    await worker.save();
    res.json({
      message: `Worker ${
        worker.workerName
      } clocked out successfully. Worked ${duration.toFixed(
        2
      )} hours on ${clockInDay}.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// get all the clock data of the workers
exports.getAllClockData = async (req, res) => {
  try {
    const workers = await WorkerClock.find({});
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
