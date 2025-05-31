import React, { useEffect, useState, useCallback, memo, Suspense } from 'react';
import { Snackbar, Alert } from '@mui/material';
import styles from '../styles/home.module.css';
import CreatePost from './CreatePost';
import Stories from './Stories';

const PostList = React.lazy(() => import('./PostList'));
const PopularHashtags = React.lazy(() => import('./PopularHashtags'));
const AnimatedCard = React.lazy(() => import('./AnimatedCard'));

const POST_REFRESH_INTERVAL = 300000;
const SNACKBAR_DURATION = 6000;


const LoadingFallback = memo(() => (
  <div className={styles.loading_container}>Loading...</div>
));
LoadingFallback.displayName = 'LoadingFallback';

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
NotificationSnackbar.displayName = 'NotificationSnackbar';


const Home = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
  });

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const handlePostRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const showNotification = useCallback((message) => {
    setSnackbar({
      open: true,
      message,
    });
  }, []);

  useEffect(() => {
    const postIntervalId = setInterval(
      handlePostRefresh,
      POST_REFRESH_INTERVAL
    );

    return () => clearInterval(postIntervalId);
  }, [handlePostRefresh]);

  return (
    <div className={styles.home_container}>
      <div className={styles.main_content}>
        <Suspense fallback={<LoadingFallback />}>
          <Stories />
        </Suspense>
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
          <AnimatedCard />
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

export default memo(Home);