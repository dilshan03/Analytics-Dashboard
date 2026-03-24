const Skill = require("../models/Skills");

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getAllSkills = async (req, res) => {
  try {
    const { category, skill, year } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (skill) {
      filter.skill = { $regex: skill, $options: "i" };
    }

    if (year) {
      filter.year = Number(year);
    }

    const skills = await Skill.find(filter).sort({ year: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch skills" });
  }
};

// @desc    Get emerging skills
// @route   GET /api/skills/emerging
// @access  Public
const getEmergingSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ skill: 1, year: 1 });

    const grouped = {};

    skills.forEach((item) => {
      if (!grouped[item.skill]) {
        grouped[item.skill] = [];
      }
      grouped[item.skill].push(item);
    });

    const emergingSkills = [];

    for (const skill in grouped) {
      const records = grouped[skill];

      if (records.length >= 2) {
        const previous = records[records.length - 2];
        const current = records[records.length - 1];

        const growthRate =
          ((current.demandCount - previous.demandCount) / previous.demandCount) * 100;

        if (growthRate > 20) {
          emergingSkills.push({
            skill,
            category: current.category,
            previousYear: previous.year,
            currentYear: current.year,
            growthRate: Number(growthRate.toFixed(2)),
            currentDemand: current.demandCount,
            status: "Emerging",
          });
        }
      }
    }

    emergingSkills.sort((a, b) => b.growthRate - a.growthRate);

    res.json(emergingSkills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch emerging skills" });
  }
};

// @desc    Get declining skills
// @route   GET /api/skills/declining
// @access  Public
const getDecliningSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ skill: 1, year: 1 });

    const grouped = {};

    skills.forEach((item) => {
      if (!grouped[item.skill]) {
        grouped[item.skill] = [];
      }
      grouped[item.skill].push(item);
    });

    const decliningSkills = [];

    for (const skill in grouped) {
      const records = grouped[skill];

      if (records.length >= 2) {
        const previous = records[records.length - 2];
        const current = records[records.length - 1];

        const growthRate =
          ((current.demandCount - previous.demandCount) / previous.demandCount) * 100;

        if (growthRate < 0) {
          decliningSkills.push({
            skill,
            category: current.category,
            previousYear: previous.year,
            currentYear: current.year,
            growthRate: Number(growthRate.toFixed(2)),
            currentDemand: current.demandCount,
            status: "Declining",
          });
        }
      }
    }

    decliningSkills.sort((a, b) => a.growthRate - b.growthRate);

    res.json(decliningSkills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch declining skills" });
  }
};

// @desc    Get skill predictions
// @route   GET /api/skills/predictions
// @access  Public
const getSkillPredictions = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ skill: 1, year: 1 });

    const grouped = {};

    skills.forEach((item) => {
      if (!grouped[item.skill]) {
        grouped[item.skill] = [];
      }
      grouped[item.skill].push(item);
    });

    const predictions = [];

    for (const skill in grouped) {
      const records = grouped[skill];

      if (records.length >= 2) {
        const prev = records[records.length - 2];
        const current = records[records.length - 1];

        const growthRate = (current.demandCount - prev.demandCount) / prev.demandCount;
        const predictedDemand = Math.round(current.demandCount * (1 + growthRate));

        predictions.push({
          skill,
          category: current.category,
          currentYear: current.year,
          currentDemand: current.demandCount,
          predictedYear: current.year + 1,
          predictedDemand,
          growthRate: Number((growthRate * 100).toFixed(2)),
        });
      }
    }

    predictions.sort((a, b) => b.predictedDemand - a.predictedDemand);

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch skill predictions" });
  }
};

module.exports = {
  getAllSkills,
  getEmergingSkills,
  getDecliningSkills,
  getSkillPredictions,
};