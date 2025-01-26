import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { GoHome } from 'react-icons/go';
import { IoPersonCircleOutline, IoSettingsOutline } from 'react-icons/io5';
import { CiLogout, CiServer } from 'react-icons/ci';
import { GiArtificialHive } from 'react-icons/gi';
import {
  MdDeleteForever,
  MdOutlinePrivacyTip,
  MdOutlineEmail,
  MdOutlineHelpOutline,
  MdClose,
} from 'react-icons/md';
import { TbAuth2Fa } from 'react-icons/tb';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { RiUserCommunityLine } from 'react-icons/ri';
import loaderImage from '../assets/logo.gif';
import styles from '../styles/navbar.module.css';

import { getUserIdFromToken, getUsernameFromToken } from '../auth/authUtils';
const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');
const userId = getUserIdFromToken();
const username = getUsernameFromToken();

const Navbar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElSettings, setAnchorElSettings] = useState(null);

  const userSettings = [
    {
      name: `Your profile ${username}`,
      icon: <IoPersonCircleOutline className={styles.icon_p} />,
    },
    {
      name: 'Your communities',
      icon: <RiUserCommunityLine className={styles.icon_p} />,
    },
    { name: 'Logout', icon: <CiLogout className={styles.icon_p} /> },
  ];

  const settings = [
    { name: 'Enable 2FA', icon: <TbAuth2Fa className={styles.icon_p} /> },
    {
      name: 'About',
      icon: <IoIosInformationCircleOutline className={styles.icon_p} />,
    },
    {
      name: 'Terms & Services',
      icon: <MdOutlinePrivacyTip className={styles.icon_p} />,
    },
    { name: 'Contact', icon: <MdOutlineEmail className={styles.icon_p} /> },
    { name: 'Help', icon: <MdOutlineHelpOutline className={styles.icon_p} /> },
    { name: 'Server health', icon: <CiServer className={styles.icon_p} /> },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle account deletion
  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true);
    try {
      if (!token) throw new Error('No authentication token found');

      await axios.delete(`${API_URL}/api/v2/users/update/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.removeItem('token');
      setShowDeleteModal(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  }, [userId]);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    localStorage.removeItem('token');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }, []);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleOpenSettingsMenu = (event) =>
    setAnchorElSettings(event.currentTarget);
  const handleCloseSettingsMenu = () => setAnchorElSettings(null);

  const handleSettingAction = useCallback(
    (settingName) => {
      if (settingName === `Your profile ${username}`) {
        navigate('/u/profile');
      } else if (settingName === 'Your communities') {
        navigate('/c/user/communities');
      } else if (settingName === 'Logout') {
        handleLogout();
      }
      handleCloseUserMenu();
    },
    [username, navigate, handleLogout]
  );

  const handleActions = useCallback(
    (settingName) => {
      const routes = {
        'Enable 2FA': '/security/2fa/enable',
        About: '/about',
        'Terms & Services': '/terms',
        Contact: '/contact',
        Help: '/faq',
        'Server health': '/health',
      };

      if (settingName === 'Delete Account') {
        setShowDeleteModal(true);
      } else if (routes[settingName]) {
        navigate(routes[settingName]);
      }

      handleCloseSettingsMenu();
    },
    [navigate]
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
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title='Open profile settings'>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar />
              </IconButton>
            </Tooltip>

            {/* User Profile Sliding Panel */}
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
                  <MdClose />
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
            <Tooltip title='Home'>
              <IconButton
                href='/home'
                sx={{ p: 0 }}
                style={{ fontSize: '25px' }}
              >
                AЯYHƆ
              </IconButton>
            </Tooltip>
          </Box>
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
                  Sypher
                </IconButton>
              </a>
              <a href='/c/communities' className={styles.menu_item}>
                <IconButton style={{ fontSize: '15px' }}>
                  <RiUserCommunityLine className={styles.icon_p} />
                  Communities
                </IconButton>
              </a>
              <Box sx={{ marginLeft: 1 }}>
                <Tooltip title='Open settings'>
                  <IconButton
                    onClick={handleOpenSettingsMenu}
                    sx={{ p: 0 }}
                    style={{ fontSize: '15px' }}
                  >
                    <IoSettingsOutline className={styles.icon_p} /> Settings
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  anchorEl={anchorElSettings}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElSettings)}
                  onClose={handleCloseSettingsMenu}
                >
                  {settings.map((setting, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleActions(setting.name)}
                    >
                      <Typography
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        {setting.icon}
                        {setting.name}
                      </Typography>
                    </MenuItem>
                  ))}
                  <MenuItem
                    onClick={() => setShowDeleteModal(true)}
                    sx={{ color: 'red' }}
                  >
                    <MdDeleteForever className={styles.icon_p} />
                    Delete Account
                  </MenuItem>
                </Menu>
              </Box>
            </div>
          )}

          {/*desktop layout */}
          <div className={styles.history_links}>
            <a href='/home' className={styles.menu_item}>
              <IconButton style={{ fontSize: '15px' }}>
                <GoHome className={styles.icon_p} />
                Home
              </IconButton>
            </a>
            <a href='/chat' className={styles.menu_item}>
              <IconButton style={{ fontSize: '15px' }}>
                <GiArtificialHive className={styles.icon_p} />
                Sypher
              </IconButton>
            </a>
            <a href='/c/communities' className={styles.menu_item}>
              <IconButton style={{ fontSize: '15px' }}>
                <RiUserCommunityLine className={styles.icon_p} />
                Communities
              </IconButton>
            </a>
            <Box sx={{ marginLeft: 0, marginTop: 0.7 }}>
              <Tooltip title='Open settings'>
                <IconButton
                  onClick={handleOpenSettingsMenu}
                  sx={{ p: 0 }}
                  style={{ fontSize: '15px' }}
                >
                  <IoSettingsOutline className={styles.icon_p} /> Settings
                </IconButton>
              </Tooltip>

              {/* Settings Sliding Panel */}
              <div
                className={`${styles.settings_overlay} ${
                  Boolean(anchorElSettings) ? styles.open : ''
                }`}
                onClick={handleCloseSettingsMenu}
              />
              <div
                className={`${styles.settings_sidebar} ${
                  Boolean(anchorElSettings) ? styles.open : ''
                }`}
              >
                <div className={styles.settings_header}>
                  <Typography variant='h6'>Settings</Typography>
                  <IconButton onClick={handleCloseSettingsMenu}>
                    <MdClose />
                  </IconButton>
                </div>
                <div className={styles.settings_content}>
                  {settings.map((setting, index) => (
                    <div
                      key={index}
                      className={styles.settings_item}
                      onClick={() => handleActions(setting.name)}
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
                  <div
                    className={styles.settings_item}
                    onClick={() => setShowDeleteModal(true)}
                    style={{ color: 'red' }}
                  >
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <MdDeleteForever className={styles.icon_p} />
                      Delete Account
                    </Typography>
                  </div>
                </div>
              </div>
            </Box>
          </div>
        </div>
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant='danger'
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </Modal.Footer>
      </Modal>

      {isLoggingOut && (
        <div className={styles.logout_loader}>
          <div className={styles.logout_box}>
            <h2>Logging Out...</h2>
            <img
              src={loaderImage}
              alt='Logging out...'
              style={{ width: '30px', margin: '10px 0' }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;