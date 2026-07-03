import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  action:
    | 'PROJECT_CREATE'
    | 'PROJECT_EDIT'
    | 'PROJECT_DELETE'
    | 'TASK_DELETE'
    | 'BUDGET_CHANGE'
    | 'USER_BLOCK_TOGGLE'
    | 'USER_ROLE_CHANGE'
    | 'ACCESS_REQUEST_DECISION';
  details: string;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema: Schema<IAuditLog> = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

if (process.env.NODE_ENV === 'development') {
  delete (mongoose.models as any).AuditLog;
}

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
