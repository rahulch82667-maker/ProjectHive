import { Request, Response } from 'express';
import Project, { IProject } from '../models/Project';
import { AuthRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

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
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !shortDescription ||
      !fullDescription ||
      price === undefined ||
      !category ||
      !thumbnail
    ) {
      return res.status(400).json({
        message: 'Missing required fields: title, shortDescription, fullDescription, price, category, thumbnail',
      });
    }

    // Generate slug from title
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
      createdBy: userId,
      updatedBy: userId,
    });

    const savedProject = await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project: savedProject,
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({
      message: error.message || 'Failed to create project',
    });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category, search, status, hasVideo } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const filters: any = {};

    if (category) {
      filters.category = category;
    }

    if (status) {
      filters.status = status;
    }

    if (hasVideo === 'true') {
      filters.demoVideo = { $ne: null, $exists: true };
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Project.countDocuments(filters);
    const projects = await Project.find(filters)
      .skip(skip)
      .limit(parseInt(limit as string))
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      projects,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch projects',
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('reviews');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch project',
    });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update fields
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
    } = req.body;

    if (title) {
      project.title = title;
      // Regenerate slug when title changes
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

    project.updatedBy = userId;

    const updatedProject = await project.save();

    res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({
      message: error.message || 'Failed to update project',
    });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      message: error.message || 'Failed to delete project',
    });
  }
};

export const getProjectBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const project = await Project.findOne({ slug })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('reviews');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error: any) {
    console.error('Error fetching project by slug:', error);
    res.status(500).json({
      message: error.message || 'Failed to fetch project',
    });
  }
};
