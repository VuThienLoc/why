import { Schema, model, type Document } from "mongoose";
import { ALLOWED_SERVICE_NAMES } from "../../constants/event.constant.js";

export interface IEventCode extends Document {
  event_code: string;
  event_name: string;
  description: string;
  service_name: string;
  is_active: boolean;
  created_at: Date;
}

const EventCodeSchema = new Schema<IEventCode>(
  {
    event_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      match: /^E_\d{5}$/,
      index: true,
    },
    event_name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    description: {
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
    is_active: {
      type: Boolean,
      default: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "event_codes",
    timestamps: false,
    versionKey: false,
  }
);

// Indexes
EventCodeSchema.index({ event_code: 1 }, { unique: true });
EventCodeSchema.index({ service_name: 1 });
EventCodeSchema.index({ is_active: 1 });

const EventCode = model<IEventCode>("EventCode", EventCodeSchema);

export default EventCode;
