const { GoogleGenerativeAI } = require("@google/generative-ai");
const { detectLanguage } = require("../utils/textUtils");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function generateAnswerFromContext(question, relevantChunks) {
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

  const outputLanguage = detectLanguage(question);

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

 const prompt = `
    You are a study assistant.

    Answer the user's question ONLY using the retrieved excerpts below.

    IMPORTANT RULES:
- Use ONLY the retrieved excerpts.
- Do NOT use outside knowledge.
- Do NOT mention files that are not relevant to the answer.
- Do NOT say that the answer is based on all uploaded files.
- Do not add any additional explanation or use outside knowledge.
- If the user explicitly requests a specific output language, you MUST follow that request.
- Otherwise, answer in ${outputLanguage}.
- Keep the answer concise, clear, and focused on the question.

  IF the retrieved excerpts do NOT contain enough information to answer the question,
  you MUST return EXACTLY the following sentence and NOTHING ELSE:

  I couldn't find enough information in the uploaded study materials to answer this question.
    RETRIEVED EXCERPTS:
    ${context}

    QUESTION:
    ${question}
    `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}



module.exports = {
  generateAnswerFromContext,
};
