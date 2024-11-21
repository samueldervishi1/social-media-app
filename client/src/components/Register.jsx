import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "../styles/register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
  });

  const [errorMessages, setErrorMessages] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrorMessages((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v2/users/auth/register",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200) {
        alert("User registered successfully!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error registering user:", error);
  
      if (error.response && error.response.data) {
        console.log("Backend Error Response:", error.response.data); // Log the error response
  
        const { message } = error.response.data;
  
        if (message === "Email already exists") {
          setErrorMessages((prev) => ({
            ...prev,
            email: "This email is already registered.",
          }));
        } else if (message === "Username already exists") {
          setErrorMessages((prev) => ({
            ...prev,
            username: "This username is already taken.",
          }));
        } else if (message === "Invalid password format") {
          setErrorMessages((prev) => ({
            ...prev,
            password:
              "Password must be at least 8 characters long, including one letter, one symbol, and one number.",
          }));
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
      }
    }
  };

  useEffect(() => {
    document.body.classList.add("register-page");
    return () => {
      document.body.classList.remove("register-page");
    };
  }, []);

  return (
    <div id="main">
      <div className="screen">
        <form id="registrationForm" onSubmit={handleSubmit}>
          <div className="container-sign">
            <p className="fill">Enter details below to create an account.</p>
            <hr />

            {error && <p className="error-message-register">{error}</p>}

            <label htmlFor="fullName">
              <b className="name-register">Full Name</b>
            </label>
            <input
              type="text"
              placeholder="Enter Full Name"
              name="fullName"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">
              <b className="name-register">Email</b>
            </label>
            <input
              type="text"
              placeholder="Enter Email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errorMessages.email && (
              <p className="error-message">{errorMessages.email}</p>
            )}

            <label htmlFor="username">
              <b className="name-register">Username</b>
            </label>
            <input
              type="text"
              placeholder="Enter Username"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errorMessages.username && (
              <p className="error-message">{errorMessages.username}</p>
            )}

            <label htmlFor="password">
              <b className="name-register">Password</b>
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
            </div>
            {errorMessages.password && (
              <p className="error-message">{errorMessages.password}</p>
            )}

            <button
              style={{
                background: "linear-gradient(to right, #0072ff, #00c6ff)",
                color: "white",
                padding: "16px 20px",
                margin: "8px 0",
                border: "none",
                cursor: "pointer",
                width: "100%",
                opacity: "0.9",
                borderRadius: "20px",
              }}
              type="submit"
            >
              Register
            </button>
            <p className="signin">
              Already have an account? <Link to="/login">Sign in</Link>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;