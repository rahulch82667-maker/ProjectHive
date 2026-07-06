import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { adminOnly } from '@/backend/middlewares/auth.middleware';
import Order from '@/backend/models/Order';
import { User } from '@/backend/models/User';
import Project from '@/backend/models/Project';
import AuditLog from '@/backend/models/AuditLog';
import { toCSV, toPDF, toXLSX, toJSON, getExportFilename } from '@/utils/exporters';

// ── Date range helpers ──

function getDateRange(range: string, startDate?: string, endDate?: string): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now);

  switch (range) {
    case 'daily': {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start.getTime() + 86400000);
      break;
    }
    case '3days': {
      start = new Date(now.getTime() - 3 * 86400000);
      break;
    }
    case '5days': {
      start = new Date(now.getTime() - 5 * 86400000);
      break;
    }
    case 'weekly': {
      const dayOfWeek = now.getDay(); // 0=Sun
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      break;
    }
    case 'monthly': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case 'custom': {
      if (startDate) {
        start = new Date(startDate);
        end = endDate ? new Date(endDate) : end;
        end.setHours(23, 59, 59, 999);
      } else {
        start = new Date(0);
      }
      break;
    }
    default: {
      // monthly fallback
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
  }

  return { start, end };
}

// ── Column definitions per report type ──

const PROJECT_COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'price', label: 'Price' },
  { key: 'salesCount', label: 'Sales' },
  { key: 'rating', label: 'Rating' },
  { key: 'isFeatured', label: 'Featured' },
  { key: 'budget', label: 'Budget' },
  { key: 'createdAt', label: 'Created At' },
];

const TASK_COLUMNS = [
  { key: 'projectTitle', label: 'Project' },
  { key: 'taskName', label: 'Task' },
  { key: 'completed', label: 'Completed' },
  { key: 'createdAt', label: 'Date' },
];

const USER_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'provider', label: 'Provider' },
  { key: 'isVerified', label: 'Verified' },
  { key: 'isBlocked', label: 'Blocked' },
  { key: 'purchasedCount', label: 'Purchases' },
  { key: 'createdAt', label: 'Joined At' },
];

const FINANCIAL_COLUMNS = [
  { key: 'orderId', label: 'Order ID' },
  { key: 'projectTitle', label: 'Project' },
  { key: 'userName', label: 'Customer' },
  { key: 'amount', label: 'Amount' },
  { key: 'paymentStatus', label: 'Payment Status' },
  { key: 'accessStatus', label: 'Access Status' },
  { key: 'createdAt', label: 'Date' },
];

const AUDIT_COLUMNS = [
  { key: 'userName', label: 'User' },
  { key: 'userEmail', label: 'Email' },
  { key: 'action', label: 'Action' },
  { key: 'details', label: 'Details' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'createdAt', label: 'Timestamp' },
];

const PERFORMANCE_COLUMNS = [
  { key: 'period', label: 'Period' },
  { key: 'totalRevenue', label: 'Total Revenue' },
  { key: 'totalOrders', label: 'Total Orders' },
  { key: 'avgOrderValue', label: 'Avg Order Value' },
  { key: 'totalUsers', label: 'Total Users' },
  { key: 'totalProjects', label: 'Total Projects' },
  { key: 'pendingRequests', label: 'Pending Requests' },
  { key: 'approvalRate', label: 'Approval Rate (%)' },
  { key: 'avgResponseTime', label: 'Avg Response Time (hrs)' },
];

// ── Data fetchers ──

async function fetchProjectData(start: Date, end: Date) {
  const projects = await Project.find({
    createdAt: { $gte: start, $lte: end },
  })
    .select('title category status price salesCount rating isFeatured budget createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return projects.map((p: any) => ({
    title: p.title,
    category: p.category,
    status: p.status,
    price: p.price ?? 0,
    salesCount: p.salesCount ?? 0,
    rating: p.rating ?? 0,
    isFeatured: p.isFeatured ? 'Yes' : 'No',
    budget: p.budget ?? 0,
    createdAt: new Date(p.createdAt).toLocaleDateString(),
  }));
}

async function fetchTaskData(start: Date, end: Date) {
  const projects = await Project.find({
    'tasks.0': { $exists: true },
    createdAt: { $gte: start, $lte: end },
  })
    .select('title tasks createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const rows: Record<string, any>[] = [];
  for (const p of (projects as any[])) {
    for (const task of (p.tasks || [])) {
      rows.push({
        projectTitle: p.title,
        taskName: task.name,
        completed: task.completed ? 'Yes' : 'No',
        createdAt: new Date(p.createdAt).toLocaleDateString(),
      });
    }
  }
  return rows;
}

async function fetchUserData(start: Date, end: Date) {
  const users = await User.find({
    createdAt: { $gte: start, $lte: end },
  })
    .select('name email role provider isVerified isBlocked purchasedProjects createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return users.map((u: any) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    provider: u.provider,
    isVerified: u.isVerified ? 'Yes' : 'No',
    isBlocked: u.isBlocked ? 'Yes' : 'No',
    purchasedCount: (u.purchasedProjects || []).length,
    createdAt: new Date(u.createdAt).toLocaleDateString(),
  }));
}

async function fetchFinancialData(start: Date, end: Date) {
  const orders = await Order.find({
    createdAt: { $gte: start, $lte: end },
  })
    .populate('projectId', 'title')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return (orders as any[]).map((o: any) => ({
    orderId: o._id.toString().slice(-8).toUpperCase(),
    projectTitle: o.projectId?.title || 'N/A',
    userName: o.userId?.name || 'N/A',
    amount: o.amount ?? 0,
    paymentStatus: o.paymentStatus,
    accessStatus: o.accessStatus,
    createdAt: new Date(o.createdAt).toLocaleDateString(),
  }));
}

async function fetchAuditData(start: Date, end: Date) {
  const logs = await AuditLog.find({
    createdAt: { $gte: start, $lte: end },
  })
    .sort({ createdAt: -1 })
    .lean();

  return logs.map((l: any) => ({
    userName: l.userName,
    userEmail: l.userEmail,
    action: l.action,
    details: l.details,
    ipAddress: l.ipAddress || 'N/A',
    createdAt: new Date(l.createdAt).toLocaleString(),
  }));
}

async function fetchPerformanceData(start: Date, end: Date) {
  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$amount' },
      },
    },
  ]);

  const totalUsers = await User.countDocuments({ role: 'user', createdAt: { $gte: start, $lte: end } });
  const totalProjects = await Project.countDocuments({ isPublished: true, createdAt: { $gte: start, $lte: end } });

  const accessRequestStats = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: start, $lte: end } } },
    { $group: { _id: '$accessStatus', count: { $sum: 1 } } },
  ]);

  const pendingCount = accessRequestStats.find((s: any) => s._id === 'pending')?.count || 0;
  const approvedCount = accessRequestStats.find((s: any) => s._id === 'approved')?.count || 0;
  const rejectedCount = accessRequestStats.find((s: any) => s._id === 'rejected')?.count || 0;
  const totalDecided = approvedCount + rejectedCount;
  const approvalRate = totalDecided > 0 ? Math.round((approvedCount / totalDecided) * 100) : 0;

  const decidedOrders = await Order.find({
    paymentStatus: 'paid',
    accessStatus: { $in: ['approved', 'rejected'] },
    createdAt: { $gte: start, $lte: end },
  })
    .select('createdAt approvedAt rejectedAt accessStatus')
    .lean();

  let avgResponseTime = 0;
  if (decidedOrders.length > 0) {
    const totalHours = (decidedOrders as any[]).reduce((sum, o) => {
      const s = new Date(o.createdAt).getTime();
      const e = o.approvedAt
        ? new Date(o.approvedAt).getTime()
        : o.rejectedAt
        ? new Date(o.rejectedAt).getTime()
        : s;
      return sum + (e - s) / (1000 * 60 * 60);
    }, 0);
    avgResponseTime = Math.round((totalHours / decidedOrders.length) * 100) / 100;
  }

  return [
    {
      period: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      totalRevenue: revenueAgg[0]?.totalRevenue || 0,
      totalOrders: revenueAgg[0]?.totalOrders || 0,
      avgOrderValue: Math.round((revenueAgg[0]?.avgOrderValue || 0) * 100) / 100,
      totalUsers,
      totalProjects,
      pendingRequests: pendingCount,
      approvalRate,
      avgResponseTime,
    },
  ];
}

// ── Report type dispatcher ──

type ReportType = 'projects' | 'tasks' | 'users' | 'financial' | 'audit' | 'performance';
type ExportFormat = 'csv' | 'pdf' | 'xlsx' | 'json';

const DATA_FETCHERS: Record<ReportType, (start: Date, end: Date) => Promise<Record<string, any>[]>> = {
  projects: fetchProjectData,
  tasks: fetchTaskData,
  users: fetchUserData,
  financial: fetchFinancialData,
  audit: fetchAuditData,
  performance: fetchPerformanceData,
};

const COLUMN_MAP: Record<ReportType, { key: string; label: string }[]> = {
  projects: PROJECT_COLUMNS,
  tasks: TASK_COLUMNS,
  users: USER_COLUMNS,
  financial: FINANCIAL_COLUMNS,
  audit: AUDIT_COLUMNS,
  performance: PERFORMANCE_COLUMNS,
};

const TITLE_MAP: Record<ReportType, string> = {
  projects: 'Project Report',
  tasks: 'Task Report',
  users: 'User Report',
  financial: 'Financial Report',
  audit: 'Audit Log Report',
  performance: 'Performance Report',
};

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    await adminOnly();

    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get('range') || 'monthly';
    const format = (searchParams.get('format') || 'csv') as ExportFormat;
    const reportType = (searchParams.get('type') || 'projects') as ReportType;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const { start, end } = getDateRange(range, startDate, endDate);
    const fetcher = DATA_FETCHERS[reportType];
    const columns = COLUMN_MAP[reportType];
    const title = TITLE_MAP[reportType];

    if (!fetcher || !columns) {
      return NextResponse.json({ message: 'Invalid report type' }, { status: 400 });
    }

    const data = await fetcher(start, end);
    const baseName = title.toLowerCase().replace(/\s+/g, '_');

    let body: string | Uint8Array;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'csv': {
        body = toCSV(data, columns);
        contentType = 'text/csv';
        filename = getExportFilename(baseName, 'csv');
        break;
      }
      case 'pdf': {
        const pdfBuffer = await toPDF(data, columns, title);
        body = new Uint8Array(pdfBuffer);
        contentType = 'application/pdf';
        filename = getExportFilename(baseName, 'pdf');
        break;
      }
      case 'xlsx': {
        const xlsxBuffer = toXLSX(data, columns, title);
        body = new Uint8Array(xlsxBuffer);
        contentType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = getExportFilename(baseName, 'xlsx');
        break;
      }
      case 'json': {
        body = toJSON(data);
        contentType = 'application/json';
        filename = getExportFilename(baseName, 'json');
        break;
      }
      default: {
        return NextResponse.json({ message: 'Invalid export format' }, { status: 400 });
      }
    }

    return new NextResponse(body as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to generate export' },
      { status: 500 }
    );
  }
}