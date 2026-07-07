import AiTextBlock from "./aiTextBlock";

function SourcesList({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <div style={{ marginTop: "0.75rem", paddingTop: "0.65rem", borderTop: "1px solid var(--border)" }}>
      <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
        Sources
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
        {sources.map((source, i) => (
          <span key={`${source.fileName}-${i}`} className="meta-pill">
            📄 {source.fileName}
          </span>
        ))}
      </div>
    </div>
  );
}


function AssistantMessage({ message }) {
  return (
    <>
      <AiTextBlock text={message.content} />
      <SourcesList sources={message.sources} />
    </>
  );
}

function ChatMessages({ messages = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      {messages.map((message, index) => {
        const isUser = message.role === "user";

        return (
          <div key={message.id || index} className={`bubble-row ${isUser ? "user" : "ai"} fade-in`}>
            <div className={`bubble ${isUser ? "bubble-user" : "bubble-ai"}`}>
              {isUser ? (
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{message.content}</div>
              ) : (
                <AssistantMessage message={message} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatMessages;
