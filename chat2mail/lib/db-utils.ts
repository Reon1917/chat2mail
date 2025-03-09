import { executeQuery } from "@/db";

/**
 * Utility functions for database operations that are compatible with Next.js server actions
 */

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string) {
  try {
    const users = await executeQuery(
      'SELECT id, email, password, name, image FROM users WHERE email = $1',
      [email]
    );
    return users?.[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(email: string, hashedPassword: string, name: string) {
  try {
    const result = await executeQuery(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    return result?.[0] || null;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Check if a user exists by email
 */
export async function userExists(email: string): Promise<boolean> {
  try {
    const users = await executeQuery(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    return users && users.length > 0;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    throw error;
  }
}
