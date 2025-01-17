import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CiLocationArrow1 } from 'react-icons/ci';
import { MdOutlineEmojiEmotions } from 'react-icons/md';
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const dbPromise = openDB('socialAppDB', 1, {
    upgrade(db) {
      db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
    },
  });

  const savePostOffline = async (postContent) => {
    const db = await dbPromise;
    const post = {
      content: postContent,
      postDate: new Date().toISOString().split('T')[0],
      postTime: new Date().toISOString().split('T')[1],
    };
    await db.put('posts', post);
  };

  const sendOfflinePosts = async () => {
    const db = await dbPromise;
    const posts = await db.getAll('posts');
    if (posts.length > 0) {
      for (const post of posts) {
        await handlePostSubmit(post.content, true);
        await db.delete('posts', post.id);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('online', sendOfflinePosts);
    return () => {
      window.removeEventListener('online', sendOfflinePosts);
    };
  }, []);

  const handlePostSubmit = async (content, isOffline = false) => {
    if (isSubmitting || (isOffline && !content)) return;
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbarMessage('Token not found. Please log in again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
        setSnackbarMessage('Post created successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setPostContent('');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      if (!navigator.onLine) {
        await savePostOffline(content);
        setSnackbarMessage(
          'Post saved offline. It will be sent when you are online.'
        );
        setSnackbarSeverity('warning');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error creating post. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostContentChange = (event) => setPostContent(event.target.value);

  const handleEmojiClick = (emojiData) => {
    if (emojiData?.emoji) {
      setPostContent((prevContent) => prevContent + emojiData.emoji);
      setShowEmojiPicker(false);
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setSnackbarMessage('Geolocation is not supported by your browser.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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

          const locationString = `📍 Location: ${city}, ${country}`;
          setPostContent((prevContent) => `${prevContent} ${locationString}`);
        } catch (error) {
          setSnackbarMessage('Error fetching location details.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          const locationString = `📍 Location: (${latitude.toFixed(
            4
          )}, ${longitude.toFixed(4)})`;
          setPostContent((prevContent) => `${prevContent} ${locationString}`);
        }
      },
      (error) => {
        setSnackbarMessage('Unable to retrieve your location.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    );
  };

  const placeholderText = `What's on your mind today, ${getUsernameFromToken()}?`;

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
          onChange={handlePostContentChange}
          rows={1}
          required
          className={styles.textarea}
        />
        <div className={styles.icons_container}>
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
          <Picker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </form>
  );
};

export default PostForm;