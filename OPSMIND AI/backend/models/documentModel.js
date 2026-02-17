const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
  text: String,
  embedding: [Number]
})

module.exports = mongoose.model('Document', documentSchema)
