import { roomRepository } from "../repositories/index.js";
import type { IRoom } from "../db/models/room.model.js";
import {
  PaginationOptions,
  PaginationResponse,
} from "../../../shared/src/types/pagination.type.js";
import { PaginationUtils } from "../../../shared/src/utils/pagination.util.js";
import notifServiceClient from "../../../shared/src/notif-service/adapter/notif.adapter.js";

export class RoomService {
  async getRoomById(roomId: string): Promise<IRoom | null> {
    return roomRepository.findById(roomId);
  }

  async listRooms(
    options: PaginationOptions,
    extraFilters: Record<string, any> = {}
  ): Promise<PaginationResponse<IRoom>> {
    options.filters = {
      ...(options.filters || {}),
      ...extraFilters,
    };
    const result = await roomRepository.findWithPagination(options);
    return PaginationUtils.formatResponse(
      result.data,
      result.hasNextPage,
      options,
      result.totalCount
    );
  }

  async createRoom(
    name: string,
    participants: string[],
    createdBy: string
  ): Promise<IRoom> {
    const baseName = name;
    let candidate = baseName;
    let suffix = 2;
    const MAX_SUFFIX = 10;
    while (suffix <= MAX_SUFFIX) {
      const exists = (await roomRepository.findByName(candidate)).length > 0;
      if (!exists) {
        break;
      }
      candidate = `${baseName}'s Room (${suffix})`;
      suffix++;
    }
    if (suffix > MAX_SUFFIX && (await roomRepository.findByName(candidate)).length > 0) {
      throw new Error("Room with current name already exists");
    }

    return roomRepository.create({
      name: candidate,
      participants,
      createdBy,
    });
  }

  async updateRoom(
    roomId: string,
    data: Partial<{ name?: string; participants: string[] }>,
    userId: string,
    isStaff: boolean
  ): Promise<IRoom | null> {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (data.name && room.name == data.name) {
      throw new Error("Room with current name already exists");
    }

    if (
      data.participants &&
      data.participants.every((participant) =>
        room.participants.includes(participant)
      )
    ) {
      throw new Error("Room with current participants already exists");
    }

    if (room.createdBy !== userId && !isStaff) {
      throw new Error("You are not authorized to update this room");
    }
    return roomRepository.updateById(roomId, data);
  }

  async deleteRoom(
    roomId: string,
    userId: string,
    isStaff: boolean
  ): Promise<IRoom | null> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error("Room not found");
    }
    if (room.createdBy !== userId && !isStaff) {
      throw new Error("You are not authorized to delete this room");
    }
    return roomRepository.deleteById(roomId);
  }

  async joinRoom(
    roomId: string,
    userId: string,
    fullName: string
  ): Promise<IRoom | null> {
    const room = await this.getRoomById(roomId);

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.participants.includes(userId)) {
      throw new Error("User already in room");
    }

    const joinedRoom = await roomRepository.joinRoom(roomId, userId);

    if (joinedRoom) {
      await notifServiceClient.notifyRoomJoin(
        room.createdBy,
        `User ${fullName} has joined your room`,
        { roomId, userId: userId }
      );
    }

    return joinedRoom;
  }

  async leaveRoom(roomId: string, userId: string): Promise<IRoom | null> {
    return roomRepository.leaveRoom(roomId, userId);
  }
}
