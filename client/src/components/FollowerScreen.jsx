import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/followerScreen.module.css';
import { getUserIdFromServer } from '../auth/authUtils';
import profileAvatar from '../assets/user.webp';

const API_URL = import.meta.env.VITE_API_URL;

const FollowerScreen = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { type } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userId = await getUserIdFromServer();
        const endpoint = type === 'followers' ? 'followers' : 'following';
        const response = await axios.get(
          `${API_URL}users/${userId}/${endpoint}`,
          {
            withCredentials: true,
          }
        );
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load ' + type);
      } finally {
        setIsLoading(false);
      }
    };

    if (type !== 'followers' && type !== 'following') {
      setError('Invalid page type');
      return;
    }

    fetchUsers();
  }, [type]);

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={handleBack} className={styles.backButton}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.title}>
          {type.charAt(0).toUpperCase() + type.slice(1)} List
        </h1>
      </div>

      <div className={styles.userList}>
        {users.length === 0 ? (
          <p className={styles.emptyState}>No {type} found</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={styles.userCard}
              onClick={() => handleUserClick(user.username)}
            >
              <img
                src={profileAvatar}
                alt={user.username}
                className={styles.avatar}
              />
              <div className={styles.userInfo}>
                <h3 className={styles.fullName}>{user.fullName}</h3>
                <p className={styles.username}>@{user.username}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowerScreen;
