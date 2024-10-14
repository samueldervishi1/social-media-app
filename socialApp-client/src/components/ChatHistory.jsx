import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import { GoHome } from "react-icons/go";
import {
  IoPersonCircleOutline,
  IoSettingsOutline,
  IoPersonAddOutline,
} from "react-icons/io5";
import { AiOutlineMessage } from "react-icons/ai";
import { TbPremiumRights } from "react-icons/tb";
import { CiLogout } from "react-icons/ci";
import {
  IoIosHelpCircleOutline,
  IoIosInformationCircleOutline,
} from "react-icons/io";
import { GiArtificialHive } from "react-icons/gi";
import { FaRegFileAlt, FaRegUserCircle } from "react-icons/fa";
import { MdContacts } from "react-icons/md";
import loaderImage from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import logo from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/nw3.png";
import "../styles/history.css";

const ChatHistory = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      setIsLoggingOut(false);
      navigate("/login");
    }, 2000);
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
      <div className="chat-history1">
        <div className="history-div-2">
          <div className="history-links">
            {/* Right Section */}
            <div className="right-section">
              <a
                href="/home"
                className={`logo-link ${
                  location.pathname === "/home" ? "active" : ""
                }`}
                aria-label="Home"
              >
                <img className="logo-icon" src={logo} alt="Logo" />
              </a>
              <a
                href="/home"
                className={`history-link ${
                  location.pathname === "/home" ? "active" : ""
                }`}
              >
                <GoHome className="icon-p" />
                <span>Home</span>
              </a>
              <a
                href="/messages"
                className={`history-link ${
                  location.pathname === "/messages" ? "active" : ""
                }`}
              >
                <AiOutlineMessage className="icon-p" />
                <span>Messages</span>
              </a>
              <a
                href="/ai"
                className={`history-link ${
                  location.pathname === "/ai" ? "active" : ""
                }`}
              >
                <GiArtificialHive className="icon-p" />
                <span>ChirpAI</span>
              </a>
            </div>
          </div>

          {/* Left Section */}
          <div className="history-links">
            <div className="left-section">
              {/* Profile Dropdown */}
              <Dropdown>
                <Dropdown.Toggle
                  variant="link"
                  className={`history-link ${
                    location.pathname.includes("/profile") ? "active" : ""
                  }`}
                >
                  <IoPersonCircleOutline className="icon-p" />
                  <span>Profile</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/profile">
                    <FaRegUserCircle className="icon-p" /> See your profile{" "}
                    {username}
                  </Dropdown.Item>
                  <Dropdown.Item href="#">
                    <IoPersonAddOutline className="icon-p" /> Add another
                    account
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <CiLogout className="icon-p" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              {/* Settings Dropdown */}
              <Dropdown>
                <Dropdown.Toggle
                  variant="link"
                  className={`history-link ${
                    location.pathname.includes("/settings") ? "active" : ""
                  }`}
                >
                  <IoSettingsOutline className="icon-p" />
                  <span>Settings</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/premium">
                    <TbPremiumRights className="icon-p" /> Premium
                  </Dropdown.Item>
                  <Dropdown.Item href="/about">
                    <IoIosInformationCircleOutline className="icon-p" /> About
                  </Dropdown.Item>
                  <Dropdown.Item href="/contact">
                    <MdContacts className="icon-p" /> Contact
                  </Dropdown.Item>
                  <Dropdown.Item href="/terms">
                    <FaRegFileAlt className="icon-p" /> Terms &amp; Services
                  </Dropdown.Item>
                  <Dropdown.Item href="/help">
                    <IoIosHelpCircleOutline className="icon-p" /> Help
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
      {isLoggingOut && (
        <div className="logout-loader">
          <div className="logout-box">
            <img src={loaderImage} alt="Logging out..." />
            <p>Logging out...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHistory;
