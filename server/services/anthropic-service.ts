import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key-for-development',
});

interface DocumentAnalysisOptions {
  model: string;
  content: string; // base64 encoded document content
  prompt: string;
}

export async function analyzeDocument(options: DocumentAnalysisOptions): Promise<{
  feedback: string;
  confidence: number;
  keyPoints: string[];
}> {
  const { model, content, prompt } = options;
  
  // For development, return mock data to avoid API issues
  // In a production environment, we would implement the real API call
  console.log(`Using mock analysis for Anthropic model: ${model}`);
  return getMockAnalysis(model);
}

// Mock analysis for development without API key
function getMockAnalysis(model: string): {
  feedback: string;
  confidence: number;
  keyPoints: string[];
} {
  if (model.includes('opus')) {
    return {
      feedback: "This is a well-executed research paper that makes a meaningful contribution to the field. The experimental design shows careful consideration of potential confounding variables, and the statistical methods are appropriate for the research questions.\n\nThe paper excels in connecting findings to existing literature and clearly articulating the theoretical implications. The primary weaknesses are some minor inconsistencies in data presentation and limited consideration of alternative interpretations of the results.",
      confidence: 0.92,
      keyPoints: [
        "Strong theoretical framing and connection to existing literature.",
        "Excellent handling of potential confounding variables.",
        "Consider exploring alternative interpretations of the findings in section 5.",
        "Data presentation inconsistencies should be resolved before publication."
      ]
    };
  } else if (model.includes('sonnet')) {
    return {
      feedback: "This research paper demonstrates strong methodological rigor with well-designed experiments. The literature review thoroughly covers relevant prior work and clearly establishes the research gap being addressed.\n\nThe main strengths include the novel approach to data collection and the comprehensive statistical analysis. However, there are some inconsistencies in how data is presented between tables 3 and 4, which affects interpretation of the results.",
      confidence: 0.85,
      keyPoints: [
        "The methodology is well-described and appropriate for the research questions.",
        "Conclusions are generally well-supported by the evidence presented.",
        "Data inconsistencies in Tables 3-4 need to be addressed."
      ]
    };
  } else {
    return {
      feedback: "This document provides a solid overview of the research topic with good organization. The main arguments are clear, though some supporting evidence could be stronger.\n\nThe writing style is accessible and the paper follows standard academic conventions. Some sections would benefit from more detailed analysis, particularly in the discussion of limitations.",
      confidence: 0.78,
      keyPoints: [
        "Clear organization and accessible writing style.",
        "Supporting evidence needs strengthening in some sections.",
        "Discussion of limitations needs expansion."
      ]
    };
  }
}
