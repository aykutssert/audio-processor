# Audio Processor (Podcast Tool)

A professional tool designed to automate the podcast production workflow. It manages the entire process from audio generation to SQL outputs using OpenAI TTS, Whisper, and FFmpeg.

## Features

- **Audio Generation:** Create high-quality audio files from text using OpenAI TTS (Text-to-Speech).
- **NLP Timestamp Alignment:** Automatically aligns raw Whisper timestamp data into natural sentence boundaries using NLP (compromise.js).
- **Format Conversion:** Convert audio files to desired formats directly in the browser using FFmpeg.wasm.
- **SQL Generation:** Generate ready-to-use SQL INSERT queries for adding data directly to Supabase/PostgreSQL databases.
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
