import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { getUserIdFromServer, getUsernameFromServer } from '../auth/authUtils';
// import Box from '@mui/material/Box';
// import Avatar from '@mui/material/Avatar';
import { GoHome } from 'react-icons/go';
import { IoSettingsOutline, IoSearchOutline } from 'react-icons/io5';
import { CiLogout } from 'react-icons/ci';
import { GiArtificialHive, GiAchievement } from 'react-icons/gi';
import { CgProfile } from 'react-icons/cg';
import { MdOutlineExplore } from 'react-icons/md';
import loaderImage from '../assets/377.gif';
import styles from '../styles/navbar.module.css';
import { IoMdNotificationsOutline } from 'react-icons/io';
import NotificationsPopup from './NotificationsPopup';
import { useNotifications } from './NotificationContext';

const Navbar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [, setUserId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userInitial, setUserInitial] = useState('');
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const fetchUserId = async () => {
      const result = await getUserIdFromServer();
      setUserId(result);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const username = await getUsernameFromServer();
        setCurrentUsername(username);
        // Set the first letter of the username as the initial for the avatar
        if (username) {
          setUserInitial(username.charAt(0).toUpperCase());
        }
      } catch (err) {
        console.error('Failed to get current username', err);
      }
    };

    fetchUsername();
  }, []);

  const userSettings = [
    {
      name: 'Profile',
      icon: <CgProfile className={styles.icon_p} />,
    },
    {
      name: 'Achvievements',
      icon: <GiAchievement className={styles.icon_p} />,
    },
    { name: 'Logout', icon: <CiLogout className={styles.icon_p} /> },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location]);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await logout();
      navigate('/login');

      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigate]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSettingAction = useCallback(
    async (settingName) => {
      if (settingName === 'Home') {
        navigate('/home');
      } else if (settingName === 'Achvievements') {
        const username = await getUsernameFromServer();
        navigate(`/user/${username}/achievements`);
      } else if (settingName === 'Profile') {
        navigate('/profile');
      } else if (settingName === 'Logout') {
        handleLogout();
      }
      setIsDropdownOpen(false);
    },
    [navigate, handleLogout]
  );

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const encodedQuery = encodeURIComponent(query);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}search/all?query=${encodedQuery}`,
        { withCredentials: true }
      );
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, handleSearch]);

  const handleUserClick = (username) => {
    if (username === currentUsername) {
      navigate('/profile');
    } else {
      navigate(`/user/${username}`);
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className={styles.chat_history1}>
        <div className={styles.history_div_2}>
          <div className={styles.navbar_left}>
            <div className={styles.profile_menu} ref={menuRef}>
              <button
                onClick={toggleDropdown}
                className={styles.profile_button}
              >
                <div className={styles.custom_avatar}>{userInitial || '?'}</div>
              </button>

              <div
                className={`${styles.dropdown_menu} ${
                  isDropdownOpen ? styles.show : ''
                }`}
              >
                {userSettings.map((setting, index) => (
                  <button
                    key={index}
                    className={styles.dropdown_item}
                    onClick={() => {
                      handleSettingAction(setting.name);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {setting.icon}
                    {setting.name}
                  </button>
                ))}
              </div>
            </div>

            <a style={{ textDecoration: 'none', color: 'black' }} href='/home'>
              <p
                style={{
                  fontSize: 25,
                  position: 'relative',
                  right: 0,
                  top: 4,
                }}
              >
                𝓒𝓱𝓪𝓽𝓽𝓻
              </p>
            </a>
          </div>

          <div className={styles.search_container} ref={searchRef}>
            <div className={styles.search_wrapper}>
              <IoSearchOutline className={styles.search_icon} />
              <input
                type='text'
                className={styles.search_input}
                placeholder='Search users...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {showSearchResults && (
              <div className={styles.search_results}>
                {isSearching ? (
                  <div className={styles.search_loading}>Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user, index) => (
                    <div
                      key={index}
                      className={styles.search_result_item}
                      onClick={() => handleUserClick(user.username)}
                    >
                      <div className={styles.username}>{user.username}</div>
                      <div className={styles.fullname}>{user.fullName}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.no_results}>No users found</div>
                )}
              </div>
            )}
          </div>

          <div className={styles.navbar_right}>
            <div
              className={styles.hamburger}
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <div
                className={`${styles.bar} ${isMenuOpen ? styles.open : ''}`}
              />
              <div
                className={`${styles.bar} ${isMenuOpen ? styles.open : ''}`}
              />
              <div
                className={`${styles.bar} ${isMenuOpen ? styles.open : ''}`}
              />
            </div>

            {isMenuOpen && (
              <div className={styles.mobile_menu}>
                <button
                  className={styles.mobile_item}
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/home');
                  }}
                >
                  <GoHome className={styles.icon_p} />
                  <span>Home</span>
                </button>
                <button
                  className={styles.mobile_item}
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/chat');
                  }}
                >
                  <GiArtificialHive className={styles.icon_p} />
                  <span>Cattr Ultra</span>
                </button>
                <button
                  className={styles.mobile_item}
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/settings');
                  }}
                >
                  <IoSettingsOutline className={styles.icon_p} />
                  <span>Settings</span>
                </button>
                <button
                  className={styles.mobile_item}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowNotifications(!showNotifications);
                  }}
                >
                  <div className={styles.notification_icon}>
                    <IoMdNotificationsOutline className={styles.icon_p} />
                    {unreadCount > 0 && (
                      <span className={styles.notification_badge}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span>Notifications</span>
                </button>
              </div>
            )}

            <div className={styles.history_links}>
              <button
                className={styles.nav_item}
                onClick={() => navigate('/home')}
              >
                <GoHome className={styles.icon_p} />
                <span className={styles.nav_text}>Home</span>
              </button>

              <button
                className={styles.nav_item}
                onClick={() => navigate('/explore')}
              >
                <MdOutlineExplore className={styles.icon_p} />
                <span className={styles.nav_text}>Explore</span>
              </button>

              <button
                className={styles.nav_item}
                onClick={() => navigate('/chat')}
              >
                <GiArtificialHive className={styles.icon_p} />
                <span className={styles.nav_text}>Chattr Ultra</span>
              </button>

              <button
                className={styles.nav_item}
                onClick={() => navigate('/settings')}
              >
                <IoSettingsOutline className={styles.icon_p} />
                <span className={styles.nav_text}>Settings</span>
              </button>

              <button
                className={styles.nav_item}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <div className={styles.notification_icon}>
                  <IoMdNotificationsOutline className={styles.icon_p} />
                  {unreadCount > 0 && (
                    <span className={styles.notification_badge}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={styles.nav_text}>Notifications</span>
              </button>

              <NotificationsPopup
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          </div>
        </div>
      </div>

      {isLoggingOut && (
        <div className={styles.logout_loader}>
          <div className={styles.logout_box}>
            <h2 style={{ color: 'white' }}>Logging Out...</h2>
            <img
              src={loaderImage}
              alt='Logging out...'
              style={{ width: '50px', margin: '10px 0' }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
