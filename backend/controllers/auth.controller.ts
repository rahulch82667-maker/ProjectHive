import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { registerUser, loginUser, syncGoogleUser } from '../services/auth.service';
import admin from '../config/firebase-admin';
import { sendTokenCookies, clearTokenCookies } from '../utils/token';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { firebaseUid, email, name, provider, avatar } = req.body;

  if (!firebaseUid || !email || !name) {
    res.status(400);
    throw new Error('Please include all fields');
  }

  // Verify that the token belongs to this user (optional but recommended for security)
  // The token should be in req.headers.authorization
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401);
    throw new Error('No Firebase token provided');
  }

  const decodedToken = await admin.auth().verifyIdToken(token);
  if (decodedToken.uid !== firebaseUid) {
    res.status(403);
    throw new Error('Invalid Firebase token for this user');
  }

  const user = await registerUser(firebaseUid, email, name, provider || 'email', avatar);

  sendTokenCookies(res, user._id.toString());

  res.status(201).json({
    _id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(401);
    throw new Error('No Firebase token provided');
  }

  const decodedToken = await admin.auth().verifyIdToken(token);
  
  const user = await loginUser(decodedToken.uid, decodedToken.email || '');

  sendTokenCookies(res, user._id.toString());

  res.status(200).json({
    _id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  });
});

// @desc    Google Login/Signup
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    res.status(401);
    throw new Error('No Firebase token provided');
  }

  const decodedToken = await admin.auth().verifyIdToken(token);
  
  const { name, picture, email } = decodedToken;

  const user = await syncGoogleUser(decodedToken.uid, email || '', name || 'Google User', picture || '');

  sendTokenCookies(res, user._id.toString());

  res.status(200).json({
    _id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.user is set in the auth middleware
  const user = req.user;

  res.status(200).json({
    _id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'secret_refresh') as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    sendTokenCookies(res, user._id.toString());

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401);
    throw new Error('Invalid refresh token');
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearTokenCookies(res);
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});
