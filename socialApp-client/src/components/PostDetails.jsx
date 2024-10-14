import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { AiOutlineComment, AiOutlineShareAlt } from "react-icons/ai";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import ChatHistory from "./ChatHistory";
import Modal from "react-bootstrap/Modal";
import News from "./News";
import loaderImage from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import defaultUserIcon from "/home/samuel/Documents/social-media-app/socialApp-client/src/user.webp";
import redditIcon from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/reddit.png";
import whatsapp from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/whatsapp.png";
import xIcon from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/new-twitter-x-logo-twitter-icon-x-social-media-icon-free-png.webp";
import facebookIcon from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/faceboook.png";
import "../styles/post-details.css";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentsList, setCommentsList] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [commentsWithUsernames, setCommentsWithUsernames] = useState([]);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/users/${userId}`
      );
      if (response.status === 200) {
        return response.data.username;
      } else {
        console.error("Failed to fetch user details");
        return userId;
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      return userId;
    }
  };

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setIsLoading(true);

        const postResponse = await axios.get(
          `http://localhost:5000/api/v1/posts/${postId}`
        );

        if (postResponse.status === 200) {
          const postData = postResponse.data;
          setPost(postData);

          const username = await fetchUserDetails(postData.userId);
          setUser({ ...postData.user, username });

          const commentsWithUsernames = await Promise.all(
            postData.commentsList.map(async (comment) => {
              const username = await fetchUserDetails(comment.userId);
              return {
                ...comment,
                username: username || "Unknown User",
              };
            })
          );
          setCommentsWithUsernames(
            commentsWithUsernames.sort(
              (a, b) => new Date(b.commentDate) - new Date(a.commentDate)
            )
          );
          setCommentCount(commentsWithUsernames.length);
        } else {
          setError("Failed to fetch post details");
        }

        const likeResponse = await axios.get(
          `http://localhost:5000/api/v1/likes/post/${postId}`
        );
        if (likeResponse.status === 200) {
          setLikeCount(likeResponse.data);
        } else {
          console.error("Failed to fetch like count");
        }

        const userIdFromToken = getUserIdFromToken();
        if (userIdFromToken) {
          const likedPostsResponse = await axios.get(
            `http://localhost:5000/api/v1/likes/${userIdFromToken}`
          );
          if (likedPostsResponse.status === 200) {
            const likedPosts = likedPostsResponse.data[0]?.postId || [];
            if (likedPosts.includes(postId)) {
              setLiked(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching post details:", error.message);
        setError(
          "Something went wrong. Please check your internet connection or try again later."
        );
      } finally {
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    };

    fetchPostDetails();
  }, [apiUrl, postId]);

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

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/posts/comments/create/${commenterId}/${postId}`,
        {
          content: newComment,
        }
      );
      if (response.status === 200) {
        const {
          id: commentId,
          userId: commenterId,
          content: commentContent,
          commentDate,
        } = response.data;
        const newCommentObj = {
          id: commentId,
          userId: commenterId,
          content: commentContent,
          commentDate,
        };

        setCommentsList([newCommentObj, ...commentsList]);
        setCommentCount(commentCount + 1);
        setNewComment("");
        setShowNewCommentForm(false);
      }
    } catch (error) {
      console.error("Error posting comment:", error.message);
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
          [postId]
        );
        setSaved(true);
      } else {
        await axios.delete(
          `http://localhost:5000/api/v1/save/posts/${userIdFromToken}/${postId}`
        );
        setSaved(false);
      }
    } catch (error) {
      console.error("Error toggling save:", error.message);
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
        `http://localhost:5000/api/v1/likes/post/${postId}`
      );
      if (likeResponse.status === 200) {
        setLikeCount(likeResponse.data);
      }
    } catch (error) {
      console.error("Error toggling like:", error.message);
    }
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

  useEffect(() => {
    const fetchSavedCount = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/save/posts/${postId}/saved-count`
        );
        if (response.status === 200) {
          setSavedCount(response.data);
          console.log(response.data);
        } else {
          console.error("Failed to fetch saved count");
        }
      } catch (error) {
        console.error("Error fetching saved count:", error.message);
      }
    };

    fetchSavedCount();
  }, [postId]);

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
          if (savedPostIds.includes(postId)) {
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
  }, [postId]);

  const toggleNewCommentForm = (e) => {
    e.stopPropagation();
    setShowNewCommentForm(!showNewCommentForm);
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleShowShareModal = () => setShowShareModal(true);
  const handleCloseShareModal = () => setShowShareModal(false);

  const handleShareToPlatform = (platform) => {
    const postUrl = `http://localhost:5173/posts/${postId}`;
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
  const isValidDate = (date) => {
    return !isNaN(Date.parse(date));
  };

  const formatDate = (postDate) => {
    const date = new Date(postDate);
    return format(date, "MMM dd, yyyy");
  };

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div>
      <ChatHistory />
      {isLoading ? (
        <div className="loading-container">
          <img src={loaderImage} alt="Loading..." className="loading-spinner" />
        </div>
      ) : (
        post && (
          <div className="p-card">
            {error && <div className="error-message">{error}</div>}
            <div className="p-header">
              <div>
                <img
                  src={
                    user
                      ? user.profileImage || defaultUserIcon
                      : defaultUserIcon
                  }
                  alt="User Icon"
                  className="user-icon"
                />
              </div>
              <div className="post-header-text">
                <h2>{user ? user.username : "Error"}</h2>
                <p
                  style={{ position: "absolute", marginTop: 15, fontSize: 10 }}
                >
                  @{user ? user.username : "Error"}
                </p>
              </div>
            </div>
            <div>
              <p style={{ display: "flex", marginLeft: 10 }}>{post.content}</p>
              <div
                style={{
                  fontSize: 10,
                  color: "lightgrey",
                  fontWeight: 500,
                  marginTop: -15,
                  marginLeft: 10,
                }}
              >
                {formatDate(post.postDate)}
              </div>
            </div>
            <div className="post-footer">
              <div className="footer-icons">
                <div className="icon-wrapper">
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

                <AiOutlineShareAlt
                  className="icon"
                  onClick={handleShowShareModal}
                />
              </div>
              {expanded && (
                <div className="post-comments">
                  <h3 className="comment-title">Comments: </h3>
                  <ul className="comment-list">
                    {commentsWithUsernames.map((comment) => (
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
                        <strong className="user-username">
                          @{comment.username}
                        </strong>
                        <p className="user-comment1">{comment.content}</p>
                        <small className="small-timer">
                          {isValidDate(comment.commentDate)
                            ? formatDate(comment.commentDate)
                            : "N/A"}
                        </small>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
                    <img
                      className="youtube-icon"
                      src={whatsapp}
                      alt="Whatsapp"
                    />
                  </button>
                  <button
                    className="share-icon"
                    onClick={() => handleShareToPlatform("reddit")}
                  >
                    <img
                      className="reddit-icon"
                      src={redditIcon}
                      alt="Reddit"
                    />
                  </button>
                  <button
                    className="share-icon"
                    onClick={() => handleShareToPlatform("twitter")}
                  >
                    <img className="x-icon" src={xIcon} alt="X" />
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
                    <button
                      className="copy-url-button"
                      onClick={copyUrlToClipboard}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )}
              </Modal.Body>
            </Modal>
          </div>
        )
      )}
    </div>
  );
};

export default PostDetail;
