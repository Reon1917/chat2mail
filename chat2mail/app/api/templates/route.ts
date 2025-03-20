import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// GET all templates for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user ID from session
    const userEmail = session.user.email as string;
    const userResult = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, userEmail),
    });
    
    if (!userResult) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get all templates for this user
    const userTemplates = await db.query.templates.findMany({
      where: (templates, { eq }) => eq(templates.userId, userResult.id),
      orderBy: (templates, { desc }) => [desc(templates.created_at)],
    });
    
    return NextResponse.json(userTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create a new template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get user ID from session
    const userEmail = session.user.email as string;
    const userResult = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, userEmail),
    });
    
    if (!userResult) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const { name, data } = await req.json();
    
    if (!name || !data) {
      return NextResponse.json(
        { error: "Name and data are required" },
        { status: 400 }
      );
    }
    
    // Create new template
    const newTemplate = await db.insert(templates).values({
      userId: userResult.id,
      name,
      data,
      isDefault: false,
    }).returning();
    
    return NextResponse.json(newTemplate[0], { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
