import { createContext, useContext, type ReactNode } from 'react';

import {
  useMessageNotifications,
  type UseMessageNotificationsOptions,
} from '../hooks/useMessageNotifications';

interface MessageNotificationContextValue {
  unreadCount: number;
  unreadRooms: string[];
  hasNotifications: boolean;
  markAllAsRead: () => void;
  markRoomAsRead: (roomId: string) => void;
}

const MessageNotificationContext = createContext<MessageNotificationContextValue | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
  options?: UseMessageNotificationsOptions;
}

export function MessageNotificationProvider({ children, options }: ProviderProps) {
  const value = useMessageNotifications(options);
  return <MessageNotificationContext.Provider value={value}>{children}</MessageNotificationContext.Provider>;
}

export function useMessageNotificationContext(): MessageNotificationContextValue {
  const context = useContext(MessageNotificationContext);
  if (!context) {
    throw new Error('useMessageNotificationContext must be used within a MessageNotificationProvider');
  }
  return context;
}


