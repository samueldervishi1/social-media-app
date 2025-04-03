import React, { useEffect, useState } from 'react';
import axios from 'axios';
import userIcon from '../assets/user.webp';
import { getUsernameFromServer } from '../auth/authUtils';
import { FaTrashAlt, FaFlag } from 'react-icons/fa';
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
}) => {
  const [loggedInUsername, setLoggedInUsername] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDateTime = () => {
    const date = postDate || 'Unknown date';
    const time = postTime || 'Unknown time';
    return `${date} ${time}`;
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.delete(`${API_URL}posts/erase/${id}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'X-App-Version': import.meta.env.VITE_APP_VERSION,
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
          'X-App-Version': import.meta.env.VITE_APP_VERSION,
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
    const fetchUsername = async () => {
      const result = await getUsernameFromServer();
      setLoggedInUsername(result);
    };

    fetchUsername();
  }, []);

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

      <div className={styles.content}>{content}</div>

      {imageUrl && (
        <div className={styles.imageContainer}>
          <img src={imageUrl} alt='Post image' className={styles.image} />
        </div>
      )}

      <div className={styles.commentsSection}>
        <h4 className={styles.commentsHeader}>
          Comments ({commentsList ? commentsList.length : 0})
        </h4>
        {commentsList && commentsList.length > 0 ? (
          <ul className={styles.commentsList}>
            {commentsList.map((comment, index) => (
              <li key={index} className={styles.commentItem}>
                <span className={styles.commentUser}>
                  @{comment.userId || 'user'}:{' '}
                </span>
                {comment.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noComments}>No comments yet</p>
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
  );
};

export default PostCard;