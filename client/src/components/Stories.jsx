import React, { useEffect, useState, memo } from 'react';
import { Avatar, CircularProgress } from '@mui/material';
import logo from '../assets/user.webp';
import styles from '../styles/stories.module.css';
import StoryViewer from './StoryViewer';

const Stories = memo(() => {
    const [userStoriesMap, setUserStoriesMap] = useState(new Map());
    const [userInfoMap, setUserInfoMap] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const fetchUserInfo = async (userId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}users/lookup/find?userId=${userId}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }

            const username = await response.text();

            const userInfo = {
                username,
                profileImage: logo
            };

            setUserInfoMap(prev => new Map(prev).set(userId, userInfo));
            return userInfo;
        } catch (err) {
            console.error('Error fetching user info:', err);
            return null;
        }
    };

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}stories/feed/all`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch stories');
                }

                const stories = await response.json();

                const storyMap = new Map();
                stories.forEach(story => {
                    if (!storyMap.has(story.userId)) {
                        storyMap.set(story.userId, {
                            userId: story.userId,
                            stories: []
                        });
                        fetchUserInfo(story.userId);
                    }
                    storyMap.get(story.userId).stories.push({
                        id: story.id,
                        mediaPath: `${import.meta.env.VITE_API_URL}${story.mediaPath.replace('./', '')}`,
                        caption: story.caption,
                        createdAt: new Date(story.createdAt),
                        expiresAt: new Date(story.expiresAt),
                        isVideo: story.video
                    });
                });

                storyMap.forEach(userStories => {
                    userStories.stories.sort((a, b) => b.createdAt - a.createdAt);
                });

                setUserStoriesMap(storyMap);
            } catch (err) {
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
        setViewerOpen(false);
        setSelectedUserId(null);
    };

    if (loading) {
        return (
            <div className={styles.loading_container}>
                <CircularProgress size={30} />
            </div>
        );
    }

    if (error) {
        return <div className={styles.error_message}>Error loading stories</div>;
    }

    const userStoriesArray = Array.from(userStoriesMap.values());

    if (userStoriesArray.length === 0) {
        return null;
    }

    return (
        <>
            <div className={styles.stories_container}>
                <div className={styles.stories_wrapper}>
                    {userStoriesArray.map((userStories) => {
                        const hasUnviewedStories = userStories.stories.some(story => !story.viewed);
                        const userInfo = userInfoMap.get(userStories.userId);

                        return (
                            <div
                                key={userStories.userId}
                                className={styles.story_item}
                                onClick={() => handleStoryClick(userStories.userId)}
                            >
                                <div className={`${styles.story_ring} ${hasUnviewedStories ? styles.unviewed : ''}`}>
                                    <Avatar
                                        src={userInfo?.profileImage || logo}
                                        className={styles.story_avatar}
                                    />
                                </div>
                                <span className={styles.username}>{userInfo?.username || 'Loading...'}</span>
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
                />
            )}
        </>
    );
});

Stories.displayName = 'Stories';

export default Stories;