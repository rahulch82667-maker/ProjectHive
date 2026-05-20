import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Collection from '@/backend/models/Collection';
import Project from '@/backend/models/Project';
import { protect } from '@/backend/middlewares/auth.middleware';
import mongoose from 'mongoose';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await protect();
    const { id } = await context.params;
    const { projectId } = await request.json();

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(projectId)) {
      return NextResponse.json({ message: 'Invalid collection or project ID' }, { status: 400 });
    }

    const collection = await Collection.findById(id);
    if (!collection || collection.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Collection not found or access denied' }, { status: 404 });
    }

    const projectExists = await Project.exists({ _id: projectId });
    if (!projectExists) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    await Collection.findByIdAndUpdate(
      id,
      { $addToSet: { projects: projectId } },
      { new: true }
    );

    const updatedCollection = await Collection.findById(id).populate({ path: 'projects', populate: [{ path: 'createdBy', select: 'name email' }, { path: 'updatedBy', select: 'name email' }] });

    return NextResponse.json({ message: 'Project added to collection', collection: updatedCollection });
  } catch (error: any) {
    console.error('Collection add project error:', error);
    return NextResponse.json({ message: error.message || 'Failed to add project to collection' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await protect();
    const { id } = await context.params;
    const { projectId } = await request.json();

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(projectId)) {
      return NextResponse.json({ message: 'Invalid collection or project ID' }, { status: 400 });
    }

    const collection = await Collection.findById(id);
    if (!collection || collection.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Collection not found or access denied' }, { status: 404 });
    }

    await Collection.findByIdAndUpdate(
      id,
      { $pull: { projects: projectId } },
      { new: true }
    );

    const updatedCollection = await Collection.findById(id).populate({ path: 'projects', populate: [{ path: 'createdBy', select: 'name email' }, { path: 'updatedBy', select: 'name email' }] });

    return NextResponse.json({ message: 'Project removed from collection', collection: updatedCollection });
  } catch (error: any) {
    console.error('Collection remove project error:', error);
    return NextResponse.json({ message: error.message || 'Failed to remove project from collection' }, { status: 500 });
  }
}
