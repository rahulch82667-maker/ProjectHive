import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { User } from '@/backend/models/User';
import Project from '@/backend/models/Project';
import { protect } from '@/backend/middlewares/auth.middleware';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    const user = await protect();

    const currentUser = await User.findById(user._id).select('wishlist');
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const wishlist = await Project.find({
      _id: { $in: currentUser.wishlist || [] },
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    return NextResponse.json(wishlist);
  } catch (error: any) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ message: error.message || 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect();
    const { projectId } = await request.json();

    if (!projectId || !mongoose.isValidObjectId(projectId)) {
      return NextResponse.json({ message: 'Valid projectId is required' }, { status: 400 });
    }

    const projectExists = await Project.exists({ _id: projectId });
    if (!projectExists) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const currentUser = await User.findById(user._id).select('wishlist');
    const isInWishlist = currentUser?.wishlist?.some((id: unknown) => String(id) === projectId);
    const updateQuery: any = isInWishlist
      ? { $pull: { wishlist: projectId } }
      : { $addToSet: { wishlist: projectId } };

    await User.findByIdAndUpdate(user._id, updateQuery, {
      returnDocument: 'after',
    });

    const updatedUser = await User.findById(user._id).select('wishlist');
    if (!updatedUser) {
      return NextResponse.json({ message: 'Unable to update wishlist' }, { status: 500 });
    }

    const wishlist = await Project.find({
      _id: { $in: updatedUser.wishlist || [] },
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    return NextResponse.json({
      message: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist',
      action: isInWishlist ? 'removed' : 'added',
      wishlist,
    });
  } catch (error: any) {
    console.error('Wishlist PATCH error:', error);
    return NextResponse.json({ message: error.message || 'Failed to toggle wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect();
    const { projectId } = await request.json();

    if (!projectId || !mongoose.isValidObjectId(projectId)) {
      return NextResponse.json({ message: 'Valid projectId is required' }, { status: 400 });
    }

    await User.findByIdAndUpdate(
      user._id,
      { $pull: { wishlist: projectId } },
      { new: true }
    );

    const updatedUser = await User.findById(user._id).select('wishlist');
    if (!updatedUser) {
      return NextResponse.json({ message: 'Unable to update wishlist' }, { status: 500 });
    }

    const wishlist = await Project.find({
      _id: { $in: updatedUser.wishlist || [] },
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    return NextResponse.json({ message: 'Removed from wishlist', wishlist });
  } catch (error: any) {
    console.error('Wishlist DELETE error:', error);
    return NextResponse.json({ message: error.message || 'Failed to remove item from wishlist' }, { status: 500 });
  }
}
