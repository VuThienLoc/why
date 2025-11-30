import { randomUUID } from "crypto";
import { Schema, model, type Document } from "mongoose";

export type ReagentUsageType = "TEST_RUN" | "MAINTENANCE" | "QC" | "CALIBRATION" | "WASTE";
export type ReagentHistoryType = "CREATE" | "UPDATE" | "DELETE";

export interface IReagentUsageHistory extends Document {
  _id: string;
  reagent_id: string;
  instrument_id?: string;
  history_type: ReagentHistoryType;
  usage_type: ReagentUsageType;
  quantity_used: number;
  unit_of_measure: string;
  test_order_id?: string;
  used_by: string;
  used_by_name?: string;
  used_at: Date;
  quantity_before?: number;
  quantity_after?: number;
  notes?: string;
}

const ReagentUsageHistorySchema = new Schema<IReagentUsageHistory>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    reagent_id: {
      type: String,
      required: true,
      ref: "Reagent",
    },
    instrument_id: {
      type: String,
      ref: "Instrument",
    },
    history_type: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE"],
    },
    usage_type: {
      type: String,
      required: true,
      enum: ["TEST_RUN", "MAINTENANCE", "QC", "CALIBRATION", "WASTE"],
    },
    quantity_used: {
      type: Number,
      required: true,
    },
    unit_of_measure: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    test_order_id: {
      type: String,
    },
    used_by: {
      type: String,
      required: true,
    },
    used_by_name: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    used_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    quantity_before: {
      type: Number,
    },
    quantity_after: {
      type: Number,
    },
    notes: {
      type: String,
    },
  },
  {
    collection: "ReagentUsageHistory",
    timestamps: false,
  }
);

ReagentUsageHistorySchema.index({ reagent_id: 1 });
ReagentUsageHistorySchema.index({ instrument_id: 1 });
ReagentUsageHistorySchema.index({ test_order_id: 1 });
ReagentUsageHistorySchema.index({ used_at: 1 });
ReagentUsageHistorySchema.index({ usage_type: 1 });
ReagentUsageHistorySchema.index({ reagent_id: 1, used_at: 1 });
ReagentUsageHistorySchema.index({ instrument_id: 1, used_at: 1 });

const ReagentUsageHistory = model<IReagentUsageHistory>(
  "ReagentUsageHistory",
  ReagentUsageHistorySchema
);

export default ReagentUsageHistory;
