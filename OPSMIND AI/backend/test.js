const { Ollama } = require('ollama')

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })

async function run() {
  try {
    const response = await ollama.embed({
      model: 'nomic-embed-text',
      input: 'Hello world'
    })

    console.log(response.embeddings[0])
  } catch (error) {
    console.error(error)
  }
}

run()

