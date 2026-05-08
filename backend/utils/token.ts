import jwt from 'jsonwebtoken';
import { Response } from 'express';

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

export const sendTokenCookies = (res: Response, userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };

  // Access token cookie (expires in 15m)
  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // Refresh token cookie (expires in 7d)
  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

export const clearTokenCookies = (res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };

  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
};
