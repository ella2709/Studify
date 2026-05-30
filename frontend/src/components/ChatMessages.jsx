import AiTextBlock from "./AiTextBlock";

function ChatMessages({ messages = [] }) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        const isUser = message.role === "user";

        return (
          <div
            key={message.id || index}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl p-4 text-sm shadow-sm ${
                isUser
                  ? "bg-[#F3E9DA] text-[#111111]"
                  : "border border-gray-200 bg-white text-[#111111]"
              }`}
            >
              {isUser ? (
                <div className="whitespace-pre-wrap leading-6">
                  {message.content}
                </div>
              ) : (
                <>
                  <AiTextBlock text={message.content} />

                  {message.sources?.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-3">
                      <div className="flex flex-wrap gap-2">
                        {message.sources.map((source, sourceIndex) => (
                          <span
                            key={`${source.fileName}-${sourceIndex}`}
                            className="rounded-full border border-gray-200 bg-[#F7F7F5] px-3 py-1 text-xs text-gray-600"
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