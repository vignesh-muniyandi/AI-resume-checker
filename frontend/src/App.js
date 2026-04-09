/**
 * Main App Component
 * Manages state and routing between upload and results views
 */

import React, { useState } from "react";
import ResumeUpload from "./components/ResumeUpload";
import AnalysisResults from "./components/AnalysisResults";
import "./App.css";

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle successful analysis
   */
  const handleAnalysisSuccess = (data) => {
    setAnalysisData(data);
    setError(null);
  };

  /**
   * Handle analysis error
   */
  const handleAnalysisError = (errorMsg) => {
    setError(errorMsg);
    setAnalysisData(null);
  };

  /**
   * Reset to upload view
   */
  const handleReset = () => {
    setAnalysisData(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🤖 AI Resume Analyzer</h1>
          <p>Get intelligent feedback on your resume instantly</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {!analysisData ? (
          // Upload View
          <ResumeUpload
            onSuccess={handleAnalysisSuccess}
            onError={handleAnalysisError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
          />
        ) : (
          // Results View
          <AnalysisResults data={analysisData} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2024 AI Resume Analyzer | Powered by OpenAI</p>
      </footer>
    </div>
  );
}

export default App;
