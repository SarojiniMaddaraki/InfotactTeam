# AdVantage Gen – Automated Social Media Campaign Studio

## Project Overview

AdVantage Gen is an AI-powered social media campaign generator developed during the AI Innovation Lab at Infotact Solutions.

The system allows users to enter a single prompt and automatically generate a complete marketing campaign including an AI-generated image, caption, hashtags, and branding elements.

The platform combines image generation and text generation to create ready-to-publish social media creatives for platforms like Instagram and LinkedIn.

---

## System Architecture

The system contains four main components

1. Prompt Processing and Image Generation
2. AI Copywriting Engine
3. Creative Studio Editor
4. Campaign Storage and Remix System

---

## Development Timeline

### Week 1 – Image Generation Engine

Connected the Express backend with Hugging Face Inference API.

Tasks completed

- Prompt enhancement using AI
- Generated images using Flux or SDXL models
- Converted simple prompts into detailed prompts

Result

High quality marketing images generated successfully from multiple prompts.

---

### Week 2 – Copywriting and Branding

Implemented AI caption generation using Gemini API.

Tasks completed

- Caption generation
- Social media hashtag generation
- Brand voice tone selection
- Logo overlay using Sharp or Canvas
- CTA button placement

Result

Logo and CTA were correctly placed across square, vertical, and horizontal images.

---

### Week 3 – Studio UI and Editor

Built a React based editing interface.

Tasks completed

- Drag and drop text elements
- Resize captions
- Move CTA buttons
- Live preview before export

Workflow

Prompt → Generate → Edit → Download

---

### Week 4 – Scaling and Campaign History

Implemented storage and campaign management.

Tasks completed

- Stored campaign data in MongoDB
- Stored images in Cloudinary
- Built Remix feature for campaign variations

Result

Users can regenerate similar campaigns with modified prompts.

---

## Tech Stack

Frontend  
React  
HTML  
CSS  

Backend  
Node.js  
Express.js  

AI Services  
Hugging Face Inference API  
Google Gemini API  

Image Processing  
Sharp  
Canvas  

Database and Storage  
MongoDB Atlas  
Cloudinary  

---

## Features

- AI image generation
- AI caption and hashtag generation
- Automatic branding with logo overlay
- Custom call to action buttons
- Interactive campaign editor
- Campaign history storage
- Remix campaign generation

---

## Future Improvements

- Video ad generation
- Multi platform campaign export
- AI campaign performance insights
- Advanced templates for marketing creatives

---

## Developed At

Infotact Solutions  
AI Innovation Lab
