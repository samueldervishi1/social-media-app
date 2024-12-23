import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { GoHome } from "react-icons/go";
import { IoPersonCircleOutline, IoSettingsOutline } from "react-icons/io5";
import { AiOutlineMessage } from "react-icons/ai";
import { CiLogout, CiServer } from "react-icons/ci";
import { GiArtificialHive } from "react-icons/gi";
import { CgCommunity } from "react-icons/cg";
import {
  MdDeleteForever,
  MdOutlinePrivacyTip,
  MdOutlineEmail,
  MdOutlineHelpOutline,
} from "react-icons/md";
import { TbPremiumRights, TbAuth2Fa } from "react-icons/tb";
import { IoIosInformationCircleOutline } from "react-icons/io";
import loaderImage from "../assets/ZKZg.gif";
import user from "../assets/user.webp";
import styles from "../styles/navbar.module.css";

import { getUserIdFromToken } from "../auth/authUtils";

const Navbar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchBarRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElSettings, setAnchorElSettings] = React.useState(null);

  const userId = getUserIdFromToken();

  const userSettings = [
    {
      name: "Profile",
      icon: <IoPersonCircleOutline className={styles.icon_p} />,
    },
    {
      name: "Your Communities",
      icon: <CgCommunity className={styles.icon_p} />,
    },
    { name: "Logout", icon: <CiLogout className={styles.icon_p} /> },
  ];

  const settings = [
    { name: "Enable 2FA", icon: <TbAuth2Fa className={styles.icon_p} /> },
    { name: "Premium", icon: <TbPremiumRights className={styles.icon_p} /> },
    {
      name: "About",
      icon: <IoIosInformationCircleOutline className={styles.icon_p} />,
    },
    {
      name: "Terms & Services",
      icon: <MdOutlinePrivacyTip className={styles.icon_p} />,
    },
    { name: "Contact", icon: <MdOutlineEmail className={styles.icon_p} /> },
    { name: "Help", icon: <MdOutlineHelpOutline className={styles.icon_p} /> },
    { name: "Server health", icon: <CiServer className={styles.icon_p} /> },
  ];

  // Search for users by username
  const searchUsers = async (username) => {
    if (!username) {
      setResults([]);
      setShowNoResults(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/v2/search/users?username=${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;

      // Handle no results or filter out deleted users
      if (data.length === 0) {
        setShowNoResults(true);
      } else {
        const filteredResults = data.filter((user) => !user.deleted);

        if (filteredResults.length === 0) {
          setShowNoResults(true);
        } else {
          setResults(filteredResults);
          setShowNoResults(false);
        }
      }
    } catch (error) {
      console.error("Error searching users: ", error.message);
      setResults([]);
      setShowNoResults(true);
    }
  };

  // Delete the current user's account and navigate to login
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/v2/users/update/delete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsDeleting(false);
      localStorage.removeItem("token");
      setShowDeleteModal(false);
      window.location.reload();
      navigate("/login");
    } catch (error) {
      setIsDeleting(false);
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again later.");
    }
  };

  // Trigger user search with debounce to optimize API calls
  useEffect(() => {
    if (query.trim() === "") {
      setShowDropdown(false);
      return;
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      searchUsers(query);
      setShowDropdown(true);
    }, 500);

    setTypingTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdownElement = document.querySelector(".drpp");
      if (searchBarRef.current && searchBarRef.current.contains(event.target)) {
        return;
      }
      if (dropdownElement && dropdownElement.contains(event.target)) {
        return;
      }
      setShowDropdown(false);
      setQuery("");
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserClick = (clickedUserId) => {
    setIsMenuOpen(false);
    if (clickedUserId === userId) {
      navigate("/profile");
    } else {
      navigate(`/u/${clickedUserId}`);
    }
    setQuery("");
    setShowDropdown(false);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setIsLoggingOut(false);
      window.location.reload();
    }, 2000);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSettingAction = (settingName) => {
    if (settingName === "Profile") {
      navigate("/profile");
    } else if (settingName === "Your Communities") {
      navigate("/c/user/communities");
    } else if (settingName === "Logout") {
      handleLogout();
    }
    handleCloseUserMenu();
  };

  const handleActions = (settingName) => {
    if (settingName === "Enable 2FA") {
      navigate("/security/2fa/enable");
    } else if (settingName === "Premium") {
      navigate("/premium");
    } else if (settingName === "About") {
      navigate("/about");
    } else if (settingName === "Terms & Services") {
      navigate("/terms");
    } else if (settingName === "Contact") {
      navigate("/contact");
    } else if (settingName === "Help") {
      navigate("/help");
    } else if (settingName === "Server health") {
      navigate("/health");
    } else if (settingName === "Delete Account") {
      setShowDeleteModal(true);
    }
    handleCloseUserMenu();
  };

  const handleOpenSettingsMenu = (event) => {
    setAnchorElSettings(event.currentTarget);
  };

  const handleCloseSettingsMenu = () => {
    setAnchorElSettings(null);
  };

  return (
    <>
      <div className={styles.chat_history1}>
        <div className={styles.history_div_2}>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar src={user} />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {userSettings.map((setting, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleSettingAction(setting.name)}
                >
                  <Typography sx={{ display: "flex", alignItems: "center" }}>
                    {setting.icon}
                    {setting.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ marginLeft: 2 }}>
            <Tooltip title="Open settings">
              <IconButton href="/home" sx={{ p: 0 }}>
                AЯYHƆ
              </IconButton>
            </Tooltip>
          </Box>
          <div
            className={styles.hamburger}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className={`${styles.bar} ${isMenuOpen ? "open" : ""}`} />
            <div className={`${styles.bar} ${isMenuOpen ? "open" : ""}`} />
            <div className={`${styles.bar} ${isMenuOpen ? "open" : ""}`} />
          </div>
          {isMenuOpen && (
            <div className={styles.mobile_menu}>
              <div className={styles.search_bar_container1} ref={searchBarRef}>
                <div className={styles.search_container}>
                  <input
                    type="text"
                    placeholder="Search..."
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
              <a href="/home" className={styles.mobile_menu_item}>
                <GoHome className={styles.icon_p} /> Home
              </a>
              <a href="/messages" className={styles.mobile_menu_item}>
                <AiOutlineMessage className={styles.icon_p} /> Messages
              </a>
              <a href="/chirp" className={styles.mobile_menu_item}>
                <GiArtificialHive className={styles.icon_p} /> AЯYHƆ
              </a>
              <a href="/c/communities" className={styles.mobile_menu_item}>
                <CgCommunity className={styles.icon_p} /> Communities
              </a>
              <Box sx={{ marginLeft: 2 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenSettingsMenu} sx={{ p: 0 }}>
                    <IoSettingsOutline className={styles.icon_p}/> Settings
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  anchorEl={anchorElSettings}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
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
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {setting.icon}
                        {setting.name}
                      </Typography>
                    </MenuItem>
                  ))}
                  <MenuItem
                    onClick={() => setShowDeleteModal(true)}
                    sx={{ color: "red" }}
                  >
                    <MdDeleteForever className={styles.icon_p} />
                    Delete Account
                  </MenuItem>
                </Menu>
              </Box>
            </div>
          )}

          <div className={styles.history_links}>
            <a href="/home" className={styles.menu_item}>
              <GoHome className={styles.icon_p} /> Home
            </a>
            <a href="/messages" className={styles.menu_item}>
              <AiOutlineMessage className={styles.icon_p} /> Messages
            </a>
            <a href="/chirp" className={styles.menu_item}>
              <GiArtificialHive className={styles.icon_p} /> AЯYHƆ
            </a>
            <a href="/c/communities" className={styles.menu_item}>
              <CgCommunity className={styles.icon_p} /> Communities
            </a>
            <Box sx={{ marginLeft: 2 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenSettingsMenu} sx={{ p: 0 }}>
                  <IoSettingsOutline />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                anchorEl={anchorElSettings}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElSettings)}
                onClose={handleCloseSettingsMenu}
              >
                {settings.map((setting, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => handleActions(setting.name)}
                  >
                    <Typography sx={{ display: "flex", alignItems: "center" }}>
                      {setting.icon}
                      {setting.name}
                    </Typography>
                  </MenuItem>
                ))}
                <MenuItem
                  onClick={() => setShowDeleteModal(true)}
                  sx={{ color: "red" }}
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
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </Modal.Footer>
      </Modal>

      {isLoggingOut && (
        <div className={styles.logout_loader}>
          <div className={styles.logout_box}>
            <h2>Logging Out...</h2>
            <img
              src={loaderImage}
              alt="Logging out..."
              style={{ width: "30px", margin: "10px 0" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;