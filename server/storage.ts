import { 
  users, type User, type InsertUser,
  reviewJobs, type ReviewJob, type InsertReviewJob,
  documents, type Document, type InsertDocument
} from "@shared/schema";
import crypto from "crypto";

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
  private users: Map<number, User>;
  private reviewJobs: Map<number, ReviewJob>;
  private documents: Map<number, Document>;
  private currentUserId: number;
  private currentJobId: number;
  private currentDocId: number;

  constructor() {
    this.users = new Map();
    this.reviewJobs = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentDocId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // ReviewJob methods
  async createReviewJob(job: InsertReviewJob): Promise<ReviewJob> {
    const id = this.currentJobId++;
    const now = new Date();
    
    const reviewJob: ReviewJob = {
      ...job,
      id,
      status: "pending",
      progress: 0,
      summary: null,
      keyFindings: null,
      strengths: null,
      weaknesses: null,
      comparisonAspects: null,
      agentResults: null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.reviewJobs.set(id, reviewJob);
    return reviewJob;
  }
  
  async getReviewJob(id: number): Promise<ReviewJob | undefined> {
    return this.reviewJobs.get(id);
  }
  
  async updateReviewJob(id: number, updates: Partial<ReviewJob>): Promise<ReviewJob | undefined> {
    const existingJob = this.reviewJobs.get(id);
    if (!existingJob) return undefined;
    
    const updatedJob: ReviewJob = {
      ...existingJob,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.reviewJobs.set(id, updatedJob);
    return updatedJob;
  }
  
  async getReviewJobsForUser(userId: number): Promise<ReviewJob[]> {
    return Array.from(this.reviewJobs.values()).filter(
      (job) => job.userId === userId
    );
  }
  
  // Document methods
  async saveDocument(document: InsertDocument): Promise<Document> {
    const id = this.currentDocId++;
    const now = new Date();
    
    const newDocument: Document = {
      ...document,
      id,
      createdAt: now,
    };
    
    this.documents.set(id, newDocument);
    return newDocument;
  }
  
  async getDocument(jobId: number): Promise<Document | undefined> {
    return Array.from(this.documents.values()).find(
      (doc) => doc.jobId === jobId
    );
  }
}

export const storage = new MemStorage();
