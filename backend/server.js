require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running ✅" });
});


app.post("/api/ai/ask", async (req, res) => {
  try {
    const { materialText, question } = req.body;

    if (!materialText || !question) {
      return res.status(400).json({ error: "Missing materialText or question" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a study assistant.
Answer the question ONLY using the material below.
If the answer is not in the material, say: "השאלה שלך לא נמצאת בחומר הלימודי - נא להעלות עוד חומר.

MATERIAL:
${materialText}

QUESTION:
${question}
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    res.json({ answer });

  } catch (err) {
  console.error("AI ERROR FULL:", err);

  res.status(500).json({
    error: err?.message || "AI request failed",
  });
}
});

app.post("/api/ai/summarize", async (req, res) => {
  try {

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Summarize the following study material in a clear and short way.

Material:
${text}
`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({ summary });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Summarization failed" });
  }
});

const PORT = process.env.PORT || 3001;

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in .env");
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});