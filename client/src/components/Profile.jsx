import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaCog,
  FaTrophy,
  FaRegCommentAlt,
  FaRegBookmark,
  FaRegEyeSlash,
  FaRegThumbsUp,
  FaGithub,
  FaInstagram,
  FaLink,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from '../styles/profile.module.css';
import profileAvatar from '../assets/user.webp';
import backgroundImage from '../assets/background.jpg';
import { getUsernameFromServer, getUserIdFromServer } from '../auth/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [, setLikedPosts] = useState([]);
  const [likedPostsContent, setLikedPostsContent] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = await getUsernameFromServer();
        const userId = await getUserIdFromServer();

        const [profileResponse, postsResponse, likedResponse] =
          await Promise.all([
            axios.get(`${API_URL}users/lookup/${username}`, {
              withCredentials: true,
            }),
            axios.get(`${API_URL}posts/user/${userId}`, {
              withCredentials: true,
            }),
            axios.get(`${API_URL}like/user/${userId}`, {
              withCredentials: true,
            }),
          ]);

        setProfile(profileResponse.data);
        setUserPosts(postsResponse.data);
        setLikedPosts(likedResponse.data);

        if (likedResponse.data && likedResponse.data.postIds) {
          const likedPostsPromises = likedResponse.data.postIds.map((postId) =>
            axios.get(`${API_URL}posts/get/1/${postId}`, {
              withCredentials: true,
            })
          );
          const likedPostsResults = await Promise.all(likedPostsPromises);
          setLikedPostsContent(
            likedPostsResults.map((response) => response.data)
          );
        }
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
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <img src={profileAvatar} alt='' className={styles.avatar} />
              <div className={styles.nameSection}>
                <h1 className={styles.displayName}>{profile.displayName}</h1>
                <h2 className={styles.username}>u/{profile.username}</h2>
              </div>
            </div>
          </div>

          <div className={styles.navigationTabs}>
            <button
              className={`${styles.tab} ${
                activeTab === 'overview' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('overview')}
            >
              OVERVIEW
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === 'posts' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('posts')}
            >
              POSTS
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === 'comments' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('comments')}
            >
              <FaRegCommentAlt /> COMMENTS
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === 'saved' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('saved')}
            >
              <FaRegBookmark /> SAVED
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === 'hidden' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('hidden')}
            >
              <FaRegEyeSlash /> HIDDEN
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === 'upvoted' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('upvoted')}
            >
              <FaRegThumbsUp /> UPVOTED
            </button>
          </div>

          <div className={styles.contentArea}>
            {activeTab === 'posts' && userPosts.length > 0 ? (
              <div className={styles.postsGrid}>
                {userPosts.map((post) => (
                  <div key={post.id} className={styles.postCard}>
                    <p>{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt=''
                        className={styles.postImage}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : activeTab === 'upvoted' && likedPostsContent.length > 0 ? (
              <div className={styles.postsGrid}>
                {likedPostsContent.map((post) => (
                  <div key={post.id} className={styles.postCard}>
                    <p>{post.content}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt=''
                        className={styles.postImage}
                      />
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

        <div className={styles.rightColumn}>
          <div className={styles.aboutCard}>
            <div
              className={styles.bannerImage}
              style={{ backgroundImage: `url(${backgroundImage})` }}
            ></div>

            <div className={styles.aboutContent}>
              <div className={styles.userHeader}>
                <h3 className={styles.headerUsername}>{profile.username}</h3>
                {profile.bio && (
                  <>
                    <span className={styles.separator}>-</span>
                    <p className={styles.headerBio}>{profile.bio}</p>
                  </>
                )}
                <div className={styles.followStats}>
                  <div className={styles.followItem}>
                    <span className={styles.followCount}>
                      <a href="/list">{getFollowersCount()}</a>
                    </span>
                    <span className={styles.followLabel}>
                      <a href="/list">{getFollowersCount() === 1 ? 'follower' : 'followers'}</a>
                    </span>
                  </div>
                  <div className={styles.followItem}>
                    <span className={styles.followCount}>
                      <a href="/list">{getFollowingCount()}</a>
                    </span>
                    <span className={styles.followLabel}><a href="/list/following">following</a></span>
                  </div>
                </div>
              </div>

              <hr className={styles.divider} />

              {profile.links && profile.links.length > 0 && (
                <>
                  <div className={styles.socialLinks}>
                    <div className={styles.linksScroll}>
                      {profile.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className={styles.socialLink}
                        >
                          {link.includes('github.com') ? (
                            <FaGithub className={styles.socialIcon} />
                          ) : link.includes('instagram.com') ? (
                            <FaInstagram className={styles.socialIcon} />
                          ) : (
                            <FaLink className={styles.socialIcon} />
                          )}
                          {link.split('/').pop()}
                        </a>
                      ))}
                    </div>
                  </div>
                  <hr className={styles.divider} />
                </>
              )}

              <div className={styles.userStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Karma</span>
                  <span className={styles.statValue}>
                    {userPosts.length * 10}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Cake Day</span>
                  <span className={styles.statValue}>
                    {new Date(profile.accountCreationDate).toLocaleDateString(
                      'en-US',
                      {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </span>
                </div>
              </div>

              <hr className={styles.divider} />

              <div className={styles.achievements}>
                <div className={styles.achievementsHeader}>
                  <FaTrophy className={styles.trophyIcon} />
                  <h4>Achievements</h4>
                  <Link
                    to={`/user/${profile.username}/achievements`}
                    className={styles.viewAll}
                  >
                    View All
                  </Link>
                </div>
                <p className={styles.achievementCount}>
                  {profile.achievements?.length || 0} Unlocked
                </p>
              </div>

              <hr className={styles.divider} />

              <div className={styles.settingsSection}>
                <h4>Settings</h4>
                <div className={styles.settingRow}>
                  <span className={styles.settingLabel}>
                    u/{profile.username}
                  </span>
                  <Link
                    to='/settings/profile'
                    className={styles.settingsButton}
                  >
                    <FaCog /> Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;