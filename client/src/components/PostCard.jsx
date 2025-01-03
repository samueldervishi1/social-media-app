import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { AiOutlineComment } from "react-icons/ai";
import { IoSend } from "react-icons/io5";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import Modal from "react-bootstrap/Modal";
import { Snackbar, Alert } from "@mui/material";
import defaultUserIcon from "../assets/user.webp";
import "../styles/post-card.css";

import { getUserIdFromToken } from "../auth/authUtils";

const token = localStorage.getItem("token");

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
  const [communityName, setCommunityName] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [usernames, setUsernames] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reason, setReason] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const navigate = useNavigate();

  const isUserPostOwner = getUserIdFromToken() === userId;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  //fetch user username
  const fetchUsername = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v2/users/${userId}`,
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

  //fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/v2/users/${userId}`,
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

  //fetch liked posts
  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/v2/likes/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          const likedPosts = response.data[0]?.postId || [];
          setLiked(likedPosts.includes(id));
        }
      } catch (error) {
        console.error("Error fetching liked posts:", error.message);
      }
    };

    fetchLikedPosts();
  }, [id, userId]);

  //fetch liked count per post
  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const likeResponse = await axios.get(
          `http://localhost:8080/api/v2/likes/post/${id}`,
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
        console.error("Error fetching like count:", error.message);
      }
    };

    fetchLikeCount();
  }, [id]);

  //fetch post details
  const fetchPostDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v2/posts/${id}`,
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

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  //fetch saved posts
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/v2/save/posts/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.status === 200) {
          const savedPostIds = response.data.postIds || [];
          setSaved(savedPostIds.includes(id));
        }
      } catch (error) {
        console.error("Error fetching saved posts:", error.message);
      }
    };

    fetchSavedPosts();
  }, [id, userId]);

  //create comment
  const navigateToAddComment = async () => {
    if (!userId) {
      console.error("User not authenticated or token invalid.");
      return;
    }

    if (newComment.trim() === "") {
      console.error("Empty comment cannot be posted.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/v2/posts/comments/create/${userId}/${id}`,
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

  //like a post
  const toggleLike = async () => {
    try {
      if (liked) {
        await axios.delete(
          `http://localhost:8080/api/v2/likes/${userId}/post/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          `http://localhost:8080/api/v2/likes/${userId}/post/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error.message);
    }
  };

  //save a post
  const toggleSave = async (e) => {
    e.stopPropagation();
    if (!userId) {
      console.error("User not authenticated or token invalid.");
      return;
    }

    try {
      if (!saved) {
        await axios.post(
          `http://localhost:8080/api/v2/save/posts/${userId}`,
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
        await axios.delete(
          `http://localhost:8080/api/v2/save/posts/${userId}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
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

  //delete a post
  const deletePost = async () => {
    if (!userId) {
      console.error("User not authenticated or token invalid.");
      setSnackbarMessage("Authentication error. Please log in again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (userId !== userId) {
      console.error("You are not authorized to delete this post.");
      setSnackbarMessage("You are not authorized to delete this post.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v2/posts/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSnackbarMessage("Post deleted successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting post:", error.message);
      setSnackbarMessage("Error deleting post. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  //delete comment
  const deleteComment = async (commentId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v2/posts/comments/delete/${id}/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        console.log("Comment deleted successfully");
        await fetchPostDetails();
      }
    } catch (error) {
      console.error("Error deleting comment:", error.message);
    }
  };

  //report post
  const handleReportSubmit = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for reporting!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/v2/report`,
        {
          userId,
          postId: id,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Report submitted successfully!");
        setShowReportModal(false);
        setReason("");
      } else {
        alert("Failed to submit the report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const openReportModal = () => {
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReason("");
  };

  const handleSelect = (value) => {
    setReason(value);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const formatTime = (postTime) => {
    const date = new Date(`1970-01-01T${postTime}Z`);
    return format(date, "hh:mm a");
  };

  //calculate time of the post
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

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleProfileLinkClick = (e) => {
    e.stopPropagation();
    const loggedInUserId = getUserIdFromToken();
    if (userId === loggedInUserId) {
      navigate("/u/profile");
    } else {
      navigate(`/u/users/${userId}`);
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

  const handleError = () => {
    setImageError(true);
  };

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
        {(isUserPostOwner || !isUserPostOwner) && (
          <div className="more-options">
            <div className="dropdown-options">
              {isUserPostOwner ? (
                <button onClick={deletePost} className="delete-button">
                  Delete Post
                </button>
              ) : (
                <button onClick={openReportModal} className="report-button">
                  Report Post
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {communityName && (
        <span
          className="community-name-card"
          onClick={() => navigate(`/c/community/${communityName}`)}
          style={{ cursor: "pointer" }}
        >
          c/{communityName}
        </span>
      )}

      <div className="post-body">
        <div>
          <p className="post-content">{content}</p>
        </div>

        {imageUrl && imageUrl !== null && (
          <>
            <img
              src={imageUrl}
              alt="Post Image"
              className="post-image"
              onError={handleError}
              style={{ display: imageError ? "none" : "block" }}
            />
            {imageError && (
              <div className="no-image-message">Image cannot be displayed.</div>
            )}
          </>
        )}
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

        {/*Comments modal */}
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
                      {comment.userId === getUserIdFromToken() && (
                        <div className="more-options">
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="delete-comment-button"
                          >
                            Delete Comment
                          </button>
                        </div>
                      )}
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

        {/* Report Modal */}
        <Modal show={showReportModal} onHide={closeReportModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Report Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Please select a reason for reporting this post:</p>
            <div className="custom-dropdown">
              <button
                className="custom-dropdown-toggle"
                onClick={toggleDropdown}
              >
                {reason || "Select a reason"}
              </button>

              {isDropdownOpen && (
                <ul className="custom-dropdown-menu">
                  <li onClick={() => handleSelect("Spam")}>Spam</li>
                  <li onClick={() => handleSelect("Harassment")}>Harassment</li>
                  <li onClick={() => handleSelect("Inappropriate Content")}>
                    Inappropriate Content
                  </li>
                  <li onClick={() => handleSelect("Other")}>Other</li>
                </ul>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button className="cancel-button" onClick={closeReportModal}>
              Cancel
            </button>
            <button
              className="submit-button"
              onClick={handleReportSubmit}
              disabled={!reason}
            >
              Submit
            </button>
          </Modal.Footer>
        </Modal>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
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