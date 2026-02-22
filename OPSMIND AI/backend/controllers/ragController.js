const axios = require("axios")
const Document = require("../models/Document")
const Chunk = require("../models/Chunk")
const { streamGeminiResponse } = require("../services/geminiService")

console.log("🔥 UPDATED RAG CONTROLLER LOADED")

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

    // 🔍 Search BOTH collections
    const [documents, chunks] = await Promise.all([
      Document.find(),
      Chunk.find()
    ])

    const allDocs = [
      ...documents.map(doc => ({ text: doc.text, source: "manual", embedding: doc.embedding })),
      ...chunks.map(chunk => ({ text: chunk.text, source: "pdf", embedding: chunk.embedding }))
    ]

    if (!allDocs.length) {
      return res.json({ message: "No documents found" })
    }

    const scoredDocs = allDocs.map(doc => ({
      text: doc.text,
      source: doc.source,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))

    scoredDocs.sort((a, b) => b.score - a.score)

    return res.json({
      query,
      topMatches: scoredDocs.slice(0, 3),
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Search failed" })
  }
}

// ================= ASK QUESTION (WEEK 3 - STREAMING) =================
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ error: "Question is required" })
    }

    // 🔹 1. Get embedding for question
    const response = await axios.post("http://127.0.0.1:11434/api/embeddings", {
      model: "nomic-embed-text",
      prompt: question,
    })

    const queryEmbedding = response.data.embedding

    // 🔍 Search BOTH collections
    const [documents, chunks] = await Promise.all([
      Document.find(),
      Chunk.find()
    ])

    const allDocs = [
      ...documents.map(doc => ({ text: doc.text, embedding: doc.embedding })),
      ...chunks.map(chunk => ({ text: chunk.text, embedding: chunk.embedding }))
    ]

    if (!allDocs.length) {
      return res.json({ answer: "No documents available." })
    }

    // 🔹 2. Score documents
    const scoredDocs = allDocs.map(doc => ({
      text: doc.text,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))

    scoredDocs.sort((a, b) => b.score - a.score)

    // 🔹 3. Take top 5 for context
    const topDocs = scoredDocs.slice(0, 5)
    const context = topDocs.map(doc => doc.text).join("\n\n")

    // 🔹 4. Stream Gemini response
    await streamGeminiResponse(context, question, res)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Ask failed" })
  }
}

// ================= EXPORT =================
module.exports = {
  addDocument,
  searchDocuments,
  askQuestion,
}
