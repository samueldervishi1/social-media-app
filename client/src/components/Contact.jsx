import React from "react";
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import "../styles/contact.css";

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="h1-container">
        <h1>Contact Us</h1>
      </div>

      <div className="contact-info">
        <p style={{ color: "black" }}>
          You can contact us via the following platforms:
        </p>

        <div className="social-icons">
          <a
            href="https://www.instagram.com/samueldervishi_"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="social-icon" />
          </a>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook className="social-icon" />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter className="social-icon" />
          </a>
          <a
            href="https://www.linkedin.com/samueldervishi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin className="social-icon" />
          </a>
        </div>

        <div className="email">
          <p style={{ color: "black" }}>
            Email us at: <a href="mailto:shefi1@proton.me">shefi1@proton.me</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
