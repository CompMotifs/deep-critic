import { 
  users, type User, type InsertUser,
  reviewJobs, type ReviewJob, type InsertReviewJob,
  documents, type Document, type InsertDocument
} from "@shared/schema";

// Storage interface for the application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // ReviewJob operations
  createReviewJob(job: InsertReviewJob): Promise<ReviewJob>;
  getReviewJob(id: number): Promise<ReviewJob | undefined>;
  updateReviewJob(id: number, updates: Partial<ReviewJob>): Promise<ReviewJob | undefined>;
  getReviewJobsForUser(userId: number): Promise<ReviewJob[]>;
  
  // Document operations
  saveDocument(document: InsertDocument): Promise<Document>;
  getDocument(jobId: number): Promise<Document | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private reviewJobs: ReviewJob[] = [];
  private documents: Document[] = [];
  private userIdCounter = 1;
  private reviewJobIdCounter = 1;
  private documentIdCounter = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      createdAt: now,
      updatedAt: now,
      username: insertUser.username,
      password: insertUser.password
    };
    this.users.push(user);
    return user;
  }
  
  // ReviewJob methods
  async createReviewJob(job: InsertReviewJob): Promise<ReviewJob> {
    const id = this.reviewJobIdCounter++;
    const now = new Date();

    // Make sure selectedAgents is a valid string array 
    let agentsArray: string[] = [];
    
    if (Array.isArray(job.selectedAgents)) {
      agentsArray = job.selectedAgents.map(agent => String(agent));
    } else if (job.selectedAgents) {
      // Handle any other case by converting to string array
      agentsArray = [String(job.selectedAgents)];
    }
    
    const reviewJob: ReviewJob = {
      id,
      createdAt: now,
      updatedAt: now,
      userId: job.userId || null,
      documentTitle: job.documentTitle,
      documentHash: job.documentHash,
      prompt: job.prompt,
      selectedAgents: agentsArray,
      status: job.status || 'pending',
      progress: 0,
      summary: null,
      keyFindings: null,
      strengths: null,
      weaknesses: null,
      comparisonAspects: null,
      agentResults: null
    };
      
    this.reviewJobs.push(reviewJob);
    return reviewJob;
  }
  
  async getReviewJob(id: number): Promise<ReviewJob | undefined> {
    return this.reviewJobs.find(job => job.id === id);
  }
  
  async updateReviewJob(id: number, updates: Partial<ReviewJob>): Promise<ReviewJob | undefined> {
    const jobIndex = this.reviewJobs.findIndex(job => job.id === id);
    if (jobIndex === -1) return undefined;
    
    const job = this.reviewJobs[jobIndex];
    const updatedJob: ReviewJob = {
      ...job,
      ...updates,
      updatedAt: new Date()
    };
    
    this.reviewJobs[jobIndex] = updatedJob;
    return updatedJob;
  }
  
  async getReviewJobsForUser(userId: number): Promise<ReviewJob[]> {
    return this.reviewJobs.filter(job => job.userId === userId);
  }
  
  // Document methods
  async saveDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    
    const newDocument: Document = {
      id,
      createdAt: now,
      updatedAt: now,
      jobId: Number(document.jobId),
      content: String(document.content)
    };
    
    this.documents.push(newDocument);
    return newDocument;
  }
  
  async getDocument(jobId: number): Promise<Document | undefined> {
    return this.documents.find(doc => doc.jobId === jobId);
  }
}

// Use MemStorage instead of DatabaseStorage
export const storage = new MemStorage();
