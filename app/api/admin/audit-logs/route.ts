import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { adminOnly } from '@/backend/middlewares/auth.middleware';
import AuditLog from '@/backend/models/AuditLog';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await adminOnly();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '15', 10);
    const action = searchParams.get('action');
    const search = searchParams.get('search');
    const dateRange = searchParams.get('dateRange') || 'all';

    const query: any = {};

    // Action filter
    if (action && action !== 'all') {
      query.action = action;
    }

    // Search filter (userName, userEmail, or details)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { userName: { $regex: searchRegex } },
        { userEmail: { $regex: searchRegex } },
        { details: { $regex: searchRegex } },
      ];
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      if (dateRange === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setDate(now.getDate() - 30);
      }

      query.createdAt = { $gte: startDate };
    }

    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Audit logs GET error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
