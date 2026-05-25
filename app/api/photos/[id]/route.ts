import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Photo from '@/backend/models/Photo';
import { protect, adminOnly } from '@/backend/middlewares/auth.middleware';
import mongoose from 'mongoose';

export async function DELETE(
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
      return NextResponse.json({ message: 'Invalid photo ID' }, { status: 400 });
    }

    const photo = await Photo.findByIdAndDelete(id);

    if (!photo) {
      return NextResponse.json({ message: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Photo deleted successfully' });
  } catch (error: any) {
    console.error('Photo DELETE error:', error);
    return NextResponse.json({ message: error.message || 'Failed to delete photo' }, { status: 500 });
  }
}

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
    const { title, description, price, tags, technologies } = await request.json();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid photo ID' }, { status: 400 });
    }

    const photo = await Photo.findById(id);

    if (!photo) {
      return NextResponse.json({ message: 'Photo not found' }, { status: 404 });
    }

    if (title) photo.title = title;
    if (description) photo.description = description;
    if (price !== undefined) photo.price = price;
    if (tags) photo.tags = tags;
    if (technologies) photo.technologies = technologies;
    photo.updatedBy = user._id;

    await photo.save();

    return NextResponse.json({ message: 'Photo updated successfully', photo });
  } catch (error: any) {
    console.error('Photo PUT error:', error);
    return NextResponse.json({ message: error.message || 'Failed to update photo' }, { status: 500 });
  }
}