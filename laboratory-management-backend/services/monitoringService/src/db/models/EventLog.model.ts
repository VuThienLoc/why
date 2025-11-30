import { Schema, model, type Document } from "mongoose";
import { ALLOWED_SERVICE_NAMES } from "../../constants/event.constant.js";

export interface IEventLog extends Document {
  event_id: string;
  event_code: string;
  action: string;
  event_message: string;
  service_name: string;
  entity_id?: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  operator_id: string;
  operator_name?: string;
  operator_gmail?: string;
  operator_role?: string;
  operator_avatar?: string;
  occurred_at: Date;
  received_at: Date;
  error_message?: string;
}

const EventLogSchema = new Schema<IEventLog>(
  {
    event_id: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    event_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      match: /^E_\d{5}$/,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'REVIEW', 'ACTIVATE', 'DEACTIVATE', 'LOCK', 'UNLOCK'],
    },
    event_message: {
      type: String,
      required: true,
      trim: true,
    },
    service_name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ALLOWED_SERVICE_NAMES,
      index: true,
    },
    entity_id: {
      type: String,
      trim: true,
      index: true,
    },
    old_values: {
      type: Schema.Types.Mixed,
      default: null,
    },
    new_values: {
      type: Schema.Types.Mixed,
      default: null,
    },
    operator_id: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    operator_name: {
      type: String,
      trim: true,
    },
    operator_gmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    operator_role: {
      type: String,
      trim: true,
      uppercase: true,
    },
    operator_avatar: {
      type: String,
      trim: true,
    },
    occurred_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    received_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    error_message: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "event_logs",
    timestamps: false,
    versionKey: false,
  }
);

// Compound Indexes for efficient querying
EventLogSchema.index({ service_name: 1, occurred_at: -1 });
EventLogSchema.index({ operator_id: 1, occurred_at: -1 });
EventLogSchema.index({ event_code: 1, occurred_at: -1 });
EventLogSchema.index({ entity_id: 1, occurred_at: -1 });
EventLogSchema.index({ event_id: 1 });

const EventLog = model<IEventLog>("EventLog", EventLogSchema);

export default EventLog;
