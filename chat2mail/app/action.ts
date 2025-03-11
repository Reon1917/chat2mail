"use server";

import { userExists, createUser } from "@/lib/db-utils";
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

    // Check for existing user
    const exists = await userExists(email);
    if (exists) {
      throw new Error("Email already in use");
    }

    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Generate a name from email (username part)
    const name = email.split('@')[0];

    // Create user
    const newUser = await createUser(email, hashedPassword, name);
    if (!newUser) {
      throw new Error("Failed to create user");
    }

    return { success: true, email: newUser.email };
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to register user");
  }
}