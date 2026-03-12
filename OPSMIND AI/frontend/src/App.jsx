import { useState, useRef, useEffect } from "react"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import {
  headerStyles as hs, tabBtnStyle, roleBadgeStyle,
  chatStyles as cs, askBtnStyle, bubbleStyle,
  refStyles as rs, filesStyles as fs, uploadBtnStyle
} from "./styles/App.styles"

const API_BASE = import.meta.env.PROD 
  ? "https://infotactteam.onrender.com"
  : "http://localhost:5000"

export default function App() {
  const [authPage, setAuthPage] = useState("login")
  const [currentUser, setCurrentUser] = useState(null)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  
  // ✅ NEW: Chat History State
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) setCurrentUser(JSON.parse(user))
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchFiles()
      fetchConversations() // ✅ NEW: Load conversations on login
    }
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
    setConversations([])
    setCurrentConversationId(null)
  }

  const getToken = () => localStorage.getItem("token")

  // ✅ NEW: Fetch all conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) {
        setConversations(data.conversations || [])
      }
    } catch (e) {
      console.error("Failed to fetch conversations", e)
    }
  }

  // ✅ NEW: Create new conversation
  const createNewConversation = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title: "New Chat" })
      })
      const data = await res.json()
      if (data.success) {
        setCurrentConversationId(data.conversation.id)
        setMessages([])
        await fetchConversations()
        return data.conversation.id // ✅ FIXED: Return the conversation ID
      }
      return null
    } catch (e) {
      console.error("Failed to create conversation", e)
      return null
    }
  }

  // ✅ NEW: Load conversation
  const loadConversation = async (conversationId) => {
    try {
      const res = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) {
        setCurrentConversationId(conversationId)
        setMessages(data.conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          sources: msg.sources || [],
          isStreaming: false,
          isGuardrail: msg.isGuardrail || false
        })))
      }
    } catch (e) {
      console.error("Failed to load conversation", e)
    }
  }

  // ✅ NEW: Delete conversation
  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation()
    if (!confirm("Delete this conversation?")) return
    
    try {
      await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null)
        setMessages([])
      }
      
      fetchConversations()
    } catch (e) {
      console.error("Failed to delete conversation", e)
    }
  }

  // ✅ NEW: Save message to conversation
  const saveMessageToConversation = async (role, content, sources = [], isGuardrail = false, convId = null) => {
    const conversationId = convId || currentConversationId
    if (!conversationId) return

    try {
      await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ role, content, sources, isGuardrail })
      })
      fetchConversations() // Refresh list
    } catch (e) {
      console.error("Failed to save message", e)
    }
  }

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

    // ✅ FIXED: Wait for conversation to be created and get the ID
    let conversationId = currentConversationId
    if (!conversationId) {
      conversationId = await createNewConversation()
      if (!conversationId) {
        alert("Failed to create conversation. Check if backend is running.")
        setIsStreaming(false)
        return
      }
    }

    setMessages(prev => [...prev, { role: "user", content: q }])
    setMessages(prev => [...prev, { role: "assistant", content: "", sources: [], isStreaming: true, isGuardrail: false }])

    // ✅ FIXED: Save user message with guaranteed conversation ID
    await saveMessageToConversation("user", q, [], false, conversationId)

    try {
      console.log("🚀 Sending request to:", `${API_BASE}/api/rag/ask`)
      console.log("🔑 Token:", getToken() ? "Present" : "Missing")
      
      const response = await fetch(`${API_BASE}/api/rag/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ question: q }),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Backend error:", response.status, errorText)
        
        setMessages(prev => {
          const updated = [...prev]
          const last = { ...updated[updated.length - 1] }
          
          if (response.status === 401) {
            last.content = "❌ Authentication failed. Please logout and login again."
          } else if (response.status === 500) {
            last.content = "❌ Backend server error. Check backend console for details."
          } else {
            last.content = `❌ Request failed (${response.status}): ${errorText}`
          }
          
          last.isStreaming = false
          updated[updated.length - 1] = last
          return updated
        })
        setIsStreaming(false)
        return
      }

      console.log("✅ Getting JSON response...")
      
      const data = await response.json()
      console.log("📦 Response data:", data)

      setMessages(prev => {
        const updated = [...prev]
        const last = { ...updated[updated.length - 1] }
        last.content = data.answer || "No answer received."
        last.isGuardrail = data.guardrail || false
        last.isStreaming = false
        last.sources = data.sources || []
        updated[updated.length - 1] = last
        return updated
      })

      // ✅ FIXED: Save assistant message with guaranteed conversation ID
      await saveMessageToConversation("assistant", data.answer, data.sources, data.guardrail, conversationId)
      
      setIsStreaming(false)

    } catch (err) {
      console.error("❌ Fetch error:", err)
      setMessages(prev => {
        const updated = [...prev]
        const last = { ...updated[updated.length - 1] }
        last.content = `❌ Connection error: ${err.message}. Is the backend running on port 5000?`
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

      {/* ── CHAT TAB WITH SIDEBAR ── */}
      {activeTab === "chat" && (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* ✅ NEW: CHAT HISTORY SIDEBAR */}
          {showSidebar && (
            <div style={{
              width: 280,
              background: "#1e293b",
              borderRight: "1px solid #334155",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              {/* Sidebar Header */}
              <div style={{
                padding: 16,
                borderBottom: "1px solid #334155",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>
                  💬 Chat History
                </div>
                <button 
                  onClick={createNewConversation}
                  style={{
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  + New
                </button>
              </div>

              {/* Conversations List */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: 8
              }}>
                {conversations.length === 0 ? (
                  <div style={{
                    padding: 24,
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: 13
                  }}>
                    No conversations yet.<br/>Start chatting!
                  </div>
                ) : (
                  conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      style={{
                        padding: 12,
                        margin: "4px 0",
                        background: currentConversationId === conv.id ? "#334155" : "transparent",
                        borderRadius: 8,
                        cursor: "pointer",
                        border: currentConversationId === conv.id ? "1px solid #3b82f6" : "1px solid transparent",
                        transition: "all 0.2s",
                        position: "relative"
                      }}
                      onMouseEnter={e => {
                        if (currentConversationId !== conv.id) {
                          e.currentTarget.style.background = "#2d3748"
                        }
                      }}
                      onMouseLeave={e => {
                        if (currentConversationId !== conv.id) {
                          e.currentTarget.style.background = "transparent"
                        }
                      }}
                    >
                      <div style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#e2e8f0",
                        marginBottom: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {conv.title}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: "#64748b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {conv.messageCount} messages
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv.id, e)}
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: 16,
                          padding: 4,
                          opacity: 0.6
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Sidebar Footer */}
              <div style={{
                padding: 12,
                borderTop: "1px solid #334155",
                fontSize: 11,
                color: "#64748b",
                textAlign: "center"
              }}>
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div style={{ ...cs.wrapper, flex: 1 }}>
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                background: "#334155",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: 18,
                zIndex: 10
              }}
            >
              {showSidebar ? "◀" : "▶"}
            </button>

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
                              <div style={rs.cardScore}>Match: {src.matchScore || src.score}%</div>
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
