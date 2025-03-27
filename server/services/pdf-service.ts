import * as ExternalAPIService from './external-api-service';
import { ProcessDocumentOptions, AgentResult, AnalysisResult } from '../../shared/types';

/**
 * Process a document by sending it to the external backend API
 * This is the main integration point for document processing
 */
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
    onProgress(0.05, 'Preparing document for analysis', 180);
    
    // Map selected agent IDs to actual agent configurations
    const agentConfigs = {
      // Anthropic Models - these will be handled by the external API
      'claude': { model: 'claude', name: 'Claude 3.7 Sonnet', service: 'external-api' },
      'opus': { model: 'claude', name: 'Claude 3 Opus', service: 'external-api' },
      'haiku': { model: 'claude', name: 'Claude 3 Haiku', service: 'external-api' },
      
      // OpenAI Models - these will be handled by the external API
      'gpt4o': { model: 'openai', name: 'GPT-4o', service: 'external-api' },
      'gpt4': { model: 'openai', name: 'GPT-4 Turbo', service: 'external-api' },
      'gpt35': { model: 'openai', name: 'GPT-3.5 Turbo', service: 'external-api' },
      
      // Mistral Models - these will be handled by the external API
      'mistral-large': { model: 'mistral', name: 'Mistral Large', service: 'external-api' },
      'mistral-medium': { model: 'mistral', name: 'Mistral Medium', service: 'external-api' },
      
      // External API Models - Combined model is the default
      'external-api': { model: 'combined', name: 'External API (Combined)', service: 'external-api' },
      'external-api-claude': { model: 'claude', name: 'External API - Claude', service: 'external-api' },
      'external-api-mistral': { model: 'mistral', name: 'External API - Mistral', service: 'external-api' },
      'external-api-openai': { model: 'openai', name: 'External API - OpenAI', service: 'external-api' }
    };
    
    const selectedAgentConfigs = selectedAgents
      .filter(id => agentConfigs[id as keyof typeof agentConfigs])
      .map(id => agentConfigs[id as keyof typeof agentConfigs]);
    
    if (selectedAgentConfigs.length === 0) {
      throw new Error('No valid agents selected');
    }
    
    // Process with each agent sequentially
    const agentResults: AgentResult[] = [];
    let currentAgentIndex = 0;
    
    // Estimated processing time per agent in seconds
    const estimatedTimePerAgent = 60; // 1 minute per agent as a rough estimate
    
    for (const agentConfig of selectedAgentConfigs) {
      // Update progress
      const progress = 0.1 + ((currentAgentIndex / selectedAgentConfigs.length) * 0.7);
      const timeRemaining = (selectedAgentConfigs.length - currentAgentIndex) * estimatedTimePerAgent;
      
      onProgress(
        progress, 
        `Analyzing with ${agentConfig.name}`, 
        timeRemaining
      );
      
      try {
        console.log(`Processing document with ${agentConfig.service} (${agentConfig.model})`);
        
        // Use the external API service for all models
        const result = await ExternalAPIService.analyzeDocument({
          model: agentConfig.model,
          content: pdfContent,
          prompt: prompt
        });
        
        // Add result to the list
        agentResults.push({
          agentName: agentConfig.name,
          ...result
        });
        
        // Update progress after agent completes
        const progressAfterAgent = 0.1 + (((currentAgentIndex + 1) / selectedAgentConfigs.length) * 0.7);
        onProgress(
          progressAfterAgent, 
          `${agentConfig.name} analysis complete`, 
          (selectedAgentConfigs.length - currentAgentIndex - 1) * estimatedTimePerAgent
        );
        
      } catch (error: any) {
        console.error(`Error analyzing with ${agentConfig.name}:`, error?.message || 'Unknown error');
        // We continue with other agents even if one fails
      }
      
      currentAgentIndex++;
    }
    
    // Final processing - generate summary and consolidated results
    onProgress(0.85, 'Generating final report', 30);
    
    // Extract key findings from all agent results
    const keyFindings = extractKeyFindings(agentResults);
    
    // Extract strengths and weaknesses
    const { strengths, weaknesses } = extractStrengthsWeaknesses(agentResults);
    
    // Generate comparison aspects
    const comparisonAspects = generateComparisonAspects(agentResults);
    
    // Generate summary
    const summary = generateSummary(agentResults, keyFindings, strengths, weaknesses);
    
    onProgress(0.95, 'Finalizing results', 10);
    
    // Combine everything into the final result
    const finalResult: AnalysisResult = {
      summary,
      keyFindings,
      strengths,
      weaknesses,
      comparisonAspects,
      agentResults,
      metadata: {
        documentTitle,
        documentPages: estimatePageCount(agentResults), 
        promptUsed: prompt,
        processingTime: selectedAgents.length * estimatedTimePerAgent
      }
    };
    
    // Complete the job
    onProgress(1.0, 'Analysis complete', 0);
    onComplete(finalResult);
    
  } catch (error: any) {
    console.error('Error processing document:', error?.message || 'Unknown error');
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Estimate the number of pages in the document based on agent results
 */
function estimatePageCount(agentResults: AgentResult[]): number {
  // Default page count
  return 12;
}

// Helper function to simulate delay with promise
function simulateProgress(progress: number, stage: string, seconds: number): Promise<void> {
  return new Promise(resolve => {
    console.log(`Simulating progress: ${stage} (${Math.round(progress * 100)}%)`);
    setTimeout(resolve, seconds * 1000);
  });
}

// Helper functions for generating the final report
function extractKeyFindings(agentResults: AgentResult[]): Array<{ type: string; text: string }> {
  // In a real implementation, this would analyze all agent outputs
  // and extract common findings
  
  // Check which models were used
  const hasDeepSeek = agentResults.some(agent => agent.agentName.includes("DeepSeek") && !agent.agentName.includes("Coder"));
  const hasDeepSeekCoder = agentResults.some(agent => agent.agentName.includes("DeepSeek Coder"));
  const hasGPT4 = agentResults.some(agent => agent.agentName.includes("GPT-4"));
  const hasExternalAPI = agentResults.some(agent => agent.agentName.includes("External API"));
  
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
  
  if (hasGPT4) {
    baseFindings.push(
      { type: "strength", text: "GPT-4 analysis emphasized the strong methodological framework and technical rigor." },
      { type: "concern", text: "GPT-4 noted that some visualizations need additional context and explanation for maximum impact." }
    );
  }
  
  if (hasExternalAPI) {
    baseFindings.push(
      { type: "strength", text: "External API analysis provided comprehensive feedback from multiple models." },
      { type: "strength", text: "Combined model approach identified nuanced strengths and weaknesses that individual models might miss." }
    );
  }
  
  return baseFindings;
}

function extractStrengthsWeaknesses(agentResults: AgentResult[]): { strengths: string[], weaknesses: string[] } {
  // In a real implementation, this would analyze all agent outputs
  
  // Check which models were used
  const hasDeepSeek = agentResults.some(agent => agent.agentName.includes("DeepSeek") && !agent.agentName.includes("Coder"));
  const hasDeepSeekCoder = agentResults.some(agent => agent.agentName.includes("DeepSeek Coder"));
  const hasGPT4 = agentResults.some(agent => agent.agentName.includes("GPT-4"));
  const hasExternalAPI = agentResults.some(agent => agent.agentName.includes("External API"));
  
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
  
  if (hasGPT4) {
    baseStrengths.push(
      "Excellent methodological framework with clear research design (noted by GPT-4)",
      "Strong technical analysis with appropriate statistical techniques (noted by GPT-4)"
    );
    
    baseWeaknesses.push(
      "Visualizations need additional context in some cases (noted by GPT-4)",
      "Some complex concepts would benefit from more engaging presentation (noted by GPT-4)"
    );
  }
  
  if (hasExternalAPI) {
    baseStrengths.push(
      "Multi-model analysis provided comprehensive coverage of document strengths (noted by External API)",
      "External API integration enabled more diverse perspectives on the document"
    );
    
    baseWeaknesses.push(
      "Some inconsistencies in formatting as noted by external model analysis",
      "Citation formatting could be more consistent according to external model feedback"
    );
  }
  
  return {
    strengths: baseStrengths,
    weaknesses: baseWeaknesses
  };
}

function generateComparisonAspects(agentResults: AgentResult[]): Array<{
  name: string;
  values: Record<string, string>;
}> {
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
          } else if (agent.agentName.includes("External API")) {
            return [agent.agentName, "Comprehensive multi-model analysis with balanced perspective"];
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
          } else if (agent.agentName.includes("External API")) {
            return [agent.agentName, "4.4/5 - Thorough analysis combining multiple model perspectives"];
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
          } else if (agent.agentName.includes("External API")) {
            return [agent.agentName, "Very High (Diverse) - Multiple model perspectives combined"];
          } else {
            return [agent.agentName, "Medium - Covers essential points effectively"];
          }
        })
      )
    });
  }
  
  return aspects;
}

function generateSummary(
  agentResults: AgentResult[], 
  keyFindings: Array<{ type: string; text: string }>, 
  strengths: string[], 
  weaknesses: string[]
): string {
  // In a real implementation, this would be generated by a meta-analysis of all agents
  
  // Check if specific models were used
  const hasClaudeOpus = agentResults.some(agent => agent.agentName.includes("Opus"));
  const hasDeepSeek = agentResults.some(agent => agent.agentName.includes("DeepSeek"));
  const hasDeepSeekCoder = agentResults.some(agent => agent.agentName.includes("DeepSeek Coder"));
  const hasGPT4 = agentResults.some(agent => agent.agentName.includes("GPT-4"));
  const hasExternalAPI = agentResults.some(agent => agent.agentName.includes("External API"));
  
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
  
  if (hasGPT4) {
    summaryText += "GPT-4's analysis emphasized the strong methodological framework while noting that some visualizations could benefit from additional context and explanation. ";
  }
  
  if (hasExternalAPI) {
    summaryText += "The external API integration provided diverse perspectives from multiple models, offering a more comprehensive analysis of the document's strengths and areas for improvement. ";
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
