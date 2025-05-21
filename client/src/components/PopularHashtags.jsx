import { useState, useEffect, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import loadingGif from '../assets/377.gif';
import styles from '../styles/PopularHashtags.module.css';

const API_URL = import.meta.env.VITE_API_URL;
const LOADING_DELAY = 900; // Delay in milliseconds before showing content

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
    <a
      href={link}
      className={styles.hashtagLink}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={`View posts with hashtag ${name}`}
    >
      #{name}
    </a>
    <span className={styles.separator} aria-hidden='true'>
      —
    </span>
    <span className={styles.viewCount}>{views.toLocaleString()} views</span>
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
    <p>No trending hashtags available at the moment.</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

const PopularHashtags = () => {
  const [loading, setLoading] = useState(true);
  const [hashtags, setHashtags] = useState([]);
  const [error, setError] = useState(null);

  // Fetch hashtags on component mount
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
          setHashtags(Array.isArray(response.data) ? response.data : []);
          setError(null);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;

        console.error('Error fetching hashtags:', error);
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

  // Memoize rendered hashtags to prevent unnecessary re-renders
  const renderedHashtags = useMemo(() => {
    if (!Array.isArray(hashtags) || hashtags.length === 0) return null;

    return hashtags.map((hashtag) => (
      <HashtagItem
        key={hashtag.name}
        name={hashtag.name}
        link={hashtag.link}
        views={hashtag.views}
      />
    ));
  }, [hashtags]);

  return (
    <div
      className={styles.container}
      role='complementary'
      aria-label='Popular hashtags'
    >
      <h2 className={styles.title}>Popular Hashtags</h2>
      <div className={styles.card}>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className={styles.errorState} role='alert'>
            {error}
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