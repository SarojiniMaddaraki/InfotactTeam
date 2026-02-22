const mongoose = require("mongoose")

const logSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  totalChunks: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "success"
  }
})

module.exports = mongoose.model("Log", logSchema)
