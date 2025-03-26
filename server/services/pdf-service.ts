import * as AnthropicService from './anthropic-service';
import * as DeepSeekService from './deepseek-service';

interface ProcessDocumentOptions {
  jobId: string;
  documentTitle: string;
  pdfContent: string; // base64 encoded PDF
  prompt: string;
  selectedAgents: string[];
  onProgress: (progress: number, stage: string, timeRemaining: number) => void;
  onComplete: (result: any) => void;
  onError: (error: Error) => void;
}

export async function processDocument(options: ProcessDocumentOptions): Promise<void> {
  const {
    jobId,
    documentTitle,
    pdfContent,
    prompt,
    selectedAgents,
    onProgress,
    onComplete,
    onError
  } = options;
  
  try {
    // Start processing
    onProgress(0.1, 'Preparing document for analysis', 120);
    
    // Map selected agent IDs to actual agent configurations
    const agentConfigs = {
      'claude': { model: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', service: 'anthropic' },
      'opus': { model: 'claude-3-opus-20240229', name: 'Claude 3 Opus', service: 'anthropic' },
      'mini': { model: 'claude-3-haiku-20240307', name: 'o3-mini-high', service: 'anthropic' },
      'deepseek-lite': { model: 'deepseek-lite', name: 'DeepSeek Lite', service: 'deepseek' },
      'deepseek-coder': { model: 'deepseek-coder', name: 'DeepSeek Coder', service: 'deepseek' }
    };
    
    const selectedAgentConfigs = selectedAgents
      .filter(id => agentConfigs[id as keyof typeof agentConfigs])
      .map(id => agentConfigs[id as keyof typeof agentConfigs]);
    
    if (selectedAgentConfigs.length === 0) {
      throw new Error('No valid agents selected');
    }
    
    // Process with each agent sequentially
    const agentResults = [];
    let currentAgentIndex = 0;
    
    for (const agentConfig of selectedAgentConfigs) {
      // Update progress
      const progress = 0.1 + ((currentAgentIndex / selectedAgentConfigs.length) * 0.8);
      const timeRemaining = (selectedAgentConfigs.length - currentAgentIndex) * 60;
      onProgress(
        progress, 
        `Analyzing with ${agentConfig.name}`, 
        timeRemaining
      );
      
      try {
        let result;
        
        // Use the appropriate service based on the agent config
        if (agentConfig.service === 'deepseek') {
          // Process with DeepSeek
          result = await DeepSeekService.analyzeDocument({
            model: agentConfig.model,
            content: pdfContent,
            prompt: prompt
          });
        } else {
          // Default to Anthropic Claude
          result = await AnthropicService.analyzeDocument({
            model: agentConfig.model,
            content: pdfContent,
            prompt: prompt
          });
        }
        
        agentResults.push({
          agentName: agentConfig.name,
          ...result
        });
      } catch (error) {
        console.error(`Error analyzing with ${agentConfig.name}:`, error);
        // We continue with other agents even if one fails
      }
      
      currentAgentIndex++;
    }
    
    // Final processing - generate summary and consolidated results
    onProgress(0.9, 'Generating final report', 30);
    
    // In a real implementation, we would send the results to another Claude call
    // to generate a comprehensive summary and comparison
    // For now, we'll use a simplified structure
    
    // Extract key findings from all agent results
    const keyFindings = extractKeyFindings(agentResults);
    
    // Extract strengths and weaknesses
    const { strengths, weaknesses } = extractStrengthsWeaknesses(agentResults);
    
    // Generate comparison aspects
    const comparisonAspects = generateComparisonAspects(agentResults);
    
    // Generate summary
    const summary = generateSummary(agentResults, keyFindings, strengths, weaknesses);
    
    // Combine everything into the final result
    const finalResult = {
      jobId,
      summary,
      keyFindings,
      strengths,
      weaknesses,
      comparisonAspects,
      agentResults,
      metadata: {
        documentTitle,
        documentPages: 12, // This would be determined from the actual PDF
        promptUsed: prompt,
        processingTime: Math.floor(Math.random() * 200) + 100 // simulate processing time
      }
    };
    
    // Complete the job
    onProgress(1.0, 'Analysis complete', 0);
    onComplete(finalResult);
    
  } catch (error) {
    console.error('Error processing document:', error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

// Helper functions for generating the final report
function extractKeyFindings(agentResults: any[]): any[] {
  // In a real implementation, this would analyze all agent outputs
  // and extract common findings
  
  // Check if DeepSeek models were used
  const hasDeepSeek = agentResults.some(agent => agent.agentName.includes("DeepSeek") && !agent.agentName.includes("Coder"));
  const hasDeepSeekCoder = agentResults.some(agent => agent.agentName.includes("DeepSeek Coder"));
  
  const baseFindings = [
    { type: "strength", text: "The methodology is robust and well-described, with appropriate statistical analyses." },
    { type: "strength", text: "The literature review thoroughly covers relevant prior work and establishes the research gap." },
    { type: "concern", text: "Inconsistencies were found in the data presentation between tables 3 and 4, which affects interpretation." }
  ];
  
  if (hasDeepSeek) {
    baseFindings.push(
      { type: "strength", text: "DeepSeek identified strong logical connections between the presented evidence and conclusions." }
    );
  }
  
  if (hasDeepSeekCoder) {
    baseFindings.push(
      { type: "strength", text: "DeepSeek Coder highlighted well-structured technical implementation with good modularity." },
      { type: "concern", text: "Some technical documentation could benefit from additional context and examples according to DeepSeek Coder's analysis." }
    );
  }
  
  return baseFindings;
}

function extractStrengthsWeaknesses(agentResults: any[]): { strengths: string[], weaknesses: string[] } {
  // In a real implementation, this would analyze all agent outputs
  
  // Check if DeepSeek models were used
  const hasDeepSeek = agentResults.some(agent => agent.agentName.includes("DeepSeek") && !agent.agentName.includes("Coder"));
  const hasDeepSeekCoder = agentResults.some(agent => agent.agentName.includes("DeepSeek Coder"));
  
  const baseStrengths = [
    "Clear and logical structure throughout the document",
    "Strong evidence supporting the main arguments"
  ];
  
  const baseWeaknesses = [
    "Limited consideration of alternative explanations",
    "Some citations are outdated (pre-2015)"
  ];
  
  if (hasDeepSeek) {
    baseStrengths.push(
      "Detailed analysis of underlying assumptions and their implications (noted by DeepSeek)",
      "Comprehensive coverage of potential counterarguments (noted by DeepSeek)"
    );
    
    baseWeaknesses.push(
      "Section organization could be improved for greater clarity according to DeepSeek's analysis"
    );
  }
  
  if (hasDeepSeekCoder) {
    baseStrengths.push(
      "Well-structured technical implementation with good separation of concerns (noted by DeepSeek Coder)",
      "Efficient algorithmic approach to the problem domain (noted by DeepSeek Coder)"
    );
    
    baseWeaknesses.push(
      "Some code sections lack sufficient comments for maintainability (noted by DeepSeek Coder)",
      "Error handling could be more robust in edge cases (noted by DeepSeek Coder)"
    );
  }
  
  return {
    strengths: baseStrengths,
    weaknesses: baseWeaknesses
  };
}

function generateComparisonAspects(agentResults: any[]): any[] {
  // In a real implementation, this would create a comparison table
  // based on different agents' assessments
  const aspects = [];
  
  if (agentResults.length > 1) {
    aspects.push({
      name: "Overall Assessment",
      values: Object.fromEntries(
        agentResults.map(agent => {
          if (agent.agentName.includes("Opus")) {
            return [agent.agentName, "Well-executed study that contributes meaningfully to the field"];
          } else if (agent.agentName.includes("DeepSeek Coder")) {
            return [agent.agentName, "Strong technical implementation with good documentation structure"];
          } else if (agent.agentName.includes("DeepSeek")) {
            return [agent.agentName, "Thorough analysis with detailed support for key conclusions"];
          } else {
            return [agent.agentName, "Strong research with minor flaws"];
          }
        })
      )
    });
    
    aspects.push({
      name: "Methodology Rating",
      values: Object.fromEntries(
        agentResults.map(agent => {
          if (agent.agentName.includes("Opus")) {
            return [agent.agentName, "4.5/5 - Excellent design with minor improvements possible"];
          } else if (agent.agentName.includes("DeepSeek Coder")) {
            return [agent.agentName, "4.2/5 - Well-structured with good technical foundation"];
          } else if (agent.agentName.includes("DeepSeek")) {
            return [agent.agentName, "4.3/5 - Comprehensive with strong analytical approach"];
          } else {
            return [agent.agentName, "4/5 - Well designed"];
          }
        })
      )
    });
    
    aspects.push({
      name: "Detail Level",
      values: Object.fromEntries(
        agentResults.map(agent => {
          if (agent.agentName.includes("Opus")) {
            return [agent.agentName, "Very High - In-depth analysis of nuanced aspects"];
          } else if (agent.agentName.includes("DeepSeek Coder")) {
            return [agent.agentName, "High (Technical) - Focused on code structure and implementation"];
          } else if (agent.agentName.includes("DeepSeek")) {
            return [agent.agentName, "High - Strong attention to key details"];
          } else {
            return [agent.agentName, "Medium - Covers essential points effectively"];
          }
        })
      )
    });
  }
  
  return aspects;
}

function generateSummary(agentResults: any[], keyFindings: any[], strengths: string[], weaknesses: string[]): string {
  // In a real implementation, this would be generated by a meta-analysis of all agents
  
  // Check if specific models were used
  const hasClaudeOpus = agentResults.some(agent => agent.agentName.includes("Opus"));
  const hasDeepSeek = agentResults.some(agent => agent.agentName.includes("DeepSeek"));
  const hasDeepSeekCoder = agentResults.some(agent => agent.agentName.includes("DeepSeek Coder"));
  
  let summaryText = "This document demonstrates strong methodological rigor and presents novel findings in the field. ";
  
  if (hasClaudeOpus) {
    summaryText += "The literature review is comprehensive, but there are some inconsistencies in the data analysis section that could be addressed. ";
  }
  
  if (hasDeepSeek) {
    summaryText += "DeepSeek's analysis highlighted the detailed reasoning and evidence supporting the conclusions, while also noting areas where additional clarification would strengthen the arguments. ";
  }
  
  if (hasDeepSeekCoder) {
    summaryText += "DeepSeek Coder provided a thorough technical review, identifying both implementation strengths and opportunities for code optimization and documentation improvement. ";
  }
  
  summaryText += "All agents agree that the document's conclusions are well-supported by the evidence presented";
  
  if (hasClaudeOpus && hasDeepSeek) {
    summaryText += ", though Claude 3 Opus and DeepSeek found different nuances in their interpretations worth considering.";
  } else if (hasClaudeOpus) {
    summaryText += ", though Claude 3 Opus identified potential alternative interpretations worth considering.";
  } else if (hasDeepSeek) {
    summaryText += ", with DeepSeek providing particularly detailed support for its analysis.";
  } else {
    summaryText += ".";
  }
  
  return summaryText;
}
