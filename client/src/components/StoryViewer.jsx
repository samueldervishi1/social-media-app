import React, { useState, useEffect } from 'react';
import { IconButton, Modal, Badge, Avatar, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatRelativeTime } from '../utils/dateUtils';
import logo from '../assets/user.webp';
import styles from '../styles/storyViewer.module.css';

const STORY_DURATION = 5000;
const TIME_UPDATE_INTERVAL = 10000;

const StoryViewer = ({ userStories, userInfo, open, onClose, currentUserId }) => {
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [timeNow, setTimeNow] = useState(Date.now());
    const [viewersInfo, setViewersInfo] = useState(new Map());
    const [showViewers, setShowViewers] = useState(false);
    const [viewCount, setViewCount] = useState(0);

    useEffect(() => {
        setActiveStoryIndex(0);
    }, [userStories?.userId]);

    useEffect(() => {
        if (!open || isPaused) return;

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNextStory();
                    return 0;
                }
                return prev + (100 / (STORY_DURATION / 100));
            });
        }, 100);

        return () => {
            clearInterval(progressInterval);
            setProgress(0);
        };
    }, [open, activeStoryIndex, isPaused]);

    useEffect(() => {
        if (!open) return;

        setTimeNow(Date.now());

        const timeInterval = setInterval(() => {
            setTimeNow(Date.now());
        }, TIME_UPDATE_INTERVAL);

        return () => clearInterval(timeInterval);
    }, [open, activeStoryIndex]);

    useEffect(() => {
        if (!open || !currentUserId || !userStories) return;

        const currentStory = userStories.stories[activeStoryIndex];
        
        const markStoryAsViewed = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}stories/${currentStory.storyId}/view?viewerId=${currentUserId}`, {
                    method: 'PUT',
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error(`Failed to mark story as viewed: ${response.status}`);
                }
            } catch (err) {
                console.error('Error marking story as viewed:', err);
            }
        };

        const fetchViewCount = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}stories/${currentStory.storyId}/views`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setViewCount(data['views-count']);
                } else {
                    console.error('Failed to fetch view count:', response.status);
                }
            } catch (err) {
                console.error('Error fetching view count:', err);
            }
        };

        markStoryAsViewed();
        if (userStories.userId === currentUserId) {
            fetchViewCount();
        }
    }, [open, activeStoryIndex, currentUserId, userStories]);

    useEffect(() => {
        if (!showViewers) return;

        const currentStory = userStories.stories[activeStoryIndex];
        
        const fetchViewersInfo = async () => {
            const newViewersInfo = new Map();
            
            for (const viewerId of currentStory.viewedBy) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}users/lookup/find?userId=${viewerId}`, {
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const username = await response.text();
                        newViewersInfo.set(viewerId, { username, profileImage: logo });
                    }
                } catch (err) {
                    console.error('Error fetching viewer info:', err);
                }
            }
            
            setViewersInfo(newViewersInfo);
        };

        fetchViewersInfo();
    }, [showViewers, activeStoryIndex]);

    const handleNextStory = () => {
        if (activeStoryIndex < userStories.stories.length - 1) {
            setActiveStoryIndex(prev => prev + 1);
            setProgress(0);
            setShowViewers(false);
        } else {
            onClose();
        }
    };

    const handlePrevStory = () => {
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => prev - 1);
            setProgress(0);
            setShowViewers(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowRight') handleNextStory();
        if (event.key === 'ArrowLeft') handlePrevStory();
        if (event.key === 'Escape') onClose();
    };

    const handleMouseDown = () => setIsPaused(true);
    const handleMouseUp = () => setIsPaused(false);
    const handleTouchStart = () => setIsPaused(true);
    const handleTouchEnd = () => setIsPaused(false);

    const toggleViewers = () => {
        setShowViewers(prev => !prev);
        setIsPaused(prev => !prev);
    };

    if (!open || !userStories || userStories.stories.length === 0 || !currentUserId) return null;

    const currentStory = userStories.stories[activeStoryIndex];
    const isOwnStory = userStories.userId === currentUserId;

    return (
        <Modal
            open={open}
            onClose={onClose}
            className={styles.modal}
            onKeyDown={handleKeyDown}
        >
            <div
                className={styles.viewer_container}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className={styles.progress_container}>
                    {userStories.stories.map((_, index) => (
                        <div
                            key={index}
                            className={styles.progress_bar_container}
                        >
                            <div
                                className={styles.progress_bar}
                                style={{
                                    width: `${index === activeStoryIndex ? progress : index < activeStoryIndex ? 100 : 0}%`
                                }}
                            />
                        </div>
                    ))}
                </div>

                <IconButton
                    className={styles.close_button}
                    onClick={onClose}
                    size="large"
                >
                    <CloseIcon />
                </IconButton>

                <div className={styles.story_content}>
                    {currentStory.isVideo ? (
                        <video
                            src={currentStory.mediaPath}
                            className={styles.story_media}
                            autoPlay
                            playsInline
                            muted
                            loop
                        />
                    ) : (
                        <img
                            src={currentStory.mediaPath}
                            alt={currentStory.caption}
                            className={styles.story_media}
                        />
                    )}

                    <div className={styles.story_header}>
                        <img
                            src={userInfo?.profileImage || logo}
                            alt={userInfo?.username}
                            className={styles.user_avatar}
                        />
                        <span className={styles.story_username}>{userInfo?.username || 'Loading...'}</span>
                        <span className={styles.story_timestamp}>
                            {formatRelativeTime(currentStory.createdAt.getTime(), timeNow)}
                        </span>
                        {isOwnStory && (
                            <Tooltip title="View count">
                                <IconButton
                                    className={styles.views_button}
                                    onClick={toggleViewers}
                                    size="small"
                                >
                                    <Badge badgeContent={viewCount} color="primary">
                                        <VisibilityIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>

                    {currentStory.caption && (
                        <div className={styles.story_caption}>
                            {currentStory.caption}
                        </div>
                    )}

                    {showViewers && (
                        <div className={styles.viewers_list}>
                            <h3>Viewers</h3>
                            {Array.from(viewersInfo.entries()).map(([viewerId, viewer]) => (
                                <div key={viewerId} className={styles.viewer_item}>
                                    <Avatar src={viewer.profileImage} className={styles.viewer_avatar} />
                                    <span className={styles.viewer_username}>{viewer.username}</span>
                                </div>
                            ))}
                            {viewersInfo.size === 0 && (
                                <div className={styles.no_viewers}>Loading viewers...</div>
                            )}
                        </div>
                    )}
                </div>

                {activeStoryIndex > 0 && (
                    <IconButton
                        className={`${styles.nav_button} ${styles.prev_button}`}
                        onClick={handlePrevStory}
                        size="large"
                    >
                        <NavigateBeforeIcon />
                    </IconButton>
                )}

                {activeStoryIndex < userStories.stories.length - 1 && (
                    <IconButton
                        className={`${styles.nav_button} ${styles.next_button}`}
                        onClick={handleNextStory}
                        size="large"
                    >
                        <NavigateNextIcon />
                    </IconButton>
                )}
            </div>
        </Modal>
    );
};

export default StoryViewer; 