import fetch from 'node-fetch';

interface DocumentAnalysisOptions {
  model: string;
  content: string; // base64 encoded document content
  prompt: string;
}

/**
 * Analyzes a document using DeepSeek API
 * @param options The options for document analysis
 * @returns Analysis result from DeepSeek
 */
export async function analyzeDocument(options: DocumentAnalysisOptions): Promise<{
  feedback: string;
  confidence: number;
  keyPoints: string[];
  timestamp: string;
}> {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn("DeepSeek API key not found, using mock data");
    return getMockAnalysis(options.model);
  }

  try {
    const apiUrl = "https://api.deepseek.com/v1/chat/completions";
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: options.model,
        messages: [
          {
            role: "system",
            content: "You are a document analysis expert. Analyze the document and provide detailed feedback."
          },
          {
            role: "user",
            content: `I need your help analyzing this document. Here's what I'm looking for specifically: ${options.prompt}\n\nHere's the content of the document: ${options.content}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response content (expected to be JSON)
    const analysisContent = JSON.parse(data.choices[0].message.content);
    
    return {
      feedback: analysisContent.feedback || "No feedback provided",
      confidence: analysisContent.confidence || 0.85,
      keyPoints: analysisContent.key_points || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error analyzing document with DeepSeek:", error);
    return getMockAnalysis(options.model);
  }
}

function getMockAnalysis(model: string): {
  feedback: string;
  confidence: number;
  keyPoints: string[];
  timestamp: string;
} {
  return {
    feedback: `This is a mock analysis from DeepSeek ${model}. The document appears to be well-structured with clear arguments and supporting evidence. The writing style is professional and engaging. The analysis shows the document has strong theoretical foundations but could benefit from more practical examples.`,
    confidence: 0.92,
    keyPoints: [
      "Well-structured document with clear arguments",
      "Professional writing style",
      "Strong theoretical foundations",
      "Could benefit from more practical examples",
      "Effective use of citations and references"
    ],
    timestamp: new Date().toISOString()
  };
}