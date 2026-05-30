import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import QuestionsPage from "./pages/questionsPage";
import SummarizePage from "./pages/summarizePage";
import UploadMaterialPage from "./pages/uploadMaterialPage";
import messages from "./messages";

function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Welcome To
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#111111]">
          Studify
        </h1>

        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
          {messages.welcome.title}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#111111]">Upload Materials</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Add your study files and keep your learning resources organized.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#111111]">Ask AI</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Ask focused questions based on your uploaded materials.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#111111]">Summaries</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Generate clear summaries from your learning content.
          </p>
        </div>
      </section>
    </div>
  );
}

function NavLinkButton({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
        isActive
          ? "bg-white/15 text-white"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  const [backendMessage] = useState("");

  return (
    <div className="flex min-h-screen bg-[#F7F7F5] text-[#111111]">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-[#111111] p-4 text-white">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8C2A0] font-bold text-black">
              S
            </div>

            <div>
              <h1 className="text-lg font-bold">Studify</h1>
              <p className="text-xs text-gray-400">AI Learning Workspace</p>
            </div>
          </div>
        </div>

        <Link
          to="/questions"
          className="mb-6 flex h-11 items-center justify-center rounded-xl bg-[#D8C2A0] text-sm font-semibold text-black transition hover:bg-[#C9AE84]"
        >
          + New Chat
        </Link>

        <nav className="flex flex-1 flex-col gap-2">
          <NavLinkButton to="/">Home</NavLinkButton>
          <NavLinkButton to="/upload">Upload Materials</NavLinkButton>
          <NavLinkButton to="/questions">Ask AI</NavLinkButton>
          <NavLinkButton to="/summarize">Summaries</NavLinkButton>
        </nav>

        <div className="space-y-2 border-t border-white/10 pt-4">
          <button className="w-full rounded-xl px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10">
            Settings
          </button>

          <button className="w-full rounded-xl px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10">
            User Profile
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-6">
        <Routes>
          <Route path="/" element={<HomePage backendMessage={backendMessage} />} />
          <Route path="/upload" element={<UploadMaterialPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/summarize" element={<SummarizePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;