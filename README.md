# AI Page Summarizer Chrome Extension

A professional, Manifest V3 Chrome Extension that extracts and summarizes webpage content using Google's Gemini AI.

## 🚀 Features
- **High-Quality Extraction:** Uses heuristic filtering to isolate article content.
- **AI-Powered Summaries:** Generates concise overviews and key insights.
- **Secure Architecture:** Protects API keys via a Node.js proxy server.
- **Fast & Cached:** Stores summaries locally to prevent redundant API calls.
- **Premium UI:** Modern Glassmorphism design with responsive states.

---

## 🛠️ Setup Instructions

### 1. Backend Server Setup
The server acts as a secure bridge to the Gemini AI API.

1. Navigate to the `server/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create/Edit the `.env` file and add your Google Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   ```
   *(Get an API key from [Google AI Studio](https://aistudio.google.com/))*
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Chrome Extension Installation
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle in the top right corner).
3. Click **Load unpacked**.
4. Select the `extension/` folder from this repository.
5. The "AI Page Summarizer" icon should now appear in your extensions list.

---

## 🏗️ Architecture & Security

### Secure API Handling
To comply with security best practices, the extension **never** stores or transmits the AI API key.
- **Frontend:** Responsible only for UI and DOM extraction.
- **Background Script:** Acts as a dispatcher, sending content to the local proxy server.
- **Proxy Server (Node.js):** Securely holds the `GEMINI_API_KEY` and communicates with Google's servers.

### Content Extraction
The extension uses a multi-layered heuristic approach in `content.js`:
1. It looks for semantic tags like `<article>`, `<main>`, or `.post-content`.
2. If those aren't found, it identifies the DOM node with the highest text density.
3. It clones the node and strips away "noise" (ads, scripts, navbars) before sending it for summarization.

### Data Caching
Summaries are cached in `chrome.storage.local` keyed by the URL. This ensures that if you re-open the popup on the same page, the summary is instant and doesn't consume API credits.

---

## 🔧 Technical Details
- **Manifest Version:** 3
- **Language:** JavaScript (ES6+), CSS3 (Variables + Flexbox)
- **AI Model:** Gemini 1.5 Flash (optimized for speed and summarization)
- **Host Permissions:** Limited to `localhost:3000` to maintain a tight security perimeter.
