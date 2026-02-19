const { Ollama } = require("ollama")

const ollama = new Ollama({ host: "http://127.0.0.1:11434" })

async function generateAnswer(context, question) {
  try {
    const response = await ollama.chat({
      model: "phi3", // ✅ Use installed model
      messages: [
        {
          role: "system",
          content: `
You are a helpful AI assistant.

STRICT RULES:
- Use ONLY the provided context.
- Do NOT use outside knowledge.
- If the answer is not found in the context, respond with: "I don't know."
`
        },
        {
          role: "user",
          content: `
Context:
${context}

Question:
${question}
`
        }
      ]
    })

    return response.message.content.trim()

  } catch (error) {
    console.error("Chat Service Error:", error.message)
    return "I don't know."
  }
}

module.exports = { generateAnswer }
