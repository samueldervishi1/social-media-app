import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Snackbar, Alert } from '@mui/material';
import styles from '../styles/home.module.css';

const Post = React.lazy(() => import('./Post'));
const PostList = React.lazy(() => import('./PostList'));
//const Menu = React.lazy(() => import('./Menu'));

const POST_REFRESH_INTERVAL = 300000;
const SUGGESTION_REFRESH_INTERVAL = 3600000;

const Home = () => {
  const { validateToken, logout } = useAuth();
  const [refreshPostList, setRefreshPostList] = useState(false);
  const [refreshSuggestions, setRefreshSuggestions] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const postIntervalId = setInterval(() => {
      if (!validateToken()) {
        logout();
        return;
      }
      setRefreshPostList((prev) => !prev);
    }, POST_REFRESH_INTERVAL);

    return () => clearInterval(postIntervalId);
  }, [validateToken, logout]);

  useEffect(() => {
    const suggestionIntervalId = setInterval(() => {
      if (!validateToken()) {
        logout();
        return;
      }
      setRefreshSuggestions((prev) => !prev);

      setSnackbarMessage('New suggestions are now available!');
      setSnackbarOpen(true);
    }, SUGGESTION_REFRESH_INTERVAL);

    return () => clearInterval(suggestionIntervalId);
  }, [validateToken, logout]);

  const handleUsernameClick = () => {
    setSnackbarMessage('Clicking your username shows info about your account.');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className={styles.home_container}>
      {/* <div className={styles.menu}>
        <Suspense fallback={<div>Loading Menu...</div>}>
          <Menu onUsernameClick={handleUsernameClick} />
        </Suspense>
      </div> */}
      <div className={styles.main_content}>
        <Suspense fallback={<div>Loading...</div>}>
          <Post refreshSuggestions={refreshSuggestions} />
          <PostList key={refreshPostList} />
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