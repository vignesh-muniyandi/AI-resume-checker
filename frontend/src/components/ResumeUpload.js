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
  const [selectedJob, setSelectedJob] = useState(""); // Job selection state

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Job descriptions for dropdown
  const jobOptions = [
    { value: "hr", label: "HR (Human Resources)", icon: "👥" },
    { value: "data_analyst", label: "Data Analyst", icon: "📊" },
    { value: "sales", label: "Sales Executive", icon: "📈" },
    { value: "business_analyst", label: "Business Analyst", icon: "💼" },
    { value: "tele_caller", label: "Tele Caller / BPO", icon: "☎️" },
    { value: "developer", label: "Software Developer", icon: "💻" },
  ];

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
    // Validate job selection
    if (!selectedJob) {
      onError("Please select a job position first");
      return;
    }

    // Validate file type - PDF and Word documents
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
    ];

    // Also check file extension for better compatibility
    const fileName = file.name.toLowerCase();
    const allowedExtensions = [".pdf", ".docx", ".doc"];
    const hasValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext),
    );

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      onError("Please upload a PDF or Word document (.pdf, .docx, .doc)");
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
      formData.append("jobType", selectedJob); // Add selected job type

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
        // Include job info in response
        onSuccess({
          ...response.data.analysis,
          jobType: selectedJob,
        });
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
          Select a job position and upload your resume as a PDF or Word document
          to get AI-powered feedback tailored to that role.
        </p>

        {/* Job Selection Dropdown */}
        <div className="job-selection-section">
          <label htmlFor="job-select" className="job-select-label">
            <span className="label-text">Step 1: Select Job Position</span>
          </label>
          <select
            id="job-select"
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="job-select-dropdown"
            disabled={isLoading}
          >
            <option value="">-- Choose a Job Position --</option>
            {jobOptions.map((job) => (
              <option key={job.value} value={job.value}>
                {job.icon} {job.label}
              </option>
            ))}
          </select>
          {selectedJob && (
            <div className="job-selected-badge">
              {jobOptions.find((j) => j.value === selectedJob)?.icon}{" "}
              {jobOptions.find((j) => j.value === selectedJob)?.label} selected
            </div>
          )}
        </div>

        <p className="upload-description" style={{ marginTop: "20px" }}>
          Step 2: Upload your resume
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
            accept=".pdf,.docx,.doc"
            onChange={handleFileSelect}
            disabled={isLoading}
            style={{ display: "none" }}
          />

          <label htmlFor="file-input" className="file-input-label">
            <div className="upload-icon">📄</div>
            <h3>Drag and drop your resume here</h3>
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
            <li>✓ PDF or Word format (.pdf, .docx, .doc)</li>
            <li>✓ File size up to 5MB</li>
            <li>✓ Clear, readable text</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;
