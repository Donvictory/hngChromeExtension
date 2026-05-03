const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/summarize", async (req, res) => {
  try {
    const { content, url, title } = req.body;

    if (!content || content.length < 100) {
      return res.status(400).json({ error: "Content too short to summarize." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are an expert content summarizer. Summarize the following webpage content.
      
      Webpage Title: ${title}
      URL: ${url}
      
      Content:
      ${content.substring(0, 15000)} // Truncate to stay within limits if necessary
      
      Requirements:
      1. Provide a concise 3-5 sentence overview.
      2. Provide 3-5 key insights as bullet points.
      3. Estimate the original reading time in minutes.
      4. Format the output as JSON with the following structure:
         {
           "overview": "...",
           "keyInsights": ["...", "..."],
           "readingTime": "X min read"
         }
      
      Strictly return ONLY the JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON from the AI response
    // Sometimes AI wraps JSON in markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI failed to return valid JSON");
    }

    const summaryData = JSON.parse(jsonMatch[0]);
    res.json(summaryData);
  } catch (error) {
    console.error("Summarization Error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate summary. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
