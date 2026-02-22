const multer = require("multer")
const pdf = require("pdf-parse/lib/pdf-parse")
const axios = require("axios")
const Chunk = require("../models/Chunk")
const Log = require("../models/Log")
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
const chunkText = (text, chunkSize = 1200, overlap = 400) => {
  const chunks = []
  let start = 0

  while (start < text.length) {
    const end = start + chunkSize
    chunks.push(text.slice(start, end))
    start += chunkSize - overlap
  }

  return chunks
}

// ================= SAFE BATCH EMBEDDING =================
const generateEmbeddingsInBatches = async (chunks, batchSize = 5) => {
  const allEmbeddings = []

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)

    console.log(`⚡ Processing batch ${i / batchSize + 1}`)

    const responses = await Promise.all(
      batch.map(chunk =>
        axios.post("http://127.0.0.1:11434/api/embeddings", {
          model: "nomic-embed-text",
          prompt: chunk,
        })
      )
    )

    responses.forEach(res => {
      allEmbeddings.push(res.data.embedding)
    })
  }

  return allEmbeddings
}

// ================= PDF INGESTION =================
const ingestPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const filePath = req.file.path
    const originalName = req.file.originalname
    const savedFileName = req.file.filename
    const dataBuffer = fs.readFileSync(filePath)

    console.log("📄 Reading PDF...")
    const pdfData = await pdf(dataBuffer)
    const text = pdfData.text

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "PDF contains no readable text" })
    }

    console.log("✂️ Chunking text...")
    const chunks = chunkText(text)

    console.log(`📦 Total chunks: ${chunks.length}`)

    const embeddings = await generateEmbeddingsInBatches(chunks, 5)

    const documents = chunks.map((chunk, index) => ({
      text: chunk,
      embedding: embeddings[index],
    }))

    console.log("💾 Storing in MongoDB...")
    await Chunk.insertMany(documents)

    // ✅ Save upload log
    await Log.create({
      fileName: savedFileName,
      originalName: originalName,
      totalChunks: chunks.length,
      status: "success"
    })

    // Delete uploaded file after processing
    fs.unlinkSync(filePath)

    res.json({
      message: "PDF processed successfully ✅",
      totalChunks: chunks.length,
      file: originalName
    })

  } catch (error) {
    console.error("❌ PDF Ingestion Error:", error)
    res.status(500).json({ error: "PDF ingestion failed" })
  }
}

// ================= GET ALL UPLOADED FILES =================
const getUploadedFiles = async (req, res) => {
  try {
    const logs = await Log.find().sort({ uploadedAt: -1 })
    res.json({
      totalFiles: logs.length,
      files: logs.map(log => ({
        fileName: log.originalName,
        totalChunks: log.totalChunks,
        uploadedAt: log.uploadedAt,
        status: log.status
      }))
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch uploaded files" })
  }
}

// ================= EXPORT =================
module.exports = {
  upload,
  ingestPDF,
  getUploadedFiles
}
