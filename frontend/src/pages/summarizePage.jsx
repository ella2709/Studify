import { useState } from "react";

function SummarizePage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    try {
      setLoading(true);
      setSummary("");

      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      });

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok) {
        setSummary(`Error: ${data.error}`);
        return;
      }

      setSummary(data.summary);

    } catch (error) {
      console.error("Frontend error:", error);
      setSummary(`Frontend error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-content">

      <h2>Summary of Study Material</h2>
      <p>Write a material and the system will create a summary using AI</p>

      <textarea
        className="text-area"
        rows="10"
        value={text}
        onChange={(e) => setText(e.target.value)}
     
      />

      <br /><br />


      <button onClick={handleSummarize} disabled={!text || loading} style={{ padding: "12px 20px", cursor: "pointer" }}>
        {loading ? "Generating a summary..." : "Summarize"}
      </button>

      {summary && (
        <div className="result-box">
          <h3>סיכום:</h3>
          <p>{summary}</p>
        </div>
      )}

    </div>
  );
}

export default SummarizePage;