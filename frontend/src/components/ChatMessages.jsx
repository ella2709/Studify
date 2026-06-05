import AiTextBlock from "./AiTextBlock";

function SourcesList({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <div
      style={{
        marginTop: "0.875rem",
        paddingTop: "0.75rem",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {sources.map((source, i) => (
          <span
            key={`${source.fileName}-${i}`}
            style={{
              display: "inline-block",
              padding: "0.1875rem 0.625rem",
              borderRadius: 999,
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-raised)",
              fontSize: "0.75rem",
              color: "var(--text-2)",
            }}
          >
            {source.fileName}
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
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "0.875rem",
          padding: "0.875rem",
          backgroundColor: "var(--bg-raised)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>
          Summary TXT File
        </div>

        <div
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            marginBottom: "0.75rem",
          }}
        >
          {file.fileName || "summary.txt"}
        </div>

        <a
          href={file.downloadUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.55rem 0.9rem",
            borderRadius: "0.75rem",
            backgroundColor: "var(--accent)",
            color: "white",
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none",
          }}
        >
          Open / Download Summary
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {messages.map((message, index) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id || index}
            style={{
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                borderRadius: "1rem",
                padding: "0.875rem 1.125rem",
                fontSize: "0.9375rem",
                boxShadow: "var(--shadow-sm)",
                ...(isUser
                  ? {
                      backgroundColor: "var(--accent-bg)",
                      color: "var(--text)",
                      borderBottomRightRadius: "0.25rem",
                    }
                  : {
                      backgroundColor: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      borderBottomLeftRadius: "0.25rem",
                    }),
              }}
            >
              {isUser ? (
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {message.content}
                </div>
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