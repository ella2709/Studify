const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  normalizeGeminiError,
} = require("./geminiErrorHelper");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function cleanJsonResponse(text) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

async function callGeminiJson(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      return JSON.parse(cleanJsonResponse(text));
    } catch (error) {
      console.error("Invalid Gemini JSON:", text);
      throw new Error("AI returned invalid JSON");
    }
  } catch (error) {
    console.error("GEMINI EXAM ERROR:", error);

    throw normalizeGeminiError(error);
  }
}

function getLanguageName(language) {
  if (language === "he") return "Hebrew";
  if (language === "en") return "English";

  return language || "English";
}

async function generateExamWithAI({
  relevantChunks,
  type,
  numberOfQuestions,
  difficulty,
  language,
}) {
  const languageName = getLanguageName(language);

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

  const prompt = `
You are an academic exam generator.

Create an exam ONLY from the retrieved study material excerpts below.
The exam language MUST be ${languageName}.
All questions, answers, options, model answers, rubrics and titles MUST be in ${languageName} only.

Return ONLY valid JSON.
Do not add markdown.
Do not add explanations.

Exam type: ${type}
Number of questions: ${numberOfQuestions}
Difficulty: ${difficulty || "medium"}

RETRIEVED STUDY MATERIALS:
${context}

JSON structure:
{
  "title": "string",
  "questions": [
    {
      "id": "q1",
      "type": "${type}",
      "question": "string",
      "options": [
        "A. option",
        "B. option",
        "C. option",
        "D. option"
      ],
      "correctAnswer": "A. option",
      "modelAnswer": "string",
      "rubric": "string"
    }
  ]
}

Rules:
- If type is "multiple_choice", include options and correctAnswer.
- If type is "open_questions", include modelAnswer and rubric.
- Every question must be based only on the retrieved study materials.
- Do not use outside knowledge.
- Use ${languageName} only.
`;

  return callGeminiJson(prompt);
}

async function gradeExamWithAI({ exam, answers, duration }) {
  const languageName = getLanguageName(exam.language);

  const prompt = `
You are an academic exam checker.

Check the user's answers based on the exam questions, correct answers, model answers and rubrics.
All feedback MUST be in ${languageName} only.

Return ONLY valid JSON.
Do not add markdown.

Exam:
${JSON.stringify(exam, null, 2)}

User answers:
${JSON.stringify(answers, null, 2)}

Duration in seconds:
${duration}

JSON structure:
{
  "grade": 0,
  "generalFeedback": "string",
  "recommendations": ["string"],
  "questionsFeedback": [
    {
      "questionId": "q1",
      "score": 0,
      "status": "Correct | Partially Correct | Incorrect",
      "userAnswer": "string",
      "correctAnswer": "string",
      "feedback": "string"
    }
  ]
}

Rules:
- Grade must be between 0 and 100.
- For multiple choice, compare to correctAnswer.
- For open questions, grade according to modelAnswer and rubric.
- Feedback language must be ${languageName} only.
`;

  return callGeminiJson(prompt);
}

module.exports = {
  generateExamWithAI,
  gradeExamWithAI,
};