import { randomUUID, type UUID } from "crypto";
import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  _id: UUID;
  email: string;
  fullName: string;
  identityNumber: string;
  gender: string;
  age: number;
  dateOfBirth: Date;
  passwordHash: string;
  phoneNumber: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  isDeleted?: boolean;
  role?: string[];
  avatar?: string;

  provider?: "google" | "local";
  providerId?: string;

  // Additional fields (commented out for now)

  lastLogin?: Date
  lastPasswordChange?: Date
  lastResetPassword?:Date
  failedLoginAttempts?: number
  lastFailedAt?: Date
  lockedUntil?: Date
  // lastActivity?: Date
  // createdBy?: string
  // updatedBy?: string
  // deletedAt?: Date
  // deletedBy?: string
}

const userSchema = new mongoose.Schema<IUser>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string): boolean {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format!",
      },
    },
    fullName: {
      type: String,
      required: [true, "Full name is required!"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters long!"],
      maxlength: [100, "Full name cannot exceed 100 characters!"],
    },
    identityNumber: {
      type: String,
      required: function (this: IUser) {
        return this.provider === "local" || !this.provider;
      },
      trim: true,
      unique: true,
      sparse: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: true,
      required: function (this: IUser) {
      return this.provider === 'local' || !this.provider;
    },
    },
    role: [{
      type: String,
      ref: 'Role',
      trim: true,
      required: [true, "User need a role!"],
      default: ["USER"],
    }],
    gender: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ["male", "female", "other"],
      required: function(this: IUser) {
        return this.provider === 'local' || !this.provider;
      },
    },
    age: {
      type: Number,
      min: [1, "Age must be at least 1!"],
      max: [150, "Age cannot exceed 150!"],
      required: function (this: IUser) {
        return this.provider === "local" || !this.provider;
      },
    },
    dateOfBirth: {
      type: Date,
      format: "MM/DD/YYYY",
      required: function (this: IUser) {
        return this.provider === "local" || !this.provider;
      },
    },
    passwordHash: {
      type: String,
      required: function (this: IUser) {
        return this.provider === "local" || !this.provider;
      },
    },
    address: {
      type: String,
      required: function (this: IUser) {
        return this.provider === "local" || !this.provider;
      },
    },
    provider: {
      type: String,
      enum: ["google", "facebook", "local"],
      default: "local",
    },
    providerId: {
      type: String,
      required: function (this: IUser) {
        return !!this.provider && this.provider !== "local";
      },
    },
    lastPasswordChange: {
      type: Date,
      required: function (this: IUser) {
        return this.provider === "local" || !this.provider;
      },
    },
    avatar: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lastFailedAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: {
      type: Date,
    },
    lastResetPassword: {
      type: Date,
    },
  },
  {
    _id: false,
    timestamps: true,
    collection: "users",
  }
);

userSchema.index({ isActive: 1 });
userSchema.index({ isDeleted: 1 });
userSchema.index({ provider: 1 });
userSchema.index({ providerId: 1 });
userSchema.index({ email: 1, provider: 1 }, { unique: true, sparse: true });

userSchema.pre("save", function (next) {
  if (!this._id) {
    this._id = randomUUID();
  }
  next();
});

const UserModel = mongoose.model<IUser>("User", userSchema, "users");

export default UserModel;
