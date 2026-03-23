const RoleEvolution = require("../models/RoleEvolution");

// @desc    Get all role evolution records
// @route   GET /api/roles
// @access  Public
const getAllRoleEvolutions = async (req, res) => {
  try {
    const roles = await RoleEvolution.find().sort({ role: 1, year: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch role evolution data" });
  }
};

// @desc    Get role evolution timeline by role
// @route   GET /api/roles/evolution/:role
// @access  Public
const getRoleEvolutionByRole = async (req, res) => {
  try {
    const roleName = req.params.role;

    const roleData = await RoleEvolution.find({
      role: { $regex: new RegExp(`^${roleName}$`, "i") },
    }).sort({ year: 1 });

    if (!roleData.length) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(roleData);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch role evolution timeline" });
  }
};

// @desc    Compare role evolution between two years
// @route   GET /api/roles/compare/:role?from=2022&to=2026
// @access  Public
const compareRoleEvolution = async (req, res) => {
  try {
    const roleName = req.params.role;
    const fromYear = Number(req.query.from);
    const toYear = Number(req.query.to);

    if (!fromYear || !toYear) {
      return res
        .status(400)
        .json({ message: "Please provide both 'from' and 'to' year query parameters" });
    }

    const fromData = await RoleEvolution.findOne({
      role: { $regex: new RegExp(`^${roleName}$`, "i") },
      year: fromYear,
    });

    const toData = await RoleEvolution.findOne({
      role: { $regex: new RegExp(`^${roleName}$`, "i") },
      year: toYear,
    });

    if (!fromData || !toData) {
      return res.status(404).json({ message: "Role data not found for selected years" });
    }

    const addedSkills = toData.skills.filter((skill) => !fromData.skills.includes(skill));
    const removedSkills = fromData.skills.filter((skill) => !toData.skills.includes(skill));
    const unchangedSkills = fromData.skills.filter((skill) => toData.skills.includes(skill));

    res.json({
      role: roleName,
      fromYear,
      toYear,
      fromSkills: fromData.skills,
      toSkills: toData.skills,
      addedSkills,
      removedSkills,
      unchangedSkills,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to compare role evolution" });
  }
};

module.exports = {
  getAllRoleEvolutions,
  getRoleEvolutionByRole,
  compareRoleEvolution,
};