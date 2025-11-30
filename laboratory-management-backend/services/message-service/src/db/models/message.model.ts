import { randomUUID, type UUID } from "crypto";
import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  _id: UUID;
  roomId: string;
  userId: string;
  text: string;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    roomId: {
      type: String,
      required: [true, "Room ID is required!"],
      ref: "Room",
    },
    userId: {
      type: String,
      required: [true, "User ID is required!"],
    },
    text: {
      type: String,
      max: [250, "Message can't be longer than 250 characters"],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
    timestamps: true,
    collection: "messages",
  }
);

messageSchema.pre("save", function (next) {
  if (!this._id) {
    this._id = randomUUID();
  }
  next();
});

const MessageModel = mongoose.model<IMessage>(
  "Message",
  messageSchema,
  "messages"
);

export default MessageModel;
