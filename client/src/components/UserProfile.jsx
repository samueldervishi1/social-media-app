import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  FaTrophy,
  FaRegCommentAlt,
  FaRegBookmark,
  FaRegEyeSlash,
  FaRegThumbsUp,
  FaUserPlus,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from '../styles/profile.module.css';
import profileAvatar from '../assets/user.webp';
import backgroundImage from '../assets/background.jpg';
import { getUserIdFromServer } from '../auth/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [followStatus, setFollowStatus] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await getUserIdFromServer();
        setCurrentUserId(userId);

        const [profileResponse, postsResponse] = await Promise.all([
          axios.get(`${API_URL}users/lookup/${username}`, {
            withCredentials: true,
          }),
          axios.get(`${API_URL}posts/user/${username}`, {
            withCredentials: true,
          }),
        ]);

        const profileData = profileResponse.data;
        setProfile(profileData);
        setUserPosts(postsResponse.data);

        // --- fetch follow status ---
        if (profileData.id && userId !== profileData.userId) {
          const followStatusResponse = await axios.get(
            `${API_URL}follow/status`,
            {
              params: {
                senderId: userId,
                receiverId: profileData.id,
              },
              withCredentials: true,
            }
          );

          const status = followStatusResponse.data.status;
          setFollowStatus(status);

          if (status === 'ACCEPTED') {
            setIsFollowing(true);
          } else {
            setIsFollowing(false);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!currentUserId || !profile?.id) return;

      try {
        const res = await axios.get(`${API_URL}follow/status`, {
          params: {
            senderId: currentUserId,
            receiverId: profile.id,
          },
          withCredentials: true,
        });

        const newStatus = res.data.status;
        setFollowStatus(newStatus);

        if (newStatus === 'ACCEPTED') {
          setIsFollowing(true);
        } else if (newStatus === 'REJECTED') {
          setIsFollowing(false);
        }
      } catch (err) {
        console.error('Error checking follow status:', err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [currentUserId, profile]);

  const handleFollow = async () => {
    try {
      if (isFollowing) return;

      await axios.post(
        `${API_URL}follow/send`,
        {
          senderId: currentUserId,
          receiverId: profile.id,
        },
        {
          withCredentials: true,
        }
      );
      console.log('Receiver ID:', profile.id);
      console.log('Sender ID:', currentUserId);

      setIsFollowing(true);

      const profileResponse = await axios.get(
        `${API_URL}users/lookup/${username}`,
        {
          withCredentials: true,
        }
      );
      setProfile(profileResponse.data);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

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

  // Don't show follow button if viewing own profile
  const showFollowButton = currentUserId !== profile.userId;

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
              {showFollowButton &&
                (followStatus === 'ACCEPTED' ? (
                  <button
                    disabled
                    className={`${styles.followButton} ${styles.following}`}
                  >
                    <FaUserPlus /> Following
                  </button>
                ) : followStatus === 'PENDING' ? (
                  <button disabled className={styles.followButton}>
                    <FaUserPlus /> Requested
                  </button>
                ) : followStatus === 'REJECTED' ? (
                  <button
                    onClick={handleFollow}
                    className={styles.followButton}
                  >
                    <FaUserPlus /> Follow
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={styles.followButton}
                  >
                    <FaUserPlus /> Follow
                  </button>
                ))}
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
                      {getFollowersCount()}
                    </span>
                    <span className={styles.followLabel}>
                      {getFollowersCount() === 1 ? 'follower' : 'followers'}
                    </span>
                  </div>
                  <div className={styles.followItem}>
                    <span className={styles.followCount}>
                      {getFollowingCount()}
                    </span>
                    <span className={styles.followLabel}>following</span>
                  </div>
                </div>
              </div>

              <hr className={styles.divider} />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;