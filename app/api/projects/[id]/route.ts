import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Project from '@/backend/models/Project';
import { protect } from '@/backend/middlewares/auth.middleware';
import mongoose from 'mongoose';
import { createAuditLog } from '@/backend/utils/auditLogger';

//  GET
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid project ID' }, { status: 400 });
    }

    const project = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Project GET by ID error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

//  PUT
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await protect();
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid project ID' }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();

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
    } = body;

    if (title) {
      project.title = title;
      project.slug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    if (shortDescription) project.shortDescription = shortDescription;
    if (fullDescription) project.fullDescription = fullDescription;
    if (price !== undefined) project.price = price;
    if (discountPrice !== undefined) project.discountPrice = discountPrice;
    if (discountPercentage !== undefined) project.discountPercentage = discountPercentage;
    if (category) project.category = category;
    if (tags) project.tags = tags;
    if (thumbnail) project.thumbnail = thumbnail;
    if (images) project.images = images;
    if (demoVideo) project.demoVideo = demoVideo;
    if (liveDemoLink) project.liveDemoLink = liveDemoLink;
    if (technologies) project.technologies = technologies;
    if (isFeatured !== undefined) project.isFeatured = isFeatured;
    if (isPublished !== undefined) project.isPublished = isPublished;
    if (status) project.status = status;
    if (stock !== undefined) project.stock = stock;
    if (faq) project.faq = faq;
    if (requirements) project.requirements = requirements;
    if (fileSize) project.fileSize = fileSize;
    if (version) project.version = version;
    if (zipUrl !== undefined) project.zipUrl = zipUrl;

    project.updatedBy = user._id;

    const updatedProject = await project.save();

    await createAuditLog({
      userId: user._id,
      action: 'PROJECT_EDIT',
      details: `Updated project "${project.title}"`,
      req: request,
    });

    return NextResponse.json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error: any) {
    console.error('Project PUT error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

//  DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const user = await protect();
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid project ID' }, { status: 400 });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    await createAuditLog({
      userId: user._id,
      action: 'PROJECT_DELETE',
      details: `Deleted project "${project.title}"`,
      req: request,
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Project DELETE error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}