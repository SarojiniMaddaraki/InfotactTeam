AdVantage Gen – Automated Social Media Campaign Studio
📌 Project Overview

AdVantage Gen is an AI-powered social media campaign generation platform developed during the AI Innovation Lab at Infotact Solutions.

The system allows users to enter a single creative prompt and automatically generate a complete marketing campaign asset including:

AI-generated promotional image

Optimized social media caption

Platform-specific hashtags

Branding elements like logo and call-to-action buttons

The platform uses multi-modal AI generation by combining image generation models and text generation models to rapidly produce ready-to-publish social media creatives.

This tool helps marketers reduce campaign creation time, enable faster experimentation, and perform A/B testing efficiently.

🧠 System Architecture

The system consists of four major layers:

Prompt Processing & Image Generation

AI Copywriting Engine

Creative Studio Editor

Campaign Storage & Remix System

📅 Development Timeline
Week 1 – Image Generation Engine

The first stage focused on building the AI image generation pipeline and connecting the backend with the Hugging Face inference API.

Key Features

Connected Express backend with Hugging Face Inference API

Implemented prompt enhancement pipeline

Used an LLM to convert short prompts into highly descriptive prompts

Generated marketing-quality visuals using Flux / SDXL models

Verification

Generated multiple high-quality images from different prompts

Ensured visual consistency across different prompt variations

Verified stable API responses and latency performance

Week 2 – Copywriting & Branding Engine

The second stage implemented the AI-powered marketing copy generator and branding automation system.

Key Features

Integrated Gemini API for caption generation

Generated platform-specific hashtags

Implemented brand voice tuning

Available tones:

Witty

Professional

Urgent

Inspirational

Image Branding Pipeline

Implemented Sharp / Canvas processing pipeline to automatically overlay:

Brand logo

CTA badge (e.g., Shop Now)

Marketing design elements

Verification

Tested logo overlay across multiple image formats:

Square

Vertical

Horizontal

Verified consistent placement (bottom-right corner)

Week 3 – Studio UI & Campaign Editor

The third stage focused on building the interactive creative editing studio.

Key Features

Developed React-based campaign editor

Implemented drag-and-drop UI

Added functionality to:

Move text elements

Resize captions

Reposition CTA buttons

Enabled real-time visual preview

Full UX Flow
User Prompt → Generate Campaign → Edit Design → Download Asset
Testing

Verified responsive UI behaviour

Tested editing interactions for text, logo, and CTA positioning

Confirmed smooth export of final campaign assets

Week 4 – Campaign Scaling & History System

The final stage focused on data persistence and campaign management.

Key Features

Implemented MongoDB database storage

Stored campaign metadata including:

User prompt

Generated caption

Hashtags

Image URLs

Integrated Cloudinary for media storage

Developed Remix Feature

Remix Feature

Allows users to:

Re-generate campaign variants

Modify prompt slightly

Produce multiple creative outputs for A/B testing

Final Testing

Performed End-to-End campaign generation tests

Verified campaign history retrieval

Tested remix workflow for generating creative variations

🛠️ Tech Stack
Frontend

React.js

Fabric.js / CSS overlays

HTML

CSS

Backend

Node.js

Express.js

AI & Generative Models

Hugging Face Inference API (Flux / SDXL)

Google Gemini API

Image Processing

Sharp

Canvas

Database & Storage

MongoDB Atlas

Cloudinary

🚀 Features

AI-powered campaign generation from a single prompt

Automated social media caption generation

Platform-optimized hashtags

Multi-modal AI generation (Image + Text)

Automatic branding with logo overlays

Customizable call-to-action buttons

Interactive campaign editing studio

Campaign history storage

Remix feature for campaign variations

🔍 Future Improvements

Multi-platform campaign export

Video advertisement generation

AI-based campaign performance prediction

Advanced design templates

Team collaboration dashboard

Automated A/B testing suggestions

👨‍💻 Developed At

Infotact Solutions – AI Innovation Lab

Product Engineering Project

AdVantage Gen – Automated Social Media Campaign Studio
