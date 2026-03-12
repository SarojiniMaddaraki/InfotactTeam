const express = require("express")
const router = express.Router()
const { addDocument, askQuestionJSON, askQuestion, searchDocuments } = require("../controllers/ragController")
const { verifyToken } = require("../middleware/authMiddleware")

// All RAG routes require login
router.post("/add", verifyToken, addDocument)
router.post("/ask", verifyToken, askQuestion)
router.post("/query", verifyToken, askQuestionJSON)
router.post("/search", verifyToken, searchDocuments)

module.exports = router