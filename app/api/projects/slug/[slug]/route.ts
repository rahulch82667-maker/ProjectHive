import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/config/db";
import Project from "@/backend/models/Project";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    await connectDB();
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { message: "Slug is required" },
        { status: 400 },
      );
    }

    // We fetch only published projects to protect drafts and archived items.
    // If the user needs to view their own drafts, they can use a separate route or authenticated query parameter,
    // but for the public details page, published only is standard.
    const project = await Project.findOne({ slug, status: "published" })
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Project GET by slug error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch project" },
      { status: 500 },
    );
  }
}
