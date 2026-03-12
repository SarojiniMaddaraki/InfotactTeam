const mongoose = require("mongoose")

const chunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    default: "Unknown"
  },
  pageNumber: {
    type: Number,
    default: null
  },
  embedding: {
    type: [Number],
    required: true
  }
})

module.exports = mongoose.model("Chunk", chunkSchema)