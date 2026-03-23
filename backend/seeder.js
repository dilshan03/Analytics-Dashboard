const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const Job = require("./models/job");
const Skill = require("./models/Skills");
const RoleEvolution = require("./models/RoleEvolution");

const jobs = require("./data/jobs");
const skills = require("./data/skills");
const roleEvolutions = require("./data/roleEvolutions");

dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    await Job.deleteMany();
    await Skill.deleteMany();
    await RoleEvolution.deleteMany();

    await Job.insertMany(jobs);
    await Skill.insertMany(skills);
    await RoleEvolution.insertMany(roleEvolutions);

    console.log("Sample data imported successfully");
    process.exit();
  } catch (error) {
    console.error("Error importing data:", error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Job.deleteMany();
    await Skill.deleteMany();
    await RoleEvolution.deleteMany();

    console.log("All data deleted successfully");
    process.exit();
  } catch (error) {
    console.error("Error deleting data:", error.message);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}