import { db } from "@/db";
import { users } from "@/db/schema";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";

export async function registerUser(email: string, password: string) {
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) throw new Error("Email already in use");
  const hashedPassword = await hash(password, 10);
  await db.insert(users).values({ email, password: hashedPassword }).run();
}