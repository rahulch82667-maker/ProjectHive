import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Project from '@/backend/models/Project';
import { protect } from '@/backend/middlewares/auth.middleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const filters: any = {};

    if (category) {
      filters.category = category;
    }

    if (status) {
      filters.status = status;
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Project.countDocuments(filters);
    const projects = await Project.find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      projects,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Project GET error:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect();

    const {
      title,
      shortDescription,
      fullDescription,
      price,
      discountPrice,
      discountPercentage,
      category,
      tags,
      thumbnail,
      images,
      demoVideo,
      liveDemoLink,
      technologies,
      isFeatured,
      isPublished,
      status,
      stock,
      faq,
      requirements,
      fileSize,
      version,
    } = await request.json();

    if (!title || !shortDescription || !fullDescription || price === undefined || !category || !thumbnail) {
      return NextResponse.json(
        { message: 'Missing required fields: title, shortDescription, fullDescription, price, category, thumbnail' },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const project = new Project({
      title,
      slug,
      shortDescription,
      fullDescription,
      price,
      discountPrice,
      discountPercentage,
      category,
      tags: tags || [],
      thumbnail,
      images: images || [],
      demoVideo,
      liveDemoLink,
      technologies: technologies || [],
      isFeatured: isFeatured || false,
      isPublished: isPublished || false,
      status: status || 'draft',
      stock: stock !== undefined ? stock : -1,
      faq: faq || [],
      requirements: requirements || [],
      fileSize,
      version,
      createdBy: user._id,
      updatedBy: user._id,
    });

    const savedProject = await project.save();

    return NextResponse.json({ message: 'Project created successfully', project: savedProject }, { status: 201 });
  } catch (error: any) {
    console.error('Project POST error:', error);
    return NextResponse.json({ message: error.message || 'Failed to create project' }, { status: 500 });
  }
}
