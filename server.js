// server.js
import "dotenv/config"; // Load .env before any other imports
import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import { createRequire } from "module";
import { extractSyllabusStructure } from "./llm.js";
import { computePriorities } from "./priority.js";
import { networkInterfaces } from "os";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const app = express();
app.use(bodyParser.json({ limit: "2mb" })); // to accept large text

// Configure multer for file uploads (PDFs)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const PORT = process.env.PORT || 3000;

// Helper function to get local network IP
function getLocalIP() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, () => {
  const localIP = getLocalIP();
  console.log(`Server listening on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://${localIP}:${PORT}`);
  console.log(`\nFor Expo app, use: http://${localIP}:${PORT}`);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "Calendar MVP API is running"
  });
});

// Parse syllabus from text
app.post("/api/parse-syllabus-text", async (req, res) => {
  try {
    const { syllabusText } = req.body;
    if (!syllabusText) {
      return res.status(400).json({ 
        error: "syllabusText is required",
        message: "Please provide syllabus text in the request body"
      });
    }

    if (typeof syllabusText !== 'string' || syllabusText.trim().length === 0) {
      return res.status(400).json({ 
        error: "Invalid syllabus text",
        message: "syllabusText must be a non-empty string"
      });
    }

    const parsed = await extractSyllabusStructure(syllabusText);
    const tasks = computePriorities(parsed);

    res.json({
      course: parsed.course_name,
      tasks,
      totalTasks: tasks.length
    });
  } catch (err) {
    console.error("Error parsing syllabus:", err);
    
    // Handle specific error types
    if (err.message?.includes("JSON")) {
      return res.status(500).json({ 
        error: "Failed to parse syllabus structure",
        message: "The LLM response could not be parsed. Please try again.",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    if (err.message?.includes("API key")) {
      return res.status(500).json({ 
        error: "OpenAI API error",
        message: "Invalid or missing OpenAI API key"
      });
    }

    res.status(500).json({ 
      error: "Failed to parse syllabus",
      message: err.message || "An unexpected error occurred"
    });
  }
});

// Parse syllabus from PDF upload
app.post("/api/parse-syllabus-pdf", upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: "PDF file is required",
        message: "Please upload a PDF file with the field name 'pdf'"
      });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ 
        error: "Invalid file type",
        message: "Only PDF files are supported"
      });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const syllabusText = pdfData.text;

    if (!syllabusText || syllabusText.trim().length === 0) {
      return res.status(400).json({ 
        error: "Empty PDF",
        message: "The PDF file appears to be empty or could not be read"
      });
    }

    // Parse the extracted text
    const parsed = await extractSyllabusStructure(syllabusText);
    const tasks = computePriorities(parsed);

    res.json({
      course: parsed.course_name,
      tasks,
      totalTasks: tasks.length,
      source: "pdf"
    });
  } catch (err) {
    console.error("Error parsing PDF:", err);
    
    if (err.message?.includes("Invalid PDF")) {
      return res.status(400).json({ 
        error: "Invalid PDF file",
        message: "The uploaded file is not a valid PDF"
      });
    }

    res.status(500).json({ 
      error: "Failed to parse PDF syllabus",
      message: err.message || "An unexpected error occurred"
    });
  }
});
