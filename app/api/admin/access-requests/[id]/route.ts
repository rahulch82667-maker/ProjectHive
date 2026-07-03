import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Order from '@/backend/models/Order';
import Project from '@/backend/models/Project';
import { User } from '@/backend/models/User';
import { protect, adminOnly } from '@/backend/middlewares/auth.middleware';
import { sendEmail } from '@/backend/utils/email';
import mongoose from 'mongoose';
import { createAuditLog } from '@/backend/utils/auditLogger';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const admin = await protect();
    
    if (admin.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const { action } = await request.json(); // 'approve' or 'reject'

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
    }

    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('projectId', 'title thumbnail category price description');

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.accessStatus !== 'pending') {
      return NextResponse.json({ message: 'Order already processed' }, { status: 400 });
    }

    const user = order.userId as any;
    const project = order.projectId as any;

    if (action === 'approve') {
      // Add project to user's purchased projects
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { purchasedProjects: order.projectId }
      });

      order.accessStatus = 'approved';
      order.approvedAt = new Date();
      await order.save();

      await createAuditLog({
        userId: admin._id,
        action: 'ACCESS_REQUEST_DECISION',
        details: `Approved access request for project "${project.title}" by user "${user.name}" (${user.email})`,
        req: request,
      });

      // Send approval email to user
      const approvalEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #3b1f0a;">Access Approved! 🎉</h2>
          <p>Dear ${user.name},</p>
          <p>Great news! Your access to <strong>${project.title}</strong> has been approved.</p>
          <p>You can now download and use this project from your <strong>My Projects</strong> page.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Purchase Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <a href="${process.env.CLIENT_URL}/my-projects" style="background: #3b1f0a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Go to My Projects
          </a>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: `Access Approved: ${project.title}`,
        message: `Your access to ${project.title} has been approved.`,
        html: approvalEmailHtml,
      });

      return NextResponse.json({ message: 'Access approved successfully' });
    } 
    
    else if (action === 'reject') {
      order.accessStatus = 'rejected';
      order.rejectedAt = new Date();
      await order.save();

      await createAuditLog({
        userId: admin._id,
        action: 'ACCESS_REQUEST_DECISION',
        details: `Rejected access request for project "${project.title}" by user "${user.name}" (${user.email})`,
        req: request,
      });

      // Send rejection email to user
      const rejectionEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #dc2626;">Access Request Update</h2>
          <p>Dear ${user.name},</p>
          <p>We regret to inform you that your access request for <strong>${project.title}</strong> has been rejected.</p>
          <p>Please contact support if you believe this is an error.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Project:</strong> ${project.title}</p>
          </div>
          <a href="mailto:support@projecthive.com" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Contact Support
          </a>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: `Access Request Update: ${project.title}`,
        message: `Your access request for ${project.title} has been rejected.`,
        html: rejectionEmailHtml,
      });

      return NextResponse.json({ message: 'Access rejected' });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Access request update error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}