import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { protect } from '../middlewares/auth.middleware';
import { connectDB } from '../config/db';
import Order from '../models/Order';
import Project from '../models/Project';
import { User } from '../models/User';
import { sendEmail } from '../utils/email';
import { generateInvoicePDF } from '../utils/invoice';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
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
      status: 'pending',
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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;
      const projectId = session.metadata?.projectId;

      const order = await Order.findById(orderId);
      if (!order || order.status === 'paid') {
        return NextResponse.json({ received: true });
      }

      // Update Order Status
      order.status = 'paid';
      await order.save();

      // Grant access to user
      const user = await User.findById(userId);
      if (user && !user.purchasedProjects?.some(id => id.toString() === projectId)) {
        user.purchasedProjects = user.purchasedProjects || [];
        user.purchasedProjects.push(projectId);
        await user.save();
      }

      console.log(` Order ${orderId} marked as paid. Emails will be sent from success page.`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing failure:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};