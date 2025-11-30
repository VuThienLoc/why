import axios from 'axios';
import type { AxiosInstance } from 'axios';

const MESSAGE_SERVICE_URL =
  import.meta.env.VITE_MESSAGE_SERVICE_URL ?? 'http://localhost:4001/api';

const messageServiceClient: AxiosInstance = axios.create({
  baseURL: MESSAGE_SERVICE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RoomSummary {
  _id: string;
  name?: string;
  participants: string[];
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  _id: string;
  roomId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
  totalCount?: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationParams {
  limit?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const roomApi = {
  getParticipantRooms(params?: PaginationParams) {
    return messageServiceClient.get<PaginatedResponse<RoomSummary>>(
      '/rooms/participant',
      { params }
    );
  },
  getMyRooms(params?: PaginationParams) {
    return messageServiceClient.get<PaginatedResponse<RoomSummary>>(
      '/rooms/my',
      { params }
    );
  },
  createRoom(payload: { name?: string; participants: string[] }) {
    return messageServiceClient.post<RoomSummary>('/rooms/create', payload);
  },
  joinRoom(roomId: string) {
    return messageServiceClient.post<{ message: string }>(
      `/rooms/join/${roomId}`
    );
  },
  leaveRoom(roomId: string) {
    return messageServiceClient.post<{ message: string }>(
      `/rooms/leave/${roomId}`
    );
  },
};

export const messageApi = {
  getRoomMessages(roomId: string, params?: PaginationParams & { search?: string }) {
    return messageServiceClient.get<PaginatedResponse<ChatMessage>>(
      `/messages/${roomId}`,
      { params }
    );
  },
  sendMessage(roomId: string, text: string) {
    return messageServiceClient.post<{ message: string }>(
      `/messages/send/${roomId}`,
      { text }
    );
  },
};


