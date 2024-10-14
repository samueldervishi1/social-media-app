import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import aboutData from "../assets/about.json";
import image from "../assets/nw3.png";
import "../styles/about.css";

const About = () => {
  const [about, setAbout] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    setAbout(aboutData.aboutApp);
  }, []);

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

  const formatContent = (content) => {
    const parts = content.split("*").map((part, index) =>
      index % 2 === 1 ? (
        <span className="bold-text" key={index}>
          {part}
        </span>
      ) : (
        part
      )
    );
    return <p>{parts}</p>;
  };

  return (
    <div className="about-container">
      <div className="header">
        <img
          src={image}
          alt="Chirp Logo"
          className="logo"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        />

        <div className="bottom-links">
          <a href="/home" className="bottom-link">
            Home
          </a>
          <a href="/terms" className="bottom-link">
            Terms &amp; Services
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
      <div className="h1-container">
        <h1>About Us</h1>
      </div>
      {about.map((section) => (
        <div key={section.id} className="about-section">
          <h2 className="about-title">{section.title}</h2>
          <div className="about-content">{formatContent(section.content)}</div>
        </div>
      ))}
    </div>
  );
};

export default About;
