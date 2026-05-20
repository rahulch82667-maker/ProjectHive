import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Collection from '@/backend/models/Collection';
import { protect } from '@/backend/middlewares/auth.middleware';

export async function GET() {
  try {
    await connectDB();
    const user = await protect();

    const collections = await Collection.find({ user: user._id }).sort({ updatedAt: -1 });

    return NextResponse.json(collections);
  } catch (error: any) {
    console.error('Collections GET error:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect();
    const { name, description, isPublic } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ message: 'Collection name is required' }, { status: 400 });
    }

    const collection = new Collection({
      name: name.trim(),
      description: description?.trim() || '',
      isPublic: isPublic === true,
      user: user._id,
      projects: [],
    });

    await collection.save();

    return NextResponse.json({ message: 'Collection created successfully', collection }, { status: 201 });
  } catch (error: any) {
    console.error('Collections POST error:', error);
    return NextResponse.json({ message: error.message || 'Failed to create collection' }, { status: 500 });
  }
}
