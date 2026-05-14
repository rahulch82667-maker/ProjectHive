import mongoose, { Document, Model, Schema, CallbackWithoutResultAndOptionalError } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  category: string;
  tags: string[];
  thumbnail: string;
  images: string[];
  demoVideo?: string;
  liveDemoLink?: string;
  technologies: string[];
  salesCount: number;
  rating: number;
  totalReviews: number;
  favoritesCount: number;
  cartCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  status: 'draft' | 'published' | 'archived';
  stock: number;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  reviews: mongoose.Types.ObjectId[];
  faq: Array<{ question: string; answer: string }>;
  requirements: string[];
  fileSize?: string;
  version?: string;
  changelog: Array<{ version: string; date: Date; notes: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema: Schema<IProject> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
    },
    images: [{ type: String }],
    demoVideo: { type: String },
    liveDemoLink: { type: String },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    salesCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    favoritesCount: {
      type: Number,
      default: 0,
    },
    cartCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    stock: {
      type: Number,
      default: -1,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    faq: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    requirements: [{ type: String }],
    fileSize: { type: String },
    version: { type: String },
    changelog: [
      {
        version: { type: String },
        date: { type: Date, default: Date.now },
        notes: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving
// TODO: Fix pre-save hook typing
// projectSchema.pre('save', async function (next) {
//   if (this.isModified('title')) {
//     this.slug = this.title
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s-]/g, '')
//       .replace(/\s+/g, '-')
//       .replace(/-+/g, '-');
//   }
//   next();
// });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;
