export interface NotificationEntity {
  id: string | number;
  title: string;
  message: string;
  // optional i18n key for the message and optional params for interpolation
  messageKey?: string;
  messageParams?: { [key: string]: any };
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  read?: boolean;
}
