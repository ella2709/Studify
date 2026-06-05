import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  summarizeAi,
  createSummarizeChat,
  getSummarizeChats,
  getSummarizeChatMessages,
} from "../services/aiService.js";
import messages from "../messages.js";
import ChatMessages from "../components/chatMessages.jsx";

function ProjectBreadcrumb() {
  const { projectId } = useParams();
  const location = useLocation();
  if (!projectId) return null;
  const name =
    location.state?.projectName ||
    projectId.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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
        transition: "color 0.14s",
        marginBottom: "0.75rem",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      {name}
    </Link>
  );
}

function SummarizePage() {
  const { projectId } = useParams();

  const [topic, setTopic] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedChat(null);
    setChatMessages([]);
    setChats([]);
    setError("");
    loadChats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function loadChats() {
    try {
      setLoadingChats(true);
      const data = await getSummarizeChats(projectId);
      setChats(data.chats || []);
    } catch (err) {
      setError(err.message || "Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  }

  async function handleCreateChat() {
    setError("");
    if (!chatTitle.trim()) {
      setError("Please enter a chat title");
      return;
    }
    try {
      const data = await createSummarizeChat(chatTitle, projectId);
      setSelectedChat(data.chat);
      setChatMessages([]);
      setChatTitle("");
      await loadChats();
    } catch (err) {
      setError(err.message || "Failed to create chat");
    }
  }

  async function handleSelectChat(chat) {
    setError("");
    try {
      setSelectedChat(chat);
      setLoading(true);
      const data = await getSummarizeChatMessages(chat.id, projectId);
      setChatMessages(data.messages || []);
    } catch (err) {
      setError(err.message || "Failed to load chat messages");
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarizeAi() {
    setError("");
    if (!selectedChat) {
      setError("Please choose or create a chat first");
      return;
    }
    if (!topic.trim()) {
      setError(messages.summarize.missingFields);
      return;
    }

    const userMessage = { role: "user", content: topic };
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      setLoading(true);
      const result = await summarizeAi(selectedChat.id, topic, projectId);
      setChatMessages((prev) => [...prev, result.message]);
      setTopic("");
      await loadChats();
    } catch (err) {
      setError(err.message || messages.summarize.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - var(--topbar-h) - 5rem)", minHeight: 480 }}>
      <ProjectBreadcrumb />

      <div className="chat-layout" style={{ flex: 1, minHeight: 0 }}>
        {/* ── Chat sidebar ── */}
        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "1.25rem",
            boxShadow: "var(--shadow-card)",
            minHeight: 0,
          }}
        >
          <div style={{ marginBottom: "1rem", flexShrink: 0 }}>
            <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.25rem" }}>
              Summary Chats
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
              Generate and review topic summaries.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.875rem", flexShrink: 0 }}>
            <input
              type="text"
              value={chatTitle}
              onChange={(e) => setChatTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateChat()}
              placeholder="Chat title..."
              className="input-base"
              style={{ fontSize: "0.875rem" }}
            />
            <button onClick={handleCreateChat} className="btn btn-primary" style={{ width: "100%" }}>
              + New Summary Chat
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.3125rem" }}>
            {loadingChats && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 36, borderRadius: "0.625rem" }} />
                ))}
              </>
            )}
            {!loadingChats && chats.length === 0 && (
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", padding: "0.75rem", textAlign: "center", backgroundColor: "var(--bg-raised)", borderRadius: "0.625rem" }}>
                No chats yet
              </div>
            )}
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`chat-item${selectedChat?.id === chat.id ? " active" : ""}`}
              >
                {chat.title}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Chat area ── */}
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            boxShadow: "var(--shadow-card)",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {!selectedChat ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📝</div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.5rem" }}>
                  Choose or create a summary chat
                </h2>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
                  Your generated summaries will appear here.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", margin: "0 0 0.2rem" }}>
                  {selectedChat.title}
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
                  Generate focused summaries from your uploaded materials.
                </p>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
                <div style={{ maxWidth: 860, margin: "0 auto" }}>
                  <ChatMessages messages={chatMessages} />
                  {loading && (
                    <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "1rem" }}>
                      Generating summary...
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="status-error" style={{ margin: "0 1.25rem 0.75rem" }}>
                  {error}
                </div>
              )}

              <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-surface)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && handleSummarizeAi()}
                    placeholder={messages.summarize.topicPlaceholder}
                    className="input-base"
                    style={{ flex: 1 }}
                  />
                  <button onClick={handleSummarizeAi} disabled={loading} className="btn btn-primary" style={{ flexShrink: 0 }}>
                    {loading ? messages.summarize.loading : messages.summarize.submit}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default SummarizePage;
