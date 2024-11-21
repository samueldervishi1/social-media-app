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
  color: "dodgerblue",
  textAlign: "center",
  padding: "10px 0",
  zIndex: 10,
  boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.2)",
  background: "rgba(255, 255, 255, 0.02)",
  borderRadius: "16px",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(8.6px)",
  WebkitBackdropFilter: "blur(8.6px)",
  border: "1px solid rgba(255, 255, 255, 0.45)",
};

const linkStyles = {
  color: "dodgerblue",
  textDecoration: "none",
  margin: "0 15px",
};

export default Footer;
