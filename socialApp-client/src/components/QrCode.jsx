import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/qrcode.css";
import image from "../assets/nw3.png";

const QRCodePage = () => {
  const { username } = useParams();
  const [expirationTime, setExpirationTime] = useState(null);
  const [showQRCode, setShowQRCode] = useState(true);
  const navigate = useNavigate();

  const profileUrl = `http://localhost:5173/${username}`;

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        return Date.now() < expirationTime;
      } catch (error) {
        console.error("Error decoding token: ", error.message);
        return false;
      }
    }
    return false;
  };

  const handleLoginClick = (event) => {
    event.preventDefault();
    if (isAuthenticated()) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

  useEffect(() => {
    const now = new Date().getTime();
    const expireTime = now + 30 * 1000;
    setExpirationTime(expireTime);
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      if (currentTime > expireTime) {
        setShowQRCode(false);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [username]);

  const handleRegenerate = () => {
    const now = new Date().getTime();
    const expireTime = now + 30 * 1000;
    setExpirationTime(expireTime);
    setShowQRCode(true);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <div className="headerpo">
        <img
          src={image}
          alt="Chirp Logo"
          className="logo1"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        />

        <div className="bottom-lin">
          <a href="/home" className="bottom-link">
            Home
          </a>
          <a href="/about" className="bottom-link">
            About
          </a>
          <a href="/contact" className="bottom-link">
            Contact
          </a>

          {!isAuthenticated() && (
            <a href="/login" onClick={handleLoginClick} className="bottom-link">
              Login
            </a>
          )}
        </div>
      </div>
      <h1 className="header-qr">Show this QR Code to Your Friends</h1>
      {showQRCode ? (
        <>
          <QRCode
            value={profileUrl}
            style={{
              width: "300px",
              height: "300px",
              marginTop: 50,
              marginBottom: 50,
            }}
          />
          <p style={{color: "white"}}>Give this QR code to your friends to scan it and follow you.</p>
        </>
      ) : (
        <>
          <p className="generate-qr-new">
            This QR code has expired. Please generate a new one.
          </p>
          <button className="gen-new" onClick={handleRegenerate}>
            Generate New QR Code
          </button>
        </>
      )}
    </div>
  );
};

export default QRCodePage;
