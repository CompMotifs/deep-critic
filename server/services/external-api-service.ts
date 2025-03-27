import axios from 'axios';
import { DocumentAnalysisOptions, DocumentAnalysisResult } from '@shared/types';

// Set a default URL for development purposes
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'http://localhost:8000';

/**
 * Analyzes a document using the external FastAPI backend
 * @param options The options for document analysis
 * @returns Analysis result from the external API
 */
export async function analyzeDocument(options: DocumentAnalysisOptions): Promise<DocumentAnalysisResult> {
  try {
    // Convert base64 content to text for the external API
    const paperText = Buffer.from(options.content, 'base64').toString('utf-8');
    
    // Make the API call to the external service
    const response = await axios.post(`${EXTERNAL_API_URL}/api/review`, {
      paper_text: paperText,
      prompt: options.prompt,
    });
    
    // Extract results based on the external API's response format
    const externalResults = response.data;
    
    // For now, we'll use the OpenAI results as the primary source if available
    const modelData = externalResults.openai || 
                      externalResults.claude || 
                      externalResults.mistral || 
                      {};
    
    // Map the external API's response to our DocumentAnalysisResult format
    return {
      feedback: modelData.summary || 'External API analysis completed',
      confidence: 0.85, // We'd need to extract or estimate this
      keyPoints: [
        ...(modelData.strengths || []),
        ...(modelData.weaknesses || [])
      ],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calling external API:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with an error status
        console.error('External API error response:', error.response.data);
        throw new Error(`External API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('External API unavailable. Check if the service is running.');
      }
    }
    
    throw new Error('External API analysis failed: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Uses the external API's PDF upload endpoint to analyze a document
 * @param options The options for document analysis, with content as base64 PDF
 * @returns Analysis result from the external API
 */
export async function analyzeDocumentWithPdfUpload(options: DocumentAnalysisOptions): Promise<DocumentAnalysisResult> {
  try {
    // Convert base64 to a Buffer for form-data upload
    const pdfBuffer = Buffer.from(options.content, 'base64');
    
    // Create form data for file upload
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('pdf_file', blob, 'document.pdf');
    
    // Make the API call to the external service
    const response = await axios.post(`${EXTERNAL_API_URL}/api/upload-and-review`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    
    // Extract results based on the external API's response format
    const externalResults = response.data;
    
    // For now, we'll use the OpenAI results as the primary source if available
    const modelData = externalResults.openai || 
                      externalResults.claude || 
                      externalResults.mistral || 
                      {};
    
    // Map the external API's response to our DocumentAnalysisResult format
    return {
      feedback: modelData.summary || 'External API analysis completed',
      confidence: 0.85, // We'd need to extract or estimate this
      keyPoints: [
        ...(modelData.strengths || []),
        ...(modelData.weaknesses || [])
      ],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error calling external API PDF upload:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('External API error response:', error.response.data);
        throw new Error(`External API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error('External API unavailable. Check if the service is running.');
      }
    }
    
    throw new Error('External API PDF analysis failed: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Gets mock analysis for testing when the external API is unavailable
 * @returns Mock document analysis result
 */
function getMockAnalysis(): DocumentAnalysisResult {
  return {
    feedback: "This is a mock analysis from the external API integration. The actual API appears to be unavailable.",
    confidence: 0.7,
    keyPoints: [
      "External API integration successfully configured",
      "Unable to reach the actual API endpoint",
      "Using fallback mock data to demonstrate the integration flow"
    ],
    timestamp: new Date().toISOString()
  };
}