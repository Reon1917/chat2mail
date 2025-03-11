import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Required for Next.js Edge Runtime
neonConfig.fetchConnectionCache = true;

// Create a Neon client
const sql = neon(process.env.DATABASE_URL!);

// Create a standard Drizzle instance
export const drizzleDb = drizzle(sql);

// Export the SQL client for direct queries
export const executeQuery = async (query: string, values?: any[]) => {
  try {
    if (values) {
      return await sql(query, values);
    }
    return await sql(query);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};
