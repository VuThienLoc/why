import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { messageApi, roomApi, type RoomSummary } from '../service/messageRoomService';
import { useAuthContext } from './useAuthContext';

interface StoredRoomState {
  lastMessageId: string;
  updatedAt?: string;
}

export interface UseMessageNotificationsOptions {
  pollInterval?: number;
  enabled?: boolean;
  suppressToasts?: boolean;
  autoClear?: boolean;
}

const getStorageKey = (userId: string) => `lims:chat:last-message:${userId}`;

export function useMessageNotifications({
  pollInterval = 5000,
  enabled = true,
  suppressToasts = false,
  autoClear = false,
}: UseMessageNotificationsOptions = {}) {
  const { user } = useAuthContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadRooms, setUnreadRooms] = useState<string[]>([]);

  const lastMessageIdRef = useRef<Record<string, string>>({});
  const unreadRoomsRef = useRef<Set<string>>(new Set());
  const hasStoredSnapshotRef = useRef(false);
  const isFetchingRef = useRef(false);

  const resetState = useCallback(() => {
    lastMessageIdRef.current = {};
    unreadRoomsRef.current.clear();
    hasStoredSnapshotRef.current = false;
    setUnreadRooms([]);
    setUnreadCount(0);
  }, []);

  const persistState = useCallback(() => {
    if (!user) return;
    try {
      const snapshot: Record<string, StoredRoomState> = {};
      Object.entries(lastMessageIdRef.current).forEach(([roomId, messageId]) => {
        snapshot[roomId] = {
          lastMessageId: messageId,
        };
      });
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(snapshot));
    } catch (error) {
      console.warn('Không thể lưu trạng thái thông báo tin nhắn:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      resetState();
      return;
    }

    resetState();

    try {
      const stored = localStorage.getItem(getStorageKey(user.id));
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, StoredRoomState>;
        Object.entries(parsed).forEach(([roomId, value]) => {
          if (value?.lastMessageId) {
            lastMessageIdRef.current[roomId] = value.lastMessageId;
          }
        });
        if (Object.keys(parsed).length > 0) {
          hasStoredSnapshotRef.current = true;
        }
      }
    } catch (error) {
      console.warn('Không thể tải trạng thái thông báo tin nhắn:', error);
    }
  }, [resetState, user]);

  const markAllAsRead = useCallback(() => {
    if (unreadRoomsRef.current.size === 0) return;
    unreadRoomsRef.current.clear();
    setUnreadRooms([]);
    setUnreadCount(0);
    persistState();
  }, [persistState]);

  const markRoomAsRead = useCallback(
    (roomId: string) => {
      if (!roomId || !unreadRoomsRef.current.has(roomId)) return;
      unreadRoomsRef.current.delete(roomId);
      setUnreadRooms(Array.from(unreadRoomsRef.current));
      setUnreadCount(unreadRoomsRef.current.size);
      persistState();
    },
    [persistState]
  );

  useEffect(() => {
    if (autoClear) {
      markAllAsRead();
    }
  }, [autoClear, markAllAsRead]);

  const processRoom = useCallback(
    async (room: RoomSummary) => {
      try {
        const { data } = await messageApi.getRoomMessages(room._id, {
          limit: 1,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        const latest = data.data[0];
        if (!latest?._id) return;

        const previousId = lastMessageIdRef.current[room._id];
        lastMessageIdRef.current[room._id] = latest._id;

        if (previousId === latest._id) return;

        if (latest.userId === user?.id) {
          unreadRoomsRef.current.delete(room._id);
        } else {
          unreadRoomsRef.current.add(room._id);
          if (hasStoredSnapshotRef.current && !suppressToasts) {
            toast.info('Tin nhắn mới', {
              description: `${room.name || 'Phòng chat'}: ${latest.text || 'Bạn có tin nhắn mới.'}`,
              duration: 3500,
            });
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        if (import.meta.env.DEV) {
          console.warn(`Không thể tải tin nhắn của phòng ${room._id}:`, error);
        }
      }
    },
    [suppressToasts, user?.id]
  );

  const pollRooms = useCallback(async () => {
    if (!user || !enabled || isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const { data } = await roomApi.getParticipantRooms({
        limit: 50,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      const rooms = data.data ?? [];
      if (rooms.length === 0) {
        unreadRoomsRef.current.clear();
        setUnreadRooms([]);
        setUnreadCount(0);
        return;
      }

      await Promise.all(rooms.map((room) => processRoom(room)));
      setUnreadRooms(Array.from(unreadRoomsRef.current));
      setUnreadCount(unreadRoomsRef.current.size);
      persistState();

      if (!hasStoredSnapshotRef.current) {
        hasStoredSnapshotRef.current = true;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      if (import.meta.env.DEV) {
        console.warn('Không thể lấy danh sách phòng chat:', error);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [enabled, persistState, processRoom, user]);

  useEffect(() => {
    if (!user || !enabled) return;
    
    let interval: ReturnType<typeof setInterval> | null = null;
    
    const pollIfVisible = () => {
      // Chỉ poll khi tab đang active
      if (document.visibilityState === 'visible') {
        void pollRooms();
      }
    };
    
    const startPolling = () => {
      // Dừng interval cũ nếu có
      if (interval) {
        clearInterval(interval);
      }
      // Poll ngay lập tức
      pollIfVisible();
      // Tạo interval mới
      interval = setInterval(pollIfVisible, pollInterval);
    };
    
    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    
    // Bắt đầu polling
    startPolling();
    
    // Dừng polling khi tab không active, tiếp tục khi tab active lại
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startPolling();
      } else {
        stopPolling();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, pollInterval, pollRooms, user]);

  return {
    unreadCount,
    unreadRooms,
    hasNotifications: unreadRooms.length > 0,
    markAllAsRead,
    markRoomAsRead,
  };
}


