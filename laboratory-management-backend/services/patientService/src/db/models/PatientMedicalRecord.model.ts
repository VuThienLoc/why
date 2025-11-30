import { randomUUID } from "crypto";
import mongoose, { Document } from "mongoose";

export interface IPatientMedicalRecord extends Document {
  _id: string;
  patient_id: string;
  record_code: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  medical_history?: string;
  clinical_notes?: string;
  recent_test_summary?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
}

export type PatientMedicalRecordDTO = {
  _id: string;
  patient_id: string;
  record_code: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  current_medications?: string;
  medical_history?: string;
  clinical_notes?: string;
  recent_test_summary?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
  is_deleted: boolean;
  deleted_at?: Date;
  deleted_by?: string;
};

const patientMedicalRecordSchema = new mongoose.Schema<IPatientMedicalRecord>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    patient_id: {
      type: String,
      required: [true, "Patient ID is required!"],
      ref: "Patient",
      trim: true,
    },
    record_code: {
      type: String,
      required: [true, "Record code is required!"],
      unique: true,
      trim: true,
      maxlength: [50, "Record code cannot exceed 50 characters!"],
    },
    blood_type: {
      type: String,
      trim: true,
      maxlength: [5, "Blood type cannot exceed 5 characters!"],
    },
    allergies: {
      type: String,
      trim: true,
    },
    chronic_conditions: {
      type: String,
      trim: true,
    },
    current_medications: {
      type: String,
      trim: true,
    },
    medical_history: {
      type: String,
      trim: true,
    },
    clinical_notes: {
      type: String,
      trim: true,
    },
    recent_test_summary: {
      type: String,
      trim: true,
      maxlength: [2000, "Recent test summary cannot exceed 2000 characters!"],
    },
    created_by: {
      type: String,
      trim: true,
    },
    updated_by: {
      type: String,
      trim: true,
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
      trim: true,
    },
  },
  {
    _id: false,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  collection: "PatientMedicalRecord",
  }
);

patientMedicalRecordSchema.index(
  { patient_id: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false } }
);
patientMedicalRecordSchema.index({ updated_at: -1 });
patientMedicalRecordSchema.index({ is_deleted: 1, updated_at: -1 });

patientMedicalRecordSchema.pre("save", async function (next) {
  const record = this as IPatientMedicalRecord;

  if (!record._id) {
    record._id = randomUUID();
  }

  if (!record.record_code) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const prefix = `MR${year}${month}${day}`;

    const count = await (record.constructor as mongoose.Model<IPatientMedicalRecord>).countDocuments({
      record_code: new RegExp(`^${prefix}`),
    });

    const sequence = String(count + 1).padStart(4, "0");
    record.record_code = `${prefix}${sequence}`;
  }

  if (record.is_deleted && !record.deleted_at) {
    record.deleted_at = new Date();
  }

  next();
});

const PatientMedicalRecord = mongoose.model<IPatientMedicalRecord>(
  "PatientMedicalRecord",
  patientMedicalRecordSchema
);

export default PatientMedicalRecord;
