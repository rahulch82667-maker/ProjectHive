import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { connectDB } from '../config/db';

export const protect = async () => {
  await connectDB();
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (token) {
    try {
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
  }

  throw new Error('Not authorized, no token');
};
