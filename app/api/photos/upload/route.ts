import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { protect, adminOnly } from '@/backend/middlewares/auth.middleware';
import { uploadToCloudinary } from '@/backend/utils/cloudinary';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect();
    
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ message: 'No image file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const { url } = await uploadToCloudinary(dataURI);

    return NextResponse.json({ url, message: 'Image uploaded successfully' });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: error.message || 'Failed to upload image' }, { status: 500 });
  }
}