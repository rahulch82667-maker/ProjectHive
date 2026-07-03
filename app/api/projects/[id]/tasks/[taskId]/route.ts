import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Project from '@/backend/models/Project';
import { protect } from '@/backend/middlewares/auth.middleware';
import { createAuditLog } from '@/backend/utils/auditLogger';
import mongoose from 'mongoose';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    await connectDB();
    const user = await protect();

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id, taskId } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid project ID' }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const taskIndex = project.tasks.findIndex((t: any) => t._id.toString() === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const deletedTask = project.tasks[taskIndex];
    project.tasks.splice(taskIndex, 1);
    await project.save();

    await createAuditLog({
      userId: user._id,
      action: 'TASK_DELETE',
      details: `Deleted task "${deletedTask.name}" from project "${project.title}"`,
      req: request,
    });

    return NextResponse.json({
      message: 'Task deleted successfully',
      tasks: project.tasks,
    });
  } catch (error: any) {
    console.error('Project task DELETE error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}

// Add a PATCH handler to toggle task status (optional, but makes the UI feel complete!)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    await connectDB();
    const user = await protect();

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id, taskId } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid project ID' }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const taskIndex = project.tasks.findIndex((t: any) => t._id.toString() === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const body = await request.json();
    const { completed } = body;

    if (completed === undefined || typeof completed !== 'boolean') {
      return NextResponse.json({ message: 'Completed must be a boolean' }, { status: 400 });
    }

    project.tasks[taskIndex].completed = completed;
    await project.save();

    return NextResponse.json({
      message: 'Task status updated',
      tasks: project.tasks,
    });
  } catch (error: any) {
    console.error('Project task PATCH error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update task status' },
      { status: 500 }
    );
  }
}
