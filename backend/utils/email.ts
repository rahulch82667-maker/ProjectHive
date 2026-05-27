import nodemailer from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
  attachments?: EmailAttachment[];
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions: any = {
    from: `"ProjectHive Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #3b1f0a; text-align: center;">ProjectHive Password Reset</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>
        <p style="font-size: 16px; color: #555;">You are receiving this email because you (or someone else) have requested the reset of a password for your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${options.message}" style="background-color: #3b1f0a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #777;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 ProjectHive. All rights reserved.</p>
      </div>
    `,
  };

  if (options.attachments && options.attachments.length > 0) {
    mailOptions.attachments = options.attachments;
  }

  await transporter.sendMail(mailOptions);
};
