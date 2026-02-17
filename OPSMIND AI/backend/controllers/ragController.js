const axios = require("axios")
const Document = require("../models/Document")

console.log("🔥 CORRECT RAG CONTROLLER LOADED")

// ================= ADD DOCUMENT =================
const addDocument = async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: "Text is required" })
    }

    const response = await axios.post("http://127.0.0.1:11434/api/embeddings", {
      model: "nomic-embed-text",
      prompt: text,
    })

    const embedding = response.data.embedding

    const newDoc = await Document.create({
      text,
      embedding,
    })

    res.json({
      message: "Document added successfully",
      document: newDoc,
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to add document" })
  }
}

// ================= COSINE SIMILARITY =================
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

// ================= SEARCH DOCUMENTS =================
const searchDocuments = async (req, res) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({ error: "Query is required" })
    }

    const response = await axios.post("http://127.0.0.1:11434/api/embeddings", {
      model: "nomic-embed-text",
      prompt: query,
    })

    const queryEmbedding = response.data.embedding
    const documents = await Document.find()

    if (!documents.length) {
      return res.json({ message: "No documents found" })
    }

    let bestMatch = null
    let highestScore = -Infinity

    for (const doc of documents) {
      const score = cosineSimilarity(queryEmbedding, doc.embedding)

      if (score > highestScore) {
        highestScore = score
        bestMatch = doc
      }
    }

    return res.json({
      query,
      bestMatch: bestMatch.text,
      similarityScore: highestScore,
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Search failed" })
  }
}

// ================= EXPORT =================
module.exports = {
  addDocument,
  askQuestion: (req, res) => res.json({ message: "Ask working" }),
  searchDocuments,
}
