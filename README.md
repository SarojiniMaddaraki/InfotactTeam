# InfotactTeam

# AdVantage Gen – AI Ad Creative & Copy Generator

AdVantage Gen is an **AI-powered social media campaign studio** that automatically generates **ad images, captions, hashtags, and branded creatives** from a single user prompt.  
It is designed for marketers who need fast, high-quality, and scalable ad creation using **Generative AI + MERN Stack**.

---

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Image Generation:** Hugging Face Inference API (Flux / Stable Diffusion)
- **Text Generation:** Gemini 1.5 Flash
- **Image Processing:** Sharp / Canvas
- **AI Prompt Orchestration:** LangChain.js

---

## Core Features

- AI-based image generation
- AI copywriting (caption + hashtags)
- Brand logo overlay & CTA placement
- Multi-platform ad formatting
- Interactive ad editing studio

---



---

## Week 1 – Image Generation Engine

### Objective
Build the **AI image generation pipeline** with enhanced prompts for high-quality visuals.

### Key Features Implemented
- Integration with Hugging Face Image Generation API
- Prompt enhancement using LLM
- Conversion of simple user prompts into detailed visual prompts

### Implementation Details
- User prompt → LLM-enhanced descriptive prompt
- Enhanced prompt → Image generation model
- Generated images returned to frontend

### Success Criteria
- Generate multiple visually consistent images
- High-quality outputs from short and varied prompts

---

## Week 2 – Copywriting & Branding Layer

### Objective
Generate **marketing copy** and apply **brand elements** to images.

### Key Features Implemented
- AI-generated captions and hashtags
- Platform-aware copy (Instagram / LinkedIn)
- Brand logo overlay using Sharp
- CTA badge placement with opacity and scaling

### Implementation Details
- Gemini generates captions based on tone and platform
- Sharp composites:
  - Generated image
  - User logo
  - CTA button
- Supports multiple image aspect ratios

### Success Criteria
- Correct logo placement across all image sizes
- Relevant, engaging captions with optimized hashtags

---

## Week 3 – Creative Studio UI & Editor

### Objective
Provide a **visual editor** for customizing ad creatives before export.

### Key Features Implemented
- Drag, resize, and reposition text elements
- Editable CTA placement
- Real-time preview of final ad
- Download-ready assets

### Implementation Details
- React-based editor using Fabric.js / CSS overlays
- User flow:
  - Prompt → Generate → Edit → Download
- Frontend communicates with backend for regeneration

### Success Criteria
- Smooth end-to-end UX flow
- User-controlled creative customization
- Exported assets ready for social media use

---

## How to Run the Project

### Backend
```bash
cd backend
npm install
npm run dev


## Project Structure (High Level)

