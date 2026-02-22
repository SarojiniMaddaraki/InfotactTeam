const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

async function streamGeminiResponse(context, question, res) {
  try {
    const prompt = `
You are a helpful AI assistant. Answer the question using the provided context below.

Instructions:
- Use the context to give a clear, human-readable answer
- Summarize and explain naturally, do not copy text word for word
- If the context contains partial information, use what is available
- Only say you don't know if the context has absolutely no relevant information

Context:
${context}

Question:
${question}

Answer:
`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    })

    res.json({
      answer: response.text,
    })

  } catch (error) {
    console.error("Gemini Error:", error)
    res.status(500).json({ error: "Gemini generation failed" })
  }
}

module.exports = { streamGeminiResponse }
