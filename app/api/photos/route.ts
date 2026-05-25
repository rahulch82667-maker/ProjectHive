import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Photo from '@/backend/models/Photo';
import { protect, adminOnly } from '@/backend/middlewares/auth.middleware';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = searchParams.get('sort') || 'newest';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const technologies = searchParams.get('technologies')?.split(',').filter(Boolean);
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const search = searchParams.get('search');

    const filters: any = {};

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

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { technologies: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Sorting
    let sortOptions = {};
    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const total = await Photo.countDocuments(filters);
    const photos = await Photo.find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sortOptions);

    // Get unique tags and technologies for filters
    const allTags = await Photo.distinct('tags');
    const allTechnologies = await Photo.distinct('technologies');

    return NextResponse.json({
      photos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: {
        tags: allTags,
        technologies: allTechnologies,
      },
    });
  } catch (error: any) {
    console.error('Photos GET error:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch photos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect();
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { title, description, imageUrl, price, tags, technologies } = await request.json();

    if (!title || !description || !imageUrl || price === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, imageUrl, price' },
        { status: 400 }
      );
    }

    const photo = new Photo({
      title,
      description,
      imageUrl,
      price,
      tags: tags || [],
      technologies: technologies || [],
      createdBy: user._id,
      updatedBy: user._id,
    });

    const savedPhoto = await photo.save();

    return NextResponse.json({ message: 'Photo created successfully', photo: savedPhoto }, { status: 201 });
  } catch (error: any) {
    console.error('Photos POST error:', error);
    return NextResponse.json({ message: error.message || 'Failed to create photo' }, { status: 500 });
  }
}