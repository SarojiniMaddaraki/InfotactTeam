const { Ollama } = require("ollama")

const ollama = new Ollama({ host: "http://127.0.0.1:11434" })

async function generateEmbedding(text) {
  try {
    if (!text || text.trim() === "") {
      throw new Error("Text is required for embedding")
    }

    const response = await ollama.embed({
      model: "nomic-embed-text",
      input: text,
    })

    if (!response.embeddings || !response.embeddings.length) {
      throw new Error("No embedding returned from model")
    }

    return response.embeddings[0]

  } catch (error) {
    console.error("Embedding Service Error:", error.message)
    throw error
  }
}

module.exports = { generateEmbedding }
