import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { CiLocationArrow1 } from 'react-icons/ci';
import { MdOutlineEmojiEmotions, MdDelete } from 'react-icons/md';
import Picker from 'emoji-picker-react';
import { LuSendHorizontal } from 'react-icons/lu';
import { Snackbar, Alert } from '@mui/material';
import { openDB } from 'idb';
import styles from '../styles/post.module.css';

import { getUsernameFromToken } from '../auth/authUtils';
const API_URL = import.meta.env.VITE_API_URL;

const PostForm = () => {
  const [postContent, setPostContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      if (isSubmitting || (isOffline && !content)) return;
      setIsSubmitting(true);

      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('Token not found. Please log in again.', 'error');
        setIsSubmitting(false);
        return;
      }

      const username = getUsernameFromToken(token);

      try {
        const response = await axios.post(
          `${API_URL}/api/v2/posts/create/${username}`,
          { content },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          showSnackbar('Post created successfully!');
          setPostContent('');
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (error) {
        if (!navigator.onLine) {
          await savePostOffline(content);
          showSnackbar(
            'Post saved offline. It will be sent when you are online.',
            'warning'
          );
        } else {
          showSnackbar('Error creating post. Please try again.', 'error');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, showSnackbar, savePostOffline]
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

  const handleLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      showSnackbar('Geolocation is not supported by your browser.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await axios.get(
            'https://nominatim.openstreetmap.org/reverse',
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
              },
              headers: {
                'Accept-Language': 'en',
              },
            }
          );

          const address = response.data.address;
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            'Unknown City';
          const country = address.country || 'Unknown Country';

          setPostContent((prev) => `${prev} 📍 Location: ${city}, ${country}`);
        } catch (error) {
          showSnackbar('Error fetching location details.', 'error');
          setPostContent(
            (prev) =>
              `${prev} 📍 Location: (${latitude.toFixed(
                4
              )}, ${longitude.toFixed(4)})`
          );
        }
      },
      () => showSnackbar('Unable to retrieve your location.', 'error')
    );
  }, [showSnackbar]);

  const placeholderText = useMemo(
    () => `What's on your mind today, ${getUsernameFromToken()}?`,
    []
  );

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
        />
        <div className={styles.icons_container}>
          <MdDelete
            className={styles.icon}
            onClick={handleClearInput}
            title='Clear input'
          />
          <MdOutlineEmojiEmotions
            className={styles.icon}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            title='Pick an emoji you like'
          />
          <CiLocationArrow1
            className={styles.icon}
            onClick={handleLocation}
            title='Share your location'
          />
          <button
            type='submit'
            className={styles.post_the_post}
            disabled={isSubmitting}
            title='Share your post'
          >
            <LuSendHorizontal />
          </button>
        </div>
      </div>
      {showEmojiPicker && (
        <div className={styles.emoji_picker}>
          <Picker
            onEmojiClick={(emojiData) => {
              if (emojiData?.emoji) {
                setPostContent((prev) => prev + emojiData.emoji);
                setShowEmojiPicker(false);
              }
            }}
          />
        </div>
      )}
      <Snackbar
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
      </Snackbar>
    </form>
  );
};

export default PostForm;