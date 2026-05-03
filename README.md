# AI Page Summarizer Chrome Extension

A professional, Manifest V3 Chrome Extension that extracts and summarizes webpage content using Google's Gemini AI. This project follows a secure proxy-based architecture to protect sensitive credentials while delivering a premium user experience.

## 🚀 How to Download and Use

Follow these steps to get the extension running on your local machine.

### 1. Download the Extension

You can download the project in two ways:

- **Via Git**: Clone the repository to your local machine.
  ```bash
  git clone https://github.com/YOUR_USERNAME/hngChromeExtension.git
  ```
- **Via ZIP**: Click the **Code** button on the GitHub repository page and select **Download ZIP**, then extract it to a folder.

---

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (comes with Node.js)
- **Google Chrome Browser**
- **Google Gemini API Key**: Obtain one for free at [Google AI Studio](https://aistudio.google.com/).

### 2. Backend Server Setup

The server acts as a secure bridge to the Gemini AI API, keeping your API keys safe from exposure in the extension frontend.

1.  **Navigate to the server directory**:
    ```bash
    cd server
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    Create a `.env` file in the `server` folder:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    PORT=3000
    ```
4.  **Start the server**:
    ```bash
    npm start
    ```
    _The server will run on `http://localhost:3000`._

### 3. Chrome Extension Installation (Local Load)

Since this is a local extension, you must load it manually:

1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** using the toggle in the top right.
3.  Click the **Load unpacked** button.
4.  Navigate to and select the `extension` folder inside the project directory you downloaded.
5.  The extension is now installed! Pin the "AI Page Summarizer" to your toolbar for easy access.

---

## 🏗️ Architecture Explanation

The project is split into four distinct layers to ensure separation of concerns and security:

1.  **Popup (UI Layer)**:

- Built with modern HTML/CSS.
- Manages user interactions (clicking "Summarize").
- Communicates with the Content Script to trigger data extraction.

2.  **Content Script (Extraction Layer)**:

- Runs in the context of the webpage.
- Uses a custom heuristic engine to identify the "main" content of a page (ignoring headers, footers, and ads).
- Cleans and formats the text before passing it back.

3.  **Background Service Worker (Orchestration Layer)**:

- Acts as the central hub for the extension.
- Manages communication between the popup and the backend server.
- Implements **Local Caching**: Checks `chrome.storage` before making network requests to save API credits and improve speed.

4.  **Node.js Proxy (Backend Layer)**:

- An Express-based API.
- Handles the actual communication with Google's Generative AI SDK.
- Returns structured JSON data to the extension.

---

## 🤖 AI Integration Explanation

This project integrates **Google's Gemini 1.5 Flash** model to provide high-speed, intelligent summarization.

- **Model Choice**: We use `gemini-latest-flash` because of its extremely low latency and high context window, making it ideal for real-time webpage summarization.
- **Prompt Engineering**: The server constructs a sophisticated prompt that instructs the AI to:

1.  Provide a concise 3-5 sentence overview.
2.  Extract 3-5 key insights as bullet points.
3.  Estimate reading time based on content length.
4.  Format the output strictly as a JSON object.

- **Context Management**: To prevent errors with massive webpages, the server automatically truncates content to the first 15,000 characters, ensuring it stays within the model's primary attention span while capturing the most relevant information.
- **Response Parsing**: The backend includes robust logic to extract and parse JSON from the AI's response, even if the model includes conversational text or markdown blocks.

---

## 🛡️ Security Decisions

- **Proxy Architecture**: By moving the AI logic to a backend server, the `GEMINI_API_KEY` is never shipped to the client's browser. This prevents users or malicious actors from stealing your API credits.
- **Helmet.js**: The server uses the `helmet` middleware to set secure HTTP headers, protecting against common web vulnerabilities like XSS and clickjacking.
- **CORS Restrictions**: Cross-Origin Resource Sharing is enabled but can be restricted to specific origins in production to prevent unauthorized access to your API.
- **Input Sanitization**: Content extracted from webpages is cleaned and truncated before being sent to the AI to prevent "Prompt Injection" style attacks and ensure predictable AI behavior.
- **Manifest V3**: The extension is built on the latest Chrome standards, which enforce stricter security policies and better privacy for users.

---

## ⚖️ Trade-offs

- **Local Server vs. Cloud**: Using a local Node.js server makes development easy and cost-free, but requires the user to keep the server running. In a production environment, this would be moved to a serverless function (like Vercel or AWS Lambda).
- **Heuristic Extraction vs. Heavy Libraries**: chose a custom heuristic for content extraction to keep the extension lightweight. While libraries like `Readability.js` are more robust, they significantly increase the bundle size.
- **Flash vs. Pro Model**: Gemini Flash was chosen over Gemini Pro to prioritize speed. While Pro has deeper reasoning, Flash is significantly faster for the specific task of summarization.
- **Stateless Backend**: The server does not store any user data. While this improves privacy and reduces complexity, it means we rely entirely on the extension's local storage for history and caching.
