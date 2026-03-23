const express = require("express");
const {
  getAllRoleEvolutions,
  getRoleEvolutionByRole,
  compareRoleEvolution,
} = require("../controllers/roleEvolutionController");

const router = express.Router();

router.get("/", getAllRoleEvolutions);
router.get("/evolution/:role", getRoleEvolutionByRole);
router.get("/compare/:role", compareRoleEvolution);

module.exports = router;