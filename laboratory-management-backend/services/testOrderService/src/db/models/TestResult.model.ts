import { Schema, model, Types } from "mongoose";

const TestOrderResultSchema = new Schema({
  test_order_id: { type: Schema.Types.ObjectId, ref: "TestOrder", required: true },
  test_item_id: { type: String, required: true },
  user_id: { type: String , required: true },
  patient_id:{ type: String },
  test_type: { type: String },
  name: { type: String },
  instrument_name: { type: String },
  patient_name: {type: String},
  reagent_names:{ type: [String] },
  code: { type: String },
  unit: { type: String },
  result_value: { type: Number },
  result_status: { type: String, enum: ["normal", "high", "low"], default: null },
  reviewed: { type: Boolean, default: false },
  reviewer_comment: { type: String },
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: Date, default: null },
}, { timestamps: true }); // sẽ tự tạo createdAt, updatedAt


export const TestOrderResult = model("TestOrderResult", TestOrderResultSchema, "testResults");
