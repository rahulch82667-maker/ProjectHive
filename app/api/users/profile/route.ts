import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { protect } from '@/backend/middlewares/auth.middleware';
import { User } from '@/backend/models/User';
import Order from '@/backend/models/Order';

// GET /api/users/profile
export async function GET() {
  try {
    await connectDB();
    const authUser = await protect();

    const user = await User.findById(authUser._id).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Aggregate stats
    const totalPurchases = await Order.countDocuments({
      userId: authUser._id,
      paymentStatus: 'paid',
      accessStatus: 'approved',
    });

    const totalSpent = await Order.aggregate([
      {
        $match: {
          userId: authUser._id,
          paymentStatus: 'paid',
          accessStatus: 'approved',
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const pendingOrders = await Order.countDocuments({
      userId: authUser._id,
      paymentStatus: 'paid',
      accessStatus: 'pending',
    });

    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
        role: user.role,
        isVerified: user.isVerified,
        wishlistCount: user.wishlist?.length ?? 0,
        purchasedCount: user.purchasedProjects?.length ?? 0,
        createdAt: user.createdAt,
      },
      stats: {
        totalPurchases,
        totalSpent: totalSpent[0]?.total ?? 0,
        pendingOrders,
        wishlistCount: user.wishlist?.length ?? 0,
      },
    });
  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/users/profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await protect();

    const { name, avatar } = await request.json();

    const updateFields: any = {};
    if (name && name.trim()) updateFields.name = name.trim();
    if (avatar !== undefined) updateFields.avatar = avatar;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      authUser._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        provider: updatedUser.provider,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        wishlistCount: updatedUser.wishlist?.length ?? 0,
        purchasedCount: updatedUser.purchasedProjects?.length ?? 0,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}