import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { AiOutlineComment } from "react-icons/ai";
import { IoSend } from "react-icons/io5";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import Modal from "react-bootstrap/Modal";
import defaultUserIcon from "../assets/user.webp";
import "../styles/post-card.css";

const PostCard = ({ id, content, postDate, postTime, userId, imageUrl }) => {
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [usernames, setUsernames] = useState({});

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

  const fetchUsername = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/v2/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            
          },
        }
      );
      if (response.status === 200) {
        setUsernames((prevUsernames) => ({
          ...prevUsernames,
          [userId]: response.data.username,
        }));
      }
    } catch (error) {
      console.error(
        `Error fetching username for userId ${userId}`,
        error.message
      );
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/v2/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              
            },
          }
        );
        if (response.status === 200) {
          setUser(response.data);
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error("Error fetching user details:", error.message);
      }
    };

    fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      const userIdFromToken = getUserIdFromToken();
      if (!userIdFromToken) {
        console.error("User not authenticated or token invalid.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/v2/likes/${userIdFromToken}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              
            },
          }
        );
        if (response.status === 200) {
          const likedPosts = response.data[0]?.postId || [];
          if (likedPosts.includes(id)) {
            setLiked(true);
          }
        }
      } catch (error) {
        if (error.response) {
          console.error(
            "Error fetching liked posts:",
            error.response.data.message
          );
        } else if (error.request) {
          if (error.code === "ECONNABORTED") {
            console.error("Request timed out. Please try again later.");
          } else {
            console.error("No response received. Please check your network.");
          }
        } else {
          console.error("Error fetching liked posts:", error.message);
        }
      }
    };

    fetchLikedPosts();
  }, [id]);

  useEffect(() => {
    const fetchSavedCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/v2/save/posts/${id}/saved-count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              
            },
          }
        );
        if (response.status === 200) {
          setSavedCount(response.data);
        } else {
          console.error("Failed to fetch saved count");
        }
      } catch (error) {
        console.error("Error fetching saved count:", error.message);
      }
    };

    fetchSavedCount();
  }, [id]);

  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const likeResponse = await axios.get(
          `http://localhost:5000/api/v2/likes/post/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              
            },
          }
        );
        if (likeResponse.status === 200) {
          setLikeCount(likeResponse.data);
        } else {
          console.error("Failed to fetch like count");
        }
      } catch (error) {
        if (error.response) {
          console.error(
            "Error fetching like count:",
            error.response.data.message
          );
        } else if (error.request) {
          if (error.code === "ECONNABORTED") {
            console.error("Request timed out. Please try again later.");
          } else {
            console.error("No response received. Please check your network.");
          }
        } else {
          console.error("Error fetching like count:", error.message);
        }
      }
    };

    fetchLikeCount();
  }, [id]);

  const formatTime = (postTime) => {
    const date = new Date(`1970-01-01T${postTime}Z`);
    return format(date, "hh:mm a");
  };

  const fetchPostDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/v2/posts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            
          },
        }
      );
      if (response.status === 200) {
        const { commentsList } = response.data;
        if (commentsList) {
          const sortedComments = commentsList.sort((a, b) => {
            const dateA = new Date(`${a.commentDate}T${a.commentTime}`);
            const dateB = new Date(`${b.commentDate}T${b.commentTime}`);
            return dateB - dateA;
          });

          setCommentsList(sortedComments);
          setCommentCount(sortedComments.length || 0);

          const uniqueUserIds = [
            ...new Set(commentsList.map((comment) => comment.userId)),
          ];
          uniqueUserIds.forEach((userId) => fetchUsername(userId));
        } else {
          setCommentsList([]);
          setCommentCount(0);
        }
      }
    } catch (error) {
      console.error("Error fetching post details:", error.message);
    }
  };

  const timeSincePost = (postDate, postTime) => {
    const postDateTime = new Date(`${postDate}T${postTime}`);
    const seconds = Math.floor((new Date() - postDateTime) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) return interval + "y ago";
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + "mo ago";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + "d ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + "h ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + "min ago";
    return seconds < 10 ? "just now" : seconds + "s ago";
  };
  const formattedPostTime = timeSincePost(postDate, postTime);

  const toggleComments = (e) => {
    e.stopPropagation();
    setShowCommentsModal(true);
  };

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const userIdFromToken = getUserIdFromToken();
      if (!userIdFromToken) {
        console.error("User not authenticated or token invalid.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/v2/save/posts/${userIdFromToken}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              
            },
          }
        );

        if (response.status === 200) {
          const savedPostIds = response.data.postIds || [];
          if (savedPostIds.includes(id)) {
            setSaved(true);
          }
        } else {
          console.log("No saved posts found.");
        }
      } catch (error) {
        console.error("Error fetching saved posts:", error.message);
      }
    };

    fetchSavedPosts();
  }, [id]);

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
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

  const navigateToAddComment = async () => {
    const commenterId = getUserIdFromToken();
    if (!commenterId) {
      console.error("User not authenticated or token invalid.");
      return;
    }

    if (newComment.trim() === "") {
      console.error("Empty comment cannot be posted.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/v2/posts/comments/create/${commenterId}/${id}`,
        { content: newComment },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            
          },
        }
      );
      if (response.status === 200) {
        await fetchPostDetails();
        setNewComment("");
        setShowNewCommentForm(false);
      }
    } catch (error) {
      console.error("Error posting comment:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (e) => {
    e.stopPropagation();
    const userIdFromToken = getUserIdFromToken();
    if (!userIdFromToken) {
      console.error("User not authenticated or token invalid.");
      return;
    }

    try {
      if (!liked) {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:5000/api/v2/likes/post/${userIdFromToken}/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              
            },
          }
        );
        setLiked(true);
      }
      const token = localStorage.getItem("token");
      const likeResponse = await axios.get(
        `http://localhost:5000/api/v2/likes/post/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            
          },
        }
      );
      if (likeResponse.status === 200) {
        setLikeCount(likeResponse.data);
      }
    } catch (error) {
      console.error("Error toggling like:", error.message);
    }
  };

  const toggleSave = async (e) => {
    e.stopPropagation();
    const userIdFromToken = getUserIdFromToken();
    if (!userIdFromToken) {
      console.error("User not authenticated or token invalid.");
      return;
    }

    try {
      if (!saved) {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:5000/api/v2/save/posts/${userIdFromToken}`,
          [id],
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              
            },
          }
        );
        setSaved(true);
        window.alert("Post saved successfully!");
      } else {
        const token = localStorage.getItem("token");
        await axios.delete(
          `http://localhost:5000/api/v2/save/posts/${userIdFromToken}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              
            },
          }
        );
        setSaved(false);
        window.alert("Post unsaved successfully!");
      }

    } catch (error) {
      console.error("Error toggling save:", error.message);
      window.alert("An error occurred. Please try again.");
    }
  };

  const handleProfileLinkClick = (e) => {
    e.stopPropagation();
    const loggedInUserId = getUserIdFromToken();
    if (userId === loggedInUserId) {
      navigate("/profile");
    } else {
      navigate(`/users/${userId}`);
    }
  };

  const formatDate = (postDate) => {
    const date = new Date(postDate);
    return format(date, "MMM dd, yyyy");
  };

  const isValidDate = (date) => {
    return !isNaN(Date.parse(date));
  };

  const handleCloseCommentsModal = () => setShowCommentsModal(false);

  return (
    <div className="post-card">
      <div className="post-header">
        <div onClick={handleProfileLinkClick}>
          <img
            src={user ? user.profileImage || defaultUserIcon : defaultUserIcon}
            alt="User Icon"
            className="user-icon"
          />
        </div>
        <div className="post-header-text">
          <h2 onClick={handleProfileLinkClick}>
            <span className="username">
              @{username ? user.username : "Error"}
            </span>
            <span className="post-details">
              <span className="separator">•</span>
              <span className="post-date">{formattedPostTime}</span>
            </span>
          </h2>
        </div>
      </div>
      <div className="post-body">
        <div>
          <p className="post-content">{content}</p>
        </div>

        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Post Image"
              className="image"
              onError={handleError}
              style={{ display: imageError ? "none" : "block" }}
            />
            {imageError && (
              <div className="no-image-message">Image cannot be displayed.</div>
            )}
          </>
        ) : null}
      </div>
      <div className="post-footer">
        <div className="footer-icons">
          <div className="icon-wrapper" onClick={toggleComments}>
            <AiOutlineComment className="icon" />
            <p className="comment-num">{commentCount}</p>
          </div>

          <div>
            {liked ? (
              <IoMdHeart className="icon liked" onClick={toggleLike} />
            ) : (
              <IoMdHeartEmpty className="icon" onClick={toggleLike} />
            )}
            <span className="like-count">{likeCount}</span>
          </div>
          <div>
            {saved ? (
              <IoBookmark className="icon saved" onClick={toggleSave} />
            ) : (
              <IoBookmarkOutline className="icon" onClick={toggleSave} />
            )}
          </div>
        </div>

        <Modal
          show={showCommentsModal}
          onHide={handleCloseCommentsModal}
          centered
          className="comments-modal"
        >
          <Modal.Header className="share-title">
            <Modal.Title>Comments</Modal.Title>
          </Modal.Header>
          <Modal.Body className="share-body">
            <ul className="comment-list">
              {commentsList.length === 0 ? (
                <li className="no-comments-message">
                  No comments yet. Be the first to add one!
                </li>
              ) : (
                commentsList.map((comment) => (
                  <li key={comment.id} className="comment-item1">
                    <img
                      src={
                        usernames[comment.userId]
                          ? user.profileImage || defaultUserIcon
                          : defaultUserIcon
                      }
                      alt="User Icon"
                      className="user-icon1"
                    />
                    <strong className="user-id">
                      @{usernames[comment.userId] || comment.userId} •{" "}
                      <small className="small-timer">
                        {isValidDate(comment.commentDate)
                          ? `${formatDate(comment.commentDate)} at ${formatTime(
                              comment.commentTime
                            )}`
                          : "N/A"}
                      </small>
                    </strong>
                    <p className="user-comment">{comment.content}</p>
                  </li>
                ))
              )}
            </ul>

            <div className="new-comment-form">
              <textarea
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Write your comment..."
              />
              <button
                className="post-comment-button"
                onClick={navigateToAddComment}
                disabled={loading}
              >
                <IoSend />
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

PostCard.propTypes = {
  id: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  postDate: PropTypes.string.isRequired,
  postTime: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
};

export default PostCard;