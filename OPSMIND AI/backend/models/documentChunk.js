const mongoose = require("mongoose");

const documentChunkSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },
  chunkText: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number], // Vector field
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional but recommended for faster filtering later
documentChunkSchema.index({ fileName: 1 });

module.exports = mongoose.model("DocumentChunk", documentChunkSchema);

