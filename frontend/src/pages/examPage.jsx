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

  const examHistory = useMemo(() => {
    return examsQuery.data || [];
  }, [examsQuery.data]);

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
  if (
    !exam?.id ||
    !attempt?.id ||
    result
  ) {
    return;
  }

  const timer =
    setTimeout(() => {
      saveAttemptAnswersMutation.mutate({
        examId: exam.id,
        attemptId: attempt.id,
        answers,
      });
    }, 700);

  return () =>
    clearTimeout(timer);
}, [
  answers,
  exam?.id,
  attempt?.id,
  result,
]);

  function getFriendlyError(message) {
    if (!message) return "";

    if (message.includes("Missing answers")) {
      const questions = message.split(":")[1]?.trim() || "";
      return isHebrew
        ? `יש שאלות שעדיין לא נענו: ${questions}`
        : `Some questions are still unanswered: ${questions}`;
    }

    if (message.includes("No uploaded materials")) {
      return isHebrew
        ? "לא נמצאו חומרי לימוד בפרויקט הזה. יש להעלות חומרי לימוד לפני יצירת מבחן."
        : "No study materials were found for this project. Please upload materials before creating an exam.";
    }

    if (message.includes("No relevant material chunks")) {
      return isHebrew
        ? "לא נמצא מספיק מידע רלוונטי בחומרי הלימוד ליצירת מבחן."
        : "Not enough relevant material was found to create an exam.";
    }

    if (message.includes("AI returned invalid JSON")) {
      return isHebrew
        ? "המערכת לא הצליחה לבנות מבחן תקין. נסי שוב בעוד רגע."
        : "The system could not generate a valid exam. Please try again.";
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

      navigate(`/project/${projectId}/exam/${data.id}`, {
        state: { projectName },
      });
    } catch (err) {
      setError(getFriendlyError(err.message));
    }
  }

 async function handleStartExam() {
  setError("");

  try {
    const data = await startExamMutation.mutateAsync({
      examId: exam.id,
    });

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

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <Link
          to={`/project/${projectId}`}
          state={{ projectName }}
          style={backLinkStyle}
        >
          ← Back to {projectName}
        </Link>

        <h1 style={pageTitleStyle}>Exam Simulator</h1>

        <p style={pageSubtitleStyle}>
          Create an interactive exam based on all materials uploaded to this
          project.
        </p>

        {error && <Alert message={error} />}

        {!examId && (
          <>
            <section style={cardStyle}>
              <h2 style={sectionTitle}>Create New Exam</h2>

              <div style={gridStyle}>
                <Field label="Exam Type">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="open_questions">Open Questions</option>
                  </select>
                </Field>

                <Field label="Number of Questions">
                  <input
                    type="number"
                    min="1"
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(e.target.value)}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Difficulty">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </Field>

                <Field label="Exam Language">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="en">English</option>
                    <option value="he">Hebrew</option>
                  </select>
                </Field>
              </div>

              <button
                onClick={handleGenerateExam}
                disabled={loading}
                style={primaryButton}
              >
                {generateExamMutation.isPending
                  ? "Generating..."
                  : "Generate Exam"}
              </button>
            </section>

            <section style={{ ...cardStyle, marginTop: "1.5rem" }}>
              <h2 style={sectionTitle}>Exam History</h2>

              {examsQuery.isLoading && (
                <p style={mutedTextStyle}>Loading exams...</p>
              )}

              {!examsQuery.isLoading && examHistory.length === 0 && (
                <p style={mutedTextStyle}>
                  No exams created yet. Generate your first exam above.
                </p>
              )}

              <div style={historyListStyle}>
                {examHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openExam(item)}
                    style={historyItemStyle}
                  >
                    <div>
                      <div style={historyTitleStyle}>{item.title}</div>
                      <div style={historyMetaStyle}>
                        {item.numberOfQuestions} questions ·{" "}
                        {item.language === "he" ? "Hebrew" : "English"} ·{" "}
                        {formatDate(item.updatedAt || item.createdAt)}
                      </div>
                    </div>

                    <StatusBadge status={item.status} />
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {examId && exam && (
          <section style={{ ...cardStyle, direction }}>
            <button onClick={backToSimulator} style={secondaryButton}>
              ← Back to Exam Simulator
            </button>

            <div style={examHeaderStyle}>
              <div>
                <h2 style={sectionTitle}>{exam.title}</h2>
                <p style={mutedTextStyle}>
                  {exam.questions?.length || 0} questions
                </p>
              </div>

              {!attempt && (
                <button
                    onClick={handleStartExam}
                    disabled={loading}
                    style={primaryButton}
                >
                    {result ? "Retake Exam" : "Start Exam"}
                </button>
                )}
            </div>

            {attempt && (
              <div style={{ marginTop: "1.5rem" }}>
                {exam.questions.map((q, index) => (
                  <div key={q.id} style={questionStyle}>
                    <h3 style={questionTitleStyle}>
                      {index + 1}. {q.question}
                    </h3>

                    {exam.type === "multiple_choice" ? (
                      <div style={optionsGridStyle}>
                        {q.options?.map((option) => (
                          <label key={option} style={optionStyle}>
                            <input
                              type="radio"
                              name={q.id}
                              value={option}
                              checked={answers[q.id] === option}
                              onChange={(e) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: e.target.value,
                                }))
                              }
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={answers[q.id] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        placeholder={
                          isHebrew ? "כתבי את התשובה שלך..." : "Write your answer..."
                        }
                        style={{
                          ...inputStyle,
                          minHeight: 130,
                          resize: "vertical",
                          direction,
                        }}
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleSubmitExam}
                  disabled={loading}
                  style={primaryButton}
                >
                  {submitExamMutation.isPending ? "Checking..." : "Submit Exam"}
                </button>
              </div>
            )}

            {result && (
              <div style={{ marginTop: "1.5rem" }}>
                <h2 style={sectionTitle}>Exam Review</h2>

                <div style={gradeBoxStyle}>
                  <span style={gradeLabelStyle}>Grade</span>
                  <strong style={gradeValueStyle}>{result.grade}/100</strong>
                </div>

                <p style={mutedTextStyle}>
                  Duration: {Math.round((result.duration || 0) / 60)} minutes
                </p>

                <p style={{ color: "var(--text)", lineHeight: 1.7 }}>
                  {result.feedback?.generalFeedback}
                </p>

                {result.feedback?.recommendations?.length > 0 && (
                  <div style={reviewBlockStyle}>
                    <strong>Recommendations</strong>
                    <ul>
                      {result.feedback.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.feedback?.questionsFeedback?.map((item, index) => (
                  <div key={item.questionId} style={questionStyle}>
                    <strong>
                      Question {index + 1} — {item.status}
                    </strong>
                    <p>Your answer: {item.userAnswer}</p>
                    <p>Correct answer: {item.correctAnswer}</p>
                    <p>{item.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

function Alert({ message }) {
  return (
    <div style={alertStyle}>
      <strong style={{ display: "block", marginBottom: "0.25rem" }}>
        Action needed
      </strong>
      <span>{message}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const labels = {
    in_progress: "In progress",
    not_started: "Not started",
    completed: "Completed",
  };

  return <span style={badgeStyle(status)}>{labels[status] || status}</span>;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

const pageStyle = {
  width: "100%",
  minHeight: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  padding: "0 1.5rem 2rem",
};

const contentStyle = {
  maxWidth: 980,
  margin: "0 auto",
};

const backLinkStyle = {
  fontSize: "0.875rem",
  color: "var(--text-muted)",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  marginBottom: "1.5rem",
};

const pageTitleStyle = {
  fontSize: "1.875rem",
  fontWeight: 800,
  color: "var(--text)",
  margin: "0 0 0.5rem",
};

const pageSubtitleStyle = {
  color: "var(--text-2)",
  marginBottom: "2rem",
};

const cardStyle = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "1rem",
  padding: "1.5rem",
  boxShadow: "var(--shadow-card)",
};

const sectionTitle = {
  fontSize: "1.25rem",
  fontWeight: 800,
  color: "var(--text)",
  margin: "0 0 1rem",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
  marginBottom: "1.25rem",
};

const fieldLabelStyle = {
  fontSize: "0.8125rem",
  fontWeight: 700,
  color: "var(--text)",
};

const inputStyle = {
  width: "100%",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  padding: "0.75rem 0.875rem",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
};

const primaryButton = {
  border: "none",
  borderRadius: "0.75rem",
  background: "var(--accent)",
  color: "white",
  padding: "0.75rem 1.1rem",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButton = {
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  background: "var(--bg)",
  color: "var(--text)",
  padding: "0.65rem 0.95rem",
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: "1rem",
};

const alertStyle = {
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  color: "#991B1B",
  padding: "0.9rem 1rem",
  borderRadius: "0.875rem",
  marginBottom: "1rem",
  fontSize: "0.9rem",
  lineHeight: 1.5,
};

const historyListStyle = {
  display: "grid",
  gap: "0.75rem",
};

const historyItemStyle = {
  width: "100%",
  border: "1px solid var(--border)",
  background: "var(--bg)",
  borderRadius: "0.875rem",
  padding: "1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  textAlign: "left",
  cursor: "pointer",
};

const historyTitleStyle = {
  fontWeight: 800,
  color: "var(--text)",
  marginBottom: "0.25rem",
};

const historyMetaStyle = {
  fontSize: "0.825rem",
  color: "var(--text-2)",
};

const mutedTextStyle = {
  color: "var(--text-2)",
  margin: 0,
};

const examHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  alignItems: "flex-start",
};

const questionStyle = {
  border: "1px solid var(--border)",
  borderRadius: "0.875rem",
  padding: "1rem",
  marginBottom: "1rem",
  background: "var(--bg)",
};

const questionTitleStyle = {
  margin: "0 0 0.75rem",
  color: "var(--text)",
  fontWeight: 700,
  lineHeight: 1.6,
};

const optionsGridStyle = {
  display: "grid",
  gap: "0.625rem",
};

const optionStyle = {
  display: "flex",
  gap: "0.625rem",
  alignItems: "center",
  color: "var(--text)",
  lineHeight: 1.6,
};

const gradeBoxStyle = {
  border: "1px solid var(--border)",
  borderRadius: "0.875rem",
  padding: "1rem",
  display: "inline-flex",
  flexDirection: "column",
  gap: "0.25rem",
  marginBottom: "1rem",
};

const gradeLabelStyle = {
  color: "var(--text-2)",
  fontSize: "0.85rem",
};

const gradeValueStyle = {
  color: "var(--accent)",
  fontSize: "2rem",
};

const reviewBlockStyle = {
  border: "1px solid var(--border)",
  borderRadius: "0.875rem",
  padding: "1rem",
  marginBottom: "1rem",
  color: "var(--text)",
};

const badgeStyle = (status) => {
  const colors = {
    in_progress: {
      background: "#FEF3C7",
      color: "#92400E",
    },
    not_started: {
      background: "#E0F2FE",
      color: "#075985",
    },
    completed: {
      background: "#DCFCE7",
      color: "#166534",
    },
  };

  return {
    ...(colors[status] || colors.not_started),
    borderRadius: "999px",
    padding: "0.35rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: 800,
    whiteSpace: "nowrap",
  };
};

export default ExamPage;