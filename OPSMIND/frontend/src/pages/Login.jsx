import { useState } from "react"
import { loginStyles as s, badgeStyle } from "../styles/Login.styles"

const API_BASE = "http://localhost:5000"

export default function Login({ onSwitch, onAuth }) {
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError("")
    if (!form.email || !form.password)
      return setError("Email and password are required")

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || "Login failed")

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      onAuth(data.user)
    } catch (e) {
      setError("Server error. Is backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>

        <div style={s.logo}>🧠</div>
        <h1 style={s.title}>OpsMind AI</h1>
        <p style={s.subtitle}>Sign in to your account</p>

        {error && <div style={s.error}>⚠️ {error}</div>}

        <div style={s.field}>
          <label style={s.label}>Email</label>
          <input
            name="email" type="email"
            placeholder="Enter your email"
            value={form.email} onChange={handleChange}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={s.input}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Password</label>
          <div style={s.inputWrap}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password} onChange={handleChange}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ ...s.input, marginBottom: 0 }}
            />
            <span onClick={() => setShowPassword(!showPassword)} style={s.eye}>
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <div style={s.infoBox}>
          <div style={s.infoRow}>
            <span style={badgeStyle("#14532d", "#86efac")}>👤 User</span>
            <span style={s.infoText}>Can chat and ask questions</span>
          </div>
          <div style={s.infoRow}>
            <span style={badgeStyle("#1e1b4b", "#a5b4fc")}>👑 Admin</span>
            <span style={s.infoText}>Can also upload SOP documents</span>
          </div>
        </div>

        <p style={s.switchText}>
          Don't have an account?{" "}
          <span onClick={onSwitch} style={s.link}>Sign up</span>
        </p>
      </div>
    </div>
  )
}