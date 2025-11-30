import { Server, Socket } from "socket.io";
import { NotificationService } from "../services/notification.service.js";

const notificationService = new NotificationService();

export const handleNotificationSocketConnection = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const auth = socket.handshake.auth as { userId?: string } | undefined;
    if (!auth?.userId) return;
    socket.join(`user:${auth.userId}`);
    console.log(`Notification socket connected: ${socket.id}`);

    socket.on("notifications:markRead", async ({ notificationId, userId }) => {
      try {
        if (!notificationId || !userId) return;

        const updated = await notificationService.markAsRead(notificationId);
        io.to(`user:${userId}`).emit("notifications:updated", updated);
      } catch (error) {
        console.error("Error marking notification as read via socket:", error);
      }
    });

    socket.on("notifications:list", async ({ userId, query }) => {
      try {
        if (!userId) return;

        const options = query ?? {};
        const result = await notificationService.listNotifs(options, { userId });
        socket.emit("notifications:list:result", result);
      } catch (error) {
        console.error("Error listing notifications via socket:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Notification socket disconnected: ${socket.id}`);
    });
  });
};
