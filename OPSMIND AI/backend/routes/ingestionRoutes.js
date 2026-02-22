const express = require("express")
const router = express.Router()
const { upload, ingestPDF, getUploadedFiles } = require("../controllers/ingestionController")

// Upload PDF
router.post("/upload", upload.single("file"), ingestPDF)

// Get all uploaded files
router.get("/files", getUploadedFiles)

module.exports = router
