import { Server, Socket } from 'socket.io';
import iamServiceClient from '../../../shared/src/iam-service/adapter/iam.adapter.js';
import { MessageService } from '../services/message.service.js';
import { RoomService } from '../services/room.service.js';

const messageService = new MessageService();
const roomService = new RoomService();

export const handleSocketConnection = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join', async ({ name, roomId }) => {
      const isValid = await iamServiceClient.validateUser(name);
      if (!isValid) {
        throw new Error("Invalid user permission");
      }
      socket.join(roomId);
      console.log(`${name} joined room: ${roomId}`);
    });

    socket.on('message', async ({ roomId, senderId, text }) => {
      const message = await messageService.createMessage(
        roomId,
        senderId,
        text,
      );
      io.to(roomId).emit('message', message);
    });

    socket.on('disconnect', async (room) => {
      await roomService.leaveRoom(room, socket.id);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};