import { 
  users, type User, type InsertUser,
  reviewJobs, type ReviewJob, type InsertReviewJob,
  documents, type Document, type InsertDocument
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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

// PostgreSQL database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // ReviewJob methods
  async createReviewJob(job: InsertReviewJob): Promise<ReviewJob> {
    // Create a cloned object to avoid modifying the original
    const { selectedAgents, ...rest } = job;
    
    // Make sure selectedAgents is a valid string array for PostgreSQL JSONB
    let agentsArray: string[] = [];
    
    if (Array.isArray(selectedAgents)) {
      agentsArray = selectedAgents.map(agent => String(agent));
    } else if (selectedAgents) {
      // Handle any other case by converting to string array
      agentsArray = [String(selectedAgents)];
    }
    
    // Insert the review job with properly formatted data
    const [reviewJob] = await db
      .insert(reviewJobs)
      .values({
        ...rest,
        selectedAgents: agentsArray
      })
      .returning();
      
    return reviewJob;
  }
  
  async getReviewJob(id: number): Promise<ReviewJob | undefined> {
    const [job] = await db
      .select()
      .from(reviewJobs)
      .where(eq(reviewJobs.id, id));
    return job || undefined;
  }
  
  async updateReviewJob(id: number, updates: Partial<ReviewJob>): Promise<ReviewJob | undefined> {
    const [updatedJob] = await db
      .update(reviewJobs)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(reviewJobs.id, id))
      .returning();
    return updatedJob || undefined;
  }
  
  async getReviewJobsForUser(userId: number): Promise<ReviewJob[]> {
    return await db
      .select()
      .from(reviewJobs)
      .where(eq(reviewJobs.userId, userId));
  }
  
  // Document methods
  async saveDocument(document: InsertDocument): Promise<Document> {
    // Extract and sanitize values to ensure correct types
    const { jobId, content } = document;
    
    const [newDocument] = await db
      .insert(documents)
      .values({
        jobId: Number(jobId),
        content: String(content)
      })
      .returning();
    return newDocument;
  }
  
  async getDocument(jobId: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.jobId, jobId));
    return document || undefined;
  }
}

export const storage = new DatabaseStorage();
