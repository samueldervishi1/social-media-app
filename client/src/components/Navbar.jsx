import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
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
import { BiPlusCircle } from "react-icons/bi";
import { TbPremiumRights, TbAuth2Fa } from "react-icons/tb";
import { IoIosInformationCircleOutline } from "react-icons/io";
import loaderImage from "../assets/ZKZg.gif";
import styles from "../styles/navbar.module.css";

import { getUserIdFromToken, getUsernameFromToken } from "../auth/authUtils";

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

  const userId = getUserIdFromToken();
  const username = getUsernameFromToken();

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
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target) &&
        !document.querySelector(".drpp").contains(event.target)
      ) {
        setShowDropdown(false);
        setQuery("");
      }
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

  return (
    <>
      <div className={styles.chat_history1}>
        <div className={styles.history_div_2}>
          <div>
            <a href="/home" className={styles.name_logo}>
              AЯYHƆ{" "}
            </a>
          </div>
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
              <Dropdown>
                <Dropdown.Toggle
                  variant="link"
                  className={styles.mobile_menu_item}
                >
                  <IoPersonCircleOutline className={styles.icon_p} /> Profile
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/profile">
                    {" "}
                    <IoPersonCircleOutline className={styles.icon_p} />
                    See your profile {username}
                  </Dropdown.Item>
                  <Dropdown.Item href="#">
                    {" "}
                    <BiPlusCircle className={styles.icon_p} />
                    Add another account
                  </Dropdown.Item>
                  <Dropdown.Item href="/c/user/communities">
                    {" "}
                    <CgCommunity className={styles.icon_p} />
                    Your communities
                  </Dropdown.Item>
                  <Dropdown.Divider className={styles.divider_dp} />
                  <Dropdown.Item onClick={handleLogout}>
                    <CiLogout className={styles.icon_p} /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Toggle
                  variant="link"
                  className={styles.mobile_menu_item}
                >
                  <IoSettingsOutline className={styles.icon_p} /> Settings
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/security/2fa/enable">
                    <TbAuth2Fa className={styles.icon_p} /> Enable 2FA
                  </Dropdown.Item>
                  <Dropdown.Item href="/premium">
                    <TbPremiumRights className={styles.icon_p} /> Premium
                  </Dropdown.Item>
                  <Dropdown.Item href="/about">
                    <IoIosInformationCircleOutline className={styles.icon_p} />{" "}
                    About
                  </Dropdown.Item>
                  <Dropdown.Item href="/terms">
                    {" "}
                    <MdOutlinePrivacyTip className={styles.icon_p} />
                    Terms &amp; Services
                  </Dropdown.Item>
                  <Dropdown.Item href="/contact">
                    <MdOutlineEmail className={styles.icon_p} />
                    Contact
                  </Dropdown.Item>
                  <Dropdown.Item href="/help">
                    <MdOutlineHelpOutline className={styles.icon_p} />
                    Help
                  </Dropdown.Item>
                  <Dropdown.Item href="/health">
                    <CiServer className={styles.icon_p} />
                    Server health
                  </Dropdown.Item>
                  <Dropdown.Divider className={styles.divider_dp} />
                  <Dropdown.Item
                    onClick={() => setShowDeleteModal(true)}
                    className="delete-name"
                  >
                    {" "}
                    <MdDeleteForever className={styles.name_delete} /> Delete
                    Account
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
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
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                className={styles.mobile_menu_item}
              >
                <IoPersonCircleOutline className={styles.icon_p} /> Profile
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="/profile">
                  {" "}
                  <IoPersonCircleOutline className={styles.icon_p} />
                  See your profile {username}
                </Dropdown.Item>
                <Dropdown.Item href="#">
                  <BiPlusCircle className={styles.icon_p} /> Add another account
                </Dropdown.Item>
                <Dropdown.Item href="/c/user/communities">
                  {" "}
                  <CgCommunity className={styles.icon_p} />
                  Your communities
                </Dropdown.Item>
                <Dropdown.Divider className={styles.divider_dp} />
                <Dropdown.Item onClick={handleLogout}>
                  <CiLogout className={styles.icon_p} /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                className={styles.mobile_menu_item}
              >
                <IoSettingsOutline className={styles.icon_p} /> Settings
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="/security/2fa/enable">
                  <TbAuth2Fa className={styles.icon_p} /> Enable 2FA
                </Dropdown.Item>
                <Dropdown.Item href="/premium">
                  <TbPremiumRights className={styles.icon_p} /> Premium
                </Dropdown.Item>
                <Dropdown.Item href="/about">
                  <IoIosInformationCircleOutline className={styles.icon_p} />{" "}
                  About
                </Dropdown.Item>
                <Dropdown.Item href="/terms">
                  {" "}
                  <MdOutlinePrivacyTip className={styles.icon_p} />
                  Terms &amp; Services
                </Dropdown.Item>
                <Dropdown.Item href="/contact">
                  <MdOutlineEmail className={styles.icon_p} /> Contact
                </Dropdown.Item>
                <Dropdown.Item href="/help">
                  <MdOutlineHelpOutline className={styles.icon_p} />
                  Help
                </Dropdown.Item>
                <Dropdown.Item href="/health">
                    <CiServer className={styles.icon_p} />
                    Server health
                  </Dropdown.Item>
                <Dropdown.Divider className={styles.divider_delete} />
                <Dropdown.Item
                  onClick={() => setShowDeleteModal(true)}
                  className={styles.delete_name}
                >
                  {" "}
                  <MdDeleteForever className={styles.name_delete} /> Delete
                  Account
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
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