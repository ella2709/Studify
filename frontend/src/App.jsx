import { useState } from 'react'
import ReactMarkdown from "react-markdown";
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import QuestionsPage from './pages/questionsPage'
import SummarizePage from './pages/summarizePage'
import UploadMaterialPage from './pages/uploadMaterialPage'


function HomePage({ backendMessage }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-lg font-semibold text-slate-700">
        {backendMessage || "ברוכה הבאה למערכת Studify"}
      </p>
      <p className="mt-3 text-slate-500">
        כאן נוכל בהמשך להציג מידע כללי על המערכת.
      </p>
    </div>
  )
}



function NavLinkButton({ to, children }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`rounded-xl px-5 py-3 text-sm font-medium transition ${
        isActive
          ? "bg-orange-300 text-black shadow"
          : "bg-orange-200 text-black hover:bg-orange-300"
      }`}
    >
      {children}
    </Link>
  )
}

function App() {
  const [backendMessage] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h3 className="text-lg font-medium text-slate-500">Welcome To</h3>
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight text-slate-900">
            Studify
          </h1>
          <p className="mt-3 text-slate-600">
            Study smarter with AI tools for questions and summaries
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <NavLinkButton to="/">דף הבית</NavLinkButton>
          <NavLinkButton to="/upload">Upload Material</NavLinkButton>
          <NavLinkButton to="/questions">Ask AI</NavLinkButton>
          <NavLinkButton to="/summarize">Summary</NavLinkButton>
        </div>

        <Routes>
          <Route path="/" element={<HomePage backendMessage={backendMessage} />} />
          <Route path="/upload" element={<UploadMaterialPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/summarize" element={<SummarizePage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App