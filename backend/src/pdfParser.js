/**
 * PDF Parser Module
 * Handles extraction of text from PDF files
 */

const pdf = require("pdf-parse");
const fs = require("fs");

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
 * Clean extracted text by removing extra whitespace and normalizing
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text) return "";

  // Remove multiple spaces
  text = text.replace(/\s+/g, " ");

  // Remove special characters but keep meaningful punctuation
  text = text.replace(/[^\w\s\-.,()@:#/\n]/g, "");

  // Remove extra newlines
  text = text.replace(/\n\s+/g, "\n");

  // Trim
  text = text.trim();

  return text;
}

module.exports = {
  extractTextFromPDF,
  cleanText,
};
