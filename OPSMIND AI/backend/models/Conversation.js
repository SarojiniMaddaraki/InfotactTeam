const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sources: {
    type: [{
      fileName: String,
      pageNumber: Number,
      matchScore: String
    }],
    default: []
  },
  isGuardrail: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  title: {
    type: String,
    default: "New Conversation"
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

conversationSchema.index({ userId: 1, createdAt: -1 })
conversationSchema.index({ userId: 1, isActive: 1 })

// ✅ FIXED: Added async keyword
conversationSchema.pre("save", function () {
  if (this.isNew && this.messages.length > 0 && this.title === "New Conversation") {
    const firstQuestion = this.messages.find(m => m.role === "user")

    if (firstQuestion) {
      this.title =
        firstQuestion.content.substring(0, 50) +
        (firstQuestion.content.length > 50 ? "..." : "")
    }
  }
})
module.exports = mongoose.model("Conversation", conversationSchema)