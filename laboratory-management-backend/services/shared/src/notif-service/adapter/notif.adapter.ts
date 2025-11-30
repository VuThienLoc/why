import axios from "axios";
import type { CreateNotificationPayload, INotifClient } from "../port/notif.port.js";

class NotifServiceClient implements INotifClient {
  private baseUrl: string;
  private internalKey: string;

  constructor() {
  this.baseUrl = process.env.NOTIF_BASE_URL || "http://localhost:4002";
  this.internalKey = process.env.NOTIF_INTERNAL_KEY || process.env.INTERNAL_API_KEY || "";

  console.log("[NotifServiceClient] NOTIF_BASE_URL =", this.baseUrl);
  console.log("[NotifServiceClient] NOTIF_INTERNAL_KEY =", process.env.NOTIF_INTERNAL_KEY);
  console.log("[NotifServiceClient] INTERNAL_API_KEY =", process.env.INTERNAL_API_KEY);
  console.log("[NotifServiceClient] resolved internalKey =", this.internalKey);
}

  async createNotification({ userId, type, body, data }: CreateNotificationPayload): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/api/internal/notifications/create/${userId}`,
        { body, data },
        {
          params: { type },
          ...(this.internalKey
            ? { headers: { "X-Internal-API-Key": this.internalKey } }
            : {}),
        }
      );
    } catch (error) {
      console.error("Error calling notification service createNotification", error);
    }
  }

  async createManyNotification({ userId, type, body, data }: CreateNotificationPayload): Promise<void> {
    try {
      console.log("[NotifServiceClient] createManyNotification", userId, type, body, data);
      await axios.post(
        `${this.baseUrl}/api/internal/notifications/many/create/`,
        { userId, body, data },
        {
          params: { type },
          ...(this.internalKey
            ? { headers: { "X-Internal-API-Key": this.internalKey } }
            : {}),
        }
      );
      console.log("[NotifServiceClient] createManyNotification success");
    } catch (error) {
      console.error("Error calling notification service createNotification", error);
    }
  }

  async notifyNewMessage(userId: string, body: string, data?: any): Promise<void> {
    await this.createNotification({
      userId,
      type: "NEW_MESSAGE",
      body,
      data,
    });
  }

  async notifyNewMessageMany(userId: string[], body: string, data?: any): Promise<void> {
    await this.createManyNotification({
      userId,
      type: "NEW_MESSAGE",
      body,
      data,
    });
  }

  async notifyRoomJoin(userId: string, body: string, data?: any): Promise<void> {
    await this.createNotification({
      userId,
      type: "ROOM_JOIN",
      body,
      data,
    });
  }

  async notifyResult(userId: string, body: string, data?: any): Promise<void> {
    await this.createNotification({
      userId,
      type: "LAB_RESULT_READY",
      body,
      data,
    });
  }

  async notifyRoleChanged(userId: string, newRole: string): Promise<void> {
    await this.createNotification({
      userId,
      type: "ROLE_CHANGED",
      body: `Your role has been changed to ${newRole}`,
      data: { newRole },
    });
  }
}

export default new NotifServiceClient();

