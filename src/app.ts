import express, { Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import pdfParse from "pdf-parse";

import { extractSyllabusStructure } from "./llm";
import { computePriorities } from "./priority";

export function createApp(extract = extractSyllabusStructure) {
  const app = express();
  app.use(cors()); // Enable CORS for all routes
  app.use(express.json({ limit: "2mb" })); // to accept large text

  // Configure multer for file uploads (PDFs)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });

  // Health check endpoint
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "Calendar MVP API is running",
    });
  });

  // Parse syllabus from text
  app.post("/api/parse-syllabus-text", async (req: Request, res: Response) => {
    try {
      const syllabusText: unknown = req.body?.syllabusText;
      if (!syllabusText) {
        return res.status(400).json({
          error: "syllabusText is required",
          message: "Please provide syllabus text in the request body",
        });
      }

      if (typeof syllabusText !== "string" || syllabusText.trim().length === 0) {
        return res.status(400).json({
          error: "Invalid syllabus text",
          message: "syllabusText must be a non-empty string",
        });
      }

      const parsed = await extract(syllabusText);
      const tasks = computePriorities(parsed);

      return res.json({
        course: parsed.course_name,
        tasks,
        totalTasks: tasks.length,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error parsing syllabus:", err);

      const message = err instanceof Error ? err.message : undefined;

      // Handle specific error types
      if (message?.includes("JSON")) {
        return res.status(500).json({
          error: "Failed to parse syllabus structure",
          message: "The LLM response could not be parsed. Please try again.",
          details:
            process.env.NODE_ENV === "development" ? message : undefined,
        });
      }

      if (message?.includes("API key")) {
        return res.status(500).json({
          error: "OpenAI API error",
          message: "Invalid or missing OpenAI API key",
        });
      }

      return res.status(500).json({
        error: "Failed to parse syllabus",
        message: message || "An unexpected error occurred",
      });
    }
  });

  // Parse syllabus from PDF upload
  app.post(
    "/api/parse-syllabus-pdf",
    upload.single("pdf"),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            error: "PDF file is required",
            message:
              "Please upload a PDF file with the field name 'pdf'",
          });
        }

        if (req.file.mimetype !== "application/pdf") {
          return res.status(400).json({
            error: "Invalid file type",
            message: "Only PDF files are supported",
          });
        }

        // Extract text from PDF
        const pdfData = await pdfParse(req.file.buffer);
        const syllabusText = pdfData.text;

        if (!syllabusText || syllabusText.trim().length === 0) {
          return res.status(400).json({
            error: "Empty PDF",
            message:
              "The PDF file appears to be empty or could not be read",
          });
        }

        // Parse the extracted text
        const parsed = await extract(syllabusText);
        const tasks = computePriorities(parsed);

        return res.json({
          course: parsed.course_name,
          tasks,
          totalTasks: tasks.length,
          source: "pdf",
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error parsing PDF:", err);

        const message = err instanceof Error ? err.message : undefined;

        if (message?.includes("Invalid PDF")) {
          return res.status(400).json({
            error: "Invalid PDF file",
            message: "The uploaded file is not a valid PDF",
          });
        }

        return res.status(500).json({
          error: "Failed to parse PDF syllabus",
          message: message || "An unexpected error occurred",
        });
      }
    }
  );

  return app;
}

export const app = createApp();
