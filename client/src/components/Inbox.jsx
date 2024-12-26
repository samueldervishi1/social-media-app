import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import styles from "../styles/inbox.module.css";
import defaultUserIcon from "../assets/user.webp";
import customLoadingGif from "../assets/ZKZg.gif";

const MessageComponent = React.lazy(() => import("./Message"));
import { getUserIdFromToken } from "../auth/authUtils";

const Inbox = ({ user }) => {
  const [showMessageComponent, setShowMessageComponent] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

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
          `http://localhost:8080/api/v2/users/list/${userId}`,
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
                  `http://localhost:8080/api/v2/users/${followerId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                const followerData = followerResponse.data;
                return {
                  ...followerData,
                  username: followerData.username || "Unknown",
                };
              })
            );
            setFollowers(followersData);
          } else {
            setFollowers([]);
            setErrorMessage(
              "You don't have any followers yet. Follow people to start chatting!"
            );
          }
        } else if (response.status === 404) {
          setFollowers([]);
          setErrorMessage(
            "You don't have any followers yet. Follow people to start chatting!"
          );
        } else if (response.status === 500) {
          console.error("Server error: 500");
          setErrorMessage(
            "An error occurred on the server. Please try again later."
          );
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setFollowers([]);
          setErrorMessage(
            "You don't have any followers yet. Follow people to start chatting!"
          );
        } else {
          console.error("Error fetching followers:", error);
          setErrorMessage(
            "Unable to fetch followers. Please check your internet connection."
          );
        }
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
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
          <React.Suspense fallback={<div>Loading...</div>}>
            <MessageComponent
              senderId={getUserIdFromToken()}
              receiverId={receiverId}
            />
          </React.Suspense>
        )}
      </div>

      <div className={styles.bottom_navbar}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <img
              src={customLoadingGif}
              alt="Loading..."
              className={styles.loadingGif}
            />
          </div>
        ) : errorMessage ? (
          <p>{errorMessage}</p>
        ) : followers.length > 0 ? (
          <div className={styles.followers_list}>
            {followers.map((follower) => (
              <button
                key={follower.id}
                className={styles.follower_btn}
                onClick={() => handleMessageClick(follower)}
              >
                <img
                  src={defaultUserIcon}
                  className={styles.follower_avatar}
                  alt="User Avatar"
                />
                <p className={styles.follower_username}>{follower.username}</p>
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