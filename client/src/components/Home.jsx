import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Snackbar, Alert } from '@mui/material';
import styles from '../styles/home.module.css';

import Post from './Post';
const PostList = React.lazy(() => import('./PostList'));
const PopularHashtags = React.lazy(() => import('./PopularHashtags'));

const POST_REFRESH_INTERVAL = 300000;

const Home = () => {
  const { logout } = useAuth();

  const [refreshPostList, setRefreshPostList] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const postIntervalId = setInterval(() => {
      setRefreshPostList((prev) => !prev);
    }, POST_REFRESH_INTERVAL);

    return () => clearInterval(postIntervalId);
  }, [logout]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handlePostRefresh = () => {
    setRefreshPostList((prev) => !prev);
  };

  return (
    <div className={styles.home_container}>
      <div className={styles.main_content}>
        <Post onPostCreated={handlePostRefresh} />
        <Suspense
          fallback={<div style={{ textAlign: 'center' }}>Loading...</div>}
        >
          <PostList key={refreshPostList} />
        </Suspense>
      </div>
      <div className={styles.health_check}>
        <Suspense
          fallback={<div style={{ textAlign: 'center' }}>Loading...</div>}
        >
          <PopularHashtags />
        </Suspense>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity='info'
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;