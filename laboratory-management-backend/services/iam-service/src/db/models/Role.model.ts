import { randomUUID, type UUID } from "crypto"
import mongoose, { Date, Document } from "mongoose"
import { RoleCode } from "../../constants/roles.constant.js"
import { PrivilegeCode } from "../../constants/privileges.constant.js"

export interface IRole extends Document {
  _id: UUID
  roleCode: RoleCode
  roleName: string
  description?: string
  isSystemRole: boolean
  isActive: boolean
  privileges: PrivilegeCode[]
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
  createdBy?: UUID
  updatedBy?: UUID
  deletedBy?: UUID
}

const roleSchema = new mongoose.Schema<IRole>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    roleCode: {
      type: String,
      required: [true, "Role code is required!"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    roleName: {
      type: String,
      required: [true, "Role name is required!"],
      trim: true,
    },
    description: {
      type: String,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    privileges: {
      type: [String],
      default: ["read:test_order"],
    },
    createdBy: {
      type: String,
    },
    updatedBy: {
      type: String,
    },
    deletedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "roles",
  }
)

roleSchema.index({ isSystemRole: 1 })

// Pre-save hook to set UUID if not present
roleSchema.pre("save", function(next) {
  if (!this._id) {
    this._id = randomUUID();
  }
  next();
});

const Role = mongoose.model<IRole>("Role", roleSchema, "roles")

export default Role