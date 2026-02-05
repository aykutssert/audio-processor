# Audio Processor (Podcast Tool)

This repository serves as an **Internal Admin Panel** for an active, live production project. It is used to manage and automate podcast production workflows, providing a streamlined interface for audio generation, data processing, and database management.


A professional tool designed to automate the podcast production workflow. It manages the entire process from audio generation to SQL outputs using OpenAI TTS, Whisper, and FFmpeg.


## Features

- **Audio Generation:** Create high-quality audio files from text using OpenAI TTS (Text-to-Speech).
- **NLP Timestamp Alignment:** Automatically aligns raw Whisper timestamp data into natural sentence boundaries using NLP (compromise.js).
### Production Utilities
- **FFmpeg Integration:** Encodes audio to high-efficiency M4A containers directly in the client.
- **SQL Sanitization:** Automatically handles escaping and JSONB formatting for complex metadata stored in PostgreSQL.
- **Prompt Management:** You can save and manage your frequently used prompt templates to ensure consistency across different podcast episodes.
- **Easy Deployment:** The project can be easily deployed using platforms like Vercel or Netlify (Hobby plans), allowing you to host and use it for your own production needs at no cost.
- **Secure:** Your API keys are not stored in the codebase. They are safely kept in your browser's local storage.

## Screenshots

![Step 1](images/image_1.png)
![Step 2](images/image_2.png)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aykutssert/audio-processor.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```

## Technologies

- React + Vite
- Tailwind CSS
- OpenAI API (TTS & Whisper)
- FFmpeg.wasm
- Compromise.js (NLP)
