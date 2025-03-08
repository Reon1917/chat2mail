import { db } from "@/db";
import { users } from "@/db/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

export async function registerUser(email: string, password: string) {
  // Check for existing user
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    throw new Error("Email already in use");
  }

  // Hash password and create user
  const hashedPassword = await hash(password, 10);
  await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      name: email.split('@')[0], // Use email prefix as initial name
    });

  return { email };
}