const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

async function streamGeminiResponse(context, question, sources, res) {
  try {

    const prompt = `You are OpsMind AI, an enterprise SOP assistant.

STRICT RULES:
- Answer ONLY using the provided context
- Be clear and professional  
- If the answer is NOT in the context, respond exactly: "I don't know. This information is not available in the uploaded SOP documents."
- Do NOT use outside knowledge

Context:
${context}

Question: ${question}

Answer:`

    // Single Gemini call — model self-guardrails
    const result = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    })

    let fullAnswer = ""

    for await (const chunk of result) {
      const token = chunk.text
      if (token) {
        fullAnswer += token
        res.write(`data: ${JSON.stringify({ type: "token", token })}\n\n`)
      }
    }

    // Auto-detect guardrail from answer text
    const isGuardrail = fullAnswer.toLowerCase().includes("i don't know")

    res.write(`data: ${JSON.stringify({
      type: "done",
      sources: isGuardrail ? [] : sources
    })}\n\n`)

    res.end()

  } catch (error) {
    console.error("Gemini Error:", error.message)
    res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`)
    res.end()
  }
}

module.exports = { streamGeminiResponse }
