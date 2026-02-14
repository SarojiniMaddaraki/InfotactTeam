require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect Database
connectDB();

const generateEmbedding = require("./services/embeddingService");

(async () => {
  try {
    const embedding = await generateEmbedding("Test embedding for OpsMind AI");
    console.log("✅ Embedding generated");
    console.log("Vector length:", embedding.length);
  } catch (err) {
    console.error("❌ Embedding failed");
  }
})();


// Middlewares
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 OpsMind AI Backend Running...");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
