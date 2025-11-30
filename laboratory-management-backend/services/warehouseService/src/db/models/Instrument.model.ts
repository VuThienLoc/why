import { randomUUID } from "crypto";
import { Schema, model, type Document } from "mongoose";

export interface IInstrument extends Document {
  _id: string;
  instrument_code: string;
  instrument_name: string;
  instrument_type: string;
  manufacturer?: string;
  status: "Ready" | "Processing" | "Inactive";
  is_active: boolean;
  location?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
}

const InstrumentSchema = new Schema<IInstrument>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    instrument_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    instrument_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    instrument_type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    manufacturer: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ["Ready", "Processing", "Inactive"],
      default: "Ready",
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    created_by: {
      type: String,
    },
    updated_by: {
      type: String,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
    },
    deleted_by: {
      type: String,
    },
  },
  {
    collection: "Instruments",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

InstrumentSchema.index({ instrument_code: 1 }, { unique: true });
InstrumentSchema.index({ status: 1 });
InstrumentSchema.index({ is_active: 1 });
InstrumentSchema.index({ is_active: 1, status: 1 });

const Instrument = model<IInstrument>("Instrument", InstrumentSchema);

export default Instrument;
