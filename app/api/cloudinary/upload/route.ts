import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as Blob | null;
  const folder = formData.get('folder')?.toString() || 'projecthive';
  const resourceType = (formData.get('resource_type')?.toString() as 'auto' | 'image' | 'video') || 'auto';

  if (!file) {
    return NextResponse.json({ message: 'No file provided' }, { status: 400 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ message: 'Cloudinary is not configured' }, { status: 500 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json(uploadResult);
  } catch (error: any) {
    console.error('Cloudinary upload route error:', error);
    return NextResponse.json({ message: error.message || 'Cloudinary upload failed' }, { status: 500 });
  }
}
