import { useEffect, useState } from "react";
import {
  summarizeAi,
  createSummarizeChat,
  getSummarizeChats,
  getSummarizeChatMessages,
} from "../services/aiService.js";
import messages from "../messages.js";
import ChatMessages from "../components/ChatMessages";

function SummarizePage() {
  const [topic, setTopic] = useState("");
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
      const data = await getSummarizeChats();
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
      const data = await createSummarizeChat(chatTitle);

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

      const data = await getSummarizeChatMessages(chat.id);
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

    const userMessage = {
      role: "user",
      content: topic,
    };

    setChatMessages((prev) => [...prev, userMessage]);

    try {
      setLoading(true);

      const result = await summarizeAi(selectedChat.id, topic);

      const assistantMessage = {
        role: "assistant",
        content: result.summary || "",
        sources: result.sources || [],
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
      setTopic("");

      await loadChats();
    } catch (err) {
      setError(err.message || messages.summarize.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">Summary Chats</h3>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={chatTitle}
            onChange={(e) => setChatTitle(e.target.value)}
            placeholder="New chat title"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          />

          <button
            onClick={handleCreateChat}
            className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            New Chat
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {loadingChats && (
            <div className="text-sm text-slate-500">Loading chats...</div>
          )}

          {!loadingChats && chats.length === 0 && (
            <div className="text-sm text-slate-500">No chats yet</div>
          )}

          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                selectedChat?.id === chat.id
                  ? "bg-orange-100 font-semibold text-orange-800"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {chat.title}
            </button>
          ))}
        </div>
      </aside>

      <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!selectedChat ? (
          <div className="flex min-h-[300px] items-center justify-center text-center text-slate-500">
            Choose a chat from the list or create a new chat
          </div>
        ) : (
          <>
        <h2 className="text-2xl font-bold text-slate-800">
          {selectedChat.title}
        </h2>

        <ChatMessages
          messages={chatMessages}
          sourcesTitle={messages.summarize.sourcesTitle}
        />

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {messages.summarize.topicLabel}
          </label>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={messages.summarize.topicPlaceholder}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <button
          onClick={handleSummarizeAi}
          disabled={loading}
          className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? messages.summarize.loading
            : messages.summarize.submit}
        </button>
        </>
        )}
      </main>
    </div>
  );
}

export default SummarizePage;