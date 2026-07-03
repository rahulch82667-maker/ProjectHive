import { NextRequest } from 'next/server';
import { connectDB } from '../config/db';
import AuditLog from '../models/AuditLog';
import { User } from '../models/User';
import mongoose from 'mongoose';

export interface AuditLogParams {
  userId: string | mongoose.Types.ObjectId;
  action:
    | 'PROJECT_CREATE'
    | 'PROJECT_EDIT'
    | 'PROJECT_DELETE'
    | 'TASK_DELETE'
    | 'BUDGET_CHANGE'
    | 'USER_BLOCK_TOGGLE'
    | 'USER_ROLE_CHANGE'
    | 'ACCESS_REQUEST_DECISION';
  details: string;
  req?: NextRequest;
}

export async function createAuditLog({ userId, action, details, req }: AuditLogParams) {
  try {
    await connectDB();

    // Get IP address if request object is provided
    let ipAddress = 'unknown';
    if (req) {
      ipAddress =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1';
    }

    // Find the user to get their name and email
    const user = await User.findById(userId);
    const userName = user ? user.name : 'Unknown Admin';
    const userEmail = user ? user.email : 'unknown@projecthive.com';

    const log = new AuditLog({
      userId: new mongoose.Types.ObjectId(userId.toString()),
      userName,
      userEmail,
      action,
      details,
      ipAddress,
    });

    await log.save();
    console.log(`[Audit Log] ${action} by ${userName} (${userEmail}): ${details}`);
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
