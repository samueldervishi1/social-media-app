import React from 'react';
import styles from '../styles/postCard.module.css';
import userIcon from '../assets/user.webp';

const PostCard = ({
  id,
  content,
  commentsList,
  postDate,
  postTime,
  userId,
  imageUrl,
}) => {
  const formatDateTime = () => {
    const date = postDate || 'Unknown date';
    const time = postTime || 'Unknown time';
    return `${date} ${time}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <img src={userIcon} alt='User' className={styles.userIcon} />
          <div className={styles.userMetadata}>
            <span className={styles.userId}>{userId || 'Anonymous'}</span>
            <span className={styles.bullet}>•</span>
            <span className={styles.timestamp}>{formatDateTime()}</span>
          </div>
        </div>
        <div className={styles.postId} style={{ display: 'none' }}>
          Post #{id}
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
    </div>
  );
};

export default PostCard;