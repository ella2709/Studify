const { GoogleGenerativeAI } = require("@google/generative-ai");
const { detectLanguage } = require("../utils/textUtils");
const {
  normalizeGeminiError,
} = require("./geminiErrorHelper");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSummaryFromContext(topic, relevantChunks) {
  try {
    const context = relevantChunks
      .map(
        (chunk, index) => `
[Source ${index + 1}]
File: ${chunk.fileName}
Chunk: ${chunk.chunkIndex + 1}

${chunk.text}
`
      )
      .join("\n--------------------\n");

    const outputLanguage = detectLanguage(topic);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are a study assistant.

Create a summary ONLY about the requested topic, based ONLY on the retrieved excerpts below.

IMPORTANT RULES:
- Use ONLY the retrieved excerpts.
- Do NOT use outside knowledge.
- Do NOT summarize unrelated excerpts.
- Do NOT mention files that are not relevant to the summary.
- Do NOT say that the summary is based on all uploaded files.
- If the excerpts do not clearly cover the requested topic, say exactly:
"No relevant information was found in the uploaded study materials for this topic."
- If the user explicitly requests a specific output language, you MUST follow that request.
- Otherwise, write the summary in ${outputLanguage}.
- Keep the summary concise, clear, and focused only on the requested topic.

REQUESTED TOPIC:
${topic}

RETRIEVED EXCERPTS:
${context}
`;

    const result = await model.generateContent(prompt);

    const summary = result?.response?.text();

    if (!summary) {
      throw new Error("Gemini did not return a summary");
    }

    return summary;
  } catch (error) {
    console.error("GEMINI SUMMARY ERROR:", error);

    throw normalizeGeminiError(error);
  }
}

module.exports = {
  generateSummaryFromContext,
};