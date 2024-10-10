import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import image from "../assets/nw3.png";
import "../styles/contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        setEmailError("Please enter a valid email address.");
      } else {
        setEmailError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post("http://localhost:5000/api/v1/contact", formData);
      console.log("Email sent successfully:", response.data);
      alert("Your message has been sent successfully!");
  
      setFormData({
        name: "",
        email: "",
        message: "",
      });
      
    } catch (error) {
      console.error("Error sending email:", error);
      alert("There was an error sending your message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="contact-container">
      <div className="header">
        <img
          src={image}
          alt="Chirp Logo"
          className="logo"
          onClick={handleLogoClick}
          style={{ cursor: "pointer" }}
        />

        <div className="bottom-links">
          <a href="/home" className="bottom-link">Home</a>
          <a href="/terms" className="bottom-link">Terms &amp; Services</a>
          <a href="/about" className="bottom-link">About</a>
          {!isAuthenticated() && (
            <a href="/login" onClick={handleLoginClick} className="bottom-link">Login</a>
          )}
        </div>
      </div>
      <div className="h1-container">
        <h1>Contact Us</h1>
      </div>
      <form onSubmit={handleSubmit} className="contact-form">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {emailError && <p className="error-message">{emailError}</p>}
        </label>
        <label>
          Message:
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Contact;
