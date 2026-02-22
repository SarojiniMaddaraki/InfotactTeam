const axios = require("axios")
const Chunk = require("../models/Chunk")

const search = async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({ error: "Query is required" })
    }

    // 1️⃣ Generate embedding for user querya
    const embeddingResponse = await axios.post(
      "http://127.0.0.1:11434/api/embeddings",
      {
        model: "nomic-embed-text",
        prompt: query,
      }
    )

    const queryEmbedding = embeddingResponse.data.embedding

    // 2️⃣ MongoDB Atlas Vector Search
    const results = await Chunk.aggregate([
      {
        $vectorSearch: {
          index: "chunks", // 🔥 IMPORTANT: use your index name here
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: 3,
        },
      },
      {
        $project: {
          text: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ])

    res.json({
      query,
      results,
    })

  } catch (error) {
    console.error("Search Error:", error)
    res.status(500).json({ error: "Search failed" })
  }
}

module.exports = { search }
