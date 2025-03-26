import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Review jobs schema
export const reviewJobs = pgTable("review_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  documentTitle: varchar("document_title", { length: 255 }).notNull(),
  documentHash: varchar("document_hash", { length: 64 }).notNull(),
  prompt: text("prompt").notNull(),
  selectedAgents: jsonb("selected_agents").notNull().$type<string[]>(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  summary: text("summary"),
  keyFindings: jsonb("key_findings").$type<Array<{type: string, text: string}>>,
  strengths: jsonb("strengths").$type<string[]>(),
  weaknesses: jsonb("weaknesses").$type<string[]>(),
  comparisonAspects: jsonb("comparison_aspects").$type<Array<{name: string, values: Record<string, string>}>>,
  agentResults: jsonb("agent_results").$type<Array<{
    agentName: string,
    feedback: string,
    confidence: number,
    keyPoints: string[],
    timestamp: string
  }>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertReviewJobSchema = createInsertSchema(reviewJobs).pick({
  userId: true,
  documentTitle: true,
  documentHash: true,
  prompt: true,
  selectedAgents: true,
});

// Document storage schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => reviewJobs.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  jobId: true,
  content: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ReviewJob = typeof reviewJobs.$inferSelect;
export type InsertReviewJob = z.infer<typeof insertReviewJobSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
