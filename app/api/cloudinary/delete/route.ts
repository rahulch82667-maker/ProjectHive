import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const { publicId, resourceType = 'auto' } = await request.json();

  if (!publicId) {
    return NextResponse.json({ message: 'publicId is required' }, { status: 400 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ message: 'Cloudinary is not configured' }, { status: 500 });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Cloudinary delete route error:', error);
    return NextResponse.json({ message: error.message || 'Cloudinary delete failed' }, { status: 500 });
  }
}
