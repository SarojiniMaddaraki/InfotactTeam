const express = require("express")
const router = express.Router()

const {
  addDocument,
  askQuestion,
  searchDocuments
} = require("../controllers/ragController")

// Add document manually
router.post("/add", addDocument)

// Ask question (Full RAG with Gemini)
router.post("/ask", askQuestion)

// Only vector search (No LLM)
router.post("/search", searchDocuments)

module.exports = router
