import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import userIcon from '../assets/user.webp';
import { getUsernameFromServer, getUserIdFromServer } from '../auth/authUtils';
import {
  FaTrashAlt,
  FaFlag,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaTwitter,
  FaFacebook,
  FaWhatsapp,
  FaLink,
  FaBookmark,
  FaRegBookmark,
} from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';
import { reportReasons } from '../constants/reportReasons';
import styles from '../styles/postCard.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const PostCard = ({
  id,
  content,
  commentsList,
  postDate,
  postTime,
  userId,
  username,
  imageUrl,
  onPostDeleted,
  onPostRefresh,
  isLiked: initialIsLiked = false,
  likesCount: initialLikesCount = 0,
  savedUserIds = [],
}) => {
  const [loggedInUsername, setLoggedInUsername] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const shareMenuRef = useRef(null);
  const navigate = useNavigate();

  const formatDateTime = () => {
    const date = postDate || 'Unknown date';
    const time = postTime || 'Unknown time';
    return `${date} ${time}`;
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.delete(`${API_URL}posts/delete/${id}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        if (onPostDeleted) {
          onPostDeleted(id);
        }
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = () => {
    setIsReportModalOpen(true);
  };

  const submitReport = async () => {
    if (!reportReason) {
      return;
    }

    try {
      setIsSubmitting(true);

      const finalReason =
        reportReason === 'Other' && customReason
          ? `Other: ${customReason}`
          : reportReason;

      const reportData = {
        id: null,
        userId,
        postId: id,
        reason: finalReason,
        reportTime: new Date().toISOString(),
      };

      const response = await axios.post(`${API_URL}report`, reportData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        setIsReportModalOpen(false);
        setReportReason('');
        setCustomReason('');

        if (onPostDeleted) {
          onPostDeleted(id);
        }

        if (onPostRefresh) {
          onPostRefresh();
        }
      }
    } catch (error) {
      console.error('Error reporting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setReportReason('');
    setCustomReason('');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [username, userId] = await Promise.all([
          getUsernameFromServer(),
          getUserIdFromServer(),
        ]);
        setLoggedInUsername(username);
        setLoggedInUserId(userId);

        if (userId) {
          setIsSaved(savedUserIds.includes(userId));
          const [likeStatus, likesCountResponse, commentsCountResponse] =
            await Promise.all([
              axios.get(`${API_URL}posts/${id}/liked/${userId}`, {
                withCredentials: true,
              }),
              axios.get(`${API_URL}like/count/${id}`, {
                withCredentials: true,
              }),
              axios.get(`${API_URL}posts/${id}/comments/count`, {
                withCredentials: true,
              }),
            ]);

          setIsLiked(likeStatus.data === 1);
          setLikesCount(likesCountResponse.data);
          setCommentCount(commentsCountResponse.data);
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    };

    fetchUserData();
  }, [id, savedUserIds]);

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
    try {
      if (!loggedInUserId) return;

      setIsLikeAnimating(true);
      setIsLiked((prev) => !prev);

      const response = await axios.post(
        `${API_URL}like/add`,
        {
          userId: loggedInUserId,
          postId: id,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const countResponse = await axios.get(`${API_URL}like/count/${id}`, {
          withCredentials: true,
        });
        setLikesCount(countResponse.data);
      } else {
        setIsLiked((prev) => !prev);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setIsLiked((prev) => !prev);
    } finally {
      setTimeout(() => {
        setIsLikeAnimating(false);
      }, 450);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (!showShareMenu) {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const dropdown = shareMenuRef.current;
      if (dropdown) {
        const left = buttonRect.left + (buttonRect.width - 220) / 2;
        dropdown.style.left = `${Math.max(
          16,
          Math.min(left, window.innerWidth - 236)
        )}px`;
        dropdown.style.top = `${buttonRect.bottom}px`;
      }
    }
    setShowShareMenu(!showShareMenu);
  };

  const getShareUrl = () => {
    return `${window.location.origin}/post/${id}`;
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
    const text = `Check out this post: ${content.substring(0, 100)}${
      content.length > 100 ? '...' : ''
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

  const handleSavePost = async () => {
    if (!loggedInUserId) return;

    try {
      setIsSubmitting(true);
      setIsSaved((prev) => !prev);

      const response = await axios.post(
        `${API_URL}posts/save/${loggedInUserId}/${id}`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) {
        setIsSaved((prev) => !prev);
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setIsSaved((prev) => !prev);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${id}`, {
      state: {
        initialLikes: likesCount,
        isInitiallyLiked: isLiked,
        userId: loggedInUserId,
        username: loggedInUsername,
        content: content,
        postDate: postDate,
        postTime: postTime,
        commentsList: commentsList,
        savedUserIds: savedUserIds,
        commentCount: commentCount,
      },
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <img src={userIcon} alt='User' className={styles.userIcon} />
          <div className={styles.userMetadata}>
            <span className={styles.userId}>{username || 'User Deleted'}</span>
            <span className={styles.bullet}>•</span>
            <span className={styles.timestamp}>{formatDateTime()}</span>
          </div>
        </div>
        <div className={styles.postId} style={{ display: 'none' }}>
          Post #{id}
        </div>
        <div className={styles.actionButton}>
          {username === loggedInUsername ? (
            <button
              onClick={handleDelete}
              className={styles.deleteButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.loadingSpinner}></span>
              ) : (
                <FaTrashAlt className={styles.deleteIcon} />
              )}
              Delete
            </button>
          ) : (
            <button
              onClick={handleReport}
              className={styles.reportButton}
              disabled={isSubmitting}
            >
              <FaFlag className={styles.reportIcon} />
              Report
            </button>
          )}
        </div>
      </div>

      <div
        className={styles.content}
        onClick={handlePostClick}
        style={{ cursor: 'pointer' }}
      >
        <p>{content}</p>
        {imageUrl && (
          <img src={imageUrl} alt='Post content' className={styles.postImage} />
        )}
      </div>

      <div className={styles.socialActions}>
        <button
          className={`${styles.actionIconButton} ${styles.likeButton} ${
            isLiked ? styles.liked : ''
          } ${isLikeAnimating ? styles.likeAnimation : ''}`}
          onClick={handleLike}
          aria-label={isLiked ? 'Unlike post' : 'Like post'}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{likesCount > 0 ? likesCount : ''}</span>
        </button>

        <a
          onClick={handlePostClick}
          className={styles.actionIconButton}
          aria-label='Comment on post'
        >
          <FaComment />
          <span>{commentCount > 0 ? commentCount : ''}</span>
        </a>

        <button
          className={`${styles.actionIconButton} ${
            isSaved ? styles.saved : ''
          }`}
          onClick={handleSavePost}
          disabled={isSubmitting}
          aria-label={isSaved ? 'Unsave post' : 'Save post'}
        >
          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
        </button>

        <div className={styles.shareDropdownContainer}>
          <button
            className={styles.actionIconButton}
            onClick={handleShare}
            aria-label='Share post'
          >
            <FaShare />
          </button>
          {showShareMenu && (
            <div ref={shareMenuRef} className={styles.shareDropdown}>
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

        <Modal show={isReportModalOpen} onHide={closeReportModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Report Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Please select a reason for reporting this post:</p>
            <Form>
              {reportReasons.map((reason) => (
                <Form.Check
                  key={reason}
                  type='radio'
                  id={`report-reason-${reason}`}
                  label={reason}
                  name='reportReason'
                  value={reason}
                  checked={reportReason === reason}
                  onChange={() => setReportReason(reason)}
                  className='mb-2'
                />
              ))}

              {reportReason === 'Other' && (
                <Form.Group className='mt-3'>
                  <Form.Label>Please specify your reason:</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={3}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder='Please provide details about your report...'
                  />
                </Form.Group>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant='secondary'
              onClick={closeReportModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant='primary'
              onClick={submitReport}
              disabled={
                !reportReason ||
                (reportReason === 'Other' && !customReason) ||
                isSubmitting
              }
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default PostCard;
