"use server";

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Required for Next.js Edge Runtime
neonConfig.fetchConnectionCache = true;

// Create a Neon client
const sql = neon(process.env.DATABASE_URL!);

// Create a standard Drizzle instance
const drizzleDb = drizzle(sql);

// Create a custom db object that works in both client and server components
export const db = {
  ...drizzleDb,
  async execute(query: string, values?: any[]) {
    try {
      if (values) {
        return await sql(query, values);
      }
      return await sql(query);
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
};
