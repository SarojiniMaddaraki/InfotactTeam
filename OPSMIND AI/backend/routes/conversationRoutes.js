const express = require("express")
const router = express.Router()
const {
  createConversation,
  getUserConversations,
  getConversation,
  addMessage,
  deleteConversation,
  updateTitle,
  clearAllConversations
} = require("../controllers/conversationController")
const { verifyToken } = require("../middleware/authMiddleware")

// All conversation routes require authentication
router.post("/", verifyToken, createConversation)
router.get("/", verifyToken, getUserConversations)
router.get("/:conversationId", verifyToken, getConversation)
router.post("/:conversationId/messages", verifyToken, addMessage)
router.put("/:conversationId/title", verifyToken, updateTitle)
router.delete("/:conversationId", verifyToken, deleteConversation)
router.delete("/", verifyToken, clearAllConversations)

module.exports = router