import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Order from '@/backend/models/Order';
import Project from '@/backend/models/Project';
import { User } from '@/backend/models/User';
import { protect, adminOnly } from '@/backend/middlewares/auth.middleware';
import { sendEmail } from '@/backend/utils/email';

// GET all access requests
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const admin = await protect();
    
    if (admin.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filters: any = { paymentStatus: 'paid' };
    
    if (status && status !== 'all') {
      filters.accessStatus = status;
    }

    const orders = await Order.find(filters)
      .populate('userId', 'name email')
      .populate('projectId', 'title thumbnail category price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Order.countDocuments(filters);

    // Apply search filter
    let filteredOrders = orders;
    if (search) {
      filteredOrders = orders.filter(order => {
        const user = order.userId as any;
        const project = order.projectId as any;
        return (
          user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          project?.title?.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    const stats = {
      pending: await Order.countDocuments({ paymentStatus: 'paid', accessStatus: 'pending' }),
      approved: await Order.countDocuments({ paymentStatus: 'paid', accessStatus: 'approved' }),
      rejected: await Order.countDocuments({ paymentStatus: 'paid', accessStatus: 'rejected' }),
      total: await Order.countDocuments({ paymentStatus: 'paid' }),
    };

    return NextResponse.json({
      orders: filteredOrders,
      total: filteredOrders.length,
      page,
      totalPages: Math.ceil(total / limit),
      stats,
    });
  } catch (error: any) {
    console.error('Access requests GET error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}