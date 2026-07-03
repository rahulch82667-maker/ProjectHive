import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/backend/config/db";
import Project from "@/backend/models/Project";
import { protect } from "@/backend/middlewares/auth.middleware";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const user = await protect();

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid project ID" },
        { status: 400 },
      );
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      tasks: project.tasks || [],
    });
  } catch (error: any) {
    console.error("Project tasks GET error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const user = await protect();

    if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid project ID" },
        { status: 400 },
      );
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { message: "Task name is required" },
        { status: 400 },
      );
    }

    const newTask = {
      name: name.trim(),
      completed: false,
    };

    project.tasks.push(newTask as any);
    await project.save();

    return NextResponse.json({
      message: "Task added successfully",
      tasks: project.tasks,
    });
  } catch (error: any) {
    console.error("Project tasks POST error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to add task" },
      { status: 500 },
    );
  }
}
