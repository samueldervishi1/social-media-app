import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import termsData from "../assets/terms.json";
import image from "../assets/nw3.png";
import "../styles/terms.css";

const TermsAndServices = () => {
  const [terms, setTerms] = useState([]);
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
    setTerms(termsData.termsAndServices);
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
    <div className="terms-container">
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
      <div className="h1-container">
        <h1>
          Terms of <br /> <span className="service"> Service</span>
        </h1>
      </div>
      {terms.map((term) => (
        <div key={term.id} className="term-section">
          <h2 className="term-title">{term.title}</h2>
          <div className="term-content">{formatContent(term.content)}</div>
        </div>
      ))}
    </div>
  );
};

export default TermsAndServices;
