// This is a mock DB module for the in-memory storage implementation
import * as schema from "@shared/schema";

// Create placeholders for database objects that will be used by the in-memory storage
// We don't actually use these with MemStorage, but they're here to satisfy any imports

const mockPool = {
  query: async () => ({ rows: [] }),
  end: async () => {}
};

const mockDb = {
  select: () => ({ from: () => ({ where: () => [] }) }),
  insert: () => ({ values: () => ({ returning: () => [{}] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [{}] }) }) })
};

export const pool = mockPool;
export const db = mockDb;
