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
  
  // In development mode, return mock data if no API key
  if (process.env.NODE_ENV === 'development' && 
      (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy-key-for-development')) {
    return getMockAnalysis(model);
  }
  
  try {
    // For PDF analysis, we would typically need to extract the text first
    // and then send it to Claude. For this demo, we're assuming the content
    // has already been extracted or we're working with the base64 representation

    const systemPrompt = `You are a document review expert specializing in analyzing academic papers, legal documents, and professional content.
    
    You will be provided with a document to review based on specific criteria.
    Analyze the document thoroughly and provide:
    
    1. Detailed feedback on the document's strengths and weaknesses
    2. A confidence score between 0 and 1 indicating how confident you are in your assessment
    3. 3-5 key points that summarize your most important findings
    
    Your analysis should be professional, insightful, and actionable. Focus on both content and structure.`;

    const completePrompt = `${prompt}\n\nPlease provide your response in JSON format with these keys:
    - feedback: detailed analysis text
    - confidence: number between 0 and 1
    - keyPoints: array of strings with 3-5 key points`;

    const message = await anthropic.messages.create({
      model: model,
      system: systemPrompt,
      max_tokens: 1500,
      messages: [
        { 
          role: "user", 
          content: [
            {
              type: "text",
              text: completePrompt
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: content
              }
            }
          ]
        }
      ],
    });

    // Parse the response
    try {
      // Extract JSON from response
      const responseText = message.content[0].text;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/{[\s\S]*}/);
                        
      let jsonResponse;
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // If no JSON formatting, try to construct from the text
        jsonResponse = {
          feedback: responseText,
          confidence: 0.7,
          keyPoints: ["Automated analysis completed", "See full text for details"]
        };
      }
      
      return {
        feedback: jsonResponse.feedback,
        confidence: Math.min(1, Math.max(0, jsonResponse.confidence)), // ensure between 0-1
        keyPoints: Array.isArray(jsonResponse.keyPoints) ? jsonResponse.keyPoints : []
      };
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      return {
        feedback: message.content[0].text,
        confidence: 0.5,
        keyPoints: ["Error parsing structured response", "See full text for analysis"]
      };
    }
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw new Error('Failed to analyze document with Anthropic API');
  }
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
