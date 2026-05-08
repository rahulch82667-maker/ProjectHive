import { User } from '../models/User';
import admin from '../config/firebase-admin';

export const registerUser = async (firebaseUid: string, email: string, name: string, provider: 'email' | 'google', avatar?: string) => {
  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('User already exists');
  }

  // Create new user in DB
  const user = await User.create({
    firebaseUid,
    name,
    email,
    provider,
    avatar: avatar || '',
    isVerified: provider === 'google', // Auto-verify google users
  });

  return user;
};

export const loginUser = async (firebaseUid: string, email: string) => {
  let user = await User.findOne({ firebaseUid });

  if (!user) {
    // If somehow missing in our DB but exists in Firebase (e.g. manual creation)
    throw new Error('User not found in database. Please register.');
  }

  return user;
};

export const syncGoogleUser = async (firebaseUid: string, email: string, name: string, avatar: string) => {
  let user = await User.findOne({ email });

  if (!user) {
    // Register new google user
    user = await User.create({
      firebaseUid,
      name,
      email,
      provider: 'google',
      avatar,
      isVerified: true,
    });
  } else {
    // If user exists but is logging in with google, update info
    user.firebaseUid = firebaseUid;
    user.provider = 'google';
    user.avatar = avatar || user.avatar;
    await user.save();
  }

  return user;
};
