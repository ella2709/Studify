require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const examsRoutes = require("./routes/examRoutes");
const materialsRoutes = require("./routes/materialsRoutes");
const summariesRoutes = require("./routes/summaryRoutes");
const questionsRoutes = require("./routes/questionRoutes");
const projectsRoutes = require("./routes/projectRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running ✅" });
});

app.use("/api/users", userRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/summaries", summariesRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/exams", examsRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3001;

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in .env");
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});