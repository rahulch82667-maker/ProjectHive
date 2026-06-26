import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { adminOnly } from '@/backend/middlewares/auth.middleware';
import Project from '@/backend/models/Project';
import Order from '@/backend/models/Order';

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const admin = await adminOnly();

    // ── 1. New Projects created by the admin ──
    const newProjects = await Project.find({ createdBy: admin._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title slug status createdAt')
      .lean();

    // ── 2. Unpublished / Draft Projects ──
    const draftProjects = await Project.find({ status: 'draft' })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title slug status updatedAt')
      .lean();

    // ── 3. Pending Approval Requests ──
    const pendingApprovals = await Order.find({ accessStatus: 'pending' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('projectId', 'title slug')
      .populate('userId', 'name email')
      .lean();

    // ── Build notifications ──
    const notifications: {
      type: 'new_project' | 'draft_project' | 'pending_approval';
      label: string;
      message: string;
      link: string;
      createdAt: string;
      projectTitle: string;
    }[] = [];

    // New projects by this admin
    for (const project of newProjects) {
      notifications.push({
        type: 'new_project',
        label: 'New Project Created',
        message: `You created "${project.title}"`,
        link: `/admin/projects/${project.slug}`,
        createdAt: (project as any).createdAt?.toISOString?.() || new Date().toISOString(),
        projectTitle: project.title,
      });
    }

    // Draft projects
    for (const project of draftProjects) {
      notifications.push({
        type: 'draft_project',
        label: 'Unpublished Draft',
        message: `"${project.title}" is still in draft mode`,
        link: `/admin/projects/${project.slug}`,
        createdAt: (project as any).updatedAt?.toISOString?.() || new Date().toISOString(),
        projectTitle: project.title,
      });
    }

    // Pending approval requests
    for (const order of pendingApprovals) {
      const project = order.projectId as any;
      const user = order.userId as any;
      notifications.push({
        type: 'pending_approval',
        label: 'Pending Approval Request',
        message: `${user?.name || 'A user'} requested access to "${project?.title || 'a project'}"`,
        link: `/admin/access-requests`,
        createdAt: (order as any).createdAt?.toISOString?.() || new Date().toISOString(),
        projectTitle: project?.title || 'Unknown Project',
      });
    }

    // Sort by newest first
    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(
      {
        notifications,
        counts: {
          total: notifications.length,
          newProjects: newProjects.length,
          draftProjects: draftProjects.length,
          pendingApprovals: pendingApprovals.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}