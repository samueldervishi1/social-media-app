import { useEffect } from 'react';
import { startNotificationWebSocket } from '../utils/notificationWebSocket';

const NotificationListener = () => {
  useEffect(() => {
    startNotificationWebSocket((notif) => {
      console.log('New notification received:', notif);
    });
  }, []);

  return null;
};

export default NotificationListener;