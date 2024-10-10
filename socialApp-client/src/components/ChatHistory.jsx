import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoHome } from "react-icons/go";
import {
  IoPersonCircleOutline,
  IoBookmarkOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { AiOutlineMessage, AiOutlineHistory } from "react-icons/ai";
import { TbPremiumRights } from "react-icons/tb";
import { CiLogout } from "react-icons/ci";
import {
  IoIosHelpCircleOutline,
  IoIosInformationCircleOutline,
} from "react-icons/io";
import { GiArtificialHive } from "react-icons/gi";
import { FaRegFileAlt } from "react-icons/fa";
import { IoQrCodeOutline } from "react-icons/io5";
import { MdContacts, MdOutlinePassword } from "react-icons/md";
import Modal from "react-bootstrap/Modal";
import loaderImage from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import "../styles/history.css";

const ChatHistory = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false);
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
            <a href="/bookmarks" className="history-link">
              <IoBookmarkOutline className="icon" />
              <span>Bookmarks</span>
            </a>
            <a href="/messages" className="history-link">
              <AiOutlineMessage className="icon" />
              <span>Messages</span>
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
              <a href="/premium" className="history-link">
                <TbPremiumRights className="icon" />
                <span>Premium</span>
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
