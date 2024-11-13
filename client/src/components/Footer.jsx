import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer style={footerStyles}>
      <div className="footer-links">
        <Link to="/login" style={linkStyles}>
          Login
        </Link>
        <Link to="/terms" style={linkStyles}>
          Terms of Service
        </Link>
        <Link to="/about" style={linkStyles}>
          About
        </Link>
        <Link to="/contact" style={linkStyles}>
          Contact
        </Link>
      </div>
    </footer>
  );
};

const footerStyles = {
  position: "fixed",
  bottom: 0,
  width: "100%",
  backgroundColor: "#282c34",
  color: "dodgerblue",
  textAlign: "center",
  padding: "10px 0",
  zIndex: 10,
};

const linkStyles = {
  color: "dodgerblue",
  textDecoration: "none",
  margin: "0 15px",
};

export default Footer;
