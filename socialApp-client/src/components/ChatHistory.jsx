import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoHome } from "react-icons/go";
import {
  IoPersonCircleOutline,
  IoBookmarkOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { AiOutlineMessage, AiOutlineHistory } from "react-icons/ai";
import { TbPremiumRights } from "react-icons/tb";
import { CiLogout, CiSearch } from "react-icons/ci";
import {
  IoIosHelpCircleOutline,
  IoIosInformationCircleOutline,
} from "react-icons/io";
import { GiArtificialHive } from "react-icons/gi";
import { FaRegFileAlt } from "react-icons/fa";
import { IoQrCodeOutline } from "react-icons/io5";
import {
  MdContacts,
  MdOutlineManageHistory,
  MdOutlineVideoLibrary,
  MdOutlinePassword
} from "react-icons/md";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import loaderImage from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import image from "../assets/nw3.png";
import "../styles/history.css";

const ChatHistory = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState("");
  const [logoutMessage, setLogoutMessage] = useState("");

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return decodedToken.userId;
      } catch (error) {
        console.error("Error decoding token:", error.message);
        return null;
      }
    }
    return null;
  };

  const handleLogout = () => {
    setShowSettingsModal(false);

    setLogoutMessage("You are now logged out. Redirecting to login...");
    setShowLogoutModal(true);

    setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/login");
    }, 2000);
  };

  const handleShowSearchModal = () => {
    setShowSearchModal(true);
  };

  const handleCloseSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);
    setMessage("");
  };

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (searchQuery) {
        let response;
        if (searchQuery.includes(" ")) {
          const [name, surname] = searchQuery.split(" ");
          response = await axios.get(
            `http://localhost:5000/api/v1/search/users?name=${name}&surname=${surname}`
          );
        } else {
          response = await axios.get(
            `http://localhost:5000/api/v1/search/users?username=${searchQuery}`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (response.data.length === 0) {
          setMessage(`No user found`);
        } else {
          setSearchResults(response.data);
          setMessage("");
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage("No user found");
      } else {
        setMessage("No user found");
      }
      console.error(
        "Error searching users",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSearchResults([]);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleProfileRedirect = (userId) => {
    if (userId === getUserIdFromToken()) {
      navigate("/profile");
    } else {
      navigate(`/users/${userId}`);
    }
  };

  const getUsernameFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return decodedToken.sub;
      } catch (error) {
        console.error("Error decoding token:", error.message);
        return null;
      }
    }
    return null;
  };

  const username = getUsernameFromToken();

  return (
    <>
      <div className={`chat-history1 ${isOpen ? "open" : ""}`}>
        <div className="history-div-2">
          <div className="history-links">
            <a href="/home" className="history-link">
              <GoHome className="icon" />
              <span>Home</span>
            </a>
            <a href="/profile" className="history-link">
              <IoPersonCircleOutline className="icon" />
              <span>Profile</span>
            </a>
            <a className="history-link" onClick={handleShowSearchModal}>
              <CiSearch className="icon" />
              <span style={{ cursor: "pointer" }}>Search</span>
            </a>
            <a href="/bookmarks" className="history-link">
              <IoBookmarkOutline className="icon" />
              <span>Bookmarks</span>
            </a>
            <a href="/messages" className="history-link">
              <AiOutlineMessage className="icon" />
              <span>Messages</span>
            </a>
            <a href="/premium" className="history-link">
              <TbPremiumRights className="icon" />
              <span>Premium</span>
            </a>
            <a href="/ai" className="history-link">
              <GiArtificialHive className="icon" />
              <span>ChirpAI</span>
            </a>
            <a
              className="history-link"
              onClick={() => setShowSettingsModal(true)}
            >
              <IoSettingsOutline className="icon" />
              <span style={{ cursor: "pointer" }}>Settings</span>
            </a>
          </div>
        </div>
        {/* Search Modal */}
        <Modal
          show={showSearchModal}
          onHide={handleCloseSearchModal}
          backdrop="true"
        >
          <Modal.Body>
            <div className="form-container">
              <Form.Group controlId="searchForm" className="flex-container">
                <Form.Control
                  type="text"
                  placeholder="Enter username or name and surname"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  className="btn-search"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <img
                        src={loaderImage}
                        style={{ width: 20, marginRight: 10 }}
                        alt="Loading..."
                      />{" "}
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </Form.Group>
              {searchResults.length > 0 && (
                <ul className="user-lists">
                  {searchResults.map((user) => (
                    <li key={user.id}>
                      <a
                        href="#"
                        onClick={() => handleProfileRedirect(user.id)}
                      >
                        — {user.username}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {searchResults.length === 0 && !loading && <p>{message}</p>}
            </div>
          </Modal.Body>
        </Modal>

        {/* Settings Modal */}
        <Modal
          show={showSettingsModal}
          onHide={handleCloseSettingsModal}
          backdrop="true"
        >
          <Modal.Body>
            <div className="settings-links">
              <a href="/history">
                <AiOutlineHistory className="icon" />
                <span>ChirpAI History</span>
              </a>
              <a href={`/qrcode/${username}`} style={{ textAlign: "center" }}>
                <IoQrCodeOutline className="icon" />
                <span>View QR Code</span>
              </a>
              <a href="/update-password" style={{ textAlign: "center" }}>
                <MdOutlinePassword className="icon" />
                <span>Update Password</span>
              </a>

              <a href="/about">
                <IoIosInformationCircleOutline className="icon" />
                <span>About</span>
              </a>
              <a href="/contact">
                <MdContacts className="icon" />
                <span>Contact</span>
              </a>
              <a href="/terms">
                <FaRegFileAlt className="icon" />
                <span>Terms &amp; Services</span>
              </a>
              <a href="/help">
                <IoIosHelpCircleOutline className="icon" />
                <span>Help</span>
              </a>
              <a onClick={handleLogout} style={{ textAlign: "center" }}>
                <CiLogout className="icon" />
                <span>Logout</span>
              </a>
            </div>
          </Modal.Body>
        </Modal>
        {/* Logout Modal */}
        <Modal
          show={showLogoutModal}
          onHide={handleCloseLogoutModal}
          backdrop="true"
        >
          <Modal.Body>
            <p style={{ textAlign: "center" }}>{logoutMessage}</p>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default ChatHistory;
