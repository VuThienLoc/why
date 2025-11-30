import { messageRepository } from "../repositories/index.js";
import { roomRepository } from "../repositories/index.js";
import type { IMessage } from "../db/models/message.model.js";
import { PaginationOptions } from "../../../shared/src/types/pagination.type.js";
import { PaginationResponse } from "../../../shared/src/types/pagination.type.js";
import { PaginationUtils } from "../../../shared/src/utils/pagination.util.js";
import { decryptText, encryptText } from "../utils/encrypt.utils.js";
import notifServiceClient from "../../../shared/src/notif-service/adapter/notif.adapter.js";

export class MessageService {
  async getMessageById(messageId: string): Promise<IMessage | null> {
    const saved = await messageRepository.findById(messageId);
    if (!saved) {
      throw new Error("Message not found");
    }
    return {
      ...(saved.toObject?.() ?? saved),
      text: decryptText(saved.text),
    };
  }

  async createMessage(
    roomId: string,
    userId: string,
    text: string
  ): Promise<IMessage> {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }
    const message = await messageRepository.create({
      roomId,
      userId,
      text: encryptText(text),
    });

    const recipients = room.participants.filter((id) => id !== userId);
    console.log("[MessageService] createMessage", recipients);

    if (recipients.length > 0) {
      await notifServiceClient.notifyNewMessageMany(
        recipients,
        `You have a new message in room ${room.name}`,
        { roomId, messageId: message._id }
      );
    }
    return message;
  }

  async updateMessage(
    roomId: string,
    messageId: string,
    currentUserId: string,
    text: string
  ): Promise<IMessage> {
    const room = await roomRepository.findById(roomId);
    if (!room) throw new Error("Room not found");

    const message = await messageRepository.findById(messageId);
    if (!message || message.roomId !== roomId || message?.isDeleted)
      throw new Error("Message not found");

    if (message.userId !== currentUserId) {
      throw new Error("You can only edit your own messages");
    }

    const encryptedText = encryptText(text);

    const updatedMessage = await messageRepository.updateById(
      roomId,
      messageId,
      { text: encryptedText }
    );
    if (!updatedMessage) {
      throw new Error("Message not found");
    }
    return {
      ...(updatedMessage.toObject?.() ?? updatedMessage),
      text: decryptText(updatedMessage.text),
    };
  }

  async deleteMessage(
    roomId: string,
    messageId: string,
    userId: string
  ): Promise<IMessage> {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    const message = await messageRepository.findById(messageId);
    if (!message || message.roomId !== roomId) {
      throw new Error("Message not found");
    }

    if (message.userId !== userId) {
      throw new Error("You can only delete your own messages");
    }

    const deletedMessage = await messageRepository.deleteById(
      roomId,
      messageId
    );
    if (!deletedMessage) {
      throw new Error("Message not found");
    }
    return {
      ...(deletedMessage.toObject?.() ?? deletedMessage),
      text: decryptText(deletedMessage.text),
    };
  }

  async getMessagesByRoomId(
    roomId: string,
    options: PaginationOptions
  ): Promise<PaginationResponse<IMessage>> {
    const result = await messageRepository.findWithPagination(roomId, options);
    return PaginationUtils.formatResponse(
      result.data.map((message) => ({
        ...(message.toObject?.() ?? message),
        text: decryptText(message.text),
      })),
      result.hasNextPage,
      options,
      result.totalCount
    );
  }
}
