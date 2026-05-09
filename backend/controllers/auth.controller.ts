import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { registerUser, loginUser, syncGoogleUser } from '../services/auth.service';
import admin from '../config/firebase-admin';
import { sendTokenCookies, clearTokenCookies } from '../utils/token';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendEmail } from '../utils/email';
import { sendResponse } from '../utils/responseHandler';
import crypto from 'crypto';

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

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check if user exists in our DB
  const user = await User.findOne({ email });

  if (!user) {
    return sendResponse({
      res,
      statusCode: 404,
      success: false,
      message: 'There is no user with that email',
    });
  }

  try {
    // Generate Firebase password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // Send custom email with Firebase reset link
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: resetLink, // Passing the Firebase link to the template
    });

    sendResponse({
      res,
      statusCode: 200,
      success: true,
      message: 'Password reset link sent to your email',
    });
  } catch (error: any) {
    console.error('Firebase reset link error:', error);
    
    let message = 'Error sending password reset link';
    if (error.code === 'auth/user-not-found') {
      message = 'User not found in Firebase';
    }

    return sendResponse({
      res,
      statusCode: 500,
      success: false,
      message,
    });
  }
});
