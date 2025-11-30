export const NOTIF_TYPE = [
  'NEW_MESSAGE',
  'ROOM_JOIN',
  'LAB_RESULT_READY',
  'ROLE_CHANGED',
  'GENERIC',
] as const;

// Type definitions for better type safety
export type NotificationTypes = typeof NOTIF_TYPE[number];

// Event code descriptions for documentation
export const TYPE_TITLE: Record<NotificationTypes, string> = {
  'NEW_MESSAGE': 'You have received a new message',
  'ROOM_JOIN': 'Someone has joined your room',
  'LAB_RESULT_READY': 'Lab result are ready',
  'ROLE_CHANGED': 'Your role has been changed',
  'GENERIC': 'New notification',
};