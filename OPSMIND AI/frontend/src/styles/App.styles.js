// ─── HEADER ──────────────────────────────────────────────
export const headerStyles = {
  header: {
    background: "linear-gradient(135deg, #1e3a5f, #1e40af)",
    padding: "12px 32px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.4)"
  },
  logoBox: {
    width: 38,
    height: 38,
    background: "#3b82f6",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20
  },
  appName: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff"
  },
  appTagline: {
    fontSize: 11,
    color: "#93c5fd"
  },
  tabsGroup: {
    marginLeft: 24,
    display: "flex",
    gap: 6
  },
  userArea: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 12
  },
  userName: {
    fontSize: 13,
    color: "#e2e8f0",
    fontWeight: "bold"
  },
  logoutBtn: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: 12
  }
}

export const tabBtnStyle = (isActive, isAdmin = false) => ({
  padding: "6px 16px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  background: isActive
    ? (isAdmin ? "#7c3aed" : "#3b82f6")
    : "rgba(255,255,255,0.1)",
  color: "#fff",
  fontWeight: isActive ? "bold" : "normal",
  fontSize: 13
})

export const roleBadgeStyle = (isAdmin) => ({
  fontSize: 10,
  fontWeight: "bold",
  padding: "1px 8px",
  borderRadius: 10,
  background: isAdmin ? "#4c1d95" : "#14532d",
  color: isAdmin ? "#c4b5fd" : "#86efac",
  display: "inline-block"
})

// ─── CHAT ──────────────────────────────────────────────
export const chatStyles = {
  wrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxWidth: 860,
    width: "100%",
    margin: "0 auto",
    padding: "0 24px",
    height: "calc(100vh - 66px)"
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    paddingTop: 24,
    paddingBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 20
  },
  emptyState: {
    textAlign: "center",
    marginTop: 100,
    color: "#64748b"
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#94a3b8"
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 8
  },
  inputBar: {
    padding: "12px 0 20px",
    borderTop: "1px solid #1e293b",
    display: "flex",
    gap: 10
  },
  input: {
    flex: 1,
    padding: "13px 18px",
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none"
  }
}

export const askBtnStyle = (disabled) => ({
  padding: "13px 28px",
  borderRadius: 12,
  border: "none",
  background: disabled ? "#1e293b" : "#2563eb",
  color: disabled ? "#475569" : "#fff",
  fontWeight: "bold",
  fontSize: 14,
  cursor: disabled ? "not-allowed" : "pointer"
})

// ─── MESSAGE BUBBLES ──────────────────────────────────────────────
export const bubbleStyle = (role, isGuardrail) => ({
  padding: "12px 18px",
  borderRadius: role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  background: role === "user" ? "#2563eb" : isGuardrail ? "#3b1a08" : "#1e293b",
  border: role === "assistant"
    ? (isGuardrail ? "1px solid #92400e" : "1px solid #334155")
    : "none",
  fontSize: 14,
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word"
})

// ─── REFERENCE CARDS ──────────────────────────────────────────────
export const refStyles = {
  wrapper: {
    marginTop: 10
  },
  label: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "bold"
  },
  cardsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  },
  card: {
    background: "#0f2744",
    border: "1px solid #1e40af",
    borderRadius: 10,
    padding: "8px 14px",
    fontSize: 12
  },
  cardFile: {
    color: "#60a5fa",
    fontWeight: "bold"
  },
  cardPage: {
    color: "#94a3b8",
    marginTop: 3
  },
  cardScore: {
    color: "#475569",
    marginTop: 3
  }
}

// ─── FILES TAB ──────────────────────────────────────────────
export const filesStyles = {
  wrapper: {
    maxWidth: 860,
    width: "100%",
    margin: "0 auto",
    padding: 32
  },
  uploadBox: {
    background: "#1e293b",
    border: "2px dashed #334155",
    borderRadius: 16,
    padding: 40,
    textAlign: "center",
    marginBottom: 32
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 12
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#94a3b8",
    marginBottom: 6
  },
  uploadSubtitle: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 20
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#475569",
    marginBottom: 14
  },
  fileList: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  fileCard: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 12,
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16
  },
  fileIcon: {
    fontSize: 30
  },
  fileName: {
    fontWeight: "bold",
    fontSize: 14
  },
  fileMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3
  },
  indexedBadge: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: "bold",
    background: "#14532d",
    color: "#86efac"
  }
}

export const uploadBtnStyle = (uploading) => ({
  padding: "11px 32px",
  background: uploading ? "#1e40af" : "#7c3aed",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: 14,
  color: "#fff"
})