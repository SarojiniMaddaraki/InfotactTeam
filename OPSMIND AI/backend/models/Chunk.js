const mongoose = require("mongoose")

const chunkSchema = new mongoose.Schema({
  text: String,
  embedding: {
    type: [Number],
    required: true
  }
})

module.exports = mongoose.model("Chunk", chunkSchema)
