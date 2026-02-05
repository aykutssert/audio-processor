# 🎙️ Audio Processor & Podcast Admin Panel

This repository is a production-grade **Internal Admin Panel** designed for a live podcast platform. It streamlines the complex workflow of converting raw content into database-ready assets, combining AI-driven audio generation with advanced post-processing techniques.

---

## 🚀 The Value Proposition

Managing podcast production manually is time-consuming and prone to errors. This tool solves these challenges by providing a unified interface for a 4-step automated pipeline:

1.  **AI Audio Generation:** Leveraging OpenAI's latest TTS models for human-like narration.
2.  **WebAssembly Post-Processing:** Direct in-browser audio conversion to production standards (M4A) via FFmpeg.wasm—no backend required.
3.  **NLP Sentence Alignment:** Solving the "whisper fragment" problem. It intelligently reconstructs transcripts into natural sentence boundaries with precise millisecond timestamps.
4.  **Instant DB Integration:** Generating sanitized SQL INSERT queries ready for PostgreSQL/Supabase deployment.

---

## ✨ Key Features

### 🎧 High-Fidelity Audio Generation
- **Dynamic Voice Selection:** Support for all OpenAI Narrator voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer).
- **Custom Instructions:** Fine-tune narrations with specific instructions for tone and pacing.

### 🧠 Intelligent NLP Post-Processing
- **Sentence-Level Reconstruction:** Uses `compromise.js` to analyze raw Whisper output and group fragments into grammatically correct sentences.
- **Micro-Precision Alignment:** Recalculates character-to-time mappings to ensure audio highlighting remains 100% accurate even after merging text.

### 🛠️ Production Utilities
- **FFmpeg Integration:** Encodes audio to high-efficiency M4A containers directly in the client.
- **SQL Sanitization:** Automatically handles escaping and JSONB formatting for complex metadata stored in PostgreSQL.
- **Prompt Templates:** Save and manage recurring prompt structures to maintain content consistency across episodes.

### 🔒 Privacy-First Architecture
- **Local Key Management:** Your OpenAI and ElevenLabs keys are never sent to a server. They are stored locally in your browser’s `localStorage` and used only for client-side API calls.

---

## 📸 Interface Preview

<div align="center">
  <img src="images/image_1.png" alt="Audio Generation Interface" width="45%" style="margin-right: 10px;" />
  <img src="images/image_2.png" alt="Timestamp & NLP Processing" width="45%" />
</div>

---

## 🛠️ Technical Stack

- **Core:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Dark Mode optimized)
- **Speech Processing:** [OpenAI SDK](https://openai.com/) (TTS-1, Whisper-1)
- **NLP Engine:** [Compromise.js](https://github.com/spencermountain/compromise)
- **Transcoding:** [FFmpeg.wasm](https://ffmpegwasm.netlify.app/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### Installation
1.  **Clone the Repository**
    ```bash
    git clone https://github.com/aykutssert/audio-processor.git
    cd audio-processor
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Run Development Server**
    ```bash
    npm run dev
    ```
4.  **Production Build**
    ```bash
    npm run build
    ```

---

## 📜 License

Internal Use Only - Proprietary Admin Tooling.
