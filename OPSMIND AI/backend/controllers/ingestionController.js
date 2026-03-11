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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only PDF files are allowed"))
    }
  }
})

// ================= TEXT CHUNKING WITH PAGE TRACKING =================
const chunkTextWithPages = (pages, chunkSize = 1200, overlap = 400) => {
  const chunks = []

  pages.forEach((pageText, pageIndex) => {
    const pageNumber = pageIndex + 1
    let start = 0
    const text = pageText.trim()
    if (!text) return

    while (start < text.length) {
      const end = start + chunkSize
      chunks.push({
        text: text.slice(start, end),
        pageNumber
      })
      start += chunkSize - overlap
    }
  })

  return chunks
}

// ================= SAFE BATCH EMBEDDING =================
const generateEmbeddingsInBatches = async (chunks, batchSize = 5) => {
  const allEmbeddings = []

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}`)

    const responses = await Promise.all(
      batch.map(chunk =>
        axios.post("http://127.0.0.1:11434/api/embeddings", {
          model: "nomic-embed-text",
          prompt: chunk.text,
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
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" })

    const filePath = req.file.path
    const originalName = req.file.originalname
    const savedFileName = req.file.filename
    const dataBuffer = fs.readFileSync(filePath)

    console.log("Reading PDF...")

    const pdfData = await pdf(dataBuffer, {
      pagerender: function (pageData) {
        return pageData.getTextContent().then(function (textContent) {
          return textContent.items.map(item => item.str).join(" ")
        })
      }
    })

    const fullText = pdfData.text

    if (!fullText || fullText.trim().length === 0) {
      return res.status(400).json({ error: "PDF contains no readable text" })
    }

    // Detect pages
    let pages = fullText.split(/\f/)

    if (pages.length === 1) {
      const charsPerPage = 3000
      pages = []
      for (let i = 0; i < fullText.length; i += charsPerPage) {
        pages.push(fullText.slice(i, i + charsPerPage))
      }
    }

    console.log(`Pages detected: ${pages.length}`)

    console.log("Chunking text...")
    const chunks = chunkTextWithPages(pages)
    console.log(`Total chunks: ${chunks.length}`)

    const embeddings = await generateEmbeddingsInBatches(chunks, 5)

    const documents = chunks.map((chunk, index) => ({
      text: chunk.text,
      fileName: savedFileName,
      originalName: originalName,
      pageNumber: chunk.pageNumber,
      embedding: embeddings[index],
    }))

    console.log("Storing in MongoDB...")
    await Chunk.insertMany(documents)

    // Save upload log
    await Log.create({
      fileName: savedFileName,
      originalName: originalName,
      filePath: filePath,
      totalChunks: chunks.length,
      totalPages: pages.length,
      status: "success"
    })

    res.json({
      message: "PDF processed successfully",
      file: originalName,
      savedFileName,
      pages: pages.length,
      totalChunks: chunks.length,
    })

  } catch (error) {
    console.error("PDF Ingestion Error:", error)
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
        savedFileName: log.fileName,
        filePath: log.filePath,
        totalChunks: log.totalChunks,
        totalPages: log.totalPages,
        uploadedAt: log.uploadedAt,
        status: log.status
      }))
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to fetch uploaded files" })
  }
}

module.exports = { upload, ingestPDF, getUploadedFiles }
