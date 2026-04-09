/**
 * Resume Upload Component
 * Handles file upload and sends to backend for analysis
 */

import React, { useState } from "react";
import axios from "axios";
import "./ResumeUpload.css";

function ResumeUpload({ onSuccess, onError, isLoading, setIsLoading, error }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  /**
   * Handle drag over
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  /**
   * Handle drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  /**
   * Process and upload file
   */
  const processFile = async (file) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      onError("Please upload a PDF file");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      onError("File size exceeds 5MB limit");
      return;
    }

    setFileName(file.name);
    await uploadResume(file);
  };

  /**
   * Upload resume to backend API
   */
  const uploadResume = async (file) => {
    setIsLoading(true);
    onError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("resume", file);

      // Send to backend
      const response = await axios.post(
        `${API_BASE_URL}/api/analyze-resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 second timeout
        },
      );

      if (response.data.success && response.data.analysis) {
        onSuccess(response.data.analysis);
      } else {
        onError("Failed to analyze resume");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg =
        err.response?.data?.error || err.message || "Failed to upload resume";
      onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload Your Resume</h2>
        <p className="upload-description">
          Upload your resume as a PDF to get AI-powered feedback and suggestions
          for improvement.
        </p>

        {/* Drag and Drop Area */}
        <div
          className={`drag-drop-area ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={isLoading}
            style={{ display: "none" }}
          />

          <label htmlFor="file-input" className="file-input-label">
            <div className="upload-icon">📄</div>
            <h3>Drag and drop your PDF resume here</h3>
            <p>or</p>
            <button
              type="button"
              className="upload-button"
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Choose File"}
            </button>
          </label>
        </div>

        {/* File Name Display */}
        {fileName && (
          <div className="file-info">
            <p>
              📁 <strong>{fileName}</strong>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing your resume...</p>
            <p className="loading-subtitle">This may take a moment</p>
          </div>
        )}

        {/* File Requirements */}
        <div className="requirements">
          <h4>Requirements:</h4>
          <ul>
            <li>✓ PDF format only</li>
            <li>✓ File size up to 5MB</li>
            <li>✓ Clear, readable text</li>
            <li>✓ At least 100 characters</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;
