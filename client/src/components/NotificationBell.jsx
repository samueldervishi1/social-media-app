import { useEffect } from 'react';
import { startNotificationWebSocket } from '../utils/notificationWebSocket';
import { useNotifications } from './NotificationContext';

const NotificationListener = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    startNotificationWebSocket((notif) => {
      console.log('New notification received:', notif);
      addNotification(notif);
      showToast(notif.message);
    });
  }, []);

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.background = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = 9999;
    toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 4000);
  };

  return null;
};

export default NotificationListener;
