import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  useGenerateSummary,
  useProjectSummaries,
} from "../services/summaryService";
import { safeFormatDate } from "../helpers/dateHelper";

function projectNameFromId(projectId) {
  return projectId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function SummarizePage() {
  const { projectId } = useParams();
  const location = useLocation();

  const projectName = location.state?.projectName || projectNameFromId(projectId);

  const [instruction, setInstruction] = useState("");
  const [error, setError] = useState("");
  const [createdSummary, setCreatedSummary] = useState(null);

  const summariesQuery = useProjectSummaries(projectId);
  const generateSummaryMutation = useGenerateSummary();

  const summariesHistory = useMemo(
    () => summariesQuery.data || [],
    [summariesQuery.data]
  );

  const loading = generateSummaryMutation.isPending;

  function getFriendlyError(message) {
    if (!message) return "";

    if (message.includes("Missing summary instruction")) {
      return "Please describe what you want to summarize.";
    }

    if (message.includes("No uploaded materials")) {
      return "No study materials were found for this project. Please upload materials before generating a summary.";
    }

    return message;
  }

  async function handleGenerateSummary() {
    setError("");
    setCreatedSummary(null);

    if (!instruction.trim()) {
      setError("Please describe what you want to summarize.");
      return;
    }

    try {
      const summary = await generateSummaryMutation.mutateAsync({
        projectId,
        instruction: instruction.trim(),
      });

      setCreatedSummary(summary);
      setInstruction("");
    } catch (err) {
      setError(getFriendlyError(err.message));
    }
  }

  function downloadSummary(summary) {
    const url = summary?.file?.downloadUrl;

    if (!url) {
      setError("Summary file is not available for download.");
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="app-page fade-in" style={{ maxWidth: 980 }}>
      <Link
        to={`/project/${projectId}`}
        state={{ projectName }}
        className="breadcrumb"
        style={{ marginBottom: "0.9rem" }}
      >
        <ChevronLeft /> Back to {projectName}
      </Link>

      <div className="page-head">
        <p className="page-eyebrow">Summary Generator</p>
        <h1 className="page-title">Summarize your materials</h1>
        <p className="page-subtitle">
          Get a focused summary file based on your uploaded study materials.
        </p>
      </div>

      {error && (
        <div className="alert" style={{ marginBottom: "1.25rem" }}>
          <div>
            <strong style={{ display: "block", marginBottom: "0.15rem" }}>
              Action needed
            </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      <section className="card card-pad" style={{ marginBottom: "1.5rem" }}>
        <h3 className="section-title" style={{ marginBottom: "0.6rem" }}>
          What would you like to summarize?
        </h3>

        <div className="field" style={{ marginBottom: "0.6rem" }}>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="For example: summarize the main ideas from chapter 3..."
            className="input-base"
            style={{
              minHeight: 100,
              resize: "vertical",
              lineHeight: 1.65,
            }}
          />
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="btn btn-primary btn-lg"
        >
          {loading ? (
            <>
              <span className="spinner" /> Generating...
            </>
          ) : (
            "Generate Summary"
          )}
        </button>
      </section>

      {createdSummary && (
        <section className="card card-pad" style={{ marginBottom: "1.5rem" }}>
          <h2 className="section-title" style={{ marginBottom: "1rem" }}>
            Generated Summary
          </h2>

          <button
            onClick={() => downloadSummary(createdSummary)}
            className="file-row"
            style={{
              justifyContent: "space-between",
              cursor: "pointer",
              textAlign: "left",
              font: "inherit",
              color: "var(--text)",
              width: "100%",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
                {createdSummary.title}
              </div>

              <div style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
                Click to download · {safeFormatDate(createdSummary.createdAt)}
              </div>
            </div>

            <span className="badge badge-success">Ready</span>
          </button>
        </section>
      )}

      <section className="card card-pad">
        <h2 className="section-title" style={{ marginBottom: "1rem" }}>
          Summary History
        </h2>

        {summariesQuery.isLoading && (
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {[1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 64 }} />
            ))}
          </div>
        )}

        {!summariesQuery.isLoading && summariesHistory.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">No summaries yet</h3>
            <p className="empty-text">
              Generate your first summary above to get started.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gap: "0.7rem" }}>
          {summariesHistory.map((summary) => (
            <button
              key={summary.id}
              onClick={() => downloadSummary(summary)}
              className="file-row"
              style={{
                justifyContent: "space-between",
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
                color: "var(--text)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>
                  {summary.title}
                </div>

                <div style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
                  {summary.instruction || "Generated summary"} ·{" "}
                  {safeFormatDate(summary.updatedAt || summary.createdAt)}
                </div>
              </div>

              <StatusBadge status={summary.status} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    completed: { cls: "badge-success", label: "Completed" },
    in_progress: { cls: "badge-warning", label: "In progress" },
    failed: { cls: "badge-warning", label: "Failed" },
  };

  const s = map[status] || { cls: "badge-neutral", label: status || "Ready" };

  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}



function ChevronLeft() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default SummarizePage;