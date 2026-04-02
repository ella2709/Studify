require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const crypto = require("crypto");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const uploadedMaterials = [];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "text/plain",
      "text/markdown",
      "application/json",
      "text/csv",
    ];

    const allowedExtensions = [".txt", ".md", ".json", ".csv"];
    const lowerName = file.originalname.toLowerCase();
    const isAllowedExtension = allowedExtensions.some((ext) =>
      lowerName.endsWith(ext)
    );

    if (allowedMimeTypes.includes(file.mimetype) || isAllowedExtension) {
      return cb(null, true);
    }

    cb(new Error("Only txt, md, json, csv files are allowed right now"));
  },
});


app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running ✅" });
});


app.post("/api/materials/upload", upload.array("files", 10), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }

    const savedFiles = files.map((file) => {
      const textContent = file.buffer.toString("utf-8");

      const material = {
        id: crypto.randomUUID(),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        text: textContent,
      };

      uploadedMaterials.unshift(material);

      return {
        id: material.id,
        originalName: material.originalName,
        mimeType: material.mimeType,
        size: material.size,
        uploadedAt: material.uploadedAt,
      };
    });

    res.status(201).json({
      message: "Files uploaded successfully",
      files: savedFiles,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({
      error: err?.message || "File upload failed",
    });
  }
});

app.get("/api/materials", (req, res) => {
  const files = uploadedMaterials.map((item) => ({
    id: item.id,
    originalName: item.originalName,
    mimeType: item.mimeType,
    size: item.size,
    uploadedAt: item.uploadedAt,
  }));

  res.json({ files });
});


app.get("/api/materials/:id", (req, res) => {
  const material = uploadedMaterials.find((item) => item.id === req.params.id);

  if (!material) {
    return res.status(404).json({ error: "Material not found" });
  }

  res.json(material);
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
    Answer ONLY using the material below.
    If the answer is not in the material, say:
    "השאלה שלך לא נמצאת בחומר הלימודי - נא להעלות עוד חומר."
    Answer in the SAME LANGUAGE as the question.
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
      You are a study assistant.
      Summarize the following study material in a clear and concise way.
      IMPORTANT:
      - Write the summary in the SAME LANGUAGE as the original text.
      - Do NOT add information that is not in the material.

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