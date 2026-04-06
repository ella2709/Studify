require("dotenv").config();
const express = require("express");
const cors = require("cors");

const materialsRoutes = require("./routes/materialsRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running ✅" });
});

app.use("/api/materials", materialsRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 3001;

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in .env");
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});