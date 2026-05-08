import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['email', 'google'],
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
