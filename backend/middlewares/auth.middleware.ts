import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

// Extend Express Request object to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies.access_token;

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || 'secret_access') as { id: string };

      // Get user from db
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});
