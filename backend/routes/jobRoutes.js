const express = require("express");
const {
  getAllJobs,
  getTopGrowingJobs,
  getTopDecliningJobs,
  getJobPredictions,
} = require("../controllers/jobController");

const router = express.Router();

router.get("/", getAllJobs);
router.get("/top-growing", getTopGrowingJobs);
router.get("/top-declining", getTopDecliningJobs);
router.get("/predictions", getJobPredictions);

module.exports = router;