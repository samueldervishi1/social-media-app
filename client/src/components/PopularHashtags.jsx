import React, { useState, useEffect } from 'react';
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
        setHashtags(response.data);

        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error fetching hashtags:', error);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchHashtags();
  }, []);

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
            {hashtags.length > 0 ? (
              hashtags.map((hashtag, index) => (
                <div key={index} className={styles.hashtagItem}>
                  <a
                    href={hashtag.link}
                    className={styles.hashtagLink}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    #{hashtag.name}
                  </a>
                  <span className={styles.separator}>—</span>
                  <span className={styles.viewCount}>
                    {hashtag.views} views
                  </span>
                </div>
              ))
            ) : (
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