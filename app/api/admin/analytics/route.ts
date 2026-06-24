import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { adminOnly } from '@/backend/middlewares/auth.middleware';
import Order from '@/backend/models/Order';
import { User } from '@/backend/models/User';
import Project from '@/backend/models/Project';

// ── Helper: compute average response time (in hours) for access requests ──
function computeAvgResponseTime(orders: any[]): number {
  const decided = orders.filter(
    (o) => o.accessStatus === 'approved' || o.accessStatus === 'rejected'
  );
  if (decided.length === 0) return 0;

  const totalHours = decided.reduce((sum: number, o: any) => {
    const start = new Date(o.createdAt).getTime();
    const end = o.approvedAt
      ? new Date(o.approvedAt).getTime()
      : o.rejectedAt
      ? new Date(o.rejectedAt).getTime()
      : start;
    return sum + (end - start) / (1000 * 60 * 60);
  }, 0);

  return Math.round((totalHours / decided.length) * 100) / 100;
}

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    await adminOnly();

    const period = req.nextUrl.searchParams.get('period') || 'month';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // ── Aggregate: Total Revenue & Order Stats ──
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$amount' },
        },
      },
    ]);

    // ── Aggregate: Revenue by Project (top sellers) ──
    const revenueByProject = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$projectId',
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          revenue: 1,
          orders: 1,
          title: '$project.title',
          slug: '$project.slug',
          thumbnail: '$project.thumbnail',
          category: '$project.category',
          price: '$project.price',
        },
      },
    ]);

    // ── Aggregate: Monthly Revenue (for chart) ──
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    // ── Aggregate: Revenue by Category ──
    const revenueByCategory = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$project.category',
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // ── Counts ──
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProjects = await Project.countDocuments({ isPublished: true });
    const totalOrders = await Order.countDocuments({ paymentStatus: 'paid' });
    const pendingOrders = await Order.countDocuments({ paymentStatus: 'pending' });

    // ── Recent Orders ──
    const recentOrders = await Order.find({ paymentStatus: 'paid' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('projectId', 'title slug thumbnail price')
      .populate('userId', 'name email avatar')
      .lean();

    // ── Payment Status Breakdown ──
    const paymentStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // ── All-time total revenue ──
    const allTimeRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // ── Admin Performance: Access Request Stats ──
    const accessRequestStats = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$accessStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const pendingCount = accessRequestStats.find((s) => s._id === 'pending')?.count || 0;
    const approvedCount = accessRequestStats.find((s) => s._id === 'approved')?.count || 0;
    const rejectedCount = accessRequestStats.find((s) => s._id === 'rejected')?.count || 0;
    const totalDecided = approvedCount + rejectedCount;
    const approvalRate = totalDecided > 0 ? Math.round((approvedCount / totalDecided) * 100) : 0;
    const rejectionRate = totalDecided > 0 ? Math.round((rejectedCount / totalDecided) * 100) : 0;

    // ── Admin Performance: Average Response Time ──
    const decidedOrders = await Order.find({
      paymentStatus: 'paid',
      accessStatus: { $in: ['approved', 'rejected'] },
      createdAt: { $gte: startDate },
    })
      .select('createdAt approvedAt rejectedAt accessStatus')
      .lean();

    const avgResponseTimeHours = computeAvgResponseTime(decidedOrders);

    const result = {
      summary: {
        totalRevenue: revenueAgg[0]?.totalRevenue || 0,
        totalOrders: revenueAgg[0]?.totalOrders || 0,
        avgOrderValue: revenueAgg[0]?.avgOrderValue || 0,
        totalUsers,
        totalProjects,
        allTimeOrders: totalOrders,
        allTimeRevenue: allTimeRevenueAgg[0]?.total || 0,
        pendingOrders,
      },
      topProjects: revenueByProject,
      monthlyRevenue: monthlyRevenue.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        revenue: item.revenue,
        orders: item.orders,
      })),
      revenueByCategory,
      recentOrders: recentOrders.map((order: any) => ({
        id: order._id,
        amount: order.amount,
        createdAt: order.createdAt,
        project: order.projectId
          ? {
              title: order.projectId.title,
              slug: order.projectId.slug,
              thumbnail: order.projectId.thumbnail,
            }
          : null,
        user: order.userId
          ? {
              name: order.userId.name,
              email: order.userId.email,
              avatar: order.userId.avatar,
            }
          : null,
      })),
      adminPerformance: {
        avgResponseTimeHours,
        pendingRequests: pendingCount,
        approvedRequests: approvedCount,
        rejectedRequests: rejectedCount,
        approvalRate,
        rejectionRate,
        totalDecided,
      },
      paymentStatusBreakdown,
      period,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}