import { randomUUID, type UUID } from "crypto"
import mongoose, { Document } from "mongoose"

export interface IPasswordHistory extends Document {
  _id: UUID
  userId: UUID
  passwordHash: string
  changedAt?: Date
  changedBy?: UUID
  changedReason?: string
}

const passwordHistorySchema = new mongoose.Schema<IPasswordHistory>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    userId: {
      type: String,
      required: [true, "User ID is required!"],
      ref: "User",
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required!"],
      trim: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: [true, "Changed at timestamp is required!"],
    },
    changedBy: {
      type: String,
      required: false,
    },
    changedReason: {
      type: String,
      trim: true,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "password_histories",
  }
)

passwordHistorySchema.index({ userId: 1, changedAt: -1 });

// Pre-save hook to set UUID if not present
passwordHistorySchema.pre("save", function(next) {
  if (!this._id) {
    this._id = randomUUID();
  }
  next();
});

const PasswordHistory = mongoose.model<IPasswordHistory>("PasswordHistory", passwordHistorySchema, "password_histories")

export default PasswordHistory