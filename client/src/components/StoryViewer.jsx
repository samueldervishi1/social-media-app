import React, { useState, useEffect } from 'react';
import { IconButton, Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { formatRelativeTime } from '../utils/dateUtils';
import logo from '../assets/user.webp';
import styles from '../styles/storyViewer.module.css';

const STORY_DURATION = 5000;
const TIME_UPDATE_INTERVAL = 10000;

const StoryViewer = ({ userStories, userInfo, open, onClose }) => {
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [timeNow, setTimeNow] = useState(Date.now());

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

    const handleNextStory = () => {
        if (activeStoryIndex < userStories.stories.length - 1) {
            setActiveStoryIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    };

    const handlePrevStory = () => {
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => prev - 1);
            setProgress(0);
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

    if (!open || !userStories || userStories.stories.length === 0) return null;

    const currentStory = userStories.stories[activeStoryIndex];

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
                    </div>

                    {currentStory.caption && (
                        <div className={styles.story_caption}>
                            {currentStory.caption}
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