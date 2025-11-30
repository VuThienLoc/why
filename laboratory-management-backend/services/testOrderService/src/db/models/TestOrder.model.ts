import mongoose, { Schema, Document } from "mongoose";
import { z } from 'zod';
import { Types } from "mongoose";
export interface ReagentUsage {
  reagent_id: string;
  quantity_used: number | null;
}

export interface ITestOrder extends Document {
  patient_id: string;
  instrument_id?: string;
  instrument_name?: string ;
  reagent_usages: ReagentUsage[]; 
  test_item_ids?: Types.ObjectId[];
  patient_name?: string;   
  barcode: string;
  test_type: string;       
  status: string;
  processing?: number;       
  created_at: Date;
  created_by: string;
  due_date?: Date;
  updated_at?: Date;
  updated_by?: string;
  is_deleted?: boolean;
  deleted_at?: Date;
  deleted_by?: string;
  notes?: string | 'have no comment';
}

export interface CreateOrderInput {
  patient_id?: string;
  instrument_id?: string;
  reagent_usages: ReagentUsage[]; 
  test_item_ids: string[]; 
  patient_name?: string;
  barcode: string;
  test_type: string;
  status?: string;
  created_by: string;
  due_date?: string | Date;
  updated_by?: string;
  is_deleted?: boolean;
  deleted_at?: string | Date;
  deleted_by?: string;
  notes?: string;
}


export interface UpdateOrderInput {
  patient_id?: string;
  instrument_id?: string ;
  reagent_usages: ReagentUsage[]; 
  test_item_ids?: string[];
  patient_name?: string;
  barcode?: string;
  test_type?: string;
  status?: 'Pending' | 'Processing' | 'Completed';
  processing?: number;
  created_by?: string;
  due_date?: Date | null;
  updated_by?: string | null;
  notes?: string | 'have no comment' ;
}

const ReagentUsageSchema = new Schema({
  reagent_id: { type: String, required: true },
  quantity_used: { type: Number, required: true, default: 0 },
});
const TestOrderSchema: Schema = new Schema(
  {
    patient_id: { type: String, required: false },
    instrument_id: { type: String, default: '' },
    reagent_usages: { type: [ReagentUsageSchema], default: [] },
    test_item_ids: [{ type: Schema.Types.ObjectId, ref: "TestItem" }],

    patient_name: { type: String, default: '' },
    barcode: { type: String, required: true, unique: true },
    test_type: { type: String,   required: true  },
    status: { type: String, required: true, default: 'Pending' },
    processing: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    created_by: { type: String, required: true },
    due_date: { type: Date, default: null },
    updated_at: { type: Date, default: Date.now },
    updated_by: { type: String, default: null },

    is_deleted: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },
    deleted_by: { type: String, default: null },
    notes: {type: String, default: 'Have no comment'},
  },
  {
    timestamps: false, 
  }
);

// Auto-update updated_at on save
TestOrderSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

// Optional: also update on findOneAndUpdate
TestOrderSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updated_at: new Date() });
  next();
});


export const UpdateTestOrderSchema = z.object({
  patient_id: z.string().optional(),
  patient_name: z.string().optional(),
  barcode: z.string().optional(),
  test_type: z.string().optional(),
  status: z.enum(['Pending', 'Processing', 'Completed']).optional(),
  processing: z.number().min(0).max(100).optional(),
  due_date: z.string().datetime().optional().nullable(),
  isDeleted: z.boolean().optional(),
  notes: z.string().optional(),

  instrument_id: z.string().optional().nullable(),
  reagents: z.array(z.string()).optional().nullable(),
});

export default mongoose.model<ITestOrder>("TestOrder", TestOrderSchema,"testOrders" );