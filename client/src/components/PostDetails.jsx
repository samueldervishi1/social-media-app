import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaArrowLeft,
  FaTwitter,
  FaFacebook,
  FaWhatsapp,
  FaLink,
} from 'react-icons/fa';
import userIcon from '../assets/user.webp';
import styles from '../styles/postDetails.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const PostDetails = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const location = useLocation();
  const initialState = location.state || {};

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [likesCount, setLikesCount] = useState(initialState.initialLikes || 0);
  const [isLiked, setIsLiked] = useState(
    initialState.isInitiallyLiked || false
  );
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [sortedComments, setSortedComments] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareMenuRef = useRef(null);

  const sortComments = (comments) => {
    if (!comments) return [];

    return [...comments].sort((a, b) => {
      const dateA = `${a.commentDate} ${a.commentTime}`;
      const dateB = `${b.commentDate} ${b.commentTime}`;
      return new Date(dateB) - new Date(dateA);
    });
  };

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}posts/${postId}`, {
          withCredentials: true,
        });
        setPost(response.data);
        setSortedComments(sortComments(response.data.commentList));
        if (!initialState.initialLikes) {
          setLikesCount(response.data.likedUserIds?.length || 0);
          setIsLiked(
            response.data.likedUserIds?.includes(initialState.userId) || false
          );
        }
      } catch (err) {
        setError('Failed to load post details');
        console.error('Error fetching post details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetails();
    }
  }, [postId, initialState.initialLikes, initialState.userId]);

  useEffect(() => {
    if (post?.commentList) {
      setSortedComments(sortComments(post.commentList));
    }
  }, [post?.commentList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (!post || !initialState.userId) return;

    setIsLikeAnimating(true);
    try {
      const response = await axios.post(
        `${API_URL}like/add`,
        {
          userId: initialState.userId,
          postId: post.id,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setIsLiked((prev) => !prev);
        setLikesCount((prev) => prev + (isLiked ? -1 : 1));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setTimeout(() => {
        setIsLikeAnimating(false);
      }, 450);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !initialState.userId || isSubmittingComment)
      return;

    setIsSubmittingComment(true);
    try {
      const response = await axios.post(
        `${API_URL}comments/create/${initialState.userId}/${postId}`,
        { content: newComment },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        const now = new Date();
        const newCommentObj = {
          userId: initialState.userId,
          content: newComment,
          id: response.data.id || Date.now().toString(),
          commentDate: now.toISOString().split('T')[0],
          commentTime: now.toTimeString().split(' ')[0],
        };

        const updatedComments = [...(post.commentList || []), newCommentObj];
        setPost((prev) => ({
          ...prev,
          commentList: updatedComments,
        }));
        setSortedComments(sortComments(updatedComments));
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const getShareUrl = () => {
    return `${window.location.origin}/post/${postId}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSocialShare = (platform) => {
    const url = getShareUrl();
    const text = `Check out this post: ${post?.content?.substring(0, 100)}${
      post?.content?.length > 100 ? '...' : ''
    }`;
    let shareUrl;

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(
          text + ' ' + url
        )}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  if (loading) {
    return <div className='text-center p-5'>Loading...</div>;
  }

  if (error) {
    return <div className='text-center p-5 text-danger'>{error}</div>;
  }

  if (!post) {
    return <div className='text-center p-5'>Post not found</div>;
  }

  return (
    <div className={styles.postDetailsContainer}>
      <button onClick={handleGoBack} className={styles.backButton}>
        <FaArrowLeft /> Back
      </button>
      <div className={styles.postCard}>
        <div className={styles.postHeader}>
          <div className={styles.userInfoContainer}>
            <img
              src={post.userProfilePic || userIcon}
              alt={initialState.username}
              className={styles.userAvatar}
            />
            <div className={styles.userInfo}>
              <h2 className={styles.username}>{initialState.username}</h2>
              <div className={styles.postTime}>
                {post.postDate} {post.postTime && post.postTime.split('.')[0]}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.postContent}>
          <p>{post.content}</p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt='Post content'
              className={styles.postImage}
            />
          )}
        </div>

        <div className={styles.interactionBar}>
          <button
            className={`${styles.interactionButton} ${styles.likeButton} 
              ${isLiked ? styles.liked : ''} 
              ${isLikeAnimating ? styles.likeAnimation : ''}`}
            onClick={handleLike}
          >
            {isLiked ? <FaHeart /> : <FaRegHeart />}
            <span>{likesCount} Likes</span>
          </button>
          <button className={styles.interactionButton}>
            <FaComment />
            <span>{sortedComments.length} Comments</span>
          </button>
          <div className={styles.shareContainer}>
            <button
              className={styles.interactionButton}
              onClick={handleShare}
              aria-label='Share post'
            >
              <FaShare />
              <span>Share</span>
            </button>
            {showShareMenu && (
              <div ref={shareMenuRef} className={styles.shareMenu}>
                <button
                  className={styles.shareOption}
                  onClick={() => handleSocialShare('twitter')}
                >
                  <FaTwitter />
                  Share on Twitter
                </button>
                <button
                  className={styles.shareOption}
                  onClick={() => handleSocialShare('facebook')}
                >
                  <FaFacebook />
                  Share on Facebook
                </button>
                <button
                  className={styles.shareOption}
                  onClick={() => handleSocialShare('whatsapp')}
                >
                  <FaWhatsapp />
                  Share on WhatsApp
                </button>
                <button className={styles.shareOption} onClick={handleCopyLink}>
                  <FaLink />
                  Copy Link
                </button>
                {copySuccess && (
                  <div className={styles.copySuccess}>
                    Link copied to clipboard!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.commentsSection}>
          <h3 className={styles.commentsHeader}>Comments</h3>

          <form onSubmit={handleSubmitComment} className={styles.commentForm}>
            <input
              type='text'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder='Write a comment...'
              className={styles.commentInput}
              disabled={isSubmittingComment}
            />
            <button
              type='submit'
              className={styles.commentSubmitButton}
              disabled={!newComment.trim() || isSubmittingComment}
            >
              {isSubmittingComment ? 'Posting...' : 'Post'}
            </button>
          </form>

          {sortedComments.length > 0 ? (
            <div className={styles.commentsList}>
              {sortedComments.map((comment) => (
                <div key={comment.id} className={styles.commentCard}>
                  <div className={styles.commentHeader}>
                    <img
                      src={userIcon}
                      alt='User'
                      className={styles.commentAvatar}
                    />
                    <div className={styles.commentInfo}>
                      <h4 className={styles.commentUsername}>
                        {comment.userId === initialState.userId
                          ? initialState.username
                          : 'User'}
                      </h4>
                      <span className={styles.commentTime}>
                        {comment.commentDate}{' '}
                        {comment.commentTime &&
                          comment.commentTime.split('.')[0]}
                      </span>
                    </div>
                  </div>
                  <p className={styles.commentContent}>{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noComments}>No comments yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
