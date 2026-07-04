import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { askQuestion, createQuestionChat, useQuestionChats, getQuestionChatMessages, deleteQuestionChat } from "../services/questionService.js";
import messages from "../messages.js";
import ChatMessages from "../components/chatMessages.jsx";
import ConfirmDialog from "../components/confirmDialog.jsx";
import CreateChatDialog from "../components/createChatDialog.jsx";
import { ChevronLeft } from "../components/iconsAndButtons.jsx";

function projectNameFromId(projectId) {
  return projectId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function QuestionsPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const projectName = location.state?.projectName || projectNameFromId(projectId);

  const [question, setQuestion] = useState("");
  const { data: chatsData, isLoading: loadingChats, refetch: refetchChats } =
    useQuestionChats(projectId);

  const chats = chatsData?.chats || [];

  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateChatDialogOpen, setIsCreateChatDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const threadRef = useRef(null);

  useEffect(() => {
    setSelectedChat(null);
    setChatMessages([]);
    setError("");
  }, [projectId]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  async function handleCreateChat(title) {
    setError("");

    if (!title.trim()) {
      setError("Please enter a chat title");
      return;
    }

    try {
      const data = await createQuestionChat(title.trim(), projectId);
      setSelectedChat(data.chat);
      setChatMessages([]);
      setIsCreateChatDialogOpen(false);
      await refetchChats();
    } catch (err) {
      setError(err.message || "Failed to create chat");
    }
  }

  async function handleSelectChat(chat) {
    setError("");

    try {
      setSelectedChat(chat);
      setLoading(true);

      const data = await getQuestionChatMessages(chat.id, projectId);
      setChatMessages(data.messages || []);
    } catch (err) {
      setError(err.message || "Failed to load chat messages");
    } finally {
      setLoading(false);
    }
  }

  async function handleAskAi() {
    setError("");

    if (!selectedChat) {
      setError("Please choose or create a chat first");
      return;
    }

    if (!question.trim()) {
      setError(messages.askAi.missingFields);
      return;
    }

    const currentQuestion = question.trim();
    const userMessage = { role: "user", content: currentQuestion };

    setChatMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    try {
      setLoading(true);

      const result = await askQuestion(
        selectedChat.id,
        currentQuestion,
        projectId
      );

      setChatMessages((prev) => [...prev, result.message]);

      await refetchChats();
    } catch (err) {
      setError(err.message || messages.askAi.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteChat() {
    if (!chatToDelete) return;

    try {
      await deleteQuestionChat(chatToDelete.id, projectId);

      if (selectedChat?.id === chatToDelete.id) {
        setSelectedChat(null);
        setChatMessages([]);
      }

      setChatToDelete(null);
      await refetchChats();
    } catch (err) {
      setError(err.message || "Failed to delete chat");
    }
  }

  function openCreateChatDialog() {
    setError("");
    setIsCreateChatDialogOpen(true);
  }

  return (
    <div className="app-page app-page--full fade-in">
      <Link
        to={`/project/${projectId}`}
        state={{ projectName }}
        className="breadcrumb"
        style={{ marginBottom: "0.85rem" }}
      >
        <ChevronLeft /> {projectName}
      </Link>

      <div className="chat-shell">
        <main className="chat-main">
          <div
            style={{
              padding: "1.1rem 1.4rem",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontSize: "1.1rem",
                fontWeight: 750,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedChat ? selectedChat.title : "Ask AI"}
            </h2>

            <p
              style={{
                fontSize: "0.83rem",
                color: "var(--text-muted)",
                margin: "0.2rem 0 0",
              }}
            >
              Ask questions based on your uploaded study materials.
            </p>
          </div>

          {!selectedChat ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              <div
                className="empty-state"
                style={{
                  border: "none",
                  background: "transparent",
                  maxWidth: 380,
                }}
              >
                <div className="empty-icon">💬</div>
                <h3 className="empty-title">Start a conversation</h3>
                <p className="empty-text">
                  Select an existing chat from the right, or create a new one to
                  begin asking questions.
                </p>

                <button
                  onClick={openCreateChatDialog}
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                >
                  + New chat
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-thread" ref={threadRef}>
                <div className="chat-thread__inner">
                  <ChatMessages messages={chatMessages} />

                  {loading && (
                    <div
                      className="bubble-row ai"
                      style={{ marginTop: "0.9rem" }}
                    >
                      <div className="bubble bubble-ai">
                        <span className="typing">
                          <span />
                          <span />
                          <span />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div
                  className="status-error"
                  style={{ margin: "0 1.1rem 0.75rem" }}
                >
                  {error}
                </div>
              )}

              <div className="chat-input-bar">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !loading && handleAskAi()
                  }
                  placeholder={messages.askAi.questionPlaceholder}
                  className="input-base"
                  style={{ flex: 1 }}
                />

                <button
                  onClick={handleAskAi}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ flexShrink: 0 }}
                >
                  {loading ? messages.askAi.loading : messages.askAi.submit}
                </button>
              </div>
            </>
          )}
        </main>

        <aside className="chat-aside">
          <div style={{ flexShrink: 0, marginBottom: "0.9rem" }}>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 750,
                margin: "0 0 0.2rem",
              }}
            >
              Question Chats
            </h3>

            <p
              style={{
                fontSize: "0.76rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Create or continue chats.
            </p>
          </div>

          <button
            onClick={openCreateChatDialog}
            className="btn btn-primary btn-block"
            style={{ marginBottom: "0.9rem", flexShrink: 0 }}
          >
            + New Chat
          </button>

          {error && !selectedChat && (
            <div
              className="status-error"
              style={{ marginBottom: "0.75rem", fontSize: "0.8rem" }}
            >
              {error}
            </div>
          )}

          <div className="chat-list">
            {loadingChats &&
              [1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 40 }} />
              ))}

            {!loadingChats && chats.length === 0 && (
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  padding: "1rem",
                  textAlign: "center",
                  background: "var(--bg-raised)",
                  borderRadius: "var(--r-sm)",
                }}
              >
                No chats yet
              </div>
            )}

            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item${
                  selectedChat?.id === chat.id ? " active" : ""
                }`}
              >
                <button
                  className="chat-item__label"
                  onClick={() => handleSelectChat(chat)}
                  title={chat.title}
                >
                  {chat.title}
                </button>

                <button
                  className="chat-item__del"
                  title="Delete chat"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatToDelete(chat);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <CreateChatDialog
        open={isCreateChatDialogOpen}
        chatType="question"
        error={error}
        onCancel={() => {
          setIsCreateChatDialogOpen(false);
          setError("");
        }}
        onCreate={handleCreateChat}
      />

      <ConfirmDialog
        open={!!chatToDelete}
        title="Delete chat?"
        message={`Are you sure you want to delete "${chatToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteChat}
        onCancel={() => setChatToDelete(null)}
      />
    </div>
  );
}



export default QuestionsPage;