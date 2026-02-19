const cosineSimilarity = require('../utils/cosineSimilarity')
const Document = require('../models/documentModel')

async function findMostSimilar(queryEmbedding) {
  const documents = await Document.find()

  let bestMatch = null
  let highestScore = -Infinity

  for (let doc of documents) {
    const score = cosineSimilarity(queryEmbedding, doc.embedding)

    if (score > highestScore) {
      highestScore = score
      bestMatch = doc
    }
  }

  return bestMatch
}

module.exports = { findMostSimilar }
