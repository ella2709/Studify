import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { askQuestion, createQuestionChat, useQuestionChats, getQuestionChatMessages, deleteQuestionChat, } from "../services/questionService.js";
import messages from "../messages.js";
import ChatMessages from "../components/chatMessages.jsx";
import ConfirmDialog from "../components/confirmDialog.jsx";
import CreateChatDialog from "../components/createChatDialog.jsx";
import { ChevronLeft } from "../components/iconsAndButtons.jsx";
import { useAiAccess } from "../authentication/aiAccessContext.jsx";

function projectNameFromId(projectId) {
  return projectId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function QuestionsPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const { isAiBlocked } = useAiAccess();

  const projectName =
    location.state?.projectName || projectNameFromId(projectId);

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
  const [deleteLoading, setDeleteLoading] = useState(false);

  const threadRef = useRef(null);

  useEffect(() => {
    setSelectedChat(null);
    setChatMessages([]);
    setQuestion("");
    setError("");
  }, [projectId]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [chatMessages, loading]);

  useEffect(() => {
    if (isAiBlocked) {
      setIsCreateChatDialogOpen(false);
      setQuestion("");
    }
  }, [isAiBlocked]);

  async function handleCreateChat(title) {
    if (isAiBlocked) return;

    setError("");

    if (!title.trim()) {
      setError(messages.askAi.missingChatTitle);
      return;
    }

    try {
      const data = await createQuestionChat(title.trim(), projectId);
      setSelectedChat(data.chat);
      setChatMessages([]);
      setIsCreateChatDialogOpen(false);
      await refetchChats();
    } catch (err) {
      setError(err.message || messages.askAi.createChatFailed);
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
      setError(err.message || messages.askAi.loadMessagesFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handleAskAi() {
    if (isAiBlocked) return;

    setError("");

    if (!selectedChat) {
      setError(messages.askAi.chooseChatFirst);
      return;
    }

    if (!question.trim()) {
      setError(messages.askAi.missingFields);
      return;
    }

    const currentQuestion = question.trim();

    setChatMessages((previous) => [
      ...previous,
      { role: "user", type: "text", content: currentQuestion },
    ]);

    setQuestion("");

    try {
      setLoading(true);

      const result = await askQuestion(
        selectedChat.id,
        currentQuestion,
        projectId
      );

      setChatMessages((previous) => [...previous, result.message]);

      if (result.success !== false) {
        await refetchChats();
      }
    } catch (err) {
      if (err.code !== "AI_LIMIT_REACHED") {
        setError(err.message || messages.askAi.error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteChat() {
    if (!chatToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteQuestionChat(chatToDelete.id, projectId);

      if (selectedChat?.id === chatToDelete.id) {
        setSelectedChat(null);
        setChatMessages([]);
      }

      setChatToDelete(null);
      await refetchChats();
    } catch (err) {
      setError(err.message || messages.askAi.deleteChatFailed);
    } finally {
      setDeleteLoading(false);
    }
  }

  function openCreateChatDialog() {
    setError("");
    if (!isAiBlocked) setIsCreateChatDialogOpen(true);
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

      {isAiBlocked && (
        <div className="alert" style={{ marginBottom: "0.85rem", flexShrink: 0 }}>
          <div>
            <strong style={{ display: "block", marginBottom: "0.15rem" }}>
              {messages.aiAccess.viewOnlyTitle}
            </strong>
            <span>{messages.aiAccess.questionsMessage}</span>
          </div>
        </div>
      )}

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
              {selectedChat ? selectedChat.title : messages.askAi.title}
            </h2>

            <p
              style={{
                fontSize: "0.83rem",
                color: "var(--text-muted)",
                margin: "0.2rem 0 0",
              }}
            >
              {messages.pagePurposes.questions}
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
                style={{ border: "none", background: "transparent", maxWidth: 380 }}
              >
                <div className="empty-icon">💬</div>
                <h3 className="empty-title">{messages.askAi.startConversation}</h3>
                <p className="empty-text">
                  {isAiBlocked
                    ? messages.aiAccess.questionsEmptyMessage
                    : messages.askAi.chat}
                </p>

                <button
                  type="button"
                  onClick={openCreateChatDialog}
                  disabled={isAiBlocked}
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                  title={
                    isAiBlocked
                      ? messages.aiAccess.unavailableTooltip
                      : undefined
                  }
                >
                  {isAiBlocked
                    ? messages.aiAccess.unavailableButton
                    : messages.askAi.newChat}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-thread" ref={threadRef}>
                <div className="chat-thread__inner">
                  <ChatMessages messages={chatMessages} />

                  {loading && (
                    <div className="bubble-row ai" style={{ marginTop: "0.9rem" }}>
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
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !loading &&
                      !isAiBlocked
                    ) {
                      handleAskAi();
                    }
                  }}
                  placeholder={
                    isAiBlocked
                      ? messages.aiAccess.questionsPlaceholder
                      : messages.askAi.questionPlaceholder
                  }
                  disabled={isAiBlocked}
                  className="input-base"
                  style={{ flex: 1 }}
                />

                <button
                  type="button"
                  onClick={handleAskAi}
                  disabled={loading || isAiBlocked}
                  className="btn btn-primary"
                  style={{ flexShrink: 0 }}
                  title={
                    isAiBlocked
                      ? messages.aiAccess.unavailableTooltip
                      : undefined
                  }
                >
                  {isAiBlocked
                    ? messages.aiAccess.unavailableButton
                    : messages.askAi.submit}
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
              {messages.askAi.chatsTitle}
            </h3>

            <p
              style={{
                fontSize: "0.76rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              {messages.askAi.chatsSubTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateChatDialog}
            disabled={isAiBlocked}
            className="btn btn-primary btn-block"
            style={{ marginBottom: "0.9rem", flexShrink: 0 }}
            title={
              isAiBlocked ? messages.aiAccess.unavailableTooltip : undefined
            }
          >
            {isAiBlocked
              ? messages.aiAccess.unavailableButton
              : messages.askAi.newChat}
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
              [1, 2, 3].map((item) => (
                <div key={item} className="skeleton" style={{ height: 40 }} />
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
                {messages.askAi.noChats}
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
                  type="button"
                  className="chat-item__label"
                  onClick={() => handleSelectChat(chat)}
                  title={chat.title}
                >
                  {chat.title}
                </button>

                <button
                  type="button"
                  className="chat-item__del"
                  title={messages.actions.delete}
                  onClick={(event) => {
                    event.stopPropagation();
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
        open={isCreateChatDialogOpen && !isAiBlocked}
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
        title={messages.askAi.deleteChatTitle}
        message={messages.askAi.deleteChatMessage(chatToDelete?.title)}
        confirmText={messages.actions.delete}
        cancelText={messages.actions.cancel}
        onConfirm={handleDeleteChat}
        onCancel={() => setChatToDelete(null)}
        loading={deleteLoading}
      />
    </div>
  );
}

export default QuestionsPage;
