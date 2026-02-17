const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return chunks;
};

module.exports = chunkText;
