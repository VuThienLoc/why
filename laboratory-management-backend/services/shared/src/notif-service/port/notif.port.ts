export interface CreateNotificationPayload {
  userId: string | string[];
  type: string;
  body: string;
  data?: any;
}

export interface INotifClient {
  createNotification(payload: CreateNotificationPayload): Promise<void>;
  createManyNotification(payload: CreateNotificationPayload): Promise<void>;

  // Convenience helpers for common notification scenarios
  notifyNewMessage(userId: string, body: string, data?: any): Promise<void>;
  notifyResult(userId: string, body: string, data?: any): Promise<void>;
  notifyRoomJoin(userId: string, body: string, data?: any): Promise<void>;
  notifyRoleChanged(userId: string, newRole: string): Promise<void>;
}

