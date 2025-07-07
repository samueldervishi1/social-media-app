import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNotifications } from './NotificationContext';
import { getUserIdFromServer } from '../auth/authUtils';
import styles from '../styles/notificationsPopup.module.css';

const NotificationsPopup = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, setNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const userId = await getUserIdFromServer();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}notifications/${userId}`,
          { withCredentials: true }
        );
        setNotifications(data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.popup_container} ref={popupRef}>
      <div className={styles.popup_header}>
        <h3>
          Notifications | <a href='/notifications'>View All</a>
        </h3>
        <button className={styles.close_button} onClick={onClose}>
          ×
        </button>
      </div>
      <div className={styles.popup_content}>
        {loading ? (
          <div className={styles.loading}>Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <ul className={styles.notifications_list}>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`${styles.notification_item} ${
                  notification.seen
                    ? styles.notification_seen
                    : styles.notification_unseen
                }`}
              >
                <div className={styles.notification_content}>
                  <p>{notification.message}</p>
                  <div className={styles.notification_footer}>
                    <span className={styles.notification_time}>
                      {new Date(
                        notification.timestamp + 'Z'
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {!notification.seen && (
                      <button
                        className={styles.mark_read_button}
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.no_notifications}>
            No notifications to display
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPopup;
