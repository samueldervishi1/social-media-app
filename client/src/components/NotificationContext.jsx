import { useEffect, useState, createContext, useContext } from 'react';
import axios from 'axios';
import { getUserIdFromServer } from '../auth/authUtils';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}notifications/mark-seen/${id}`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, seen: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.seen).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = await getUserIdFromServer();
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}notifications/${userId}`,
          { withCredentials: true }
        );
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        unreadCount,
        setNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
