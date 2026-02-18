###OPSMIND AI###


##Week 1 – Knowledge Ingestion Layer

In Week 1, we built the core Knowledge Ingestion and Vector Search pipeline for the RAG system.

## Features Implemented

# PDF Upload Service using Multer

# PDF Text Extraction using pdf-parse

# Text Chunking (1000-character chunks with overlap)

# Embedding Generation using nomic-embed-text

# Vector Storage in MongoDB Atlas

# Vector Search Index created in MongoDB Atlas

# Semantic Search implemented using $vectorSearch

🔄 Workflow
PDF Upload
   ↓
Text Extraction
   ↓
Chunking (1000 chars + overlap)
   ↓
Embedding Generation (768-dimension vectors)
   ↓
Stored in MongoDB Atlas
   ↓
Indexed via Atlas Vector Search
   ↓
Semantic Retrieval via API
