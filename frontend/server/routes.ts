import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { processDocument } from "./services/pdf-service";
import crypto from "crypto";
import { setupWebSocketServer, sendJobUpdate } from "./websocket";
import { JobStatus } from "../shared/types";

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Map to store active job connections
const activeJobs = new Map<string, JobStatus>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wss = setupWebSocketServer(httpServer);
  
  // API routes
  app.post('/api/review', upload.single('file'), async (req: Request, res: Response) => {
    try {
      // Validate request
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const bodySchema = z.object({
        prompt: z.string().min(1).max(500),
        agents: z.string().transform(val => {
          try {
            return JSON.parse(val) as string[];
          } catch {
            throw new Error('Invalid agents format');
          }
        })
      });
      
      const { prompt, agents } = bodySchema.parse(req.body);
      
      if (agents.length === 0) {
        return res.status(400).json({ message: 'At least one agent must be selected' });
      }
      
      // Create a unique job ID and document hash
      const jobId = crypto.randomUUID();
      const documentHash = crypto.createHash('sha256')
        .update(req.file.buffer)
        .digest('hex');
      
      // Initialize job status
      activeJobs.set(jobId, {
        progress: 0,
        stage: 'Starting document analysis',
        estimatedTimeRemaining: agents.length * 60, // 1 minute per agent estimate
        status: 'pending',
        promptUsed: prompt
      });
      
      // Extract text content from PDF (req.file is checked for existence in the validation above)
      const pdfContent = req.file?.buffer.toString('base64');
      
      // Begin async processing
      setTimeout(() => {
        // Call processDocument in a setTimeout to ensure it doesn't block
        processDocument({
          jobId,
          documentTitle: req.file?.originalname || 'Untitled Document',
          pdfContent,
          prompt,
          selectedAgents: agents,
          onProgress: (progress, stage, timeRemaining) => {
            // Update job status in memory
            const jobStatus: JobStatus = {
              progress,
              stage,
              estimatedTimeRemaining: timeRemaining,
              status: 'processing',
              promptUsed: prompt, // Include the prompt
              // Add agent statuses to show individual agent progress
              agentStatuses: Object.fromEntries(
                agents.map(agent => [agent, 
                  progress < 0.2 ? 'waiting' : 
                  progress >= 0.9 ? 'completed' : 
                  'processing'
                ])
              )
            };
            activeJobs.set(jobId, jobStatus);
            
            // Send WebSocket update to clients
            sendJobUpdate(jobId, jobStatus);
            console.log(`Job ${jobId} progress: ${Math.round(progress * 100)}% - ${stage}`);
          },
          onComplete: async (result) => {
            // Update job status in memory
            const jobStatus: JobStatus = {
              progress: 1,
              stage: 'Complete',
              estimatedTimeRemaining: 0,
              status: 'completed',
              result, // Store the result
              promptUsed: prompt, // Include the prompt
              agentStatuses: Object.fromEntries(
                agents.map(agent => [agent, 'completed'])
              )
            };
            activeJobs.set(jobId, jobStatus);
            
            // Store the result in database
            try {
              // We would normally save to the database here, but for simplicity
              // in the demo we'll just keep it in memory
              
              // Send WebSocket completion notification
              sendJobUpdate(jobId, {
                ...jobStatus,
                message: 'Analysis complete'
              });
              console.log(`Job ${jobId} completed successfully`);
            } catch (error) {
              console.error('Failed to save job result:', error);
            }
          },
          onError: (error) => {
            // Update job status in memory
            const jobStatus: JobStatus = {
              progress: 0,
              stage: 'Failed',
              estimatedTimeRemaining: 0,
              status: 'failed',
              error: error.message,
              promptUsed: prompt, // Include the prompt
              agentStatuses: Object.fromEntries(
                agents.map(agent => [agent, 'failed'])
              )
            };
            activeJobs.set(jobId, jobStatus);
            
            // Send WebSocket error notification
            sendJobUpdate(jobId, {
              ...jobStatus,
              message: 'Analysis failed'
            });
            console.error(`Job ${jobId} failed: ${error.message}`);
          }
        }).catch(error => {
          console.error('Uncaught error in processDocument:', error);
        });
      }, 100);
      
      // Return job ID for the client to use for status updates
      return res.status(202).json({ 
        jobId, 
        message: 'Document submitted for processing'
      });
      
    } catch (error: any) {
      console.error('Error processing review request:', error);
      return res.status(400).json({ 
        message: error.message || 'Failed to process document'
      });
    }
  });
  
  // Get job status
  app.get('/api/review/:jobId', (req: Request, res: Response) => {
    const { jobId } = req.params;
    const jobStatus = activeJobs.get(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    return res.json(jobStatus);
  });
  
  // Get job results
  app.get('/api/review/:jobId/results', (req: Request, res: Response) => {
    const { jobId } = req.params;
    const jobStatus = activeJobs.get(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (jobStatus.status !== 'completed') {
      return res.status(202).json({ 
        message: 'Job is still processing',
        status: jobStatus.status,
        progress: jobStatus.progress 
      });
    }
    
    // Use the stored result if available
    if (jobStatus.result) {
      return res.json(jobStatus.result);
    }
    
    // In a real implementation, we would fetch this from the database
    // For the demo, we'll generate a sample response if no result is available
    return res.json({
      summary: "This research paper demonstrates strong methodological rigor and presents novel findings in the field. The literature review is comprehensive, but there are some inconsistencies in the data analysis section that could be addressed. All agents agree that the paper's conclusions are well-supported by the evidence presented, though Claude 3 Opus identified potential alternative interpretations worth considering.",
      keyFindings: [
        { type: "strength", text: "The methodology is robust and well-described, with appropriate statistical analyses." },
        { type: "strength", text: "The literature review thoroughly covers relevant prior work and establishes the research gap." },
        { type: "concern", text: "Inconsistencies were found in the data presentation between tables 3 and 4, which affects interpretation." }
      ],
      strengths: [
        "Clear and logical structure throughout the document",
        "Strong evidence supporting the main arguments"
      ],
      weaknesses: [
        "Limited consideration of alternative explanations",
        "Some citations are outdated (pre-2015)"
      ],
      comparisonAspects: [
        {
          name: "Overall Assessment",
          values: {
            "Claude 3.7 Sonnet": "Strong research with minor flaws",
            "Claude 3 Opus": "Well-executed study that contributes meaningfully to the field"
          }
        },
        {
          name: "Methodology Rating",
          values: {
            "Claude 3.7 Sonnet": "4/5 - Well designed",
            "Claude 3 Opus": "4.5/5 - Excellent design with minor improvements possible"
          }
        }
      ],
      agentResults: (() => {
        // Get a list of selected agents from status if available
        const agentNames: Record<string, string> = {
          'claude': 'Claude 3.7 Sonnet',
          'opus': 'Claude 3 Opus',
          'haiku': 'Claude 3 Haiku',
          'gpt4o': 'GPT-4o',
          'gpt4': 'GPT-4 Turbo',
          'gpt35': 'GPT-3.5 Turbo',
          'deepseek-lite': 'DeepSeek Lite',
          'deepseek-coder': 'DeepSeek Coder',
          'mistral-large': 'Mistral Large',
          'mistral-medium': 'Mistral Medium',
          'llama-3': 'Llama 3',
          'llama-2': 'Llama 2'
        };
        
        const selectedAgents = Object.keys(jobStatus.agentStatuses || {}).map(agentId => {
          // Convert agent ids to proper names using a type-safe approach
          return agentId in agentNames ? agentNames[agentId] : agentId;
        });
        
        // If we have no agents from status, default to two
        if (selectedAgents.length === 0) {
          selectedAgents.push('Claude 3.7 Sonnet', 'Claude 3 Opus');
        }
        
        // Create mock results for each agent
        return selectedAgents.map((agentName) => {
          const isOpus = agentName.includes('Opus');
          const isDeepSeek = agentName.includes('DeepSeek');
          const isGPT = agentName.includes('GPT');
          const isMistral = agentName.includes('Mistral');
          const isLlama = agentName.includes('Llama');
          
          // Different models have slightly different flavors of feedback
          let feedback, confidence, keyPoints;
          
          if (isOpus) {
            feedback = "This is a well-executed research paper that makes a meaningful contribution to the field. The experimental design shows careful consideration of potential confounding variables, and the statistical methods are appropriate for the research questions.\n\nThe paper excels in connecting findings to existing literature and clearly articulating the theoretical implications. The primary weaknesses are some minor inconsistencies in data presentation and limited consideration of alternative interpretations of the results.";
            confidence = 0.92;
            keyPoints = [
              "Strong theoretical framing and connection to existing literature.",
              "Excellent handling of potential confounding variables.",
              "Consider exploring alternative interpretations of the findings in section 5.",
              "Data presentation inconsistencies should be resolved before publication."
            ];
          } else if (isDeepSeek) {
            feedback = "This document demonstrates comprehensive research with strong technical foundation. The methodical approach and clear structure are notable strengths, along with thorough documentation of the experimental setup.\n\nKey insights are supported by appropriate evidence, though some technical details would benefit from additional clarification, particularly in sections discussing implementation specifics.";
            confidence = 0.88;
            keyPoints = [
              "Strong methodological approach with rigorous experimentation.",
              "Technical implementation is sound with good architecture.",
              "Some specialized terminology could benefit from additional explanation.",
              "Consider expanding on the limitations section for a more balanced analysis."
            ];
          } else if (isGPT) {
            feedback = "This document presents a compelling narrative with strong supporting evidence. The research methodology is well-structured, and the analytical framework demonstrates careful consideration of variables.\n\nThe literature review effectively positions this work within the broader context. Some statistical analyses could benefit from additional explanation, particularly for readers without domain-specific knowledge.";
            confidence = 0.89;
            keyPoints = [
              "Comprehensive approach with detailed evidence presentation.",
              "Effective positioning within existing literature.",
              "Statistical methodology is appropriate but could use more explanation.",
              "Consider expanding practical implications section."
            ];
          } else if (isMistral) {
            feedback = "The document presents a methodical analysis with clear reasoning. The structured approach to problem-solving is evident throughout, with particularly strong sections on experimental design and results interpretation.\n\nThere is room for improvement in connecting theoretical frameworks to practical applications, which would strengthen the overall impact of the work.";
            confidence = 0.84;
            keyPoints = [
              "Logical structure with clear progression of ideas.",
              "Strong experimental methodology with appropriate controls.",
              "Some theoretical concepts could be better connected to applications.",
              "Consider adding more comparative analysis with related work."
            ];
          } else if (isLlama) {
            feedback = "This paper demonstrates rigorous methodology with a solid foundation in existing research. The experimental approach is well-documented with appropriate attention to detail in the methodology section.\n\nThe conclusions follow logically from the presented evidence, though there are opportunities to strengthen the discussion by addressing potential counterarguments more directly.";
            confidence = 0.83;
            keyPoints = [
              "Strong methodological foundation with appropriate controls.",
              "Clear documentation of experimental procedures.",
              "Could benefit from more robust discussion of limitations.",
              "Consider addressing counterarguments more explicitly."
            ];
          } else {
            // Default for Claude and others
            feedback = "This research paper demonstrates strong methodological rigor with well-designed experiments. The literature review thoroughly covers relevant prior work and clearly establishes the research gap being addressed.\n\nThe main strengths include the novel approach to data collection and the comprehensive statistical analysis. However, there are some inconsistencies in how data is presented between tables 3 and 4, which affects interpretation of the results.";
            confidence = 0.85;
            keyPoints = [
              "The methodology is well-described and appropriate for the research questions.",
              "Conclusions are generally well-supported by the evidence presented.",
              "Data inconsistencies in Tables 3-4 need to be addressed."
            ];
          }
          
          return {
            agentName,
            feedback,
            confidence,
            keyPoints,
            timestamp: new Date().toISOString()
          };
        });
      })(),
      metadata: {
        documentTitle: req.params.jobId,
        documentPages: 12,
        promptUsed: jobStatus.promptUsed || "Please review this academic paper for methodological rigor, clarity of arguments, and contribution to the field. Identify strengths, weaknesses, and suggest improvements.",
        processingTime: Object.keys(jobStatus.agentStatuses || {}).length * 45 + 15 // Simulate processing time based on agent count
      }
    });
  });

  return httpServer;
}
