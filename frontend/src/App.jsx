import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import QuestionsPage from './pages/questionsPage'
import SummarizePage from "./pages/summarizePage";

function HomePage({ backendMessage }) {
  return (
    <div>
      <p><strong>{backendMessage}</strong></p>
    </div>
  )
}

function UploadPage() {
  return (
    <div className="screen-content">
      <h2>העלאת חומר לימודי</h2>
      <p>כאן בהמשך נוסיף העלאת קבצים או טקסט חופשי.</p>
    </div>
  )
}

function App() {
  const [backendMessage, setBackendMessage] = useState("")

  // useEffect(() => {
  //   fetch("/api/health")
  //     .then(res => res.json())
  //     .then(data => setBackendMessage(data.message))
  //     .catch(() => setBackendMessage("Backend not connected"))
  // }, [])

  return (
    <div className="app-container">
      <h3>Welcome To</h3>
      <h1>Studify</h1>

      <div className="menu">
        <Link to="/" className="menu-button">דף הבית</Link>
        <Link to="/upload" className="menu-button">Upload Material</Link>
        <Link to="/questions" className="menu-button">Ask AI</Link>
        <Link to="/summarize" className="menu-button">Summary</Link>

      </div>

      <Routes>
        <Route path="/" element={<HomePage backendMessage={backendMessage} />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/summarize" element={<SummarizePage />} />
      </Routes>
    </div>
  )
}

export default App