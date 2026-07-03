import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Project from '@/backend/models/Project';
import { protect } from '@/backend/middlewares/auth.middleware';
import { createAuditLog } from '@/backend/utils/auditLogger';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await protect();

    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid project ID' }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { budget } = body;

    if (budget === undefined || typeof budget !== 'number' || budget < 0) {
      return NextResponse.json({ message: 'Budget must be a non-negative number' }, { status: 400 });
    }

    const oldBudget = project.budget || 0;
    project.budget = budget;
    await project.save();

    await createAuditLog({
      userId: user._id,
      action: 'BUDGET_CHANGE',
      details: `Changed budget for project "${project.title}" from $${oldBudget} to $${budget}`,
      req: request,
    });

    return NextResponse.json({
      message: 'Budget updated successfully',
      budget: project.budget,
    });
  } catch (error: any) {
    console.error('Project budget PUT error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update budget' },
      { status: 500 }
    );
  }
}
