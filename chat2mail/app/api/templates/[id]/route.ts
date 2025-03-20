import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET a specific template
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
    
    const templateId = parseInt(params.id);
    
    // Get the template
    const template = await db.query.templates.findFirst({
      where: (templates, { eq, and }) => and(
        eq(templates.id, templateId),
        eq(templates.userId, userResult.id)
      ),
    });
    
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PUT - Update a template
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    
    const templateId = parseInt(params.id);
    const { name, data, isDefault } = await req.json();
    
    // Verify template exists and belongs to user
    const existingTemplate = await db.query.templates.findFirst({
      where: (templates, { eq, and }) => and(
        eq(templates.id, templateId),
        eq(templates.userId, userResult.id)
      ),
    });
    
    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    
    // Update template
    const updatedTemplate = await db.update(templates)
      .set({
        name: name ?? existingTemplate.name,
        data: data ?? existingTemplate.data,
        isDefault: isDefault ?? existingTemplate.isDefault,
        updated_at: new Date(),
      })
      .where(eq(templates.id, templateId))
      .returning();
    
    return NextResponse.json(updatedTemplate[0]);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a template
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    
    const templateId = parseInt(params.id);
    
    // Verify template exists and belongs to user
    const existingTemplate = await db.query.templates.findFirst({
      where: (templates, { eq, and }) => and(
        eq(templates.id, templateId),
        eq(templates.userId, userResult.id)
      ),
    });
    
    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    
    // Delete template
    await db.delete(templates).where(eq(templates.id, templateId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
