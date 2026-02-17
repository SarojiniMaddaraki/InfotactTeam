const multer = require("multer")
const pdf = require("pdf-parse/lib/pdf-parse")   // 🔥 FIXED
const axios = require("axios")
const Chunk = require("../models/Chunk")
const fs = require("fs")


// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({ storage })

// ================= TEXT CHUNKING =================
const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = []
  let start = 0

  while (start < text.length) {
    const end = start + chunkSize
    chunks.push(text.slice(start, end))
    start += chunkSize - overlap
  }

  return chunks
}

// ================= PDF INGESTION =================
const ingestPDF = async (req, res) => {
  try {
    const filePath = req.file.path
    const dataBuffer = fs.readFileSync(filePath)

    const pdfData = await pdf(dataBuffer)
    const text = pdfData.text

    const chunks = chunkText(text)

    for (const chunk of chunks) {
      const response = await axios.post("http://127.0.0.1:11434/api/embeddings", {
        model: "nomic-embed-text",
        prompt: chunk,
      })

      await Chunk.create({
        text: chunk,
        embedding: response.data.embedding,
      })
    }

    res.json({
      message: "PDF processed successfully",
      totalChunks: chunks.length,
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "PDF ingestion failed" })
  }
}

module.exports = {
  upload,
  ingestPDF,
}
