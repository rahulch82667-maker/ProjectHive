import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  country: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  gstin?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  billingDetails: IBillingDetails;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  accessStatus: 'pending' | 'approved' | 'rejected';
  stripeSessionId: string;
  emailsSent?: boolean;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema: Schema<IOrder> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    billingDetails: {
      firstName: { type: String, required: [true, 'First name is required'] },
      lastName: { type: String, required: [true, 'Last name is required'] },
      email: { type: String, required: [true, 'Email is required'] },
      companyName: { type: String },
      country: { type: String, required: [true, 'Country is required'] },
      addressLine1: { type: String, required: [true, 'Address line 1 is required'] },
      addressLine2: { type: String },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, required: [true, 'State is required'] },
      zipCode: { type: String, required: [true, 'Zip code is required'] },
      gstin: { type: String },
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
      index: true,
    },
    accessStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    stripeSessionId: {
      type: String,
      required: [true, 'Stripe Session ID is required'],
      unique: true,
      index: true,
    },
    emailsSent: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;