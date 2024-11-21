import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import { GoHome } from "react-icons/go";
import { IoPersonCircleOutline, IoSettingsOutline } from "react-icons/io5";
import { AiOutlineMessage } from "react-icons/ai";
import { CiLogout } from "react-icons/ci";
import { GiArtificialHive } from "react-icons/gi";
import { CgCommunity } from "react-icons/cg";
import { MdDeleteForever } from "react-icons/md";
import loaderImage from "../assets/ZKZg.gif";
import "../styles/navbar.css";

import { getUserIdFromToken, getUsernameFromToken } from "../auth/authUtils";
import { Modal, Button } from "react-bootstrap";

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

  const searchUsers = async (username) => {
    if (!username) {
      setResults([]);
      setShowNoResults(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/v2/search/users?username=${username}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;

      // Check if there are any results or if the deleted field is true for any user
      if (data.length === 0) {
        setShowNoResults(true);
      } else {
        // Filter out users that have deleted = true in case backend doesn't handle this correctly
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
        !searchBarRef.current.contains(event.target)
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

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setIsLoggingOut(false);
      window.location.reload();
    }, 2000);
  };

  const userId = getUserIdFromToken();
  const username = getUsernameFromToken();

  const handleUserClick = (clickedUserId) => {
    setIsMenuOpen(false);
    if (clickedUserId === userId) {
      navigate("/profile");
    } else {
      navigate(`/u/${clickedUserId}`);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/v2/users/update/delete/${userId}`,
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

  return (
    <>
      <div className="chat-history1">
        <div className="history-div-2">
          <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`bar ${isMenuOpen ? "open" : ""}`} />
            <div className={`bar ${isMenuOpen ? "open" : ""}`} />
            <div className={`bar ${isMenuOpen ? "open" : ""}`} />
          </div>
          {isMenuOpen && (
            <div className="mobile-menu">
              <div className="search-bar-container1" ref={searchBarRef}>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                  />
                </div>

                {showDropdown && (
                  <div className="drpp">
                    {showNoResults ? (
                      <p className="drpp-hld">Nothing found</p>
                    ) : results.length === 0 ? (
                      <p className="drpp-hld">Search for friends and more...</p>
                    ) : (
                      <ul className="drpp-rsl">
                        {results.map((user) => (
                          <li
                            key={user.id}
                            className="drpp-t"
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
              <a href="/home" className="mobile-menu-item">
                <GoHome className="icon-p" /> Home
              </a>
              <a href="/messages" className="mobile-menu-item">
                <AiOutlineMessage className="icon-p" /> Messages
              </a>
              <a href="/chirp" className="mobile-menu-item">
                <GiArtificialHive className="icon-p" /> ChirpAI
              </a>
              <a href="/c/communities" className="mobile-menu-item">
                <CgCommunity className="icon-p" /> Communities
              </a>
              <Dropdown>
                <Dropdown.Toggle variant="link" className="mobile-menu-item">
                  <IoPersonCircleOutline className="icon-p" /> Profile
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/profile">
                    See your profile {username}
                  </Dropdown.Item>
                  <Dropdown.Item href="#">Add another account</Dropdown.Item>
                  <Dropdown.Divider className="divider-dp" />
                  <Dropdown.Item onClick={handleLogout}>
                    <CiLogout className="icon-p" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Toggle variant="link" className="mobile-menu-item">
                  <IoSettingsOutline className="icon-p" /> Settings
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/premium">Premium</Dropdown.Item>
                  <Dropdown.Item href="/about">About</Dropdown.Item>
                  <Dropdown.Item href="/terms">
                    Terms &amp; Services
                  </Dropdown.Item>
                  <Dropdown.Item href="/contact">Contact</Dropdown.Item>
                  <Dropdown.Item href="/help">Help</Dropdown.Item>
                  <Dropdown.Divider className="divider-dp" />
                  <Dropdown.Item
                    onClick={() => setShowDeleteModal(true)}
                    className="delete-name"
                  >
                    {" "}
                    <MdDeleteForever className="name-delete" /> Delete Account
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}

          <div className="history-links">
            <a href="/home" className="menu-item">
              <GoHome className="icon-p" /> Home
            </a>
            <a href="/messages" className="menu-item">
              <AiOutlineMessage className="icon-p" /> Messages
            </a>
            <a href="/chirp" className="menu-item">
              <GiArtificialHive className="icon-p" /> ChirpAI
            </a>
            <a href="/c/communities" className="menu-item">
              <CgCommunity className="icon-p" /> Communities
            </a>
            <Dropdown>
              <Dropdown.Toggle variant="link" className="menu-item">
                <IoPersonCircleOutline className="icon-p" /> Profile
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="/profile">
                  See your profile {username}
                </Dropdown.Item>
                <Dropdown.Item href="#">Add another account</Dropdown.Item>
                <Dropdown.Divider className="divider-dp" />
                <Dropdown.Item onClick={handleLogout}>
                  <CiLogout className="icon-p" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle variant="link" className="menu-item">
                <IoSettingsOutline className="icon-p" /> Settings
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="/premium">Premium</Dropdown.Item>
                <Dropdown.Item href="/about">About</Dropdown.Item>
                <Dropdown.Item href="/terms">
                  Terms &amp; Services
                </Dropdown.Item>
                <Dropdown.Item href="/contact">Contact</Dropdown.Item>
                <Dropdown.Item href="/help">Help</Dropdown.Item>
                <Dropdown.Divider className="divider-delete" />
                <Dropdown.Item
                  onClick={() => setShowDeleteModal(true)}
                  className="delete-name"
                >
                  {" "}
                  <MdDeleteForever className="name-delete" /> Delete Account
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
        <div className="logout-loader">
          <div className="logout-box">
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
