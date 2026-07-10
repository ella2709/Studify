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
import { useAiAccess } from "../authentication/aiAccessContext.jsx";
import messages from "../messages";

function ExamPage() {
  const { projectId, examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAiBlocked } = useAiAccess();

  const projectName =
    location.state?.projectName ||
    projectId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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

  const visibleExamHistory = useMemo(() => {
    if (!isAiBlocked) return examHistory;
    return examHistory.filter((item) => item.status === "completed");
  }, [examHistory, isAiBlocked]);

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
    if (isAiBlocked || !exam?.id || !attempt?.id || result) return;

    const timer = setTimeout(() => {
      saveAttemptAnswersMutation.mutate({
        examId: exam.id,
        attemptId: attempt.id,
        answers,
      });
    }, 700);

    return () => clearTimeout(timer);
  }, [answers, exam?.id, attempt?.id, result, isAiBlocked]);

  function getFriendlyError(message) {
    if (!message) return "";

    if (message.includes("Missing answers")) {
      return messages.exams.missingAnswers;
    }

    if (message.includes("No uploaded materials")) {
      return messages.exams.noMaterials;
    }

    if (
      message.includes("No relevant material chunks") ||
      message.includes("Not enough relevant study material")
    ) {
      return messages.exams.notEnoughMaterial;
    }

    if (message.includes("AI returned invalid JSON")) {
      return messages.exams.invalidExam;
    }

    return message;
  }

  async function handleGenerateExam() {
    if (isAiBlocked) return;

    setError("");

    try {
      const data = await generateExamMutation.mutateAsync({
        projectId,
        type,
        numberOfQuestions: Number(numberOfQuestions),
        difficulty,
        language,
      });

      navigate(`/project/${projectId}/exam/${data.id}`, {
        state: { projectName },
      });
    } catch (err) {
      if (err.code !== "AI_LIMIT_REACHED") {
        setError(getFriendlyError(err.message));
      }
    }
  }

  async function handleStartExam() {
    if (isAiBlocked) return;

    setError("");

    try {
      const data = await startExamMutation.mutateAsync({ examId: exam.id });
      setAttempt(data);
      setAnswers(data.answers || {});
      setResult(null);
    } catch (err) {
      if (err.code !== "AI_LIMIT_REACHED") {
        setError(getFriendlyError(err.message));
      }
    }
  }

  async function handleSubmitExam() {
    if (isAiBlocked) return;

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
      if (err.code !== "AI_LIMIT_REACHED") {
        setError(getFriendlyError(err.message));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  function openExam(item) {
    if (isAiBlocked && item.status !== "completed") return;

    navigate(`/project/${projectId}/exam/${item.id}`, {
      state: { projectName },
    });
  }

  function backToSimulator() {
    setExam(null);
    setAttempt(null);
    setAnswers({});
    setResult(null);
    setError("");

    navigate(`/project/${projectId}/exam`, {
      state: { projectName },
    });
  }

  const canViewSelectedExam =
    !isAiBlocked ||
    exam?.status === "completed" ||
    result?.status === "completed";

  return (
    <div className="app-page app-page--full fade-in" style={{ maxWidth: 980 }}>
      <Link
        to={`/project/${projectId}`}
        state={{ projectName }}
        className="breadcrumb"
        style={{ marginBottom: "0.5rem", flexShrink: 0 }}
      >
        <ChevronLeft />
        {projectName}
      </Link>

      <div className="page-head" style={{ flexShrink: 0, marginBottom: "0.6rem" }}>
        <p className="page-eyebrow">{messages.exams.simulator}</p>
        <h1 className="page-title">{messages.exams.title}</h1>
      </div>

      {isAiBlocked && (
        <div className="alert" style={{ marginBottom: "0.75rem", flexShrink: 0 }}>
          <div>
            <strong style={{ display: "block", marginBottom: "0.15rem" }}>
              {messages.aiAccess.viewOnlyTitle}
            </strong>
            <span>{messages.aiAccess.examsMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert" style={{ marginBottom: "0.75rem", flexShrink: 0 }}>
          <div>
            <strong style={{ display: "block", marginBottom: "0.15rem" }}>
              {messages.exams.notice}
            </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {!examId && (
        <>
          <section
            className="card card-pad"
            style={{
              marginBottom: "1rem",
              flexShrink: 0,
              opacity: isAiBlocked ? 0.72 : 1,
            }}
          >
            <h2 className="section-title" style={{ marginBottom: "0.75rem" }}>
              {messages.exams.createNew}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "0.75rem",
                marginBottom: "0.85rem",
              }}
            >
              <div className="field">
                <label className="field-label">{messages.exams.examType}</label>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  disabled={isAiBlocked}
                  className="select-base"
                >
                  <option value="multiple_choice">
                    {messages.exams.multipleChoice}
                  </option>
                  <option value="open_questions">
                    {messages.exams.openQuestions}
                  </option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  {messages.exams.numberOfQuestions}
                </label>
                <input
                  type="number"
                  min="1"
                  value={numberOfQuestions}
                  onChange={(event) =>
                    setNumberOfQuestions(event.target.value)
                  }
                  disabled={isAiBlocked}
                  className="input-base"
                />
              </div>

              <div className="field">
                <label className="field-label">{messages.exams.difficulty}</label>
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                  disabled={isAiBlocked}
                  className="select-base"
                >
                  <option value="easy">{messages.exams.easy}</option>
                  <option value="medium">{messages.exams.medium}</option>
                  <option value="hard">{messages.exams.hard}</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  {messages.exams.examLanguage}
                </label>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  disabled={isAiBlocked}
                  className="select-base"
                >
                  <option value="en">{messages.exams.english}</option>
                  <option value="he">{messages.exams.hebrew}</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateExam}
              disabled={loading || isAiBlocked}
              className="btn btn-primary btn-lg"
              title={
                isAiBlocked ? messages.aiAccess.unavailableTooltip : undefined
              }
            >
              {isAiBlocked ? (
                messages.aiAccess.unavailableButton
              ) : generateExamMutation.isPending ? (
                <>
                  <span className="spinner" /> {messages.exams.generating}
                </>
              ) : (
                messages.exams.generate
              )}
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
            <h2
              className="section-title"
              style={{ marginBottom: "1rem", flexShrink: 0 }}
            >
              {isAiBlocked
                ? messages.exams.completedHistory
                : messages.exams.history}
            </h2>

            {isHistoryLoading && (
              <div style={{ display: "grid", gap: "0.6rem" }}>
                {[1, 2].map((item) => (
                  <div key={item} className="skeleton" style={{ height: 64 }} />
                ))}
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {!isHistoryLoading && visibleExamHistory.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🧪</div>
                  <h3 className="empty-title">
                    {isAiBlocked
                      ? messages.exams.noCompletedExams
                      : messages.exams.noExams}
                  </h3>
                  <p className="empty-text">
                    {isAiBlocked
                      ? messages.exams.noCompletedExamsDescription
                      : messages.exams.noExamsDescription}
                  </p>
                </div>
              )}

              <div style={{ display: "grid", gap: "0.7rem" }}>
                {visibleExamHistory.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => openExam(item)}
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
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--text-2)",
                        }}
                      >
                        {item.numberOfQuestions} {messages.exams.questions} ·{" "}
                        {item.language === "he"
                          ? messages.exams.hebrew
                          : messages.exams.english}{" "}
                        · {formatDate(item.updatedAt || item.createdAt)}
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

      {examId && exam && !canViewSelectedExam && (
        <section className="card card-pad" style={{ flex: 1, minHeight: 0 }}>
          <button
            type="button"
            onClick={backToSimulator}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: "1.25rem" }}
          >
            ← {messages.exams.back}
          </button>

          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3 className="empty-title">{messages.exams.unavailableTitle}</h3>
            <p className="empty-text">
              {messages.exams.unavailableDescription}
            </p>
          </div>
        </section>
      )}

      {examId && exam && canViewSelectedExam && (
        <section
          className="card card-pad"
          style={{
            direction,
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          <button
            type="button"
            onClick={backToSimulator}
            className="btn btn-secondary btn-sm"
            style={{ marginBottom: "1.25rem" }}
          >
            ← {messages.exams.back}
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 className="section-title">{exam.title}</h2>
              <p
                style={{
                  color: "var(--text-2)",
                  margin: "0.25rem 0 0",
                  fontSize: "0.88rem",
                }}
              >
                {exam.questions?.length || 0} {messages.exams.questions}
              </p>
            </div>

            {!attempt && !result && (
              <button
                type="button"
                onClick={handleStartExam}
                disabled={loading || isAiBlocked}
                className="btn btn-primary"
              >
                {isAiBlocked
                  ? messages.exams.unavailable
                  : messages.exams.start}
              </button>
            )}

            {!attempt && result && !isAiBlocked && (
              <button
                type="button"
                onClick={handleStartExam}
                disabled={loading}
                className="btn btn-primary"
              >
                {messages.exams.retake}
              </button>
            )}
          </div>

          {attempt && !isAiBlocked && (
            <div style={{ marginTop: "1.5rem" }}>
              {exam.questions.map((questionItem, index) => (
                <div
                  key={questionItem.id}
                  className="card"
                  style={{
                    padding: "1.1rem",
                    marginBottom: "1rem",
                    background: "var(--bg-inset)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 0.85rem",
                      fontWeight: 700,
                      lineHeight: 1.55,
                      fontSize: "0.98rem",
                    }}
                  >
                    {index + 1}. {questionItem.question}
                  </h3>

                  {exam.type === "multiple_choice" ? (
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                      {questionItem.options?.map((option) => {
                        const checked = answers[questionItem.id] === option;

                        return (
                          <label
                            key={option}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.65rem",
                              padding: "0.7rem 0.85rem",
                              borderRadius: "var(--r-sm)",
                              border: `1.5px solid ${
                                checked ? "var(--accent)" : "var(--border)"
                              }`,
                              background: checked
                                ? "var(--accent-bg)"
                                : "var(--bg-surface)",
                              cursor: "pointer",
                              lineHeight: 1.5,
                              transition:
                                "border-color 0.14s ease, background 0.14s ease",
                            }}
                          >
                            <input
                              type="radio"
                              name={questionItem.id}
                              value={option}
                              checked={checked}
                              onChange={(event) =>
                                setAnswers((previous) => ({
                                  ...previous,
                                  [questionItem.id]: event.target.value,
                                }))
                              }
                              style={{ accentColor: "var(--accent)" }}
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      value={answers[questionItem.id] || ""}
                      onChange={(event) =>
                        setAnswers((previous) => ({
                          ...previous,
                          [questionItem.id]: event.target.value,
                        }))
                      }
                      placeholder={ messages.exams.writeAnswer}
                      className="input-base"
                      style={{ minHeight: 130, direction }}
                    />
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={loading}
                className="btn btn-primary btn-lg"
              >
                {submitExamMutation.isPending ? (
                  <>
                    <span className="spinner" /> {messages.exams.checking}
                  </>
                ) : (
                  messages.exams.submit
                )}
              </button>
            </div>
          )}

          {result && (
            <div style={{ marginTop: "1.5rem" }}>
              <h2 className="section-title" style={{ marginBottom: "1rem" }}>
                {messages.exams.review}
              </h2>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  className="card"
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.2rem",
                    minWidth: 150,
                  }}
                >
                  <span style={{ color: "var(--text-2)", fontSize: "0.82rem" }}>
                    {messages.exams.grade}
                  </span>
                  <strong
                    style={{
                      color: "var(--accent-dark)",
                      fontSize: "2rem",
                      lineHeight: 1,
                    }}
                  >
                    {result.grade}
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      /100
                    </span>
                  </strong>
                </div>

                <div
                  className="card"
                  style={{
                    padding: "1rem 1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.2rem",
                    minWidth: 150,
                  }}
                >
                  <span style={{ color: "var(--text-2)", fontSize: "0.82rem" }}>
                    {messages.exams.duration}
                  </span>
                  <strong style={{ fontSize: "1.5rem", lineHeight: 1 }}>
                    {Math.round((result.duration || 0) / 60)}
                    <span
                      style={{
                        fontSize: "0.95rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {" "}
                      {messages.exams.minutes}
                    </span>
                  </strong>
                </div>
              </div>

              {result.feedback?.generalFeedback && (
                <p
                  style={{
                    color: "var(--text)",
                    lineHeight: 1.7,
                    marginBottom: "1.25rem",
                  }}
                >
                  {result.feedback.generalFeedback}
                </p>
              )}

              {result.feedback?.recommendations?.length > 0 && (
                <div
                  className="card"
                  style={{
                    padding: "1.1rem",
                    marginBottom: "1.25rem",
                    background: "var(--accent-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "0.5rem" }}>
                    {messages.exams.recommendations}
                  </strong>
                  <ul
                    style={{
                      margin: 0,
                      paddingInlineStart: 20,
                      lineHeight: 1.7,
                    }}
                  >
                    {result.feedback.recommendations.map(
                      (recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {result.feedback?.questionsFeedback?.map((item, index) => {
                const correct = item.status?.toLowerCase() === "correct";

                return (
                  <div
                    key={item.questionId}
                    className="card"
                    style={{
                      padding: "1.1rem",
                      marginBottom: "0.85rem",
                      background: "var(--bg-inset)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.75rem",
                        marginBottom: "0.6rem",
                      }}
                    >
                      <strong style={{ fontSize: "0.95rem" }}>
                        {messages.exams.question} {index + 1}
                      </strong>

                      <span
                        className={`badge ${
                          correct ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {correct
                          ? `✓ ${messages.exams.correct}`
                          : `✕ ${item.status}`}
                      </span>
                    </div>

                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.88rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>
                        {messages.exams.yourAnswer}{" "}
                      </span>
                      {item.userAnswer}
                    </p>

                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.88rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>
                        {messages.exams.correctAnswer}{" "}
                      </span>
                      {item.correctAnswer}
                    </p>

                    {item.feedback && (
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-2)",
                          fontSize: "0.88rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.feedback}
                      </p>
                    )}
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

  const current = map[status] || {
    cls: "badge-neutral",
    label: status,
  };

  return <span className={`badge ${current.cls}`}>{current.label}</span>;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
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

export default ExamPage;
