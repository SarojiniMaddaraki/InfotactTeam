# OPSMIND AI – Intelligent SOP Assistant

## 📌 Project Overview

**OPSMIND AI** is an AI-powered SOP assistant developed during the **AI Innovation Lab at Infotact Solutions**.
The system allows users to upload documents, perform semantic search on the content, and interact with an AI chatbot that provides accurate answers based on retrieved context.

The project implements a **Retrieval-Augmented Generation (RAG)** architecture using embeddings, vector search, and a large language model.

---

# 🧠 System Architecture

The system consists of four main layers:

1. Knowledge Ingestion Layer
2. Retrieval Engine
3. Chat Interface & Response Generation
4. Optimization & Deployment

---

# 📅 Development Timeline

## Week 1 – Knowledge Ingestion Layer

The first stage focused on building the document processing and vector storage pipeline.

### Key Features

* File upload service using **Multer**
* PDF parsing and text extraction
* Splitting text into **1000-character overlapping chunks**
* Generating embeddings using **text-embedding-004**
* Storing vectors in **MongoDB Atlas**
* Creating **Atlas Vector Search Index**

### Verification

* Stored vectors successfully
* Indexed embeddings using MongoDB Atlas
* Confirmed vectors are searchable and retrievable

---

## Week 2 – Retrieval Engine Core

The second stage implemented semantic search and prompt construction.

### Key Features

* Implemented **MongoDB Aggregation Pipeline**
* Used **$vectorSearch operator** for similarity search
* Retrieved **Top 3 relevant chunks**
* Built **LangChain prompt pipeline**

### Prompt Construction

User Query + Retrieved Context → Structured System Prompt → LLM

### Validation Test

Query Example:

```
Refund Policy
```

Result:

* Correct paragraph retrieved
* Context passed to the LLM for accurate generation

---

## Week 3 – Chat Interface & AI Response

The third stage focused on building the interactive AI interface.

### Key Features

* Integrated **Gemini 1.5 Flash** for fast responses
* Implemented **Server-Sent Events (SSE)** for response streaming
* Built **React frontend chat interface**
* Added **Reference Cards** to show document citations

### Hallucination Prevention Test

If the user asks a question **not present in the SOP documents**, the AI:

* Refuses to answer OR
* Responds with **"No relevant context found."**

This ensures the system remains reliable and avoids hallucinations.

---

## Week 4 – Optimization & Deployment

The final stage focused on improving usability and deploying the application.

### Key Features

* Chat history persistence using **MongoDB**
* Context-aware follow-up questions
* Role-based access and security improvements
* Full stack deployment to:

  * **Vercel** (Frontend)
  * **Render** (Backend)

### Final Testing

* Conducted **End-to-End User Acceptance Testing (UAT)**
* Non-technical users validated the chatbot usability and accuracy

---

# 🛠️ Tech Stack

### Frontend

* React
* Server-Sent Events (SSE)

### Backend

* Node.js
* Express.js
* Multer

### AI & NLP

* LangChain
* Gemini 1.5 Flash
* Embeddings (text-embedding-004)

### Database

* MongoDB Atlas
* Vector Search

### Deployment

* Vercel
* Render

---

# 🚀 Features

* Document upload and processing
* Semantic search using vector embeddings
* AI chatbot with contextual answers
* Real-time streaming responses
* Citation-based answers
* Chat history persistence
* Secure role-based access

---

# 🔍 Future Improvements

* Multi-document ingestion
* Support for additional file formats
* Advanced prompt optimization
* Analytics dashboard for query insights

---

# 👨‍💻 Developed At

**Infotact Solutions – AI Innovation Lab**

Confidential Project Documentation
