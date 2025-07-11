import { useState, useEffect, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import loadingGif from '../assets/377.gif';
import styles from '../styles/PopularHashtags.module.css';

const API_URL = import.meta.env.VITE_API_URL;
const LOADING_DELAY = 900;

const LoadingSpinner = memo(() => (
  <div className={styles.loadingContainer}>
    <img
      src={loadingGif}
      alt='Loading hashtags...'
      className={styles.spinner}
      width='50'
      height='50'
    />
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const HashtagItem = memo(({ name, link, views }) => (
  <div className={styles.hashtagItem}>
    <div className={styles.hashtagContent}>
      <a
        href={link}
        className={styles.hashtagLink}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={`View posts with hashtag ${name}`}
      >
        <span className={styles.hashSymbol}>#</span>{name}
      </a>
      <span className={styles.viewCount}>
        <i className={styles.viewIcon}></i>
        {views.toLocaleString()} views
      </span>
    </div>
    <div className={styles.trendIndicator}>
      <span className={styles.trendArrow}></span>
    </div>
  </div>
));

HashtagItem.displayName = 'HashtagItem';
HashtagItem.propTypes = {
  name: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  views: PropTypes.number.isRequired,
};

const EmptyState = memo(() => (
  <div className={styles.emptyState}>
    <div className={styles.emptyStateIcon}></div>
    <p>No trending hashtags available at the moment.</p>
    <span className={styles.emptyStateHint}>Check back later for updates</span>
  </div>
));

EmptyState.displayName = 'EmptyState';

const PopularHashtags = () => {
  const [loading, setLoading] = useState(true);
  const [hashtags, setHashtags] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();

    const fetchHashtags = async () => {
      try {
        const response = await axios.get(`${API_URL}hashtags`, {
          withCredentials: true,
          signal: controller.signal,
        });

        if (isSubscribed) {
          // Fix: Extract hashtags array from response object
          const hashtagsData = response.data?.hashtags || response.data;
          const hashtagsArray = Array.isArray(hashtagsData) ? hashtagsData : [];
          setHashtags(hashtagsArray);
          setError(null);
        }
      } catch (error) {
        // Check for CanceledError specifically
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          return; // Don't log or set error state for canceled requests
        }

        if (isSubscribed) {
          setHashtags([]);
          setError('Failed to load trending hashtags');
        }
      } finally {
        if (isSubscribed) {
          setTimeout(() => setLoading(false), LOADING_DELAY);
        }
      }
    };

    fetchHashtags();

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, []);

  const renderedHashtags = useMemo(() => {
    if (!Array.isArray(hashtags) || hashtags.length === 0) {
      return null;
    }
    
    return hashtags.map((hashtag) => {
      return (
        <HashtagItem
          key={hashtag.name}
          name={hashtag.name}
          link={hashtag.link}
          views={hashtag.views}
        />
      );
    });
  }, [hashtags]);

  return (
    <div
      className={styles.container}
      role='complementary'
      aria-label='Popular hashtags'
    >
      <h2 className={styles.title}>
        <span className={styles.titleText}>Trending Hashtags</span>
      </h2>
      <div className={styles.card}>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className={styles.errorState} role='alert'>
            <div className={styles.errorIcon}></div>
            <p>{error}</p>
          </div>
        ) : (
          <div className={styles.hashtagsContainer}>
            {renderedHashtags || <EmptyState />}
          </div>
        )}
      </div>
    </div>
  );
};

PopularHashtags.displayName = 'PopularHashtags';

export default memo(PopularHashtags);