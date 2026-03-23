const express = require("express");
const {
  getAllSkills,
  getEmergingSkills,
  getDecliningSkills,
  getSkillPredictions,
} = require("../controllers/skillController");

const router = express.Router();

router.get("/", getAllSkills);
router.get("/emerging", getEmergingSkills);
router.get("/declining", getDecliningSkills);
router.get("/predictions", getSkillPredictions);

module.exports = router;