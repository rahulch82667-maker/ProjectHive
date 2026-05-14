import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { protect } from '@/backend/middlewares/auth.middleware';
import { User } from '@/backend/models/User';

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  try {
    const currentUser = await protect();
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { role, isBlocked } = body;

    if (role !== undefined && role !== 'user' && role !== 'admin') {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user._id.equals(currentUser._id) && role === 'user') {
      return NextResponse.json({ message: 'You cannot remove admin access from yourself' }, { status: 400 });
    }

    if (role !== undefined) {
      user.role = role;
    }

    if (typeof isBlocked === 'boolean') {
      if (user._id.equals(currentUser._id) && isBlocked) {
        return NextResponse.json({ message: 'You cannot block your own account' }, { status: 400 });
      }
      user.isBlocked = isBlocked;
    }

    await user.save();

    const updatedUser = await User.findById(id).select('-password');

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to update user' }, { status: 500 });
  }
}
