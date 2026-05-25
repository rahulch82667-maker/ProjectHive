import { Request, Response } from 'express';
import Photo, { IPhoto } from '../models/Photo';
import { AuthRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

// Create a new photo (admin only)
export const createPhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { title, description, imageUrl, price, tags, technologies } = req.body;
    if (!title || !description || !imageUrl || price === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const photo = new Photo({
      title,
      description,
      imageUrl,
      price,
      tags: tags || [],
      technologies: technologies || [],
      createdBy: userId,
      updatedBy: userId,
    });
    const saved = await photo.save();
    return res.status(201).json({ message: 'Photo created', photo: saved });
  } catch (error: any) {
    console.error('Create photo error:', error);
    return res.status(500).json({ message: error.message || 'Failed to create photo' });
  }
};

// Get photos with filters, pagination
export const getPhotos = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '12', sort = 'newest', tags, technologies, minPrice, maxPrice, search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filters: any = {};

    if (tags) {
      const tagArr = (tags as string).split(',').filter(Boolean);
      if (tagArr.length) filters.tags = { $in: tagArr };
    }
    if (technologies) {
      const techArr = (technologies as string).split(',').filter(Boolean);
      if (techArr.length) filters.technologies = { $in: techArr };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) filters.price.$gte = parseFloat(minPrice as string);
      if (maxPrice !== undefined) filters.price.$lte = parseFloat(maxPrice as string);
    }
    if (search) {
      const s = search as string;
      filters.$or = [
        { title: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { tags: { $in: [new RegExp(s, 'i')] } },
        { technologies: { $in: [new RegExp(s, 'i')] } },
      ];
    }

    // Sorting
    let sortOptions: any = {};
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
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sortOptions);

    const allTags = await Photo.distinct('tags');
    const allTech = await Photo.distinct('technologies');

    return res.json({
      photos,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      filters: { tags: allTags, technologies: allTech },
    });
  } catch (error: any) {
    console.error('Get photos error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch photos' });
  }
};

// Update an existing photo (admin only)
export const updatePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photo ID' });
    }
    const { title, description, imageUrl, price, tags, technologies } = req.body;
    const updated = await Photo.findByIdAndUpdate(
      id,
      { title, description, imageUrl, price, tags, technologies, updatedBy: userId },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    return res.json({ message: 'Photo updated', photo: updated });
  } catch (error: any) {
    console.error('Update photo error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update photo' });
  }
};

// Delete a photo (admin only)
export const deletePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid photo ID' });
    }
    const deleted = await Photo.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    return res.json({ message: 'Photo deleted' });
  } catch (error: any) {
    console.error('Delete photo error:', error);
    return res.status(500).json({ message: error.message || 'Failed to delete photo' });
  }
};
