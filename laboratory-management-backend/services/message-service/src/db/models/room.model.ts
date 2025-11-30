import { randomUUID, type UUID } from "crypto";
import mongoose, { Document } from "mongoose";

export interface IRoom extends Document {
  _id: UUID;
  name?: string;
  participants: string[];
  createdBy: UUID;
}

const roomSchema = new mongoose.Schema<IRoom>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    name: {
      type: String,
      max: [50, "Room's name can't be longer than 50 characters"],
      trim: true,
      unique: true,
    },
    participants: [{
      type: String,
      ref: 'User',
      trim: true,
      required: [true, "There must be participants in a room"],
    }],
    createdBy: {
      type: String,
      ref: 'User',
      trim: true,
      required: [true, "There must be a creator for a room"],
    },
  },
  {
    _id: false,
    timestamps: true,
    collection: "rooms",
  }
);

roomSchema.pre("save", function (next) {
  if (!this._id) {
    this._id = randomUUID();
  }
  next();
});

const RoomModel = mongoose.model<IRoom>(
  "Room",
  roomSchema,
  "rooms"
);

export default RoomModel;
