import { randomUUID, type UUID } from "crypto"
import mongoose, { Document } from "mongoose"
import { AUDIT_EVENT_CODES, AUDIT_ACTIONS, type AuditEventCode, type AuditAction } from "../../constants/events.constant.js"

export interface IAuditLog extends Document {
  _id: UUID
  eventCode: AuditEventCode
  action: AuditAction
  eventMessage: string
  userId?: UUID
  userEmail?: string
  performedAt: Date
  serviceName?: string
  createdAt: Date
  updatedAt: Date
}

const auditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    eventCode: {
      type: String,
      required: [true, "Event code is required!"],
      maxlength: [20, "Event code cannot exceed 20 characters!"],
      trim: true,
      enum: AUDIT_EVENT_CODES,
    },
    action: {
      type: String,
      required: [true, "Action is required!"],
      enum: AUDIT_ACTIONS,
      maxlength: [50, "Action cannot exceed 50 characters!"],
    },
    eventMessage: {
      type: String,
      required: [true, "Event message is required!"],
      trim: true,
    },
    userId: {
      type: String,
      ref: 'User',
      required: false,
    },
    userEmail: {
      type: String,
      maxlength: [255, "User email cannot exceed 255 characters!"],
      trim: true,
      lowercase: true,
      required: false,
    },
    performedAt: {
      type: Date,
      default: Date.now,
      required: [true, "Performed at timestamp is required!"],
    },
    serviceName: {
      type: String,
      trim: true,
      required: false,
    },
  },
  {
    _id: false,
    timestamps: true,
    collection: "audit_logs",
  }
)

// Index for faster searchs in document
auditLogSchema.index({ eventCode: 1 })
auditLogSchema.index({ userId: 1 })
auditLogSchema.index({ performedAt: 1 })
auditLogSchema.index({ action: 1 })
auditLogSchema.index({ serviceName: 1 })

auditLogSchema.pre("save", function(next) {
  if (!this._id) {
    this._id = randomUUID();
  }
  next();
});

const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema, "audit_logs")

export default AuditLog