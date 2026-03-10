const Conversation = require("../models/Conversation")

// ================= CREATE NEW CONVERSATION =================
const createConversation = async (req, res) => {
  try {
    const userId = req.user.id
    const { title } = req.body

    const conversation = await Conversation.create({
      userId,
      title: title || "New Conversation",
      messages: []
    })

    res.status(201).json({
      success: true,
      message: "Conversation created",
      conversation: {
        id: conversation._id,
        title: conversation.title,
        createdAt: conversation.createdAt
      }
    })

  } catch (error) {
    console.error("Create conversation error:", error)
    res.status(500).json({ error: "Failed to create conversation" })
  }
}

// ================= GET USER'S CONVERSATIONS =================
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 20, skip = 0 } = req.query

    const conversations = await Conversation.find({ 
      userId,
      isActive: true 
    })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('_id title createdAt updatedAt messages')

    // Add message count and last message preview
    const conversationsWithMeta = conversations.map(conv => ({
      id: conv._id,
      title: conv.title,
      messageCount: conv.messages.length,
      lastMessage: conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1].content.substring(0, 100)
        : null,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    }))

    res.json({
      success: true,
      count: conversationsWithMeta.length,
      conversations: conversationsWithMeta
    })

  } catch (error) {
    console.error("Get conversations error:", error)
    res.status(500).json({ error: "Failed to fetch conversations" })
  }
}

// ================= GET SINGLE CONVERSATION =================
const getConversation = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    })

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" })
    }

    res.json({
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    })

  } catch (error) {
    console.error("Get conversation error:", error)
    res.status(500).json({ error: "Failed to fetch conversation" })
  }
}

// ================= ADD MESSAGE TO CONVERSATION =================
const addMessage = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params
    const { role, content, sources = [], isGuardrail = false } = req.body

    if (!role || !content) {
      return res.status(400).json({ error: "Role and content are required" })
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    })

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" })
    }

    const newMessage = {
      role,
      content,
      sources,
      isGuardrail,
      timestamp: new Date()
    }

    conversation.messages.push(newMessage)
    conversation.updatedAt = new Date()
    
    await conversation.save()

    res.json({
      success: true,
      message: "Message added",
      conversation: {
        id: conversation._id,
        messageCount: conversation.messages.length
      }
    })

  } catch (error) {
    console.error("Add message error:", error)
    res.status(500).json({ error: "Failed to add message" })
  }
}

// ================= DELETE CONVERSATION =================
const deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    })

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" })
    }

    // Soft delete
    conversation.isActive = false
    await conversation.save()

    res.json({
      success: true,
      message: "Conversation deleted"
    })

  } catch (error) {
    console.error("Delete conversation error:", error)
    res.status(500).json({ error: "Failed to delete conversation" })
  }
}

// ================= UPDATE CONVERSATION TITLE =================
const updateTitle = async (req, res) => {
  try {
    const userId = req.user.id
    const { conversationId } = req.params
    const { title } = req.body

    if (!title) {
      return res.status(400).json({ error: "Title is required" })
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    })

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" })
    }

    conversation.title = title
    await conversation.save()

    res.json({
      success: true,
      message: "Title updated",
      conversation: {
        id: conversation._id,
        title: conversation.title
      }
    })

  } catch (error) {
    console.error("Update title error:", error)
    res.status(500).json({ error: "Failed to update title" })
  }
}

// ================= CLEAR ALL CONVERSATIONS =================
const clearAllConversations = async (req, res) => {
  try {
    const userId = req.user.id

    await Conversation.updateMany(
      { userId },
      { isActive: false }
    )

    res.json({
      success: true,
      message: "All conversations cleared"
    })

  } catch (error) {
    console.error("Clear conversations error:", error)
    res.status(500).json({ error: "Failed to clear conversations" })
  }
}

// ================= GET CONVERSATION CONTEXT (for follow-up questions) =================
const getConversationContext = async (conversationId, userId, lastN = 5) => {
  try {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    })

    if (!conversation) {
      return []
    }

    // Get last N messages for context
    const recentMessages = conversation.messages.slice(-lastN)
    
    return recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

  } catch (error) {
    console.error("Get context error:", error)
    return []
  }
}

module.exports = {
  createConversation,
  getUserConversations,
  getConversation,
  addMessage,
  deleteConversation,
  updateTitle,
  clearAllConversations,
  getConversationContext
}