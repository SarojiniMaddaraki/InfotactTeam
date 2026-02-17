const express = require('express')
const router = express.Router()
const { addDocument, askQuestion, searchDocuments } = require('../controllers/ragController')

router.post('/add', addDocument)
router.post('/ask', askQuestion)
router.post('/search', searchDocuments)   // 👈 ADD THIS

module.exports = router
