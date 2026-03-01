import { useState, useRef, useEffect } from "react"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import {
  headerStyles as hs, tabBtnStyle, roleBadgeStyle,
  chatStyles as cs, askBtnStyle, bubbleStyle,
  refStyles as rs, filesStyles as fs, uploadBtnStyle
} from "./styles/App.styles"

const API_BASE = "http://localhost:5000"

export default function App() {
  const [authPage, setAuthPage] = useState("login")
  const [currentUser, setCurrentUser] = useState(null)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) setCurrentUser(JSON.parse(user))
  }, [])

  useEffect(() => {
    if (currentUser) fetchFiles()
  }, [currentUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleAuth = (user) => setCurrentUser(user)

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setCurrentUser(null)
    setMessages([])
    setUploadedFiles([])
  }

  const getToken = () => localStorage.getItem("token")

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ingest/files`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      setUploadedFiles(data.files || [])
    } catch (e) { console.error("Failed to fetch files", e) }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch(`${API_BASE}/api/ingest/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData
      })
      const data = await res.json()
      if (!res.ok) return alert(`❌ ${data.error}`)
      alert(`✅ ${data.file} uploaded! ${data.totalChunks} chunks created.`)
      fetchFiles()
    } catch (e) { alert("❌ Upload failed") }
    finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleAsk = async () => {
    if (!question.trim() || isStreaming) return
    const q = question.trim()
    setQuestion("")
    setIsStreaming(true)

    setMessages(prev => [...prev, { role: "user", content: q }])
    setMessages(prev => [...prev, { role: "assistant", content: "", sources: [], isStreaming: true, isGuardrail: false }])

    try {
      const response = await fetch(`${API_BASE}/api/rag/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ question: q }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === "token") {
              setMessages(prev => {
                const updated = [...prev]
                const last = { ...updated[updated.length - 1] }
                last.content = last.content + data.token
                updated[updated.length - 1] = last
                return updated
              })
            }
            if (data.type === "guardrail") {
              setMessages(prev => {
                const updated = [...prev]
                const last = { ...updated[updated.length - 1] }
                last.content = data.answer
                last.isGuardrail = true
                last.isStreaming = false
                last.sources = []
                updated[updated.length - 1] = last
                return updated
              })
              setIsStreaming(false)
            }
            if (data.type === "done") {
              setMessages(prev => {
                const updated = [...prev]
                const last = { ...updated[updated.length - 1] }
                last.isStreaming = false
                last.sources = data.sources || []
                updated[updated.length - 1] = last
                return updated
              })
              setIsStreaming(false)
            }
            if (data.type === "error") {
              setMessages(prev => {
                const updated = [...prev]
                const last = { ...updated[updated.length - 1] }
                last.content = "❌ " + (data.message || "An error occurred.")
                last.isStreaming = false
                updated[updated.length - 1] = last
                return updated
              })
              setIsStreaming(false)
            }
          } catch (e) {}
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        const last = { ...updated[updated.length - 1] }
        last.content = "❌ Connection error. Is the backend running?"
        last.isStreaming = false
        updated[updated.length - 1] = last
        return updated
      })
      setIsStreaming(false)
    }
  }

  // ─── NOT LOGGED IN ────────────────────────────────────
  if (!currentUser) {
    return authPage === "login"
      ? <Login onSwitch={() => setAuthPage("signup")} onAuth={handleAuth} />
      : <Signup onSwitch={() => setAuthPage("login")} onAuth={handleAuth} />
  }

  const isAdmin = currentUser.role === "admin"

  // ─── LOGGED IN ────────────────────────────────────────
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>

      {/* ── HEADER ── */}
      <div style={hs.header}>
        <div style={hs.logoBox}>🧠</div>
        <div>
          <div style={hs.appName}>OpsMind AI</div>
          <div style={hs.appTagline}>Enterprise SOP Neural Brain</div>
        </div>

        <div style={hs.tabsGroup}>
          <button onClick={() => setActiveTab("chat")} style={tabBtnStyle(activeTab === "chat")}>
            💬 Chat
          </button>
          {isAdmin && (
            <button onClick={() => setActiveTab("files")} style={tabBtnStyle(activeTab === "files", true)}>
              📁 Files
            </button>
          )}
        </div>

        <div style={hs.userArea}>
          <div style={{ textAlign: "right" }}>
            <div style={hs.userName}>{currentUser.name}</div>
            <div style={roleBadgeStyle(isAdmin)}>
              {isAdmin ? "👑 ADMIN" : "👤 USER"}
            </div>
          </div>
          <button onClick={handleLogout} style={hs.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div style={cs.wrapper}>
          <div style={cs.messagesArea}>

            {messages.length === 0 && (
              <div style={cs.emptyState}>
                <div style={cs.emptyIcon}>🧠</div>
                <div style={cs.emptyTitle}>
                  Hello {currentUser.name}! Ask me anything about your SOP documents.
                </div>
                {isAdmin && <div style={cs.emptySubtitle}>Upload PDFs in the Files tab to get started</div>}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "78%" }}>

                  {/* Bubble */}
                  <div style={bubbleStyle(msg.role, msg.isGuardrail)}>
                    {msg.role === "assistant" && msg.isGuardrail && (
                      <div style={{ color: "#fbbf24", fontWeight: "bold", marginBottom: 8, fontSize: 13 }}>
                        ⚠️ Outside Knowledge Base
                      </div>
                    )}
                    {msg.content}
                    {msg.isStreaming && <span style={{ color: "#3b82f6", fontWeight: "bold" }}>▌</span>}
                  </div>

                  {/* Reference Cards */}
                  {msg.role === "assistant" && !msg.isStreaming && msg.sources?.length > 0 && (
                    <div style={rs.wrapper}>
                      <div style={rs.label}>📎 REFERENCES</div>
                      <div style={rs.cardsRow}>
                        {msg.sources.map((src, si) => (
                          <div key={si} style={rs.card}>
                            <div style={rs.cardFile}>📄 {src.fileName}</div>
                            {src.pageNumber && <div style={rs.cardPage}>Page {src.pageNumber}</div>}
                            <div style={rs.cardScore}>Match: {src.score}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={cs.inputBar}>
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAsk()}
              placeholder="Ask a question about your SOP documents..."
              disabled={isStreaming}
              style={cs.input}
            />
            <button
              onClick={handleAsk}
              disabled={isStreaming || !question.trim()}
              style={askBtnStyle(isStreaming || !question.trim())}
            >
              {isStreaming ? "⏳" : "Ask →"}
            </button>
          </div>
        </div>
      )}

      {/* ── FILES TAB (ADMIN ONLY) ── */}
      {activeTab === "files" && isAdmin && (
        <div style={fs.wrapper}>

          <div style={fs.uploadBox}>
            <div style={fs.uploadIcon}>📤</div>
            <div style={fs.uploadTitle}>Upload SOP Document</div>
            <div style={fs.uploadSubtitle}>Admin access only · PDF files</div>
            <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display: "none" }} id="fileInput" />
            <label htmlFor="fileInput" style={uploadBtnStyle(uploading)}>
              {uploading ? "⏳ Processing..." : "📂 Choose PDF"}
            </label>
          </div>

          <div style={fs.sectionLabel}>
            📁 UPLOADED DOCUMENTS ({uploadedFiles.length})
          </div>

          {uploadedFiles.length === 0 ? (
            <div style={{ textAlign: "center", color: "#334155", padding: 40 }}>No files uploaded yet</div>
          ) : (
            <div style={fs.fileList}>
              {uploadedFiles.map((file, i) => (
                <div key={i} style={fs.fileCard}>
                  <div style={fs.fileIcon}>📄</div>
                  <div style={{ flex: 1 }}>
                    <div style={fs.fileName}>{file.fileName}</div>
                    <div style={fs.fileMeta}>
                      {file.totalChunks} chunks · {new Date(file.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={fs.indexedBadge}>✓ Indexed</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}