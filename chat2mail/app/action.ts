"use server";

import { db } from "@/db";
import { hash } from "bcryptjs";

interface DbUser {
  id: number;
  email: string;
  name: string | null;
  password: string | null;
}

export async function registerUser(email: string, password: string) {
  try {
    // Validate email and password
    if (!email || !email.includes('@')) {
      throw new Error("Please enter a valid email address");
    }
    
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // Check for existing user using prepared statement
    const existingUsers = await db.execute(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUsers && existingUsers.length > 0) {
      throw new Error("Email already in use");
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user using prepared statement
    const result = await db.execute(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, email.split('@')[0]]
    );

    if (!result || result.length === 0) {
      throw new Error("Failed to create user");
    }

    const newUser = result[0];
    return { success: true, email: newUser.email };
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to register user");
  }
}