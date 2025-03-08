"use server";

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Required for Next.js Edge Runtime
neonConfig.fetchConnectionCache = true;

// Create a Neon client
const sql = neon(process.env.DATABASE_URL!);

// Create a Drizzle instance
export const db = drizzle(sql);
