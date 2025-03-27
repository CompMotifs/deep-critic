import React, { useState, useEffect } from 'react';
import './DeepCriticApp.css'; // We'll create this file for basic styling

const DeepCriticApp = () => {
  // State management
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [reviewResults, setReviewResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const API_BASE_URL = 'http://localhost:8000/api';

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    } else {
      setFile(null);
      setFileName('');
      setError('Please select a valid PDF file');
    }
  };

  // Upload the PDF file
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatusMessage('Uploading PDF...');

    const formData = new FormData();
    formData.append('pdf_file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setJobId(data.job_id);
      setJobStatus(data.status);
      setStatusMessage(`Upload complete! Job ID: ${data.job_id}`);
    } catch (err) {
      setError(`Error uploading file: ${err.message}`);
      setStatusMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  // Check job status
  const checkStatus = async () => {
    if (!jobId) return;

    setIsLoading(true);
    setError(null);
    setStatusMessage('Checking status...');

    try {
      const response = await fetch(`${API_BASE_URL}/job-status/${jobId}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      const data = await response.json();
      setJobStatus(data.status);
      
      if (data.status === 'completed') {
        setStatusMessage('PDF processing complete! Ready for review.');
      } else if (data.status === 'failed') {
        setStatusMessage(`Processing failed: ${data.error || 'Unknown error'}`);
      } else {
        setStatusMessage(`Current status: ${data.status}`);
      }
    } catch (err) {
      setError(`Error checking status: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Request a review
  const requestReview = async () => {
    if (!jobId) return;
    
    setIsLoading(true);
    setError(null);
    setStatusMessage('Requesting review from multiple LLMs...');
    setReviewResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/review-document/${jobId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Review request failed: ${response.statusText}`);
      }

      const data = await response.json();
      setReviewResults(data);
      setStatusMessage('Review complete!');
    } catch (err) {
      setError(`Error requesting review: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for job status updates
  useEffect(() => {
    let interval;
    if (jobId && jobStatus && jobStatus !== 'completed' && jobStatus !== 'failed') {
      interval = setInterval(() => {
        checkStatus();
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  // Format consensus review data
  const formatConsensusReview = (review) => {
    if (!review) return null;
    
    return (
      <div className="consensus-review">
        <h3>Consensus Review</h3>
        
        <div>
          <h4>Summary</h4>
          <p>{review.summary}</p>
        </div>
        
        <div className="scores-container">
          <div className="score-box">
            <p>Soundness</p>
            <p className="score-value">{review.soundness}/5</p>
          </div>
          <div className="score-box">
            <p>Presentation</p>
            <p className="score-value">{review.presentation}/5</p>
          </div>
          <div className="score-box">
            <p>Contribution</p>
            <p className="score-value">{review.contribution}/5</p>
          </div>
        </div>
        
        <div className="strengths-weaknesses">
          <div>
            <h4>Strengths</h4>
            <p>{review.strengths}</p>
          </div>
          <div>
            <h4>Weaknesses</h4>
            <p>{review.weaknesses}</p>
          </div>
        </div>
        
        <div>
          <h4>Questions</h4>
          <p>{review.questions}</p>
        </div>
        
        <div>
          <h4>Limitations</h4>
          <p>{review.limitations}</p>
        </div>
        
        <div className="scores-container">
          <div className="score-box">
            <p>Overall Rating</p>
            <p className="score-value">{review.rating}/10</p>
          </div>
          <div className="score-box">
            <p>Confidence</p>
            <p className="score-value">{review.confidence}/5</p>
          </div>
        </div>
      </div>
    );
  };

  // Render individual LLM reviews
  const renderIndividualReviews = (reviews) => {
    if (!reviews) return null;
    
    return (
      <div className="individual-reviews">
        <h3>Individual LLM Reviews</h3>
        
        <div className="reviews-grid">
          {Object.entries(reviews).map(([model, review]) => (
            <div key={model} className="review-card">
              <h4>{model} Review</h4>
              
              {review.error ? (
                <p className="error-message">{review.error}</p>
              ) : (
                <div>
                  <p><span className="label">Summary:</span> {review.summary}</p>
                  
                  {review.scores && (
                    <div className="mini-scores">
                      <div className="mini-score">
                        <p>Originality</p>
                        <p className="score-value">{review.scores.originality}/10</p>
                      </div>
                      <div className="mini-score">
                        <p>Clarity</p>
                        <p className="score-value">{review.scores.clarity}/10</p>
                      </div>
                      <div className="mini-score">
                        <p>Impact</p>
                        <p className="score-value">{review.scores.impact}/10</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="label">Strengths:</p>
                    <ul>
                      {review.strengths && review.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="label">Weaknesses:</p>
                    <ul>
                      {review.weaknesses && review.weaknesses.map((weakness, i) => (
                        <li key={i}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>Deep Critic</h1>
        <p>Academic Paper Review System</p>
      </div>
      
      <div className="upload-section">
        <h2>Upload Your Paper</h2>
        
        <div className="file-input">
          <label>
            Select PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
          />
          {fileName && <p className="filename">{fileName}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
        
        <div className="button-group">
          <button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="primary-button"
          >
            Upload PDF
          </button>
          
          {jobId && (
            <button
              onClick={checkStatus}
              disabled={isLoading}
              className="secondary-button"
            >
              Check Status
            </button>
          )}
          
          {jobId && jobStatus === 'completed' && (
            <button
              onClick={requestReview}
              disabled={isLoading}
              className="success-button"
            >
              Generate Review
            </button>
          )}
        </div>
        
        {statusMessage && (
          <div className="status-message">
            <p>{statusMessage}</p>
            {isLoading && <div className="loading-indicator"></div>}
          </div>
        )}
      </div>
      
      {reviewResults && (
        <div className="results-section">
          {reviewResults.consensus_review && formatConsensusReview(reviewResults.consensus_review)}
          {reviewResults.individual_reviews && renderIndividualReviews(reviewResults.individual_reviews)}
        </div>
      )}
      
      <div className="footer">
        <p>Deep Critic · Academic Paper Review System · Powered by Multiple LLMs</p>
      </div>
    </div>
  );
};

export default DeepCriticApp;