import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret_access';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'secret_refresh';

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

export const sendTokenCookies = async (userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const cookieStore = await cookies();

  // CRITICAL: In production (Vercel), use 'none' with secure: true for HTTPS
  // Locally, can use 'lax' with secure: false for HTTP
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  
  // Define sameSite value with proper type
  const sameSiteValue: 'none' | 'lax' = isProduction ? 'none' : 'lax';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSiteValue,
    path: '/',
  };

  // Access token cookie (expires in 15m)
  cookieStore.set('access_token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60, // Next.js cookies use seconds for maxAge sometimes, but it's fine
  });

  // Refresh token cookie (expires in 7d)
  cookieStore.set('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });

  return { accessToken, refreshToken };
};

export const clearTokenCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
};
