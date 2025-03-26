import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { processDocument } from "./services/pdf-service";
import crypto from "crypto";

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
const activeJobs = new Map<string, { 
  progress: number,
  stage: string,
  estimatedTimeRemaining: number,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  error?: string,
  result?: any // Store the result when completed
}>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
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
        status: 'pending'
      });
      
      // Extract text content from PDF
      const pdfContent = req.file.buffer.toString('base64');
      
      // Begin async processing
      processDocument({
        jobId,
        documentTitle: req.file.originalname,
        pdfContent,
        prompt,
        selectedAgents: agents,
        onProgress: (progress, stage, timeRemaining) => {
          activeJobs.set(jobId, {
            progress,
            stage,
            estimatedTimeRemaining: timeRemaining,
            status: 'processing'
          });
        },
        onComplete: async (result) => {
          activeJobs.set(jobId, {
            progress: 1,
            stage: 'Complete',
            estimatedTimeRemaining: 0,
            status: 'completed'
          });
          
          // Store the result in database (for future reference)
          try {
            // We would normally save to the database here, but for simplicity
            // in the demo we'll just keep it in memory
          } catch (error) {
            console.error('Failed to save job result:', error);
          }
        },
        onError: (error) => {
          activeJobs.set(jobId, {
            progress: 0,
            stage: 'Failed',
            estimatedTimeRemaining: 0,
            status: 'failed',
            error: error.message
          });
        }
      });
      
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
    
    // In a real implementation, we would fetch this from the database
    // For the demo, we'll return a sample response
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
      agentResults: [
        {
          agentName: "Claude 3.7 Sonnet",
          feedback: "This research paper demonstrates strong methodological rigor with well-designed experiments. The literature review thoroughly covers relevant prior work and clearly establishes the research gap being addressed.\n\nThe main strengths include the novel approach to data collection and the comprehensive statistical analysis. However, there are some inconsistencies in how data is presented between tables 3 and 4, which affects interpretation of the results.",
          confidence: 0.85,
          keyPoints: [
            "The methodology is well-described and appropriate for the research questions.",
            "Conclusions are generally well-supported by the evidence presented.",
            "Data inconsistencies in Tables 3-4 need to be addressed."
          ],
          timestamp: new Date().toISOString()
        },
        {
          agentName: "Claude 3 Opus",
          feedback: "This is a well-executed research paper that makes a meaningful contribution to the field. The experimental design shows careful consideration of potential confounding variables, and the statistical methods are appropriate for the research questions.\n\nThe paper excels in connecting findings to existing literature and clearly articulating the theoretical implications. The primary weaknesses are some minor inconsistencies in data presentation and limited consideration of alternative interpretations of the results.",
          confidence: 0.92,
          keyPoints: [
            "Strong theoretical framing and connection to existing literature.",
            "Excellent handling of potential confounding variables.",
            "Consider exploring alternative interpretations of the findings in section 5.",
            "Data presentation inconsistencies should be resolved before publication."
          ],
          timestamp: new Date().toISOString()
        }
      ],
      metadata: {
        documentTitle: req.params.jobId,
        documentPages: 12,
        promptUsed: "Please review this academic paper for methodological rigor, clarity of arguments, and contribution to the field. Identify strengths, weaknesses, and suggest improvements.",
        processingTime: 245
      }
    });
  });

  return httpServer;
}
