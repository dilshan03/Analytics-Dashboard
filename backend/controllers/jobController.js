const Job = require("../models/job");

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ year: 1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

// @desc    Get top growing jobs
// @route   GET /api/jobs/top-growing
// @access  Public
const getTopGrowingJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ role: 1, year: 1 });

    const grouped = {};

    jobs.forEach((job) => {
      if (!grouped[job.role]) {
        grouped[job.role] = [];
      }
      grouped[job.role].push(job);
    });

    const growthData = [];

    for (const role in grouped) {
      const records = grouped[role];

      if (records.length >= 2) {
        const previous = records[records.length - 2];
        const current = records[records.length - 1];

        const growthRate =
          ((current.demandCount - previous.demandCount) / previous.demandCount) * 100;

        growthData.push({
          role,
          previousYear: previous.year,
          currentYear: current.year,
          previousDemand: previous.demandCount,
          currentDemand: current.demandCount,
          growthRate: Number(growthRate.toFixed(2)),
        });
      }
    }

    growthData.sort((a, b) => b.growthRate - a.growthRate);

    res.json(growthData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch top growing jobs" });
  }
};

// @desc    Get top declining jobs
// @route   GET /api/jobs/top-declining
// @access  Public
const getTopDecliningJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ role: 1, year: 1 });

    const grouped = {};

    jobs.forEach((job) => {
      if (!grouped[job.role]) {
        grouped[job.role] = [];
      }
      grouped[job.role].push(job);
    });

    const declineData = [];

    for (const role in grouped) {
      const records = grouped[role];

      if (records.length >= 2) {
        const previous = records[records.length - 2];
        const current = records[records.length - 1];

        const growthRate =
          ((current.demandCount - previous.demandCount) / previous.demandCount) * 100;

        declineData.push({
          role,
          previousYear: previous.year,
          currentYear: current.year,
          previousDemand: previous.demandCount,
          currentDemand: current.demandCount,
          growthRate: Number(growthRate.toFixed(2)),
        });
      }
    }

    declineData.sort((a, b) => a.growthRate - b.growthRate);

    res.json(declineData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch top declining jobs" });
  }
};

// @desc    Get job predictions
// @route   GET /api/jobs/predictions
// @access  Public
const getJobPredictions = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ role: 1, year: 1 });

    const grouped = {};

    jobs.forEach((job) => {
      if (!grouped[job.role]) {
        grouped[job.role] = [];
      }
      grouped[job.role].push(job);
    });

    const predictions = [];

    for (const role in grouped) {
      const records = grouped[role];

      if (records.length >= 2) {
        const last = records[records.length - 1];
        const prev = records[records.length - 2];

        const growthRate = (last.demandCount - prev.demandCount) / prev.demandCount;
        const predictedDemand = Math.round(last.demandCount * (1 + growthRate));

        predictions.push({
          role,
          currentYear: last.year,
          currentDemand: last.demandCount,
          predictedYear: last.year + 1,
          predictedDemand,
          growthRate: Number((growthRate * 100).toFixed(2)),
        });
      }
    }

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job predictions" });
  }
};

module.exports = {
  getAllJobs,
  getTopGrowingJobs,
  getTopDecliningJobs,
  getJobPredictions,
};