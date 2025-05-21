import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getUserIdFromServer, getUsernameFromServer } from '../auth/authUtils';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import { GoHome } from 'react-icons/go';
import { IoSettingsOutline } from 'react-icons/io5';
import { CiLogout } from 'react-icons/ci';
import { GiArtificialHive } from 'react-icons/gi';
import { CgProfile } from 'react-icons/cg';
import loaderImage from '../assets/377.gif';
import styles from '../styles/navbar.module.css';

const Navbar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const result = await getUserIdFromServer();
      setUserId(result);
    };

    fetchUserId();
  }, []);

  const userSettings = [
    {
      name: 'Home',
      icon: <GoHome className={styles.icon_p} />,
    },
    {
      name: 'Profile',
      icon: <CgProfile className={styles.icon_p} />,
    },
    {
      name: 'Achvievements',
      icon: <GiArtificialHive className={styles.icon_p} />,
    },
    { name: 'Logout', icon: <CiLogout className={styles.icon_p} /> },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false); // Close dropdown when route changes
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

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                <Avatar className={styles.avatar} />
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

            <Box sx={{ marginLeft: 2 }}>
              <a
                style={{ textDecoration: 'none', color: 'black' }}
                href='/home'
              >
                <p style={{ marginTop: 10, fontSize: 25 }}>𝓒𝓱𝓪𝓽𝓽𝓻</p>
              </a>
            </Box>
          </div>

          <div className={styles.navbar_right}>
            <div
              className={styles.hamburger}
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                console.log('isMenuOpen:', !isMenuOpen);
              }}
            >
              <div className={`${styles.bar} ${isMenuOpen ? 'open' : ''}`} />
              <div className={`${styles.bar} ${isMenuOpen ? 'open' : ''}`} />
              <div className={`${styles.bar} ${isMenuOpen ? 'open' : ''}`} />
            </div>

            {isMenuOpen && (
              <div className={styles.mobile_menu}>
                <a href='/home' className={styles.menu_item}>
                  <IconButton style={{ fontSize: '15px' }}>
                    <GoHome className={styles.icon_p} />
                    Home
                  </IconButton>
                </a>
                <a href='/chat' className={styles.menu_item}>
                  <IconButton style={{ fontSize: '15px' }}>
                    <GiArtificialHive className={styles.icon_p} />
                    Eido
                  </IconButton>
                </a>
                <a href='/settings' className={styles.menu_item}>
                  <IconButton style={{ fontSize: '15px' }}>
                    <IoSettingsOutline className={styles.icon_p} />
                    Settings
                  </IconButton>
                </a>
              </div>
            )}

            <div className={styles.history_links}>
              <a href='/home' className={styles.menu_item}>
                <IconButton className={styles.nav_button}>
                  <GoHome className={styles.icon_p} />
                  <span className={styles.nav_text}>Home</span>
                </IconButton>
              </a>
              <a href='/chat' className={styles.menu_item}>
                <IconButton className={styles.nav_button}>
                  <GiArtificialHive className={styles.icon_p} />
                  <span className={styles.nav_text}>Eido</span>
                </IconButton>
              </a>
              <a href='/settings' className={styles.menu_item}>
                <IconButton style={{ fontSize: '15px' }}>
                  <IoSettingsOutline className={styles.icon_p} />
                  Settings
                </IconButton>
              </a>
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