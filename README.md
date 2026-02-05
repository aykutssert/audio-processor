# Audio Processor & Podcast Admin Panel

Internal admin dashboard designed for automated podcast production. It processes raw content into production-ready assets through AI audio generation, NLP-based timestamp alignment, and automated database integration.

## Core Pipeline

1. **Audio Generation:** Text-to-speech conversion using high-fidelity narration models.
2. **Dynamic Alignment:** Post-processing raw transcripts into natural sentence boundaries with precise millisecond timestamps.
3. **Format Conversion:** Client-side transcoding to production-standard audio containers.
4. **Database Integration:** Sanitized SQL generation for direct metadata insertion.

## Functionality

- **Sentence Alignment:** Uses NLP to regroup fragmented transcripts into grammatically correct sentences while maintaining timing accuracy.
- **Client-Side Processing:** Performs audio conversion and data sanitization directly in the browser.
- **Key Management:** API keys are managed locally within your browser's storage and never sent to a central server.
- **Prompt Management:** Save and reuse prompt templates for consistent content generation.

## Technical Stack

- React + Vite
- Tailwind CSS
- OpenAI API (TTS & Whisper)
- FFmpeg.wasm
- Compromise.js (NLP)

## Setup

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/aykutssert/audio-processor.git
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```

## Screenshots

<div align="center">
  <img src="images/image_1.png" alt="Interface 1" width="45%" />
  <img src="images/image_2.png" alt="Interface 2" width="45%" />
</div>
