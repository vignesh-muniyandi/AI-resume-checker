/**
 * Analysis Results Component
 * Displays the AI-generated resume analysis with job-specific feedback
 */

import React from "react";
import "./AnalysisResults.css";

function AnalysisResults({ data, onReset }) {
  if (!data) {
    return null;
  }

  /**
   * Get color for score based on value
   */
  const getScoreColor = (score) => {
    if (score >= 80) return "#4CAF50"; // Green
    if (score >= 60) return "#2196F3"; // Blue
    if (score >= 40) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  /**
   * Get score interpretation
   */
  const getScoreInterpretation = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Very Good";
    if (score >= 55) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  /**
   * Get job label from value
   */
  const getJobLabel = (jobType) => {
    const jobs = {
      hr: "HR (Human Resources)",
      data_analyst: "Data Analyst",
      sales: "Sales Executive",
      business_analyst: "Business Analyst",
      tele_caller: "Tele Caller / BPO",
      developer: "Software Developer",
    };
    return jobs[jobType] || "General";
  };

  return (
    <div className="results-container">
      {/* Top Action Button - Analyze Another Resume */}
      <div className="results-top-action">
        <button className="button button-secondary" onClick={onReset}>
          ← Analyze Another Resume
        </button>
      </div>

      {/* Header with Score and Job Position */}
      <div className="results-header">
        {data.jobType && (
          <div className="job-position-badge">
            📍 Position: <strong>{getJobLabel(data.jobType)}</strong>
          </div>
        )}
        <div className="score-badge">
          <div
            className="score-circle"
            style={{ borderColor: getScoreColor(data.overallScore) }}
          >
            <span className="score-value">{data.overallScore}</span>
            <span className="score-max">/100</span>
          </div>
          <div className="score-interpretation">
            {getScoreInterpretation(data.overallScore)}
          </div>
        </div>
        <div className="results-header-text">
          <h2>Resume Analysis Complete</h2>
          <p>
            Your personalized feedback for{" "}
            <strong>{getJobLabel(data.jobType).toLowerCase()}</strong>
          </p>
        </div>
      </div>

      {/* Results Grid */}
      {/* JOB MATCH SECTION */}
      {data.jobMatchPercentage && (
        <div className="job-match-section">
          <div className="match-status-indicator">
            <div className="match-percentage">
              <span className="percentage-value">
                {data.jobMatchPercentage}%
              </span>
              <span className="percentage-label">Job Match</span>
            </div>
            <div className="match-status-text">
              <p className="status-message">{data.jobMatchStatus}</p>
            </div>
          </div>

          {data.matchedSkills && data.matchedSkills.length > 0 && (
            <div className="matched-items">
              <h4>✅ Your Matching Skills:</h4>
              <div className="skills-found">
                {data.matchedSkills.map((skill, idx) => (
                  <span key={idx} className="skill-match">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.skillAdvice && (
            <div className="skill-advice">
              <h4>📚 Related Skills to Develop:</h4>
              <div className="advice-items">
                <p>
                  <strong>Top Priority:</strong> {data.skillAdvice.top_priority}
                </p>
                <p>
                  <strong>Secondary Skills:</strong>{" "}
                  {data.skillAdvice.secondary}
                </p>
                <p>
                  <strong>Tools/Software:</strong> {data.skillAdvice.tools}
                </p>
                <p>
                  <strong>Recommended Certification:</strong>{" "}
                  {data.skillAdvice.certification}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="results-grid">
        {/* Candidate Summary Section */}
        <section className="result-section summary-section">
          <h3>📋 Candidate Summary</h3>
          <p className="summary-text">{data.candidateSummary}</p>
        </section>

        {/* Strengths Section */}
        <section className="result-section strengths-section">
          <h3>💪 Key Strengths</h3>
          <ul className="strengths-list">
            {data.strengths &&
              data.strengths.map((strength, index) => (
                <li key={index}>
                  <span className="strength-marker">✓</span>
                  {strength}
                </li>
              ))}
          </ul>
        </section>

        {/* Weaknesses Section */}
        <section className="result-section weaknesses-section">
          <h3>⚠️ Areas for Improvement</h3>
          <ul className="weaknesses-list">
            {data.weaknesses &&
              data.weaknesses.map((weakness, index) => (
                <li key={index}>
                  <span className="weakness-marker">•</span>
                  {weakness}
                </li>
              ))}
          </ul>
        </section>

        {/* Missing Skills Section */}
        <section className="result-section missing-skills-section">
          <h3>🎯 Missing Skills for {getJobLabel(data.jobType)}</h3>
          <div className="skills-tags">
            {data.missingSkills && data.missingSkills.length > 0 ? (
              data.missingSkills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))
            ) : (
              <p className="no-items">No critical missing skills identified</p>
            )}
          </div>
        </section>

        {/* Missing Sections */}
        {data.missingSections && data.missingSections.length > 0 && (
          <section className="result-section missing-sections">
            <h3>📌 Missing Sections</h3>
            <ul className="missing-list">
              {data.missingSections.map((section, index) => (
                <li key={index}>{section}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Suggestions Section */}
        <section className="result-section suggestions-section">
          <h3>💡 Suggested Improvements</h3>
          <ol className="suggestions-list">
            {data.suggestions &&
              data.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
          </ol>
        </section>

        {/* Overall Feedback Section */}
        <section className="result-section feedback-section">
          <h3>📝 Overall Feedback</h3>
          <p className="feedback-text">{data.overallFeedback}</p>
        </section>
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button className="button button-primary" onClick={onReset}>
          ↻ Analyze Another Resume
        </button>
      </div>

      {/* Disclaimer */}
      <div className="results-disclaimer">
        <p>
          <small>
            This analysis is AI-generated and should be viewed as supplementary
            feedback. For professional career guidance, consider consulting with
            a career counselor.
          </small>
        </p>
      </div>
    </div>
  );
}

export default AnalysisResults;
