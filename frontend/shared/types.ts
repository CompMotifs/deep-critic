/**
 * DeepCritic Shared Types
 * This file contains common type definitions used across the application
 */

// Job status type used for tracking document analysis progress
export type JobStatus = {
  progress: number;
  stage: string;
  estimatedTimeRemaining: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  result?: any; // Store the result when completed
  message?: string;
  promptUsed?: string;
  agentStatuses?: Record<string, 'waiting' | 'processing' | 'completed' | 'failed'>;
};

// WebSocket message types
export type WebSocketMessage = {
  type: string;
  jobId: string;
  data?: any;
  timestamp?: string;
};

// AI agent definition
export type Agent = {
  id: string;
  name: string;
  description: string;
  color: string;
  letter: string;
};

// Options for document analysis by AI services
export interface DocumentAnalysisOptions {
  model: string;
  content: string; // base64 encoded document content
  prompt: string;
}

// Response from AI document analysis
export interface DocumentAnalysisResult {
  feedback: string;
  confidence: number;
  keyPoints: string[];
  timestamp?: string;
}

// Options for document processing service
export interface ProcessDocumentOptions {
  jobId: string;
  documentTitle: string;
  pdfContent: string; // base64 encoded PDF
  prompt: string;
  selectedAgents: string[];
  onProgress: (progress: number, stage: string, timeRemaining: number) => void;
  onComplete: (result: any) => void;
  onError: (error: Error) => void;
}

// Agent result in the analysis output
export interface AgentResult {
  agentName: string;
  feedback: string;
  confidence: number;
  keyPoints: string[];
  timestamp?: string;
}

// Complete analysis result structure
export interface AnalysisResult {
  summary: string;
  keyFindings: Array<{ type: string; text: string }>;
  strengths: string[];
  weaknesses: string[];
  comparisonAspects: Array<{
    name: string;
    values: Record<string, string>;
  }>;
  agentResults: AgentResult[];
  metadata: {
    documentTitle: string;
    documentPages: number;
    promptUsed: string;
    processingTime: number;
  };
}