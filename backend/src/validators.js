/**
 * Validators Module
 * Contains validation functions for resume uploads
 */

/**
 * Validate uploaded resume text
 * @param {string} resumeText - Extracted resume text
 * @returns {string|null} Error message if validation fails, null if valid
 */
function validateUpload(resumeText) {
  // Check if text is provided
  if (!resumeText || typeof resumeText !== "string") {
    return "Resume text is required and must be a string";
  }

  // Check minimum length
  const minLength = 100; // At least 100 characters
  if (resumeText.trim().length < minLength) {
    return `Resume text is too short. Minimum ${minLength} characters required`;
  }

  // Check for common resume keywords to ensure it's likely a resume
  const resumeKeywords = [
    "experience",
    "education",
    "skills",
    "work",
    "employment",
    "qualification",
    "objective",
    "summary",
  ];

  const lowerText = resumeText.toLowerCase();
  const hasResumeKeywords = resumeKeywords.some((keyword) =>
    lowerText.includes(keyword),
  );

  if (!hasResumeKeywords) {
    return "Document does not appear to be a resume. Please upload a valid resume PDF.";
  }

  return null; // No errors
}

/**
 * Validate file object
 * @param {Object} file - Multer file object
 * @returns {boolean} True if file is valid
 */
function isValidFile(file) {
  if (!file) return false;
  if (file.mimetype !== "application/pdf") return false;
  if (!file.size || file.size === 0) return false;
  if (file.size > 5 * 1024 * 1024) return false; // 5MB limit

  return true;
}

/**
 * Sanitize filename
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9.-]/gi, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

module.exports = {
  validateUpload,
  isValidFile,
  sanitizeFilename,
};
