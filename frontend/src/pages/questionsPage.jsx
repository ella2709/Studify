import { useState } from "react";
import { askAi } from "../services/aiService.js";
import messages from "../messages.js";
import AiTextBlock from "../components/AiTextBlock";

function QuestionsPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAskAi() {
    setError("");
    setAnswer("");
    setSources([]);

    if (!question.trim()) {
      setError(messages.askAi.missingFields);
      return;
    }

    try {
      setLoading(true);
      const result = await askAi(question);
      setAnswer(result.answer || "");
      setSources(result.sources || []);
    } catch (err) {
      setError(err.message || messages.askAi.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">
        {messages.askAi.title}
      </h2>
      <p className="mt-2 text-slate-600">
        {messages.askAi.description}
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {messages.askAi.questionLabel}
        </label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={messages.askAi.questionPlaceholder}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <button
        onClick={handleAskAi}
        disabled={loading}
        className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? messages.askAi.loading : messages.askAi.submit}
      </button>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-bold text-slate-800">
            {messages.askAi.answerTitle}
          </h3>

          <div className="mt-2 text-slate-700">
            <AiTextBlock text={answer} />
          </div>

          {sources.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-slate-700">
                {messages.askAi.sourcesTitle}
              </h4>
              <ul className="mt-2 list-disc space-y-1 pr-5 text-sm text-slate-600">
                {sources.map((source, index) => (
                  <li key={`${source.fileName}-${source.chunkIndex}-${index}`}>
                    {source.fileName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionsPage;