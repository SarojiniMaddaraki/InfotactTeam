const express = require("express")
const router = express.Router()
const { upload, ingestPDF, getUploadedFiles } = require("../controllers/ingestionController")
const { verifyAdmin, verifyToken } = require("../middleware/authMiddleware")

// 🔒 Admin only — upload PDF
router.post("/uploads", verifyAdmin, upload.single("file"), ingestPDF)

// ✅ Any logged in user — view uploaded files
router.get("/files", verifyToken, getUploadedFiles)

module.exports = router