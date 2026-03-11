const axios = require("axios")
const Document = require("../models/Document")
const Chunk = require("../models/Chunk")
const { streamGeminiResponse } = require("../services/geminiService")


// ================= ADD DOCUMENT =================
const addDocument = async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ error: "Text is required" })

    const response = await axios.post("http://127.0.0.1:11434/api/embeddings", {
      model: "nomic-embed-text",
      prompt: text,
    })

    const embedding = response.data.embedding
    const newDoc = await Document.create({ text, embedding })

    res.json({ message: "Document added successfully", document: newDoc })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to add document" })
  }
}

// ================= COSINE SIMILARITY =================

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

// ================= SEARCH DOCUMENTS =================
const searchDocuments = async (req, res) => {
  try {
    const { query } = req.body
    if (!query) return res.status(400).json({ error: "Query is required" })

    const response = await axios.post("http://127.0.0.1:11434/api/embeddings", {
      model: "nomic-embed-text",
      prompt: query,
    })

    const queryEmbedding = response.data.embedding

    const [documents, chunks] = await Promise.all([
      Document.find(),
      Chunk.find()
    ])

    const allDocs = [
      ...documents.map(doc => ({ text: doc.text, source: "manual", fileName: "Manual Entry", pageNumber: null, embedding: doc.embedding })),
      ...chunks.map(chunk => ({ text: chunk.text, source: "pdf", fileName: chunk.fileName || "Unknown", pageNumber: chunk.pageNumber || null, embedding: chunk.embedding }))
    ]

    if (!allDocs.length) return res.json({ message: "No documents found" })

    const scoredDocs = allDocs.map(doc => ({
      text: doc.text,
      source: doc.source,
      fileName: doc.fileName,
      pageNumber: doc.pageNumber,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))

    scoredDocs.sort((a, b) => b.score - a.score)

    return res.json({
      query,
      topMatches: scoredDocs.slice(0, 5),
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Search failed" })
  }
}

// ================= ASK QUESTION (WEEK 3 - SSE STREAMING) =================
const askQuestionJSON = async (req, res) => {
  try {
    const { question } = req.body
    if (!question) return res.status(400).json({ error: "Question is required" })

    // ✅ SSE Headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.flushHeaders()

    // 1. Get embedding for question
    const response = await axios.post("http://127.0.0.1:11434/api/embeddings", {
      model: "nomic-embed-text",
      prompt: question,
    })

    const queryEmbedding = response.data.embedding

    // 2. Search both collections
    const [documents, chunks] = await Promise.all([
      Document.find(),
      Chunk.find()
    ])

    const allDocs = [
      ...documents.map(doc => ({
        text: doc.text,
        fileName: "Manual Entry",
        pageNumber: null,
        embedding: doc.embedding
      })),
      ...chunks.map(chunk => ({
        text: chunk.text,
        fileName: chunk.fileName || "Uploaded Document",
        pageNumber: chunk.pageNumber || null,
        embedding: chunk.embedding
      }))
    ]

    if (!allDocs.length) {
      res.write(`data: ${JSON.stringify({ type: "guardrail", answer: "No documents have been uploaded yet. Please upload SOP documents first.", sources: [] })}\n\n`)
      return res.end()
    }

    // 3. Score and rank
    const scoredDocs = allDocs.map(doc => ({
      text: doc.text,
      fileName: doc.fileName,
      pageNumber: doc.pageNumber,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))

    scoredDocs.sort((a, b) => b.score - a.score)

    // 4. Take top 5
    const topDocs = scoredDocs.slice(0, 5)
    const context = topDocs.map(doc => doc.text).join("\n\n")

    // 5. Build citation sources for Reference Cards
    const sources = [...new Map(
      topDocs
        .filter(doc => doc.score > 0.4)
        .map(doc => [`${doc.fileName}-${doc.pageNumber}`, {
          fileName: doc.fileName,
          pageNumber: doc.pageNumber,
          score: Math.round(doc.score * 100)
        }])
    ).values()]

    // 6. Stream Gemini response with guardrail
    await streamGeminiResponse(context, question, sources, res)

  } catch (error) {
    console.error("Ask Error:", error)
    res.write(`data: ${JSON.stringify({ type: "error", message: error.message || "Ask failed" })}\n\n`)
    res.end()
  }
}



// ================= ASK QUESTION (JSON - FOR POSTMAN TESTING) =================
const askQuestion = async (req, res) => {
  try {
    const { question } = req.body
    if (!question) return res.status(400).json({ error: "Question is required" })

    // ✅ ============== STATIC RESPONSES FOR COMMON QUESTIONS ==============
    const questionLower = question.toLowerCase().trim()
    
    // 1. Who are you / What are you / About OpsMind
    if (
      questionLower.includes("who are you") ||
      questionLower.includes("what are you") ||
      questionLower === "introduce yourself" ||
      questionLower.includes("tell me about yourself") ||
      questionLower.includes("about you")
    ) {
      return res.json({
        question,
        answer: "I am OpsMind AI, your Enterprise SOP Neural Brain assistant. I help you find information from your company's uploaded SOP documents, policies, and knowledge base. I can answer questions about procedures, guidelines, and company information based on the documents you've uploaded. How can I assist you today?",
        guardrail: false,
        sources: []
      })
    }

    // 2. What can you do / Capabilities / Help
    if (
      questionLower.includes("what can you do") ||
      questionLower.includes("how can you help") ||
      questionLower.includes("what do you do") ||
      questionLower.includes("your capabilities") ||
      questionLower.includes("what are your features") ||
      questionLower === "help" ||
      questionLower === "?"
    ) {
      return res.json({
        question,
        answer: "I can help you by:\n\n• Answering questions about your company's SOPs and policies\n• Finding specific procedures and guidelines from uploaded documents\n• Locating information across all your knowledge base\n• Providing precise citations with exact page numbers and source files\n• Ensuring accurate responses with hallucination guardrails\n• Saying 'I don't know' when information isn't in your documents\n\nSimply ask me any question about your uploaded documents and I'll search through them to find the answer!",
        guardrail: false,
        sources: []
      })
    }

    // 3. Greetings
    if (
      questionLower === "hello" ||
      questionLower === "hi" ||
      questionLower === "hey" ||
      questionLower === "greetings" ||
      questionLower === "good morning" ||
      questionLower === "good afternoon" ||
      questionLower === "good evening"
    ) {
      return res.json({
        question,
        answer: "Hello! I'm OpsMind AI, your corporate knowledge assistant. How can I help you today? You can ask me questions about your company's documents, policies, and procedures.",
        guardrail: false,
        sources: []
      })
    }

    // 4. Thank you
    if (
      questionLower === "thank you" ||
      questionLower === "thanks" ||
      questionLower === "thank you very much" ||
      questionLower === "thanks a lot" ||
      questionLower.includes("appreciate it")
    ) {
      return res.json({
        question,
        answer: "You're welcome! Feel free to ask me anything else about your company documents.",
        guardrail: false,
        sources: []
      })
    }

    // 5. How are you
    if (
      questionLower.includes("how are you") ||
      questionLower.includes("how do you do") ||
      questionLower.includes("how's it going")
    ) {
      return res.json({
        question,
        answer: "I'm functioning perfectly and ready to help you find information from your documents! What would you like to know?",
        guardrail: false,
        sources: []
      })
    }

    // 6. What is your purpose
    if (
      questionLower.includes("what is your purpose") ||
      questionLower.includes("why do you exist") ||
      questionLower.includes("what's your job")
    ) {
      return res.json({
        question,
        answer: "My purpose is to help employees quickly find accurate information from your company's SOP documents and knowledge base. I eliminate the time wasted searching through folders and files by instantly retrieving relevant information with precise citations.",
        guardrail: false,
        sources: []
      })
    }

    // 7. Who created you / Who made you
    if (
      questionLower.includes("who created you") ||
      questionLower.includes("who made you") ||
      questionLower.includes("who built you") ||
      questionLower.includes("who developed you")
    ) {
      return res.json({
        question,
        answer: "I am OpsMind AI, an Enterprise SOP Neural Brain system designed to help organizations access their corporate knowledge efficiently. I use RAG (Retrieval Augmented Generation) technology to provide accurate, cited answers from your document repository.",
        guardrail: false,
        sources: []
      })
    }

    // 8. Bye / Goodbye
    if (
      questionLower === "bye" ||
      questionLower === "goodbye" ||
      questionLower === "see you" ||
      questionLower === "talk to you later" ||
      questionLower.includes("have a good day")
    ) {
      return res.json({
        question,
        answer: "Goodbye! Feel free to come back anytime you need help with your documents. Have a great day!",
        guardrail: false,
        sources: []
      })
    }

    // 9. What documents do you have
    if (
      questionLower.includes("what documents") ||
      questionLower.includes("which documents") ||
      questionLower.includes("what files") ||
      questionLower.includes("list documents") ||
      questionLower.includes("show documents")
    ) {
      // This will be answered by showing actual uploaded documents
      const chunks = await Chunk.find().distinct('fileName')
      const uniqueFiles = [...new Set(chunks)]
      
      if (uniqueFiles.length === 0) {
        return res.json({
          question,
          answer: "No documents have been uploaded yet. Please upload SOP documents to get started.",
          guardrail: false,
          sources: []
        })
      }

      const fileList = uniqueFiles.map((file, i) => `${i + 1}. ${file}`).join('\n')
      return res.json({
        question,
        answer: `I currently have access to the following documents:\n\n${fileList}\n\nYou can ask me questions about any of these documents!`,
        guardrail: false,
        sources: []
      })
    }

    // 10. How do you work / How does this work
    if (
      questionLower.includes("how do you work") ||
      questionLower.includes("how does this work") ||
      questionLower.includes("explain how you work") ||
      questionLower.includes("how does opsmind work")
    ) {
      return res.json({
        question,
        answer: "Here's how I work:\n\n1. You ask a question\n2. I search through all uploaded documents using semantic similarity\n3. I find the most relevant sections (top 5 matches)\n4. I use AI to generate an answer based ONLY on those sections\n5. I provide citations showing exactly which document and page the answer came from\n6. If I can't find the answer in your documents, I honestly say 'I don't know'\n\nThis ensures you get accurate, verifiable answers with sources!",
        guardrail: false,
        sources: []
      })
    }

    // ✅ ============== END OF STATIC RESPONSES ==============

    // Continue with normal RAG pipeline for document-based questions

    // 1. Get embedding
    const response = await axios.post("http://127.0.0.1:11434/api/embeddings", {
      model: "nomic-embed-text",
      prompt: question,
    })

    const queryEmbedding = response.data.embedding

    // 2. Search both collections
    const [documents, chunks] = await Promise.all([
      Document.find(),
      Chunk.find()
    ])

    const allDocs = [
      ...documents.map(doc => ({ text: doc.text, fileName: "Manual Entry", pageNumber: null, embedding: doc.embedding })),
      ...chunks.map(chunk => ({ text: chunk.text, fileName: chunk.fileName || "Uploaded Document", pageNumber: chunk.pageNumber || null, embedding: chunk.embedding }))
    ]

    if (!allDocs.length) {
      return res.json({ 
        question,
        answer: "No documents have been uploaded yet. Please upload SOP documents to get started.", 
        guardrail: false,
        sources: [] 
      })
    }

    // 3. Score and rank
    const scoredDocs = allDocs.map(doc => ({
      text: doc.text,
      fileName: doc.fileName,
      pageNumber: doc.pageNumber,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))
    scoredDocs.sort((a, b) => b.score - a.score)

    const topDocs = scoredDocs.slice(0, 5)
    const context = topDocs.map(doc => doc.text).join("\n\n")

    // 4. Build sources
    const sources = [...new Map(
      topDocs
        .filter(doc => doc.score > 0.4)
        .map(doc => [`${doc.fileName}-${doc.pageNumber}`, {
          fileName: doc.fileName,
          pageNumber: doc.pageNumber,
          matchScore: `${Math.round(doc.score * 100)}%`
        }])
    ).values()]

    // 5. Hallucination guardrail check
    const { GoogleGenAI } = require("@google/genai")
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const relevanceCheck = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Does this context contain enough info to answer the question? Reply YES or NO only.\n\nContext: ${context}\n\nQuestion: ${question}`,
    })

    const isRelevant = relevanceCheck.text.trim().toUpperCase().includes("YES")

    if (!isRelevant) {
      return res.json({
        question,
        answer: "I don't know. This information is not available in the uploaded SOP documents.",
        guardrail: true,
        sources: []
      })
    }

    // 6. Generate answer
    const answerRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are OpsMind AI. Answer ONLY from the context below. Be clear and professional.\n\nContext:\n${context}\n\nQuestion: ${question}\n\nAnswer:`,
    })

    return res.json({
      question,
      answer: answerRes.text.trim(),
      guardrail: false,
      sources
    })

  } catch (error) {
    console.error("Ask JSON Error:", error)
    res.status(500).json({ error: "Ask failed" })
  }
}

module.exports = { addDocument, searchDocuments, askQuestionJSON, askQuestion }
