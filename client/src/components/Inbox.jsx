import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MessageComponent from "./Message";
import { MdMessage } from "react-icons/md";
import { IoIosArrowRoundBack } from "react-icons/io";
import "../styles/inbox.css";

const Inbox = ({ user }) => {
  const [showMessageComponent, setShowMessageComponent] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        return Date.now() < expirationTime;
      } catch (error) {
        console.error("Error decoding token: ", error.message);
        return false;
      }
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

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
              "X-Secret-Code": "I-see-you!",
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
                      "X-Secret-Code": "I-see-you!",
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

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return decodedToken.userId;
      } catch (error) {
        console.error("Error decoding token:", error.message);
        return null;
      }
    }
    return null;
  };

  const handleBackHome = () => {
    navigate("/home");
  };

  return (
    <div style={{ display: "flex", position: "relative" }}>
      <div className="user-card">
        <h4 style={{ textAlign: "center" }}>
          {" "}
          <IoIosArrowRoundBack
            className="back-icon1"
            onClick={handleBackHome}
            style={{
              backgroundColor: "lightgrey",
              borderRadius: "50%",
              width: 30,
              height: 30,
              gap: 20,
              transition: "background-color 0.3s ease",
              marginRight: 10,
              cursor: "pointer",
            }}
          />
          Followers
        </h4>
        {user?.username && <h3>{user.username}</h3>}
        {user?.email && <p>Email: {user.email}</p>}
        {errorMessage ? (
          <p>{errorMessage}</p>
        ) : followers.length > 0 ? (
          <div className="followers-list">
            <ul>
              {followers.map((follower) => (
                <li key={follower.id}>
                  {follower.username}
                  <button
                    className="sheno"
                    onClick={() => handleMessageClick(follower)}
                  >
                    <MdMessage />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No followers yet. Follow people to start chatting!</p>
        )}
      </div>
      <div
        className={`message-container ${showMessageComponent ? "open" : ""}`}
      >
        {showMessageComponent && receiverId && selectedUser && (
          <MessageComponent
            senderId={getUserIdFromToken()}
            receiverId={receiverId}
          />
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
