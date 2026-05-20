import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Collection from '@/backend/models/Collection';
import { protect } from '@/backend/middlewares/auth.middleware';
import mongoose from 'mongoose';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await protect();
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid collection ID' }, { status: 400 });
    }

    const collection = await Collection.findById(id).populate({ path: 'projects', populate: [{ path: 'createdBy', select: 'name email' }, { path: 'updatedBy', select: 'name email' }] });

    if (!collection || collection.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Collection not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error: any) {
    console.error('Collection GET by ID error:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch collection' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await protect();
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid collection ID' }, { status: 400 });
    }

    const collection = await Collection.findById(id);
    if (!collection || collection.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Collection not found or access denied' }, { status: 404 });
    }

    const { name, description, isPublic } = await request.json();

    if (name && typeof name === 'string') {
      collection.name = name.trim();
    }
    if (description !== undefined) {
      collection.description = String(description).trim();
    }
    if (typeof isPublic === 'boolean') {
      collection.isPublic = isPublic;
    }

    await collection.save();

    return NextResponse.json({ message: 'Collection updated successfully', collection });
  } catch (error: any) {
    console.error('Collection PUT error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await protect();
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid collection ID' }, { status: 400 });
    }

    const collection = await Collection.findById(id);
    if (!collection || collection.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Collection not found or access denied' }, { status: 404 });
    }

    await collection.deleteOne();

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error: any) {
    console.error('Collection DELETE error:', error);
    return NextResponse.json({ message: error.message || 'Failed to delete collection' }, { status: 500 });
  }
}
