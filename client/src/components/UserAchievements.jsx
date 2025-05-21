import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { GrAchievement } from "react-icons/gr";
import styles from '../styles/achievements.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const ACHIEVEMENT_DETAILS = {
  FIRST_POST: {
    title: 'First Post',
    description: 'Created your first post on Chattr',
    icon: '🎉',
    color: '#FFD700',
  },
  FIRST_LIKE: {
    title: 'First Like',
    description: 'Received your first like on a post',
    icon: '❤️',
    color: '#FF6B6B',
  },
  FIRST_COMMENT: {
    title: 'First Comment',
    description: 'Made your first comment on a post',
    icon: '💭',
    color: '#2196F3',
  },
  TEN_LIKES: {
    title: 'Rising Star',
    description: 'Received 10 likes on your posts',
    icon: '⭐',
    color: '#E91E63'
  },
  TEN_POSTS: {
    title: 'Active Poster',
    description: 'Created 10 posts on Chattr',
    icon: '📝',
    color: '#4CAF50',
  },
  WEEKLY_STREAK: {
    title: 'Weekly Streak',
    description: 'Logged in for 7 days in a row',
    icon: '📅',
    color: '#FFC107',
  },
  MONTHLY_STREAK: {
    title: 'Monthly Dedication',
    description: 'Logged in for 30 days in a row',
    icon: '🏆',
    color: '#9C27B0',
  },
};

const UserAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { username } = useParams();

  useEffect(() => {
    const fetchUserAchievements = async () => {
      try {
        const response = await axios.get(`${API_URL}users/lookup/${username}`, {
          withCredentials: true,
        });

        if (response.data?.achievements) {
          setAchievements(response.data.achievements);
        }
      } catch (err) {
        setError('Failed to load achievements');
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAchievements();
  }, [username]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <GrAchievement className={styles.loadingIcon} />
        <p>Loading achievements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <GrAchievement className={styles.trophyIcon} />
        <h1>{username}'s Achievements</h1>
      </div>

      <div className={styles.achievementsGrid}>
        {Object.entries(ACHIEVEMENT_DETAILS).map(
          ([achievementId, achievement]) => {
            const isUnlocked = achievements.includes(achievementId);
            return (
              <div
                key={achievementId}
                className={`${styles.achievementCard} ${
                  !isUnlocked ? styles.locked : ''
                }`}
                style={{ '--achievement-color': achievement.color }}
              >
                <div className={styles.achievementIcon}>
                  <span className={styles.icon}>{achievement.icon}</span>
                </div>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                {isUnlocked ? (
                  <div className={styles.shine} />
                ) : (
                  <div className={styles.lockedOverlay}>
                    <span>Not yet unlocked</span>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {achievements.length === 0 && (
        <div className={styles.noAchievements}>
          <p>No achievements yet. Keep interacting to earn some!</p>
        </div>
      )}
    </div>
  );
};

export default UserAchievements;