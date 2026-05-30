import { useEffect, useState } from "react";
import {
  askAi,
  createAskChat,
  getAskChats,
  getAskChatMessages,
} from "../services/aiService.js";
import messages from "../messages.js";
import ChatMessages from "../components/ChatMessages";

function QuestionsPage() {
  const [question, setQuestion] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      setLoadingChats(true);
      const data = await getAskChats();
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
      const data = await createAskChat(chatTitle);

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

      const data = await getAskChatMessages(chat.id);
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

    const userMessage = {
      role: "user",
      content: question,
    };

    setChatMessages((prev) => [...prev, userMessage]);

    try {
      setLoading(true);

      const result = await askAi(selectedChat.id, question);

      const assistantMessage = {
        role: "assistant",
        content: result.answer || "",
        sources: result.sources || [],
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
      setQuestion("");

      await loadChats();
    } catch (err) {
      setError(err.message || messages.askAi.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid h-[calc(100vh-48px)] grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="flex min-h-0 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-[#111111]">Ask AI Chats</h3>
          <p className="mt-1 text-sm text-gray-500">
            Continue previous questions or start a new conversation.
          </p>
        </div>

      

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={chatTitle}
            onChange={(e) => setChatTitle(e.target.value)}
            placeholder="New chat title"
            className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#C9AE84]"
          />

          <button
            onClick={handleCreateChat}
            className="h-11 w-full rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            + New Chat
          </button>
        </div>

        <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {loadingChats && (
            <div className="rounded-xl bg-[#F7F7F5] p-3 text-sm text-gray-500">
              Loading chats...
            </div>
          )}

          {!loadingChats && chats.length === 0 && (
            <div className="rounded-xl bg-[#F7F7F5] p-3 text-sm text-gray-500">
              No chats yet
            </div>
          )}

          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                selectedChat?.id === chat.id
                  ? "bg-[#F3E9DA] font-semibold text-[#111111]"
                  : "bg-[#F7F7F5] text-gray-700 hover:bg-gray-100"
              }`}
            >
              {chat.title}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex min-h-0 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
        {!selectedChat ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-center">
            <div>
              <h2 className="text-2xl font-bold text-[#111111]">
                Choose or create a chat
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Your AI conversation will appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-[#111111]">
                {selectedChat.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Ask questions based on your uploaded study materials.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <ChatMessages
                messages={chatMessages}
                sourcesTitle={messages.askAi.sourcesTitle}
              />

              {loading && (
                <div className="mt-4 text-sm text-gray-500">
                  AI is thinking...
                </div>
              )}
            </div>

            {error && (
              <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAskAi();
                  }}
                  placeholder={messages.askAi.questionPlaceholder}
                  className="h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-[#C9AE84]"
                />

                <button
                  onClick={handleAskAi}
                  disabled={loading}
                  className="h-12 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? messages.askAi.loading : messages.askAi.submit}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default QuestionsPage;