import React, { useState, useEffect } from 'react';
import loadingGif from '../assets/377.gif';
import styles from '../styles/PopularHashtags.module.css';

const PopularHashtags = ({ hashtags }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <img
          src={loadingGif}
          alt='Loading...'
          style={{ width: '30px', height: '30px' }}
        />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Popular Hashtags</h2>
      <div className={styles.hashtagsContainer}>
        {hashtags.map((hashtag, index) => (
          <div key={index} className={styles.hashtagItem}>
            <a
              href={hashtag.link}
              className={styles.hashtagLink}
              target='_blank'
              rel='noopener noreferrer'
            >
              {hashtag.name}
            </a>
            <span className={styles.separator}> — </span>
            <span className={styles.viewCount}>({hashtag.views} views)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularHashtags;