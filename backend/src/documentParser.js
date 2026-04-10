/**
 * Document Parser Module
 * Handles extraction of text from PDF and Word documents
 */

const pdf = require("pdf-parse");
const fs = require("fs");
const path = require("path");

/**
 * Dynamically require mammoth if available (handles .docx files)
 */
let mammoth;
try {
  mammoth = require("mammoth");
} catch (err) {
  console.warn(
    "Note: mammoth not installed - DOCX support disabled. Run: npm install mammoth",
  );
  mammoth = null;
}

/**
 * Extract text content from any supported document format
 * @param {string} filePath - Path to the document file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Extracted text from the document
 * @throws {Error} If file type is not supported or parsing fails
 */
async function extractTextFromDocument(filePath, mimeType) {
  try {
    const ext = path.extname(filePath).toLowerCase();

    // Handle PDF files
    if (mimeType === "application/pdf" || ext === ".pdf") {
      return await extractTextFromPDF(filePath);
    }

    // Handle Word files (.docx)
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === ".docx"
    ) {
      return await extractTextFromDOCX(filePath);
    }

    // Handle older Word format (.doc)
    if (mimeType === "application/msword" || ext === ".doc") {
      // Note: .doc format is difficult to parse; encourage .docx
      throw new Error(
        "Legacy .doc format is not supported. Please use .docx format instead.",
      );
    }

    throw new Error(
      `Unsupported file format: ${ext}. Supported formats: PDF, DOCX`,
    );
  } catch (error) {
    console.error("Error parsing document:", error);
    throw new Error(`Failed to parse document: ${error.message}`);
  }
}

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text from the PDF
 * @throws {Error} If PDF parsing fails
 */
async function extractTextFromPDF(filePath) {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF
    const data = await pdf(dataBuffer);

    // Extract text from all pages
    let fullText = "";

    if (data.text) {
      fullText = data.text;
    } else if (data.version) {
      // Fallback: try to extract from pages
      fullText =
        data.pages
          ?.map((page) => page.content?.map((c) => c.str).join(" "))
          .join("\n") || "";
    }

    // Clean up text
    fullText = cleanText(fullText);

    return fullText;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Extract text content from a DOCX file
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} Extracted text from the DOCX
 * @throws {Error} If DOCX parsing fails or mammoth is not installed
 */
async function extractTextFromDOCX(filePath) {
  try {
    if (!mammoth) {
      throw new Error(
        "DOCX support is not enabled. Please install mammoth: npm install mammoth",
      );
    }

    // Read the DOCX file using mammoth
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    // Extract text and clean up
    let fullText = result.value || "";
    fullText = cleanText(fullText);

    // Suppress mammoth internal warnings to avoid confusing logged errors
    // if (result.messages && result.messages.length > 0) { ... }

    return fullText;
  } catch (error) {
    console.error("Error parsing DOCX:", error);
    throw new Error(`Failed to parse DOCX file: ${error.message}`);
  }
}

/**
 * Clean extracted text by removing extra whitespace and normalizing
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text) return "";

  // Remove extra whitespace
  text = text.replace(/\s+/g, " ");

  // Remove control characters
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Trim whitespace
  text = text.trim();

  return text;
}

module.exports = {
  extractTextFromDocument,
  extractTextFromPDF,
  extractTextFromDOCX,
};
