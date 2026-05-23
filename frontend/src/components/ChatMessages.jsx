import AiTextBlock from "./AiTextBlock";

function ChatMessages({ messages = [] }) {
  return (
    <div className="mt-6 space-y-4">
      {messages.map((message, index) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id || index}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                isUser
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-800"
              }`}
            >
              {isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <>
                  <AiTextBlock text={message.content} />

                  {message.sources?.length > 0 && (
                    <div className="mt-4 border-t border-slate-200 pt-3">
                      <ul className="mt-2 list-disc space-y-1 pr-5 text-xs text-slate-600">
                        {message.sources.map((source, sourceIndex) => (
                          <li key={`${source.fileName}-${sourceIndex}`}>
                            {source.fileName}
                          </li>
                        ))}
                      </ul>
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