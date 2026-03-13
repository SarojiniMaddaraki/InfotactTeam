import { useState } from "react"
import { loginStyles as s, badgeStyle } from "../styles/Login.styles"

const API_BASE = import.meta.env.PROD 
  ? "https://infotactteam.onrender.com"
  : "http://localhost:5000"

export default function Signup({ onSwitch, onAuth }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError("")
    if (!form.name || !form.email || !form.password)
      return setError("All fields are required")

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || "Signup failed")

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
        <p style={s.subtitle}>Create your account</p>

        {error && <div style={s.error}>⚠️ {error}</div>}

        <div style={s.field}>
          <label style={s.label}>Name</label>
          <input
            name="name" type="text"
            placeholder="Enter your name"
            value={form.name} onChange={handleChange}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={s.input}
          />
        </div>

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

        <div style={s.field}>
          <label style={s.label}>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{...s.input, cursor: "pointer"}}
          >
            <option value="user">👤 User - Can chat and ask questions</option>
            <option value="admin">👑 Admin - Can also upload documents</option>
          </select>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Creating account..." : "Sign Up →"}
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
          Already have an account?{" "}
          <span onClick={onSwitch} style={s.link}>Sign in</span>
        </p>
      </div>
    </div>
  )
}
