/**
 * @fileoverview Home component that serves as the main landing page of the application
 * Displays the post creation form, post list, and popular hashtags
 */

import React, { useEffect, useState, useCallback, memo, Suspense } from 'react';
import { Snackbar, Alert } from '@mui/material';
import styles from '../styles/home.module.css';
import CreatePost from './CreatePost';

// Lazy loaded components for better initial page load
const PostList = React.lazy(() => import('./PostList'));
const PopularHashtags = React.lazy(() => import('./PopularHashtags'));

// Constants
const POST_REFRESH_INTERVAL = 300000; // 5 minutes in milliseconds
const SNACKBAR_DURATION = 6000; // 6 seconds

/**
 * @typedef {Object} SnackbarState
 * @property {boolean} open - Whether the snackbar is visible
 * @property {string} message - Message to display in the snackbar
 */

/**
 * Loading fallback component for Suspense
 * @component
 * @returns {JSX.Element} Loading indicator
 */
const LoadingFallback = memo(() => (
  <div className={styles.loading_container}>Loading...</div>
));

/**
 * Snackbar component for displaying notifications
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the snackbar is visible
 * @param {string} props.message - Message to display
 * @param {Function} props.onClose - Handler for closing the snackbar
 */
const NotificationSnackbar = memo(({ open, message, onClose }) => (
  <Snackbar
    open={open}
    autoHideDuration={SNACKBAR_DURATION}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Alert onClose={onClose} severity='info' sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
));

/**
 * Home component that renders the main page of the application
 * Features include post creation, post list viewing, and popular hashtags
 * @component
 * @returns {JSX.Element} Home page component
 */
const Home = () => {
  // State for managing post list refresh and notifications
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
  });

  /**
   * Handles closing the notification snackbar
   * @function
   */
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  /**
   * Triggers a refresh of the post list
   * @function
   */
  const handlePostRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  /**
   * Shows a notification message
   * @function
   * @param {string} message - The message to display
   */
  const showNotification = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
    });
  }, []);

  // Set up automatic post refresh interval
  useEffect(() => {
    const postIntervalId = setInterval(
      handlePostRefresh,
      POST_REFRESH_INTERVAL
    );

    // Cleanup interval on component unmount
    return () => clearInterval(postIntervalId);
  }, [handlePostRefresh]);

  return (
    <div className={styles.home_container}>
      <div className={styles.main_content}>
        <CreatePost
          onPostCreated={handlePostRefresh}
          onNotification={showNotification}
        />
        <Suspense fallback={<LoadingFallback />}>
          <PostList
            key={refreshTrigger}
            onPostRefresh={handlePostRefresh}
            onNotification={showNotification}
          />
        </Suspense>
      </div>

      <div className={styles.health_check}>
        <Suspense fallback={<LoadingFallback />}>
          <PopularHashtags />
        </Suspense>
      </div>

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
};

// Prevent unnecessary re-renders of the entire Home component
export default memo(Home);