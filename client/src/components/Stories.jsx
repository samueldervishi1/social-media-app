import React, { useEffect, useState, memo } from 'react';
// import { Avatar, CircularProgress } from '@mui/material';
import logo from '../assets/user.webp';
import styles from '../styles/stories.module.css';
import StoryViewer from './StoryViewer';
import { getUserIdFromServer } from '../auth/authUtils';

const Stories = memo(() => {
  const [userStoriesMap, setUserStoriesMap] = useState(new Map());
  const [userInfoMap, setUserInfoMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const userId = await getUserIdFromServer();
        setCurrentUserId(userId);
      } catch (err) {
        console.error('Error fetching current user ID:', err);
      }
    };
    fetchCurrentUserId();
  }, []);

  const fetchUserInfo = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}users/lookup/find?userId=${userId}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const username = await response.text();
      const userInfo = {
        username,
        profileImage: logo,
      };

      setUserInfoMap((prev) => new Map(prev).set(userId, userInfo));
      return userInfo;
    } catch (err) {
      console.error('Error fetching user info:', err);
      return null;
    }
  };

  const getStoryId = (story) => {
    if (story._id?.$oid) return story._id.$oid;
    return story._id || story.id;
  };

  const parseDate = (dateField) => {
    if (dateField?.$date) return new Date(dateField.$date);
    return new Date(dateField);
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}stories/feed/all`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch stories: ${response.status}`);
        }

        const stories = await response.json();

        if (!Array.isArray(stories)) {
          throw new Error('Stories response is not an array');
        }

        const storyMap = new Map();
        stories.forEach((story) => {
          try {
            if (!story.userId) {
              console.warn('Story missing userId:', story);
              return;
            }

            const mediaItems = Array.isArray(story.media)
              ? story.media
              : [
                  {
                    path: story.mediaPath || story.path,
                    isVideo: story.isVideo,
                  },
                ];

            if (!mediaItems || mediaItems.length === 0) {
              console.warn('Story has no valid media:', story);
              return;
            }

            if (!storyMap.has(story.userId)) {
              storyMap.set(story.userId, {
                userId: story.userId,
                stories: [],
              });
              fetchUserInfo(story.userId);
            }

            mediaItems.forEach((mediaItem, index) => {
              const mediaPath = mediaItem.path || mediaItem.mediaPath;
              if (!mediaPath) {
                console.warn('Media item missing path:', mediaItem);
                return;
              }

              const storyId = getStoryId(story);
              storyMap.get(story.userId).stories.push({
                id: `${storyId}_${index}`,
                mediaPath: `${import.meta.env.VITE_API_URL}${mediaPath.replace('./', '')}`,
                caption: story.caption,
                createdAt: parseDate(story.createdAt),
                expiresAt: parseDate(story.expiresAt),
                isVideo: mediaItem.isVideo,
                viewedBy: story.viewedBy || [],
                storyId: storyId,
              });
            });
          } catch (err) {
            console.error('Error processing story:', story, err);
          }
        });

        storyMap.forEach((userStories) => {
          userStories.stories.sort((a, b) => b.createdAt - a.createdAt);
        });

        setUserStoriesMap(storyMap);
      } catch (err) {
        console.error('Error in fetchStories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleStoryClick = (userId) => {
    setSelectedUserId(userId);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    const fetchStories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}stories/feed/all`,
          {
            credentials: 'include',
          }
        );

        if (response.ok) {
          const stories = await response.json();
          if (Array.isArray(stories)) {
            const storyMap = new Map();
            stories.forEach((story) => {
              if (!story.userId) return;

              const mediaItems = Array.isArray(story.media)
                ? story.media
                : [
                    {
                      path: story.mediaPath || story.path,
                      isVideo: story.isVideo,
                    },
                  ];

              if (!mediaItems || mediaItems.length === 0) return;

              if (!storyMap.has(story.userId)) {
                storyMap.set(story.userId, {
                  userId: story.userId,
                  stories: [],
                });
              }

              mediaItems.forEach((mediaItem, index) => {
                const mediaPath = mediaItem.path || mediaItem.mediaPath;
                if (!mediaPath) return;

                const storyId = getStoryId(story);
                storyMap.get(story.userId).stories.push({
                  id: `${storyId}_${index}`,
                  mediaPath: `${import.meta.env.VITE_API_URL}${mediaPath.replace('./', '')}`,
                  caption: story.caption,
                  createdAt: parseDate(story.createdAt),
                  expiresAt: parseDate(story.expiresAt),
                  isVideo: mediaItem.isVideo,
                  viewedBy: story.viewedBy || [],
                  storyId: storyId,
                });
              });
            });

            storyMap.forEach((userStories) => {
              userStories.stories.sort((a, b) => b.createdAt - a.createdAt);
            });

            setUserStoriesMap(storyMap);
          }
        }
      } catch (err) {
        console.error('Error refreshing stories:', err);
      }
    };

    fetchStories();
    setViewerOpen(false);
    setSelectedUserId(null);
  };

  if (loading) {
    return (
      <div className={styles.loading_container}>
        {/* <CircularProgress size={30} /> */}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error_message}>
        Error loading stories: {error}
        <button
          onClick={() => window.location.reload()}
          className={styles.retry_button}
        >
          Retry
        </button>
      </div>
    );
  }

  const userStoriesArray = Array.from(userStoriesMap.values());

  if (userStoriesArray.length === 0) {
    return <div className={styles.no_stories}>No stories available</div>;
  }

  return (
    <>
      <div className={styles.stories_container}>
        <div className={styles.stories_wrapper}>
          {userStoriesArray.map((userStories) => {
            const hasUnviewedStories = userStories.stories.some(
              (story) => !story.viewedBy.includes(currentUserId)
            );
            const userInfo = userInfoMap.get(userStories.userId);

            return (
              <div
                key={userStories.userId}
                className={styles.story_item}
                onClick={() => handleStoryClick(userStories.userId)}
              >
                <div
                  className={`${styles.story_ring} ${hasUnviewedStories ? styles.unviewed : ''}`}
                >
                  {/* <Avatar
                                        src={userInfo?.profileImage || logo}
                                        className={styles.story_avatar}
                                    /> */}
                </div>
                <span className={styles.username}>
                  {userInfo?.username || 'Loading...'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedUserId && (
        <StoryViewer
          userStories={userStoriesMap.get(selectedUserId)}
          userInfo={userInfoMap.get(selectedUserId)}
          open={viewerOpen}
          onClose={handleCloseViewer}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
});

Stories.displayName = 'Stories';

export default Stories;
