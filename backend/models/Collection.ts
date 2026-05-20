import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  user: mongoose.Types.ObjectId;
  projects: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema: Schema<ICollection> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Collection: Model<ICollection> = mongoose.models.Collection || mongoose.model<ICollection>('Collection', collectionSchema);

export default Collection;
