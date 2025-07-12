import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { openDB } from 'idb';
import { getUsernameFromServer } from '../auth/authUtils';
import { MdDelete } from 'react-icons/md';
import { LuSendHorizontal } from 'react-icons/lu';
// import { Snackbar, Alert, CircularProgress } from '@mui/material';
import styles from '../styles/post.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const PostForm = ({ onPostCreated }) => {
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState('');
  const [loadingUsername, setLoadingUsername] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSnackbarClose = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const dbPromise = useMemo(
    () =>
      openDB('socialAppDB', 1, {
        upgrade(db) {
          db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
        },
      }),
    []
  );

  const savePostOffline = useCallback(
    async (content) => {
      const db = await dbPromise;
      const post = {
        content,
        postDate: new Date().toISOString().split('T')[0],
        postTime: new Date().toISOString().split('T')[1],
      };
      await db.put('posts', post);
    },
    [dbPromise]
  );

  const handlePostSubmit = useCallback(
    async (content, isOffline = false) => {
      if (
        isSubmitting ||
        loadingUsername ||
        !username ||
        (isOffline && !content)
      )
        return;
      setIsSubmitting(true);

      try {
        const response = await axios.post(
          `${API_URL}posts/users/${username}`,
          { content },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200) {
          showSnackbar('Post created successfully!');
          setPostContent('');
          onPostCreated?.();
        }
      } catch (error) {
        if (!navigator.onLine) {
          await savePostOffline(content);
          showSnackbar(
            'Post saved offline. It will be sent when you are online.',
            'warning'
          );
        } else {
          console.error('Error creating post:', error);
          showSnackbar('Error creating post. Please try again.', 'error');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      loadingUsername,
      username,
      showSnackbar,
      savePostOffline,
      onPostCreated,
    ]
  );

  const sendOfflinePosts = useCallback(async () => {
    const db = await dbPromise;
    const posts = await db.getAll('posts');
    if (posts.length > 0) {
      for (const post of posts) {
        await handlePostSubmit(post.content, true);
        await db.delete('posts', post.id);
      }
    }
  }, [dbPromise, handlePostSubmit]);

  useEffect(() => {
    window.addEventListener('online', sendOfflinePosts);
    return () => window.removeEventListener('online', sendOfflinePosts);
  }, [sendOfflinePosts]);

  useEffect(() => {
    const fetchUsername = async () => {
      const result = await getUsernameFromServer();
      setUsername(result);
      setLoadingUsername(false);
    };

    fetchUsername();
  }, []);

  const placeholderText = useMemo(() => {
    return loadingUsername
      ? "What's on your mind today..."
      : `What's on your mind today, ${username}?`;
  }, [loadingUsername, username]);

  const handleClearInput = () => {
    setPostContent('');
  };

  return (
    <form
      className={styles.post_form}
      onSubmit={(e) => {
        e.preventDefault();
        handlePostSubmit(postContent);
      }}
    >
      <div className={styles.input_with_icons}>
        <textarea
          placeholder={placeholderText}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          rows={1}
          required
          className={styles.textarea}
          style={{ resize: 'none', overflow: 'hidden' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
        />
        {loadingUsername && (
          <span className={styles.animatedDots} aria-label='loading username'>
            ...
          </span>
        )}
        <div className={styles.icons_container}>
          <MdDelete
            className={styles.icon}
            onClick={handleClearInput}
            title='Clear input'
          />
          <button
            type='submit'
            className={styles.post_the_post}
            disabled={isSubmitting || loadingUsername || !username}
            title='Share your post'
          >
            {isSubmitting ? (
              //  <CircularProgress size={18} color='inherit' />
              <div className={styles.loading_dots}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            ) : (
              <LuSendHorizontal />
            )}
          </button>
        </div>
      </div>
      {/* <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar> */}
    </form>
  );
};

export default PostForm;
