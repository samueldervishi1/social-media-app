import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { AiOutlineComment, AiOutlineShareAlt } from "react-icons/ai";
import { IoSend } from "react-icons/io5";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import Modal from "react-bootstrap/Modal";
import defaultUserIcon from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/user.webp";
import redditIcon from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/reddit.png";
import whatsapp from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/whatsapp.png";
import xIcon from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/twitter.jpg";
import facebookIcon from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/faceboook.png";
import "../styles/post-card.css";

const PostCard = ({
  id,
  title,
  content,
  postDate,
  postTime,
  userId,
  imageUrl,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [usernames, setUsernames] = useState({});

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
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
      const response = await axios.get(
        `http://localhost:5000/api/v1/users/${userId}`
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
        const response = await axios.get(
          `http://localhost:5000/api/v1/users/${userId}`
        );
        if (response.status === 200) {
          console.log(username);
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
        const response = await axios.get(
          `http://localhost:5000/api/v1/likes/${userIdFromToken}`
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
        const response = await axios.get(
          `http://localhost:5000/api/v1/save/posts/${id}/saved-count`
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
        const likeResponse = await axios.get(
          `http://localhost:5000/api/v1/likes/post/${id}`
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

  const fetchPostDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/posts/${id}`
      );
      if (response.status === 200) {
        const { commentsList } = response.data;
        if (commentsList) {
          // Sort comments by date and time to ensure the newest ones are on top
          const sortedComments = commentsList.sort((a, b) => {
            const dateA = new Date(`${a.commentDate}T${a.commentTime}`);
            const dateB = new Date(`${b.commentDate}T${b.commentTime}`);
            return dateB - dateA; // Newest first
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
    const fetchSavedPosts = async () => {
      const userIdFromToken = getUserIdFromToken();
      if (!userIdFromToken) {
        console.error("User not authenticated or token invalid.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/save/posts/${userIdFromToken}`
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
    setCopied(false);
  }, [shareUrl]);

  const toggleComments = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
    if (!expanded && !showNewCommentForm) {
      setShowNewCommentForm(true);
    }
  };

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

  const navigateToPost = () => {
    navigate(`/posts/${id}`);
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
      const response = await axios.post(
        `http://localhost:5000/api/v1/posts/comments/create/${commenterId}/${id}`,
        { content: newComment }
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
        await axios.post(
          `http://localhost:5000/api/v1/likes/post/${userIdFromToken}/${id}`
        );
        setLiked(true);
      }
      const likeResponse = await axios.get(
        `http://localhost:5000/api/v1/likes/post/${id}`
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
        await axios.post(
          `http://localhost:5000/api/v1/save/posts/${userIdFromToken}`,
          [id]
        );
        setSaved(true);
        window.alert("Post saved successfully!");
      } else {
        await axios.delete(
          `http://localhost:5000/api/v1/save/posts/${userIdFromToken}/${id}`
        );
        setSaved(false);
        window.alert("Post unsaved successfully!");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error toggling save:", error.message);
      window.alert("An error occurred. Please try again.");
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleShowShareModal = () => setShowShareModal(true);
  const handleCloseShareModal = () => setShowShareModal(false);

  const handleShareToPlatform = (platform) => {
    const postUrl = `http://localhost:5173/posts/${id}`;
    const encodedUrl = encodeURIComponent(postUrl);
    const shareText = encodeURIComponent("Check out this post!");

    switch (platform) {
      case "twitter":
        setShareUrl(`https://twitter.com/intent/tweet?url=${encodedUrl}`);
        break;
      case "reddit":
        setShareUrl(
          `https://www.reddit.com/submit?url=${encodedUrl}&title=${shareText}`
        );
        break;
      case "facebook":
        setShareUrl(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        );
        break;
      case "whatsapp":
        setShareUrl(`https://wa.me/?text=${shareText}%20${encodedUrl}`);
        break;
      default:
        console.error("Unsupported platform:", platform);
        return;
    }
    setShowShareModal(true);
    setSelectedPlatform(platform);
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error("Error copying URL to clipboard:", error);
      });
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

  const formatTime = (postTime) => {
    if (!postTime) {
      return "N/A";
    }

    const [timeString] = postTime.split(".");
    const [hours, minutes] = timeString.split(":");

    return `${hours}:${minutes}`;
  };

  const isValidDate = (date) => {
    return !isNaN(Date.parse(date));
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
        <div className="post-header-text" onClick={navigateToPost}>
          <div className="post-header-text" onClick={navigateToPost}>
            <h2>{username || "Unknown User"}</h2>
            <p style={{ position: "absolute", marginTop: 15, fontSize: 10 }}>
              @{username ? user.username : "Error"}
            </p>
          </div>
        </div>
      </div>
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
            <span className="saved-count">{savedCount}</span>
          </div>
          <AiOutlineShareAlt className="icon" onClick={handleShowShareModal} />
          <div className="post-date">
            {formatDate(postDate)} &bull; {formatTime(postTime)}
          </div>
        </div>
        {expanded && (
          <div className="post-comments">
            <h3 className="comment-title">Comments </h3>
            <ul className="comment-list">
              {commentsList.map((comment) => (
                <li key={comment.id} className="comment-item1">
                  <img
                    src={
                      user
                        ? user.profileImage || defaultUserIcon
                        : defaultUserIcon
                    }
                    alt="User Icon"
                    className="user-icon1"
                  />
                  <strong className="user-id">
                    @{usernames[comment.userId] || comment.userId}
                  </strong>
                  <p className="user-comment">{comment.content}</p>
                  <small className="small-timer">
                    {isValidDate(comment.commentDate)
                      ? `${formatDate(comment.commentDate)} at ${formatTime(
                          comment.commentTime
                        )}`
                      : "N/A"}
                  </small>
                </li>
              ))}
            </ul>
            {showNewCommentForm && (
              <div className="new-comment-form">
                <textarea
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Write your comment..."
                />
                <button
                  className="post-comment-button"
                  onClick={navigateToAddComment}
                >
                  <IoSend />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Modal show={showShareModal} onHide={handleCloseShareModal}>
        <Modal.Header closeButton>
          <Modal.Title>Share Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="share-icons">
            <button
              className="share-icon"
              onClick={() => handleShareToPlatform("whatsapp")}
            >
              <img className="youtube-icon" src={whatsapp} alt="Whatsapp" />
            </button>
            <button
              className="share-icon"
              onClick={() => handleShareToPlatform("reddit")}
            >
              <img className="reddit-icon" src={redditIcon} alt="Reddit" />
            </button>
            <button
              className="share-icon"
              onClick={() => handleShareToPlatform("twitter")}
            >
              <img className="x-icon" src={xIcon} alt="twitter" />
            </button>
            <button
              className="share-icon"
              onClick={() => handleShareToPlatform("facebook")}
            >
              <img
                className="facebook-icon"
                src={facebookIcon}
                alt="Facebook"
              />
            </button>
          </div>
          {shareUrl && (
            <div className="share-url-container">
              <input
                type="text"
                className="share-url-input"
                value={shareUrl}
                readOnly
              />
              <button className="copy-url-button" onClick={copyUrlToClipboard}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

PostCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  postDate: PropTypes.string.isRequired,
  postTime: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
};

export default PostCard;
