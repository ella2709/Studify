import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { askAi, createAskChat, useAskChats, getAskChatMessages, deleteAskChat,} from "../services/conversationService.js";
import messages from "../messages.js";
import ChatMessages from "../components/chatMessages.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

function ProjectBreadcrumb() {
  const { projectId } = useParams();
  const location = useLocation();

  if (!projectId) return null;

  const name =
    location.state?.projectName ||
    projectId
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return (
    <Link
      to={`/project/${projectId}`}
      state={{ projectName: name }}
      style={{
        fontSize: "0.8125rem",
        color: "var(--text-muted)",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3125rem",
        marginBottom: "0.75rem",
        flexShrink: 0,
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {name}
    </Link>
  );
}

function QuestionsPage() {
  const { projectId } = useParams();

  const [question, setQuestion] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const { data: chatsData, isLoading: loadingChats, refetch: refetchChats,} = useAskChats(projectId);
  const chats = chatsData?.chats || [];
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateChatDialogOpen, setIsCreateChatDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

 useEffect(() => {
  setSelectedChat(null);
  setChatMessages([]);
  setError("");
}, [projectId]);

  async function handleCreateChat() {
  setError("");

  if (!chatTitle.trim()) {
    setError("Please enter a chat title");
    return;
  }

  try {
    const data = await createAskChat(chatTitle, projectId);
    setSelectedChat(data.chat);
    setChatMessages([]);
    setChatTitle("");
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

      const data = await getAskChatMessages(chat.id, projectId);
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

    const userMessage = { role: "user", content: question };
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      setLoading(true);

      const result = await askAi(selectedChat.id, question, projectId);

      setChatMessages((prev) => [...prev, result.message]);
      setQuestion("");

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
      await deleteAskChat(chatToDelete.id, projectId);

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

  return (
    <div
      style={{
        height: "calc(100vh - var(--topbar-h) - 5rem)",
        minHeight: 520,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ProjectBreadcrumb />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 260px",
          gap: "1rem",
          alignItems: "stretch",
        }}
      >
        {/* Main chat area */}
        <main
          style={{
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "1.25rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text)",
                margin: "0 0 0.25rem",
              }}
            >
              {selectedChat ? selectedChat.title : "Ask AI"}
            </h2>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                margin: 0,
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
                textAlign: "center",
              }}
            >
              <div
                style={{
                  maxWidth: 360,
                  backgroundColor: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRadius: "1rem",
                  padding: "2rem",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  💬
                </div>

                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: "0 0 0.5rem",
                  }}
                >
                  Choose or create a chat
                </h3>

                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-muted)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Select an existing question chat from the right side, or create
                  a new one.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1.5rem",
                }}
              >
                <ChatMessages messages={chatMessages} />

                {loading && (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
                      marginTop: "1rem",
                    }}
                  >
                    AI is thinking...
                  </div>
                )}
              </div>

              {error && (
                <div className="status-error" style={{ margin: "0 1.25rem 0.75rem" }}>
                  {error}
                </div>
              )}

              <div
                style={{
                  padding: "1rem 1.25rem",
                  borderTop: "1px solid var(--border)",
                  backgroundColor: "var(--bg-surface)",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleAskAi()}
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
              </div>
            </>
          )}
        </main>

        {/* Right chats panel */}
        <aside
          style={{
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "1.25rem",
            padding: "1rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ marginBottom: "0.875rem", flexShrink: 0 }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text)",
                margin: "0 0 0.25rem",
              }}
            >
              Question Chats
            </h3>

            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Create or continue chats.
            </p>
          </div>

          <div
            style={{
              marginBottom: "0.875rem",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => {
                setChatTitle("");
                setError("");
                setIsCreateChatDialogOpen(true);
              }}
              className="btn btn-primary"
              style={{
                width: "100%",
                height: 42,
                fontSize: "0.875rem",
              }}
            >
              + New Chat
            </button>
          </div>

          {error && !selectedChat && (
            <div className="status-error" style={{ marginBottom: "0.75rem" }}>
              {error}
            </div>
          )}

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              paddingRight: "0.15rem",
            }}
          >
            {loadingChats &&
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{ height: 38, borderRadius: "0.75rem" }}
                />
              ))}

            {!loadingChats && chats.length === 0 && (
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  padding: "0.875rem",
                  textAlign: "center",
                  backgroundColor: "var(--bg-raised)",
                  borderRadius: "0.75rem",
                  lineHeight: 1.5,
                }}
              >
                No chats yet
              </div>
            )}

            {chats.map((chat) => {
              const isActive = selectedChat?.id === chat.id;

              return (
                <div
                  key={chat.id}
                  className={`chat-item${isActive ? " active" : ""}`}
                  style={{
                    minHeight: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.35rem",
                    borderRadius: "0.75rem",
                  }}
                >
                  <button
                    onClick={() => handleSelectChat(chat)}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: "none",
                      background: "transparent",
                      color: "inherit",
                      cursor: "pointer",
                      font: "inherit",
                      textAlign: "left",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chat.title}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(chat);
                    }}
                    title="Delete chat"
                    style={{
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                      border: "none",
                      borderRadius: "999px",
                      background: "transparent",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "1rem",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {isCreateChatDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "1.25rem",
              boxShadow: "var(--shadow-card)",
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Create new chat
            </h3>

            <p
              style={{
                margin: "0 0 1rem",
                fontSize: "0.875rem",
                color: "var(--text-muted)",
              }}
            >
              Give your question chat a title.
            </p>

            <input
              autoFocus
              type="text"
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateChat()}
              placeholder="Chat title..."
              className="input-base"
              style={{ width: "100%", marginBottom: "1rem" }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
              }}
            >
              <button
                className="btn"
                onClick={() => {
                  setIsCreateChatDialogOpen(false);
                  setChatTitle("");
                  setError("");
                }}
              >
                Cancel
              </button>

              <button className="btn btn-primary" onClick={handleCreateChat}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

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