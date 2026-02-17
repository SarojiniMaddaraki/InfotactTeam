const express = require("express")
const router = express.Router()
const { upload, ingestPDF } = require("../controllers/ingestionController")

router.post("/upload", upload.single("file"), ingestPDF)

module.exports = router
