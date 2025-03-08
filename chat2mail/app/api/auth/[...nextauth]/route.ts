"use server";

import NextAuth, { type AuthOptions } from "next-auth";
import type { DefaultSession, Account, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { InferModel } from 'drizzle-orm';
import { eq } from "drizzle-orm";
import { z } from "zod";

// Define types for database models
type DbUser = InferModel<typeof users>;

// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    provider?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

// Extend JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    provider?: string;
  }
}

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Custom error messages
const authErrors = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked: "This email is already associated with another account.",
  EmailSignin: "Check your email address.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to access this page.",
  Default: "Unable to sign in.",
};

const config: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/register"
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "example@example.com" 
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "••••••••" 
        }
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const { email, password } = credentialsSchema.parse(credentials);

          // Find user
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

          if (!dbUser?.password) {
            throw new Error("InvalidCredentials");
          }

          // Compare password
          const isValidPassword = await compare(password, dbUser.password);
          if (!isValidPassword) {
            throw new Error("InvalidCredentials");
          }

          // Return the user object matching the next-auth User interface
          return {
            id: dbUser.id.toString(),
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error("ValidationError");
          }
          throw error; // Let NextAuth handle other errors
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id!;
        session.user.email = token.email!;
        session.provider = token.provider;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        // You can add custom logic here for new users
        console.log("New user signed up:", user.email);
      }
    },
    async signOut({ session, token }) {
      // Clean up any custom session data if needed
    },
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code: string, metadata: unknown) {
      console.error(code, metadata);
    },
    warn(code: string) {
      console.warn(code);
    },
    debug(code: string, metadata: unknown) {
      console.debug(code, metadata);
    },
  },
};

export const { handlers: { GET, POST }, auth } = NextAuth(config);

// Export config for middleware usage
export const authConfig = config;