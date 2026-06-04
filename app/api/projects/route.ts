import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Project from '@/backend/models/Project';
import { protect } from '@/backend/middlewares/auth.middleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : undefined;
    
    const technologiesParam = searchParams.get('technologies');
    const technologies = technologiesParam ? technologiesParam.split(',').filter(Boolean) : undefined;
    
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    
    const isFeaturedParam = searchParams.get('isFeatured');
    const isFeatured = isFeaturedParam !== null ? isFeaturedParam === 'true' : undefined;
    const hasVideoParam = searchParams.get('hasVideo');
    const hasVideo = hasVideoParam !== null ? hasVideoParam === 'true' : undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const filters: any = {};

    // Always filter for published projects for templates page
    if (status) {
      filters.status = status;
    } else {
      filters.status = 'published'; // Default to published for templates
    }

    if (category) {
      filters.category = category;
    }

    if (tags && tags.length > 0) {
      filters.tags = { $in: tags };
    }

    if (technologies && technologies.length > 0) {
      filters.technologies = { $in: technologies };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) filters.price.$gte = minPrice;
      if (maxPrice !== undefined) filters.price.$lte = maxPrice;
    }

    if (isFeatured === true) {
      filters.isFeatured = true;
    }

    if (hasVideo === true) {
      filters.demoVideo = { $ne: null, $exists: true };
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { fullDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { technologies: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const total = await Project.countDocuments(filters);
    const projects = await Project.find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sortOptions);

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
      zipUrl,
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
      zipUrl,
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
