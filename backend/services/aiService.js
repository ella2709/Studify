const { GoogleGenerativeAI } = require("@google/generative-ai");

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

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a study assistant using Retrieval-Augmented Generation (RAG).

Answer the user's question ONLY using the retrieved excerpts below.
If the answer is not clearly supported by the excerpts, say:
"The answer was not found in the uploaded study materials."

IMPORTANT:
- Answer in the SAME LANGUAGE as the user's question.
- Do NOT use outside knowledge.
- Be concise and clear.

RETRIEVED EXCERPTS:
${context}

QUESTION:
${question}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateSummaryFromContext(topic, relevantChunks) {
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

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a study assistant using Retrieval-Augmented Generation (RAG).

Create a summary ONLY about the requested topic, based ONLY on the retrieved excerpts below.

IMPORTANT:
- Do NOT add information that does not appear in the excerpts.
- If the excerpts do not clearly cover the topic, say:
"No relevant information was found in the uploaded study materials for this topic."
- Answer in the SAME LANGUAGE as the user's topic request.
- Organize the summary clearly with short sections or bullets when helpful.

REQUESTED TOPIC:
${topic}

RETRIEVED EXCERPTS:
${context}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}


module.exports = {
  generateAnswerFromContext,
  generateSummaryFromContext,
};