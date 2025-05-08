import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getUserIdFromServer } from '../auth/authUtils';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { GoHome } from 'react-icons/go';
import { IoSettingsOutline } from 'react-icons/io5';
import { CiLogout } from 'react-icons/ci';
import { GiArtificialHive } from 'react-icons/gi';
import { MdClose } from 'react-icons/md';
import { RiUserCommunityLine } from 'react-icons/ri';
import loaderImage from '../assets/377.gif';
import styles from '../styles/navbar.module.css';

const Navbar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElSettings, setAnchorElSettings] = useState(null);

  const [userId, setUserId] = useState(null);

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
      name: 'Your communities',
      icon: <RiUserCommunityLine className={styles.icon_p} />,
    },
    { name: 'Logout', icon: <CiLogout className={styles.icon_p} /> },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
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

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleSettingAction = useCallback(
    (settingName) => {
      if (settingName === 'Home') {
        navigate('/home');
      } else if (settingName === 'Your communities') {
        navigate('/c/user/communities');
      } else if (settingName === 'Logout') {
        handleLogout();
      }
      handleCloseUserMenu();
    },
    [navigate, handleLogout]
  );

  useEffect(() => {
    const isAnyPanelOpen = Boolean(anchorElSettings) || Boolean(anchorElUser);
    if (isAnyPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [anchorElSettings, anchorElUser]);

  return (
    <>
      <div className={styles.chat_history1}>
        <div className={styles.history_div_2}>
          <div className={styles.navbar_left}>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title='Open profile settings'>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar className={styles.avatar} />
                </IconButton>
              </Tooltip>

              <div
                className={`${styles.user_overlay} ${
                  Boolean(anchorElUser) ? styles.open : ''
                }`}
                onClick={handleCloseUserMenu}
              />
              <div
                className={`${styles.user_sidebar} ${
                  Boolean(anchorElUser) ? styles.open : ''
                }`}
              >
                <div className={styles.user_header}>
                  <Typography variant='h6'>Profile settings</Typography>
                  <IconButton onClick={handleCloseUserMenu}>
                    <MdClose style={{ color: 'black' }} />
                  </IconButton>
                </div>
                <div className={styles.user_content}>
                  {userSettings.map((setting, index) => (
                    <div
                      key={index}
                      className={styles.user_item}
                      onClick={() => handleSettingAction(setting.name)}
                    >
                      <Typography
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        {setting.icon}
                        {setting.name}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </Box>

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
                <a href='/c/communities' className={styles.menu_item}>
                  <IconButton style={{ fontSize: '15px' }}>
                    <RiUserCommunityLine className={styles.icon_p} />
                    Communities
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
              <a href='/c/communities' className={styles.menu_item}>
                <IconButton className={styles.nav_button}>
                  <RiUserCommunityLine className={styles.icon_p} />
                  <span className={styles.nav_text}>Communities</span>
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
