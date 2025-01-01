import React, { useEffect, useState } from "react";
import axios from "axios";
import userImage from "../assets/user.webp";
import styles from "../styles/friends.module.css";

import { getUsernameFromToken } from "../auth/authUtils";

const Menu = React.lazy(() => import("./Menu"));
const token = localStorage.getItem("token");

const Friends = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const loggedInUsername = getUsernameFromToken(token);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/v2/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const filteredUsers = response.data.filter(
          (user) => user.username !== loggedInUsername
        );

        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Try again later.");
      }
    };

    fetchUsers();
  }, [loggedInUsername, token]);

  const handleFollow = (userId) => {
    console.log(`Follow button clicked for user with ID: ${userId}`);
  };

  const handleHide = (userId) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.friends_container}>
      <Menu />
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