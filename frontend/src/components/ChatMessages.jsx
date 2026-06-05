import AiTextBlock from "./AiTextBlock";

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
                <>
                  <AiTextBlock text={message.content} />

                  {message.sources?.length > 0 && (
                    <div
                      style={{
                        marginTop: "0.875rem",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          margin: "0 0 0.5rem",
                        }}
                      >
                        Sources
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                        {message.sources.map((source, i) => (
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
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatMessages;
