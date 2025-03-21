import NextAuth, { type NextAuthOptions } from "next-auth";
import type { DefaultSession, Account, Session, User, Profile } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { drizzleDb } from "@/db";
import { findUserByEmail } from "@/lib/db-utils";
import { z } from "zod";

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

// Configure NextAuth options
const authOptions: NextAuthOptions = {
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
          placeholder: "u2022u2022u2022u2022u2022u2022u2022u2022" 
        }
      },
      async authorize(credentials): Promise<User | null> {
        try {
          // Validate credentials
          const { email, password } = credentialsSchema.parse(credentials);

          // Find user by email
          const user = await findUserByEmail(email);
          if (!user?.password) {
            return null;
          }

          // Compare password
          const isValidPassword = await compare(password, user.password);
          if (!isValidPassword) {
            return null;
          }

          // Return the user object matching the next-auth User interface
          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
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
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/register"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  debug: process.env.NODE_ENV === "development",
};

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export the route handlers for GET and POST requests
export { handler as GET, handler as POST };

// Export auth for use in server components
export const auth = handler.auth;