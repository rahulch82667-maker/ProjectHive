import { NextRequest, NextResponse } from 'next/server';
import { registerUser, loginUser, syncGoogleUser } from '../services/auth.service';
import admin from '../config/firebase-admin';
import { sendTokenCookies, clearTokenCookies } from '../utils/token';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { sendEmail } from '../utils/email';
import { connectDB } from '../config/db';
import { protect } from '../middlewares/auth.middleware';
import { cookies } from 'next/headers';

export const signup = async (req: NextRequest) => {
  await connectDB();
  const { firebaseUid, email, name, provider, avatar } = await req.json();

  if (!firebaseUid || !email || !name) {
    return NextResponse.json({ message: 'Please include all fields' }, { status: 400 });
  }

  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) {
    return NextResponse.json({ message: 'No Firebase token provided' }, { status: 401 });
  }

  const decodedToken = await admin.auth().verifyIdToken(token);
  if (decodedToken.uid !== firebaseUid) {
    return NextResponse.json({ message: 'Invalid Firebase token for this user' }, { status: 403 });
  }

  const user = await registerUser(firebaseUid, email, name, provider || 'email', avatar);

  await sendTokenCookies(user._id.toString());

  return NextResponse.json({
    _id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  }, { status: 201 });
};

export const login = async (req: NextRequest) => {
  await connectDB();
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json({ message: 'No Firebase token provided' }, { status: 401 });
  }

  const decodedToken = await admin.auth().verifyIdToken(token);
  
  const user = await loginUser(decodedToken.uid, decodedToken.email || '');

  if (user.isBlocked) {
    return NextResponse.json({ message: 'Your account has been blocked. Please contact support.' }, { status: 403 });
  }

  await sendTokenCookies(user._id.toString());

  return NextResponse.json({
    _id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  }, { status: 200 });
};

export const googleAuth = async (req: NextRequest) => {
  await connectDB();
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return NextResponse.json({ message: 'No Firebase token provided' }, { status: 401 });
  }

  const decodedToken = await admin.auth().verifyIdToken(token);
  
  const { name, picture, email } = decodedToken;

  const user = await syncGoogleUser(decodedToken.uid, email || '', name || 'Google User', picture || '');

  if (user.isBlocked) {
    return NextResponse.json({ message: 'Your account has been blocked. Please contact support.' }, { status: 403 });
  }

  await sendTokenCookies(user._id.toString());

  return NextResponse.json({
    _id: user._id,
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
  }, { status: 200 });
};

export const getMe = async (req: NextRequest) => {
  try {
    const user = await protect();
    return NextResponse.json({
      _id: user._id,
      firebaseUid: user.firebaseUid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
};

export const refreshAccessToken = async (req: NextRequest) => {
  await connectDB();
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token provided' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'secret_refresh') as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ message: 'Your account has been blocked. Please contact support.' }, { status: 403 });
    }

    await sendTokenCookies(user._id.toString());

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
  }
};

export const logout = async (req: NextRequest) => {
  try {
    await protect();
    await clearTokenCookies();
    return NextResponse.json({ status: 'success', message: 'Logged out successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
};

export const forgotPassword = async (req: NextRequest) => {
  await connectDB();
  const { email } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return NextResponse.json({ success: false, message: 'There is no user with that email' }, { status: 404 });
  }

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: resetLink, 
    });

    return NextResponse.json({ success: true, message: 'Password reset link sent to your email' }, { status: 200 });
  } catch (error: any) {
    console.error('Firebase reset link error:', error);
    let message = 'Error sending password reset link';
    if (error.code === 'auth/user-not-found') {
      message = 'User not found in Firebase';
    }
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
};
