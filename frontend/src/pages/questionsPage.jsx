
import { useState } from "react";
import { askAi } from "../services/aiService.js";

function  QuestionsPage() {
  const [materialText, setMaterialText] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAskAi() {
    setError("");
    setAnswer("");

    if (!materialText.trim() || !question.trim()) {
      setError("יש למלא גם חומר לימודי וגם שאלה");
      return;
    }

    try {
      setLoading(true);

      const result = await askAi(materialText, question);

      setAnswer(result.answer);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px", fontFamily: "Arial" }}>

      <div style={{ marginBottom: "20px" }}>
        <label>Summary</label>
        <textarea
          value={materialText}
          onChange={(e) => setMaterialText(e.target.value)}
          rows={10}
          style={{ width: "100%", marginTop: "8px", padding: "12px" }}
          placeholder="Paste your study material here..."
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: "100%", marginTop: "8px", padding: "12px" }}
          placeholder="Write a question about the material..."
        />
      </div>

      <button onClick={handleAskAi} disabled={loading} style={{ padding: "12px 20px", cursor: "pointer" }}>
        {loading ? "שולח..." : "Ask the AI"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>
          {error}
        </p>
      )}

      {answer && (
        <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Ai answer:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default  QuestionsPage;