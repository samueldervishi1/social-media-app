import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "../styles/inbox.module.css";
import defaultUserIcon from "../assets/user.webp";

const MessageComponent = React.lazy(() => import("./Message"));

import { getUserIdFromToken } from "../auth/authUtils";

const Inbox = ({ user }) => {
  const [showMessageComponent, setShowMessageComponent] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch followers
  useEffect(() => {
    const fetchFollowers = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error("No token found or userId not present.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/v2/users/list/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          const followerIds = response.data?.followerId || [];
          if (followerIds.length > 0) {
            const followersData = await Promise.all(
              followerIds.map(async (followerId) => {
                const followerResponse = await axios.get(
                  `http://localhost:5000/api/v2/users/${followerId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                return followerResponse.data;
              })
            );
            setFollowers(followersData);
          } else {
            setFollowers([]);
          }
        } else {
          setErrorMessage(
            "Unable to fetch followers. Please check your internet connection."
          );
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
        setErrorMessage(
          "Unable to fetch followers. Please check your internet connection."
        );
      }
    };

    fetchFollowers();
  }, [user]);

  const handleMessageClick = (follower) => {
    if (showMessageComponent && receiverId === follower.id) {
      setShowMessageComponent(false);
      setReceiverId(null);
      setSelectedUser(null);
    } else {
      setReceiverId(follower.id);
      setSelectedUser(follower);
      setShowMessageComponent(true);
    }
  };

  return (
    <div className={styles.inbox_container}>
      <div
        className={`${styles.message_container} ${
          showMessageComponent ? styles.open : ""
        }`}
      >
        {showMessageComponent && receiverId && selectedUser && (
          <MessageComponent
            senderId={getUserIdFromToken()}
            receiverId={receiverId}
          />
        )}
      </div>

      <div className={styles.bottom_navbar}>
        {errorMessage ? (
          <p>{errorMessage}</p>
        ) : followers.length > 0 ? (
          <div className={styles.followers_list}>
            {followers.map((follower) => (
              <button
                key={follower.id}
                className={styles.follower_btn}
                onClick={() => handleMessageClick(follower)}
              >
                <img src={defaultUserIcon} className={styles.follower_avatar} />
              </button>
            ))}
          </div>
        ) : (
          <p>No followers yet. Follow people to start chatting!</p>
        )}
      </div>
    </div>
  );
};

Inbox.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
  }),
};

export default Inbox;