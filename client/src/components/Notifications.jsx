import { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserIdFromServer } from '../auth/authUtils';
import styles from '../styles/notifications.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserIdFromServer();
        setCurrentUserId(userId);

        if (!userId) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const [notificationsRes, followRequestsRes] = await Promise.all([
          axios.get(`${API_URL}notifications/${userId}`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}follow/requests/pending?userId=${userId}`, {
            withCredentials: true,
          }),
        ]);

        setNotifications(notificationsRes.data);
        setFollowRequests(followRequestsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAcceptFollow = async (followRequestId) => {
    try {
      await axios.post(
        `${API_URL}follow/accept`,
        { requestId: followRequestId },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      setAcceptedRequests((prev) => [...prev, followRequestId]);

      setTimeout(() => {
        setAcceptedRequests((prev) =>
          prev.filter((id) => id !== followRequestId)
        );
        setFollowRequests((prev) =>
          prev.filter((req) => req.id !== followRequestId)
        );
      }, 1000);
    } catch (error) {
      console.error('Error accepting follow request:', error);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.notificationsContainer}>
      <h1>Notifications</h1>

      {notifications.length === 0 ? (
        <p className={styles.noNotifications}>No notifications</p>
      ) : (
        <div className={styles.notificationsList}>
          {notifications.map((notif) => {
            const notifType = notif.type?.toUpperCase();

            const matchingRequest = followRequests.find(
              (req) => req.receiverId === notif.userId
            );

            const isAccepted =
              matchingRequest && acceptedRequests.includes(matchingRequest.id);

            return (
              <div
                key={notif.id}
                className={`${styles.notificationCard} ${notif.seen ? styles.seen : ''}`}
              >
                <p className={styles.message}>{notif.message}</p>
                <span className={styles.timestamp}>
                  {new Date(notif.timestamp).toLocaleString()}
                </span>

                {notifType === 'FOLLOW' && matchingRequest && (
                  <div
                    style={{
                      marginTop: '10px',
                      transition: 'opacity 0.3s ease-in',
                    }}
                  >
                    {isAccepted ? (
                      <p style={{ color: 'green', fontWeight: 'bold' }}>
                        You accepted this follow request.
                      </p>
                    ) : (
                      <div
                        style={{ border: '1px dashed #888', padding: '10px' }}
                      >
                        <button
                          style={{
                            marginRight: '8px',
                            padding: '6px 12px',
                            backgroundColor: '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleAcceptFollow(matchingRequest.id)}
                        >
                          Accept
                        </button>
                        <button
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#aaa',
                            color: '#fff',
                            border: 'none',
                          }}
                          disabled
                          title='Reject functionality not implemented'
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
