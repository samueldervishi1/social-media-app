import React, { useEffect, useState, useCallback, memo } from 'react';
import { Snackbar, Alert } from '@mui/material';
import styles from '../styles/home.module.css';

import CreatePost from './CreatePost';

const PostList = React.lazy(() => import('./PostList'));
const PopularHashtags = React.lazy(() => import('./PopularHashtags'));

const POST_REFRESH_INTERVAL = 300000;
const SNACKBAR_DURATION = 6000;

const LoadingFallback = () => (
  <div className={styles.loading_container}>Loading...</div>
);

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

  useEffect(() => {
    const postIntervalId = setInterval(
      handlePostRefresh,
      POST_REFRESH_INTERVAL
    );

    return () => clearInterval(postIntervalId);
  }, []);

  return (
    <div className={styles.home_container}>
      <div className={styles.main_content}>
        <CreatePost onPostCreated={handlePostRefresh} />
        <React.Suspense fallback={<LoadingFallback />}>
          <PostList key={refreshTrigger} onPostRefresh={handlePostRefresh} />
        </React.Suspense>
      </div>

      <div className={styles.health_check}>
        <React.Suspense fallback={<LoadingFallback />}>
          <PopularHashtags />
        </React.Suspense>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={SNACKBAR_DURATION}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity='info'
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default memo(Home);