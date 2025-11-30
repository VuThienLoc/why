import MessageModel from "../db/models/message.model.js";
import { MessageRepository } from "./message.repository.js";

import RoomModel from "../db/models/room.model.js";
import { RoomRepository } from "./room.repository.js";

// Repository factory
export class RepositoryFactory {
  private static messageRepository: MessageRepository;
  private static roomRepository: RoomRepository;

  static async initializeRepositories(): Promise<void> {
  }

  static getMessageRepository(): MessageRepository {
    if (!this.messageRepository) {
      this.messageRepository = new MessageRepository(MessageModel);
    }
    return this.messageRepository;
  }

  static getRoomRepository(): RoomRepository {
    if (!this.roomRepository) {
      this.roomRepository = new RoomRepository(RoomModel);
    }
    return this.roomRepository;
  }
}

// Export individual repositories for convenience
export const messageRepository = RepositoryFactory.getMessageRepository();
export const roomRepository = RepositoryFactory.getRoomRepository();
