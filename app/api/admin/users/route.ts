import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { protect } from '@/backend/middlewares/auth.middleware';
import { User } from '@/backend/models/User';

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const currentUser = await protect();
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    const search = req.nextUrl.searchParams.get('search') || '';
    const page = Math.max(1, Number(req.nextUrl.searchParams.get('page')) || 1);
    const limit = Math.max(1, Number(req.nextUrl.searchParams.get('limit')) || 10);

    const query: any = {};
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(totalUsers / limit));

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password')
      .lean();

    return NextResponse.json({
      users,
      page,
      limit,
      totalPages,
      totalUsers,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}
