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

function SummaryFileMessage({ message }) {
  const file = message.file;

  if (!file?.downloadUrl) {
    return <AiTextBlock text={message.content || "Summary file created"} />;
  }

  return (
    <>
      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "0.9rem", background: "var(--bg-surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.65rem" }}>
          <div className="file-badge">TXT</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Summary file</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {file.fileName || "summary.txt"}
            </div>
          </div>
        </div>
        <a href={file.downloadUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
          Open / Download
        </a>
      </div>
      <SourcesList sources={message.sources} />
    </>
  );
}

function AssistantMessage({ message }) {
  if (message.type === "file") {
    return <SummaryFileMessage message={message} />;
  }

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
