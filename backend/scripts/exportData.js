/**
 * exportData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Exports jobs.js and skills.js to a single JSON file at:
 *   ml-service/data/market_data.json
 *
 * This allows the Python ML microservice to read the data without
 * needing a MongoDB connection.
 *
 * Run: node scripts/exportData.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require("fs");
const path = require("path");

const jobs = require("../data/jobs");
const skills = require("../data/skills");

const outputDir = path.join(__dirname, "../../ml-service/data");
const outputFile = path.join(outputDir, "market_data.json");

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const payload = { jobs, skills };

fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2), "utf-8");

console.log("✅ Exported market data to ml-service/data/market_data.json");
console.log(`   Jobs   : ${jobs.length} records`);
console.log(`   Skills : ${skills.length} records`);
