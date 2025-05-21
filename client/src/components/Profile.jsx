import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaEdit,
  FaMapMarkerAlt,
  FaGlobe,
  FaCalendarAlt,
  FaEllipsisH,
} from 'react-icons/fa';
import styles from '../styles/profile.module.css';
import profileAvatar from '../assets/user.webp';
import backgroundImage from '../assets/placeholder.png';
import { getUsernameFromServer, getUserIdFromServer } from '../auth/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = await getUsernameFromServer();
        const userId = await getUserIdFromServer();

        const [profileResponse, postsResponse] = await Promise.all([
          axios.get(`${API_URL}users/lookup/${username}`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}posts/user/${userId}`, {
            withCredentials: true,
          }),
        ]);

        setProfile(profileResponse.data);
        setUserPosts(postsResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFollowersCount = () => {
    return profile?.followers?.length || 0;
  };

  const getFollowingCount = () => {
    return profile?.following?.length || 0;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.errorContainer}>
        <p>Could not load profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.coverSection}>
        <div className={styles.coverImage} style={{ backgroundImage }}></div>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <img src={profileAvatar} alt='' className={styles.avatar} />
            </div>
          </div>
        </div>

        <div className={styles.userInfo}>
          <div style={{ position: 'relative' }}>
            <h1 className={styles.userName}>{profile.displayName}</h1>
            <h2 className={styles.userHandle}>@{profile.username}</h2>

            <button
              className={styles.menuButton}
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label='Profile menu'
            >
              <FaEllipsisH />
            </button>

            <div
              ref={dropdownRef}
              className={`${styles.dropdownMenu} ${
                showDropdown ? styles.show : ''
              }`}
            >
              <div
                className={styles.dropdownItem}
                onClick={() => {
                  setShowDropdown(false);
                  // Add navigation to edit profile page here
                }}
              >
                <FaEdit />
                Edit Profile
              </div>
            </div>
          </div>

          {profile.bio && <p className={styles.userBio}>{profile.bio}</p>}

          <div className={styles.userMetadata}>
            {profile.location && (
              <span className={styles.metadataItem}>
                <FaMapMarkerAlt /> {profile.location}
              </span>
            )}
            {profile.website && (
              <span className={styles.metadataItem}>
                <FaGlobe />
                <a
                  href={profile.website}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {profile.website.replace(/^https?:\/\//i, '')}
                </a>
              </span>
            )}
            <span className={styles.metadataItem}>
              <FaCalendarAlt />
              Joined{' '}
              {new Date(profile.accountCreationDate).toLocaleDateString(
                'en-US',
                {
                  month: 'long',
                  year: 'numeric',
                }
              )}
            </span>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{userPosts.length || 0}</span>
              <span className={styles.statLabel}>Posts</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{getFollowersCount()}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{getFollowingCount()}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>
        </div>

        <div className={styles.contentTabs}>
          <button
            className={`${styles.tab} ${
              activeTab === 'posts' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === 'media' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('media')}
          >
            Media
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === 'likes' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('likes')}
          >
            Likes
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'posts' && userPosts.length > 0 ? (
            <div className={styles.postsGrid}>
              {userPosts.map((post) => (
                <div key={post.id} className={styles.postCard}>
                  <p>{post.content}</p>
                  {post.image && (
                    <img src={post.image} alt='' className={styles.postImage} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No {activeTab} to show yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;