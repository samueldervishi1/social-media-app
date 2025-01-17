import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import userImage from '../assets/user.webp';
import styles from '../styles/friends.module.css';
import { getUsernameFromToken } from '../auth/authUtils';

const token = localStorage.getItem('token');
const API_URL = import.meta.env.VITE_API_URL;

const Friends = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const loggedInUsername = getUsernameFromToken(token);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/v2/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(data.filter((user) => user.username !== loggedInUsername));
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Try again later.');
    }
  }, [loggedInUsername]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFollow = useCallback((userId) => {
    console.log(`Follow button clicked for user with ID: ${userId}`);
  }, []);

  const handleHide = useCallback((userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  }, []);

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.friends_container}>
      <div className={styles.userCardsContainer}>
        {users.length === 0 ? (
          <div className={styles.noUsers}>Try again later.</div>
        ) : (
          users.map((user) => (
            <div className={styles.userCard} key={user.id}>
              <img
                src={userImage}
                alt={user.username}
                className={styles.userImage}
                loading='lazy'
              />
              <div className={styles.userInfo}>
                <h3>{user.fullName}</h3>
                <p>@{user.username}</p>
              </div>
              <div className={styles.userActions}>
                <button
                  className={styles.followButton}
                  onClick={() => handleFollow(user.id)}
                >
                  Follow
                </button>
                <button
                  className={styles.hideButton}
                  onClick={() => handleHide(user.id)}
                >
                  Hide
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friends;