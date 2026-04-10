/**
 * AI Resume Analyzer - Backend Server
 * Express.js server for handling resume uploads, PDF parsing, and AI analysis
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config();

// Import custom modules
const { extractTextFromDocument } = require("./src/documentParser");
const { analyzeResumeWithAI } = require("./src/aiAnalyzer");
const { validateUpload } = require("./src/validators");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "resume-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimetypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc (older format)
    ];

    const allowedExtensions = [".pdf", ".docx", ".doc"];
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (
      allowedMimetypes.includes(file.mimetype) ||
      allowedExtensions.includes(fileExt)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents (DOCX) are allowed"));
    }
  },
});

// Routes

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

/**
 * Main resume analysis endpoint
 * POST /api/analyze-resume
 * Accepts: PDF or Word documents (DOCX)
 * Returns: Structured JSON with AI analysis
 */
app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get job type from form data
    const jobType = req.body.jobType || "general";

    console.log(
      `Processing file: ${req.file.filename} (${req.file.mimetype}) for job: ${jobType}`,
    );

    // Extract text from document (PDF, DOCX, etc.)
    const filePath = req.file.path;
    const resumeText = await extractTextFromDocument(
      filePath,
      req.file.mimetype,
    );

    if (!resumeText || resumeText.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Could not extract text from document" });
    }

    // Validate extracted text
    const validationError = validateUpload(resumeText);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    console.log(`Extracted text length: ${resumeText.length} characters`);

    // Send to AI for analysis with job type
    const analysis = await analyzeResumeWithAI(resumeText, jobType);

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    // Return analysis results
    res.json({
      success: true,
      analysis: analysis,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error in /api/analyze-resume:", error);

    // Clean up file if it exists
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(500).json({
      error: "Failed to analyze resume",
      details: error.message,
    });
  }
});

/**
 * Error handling middleware
 */
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "FILE_TOO_LARGE") {
      return res.status(400).json({ error: "File size exceeds 5MB limit" });
    }
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({
    error: "Internal server error",
    details: error.message,
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Resume Analyzer Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
