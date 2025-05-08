import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import loadingGif from '../assets/377.gif';
import styles from '../styles/PopularHashtags.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const PopularHashtags = () => {
  const [loading, setLoading] = useState(true);
  const [hashtags, setHashtags] = useState([]);

  useEffect(() => {
    const fetchHashtags = async () => {
      try {
        const response = await axios.get(`${API_URL}hashtags/get`, {
          withCredentials: true,
          headers: {
            'X-App-Version': import.meta.env.VITE_APP_VERSION,
          },
        });
        setHashtags(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching hashtags:', error);
        setHashtags([]);
      } finally {
        setTimeout(() => setLoading(false), 900);
      }
    };

    fetchHashtags();
  }, []);

  const renderedHashtags = useMemo(() => {
    if (!Array.isArray(hashtags) || hashtags.length === 0) return null;

    return hashtags.map((hashtag) => (
      <div key={hashtag.name} className={styles.hashtagItem}>
        <a
          href={hashtag.link}
          className={styles.hashtagLink}
          target='_blank'
          rel='noopener noreferrer'
        >
          #{hashtag.name}
        </a>
        <span className={styles.separator}>—</span>
        <span className={styles.viewCount}>{hashtag.views} views</span>
      </div>
    ));
  }, [hashtags]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Popular Hashtags</h2>
      <div className={styles.card}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <img src={loadingGif} alt='Loading...' className={styles.spinner} />
          </div>
        ) : (
          <div className={styles.hashtagsContainer}>
            {renderedHashtags || (
              <div className={styles.emptyState}>
                <p>No trending hashtags available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularHashtags;