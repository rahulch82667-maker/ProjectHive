import { NextRequest, NextResponse } from 'next/server';
import { protect } from '../middlewares/auth.middleware';
import { connectDB } from '../config/db';
import Order from '../models/Order';
import Project from '../models/Project';
import { User } from '../models/User';
import { sendEmail } from '../utils/email';
import { generateInvoicePDF } from '../utils/invoice';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-05-28.basil' as any,
});

/**
 * Initiates a Stripe Checkout Session for a specific project.
 * POST /api/checkout/initiate
 */
export const initiateCheckout = async (req: NextRequest) => {
  try {
    await connectDB();
    
    // Authenticate the user initiating checkout
    const user = await protect();
    
    const { projectId, billingDetails } = await req.json();

    if (!projectId) {
      return NextResponse.json({ message: 'Project ID is required' }, { status: 400 });
    }

    if (!billingDetails || !billingDetails.firstName || !billingDetails.lastName || !billingDetails.email || !billingDetails.addressLine1 || !billingDetails.city || !billingDetails.state || !billingDetails.zipCode || !billingDetails.country) {
      return NextResponse.json({ message: 'Incomplete billing details' }, { status: 400 });
    }

    // 1. Fetch project from database
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Determine purchase amount (use discountPrice if available)
    const amount = project.discountPrice !== undefined && project.discountPrice > 0 
      ? project.discountPrice 
      : project.price;

    // 2. Create Order document in MongoDB with pending status
    const order = new Order({
      userId: user._id,
      projectId: project._id,
      billingDetails,
      amount,
      paymentStatus: 'paid',
      accessStatus: 'pending',
      stripeSessionId: 'placeholder', // Placeholder until Stripe session is generated
    });
    
    await order.save();

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency: 'usd',
      customer_email: billingDetails.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: project.title,
              description: project.shortDescription,
              images: project.thumbnail ? [project.thumbnail] : undefined,
            },
            unit_amount: Math.round(amount * 100), // Stripe takes amounts in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
        projectId: project._id.toString(),
      },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/cancel`,
    });

    // 4. Update the order with the actual Stripe Session ID
    order.stripeSessionId = session.id;
    await order.save();

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error: any) {
    console.error('Checkout initiate error:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred during checkout initiation' },
      { status: 500 }
    );
  }
};

/**
 * Stripe Webhook endpoint to securely capture checkout completions.
 * POST /api/webhook/stripe
 */
export const stripeWebhook = async (req: NextRequest) => {
  try {
    await connectDB();

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ message: 'No Stripe signature found' }, { status: 400 });
    }

    const rawBody = await req.text();
    let event: any;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log(`Received stripe webhook event: ${event.type}`);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;
      const projectId = session.metadata?.projectId;

      console.log('Webhook session metadata:', { orderId, userId, projectId });

      if (!orderId) {
        console.error('No orderId found in session metadata');
        return NextResponse.json({ message: 'Missing metadata' }, { status: 400 });
      }

      // Fetch the order
      const order = await Order.findById(orderId);
      if (!order) {
        console.error(`Order ${orderId} not found in database`);
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
      }

      // Idempotency check: if order is already processed as paid, return early
      if (order.paymentStatus === 'paid') {
        console.log(`Order ${orderId} is already paid. Skipping duplicate hook processing.`);
        return NextResponse.json({ received: true });
      }

      // Update Order Status - Payment is successful but access is pending
      order.paymentStatus = 'paid';
      order.accessStatus = 'pending'; // IMPORTANT: Access is pending admin approval
      await order.save();

      console.log(`✅ Order ${orderId} marked as paid. Access status: pending`);

      // Fetch the project details for email
      const project = await Project.findById(projectId);
      
      if (project) {
        try {
          // 1. Send confirmation email to USER (but they don't get access yet)
          const userEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
              <div style="text-align: center; border-bottom: 2px solid #f5f5f5; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #3b1f0a; margin: 0; font-size: 24px;">Payment Received! 🎉</h1>
                <p style="color: #666; font-size: 14px; margin-top: 5px;">Your payment has been successfully processed</p>
              </div>
              
              <p style="font-size: 16px; color: #333;">Hi ${order.billingDetails.firstName},</p>
              <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Thank you for purchasing <strong>${project.title}</strong>! Your payment of <strong>$${order.amount.toFixed(2)}</strong> has been successfully processed.
              </p>
              
              <div style="background-color: #fcf9f6; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
                <h3 style="color: #d97706; margin-top: 0; margin-bottom: 10px; font-size: 15px;">⏳ Pending Admin Approval</h3>
                <p style="margin: 0; font-size: 14px; color: #555;">
                  Your order is now pending admin approval. Once approved, you will receive another email with access instructions.
                  This usually takes 1-2 business days.
                </p>
              </div>
              
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Order Summary:</strong></p>
                <p style="margin: 5px 0;"><strong>Project:</strong> ${project.title}</p>
                <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
                <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${order.amount.toFixed(2)}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> Pending Approval</p>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 ProjectHive. All rights reserved.</p>
            </div>
          `;

          await sendEmail({
            email: order.billingDetails.email,
            subject: `Payment Confirmation: ${project.title} - Pending Approval`,
            message: `Your payment for ${project.title} has been received. Your access is pending admin approval.`,
            html: userEmailHtml,
          });
          console.log(`✅ User payment confirmation email sent to: ${order.billingDetails.email}`);

          // 2. Send ADMIN notification about pending access request
          const adminEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #3b1f0a; border-bottom: 2px solid #f5f5f5; padding-bottom: 15px; margin-top: 0;">🛒 New Purchase - Pending Access</h2>
              <p style="font-size: 14px; color: #333;">Hello Admin,</p>
              <p style="font-size: 14px; color: #555;">A new purchase requires your approval. Here are the details:</p>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0; background-color: #fafafa;">
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 150px;">Order ID:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${order._id.toString()}</td>
                 </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Project Name:</td>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #3b1f0a;">${project.title}</td>
                 </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Amount Paid:</td>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #10B981;">$${order.amount.toFixed(2)}</td>
                 </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Buyer Name:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${order.billingDetails.firstName} ${order.billingDetails.lastName}</td>
                 </tr>
                <tr style="background-color: #f5f5f5;">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Buyer Email:</td>
                  <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${order.billingDetails.email}">${order.billingDetails.email}</a></td>
                 </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Stripe Session:</td>
                  <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px; word-break: break-all;">${order.stripeSessionId}</td>
                 </tr>
              </table>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  ⚠️ This order requires admin approval before the user can access the project.
                </p>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <a href="${process.env.CLIENT_URL}/admin/access-requests" 
                   style="background-color: #3b1f0a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  View Access Requests
                </a>
              </div>
              
              <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
              <p style="font-size: 11px; color: #aaa; text-align: center;">ProjectHive Administrative Notifications • ${new Date().getFullYear()}</p>
            </div>
          `;

          const adminEmail = process.env.EMAIL_USER;
          if (adminEmail) {
            await sendEmail({
              email: adminEmail,
              subject: `[PENDING APPROVAL] $${order.amount.toFixed(2)} - ${project.title} purchased by ${order.billingDetails.firstName}`,
              message: `A new purchase requires your approval. Order ID: ${order._id}`,
              html: adminEmailHtml,
            });
            console.log(`✅ Admin notification sent to: ${adminEmail}`);
          } else {
            console.error('❌ ADMIN EMAIL not configured! Cannot send admin notification.');
          }

        } catch (emailErr: any) {
          console.error('❌ Failed to send email notifications:', emailErr);
          // Don't throw - webhook should still return success
        }
      } else {
        console.warn('Project not found for email notifications');
      }

      // IMPORTANT: DO NOT grant access here - wait for admin approval
      console.log(`📝 Order ${orderId} is pending admin approval. Access not granted yet.`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing failure:', error);
    return NextResponse.json(
      { message: error.message || 'An error occurred during webhook processing' },
      { status: 500 }
    );
  }
};

/**
 * Get pending access requests count for admin dashboard
 */
export const getPendingAccessCount = async () => {
  try {
    await connectDB();
    const count = await Order.countDocuments({
      paymentStatus: 'paid',
      accessStatus: 'pending'
    });
    return count;
  } catch (error) {
    console.error('Error getting pending access count:', error);
    return 0;
  }
};