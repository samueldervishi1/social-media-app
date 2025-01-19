import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Snackbar, Alert } from '@mui/material';
import styles from '../styles/home.module.css';

const Post = React.lazy(() => import('./Post'));
const PostList = React.lazy(() => import('./PostList'));

const POST_REFRESH_INTERVAL = 300000;
const SUGGESTION_REFRESH_INTERVAL = 1800000;

const suggestions = [
  'Click on your username to view your profile.',
  'Try exploring different events on Events page',
  'Check out the AI feature for personalized recommendations.',
  'Explore trending topics to stay updated.',
  'Join discussions in the community for more insights.',
];

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
      const randomSuggestion =
        suggestions[Math.floor(Math.random() * suggestions.length)];
      setSnackbarMessage(randomSuggestion);
      setSnackbarOpen(true);
      setRefreshSuggestions((prev) => !prev);
    }, SUGGESTION_REFRESH_INTERVAL);

    return () => clearInterval(suggestionIntervalId);
  }, [validateToken, logout]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className={styles.home_container}>
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