import axios from 'axios';
import { DocumentAnalysisOptions, DocumentAnalysisResult } from '@shared/types';

// Set a default URL for development purposes - this can be set via environment variable
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'http://localhost:8000';

/**
 * Analyzes a document using the external FastAPI backend from compmotifs/deep-critic
 * @param options The options for document analysis
 * @returns Analysis result from the external API
 */
export async function analyzeDocument(options: DocumentAnalysisOptions): Promise<DocumentAnalysisResult> {
  // Use the PDF upload method for all document analysis since it's the preferred approach
  return analyzeDocumentWithPdfUpload(options);
}

// Define types for the external API response structure (update as needed based on actual API)
interface ExternalAPIResponse {
  claude?: ExternalModelResponse;
  openai?: ExternalModelResponse;
  mistral?: ExternalModelResponse;
  [key: string]: ExternalModelResponse | undefined;
}

interface ExternalModelResponse {
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  key_points?: string[];
  scores?: {
    confidence?: number;
    [key: string]: number | undefined;
  };
  [key: string]: any;
}

/**
 * Uses the external API's PDF upload endpoint to analyze a document
 * This is the primary integration point with the compmotifs/deep-critic backend
 * @param options The options for document analysis, with content as base64 PDF
 * @returns Analysis result from the external API
 */
export async function analyzeDocumentWithPdfUpload(options: DocumentAnalysisOptions): Promise<DocumentAnalysisResult> {
  try {
    console.log(`Sending document to external API with model: ${options.model}`);
    
    // Convert base64 to a Buffer for form-data upload
    const pdfBuffer = Buffer.from(options.content, 'base64');
    
    // Create form data for file upload
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('pdf_file', blob, 'document.pdf');
    
    if (options.prompt) {
      // If we have a custom prompt, add it to the form data
      // The backend API might expect a specific parameter name - adjust as needed
      formData.append('prompt', options.prompt);
    }
    
    if (options.model && options.model !== 'combined') {
      // If we're requesting a specific model, add it to the form data
      // The backend API might expect a specific parameter name - adjust as needed
      formData.append('model', options.model);
    }
    
    // API endpoint for the compmotifs/deep-critic backend
    const uploadEndpoint = `${EXTERNAL_API_URL}/api/upload-and-review`;
    console.log(`Sending request to: ${uploadEndpoint}`);
    
    // Make the API call to the external service
    const response = await axios.post(uploadEndpoint, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add a longer timeout for document processing
        timeout: 300000 // 5 minutes
      }
    );
    
    console.log('Received response from external API');
    
    // Extract results based on the external API's response format
    const externalResults = response.data as ExternalAPIResponse;
    
    // Check if we have a structured response from the API
    if (!externalResults) {
      throw new Error('External API returned empty response');
    }
    
    // Get the model data based on the model requested or fallback to any available model
    let modelData: ExternalModelResponse = {};
    if (options.model === 'claude' && externalResults.claude) {
      modelData = externalResults.claude;
    } else if (options.model === 'openai' && externalResults.openai) {
      modelData = externalResults.openai;
    } else if (options.model === 'mistral' && externalResults.mistral) {
      modelData = externalResults.mistral;
    } else {
      // If no specific model or the requested model isn't available, use any available model
      modelData = externalResults.openai || externalResults.claude || externalResults.mistral || {};
    }
    
    // Log successful processing
    console.log(`Successfully processed document with external API (${options.model})`);
    
    // Map the external API's response to our DocumentAnalysisResult format
    return {
      feedback: modelData.summary || 'External API analysis completed',
      confidence: calculateConfidence(modelData),
      keyPoints: extractKeyPoints(modelData),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calling external API PDF upload:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with an error status
        console.error('External API error response:', 
          error.response.status,
          error.response.statusText, 
          typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : error.response.data
        );
        throw new Error(`External API error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('External API request failed - no response received');
        throw new Error('External API unavailable. Check if the service is running and accessible.');
      }
    }
    
    throw new Error('External API PDF analysis failed: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Calculate confidence score from the external API response
 */
function calculateConfidence(modelData: ExternalModelResponse): number {
  // If the model data has a scores object with a confidence property, use it
  if (modelData.scores && typeof modelData.scores.confidence === 'number') {
    return modelData.scores.confidence;
  }
  
  // If there are any scores, use the average as a proxy for confidence
  if (modelData.scores) {
    const scores = Object.values(modelData.scores).filter(score => typeof score === 'number') as number[];
    if (scores.length > 0) {
      return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
  }
  
  // Default confidence score
  return 0.85;
}

/**
 * Extract key points from the external API response
 */
function extractKeyPoints(modelData: ExternalModelResponse): string[] {
  // Combine strengths and weaknesses into key points
  const keyPoints: string[] = [];
  
  // Add strengths if available
  if (Array.isArray(modelData.strengths)) {
    keyPoints.push(...modelData.strengths);
  }
  
  // Add weaknesses if available
  if (Array.isArray(modelData.weaknesses)) {
    keyPoints.push(...modelData.weaknesses);
  }
  
  // Add other potential key points sources
  if (Array.isArray(modelData.key_points)) {
    keyPoints.push(...modelData.key_points);
  }
  
  // If we still don't have any key points, extract sentences from the summary
  if (keyPoints.length === 0 && typeof modelData.summary === 'string') {
    // Extract sentences that seem important
    const summary = modelData.summary;
    const sentences = summary.split(/[.!?]/).filter((s: string) => s.trim().length > 20);
    keyPoints.push(...sentences.slice(0, 3).map((s: string) => s.trim()));
  }
  
  return keyPoints;
}