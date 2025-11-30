import { randomUUID, type UUID } from "crypto";
import mongoose, { Document } from "mongoose";
import { NotificationTypes } from "../../constants/notificationType.constant";

export interface INotification extends Document {
  _id: UUID;
  userId: string;
  type: NotificationTypes;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
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
    type: {
      type: String,
      trim: true,
      uppercase: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      trim: true,
    },
    body: {
      type: String,
      trim: true,
    },
    data: {
      type: Object,
    },
  },
  {
    _id: false,
    timestamps: true,
    collection: "notifications",
  }
);

notificationSchema.pre("save", function (next) {
  if (!this._id) {
    this._id = randomUUID();
  }
  next();
});

const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
  "notifications"
);

export default NotificationModel;
