const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")
const conversationRoutes = require("./routes/conversationRoutes")


connectDB()

const app = express()

// ================= MIDDLEWARES =================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://opsmindai-nu.vercel.app"
  ],
  credentials: true
}))

app.use(express.json())

// Serve uploaded files
app.use("/uploads", express.static("uploads"))

// ================= ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/ingest", require("./routes/ingestionRoutes"))
app.use("/api/rag", require("./routes/ragRoutes"))
app.use("/api/conversations", conversationRoutes)  // ✅ Correct

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.json({ message: "OpsMind AI Backend Running ✅" })
})

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message)

  if (err.message.includes("Only PDF and TXT")) {
    return res.status(400).json({ error: err.message })
  }

  res.status(500).json({ error: "Internal Server Error" })
})

// ================= START SERVER =================
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})