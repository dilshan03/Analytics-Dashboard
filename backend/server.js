const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const jobRoutes = require("./routes/jobRoutes");
const skillRoutes = require("./routes/skillRoutes");
const roleEvolutionRoutes = require("./routes/roleEvolutionRoutes");
const mlRoutes = require("./routes/mlRoutes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/jobs", jobRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/roles", roleEvolutionRoutes);
app.use("/api/ml", mlRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});