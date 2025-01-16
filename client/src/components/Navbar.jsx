import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { AiOutlineMessage } from 'react-icons/ai';
import { CiLogout, CiServer } from 'react-icons/ci';
import { GiArtificialHive } from 'react-icons/gi';
import {
  MdDeleteForever,
  MdOutlinePrivacyTip,
  MdOutlineEmail,
  MdOutlineHelpOutline,
} from 'react-icons/md';
import { TbPremiumRights, TbAuth2Fa } from 'react-icons/tb';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { RiUserCommunityLine } from 'react-icons/ri';
import loaderImage from '../assets/ZKZg.gif';
import styles from '../styles/navbar.module.css';

import { getUserIdFromToken, getUsernameFromToken } from '../auth/authUtils';

const Navbar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchBarRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElSettings, setAnchorElSettings] = useState(null);

  const userId = getUserIdFromToken();
  const username = getUsernameFromToken();

  const userSettings = [
    {
      name: `Your profile ${username}`,
      icon: <IoPersonCircleOutline className={styles.icon_p} />,
    },
    { name: 'Logout', icon: <CiLogout className={styles.icon_p} /> },
  ];

  const settings = [
    { name: 'Enable 2FA', icon: <TbAuth2Fa className={styles.icon_p} /> },
    { name: 'Premium', icon: <TbPremiumRights className={styles.icon_p} /> },
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

  // Memoized search function
  const searchUsers = useCallback(async (username) => {
    if (!username) {
      setResults([]);
      setShowNoResults(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `http://localhost:8080/api/v2/search/users?username=${encodeURIComponent(
          username
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const filteredResults = response.data.filter((user) => !user.deleted);

      if (filteredResults.length === 0) {
        setShowNoResults(true);
        setResults([]);
      } else {
        setResults(filteredResults);
        setShowNoResults(false);
      }
    } catch (error) {
      console.error('Error searching users: ', error.message);
      setResults([]);
      setShowNoResults(true);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (query.trim() === '') {
      setShowDropdown(false);
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchUsers(query);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchUsers]);

  // Handle account deletion
  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await axios.delete(
        `http://localhost:8080/api/v2/users/update/delete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem('token');
      setShowDeleteModal(false);
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  }, [userId, navigate]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !searchBarRef.current?.contains(event.target) &&
        !event.target.closest('.drpp')
      ) {
        setShowDropdown(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = useCallback(
    (clickedUserId) => {
      setIsMenuOpen(false);
      navigate(clickedUserId === userId ? '/u/profile' : `/u/${clickedUserId}`);
      setQuery('');
      setShowDropdown(false);
    },
    [userId, navigate]
  );

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
        Premium: '/premium',
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
            <Menu
              sx={{ mt: '45px' }}
              id='menu-appbar'
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {userSettings.map((setting, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleSettingAction(setting.name)}
                >
                  <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                    {setting.icon}
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={`${styles.bar} ${isMenuOpen ? 'open' : ''}`} />
            <div className={`${styles.bar} ${isMenuOpen ? 'open' : ''}`} />
            <div className={`${styles.bar} ${isMenuOpen ? 'open' : ''}`} />
          </div>
          {isMenuOpen && (
            <div className={styles.mobile_menu}>
              <div className={styles.search_bar_container1} ref={searchBarRef}>
                <div className={styles.search_container}>
                  <input
                    type='text'
                    placeholder='Search...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                  />
                </div>

                {showDropdown && (
                  <div className={styles.drpp}>
                    {showNoResults ? (
                      <p className={styles.drpp_hld}>Nothing found</p>
                    ) : results.length === 0 ? (
                      <p className={styles.drpp_hld}>
                        Search for friends and more...
                      </p>
                    ) : (
                      <ul className={styles.drpp_rsl}>
                        {results.map((user) => (
                          <li
                            key={user.id}
                            className={styles.drpp_t}
                            onClick={() => handleUserClick(user.id)}
                          >
                            {user.username}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <a href='/home' className={styles.menu_item}>
                <IconButton style={{ fontSize: '15px' }}>
                  <GoHome className={styles.icon_p} />
                  Home
                </IconButton>
              </a>
              <a href='/messages' className={styles.menu_item}>
                <IconButton style={{ fontSize: '15px' }}>
                  <AiOutlineMessage className={styles.icon_p} />
                  Messages
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
            <a href='/messages' className={styles.menu_item}>
              <IconButton style={{ fontSize: '15px' }}>
                <AiOutlineMessage className={styles.icon_p} />
                Messages
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
            <Box sx={{ marginLeft: 0, marginTop: 1 }}>
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
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
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