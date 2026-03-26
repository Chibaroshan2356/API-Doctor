import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: number;
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
  time: Date;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  markAllRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      time: new Date(),
      read: false
    };
    
    setNotifications((prev) => [
      newNotification,
      ...prev
    ]);
  };

  const markAllRead = () => {
    setNotifications((prev) => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAllRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export type { Notification };
