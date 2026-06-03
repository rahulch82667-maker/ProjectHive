import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import { protect } from '@/backend/middlewares/auth.middleware';
import { User } from '@/backend/models/User';
import Project from '@/backend/models/Project';
import Order from '@/backend/models/Order';

export async function GET() {
  try {
    await connectDB();
    const user = await protect();

    // Get user with populated purchased projects
    const userWithProjects = await User.findById(user._id)
      .populate('purchasedProjects');

    if (!userWithProjects) {
      return NextResponse.json({ projects: [] });
    }

    // Get purchase dates for each project
    const projectsWithPurchaseInfo = await Promise.all(
      (userWithProjects.purchasedProjects || []).map(async (project: any) => {
        const order = await Order.findOne({
          userId: user._id,
          projectId: project._id,
          paymentStatus: 'paid',
          accessStatus: 'approved'
        }).sort({ createdAt: -1 });

        return {
          _id: project._id,
          title: project.title,
          category: project.category,
          description: project.shortDescription,
          thumbnail: project.thumbnail,
          price: project.price,
          slug: project.slug,
          purchaseDate: order?.createdAt || new Date(),
          orderId: order?._id,
        };
      })
    );

    return NextResponse.json({ projects: projectsWithPurchaseInfo });
  } catch (error: any) {
    console.error('Purchased projects error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}