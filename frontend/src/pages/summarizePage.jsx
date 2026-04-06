import { useState } from "react";
import AiTextBlock from "../components/AiTextBlock";
import messages from "../messages";
import { summarizeAi } from "../services/aiService";

function SummarizePage() {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [basedOnFiles, setBasedOnFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 const handleSummarize = async () => {
  if (!topic.trim()) {
  setError(messages.summarize.missingTopic);
  return;
 }

  try {
    setLoading(true);
    setSummary("");
    setBasedOnFiles([]);
    setError("");

    const data = await summarizeAi(topic);
    setSummary(data.summary || "");
    setBasedOnFiles(data.basedOnFiles || []);
  } catch (error) {
    setError(error.message || messages.summarize.error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">
        {messages.summarize.title}
      </h2>
      <p className="mt-2 text-slate-600">
        {messages.summarize.description}
      </p>

     <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {messages.summarize.topicLabel}
        </label>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          placeholder={messages.summarize.topicPlaceholder}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
    </div>

      <button
        onClick={handleSummarize}
        disabled={loading}
        className="cursor-pointer mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? messages.summarize.loading : messages.summarize.button}
      </button>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {summary && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
          <div className="result-box">
            <AiTextBlock text={summary} />
          </div>

          {basedOnFiles.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-slate-700">
                {messages.summarize.sourcesTitle}
              </h4>
              <ul className="mt-2 list-disc space-y-1 pr-5 text-sm text-slate-600">
                {basedOnFiles.map((fileName, index) => (
                  <li key={`${fileName}-${index}`}>{fileName}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SummarizePage;