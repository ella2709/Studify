import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import {
  useExam,
  useGenerateExam,
  useProjectExams,
  useStartExam,
  useSubmitExam,
  useSaveAttemptAnswers,
} from "../services/examService";

function ExamPage() {
  const { projectId, examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const projectName =
    location.state?.projectName ||
    projectId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const [type, setType] = useState("multiple_choice");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("en");

  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const examsQuery = useProjectExams(projectId);
  const selectedExamQuery = useExam(examId);

  const generateExamMutation = useGenerateExam();
  const startExamMutation = useStartExam();
  const submitExamMutation = useSubmitExam();
  const saveAttemptAnswersMutation = useSaveAttemptAnswers();

  const loading =
    generateExamMutation.isPending ||
    startExamMutation.isPending ||
    submitExamMutation.isPending ||
    selectedExamQuery.isLoading;

  const isHebrew = (exam?.language || language) === "he";
  const direction = isHebrew ? "rtl" : "ltr";

  const examHistory = useMemo(() => examsQuery.data || [], [examsQuery.data]);
  const isHistoryLoading = examsQuery.isLoading && !examsQuery.data;

  useEffect(() => {
    if (!selectedExamQuery.data) return;

    const loadedExam = selectedExamQuery.data;
    const latestAttempt = loadedExam.latestAttempt || null;

    setExam(loadedExam);
    setAttempt(latestAttempt?.status === "in_progress" ? latestAttempt : null);
    setAnswers(latestAttempt?.answers || {});
    setResult(latestAttempt?.status === "completed" ? latestAttempt : null);
  }, [selectedExamQuery.data]);

  useEffect(() => {
    if (!exam?.id || !attempt?.id || result) return;

    const timer = setTimeout(() => {
      saveAttemptAnswersMutation.mutate({
        examId: exam.id,
        attemptId: attempt.id,
        answers,
      });
    }, 700);

    return () => clearTimeout(timer);
  }, [answers, exam?.id, attempt?.id, result]);

  function getFriendlyError(message) {
    if (!message) return "";

    if (message.includes("Missing answers")) {
      const questions = message.split(":")[1]?.trim() || "";
       return `Some questions are still unanswered.`;
    }
    if (message.includes("No uploaded materials")) {
      return "No study materials were found for this project. Please upload materials before creating an exam.";
    }
    if (message.includes("No relevant material chunks")) {
      return "Not enough relevant material was found to create an exam.";
    }
    if (message.includes("AI returned invalid JSON")) {
      return "The system could not generate a valid exam. Please try again.";
    }
    return message;
  }

  async function handleGenerateExam() {
    setError("");
    try {
      const data = await generateExamMutation.mutateAsync({
        projectId,
        type,
        numberOfQuestions: Number(numberOfQuestions),
        difficulty,
        language,
      });
      navigate(`/project/${projectId}/exam/${data.id}`, { state: { projectName } });
    } catch (err) {
      setError(getFriendlyError(err.message));
    }
  }

  async function handleStartExam() {
    setError("");
    try {
      const data = await startExamMutation.mutateAsync({ examId: exam.id });
      setAttempt(data);
      setAnswers(data.answers || {});
      setResult(null);
    } catch (err) {
      setError(getFriendlyError(err.message));
    }
  }

  async function handleSubmitExam() {
    setError("");
    try {
      const data = await submitExamMutation.mutateAsync({
        examId: exam.id,
        attemptId: attempt.id,
        answers,
      });
      setResult(data);
      setAttempt(null);
    } catch (err) {
      setError(getFriendlyError(err.message));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function openExam(item) {
    navigate(`/project/${projectId}/exam/${item.id}`, { state: { projectName } });
  }

  function backToSimulator() {
    setExam(null);
    setAttempt(null);
    setAnswers({});
    setResult(null);
    setError("");
    navigate(`/project/${projectId}/exam`, { state: { projectName } });
  }

  return (
    <div className="app-page app-page--full fade-in" style={{ maxWidth: 980 }}>
      <Link to={`/project/${projectId}`} state={{ projectName }} className="breadcrumb" style={{ marginBottom: "0.5rem", flexShrink: 0 }}>
        <ChevronLeft />{projectName}
      </Link>

      <div className="page-head" style={{ flexShrink: 0, marginBottom: "0.6rem" }}>
        <p className="page-eyebrow">Exam Simulator</p>
        <h1 className="page-title">Test your knowledge</h1>
      </div>

      {error && (
        <div className="alert" style={{ marginBottom: "0.75rem", flexShrink: 0 }}>
          <div>
            <strong style={{ display: "block", marginBottom: "0.15rem" }}>
              Notice!
            </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Create + history */}
      {!examId && (
        <>
          <section className="card card-pad" style={{ marginBottom: "1rem", flexShrink: 0 }}>
            <h2 className="section-title" style={{ marginBottom: "0.75rem" }}>Create New Exam</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "0.85rem" }}>
              <div className="field">
                <label className="field-label">Exam Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="select-base">
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="open_questions">Open Questions</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">Number of Questions</label>
                <input type="number" min="1" value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(e.target.value)} className="input-base" />
              </div>

              <div className="field">
                <label className="field-label">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="select-base">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">Exam Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select-base">
                  <option value="en">English</option>
                  <option value="he">Hebrew</option>
                </select>
              </div>
            </div>

            <button onClick={handleGenerateExam} disabled={loading} className="btn btn-primary btn-lg">
              {generateExamMutation.isPending ? (<><span className="spinner" /> Generating...</>) : "Generate Exam"}
            </button>
          </section>

          <section
            className="card card-pad"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <h2 className="section-title" style={{ marginBottom: "1rem", flexShrink: 0 }}>Exam History</h2>

            {isHistoryLoading && (
              <div style={{ display: "grid", gap: "0.6rem" }}>
                {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 64 }} />)}
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {!isHistoryLoading && examHistory.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🧪</div>
                  <h3 className="empty-title">No exams yet</h3>
                  <p className="empty-text">Generate your first exam above to get started.</p>
                </div>
              )}

              <div style={{ display: "grid", gap: "0.7rem" }}>
                {examHistory.map((item) => (
                  <button key={item.id} onClick={() => openExam(item)} className="file-row" style={{ justifyContent: "space-between", cursor: "pointer", textAlign: "left", font: "inherit", color: "var(--text)" }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{item.title}</div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
                        {item.numberOfQuestions} questions · {item.language === "he" ? "Hebrew" : "English"} · {formatDate(item.updatedAt || item.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Exam taking / review */}
      {examId && exam && (
        <section
          className="card card-pad"
          style={{
            direction,
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          <button onClick={backToSimulator} className="btn btn-secondary btn-sm" style={{ marginBottom: "1.25rem" }}>
            ← Back to Exam Simulator
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <h2 className="section-title">{exam.title}</h2>
              <p style={{ color: "var(--text-2)", margin: "0.25rem 0 0", fontSize: "0.88rem" }}>
                {exam.questions?.length || 0} questions
              </p>
            </div>

            {!attempt && (
              <button onClick={handleStartExam} disabled={loading} className="btn btn-primary">
                {result ? "Retake Exam" : "Start Exam"}
              </button>
            )}
          </div>

          {/* taking */}
          {attempt && (
            <div style={{ marginTop: "1.5rem" }}>
              {exam.questions.map((q, index) => (
                <div key={q.id} className="card" style={{ padding: "1.1rem", marginBottom: "1rem", background: "var(--bg-inset)" }}>
                  <h3 style={{ margin: "0 0 0.85rem", fontWeight: 700, lineHeight: 1.55, fontSize: "0.98rem" }}>
                    {index + 1}. {q.question}
                  </h3>

                  {exam.type === "multiple_choice" ? (
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                      {q.options?.map((option) => {
                        const checked = answers[q.id] === option;
                        return (
                          <label
                            key={option}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.65rem",
                              padding: "0.7rem 0.85rem",
                              borderRadius: "var(--r-sm)",
                              border: `1.5px solid ${checked ? "var(--accent)" : "var(--border)"}`,
                              background: checked ? "var(--accent-bg)" : "var(--bg-surface)",
                              cursor: "pointer",
                              lineHeight: 1.5,
                              transition: "border-color 0.14s ease, background 0.14s ease",
                            }}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={option}
                              checked={checked}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                              style={{ accentColor: "var(--accent)" }}
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder={isHebrew ? "כתבי את התשובה שלך..." : "Write your answer..."}
                      className="input-base"
                      style={{ minHeight: 130, direction }}
                    />
                  )}
                </div>
              ))}

              <button onClick={handleSubmitExam} disabled={loading} className="btn btn-primary btn-lg">
                {submitExamMutation.isPending ? (<><span className="spinner" /> Checking...</>) : "Submit Exam"}
              </button>
            </div>
          )}

          {/* review */}
          {result && (
            <div style={{ marginTop: "1.5rem" }}>
              <h2 className="section-title" style={{ marginBottom: "1rem" }}>Exam Review</h2>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.2rem", minWidth: 150 }}>
                  <span style={{ color: "var(--text-2)", fontSize: "0.82rem" }}>Grade</span>
                  <strong style={{ color: "var(--accent-dark)", fontSize: "2rem", lineHeight: 1 }}>{result.grade}<span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>/100</span></strong>
                </div>
                <div className="card" style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.2rem", minWidth: 150 }}>
                  <span style={{ color: "var(--text-2)", fontSize: "0.82rem" }}>Duration</span>
                  <strong style={{ fontSize: "1.5rem", lineHeight: 1 }}>{Math.round((result.duration || 0) / 60)}<span style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}> min</span></strong>
                </div>
              </div>

              {result.feedback?.generalFeedback && (
                <p style={{ color: "var(--text)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                  {result.feedback.generalFeedback}
                </p>
              )}

              {result.feedback?.recommendations?.length > 0 && (
                <div className="card" style={{ padding: "1.1rem", marginBottom: "1.25rem", background: "var(--accent-bg)", border: "1px solid var(--border)" }}>
                  <strong style={{ display: "block", marginBottom: "0.5rem" }}>Recommendations</strong>
                  <ul style={{ margin: 0, paddingInlineStart: 20, lineHeight: 1.7 }}>
                    {result.feedback.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                  </ul>
                </div>
              )}

              {result.feedback?.questionsFeedback?.map((item, index) => {
                const correct = item.status === "correct";
                return (
                  <div key={item.questionId} className="card" style={{ padding: "1.1rem", marginBottom: "0.85rem", background: "var(--bg-inset)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.6rem" }}>
                      <strong style={{ fontSize: "0.95rem" }}>Question {index + 1}</strong>
                      <span className={`badge ${correct ? "badge-success" : "badge-warning"}`}>
                        {correct ? "✓ Correct" : "✕ " + item.status}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.88rem" }}><span style={{ color: "var(--text-muted)" }}>Your answer: </span>{item.userAnswer}</p>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.88rem" }}><span style={{ color: "var(--text-muted)" }}>Correct answer: </span>{item.correctAnswer}</p>
                    {item.feedback && <p style={{ margin: 0, color: "var(--text-2)", fontSize: "0.88rem", lineHeight: 1.6 }}>{item.feedback}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    in_progress: { cls: "badge-warning", label: "In progress" },
    not_started: { cls: "badge-info", label: "Not started" },
    completed: { cls: "badge-success", label: "Completed" },
  };
  const s = map[status] || { cls: "badge-neutral", label: status };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

function ChevronLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default ExamPage;
