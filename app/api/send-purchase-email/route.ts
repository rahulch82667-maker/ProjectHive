import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/backend/config/db';
import Order from '@/backend/models/Order';
import Project from '@/backend/models/Project';
import { User } from '@/backend/models/User';
import { sendEmail } from '@/backend/utils/email';
import { generateInvoicePDF } from '@/backend/utils/invoice';


export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ message: 'Session ID required' }, { status: 400 });
    }

    // Find the order by Stripe session ID
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Check if emails already sent
    if (order.emailsSent) {
      return NextResponse.json({ message: 'Emails already sent' }, { status: 200 });
    }

    const project = await Project.findById(order.projectId);
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const buyer = await User.findById(order.userId);
    
    // Send emails
    try {
      // Generate PDF Invoice
      const pdfBuffer = await generateInvoicePDF(order, project);
      const invoiceName = `Invoice_${order._id.toString().substring(0, 8).toUpperCase()}.pdf`;

      // 1. Email to Buyer
      const buyerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #3b1f0a;">Thank You for Your Purchase! 🎉</h2>
          <p>Dear ${order.billingDetails.firstName},</p>
          <p>Your purchase of <strong>${project.title}</strong> has been completed successfully.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Amount Paid:</strong> $${order.amount.toFixed(2)}</p>
            <p><strong>Purchase Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📥 How to Access Your Purchase:</h3>
            <ol>
              <li>Login to your ProjectHive account</li>
              <li>Go to <strong>Collections</strong> page</li>
              <li>Your purchased project will be available for download</li>
            </ol>
          </div>
          
          <p>You can also access your purchase directly from your dashboard.</p>
          <p>Attached is your invoice for this transaction.</p>
          
          <hr>
          <p style="color: #666; font-size: 12px;">Need help? Contact us at support@projecthive.com</p>
        </div>
      `;

      await sendEmail({
        email: order.billingDetails.email,
        subject: `Your Purchase of ${project.title} is Complete! 🎉`,
        message: `Thank you for purchasing ${project.title}`,
        html: buyerEmailHtml,
        attachments: [{ filename: invoiceName, content: pdfBuffer, contentType: 'application/pdf' }]
      });

      console.log(` Buyer email sent to: ${order.billingDetails.email}`);

      // 2. Email to Admin
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #3b1f0a;">🛒 New Purchase Alert!</h2>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
            <h3>Purchase Details:</h3>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Amount:</strong> $${order.amount.toFixed(2)}</p>
            <p><strong>Buyer:</strong> ${order.billingDetails.firstName} ${order.billingDetails.lastName}</p>
            <p><strong>Email:</strong> ${order.billingDetails.email}</p>
            <p><strong>Company:</strong> ${order.billingDetails.companyName || 'N/A'}</p>
            <p><strong>GSTIN:</strong> ${order.billingDetails.gstin || 'N/A'}</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Stripe Session:</strong> ${sessionId}</p>
          </div>
          
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-top: 15px;">
            <h3>Billing Address:</h3>
            <p>${order.billingDetails.addressLine1}<br>
            ${order.billingDetails.addressLine2 ? order.billingDetails.addressLine2 + '<br>' : ''}
            ${order.billingDetails.city}, ${order.billingDetails.state}<br>
            ${order.billingDetails.zipCode}<br>
            ${order.billingDetails.country}</p>
          </div>
        </div>
      `;

      await sendEmail({
        email: process.env.EMAIL_USER!,
        subject: `[NEW SALE] $${order.amount.toFixed(2)} - ${project.title}`,
        message: `New purchase: ${project.title} for $${order.amount}`,
        html: adminEmailHtml
      });

      console.log(` Admin email sent to: ${process.env.EMAIL_USER}`);

      // Mark emails as sent
      order.emailsSent = true;
      await order.save();

      return NextResponse.json({ success: true, message: 'Emails sent successfully' });
      
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json({ message: 'Failed to send emails', error: emailError.message }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Error in send-purchase-email:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}