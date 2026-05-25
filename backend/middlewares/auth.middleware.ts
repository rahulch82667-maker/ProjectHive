import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { connectDB } from '../config/db';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await connectDB();

    const token = req.cookies?.access_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'secret_access') as { id: string };

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      if (user.isBlocked) {
        return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Next.js API Routes compatible protect function
export const protect = async () => {
  const { cookies, headers } = await import('next/headers');
  const cookieStore = await cookies();
  const headerStore = await headers();

  const tokenFromCookie = cookieStore.get('access_token')?.value;
  const tokenFromHeader = headerStore.get('authorization')?.replace('Bearer ', '');
  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    throw new Error('Not authorized, no token');
  }

  try {
    await connectDB();

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'secret_access') as { id: string };

    // Get user from db
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new Error('Not authorized, user not found');
    }

    if (user.isBlocked) {
      throw new Error('Your account has been blocked. Please contact support.');
    }

    return user;
  } catch (error) {
    console.error('Auth middleware error:', error);
    throw new Error('Not authorized, token failed');
  }
};


// Add this to your existing auth middleware
export const adminOnly = async () => {
  const user = await protect();
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
};